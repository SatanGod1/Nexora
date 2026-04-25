// src/routes/auth.routes.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { User } from "../models/User";
import {
  hashPassword, generateOtp, hashOtp, verifyOtp,
  signAccessToken, signRefreshToken, hashRefreshToken, refreshExpiryDate,
  verifyRefreshToken,
} from "../utils/crypto";
import { sendOtpEmail, sendNewDeviceAlert, sendAccountLockedEmail } from "../services/email.service";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(res: Response, data: object, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data });
}
function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message });
}

/** Parse user-agent into a short device string */
function getDevice(req: Request): string {
  const ua = req.headers["user-agent"] ?? "Unknown";
  if (ua.includes("Mobile"))  return "Mobile Browser";
  if (ua.includes("Chrome"))  return "Chrome Desktop";
  if (ua.includes("Firefox")) return "Firefox Desktop";
  if (ua.includes("Safari"))  return "Safari Desktop";
  return "Unknown Device";
}

function getIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "0.0.0.0";
}

// Issue both tokens and push a new session record
async function issueTokens(user: InstanceType<typeof User>, req: Request) {
  const sessionId = new mongoose.Types.ObjectId().toString();
  const { token: refreshToken } = signRefreshToken(user.id, sessionId);
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshHash = hashRefreshToken(refreshToken);

  // Keep only last 5 sessions (device management)
  if (user.sessions.length >= 5) user.sessions.shift();

  user.sessions.push({
    _id: new mongoose.Types.ObjectId(sessionId),
    refreshTokenHash: refreshHash,
    deviceName: getDevice(req),
    browser: req.headers["user-agent"]?.slice(0, 120) ?? "Unknown",
    ip: getIP(req),
    createdAt: new Date(),
    expiresAt: refreshExpiryDate(),
    isActive: true,
  });

  await user.save();
  return { accessToken, refreshToken, expiresIn: 15 * 60 };
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

const RegisterSchema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  password: z.string().min(8).max(128),
});

router.post("/register", async (req: Request, res: Response) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0].message);

  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) return fail(res, "An account with this email already exists.", 409);

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    emailOtp: hashOtp(otp),
    emailOtpExpires: otpExpires,
  });

  await sendOtpEmail(email, name, otp, "verify");

  return ok(res, { userId: user.id }, "Registration successful. Check your email for a verification code.", 201);
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────

const VerifyOtpSchema = z.object({
  userId:  z.string(),
  otp:     z.string().length(6),
  purpose: z.enum(["email_verification", "login_otp"]),
});

router.post("/verify-otp", async (req: Request, res: Response) => {
  const parsed = VerifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0].message);

  const { userId, otp, purpose } = parsed.data;

  const user = await User.findById(userId);
  if (!user) return fail(res, "User not found.", 404);

  if (purpose === "email_verification") {
    if (!user.emailOtp || !user.emailOtpExpires)
      return fail(res, "No pending verification. Please register again.");
    if (new Date() > user.emailOtpExpires)
      return fail(res, "Code has expired. Please request a new one.");
    user.emailOtpAttempts += 1;
    if (user.emailOtpAttempts > 5)
      return fail(res, "Too many attempts. Please register again.");
    if (!verifyOtp(otp, user.emailOtp))
      return fail(res, "Invalid code. Please try again.");

    user.isEmailVerified  = true;
    user.emailOtp         = null;
    user.emailOtpExpires  = null;
    user.emailOtpAttempts = 0;
    await user.save();

    const tokens = await issueTokens(user, req);
    return ok(res, {
      tokens,
      user: safeUser(user),
      onboardingComplete: user.onboardingComplete,
    }, "Email verified successfully.");
  }

  // login_otp
  if (!user.loginOtp || !user.loginOtpExpires)
    return fail(res, "No pending OTP. Please log in again.");
  if (new Date() > user.loginOtpExpires)
    return fail(res, "Code has expired. Please log in again.");
  if (!verifyOtp(otp, user.loginOtp))
    return fail(res, "Invalid code.");

  user.loginOtp        = null;
  user.loginOtpExpires = null;
  await user.save();

  const tokens = await issueTokens(user, req);
  return ok(res, {
    tokens,
    user: safeUser(user),
    onboardingComplete: user.onboardingComplete,
  }, "Login successful.");
});

// ─── POST /api/auth/resend-otp ────────────────────────────────────────────────

router.post("/resend-otp", async (req: Request, res: Response) => {
  const { userId, purpose } = req.body;
  if (!userId || !purpose) return fail(res, "userId and purpose are required.");

  const user = await User.findById(userId);
  if (!user) return fail(res, "User not found.", 404);

  const otp = generateOtp();
  const exp = new Date(Date.now() + 10 * 60 * 1000);

  if (purpose === "email_verification") {
    user.emailOtp        = hashOtp(otp);
    user.emailOtpExpires = exp;
    user.emailOtpAttempts = 0;
    await user.save();
    await sendOtpEmail(user.email, user.name, otp, "verify");
  } else {
    user.loginOtp        = hashOtp(otp);
    user.loginOtpExpires = exp;
    await user.save();
    await sendOtpEmail(user.email, user.name, otp, "login");
  }

  return ok(res, {}, "A new code has been sent to your email.");
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0].message);

  const { email, password } = parsed.data;
  const ip     = getIP(req);
  const device = getDevice(req);

  const user = await User.findOne({ email });

  // ── Rate-limit / lock check ────────────────────────────────────────────────
  if (!user) {
    // Don't reveal whether email exists
    return fail(res, "Invalid email or password.", 401);
  }

  // Auto-unlock if lock window passed
  if (user.isLocked && user.lockedUntil && new Date() > user.lockedUntil) {
    await user.resetFailedLogin();
  }

  if (user.isAccountLocked()) {
    return fail(res, `Account locked until ${user.lockedUntil?.toUTCString()}. Check your email.`, 423);
  }

  // ── Password check ────────────────────────────────────────────────────────
  const passwordOk = await user.verifyPassword(password);

  // Log attempt
  user.loginHistory.push({ success: passwordOk, ip, device, failReason: passwordOk ? "" : "bad_password", at: new Date() });
  if (user.loginHistory.length > 50) user.loginHistory.shift(); // keep last 50

  if (!passwordOk) {
    await user.incrementFailedLogin();

    // Send lock email if just got locked
    if (user.isLocked && user.lockedUntil) {
      await sendAccountLockedEmail(user.email, user.name, user.lockedUntil);
    }
    return fail(res, "Invalid email or password.", 401);
  }

  // ── Email not verified ────────────────────────────────────────────────────
  if (!user.isEmailVerified) {
    return ok(res, { requiresOTP: true, userId: user.id, purpose: "email_verification" },
      "Please verify your email first.");
  }

  // ── Reset failure counter ─────────────────────────────────────────────────
  await user.resetFailedLogin();

  // ── New device detection → send login OTP ────────────────────────────────
  const knownIPs = user.sessions.map(s => s.ip);
  const isNewDevice = !knownIPs.includes(ip);

  if (isNewDevice && user.sessions.length > 0) {
    const otp = generateOtp();
    user.loginOtp        = hashOtp(otp);
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpEmail(user.email, user.name, otp, "login");
    await sendNewDeviceAlert(user.email, user.name, {
      device, ip, time: new Date().toUTCString(),
    });
    return ok(res, { requiresOTP: true, userId: user.id, purpose: "login_otp" },
      "New device detected. A verification code was sent to your email.");
  }

  // ── Direct login ──────────────────────────────────────────────────────────
  await user.save();
  const tokens = await issueTokens(user, req);
  return ok(res, {
    tokens,
    user: safeUser(user),
    onboardingComplete: user.onboardingComplete,
  }, "Login successful.");
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return fail(res, "Refresh token required.", 400);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return fail(res, "Invalid or expired refresh token.", 401);
  }

  const user = await User.findById(payload.sub);
  if (!user) return fail(res, "User not found.", 404);

  const tokenHash = hashRefreshToken(refreshToken);
  const session   = user.sessions.find(s => s.refreshTokenHash === tokenHash && s.isActive);
  if (!session)   return fail(res, "Session not found or already revoked.", 401);
  if (new Date() > session.expiresAt) return fail(res, "Session expired. Please log in again.", 401);

  // ── Rotation: revoke old, issue new ──────────────────────────────────────
  session.isActive = false;

  const { token: newRefresh } = signRefreshToken(user.id, session._id.toString());
  const newAccess = signAccessToken({ sub: user.id, email: user.email });
  const newHash   = hashRefreshToken(newRefresh);

  user.sessions.push({
    _id: new mongoose.Types.ObjectId(),
    refreshTokenHash: newHash,
    deviceName: session.deviceName,
    browser: session.browser,
    ip: session.ip,
    createdAt: new Date(),
    expiresAt: refreshExpiryDate(),
    isActive: true,
  });

  await user.save();
  return ok(res, { accessToken: newAccess, refreshToken: newRefresh, expiresIn: 15 * 60 });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

router.post("/logout", requireAuth, async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const user = await User.findById(req.userId);
    if (user) {
      const hash = hashRefreshToken(refreshToken);
      const s = user.sessions.find(x => x.refreshTokenHash === hash);
      if (s) { s.isActive = false; await user.save(); }
    }
  }
  return ok(res, {}, "Logged out successfully.");
});

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return fail(res, "Email is required.");

  const user = await User.findOne({ email });
  // Always respond the same to prevent email enumeration
  if (user) {
    const otp = generateOtp();
    user.loginOtp        = hashOtp(otp);
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpEmail(user.email, user.name, otp, "reset");
  }
  return ok(res, {}, "If that email exists, a reset code has been sent.");
});

// ─── POST /api/onboarding/save ────────────────────────────────────────────────
// Called after all 4 onboarding steps are complete

const StudentSchema = z.object({
  college:       z.string().min(2),
  degree:        z.string().min(1),
  course:        z.string().min(1),
  passoutYear:   z.string().min(4),
  opportunities: z.array(z.string()),
  companies:     z.array(z.string()),
});

const ProfessionalSchema = z.object({
  jobTitle:    z.string().min(2),
  experience:  z.string().min(1),
  industry:    z.string().min(1),
  jobTypes:    z.array(z.string()),
  companies:   z.array(z.string()),
});

const OnboardingSchema = z.discriminatedUnion("profileType", [
  z.object({ profileType: z.literal("student"),      profile: StudentSchema }),
  z.object({ profileType: z.literal("professional"), profile: ProfessionalSchema }),
]);

router.post("/onboarding/save", requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = OnboardingSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error.errors[0].message);

  const user = await User.findById(req.userId);
  if (!user) return fail(res, "User not found.", 404);

  user.profileType = parsed.data.profileType;
  user.onboardingComplete = true;

  if (parsed.data.profileType === "student") {
    user.studentProfile = parsed.data.profile as any;
  } else {
    user.professionalProfile = parsed.data.profile as any;
  }

  await user.save();
  return ok(res, { user: safeUser(user) }, "Profile saved successfully.");
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) return fail(res, "User not found.", 404);
  return ok(res, {
    user: safeUser(user),
    onboardingComplete: user.onboardingComplete,
    profile: user.profileType === "student"
      ? user.studentProfile
      : user.professionalProfile,
  });
});

// ─── GET /api/auth/login-history ──────────────────────────────────────────────

router.get("/login-history", requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select("loginHistory");
  if (!user) return fail(res, "Not found.", 404);
  return ok(res, { history: [...user.loginHistory].reverse().slice(0, 20) });
});

// ─── Utility: strip sensitive fields ─────────────────────────────────────────

function safeUser(user: InstanceType<typeof User>) {
  return {
    id:               user.id,
    name:             user.name,
    email:            user.email,
    isEmailVerified:  user.isEmailVerified,
    onboardingComplete: user.onboardingComplete,
    profileType:      user.profileType,
    createdAt:        user.createdAt,
  };
}

export default router;

import { v4 as uuidv4 } from "uuid";
import {
  User,
  Session,
  LoginEvent,
  PublicUser,
  AuthTokens,
  ParsedDevice,
  OTPPurpose,
} from "../types";
import {
  usersTable,
  emailIndex,
  sessionsTable,
  loginEventsTable,
} from "../utils/store";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../utils/password";
import { generateOTP, verifyOTP } from "../utils/otp";
import {
  issueTokenPair,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
} from "../utils/tokens";
import { generateTwoFactorSetup, verifyTOTP } from "./twoFactor";
import { analyseSuspicion } from "./suspicion";
import {
  sendVerificationOTP,
  sendLoginOTP,
  sendNewDeviceAlert,
  sendAccountLockedAlert,
  sendSuspiciousLoginAlert,
} from "./email";
import { config } from "../config";
import { buildDeviceFingerprint } from "../utils/device";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isVerified: user.isVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
  };
}

function recordLoginEvent(
  userId: string,
  email: string,
  device: ParsedDevice,
  success: boolean,
  failureReason?: string,
  isSuspicious = false
): void {
  const event: LoginEvent = {
    id: uuidv4(),
    userId,
    email,
    ip: device.ip,
    location: device.location,
    deviceName: device.deviceName,
    browser: device.browser,
    os: device.os,
    success,
    failureReason,
    isSuspicious,
    timestamp: new Date(),
  };
  const existing = loginEventsTable.get(userId) ?? [];
  // Keep last 100 events per user
  loginEventsTable.set(userId, [event, ...existing].slice(0, 100));
}

function isAccountLocked(user: User): boolean {
  if (!user.lockedUntil) return false;
  return new Date() < user.lockedUntil;
}

// ─── Registration ─────────────────────────────────────────────────────────────

export interface RegisterResult {
  userId: string;
  message: string;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  // Check duplicate
  if (emailIndex.has(email)) {
    throw Object.assign(new Error("An account with this email already exists"), {
      statusCode: 409,
    });
  }

  // Validate password strength
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    throw Object.assign(
      new Error(`Weak password: ${strength.errors.join("; ")}`),
      { statusCode: 400 }
    );
  }

  const userId = uuidv4();
  const passwordHash = await hashPassword(password);

  const user: User = {
    id: userId,
    email,
    name,
    passwordHash,
    isVerified: false,
    twoFactorEnabled: false,
    failedLoginAttempts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  usersTable.set(userId, user);
  emailIndex.set(email, userId);

  // Send verification OTP
  const otp = generateOTP(userId, "email_verification");
  await sendVerificationOTP(email, name, otp);

  return {
    userId,
    message: "Account created. Please check your email to verify your account.",
  };
}

// ─── Email Verification ───────────────────────────────────────────────────────

export async function verifyEmail(
  userId: string,
  otp: string
): Promise<void> {
  const user = usersTable.get(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const result = verifyOTP(userId, "email_verification", otp);
  if (!result.valid) {
    throw Object.assign(new Error(result.reason ?? "Invalid OTP"), { statusCode: 400 });
  }

  usersTable.set(userId, {
    ...user,
    isVerified: true,
    updatedAt: new Date(),
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export type LoginOutcome =
  | { type: "requires_otp"; userId: string }
  | { type: "requires_2fa"; userId: string }
  | { type: "success"; tokens: AuthTokens; user: PublicUser; sessionId: string };

export async function loginUser(
  email: string,
  password: string,
  device: ParsedDevice
): Promise<LoginOutcome> {
  const userId = emailIndex.get(email);
  if (!userId) {
    // Run dummy bcrypt to prevent timing attacks
    await hashPassword("dummy-timing-prevention");
    throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
  }

  const user = usersTable.get(userId)!;

  // Check account lock
  if (isAccountLocked(user)) {
    recordLoginEvent(userId, email, device, false, "Account locked");
    throw Object.assign(
      new Error(
        `Account is locked until ${user.lockedUntil!.toUTCString()}. Check your email for details.`
      ),
      { statusCode: 423 }
    );
  }

  // Verify password
  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= config.account.maxFailedAttempts;
    const lockedUntil = shouldLock
      ? new Date(Date.now() + config.account.lockDurationMinutes * 60 * 1000)
      : undefined;

    usersTable.set(userId, {
      ...user,
      failedLoginAttempts: attempts,
      lockedUntil,
      updatedAt: new Date(),
    });

    recordLoginEvent(userId, email, device, false, "Wrong password");

    if (shouldLock) {
      await sendAccountLockedAlert(
        email,
        user.name,
        lockedUntil!,
        device.location ?? device.ip
      );
      throw Object.assign(
        new Error(
          `Too many failed attempts. Account locked for ${config.account.lockDurationMinutes} minutes.`
        ),
        { statusCode: 423 }
      );
    }

    const remaining = config.account.maxFailedAttempts - attempts;
    throw Object.assign(
      new Error(
        `Invalid email or password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
      ),
      { statusCode: 401 }
    );
  }

  // Reset failed attempts on success
  usersTable.set(userId, {
    ...user,
    failedLoginAttempts: 0,
    lockedUntil: undefined,
    updatedAt: new Date(),
  });

  // Check email verified
  if (!user.isVerified) {
    throw Object.assign(
      new Error("Please verify your email before signing in."),
      { statusCode: 403 }
    );
  }

  // ── Suspicious activity check ─────────────────────────────────────────────
  const existingSessions = [...sessionsTable.values()].filter(
    (s) => s.userId === userId && s.isActive
  );
  const loginHistory = loginEventsTable.get(userId) ?? [];

  const suspicion = analyseSuspicion(device, existingSessions, loginHistory);

  if (suspicion.isSuspicious) {
    recordLoginEvent(userId, email, device, true, undefined, true);
    await sendSuspiciousLoginAlert(
      email,
      user.name,
      suspicion.reasons.join("; "),
      device.deviceName,
      device.location ?? device.ip
    );
  }

  // ── 2FA check ─────────────────────────────────────────────────────────────
  if (user.twoFactorEnabled) {
    // Cache a pending-2FA marker so the verify endpoint knows auth passed
    const { cache } = await import("../utils/store");
    cache.set(`pending_2fa:${userId}`, "1", 5 * 60);
    return { type: "requires_2fa", userId };
  }

  // ── Email OTP (step-up verification for new devices) ──────────────────────
  const isNewDevice = !existingSessions.some(
    (s) => buildDeviceFingerprint({ os: s.os, browser: s.browser, deviceType: s.deviceType, ip: s.ip, deviceId: s.deviceId, deviceName: s.deviceName })
      === buildDeviceFingerprint(device)
  );

  if (isNewDevice && existingSessions.length > 0) {
    // Require OTP for unrecognised devices
    const otp = generateOTP(userId, "login_otp");
    await sendLoginOTP(
      email,
      user.name,
      otp,
      device.deviceName,
      device.location ?? device.ip
    );
    return { type: "requires_otp", userId };
  }

  // ── Issue session + tokens ─────────────────────────────────────────────────
  const sessionId = uuidv4();
  const tokens = issueTokenPair(userId, sessionId, email, device.deviceId);

  const session: Session = {
    id: sessionId,
    userId,
    refreshToken: tokens.refreshToken,
    deviceId: device.deviceId,
    deviceName: device.deviceName,
    deviceType: device.deviceType,
    browser: device.browser,
    os: device.os,
    ip: device.ip,
    location: device.location,
    isActive: true,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + config.jwt.refreshExpiresInSeconds * 1000),
  };
  sessionsTable.set(sessionId, session);

  // Alert for truly new device
  if (isNewDevice && config.alerts.onNewDevice) {
    await sendNewDeviceAlert(
      email,
      user.name,
      device.deviceName,
      device.location ?? device.ip,
      new Date().toUTCString()
    );
  }

  recordLoginEvent(userId, email, device, true);

  return {
    type: "success",
    tokens,
    user: toPublicUser(usersTable.get(userId)!),
    sessionId,
  };
}

// ─── OTP Verification (login step-up) ────────────────────────────────────────

export async function verifyLoginOTP(
  userId: string,
  otp: string,
  device: ParsedDevice
): Promise<{ tokens: AuthTokens; user: PublicUser }> {
  const user = usersTable.get(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const result = verifyOTP(userId, "login_otp", otp);
  if (!result.valid) {
    throw Object.assign(new Error(result.reason ?? "Invalid OTP"), { statusCode: 400 });
  }

  const sessionId = uuidv4();
  const tokens = issueTokenPair(userId, sessionId, user.email, device.deviceId);

  const session: Session = {
    id: sessionId,
    userId,
    refreshToken: tokens.refreshToken,
    deviceId: device.deviceId,
    deviceName: device.deviceName,
    deviceType: device.deviceType,
    browser: device.browser,
    os: device.os,
    ip: device.ip,
    location: device.location,
    isActive: true,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + config.jwt.refreshExpiresInSeconds * 1000),
  };
  sessionsTable.set(sessionId, session);

  recordLoginEvent(userId, user.email, device, true);
  return { tokens, user: toPublicUser(user) };
}

// ─── 2FA Verification ─────────────────────────────────────────────────────────

export async function verify2FALogin(
  userId: string,
  token: string,
  device: ParsedDevice
): Promise<{ tokens: AuthTokens; user: PublicUser }> {
  const user = usersTable.get(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  if (!user.twoFactorSecret) {
    throw Object.assign(new Error("2FA not configured"), { statusCode: 400 });
  }

  const { cache } = await import("../utils/store");
  const pending = cache.get(`pending_2fa:${userId}`);
  if (!pending) {
    throw Object.assign(new Error("2FA session expired. Please log in again."), {
      statusCode: 401,
    });
  }

  const valid = verifyTOTP(user.twoFactorSecret, token);
  if (!valid) {
    throw Object.assign(new Error("Invalid 2FA token. Please try again."), { statusCode: 401 });
  }

  cache.del(`pending_2fa:${userId}`);

  const sessionId = uuidv4();
  const tokens = issueTokenPair(userId, sessionId, user.email, device.deviceId);

  const session: Session = {
    id: sessionId,
    userId,
    refreshToken: tokens.refreshToken,
    deviceId: device.deviceId,
    deviceName: device.deviceName,
    deviceType: device.deviceType,
    browser: device.browser,
    os: device.os,
    ip: device.ip,
    location: device.location,
    isActive: true,
    lastUsedAt: new Date(),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + config.jwt.refreshExpiresInSeconds * 1000),
  };
  sessionsTable.set(sessionId, session);

  recordLoginEvent(userId, user.email, device, true);
  return { tokens, user: toPublicUser(user) };
}

// ─── Token Refresh with Rotation ─────────────────────────────────────────────

export async function refreshTokens(
  oldRefreshToken: string,
  device: ParsedDevice
): Promise<{ tokens: AuthTokens; user: PublicUser }> {
  if (isTokenBlacklisted(oldRefreshToken)) {
    throw Object.assign(new Error("Refresh token has been revoked"), { statusCode: 401 });
  }

  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw Object.assign(new Error("Invalid or expired refresh token"), { statusCode: 401 });
  }

  const session = sessionsTable.get(payload.sessionId);
  if (!session || !session.isActive || session.refreshToken !== oldRefreshToken) {
    throw Object.assign(new Error("Session not found or token reuse detected"), {
      statusCode: 401,
    });
  }

  // Check session hasn't expired
  if (new Date() > session.expiresAt) {
    sessionsTable.set(payload.sessionId, { ...session, isActive: false });
    throw Object.assign(new Error("Session expired. Please log in again."), { statusCode: 401 });
  }

  const user = usersTable.get(payload.sub);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  // Blacklist old refresh token (rotation)
  blacklistToken(oldRefreshToken, config.jwt.refreshExpiresInSeconds);

  // Issue new token pair
  const tokens = issueTokenPair(user.id, session.id, user.email, device.deviceId);

  // Update session with new refresh token
  sessionsTable.set(session.id, {
    ...session,
    refreshToken: tokens.refreshToken,
    lastUsedAt: new Date(),
    ip: device.ip,
    location: device.location,
  });

  return { tokens, user: toPublicUser(user) };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(
  sessionId: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  const session = sessionsTable.get(sessionId);
  if (session) {
    sessionsTable.set(sessionId, { ...session, isActive: false });
    if (session.refreshToken) {
      blacklistToken(session.refreshToken, config.jwt.refreshExpiresInSeconds);
    }
  }

  // Blacklist the access token for its remaining lifetime (max 15 min)
  blacklistToken(accessToken, 15 * 60);

  if (refreshToken) {
    blacklistToken(refreshToken, config.jwt.refreshExpiresInSeconds);
  }
}

// ─── Logout All Devices ───────────────────────────────────────────────────────

export async function logoutAllDevices(userId: string): Promise<void> {
  for (const [id, session] of sessionsTable.entries()) {
    if (session.userId === userId && session.isActive) {
      sessionsTable.set(id, { ...session, isActive: false });
      if (session.refreshToken) {
        blacklistToken(session.refreshToken, config.jwt.refreshExpiresInSeconds);
      }
    }
  }
}

// ─── 2FA Setup ────────────────────────────────────────────────────────────────

export async function initiate2FASetup(userId: string) {
  const user = usersTable.get(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  return generateTwoFactorSetup(user.email);
}

export async function confirm2FASetup(
  userId: string,
  token: string,
  secret: string
): Promise<void> {
  const valid = verifyTOTP(secret, token);
  if (!valid) {
    throw Object.assign(
      new Error("Invalid verification code. Please scan the QR code again."),
      { statusCode: 400 }
    );
  }

  const user = usersTable.get(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  usersTable.set(userId, {
    ...user,
    twoFactorEnabled: true,
    twoFactorSecret: secret,
    updatedAt: new Date(),
  });
}

export async function disable2FA(userId: string, token: string): Promise<void> {
  const user = usersTable.get(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  if (!user.twoFactorSecret) {
    throw Object.assign(new Error("2FA is not enabled"), { statusCode: 400 });
  }

  const valid = verifyTOTP(user.twoFactorSecret, token);
  if (!valid) {
    throw Object.assign(new Error("Invalid 2FA token"), { statusCode: 401 });
  }

  usersTable.set(userId, {
    ...user,
    twoFactorEnabled: false,
    twoFactorSecret: undefined,
    updatedAt: new Date(),
  });
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<void> {
  const userId = emailIndex.get(email);
  // Always return success to prevent email enumeration
  if (!userId) return;

  const user = usersTable.get(userId)!;
  const { sendPasswordResetOTP } = await import("./email");
  const otp = generateOTP(userId, "password_reset");
  await sendPasswordResetOTP(email, user.name, otp);
}

export async function resetPassword(
  userId: string,
  otp: string,
  newPassword: string
): Promise<void> {
  const result = verifyOTP(userId, "password_reset", otp);
  if (!result.valid) {
    throw Object.assign(new Error(result.reason ?? "Invalid OTP"), { statusCode: 400 });
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    throw Object.assign(
      new Error(`Weak password: ${strength.errors.join("; ")}`),
      { statusCode: 400 }
    );
  }

  const user = usersTable.get(userId);
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const passwordHash = await hashPassword(newPassword);
  usersTable.set(userId, { ...user, passwordHash, updatedAt: new Date() });

  // Invalidate all sessions after password change
  await logoutAllDevices(userId);
}

// ─── Login History ────────────────────────────────────────────────────────────

export function getLoginHistory(userId: string, limit = 20): LoginEvent[] {
  return (loginEventsTable.get(userId) ?? []).slice(0, limit);
}

// ─── Active Sessions ──────────────────────────────────────────────────────────

export function getActiveSessions(userId: string): Session[] {
  return [...sessionsTable.values()].filter(
    (s) => s.userId === userId && s.isActive && new Date() < s.expiresAt
  );
}

export async function revokeSession(
  userId: string,
  sessionId: string
): Promise<void> {
  const session = sessionsTable.get(sessionId);
  if (!session || session.userId !== userId) {
    throw Object.assign(new Error("Session not found"), { statusCode: 404 });
  }
  sessionsTable.set(sessionId, { ...session, isActive: false });
  if (session.refreshToken) {
    blacklistToken(session.refreshToken, config.jwt.refreshExpiresInSeconds);
  }
}

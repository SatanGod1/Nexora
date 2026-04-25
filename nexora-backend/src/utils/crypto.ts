// src/utils/crypto.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS ?? "12");
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  ?? "change_me_access_secret_min_32_chars!!";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "change_me_refresh_secret_min_32_chars!";
const ACCESS_EXP     = process.env.JWT_ACCESS_EXPIRES_IN  ?? "15m";
const REFRESH_EXP    = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

// ── Passwords ─────────────────────────────────────────────────────────────────
export const hashPassword   = (pw: string) => bcrypt.hash(pw, BCRYPT_ROUNDS);
export const comparePassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

// ── OTP ───────────────────────────────────────────────────────────────────────
export function generateOtp(): string {
  const n = crypto.randomBytes(4).readUInt32BE(0) % 1_000_000;
  return n.toString().padStart(6, "0");
}
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
export function verifyOtp(plain: string, storedHash: string): boolean {
  const inputHash = crypto.createHash("sha256").update(plain).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(storedHash, "hex"));
  } catch { return false; }
}

// ── JWT ───────────────────────────────────────────────────────────────────────
export interface AccessPayload  { sub: string; email: string; jti: string; }
export interface RefreshPayload { sub: string; jti: string; sessionId: string; }

export function signAccessToken(payload: Omit<AccessPayload, "jti">): string {
  return jwt.sign({ ...payload, jti: uuidv4() }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXP, issuer: "nexora",
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string, sessionId: string): { token: string; jti: string } {
  const jti = uuidv4();
  const token = jwt.sign(
    { sub: userId, jti, sessionId } as RefreshPayload,
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXP, issuer: "nexora" } as jwt.SignOptions
  );
  return { token, jti };
}

export const verifyAccessToken  = (t: string) => jwt.verify(t, ACCESS_SECRET,  { issuer: "nexora" }) as AccessPayload;
export const verifyRefreshToken = (t: string) => jwt.verify(t, REFRESH_SECRET, { issuer: "nexora" }) as RefreshPayload;
export const hashRefreshToken   = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

export function signTempToken(userId: string, purpose: string): string {
  return jwt.sign({ sub: userId, purpose }, ACCESS_SECRET, {
    expiresIn: "10m", issuer: "nexora",
  } as jwt.SignOptions);
}
export const verifyTempToken = (t: string) =>
  jwt.verify(t, ACCESS_SECRET, { issuer: "nexora" }) as { sub: string; purpose: string };

// Session expiry: 7 days from now
export function refreshExpiryDate(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

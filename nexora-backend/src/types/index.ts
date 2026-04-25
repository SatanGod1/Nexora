// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  deviceId: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
  ip: string;
  location?: string;
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface LoginEvent {
  id: string;
  userId: string;
  email: string;
  ip: string;
  location?: string;
  deviceName: string;
  browser: string;
  os: string;
  success: boolean;
  failureReason?: string;
  isSuspicious: boolean;
  timestamp: Date;
}

export interface OTPRecord {
  userId: string;
  email: string;
  otp: string;
  purpose: OTPPurpose;
  expiresAt: Date;
  attempts: number;
}

export type OTPPurpose =
  | "email_verification"
  | "login_otp"
  | "password_reset"
  | "two_factor_setup";

// ─── Request / Response DTOs ──────────────────────────────────────────────────

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface VerifyOTPRequest {
  userId: string;
  otp: string;
  purpose: OTPPurpose;
}

export interface Verify2FARequest {
  userId: string;
  token: string; // 6-digit TOTP from authenticator app
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface DeviceInfo {
  userAgent?: string;
  platform?: string;
}

// ─── Token Payloads ───────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;        // userId
  email: string;
  sessionId: string;
  deviceId: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;        // userId
  sessionId: string;
  deviceId: string;
  iat?: number;
  exp?: number;
}

// ─── API Response Shapes ─────────────────────────────────────────────────────

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface LoginResponse {
  requiresOTP?: boolean;
  requires2FA?: boolean;
  userId?: string;
  tokens?: AuthTokens;
  user?: PublicUser;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

// ─── Express Extensions ───────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      deviceInfo?: ParsedDevice;
    }
  }
}

export interface ParsedDevice {
  deviceId: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  os: string;
  ip: string;
  location?: string;
}

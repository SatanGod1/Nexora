import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";
import { AccessTokenPayload, RefreshTokenPayload, AuthTokens } from "../types";
import { cache } from "./store";

// ─── Issue Tokens ─────────────────────────────────────────────────────────────

export function issueAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: "nexora",
    audience: "nexora-client",
  } as jwt.SignOptions);
}

export function issueRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: "nexora",
    audience: "nexora-client",
  } as jwt.SignOptions);
}

export function issueTokenPair(
  userId: string,
  sessionId: string,
  email: string,
  deviceId: string
): AuthTokens {
  const accessPayload: AccessTokenPayload = { sub: userId, email, sessionId, deviceId };
  const refreshPayload: RefreshTokenPayload = { sub: userId, sessionId, deviceId };

  return {
    accessToken: issueAccessToken(accessPayload),
    refreshToken: issueRefreshToken(refreshPayload),
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

// ─── Verify Tokens ────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, config.jwt.accessSecret, {
    issuer: "nexora",
    audience: "nexora-client",
  }) as AccessTokenPayload;
  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, config.jwt.refreshSecret, {
    issuer: "nexora",
    audience: "nexora-client",
  }) as RefreshTokenPayload;
  return payload;
}

// ─── Token Blacklist (for logout / rotation invalidation) ────────────────────

export function blacklistToken(token: string, ttlSeconds: number): void {
  // Store a hash of the token to keep the key short
  const key = `blacklist:${Buffer.from(token).toString("base64").slice(0, 32)}`;
  cache.set(key, "1", ttlSeconds);
}

export function isTokenBlacklisted(token: string): boolean {
  const key = `blacklist:${Buffer.from(token).toString("base64").slice(0, 32)}`;
  return cache.get(key) !== null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function generateSessionId(): string {
  return uuidv4();
}

export function generateDeviceId(): string {
  return uuidv4();
}

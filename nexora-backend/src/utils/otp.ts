import crypto from "crypto";
import { config } from "../config";
import { cache } from "./store";
import { OTPPurpose } from "../types";
const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 3;

function otpKey(userId: string, purpose: OTPPurpose): string {
  return `otp:${purpose}:${userId}`;
}

function attemptsKey(userId: string, purpose: OTPPurpose): string {
  return `otp_attempts:${purpose}:${userId}`;
}

/**
 * Generate a cryptographically secure 6-digit OTP and store it in cache.
 * Each call invalidates any previous OTP for that user+purpose.
 */
export function generateOTP(userId: string, purpose: OTPPurpose): string {
  // Secure random number in range [0, 10^6)
  const otp = crypto
    .randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");

  const ttl = config.otp.expiresMinutes * 60;
  cache.set(otpKey(userId, purpose), otp, ttl);
  // Reset attempt counter for fresh OTP
  cache.del(attemptsKey(userId, purpose));

  return otp;
}

/**
 * Verify an OTP. Returns true if correct, false otherwise.
 * Automatically deletes OTP on success or after max attempts exceeded.
 */
export function verifyOTP(
  userId: string,
  purpose: OTPPurpose,
  submitted: string
): { valid: boolean; reason?: string } {
  const stored = cache.get(otpKey(userId, purpose));

  if (!stored) {
    return { valid: false, reason: "OTP expired or not found. Please request a new one." };
  }

  const attempts = cache.incr(attemptsKey(userId, purpose), config.otp.expiresMinutes * 60);

  if (attempts > MAX_OTP_ATTEMPTS) {
    cache.del(otpKey(userId, purpose));
    cache.del(attemptsKey(userId, purpose));
    return { valid: false, reason: "Too many incorrect attempts. Please request a new OTP." };
  }

  if (submitted.length !== OTP_LENGTH) {
    const remaining = MAX_OTP_ATTEMPTS - attempts;
    return {
      valid: false,
      reason: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` : ""}`,
    };
  }

  // Timing-safe comparison
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(stored.padEnd(OTP_LENGTH)),
    Buffer.from(submitted.padEnd(OTP_LENGTH))
  );

  if (isMatch) {
    cache.del(otpKey(userId, purpose));
    cache.del(attemptsKey(userId, purpose));
    return { valid: true };
  }

  const remaining = MAX_OTP_ATTEMPTS - attempts;
  return {
    valid: false,
    reason: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` : ""}`,
  };
}

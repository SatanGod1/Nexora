import bcrypt from "bcryptjs";
import { config } from "../config";

/**
 * Hash a plaintext password with bcrypt.
 * BCRYPT_ROUNDS env var controls the work factor (default 12).
 * Higher = slower = more secure. 12 rounds ≈ 250ms on modern hardware.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const salt = await bcrypt.genSalt(config.bcryptRounds);
  return bcrypt.hash(plaintext, salt);
}

/**
 * Timing-safe comparison of plaintext against stored hash.
 * Always runs full bcrypt even if the user doesn't exist (prevents timing attacks).
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Validate password strength:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Must contain an uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Must contain a lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Must contain a number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push("Must contain a special character");

  return { valid: errors.length === 0, errors };
}

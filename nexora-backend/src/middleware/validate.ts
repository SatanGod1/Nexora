import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ApiResponse } from "../types";

/**
 * Generic Zod validation middleware factory.
 * Usage: router.post("/login", validate(loginSchema), handler)
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({
        success: false,
        message: "Validation failed",
        error: errors,
      } satisfies ApiResponse);
      return;
    }
    req.body = result.data;
    next();
  };
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name too long"),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const verifyOTPSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
  purpose: z.enum([
    "email_verification",
    "login_otp",
    "password_reset",
    "two_factor_setup",
  ]),
});

export const verify2FASchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  token: z
    .string()
    .min(6, "2FA token must be 6 digits")
    .max(7, "2FA token too long")
    .regex(/^\d+$/, "2FA token must be numeric"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token required"),
});

export const requestOTPSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  purpose: z.enum(["email_verification", "login_otp", "password_reset"]),
});

export const resetPasswordSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  otp: z.string().length(6).regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(128),
});

export const setup2FAVerifySchema = z.object({
  userId: z.string().uuid(),
  token: z.string().length(6).regex(/^\d{6}$/),
  secret: z.string().min(16, "Invalid secret"),
});

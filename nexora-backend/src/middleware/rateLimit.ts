import rateLimit from "express-rate-limit";

// ─── Login / Register — tightest limits ───────────────────────────────────────
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please wait 15 minutes and try again.",
    error: "RATE_LIMIT_EXCEEDED",
  },
  skipSuccessfulRequests: false,
});

// ─── OTP sending — prevent OTP spam ──────────────────────────────────────────
export const otpSendRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                     // 5 OTP sends per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait before requesting another.",
    error: "OTP_RATE_LIMIT_EXCEEDED",
  },
});

// ─── General API — broad protection ───────────────────────────────────────────
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 100,                   // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
    error: "RATE_LIMIT_EXCEEDED",
  },
});

// ─── Token refresh — prevent refresh token abuse ──────────────────────────────
export const refreshRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 15,                    // 15 refreshes per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many token refresh requests.",
    error: "REFRESH_RATE_LIMIT_EXCEEDED",
  },
});

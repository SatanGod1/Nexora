import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3001"),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-in-prod",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-in-prod",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    refreshExpiresInSeconds: 7 * 24 * 60 * 60,
  },

  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  },

  smtp: {
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.EMAIL_FROM ?? "Nexora <no-reply@nexora.app>",
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? "12"),

  account: {
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS ?? "5"),
    lockDurationMinutes: parseInt(process.env.LOCK_DURATION_MINUTES ?? "30"),
  },

  otp: {
    expiresMinutes: parseInt(process.env.OTP_EXPIRES_MINUTES ?? "10"),
  },

  alerts: {
    onNewDevice: process.env.ALERT_ON_NEW_DEVICE !== "false",
    onNewLocation: process.env.ALERT_ON_NEW_LOCATION !== "false",
  },
} as const;

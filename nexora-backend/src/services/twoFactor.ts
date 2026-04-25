import speakeasy from "speakeasy";
import QRCode from "qrcode";

const ISSUER = "Nexora";
const WINDOW = 1; // Allow 1 step before/after for clock drift

// ─── Setup ───────────────────────────────────────────────────────────────────

export interface TwoFactorSetup {
  secret: string;         // Store (encrypted) in DB
  otpauthUrl: string;     // Pass to QR code generator
  qrCodeDataUrl: string;  // Base64 PNG for frontend display
  manualEntryKey: string; // Human-readable fallback
}

/**
 * Generate a new TOTP secret for a user starting 2FA setup.
 * Call this BEFORE saving to DB — only persist after the user verifies.
 */
export async function generateTwoFactorSetup(
  email: string
): Promise<TwoFactorSetup> {
  const secretObj = speakeasy.generateSecret({
    name: `${ISSUER} (${email})`,
    issuer: ISSUER,
    length: 32,
  });

  const otpauthUrl = secretObj.otpauth_url!;
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    secret: secretObj.base32,
    otpauthUrl,
    qrCodeDataUrl,
    manualEntryKey: secretObj.base32,
  };
}

/**
 * Verify a TOTP token from the user's authenticator app.
 */
export function verifyTOTP(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: token.replace(/\s/g, ""), // strip spaces
    window: WINDOW,
  });
}

/**
 * Generate a TOTP token (useful for testing).
 */
export function generateTOTP(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: "base32",
  });
}

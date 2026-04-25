// src/services/email.service.ts
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const LOGO_PATH = path.join(process.cwd(), "nexora.png"); 
const LOGO_CID  = "nexora_logo@nexora.app";

function getLogoAttachment() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.warn("[Email] Warning: Logo file not found at", LOGO_PATH);
    return [];
  }
  return [{
    filename: "nexora.png",
    path: LOGO_PATH,
    cid: LOGO_CID,
    contentDisposition: "inline" as const,
  }];
}

function makeTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: false,
    auth: { user, pass },
  });
}

const transporter = makeTransport();
const FROM = process.env.SMTP_FROM ?? "Nexora <noreply@nexora.io>";

async function send(to: string, subject: string, html: string) {
  if (!transporter) {
    console.log(`\n📧 [DEV EMAIL]\nTo: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g,"").trim()}\n`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html, attachments: getLogoAttachment(), });
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0A1628; font-family: Arial, Helvetica, sans-serif; color: #ffffff; padding: 20px; }
    .outer { max-width: 560px; margin: 0 auto; }

    /* Header with logo */
    .header {
      background: linear-gradient(135deg, #0A1628 0%, #132040 100%);
      border-radius: 16px 16px 0 0;
      padding: 32px 40px 24px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.08);
      border-bottom: none;
    }
    .logo-img { display: block; margin: 0 auto 14px; width: 76px; height: 76px; border-radius: 50%; }
    .brand-name {
      font-size: 26px;
      font-weight: 700;
      color: #F5A623;
      letter-spacing: 1px;
    }
    .brand-tagline {
      font-size: 12px;
      color: rgba(255,255,255,0.35);
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    /* Body card */
    .card {
      background: #132040;
      padding: 36px 40px;
      border: 1px solid rgba(255,255,255,0.08);
      border-top: 2px solid #F5A623;
      border-bottom: none;
    }
    h2 { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #ffffff; }
    p { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.75; margin-bottom: 14px; }

    /* OTP box */
    .otp {
      font-size: 46px;
      font-weight: 700;
      letter-spacing: 14px;
      color: #F5A623;
      text-align: center;
      padding: 24px 20px;
      background: rgba(245,166,35,0.07);
      border-radius: 12px;
      margin: 24px 0;
      border: 1px solid rgba(245,166,35,0.25);
    }

    /* Alert box */
    .alert {
      background: rgba(226,75,74,0.08);
      border: 1px solid rgba(226,75,74,0.3);
      border-radius: 10px;
      padding: 16px;
      margin: 16px 0;
      font-size: 13px;
      color: rgba(255,255,255,0.75);
      line-height: 1.7;
    }

    /* Info row */
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 13px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: rgba(255,255,255,0.4); }
    .info-value { color: rgba(255,255,255,0.85); font-weight: 500; }

    /* Divider */
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 20px 0; }

    /* Warning note */
    .note {
      font-size: 12px !important;
      color: rgba(255,255,255,0.28) !important;
      margin-top: 6px !important;
    }

    /* Footer */
    .footer {
      background: #0d1d35;
      border-radius: 0 0 16px 16px;
      padding: 20px 40px;
      text-align: center;
      border: 1px solid rgba(255,255,255,0.08);
      border-top: none;
    }
    .footer p {
      font-size: 11px;
      color: rgba(255,255,255,0.2);
      margin: 0;
      line-height: 1.6;
    }
    .footer a { color: rgba(245,166,35,0.6); text-decoration: none; }
  </style>
</head>
<body>
  <div class="outer">

    <!-- Header with Logo -->
    <div class="header">
      <img src="cid:${LOGO_CID}" alt="Nexora Logo" class="logo-img" />
      <div class="brand-name">NEXORA</div>
      <div class="brand-tagline">Your career begins here</div>
    </div>

    <!-- Main card -->
    <div class="card">
      <h2>${title}</h2>
      ${body}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>© 2026 Nexora · <a href="#">Privacy Policy</a> · <a href="#">Support</a></p>
      <p style="margin-top:6px">If you didn\'t request this email, you can safely ignore it.</p>
    </div>

  </div>
</body>
</html>`;
}

// ── Email Functions ────────────────────────────────────────────────────────────

export async function sendOtpEmail(
  email: string,
  name: string,
  otp: string,
  purpose: "verify" | "login" | "reset"
) {
  const labels = {
    verify: "Verify Your Email Address",
    login:  "Your Login Verification Code",
    reset:  "Reset Your Password",
  };
  const descs = {
    verify: "To activate your Nexora account, enter the verification code below. It expires in <strong>10 minutes</strong>.",
    login:  "A sign-in was attempted on your account. Enter the code below to complete login. It expires in <strong>10 minutes</strong>.",
    reset:  "We received a request to reset your password. Enter the code below to proceed. It expires in <strong>10 minutes</strong>.",
  };
  const icons = { verify: "✉️", login: "🔐", reset: "🔑" };

  await send(
    email,
    `${icons[purpose]} ${labels[purpose]} — Nexora`,
    layout(labels[purpose], `
      <p>Hi <strong>${name}</strong>,</p>
      <p>${descs[purpose]}</p>
      <div class="otp">${otp}</div>
      <div class="divider"></div>
      <p class="note">🔒 Never share this code with anyone — Nexora will never ask for it. This code is valid for one use only.</p>
    `)
  );
}

export async function sendNewDeviceAlert(
  email: string,
  name: string,
  info: { device: string; ip: string; time: string }
) {
  await send(
    email,
    "⚠️ New sign-in to your Nexora account",
    layout("New Device Sign-In Detected", `
      <p>Hi <strong>${name}</strong>,</p>
      <p>We detected a sign-in to your Nexora account from a device we don\'t recognise.</p>
      <div class="alert">
        <div class="info-row"><span class="info-label">Device : </span><span class="info-value">${info.device}</span></div>
        <div class="info-row"><span class="info-label">IP Address : </span><span class="info-value">${info.ip}</span></div>
        <div class="info-row"><span class="info-label">Time : </span><span class="info-value">${info.time}</span></div>
      </div>
      <p>If this was you, no action is needed. If you don\'t recognise this activity, <strong>change your password immediately</strong> and contact our support team.</p>
    `)
  );
}

export async function sendAccountLockedEmail(
  email: string,
  name: string,
  until: Date
) {
  await send(
    email,
    "🔒 Your Nexora account has been temporarily locked",
    layout("Account Temporarily Locked", `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your Nexora account has been <strong>temporarily locked</strong> due to too many failed login attempts. This is an automatic security measure to protect your account.</p>
      <div class="alert">
        <div class="info-row"><span class="info-label">Status : </span><span class="info-value">Locked</span></div>
        <div class="info-row"><span class="info-label">Unlocks at : </span><span class="info-value">${until.toUTCString()}</span></div>
      </div>
      <p>Your account will unlock automatically. If you did not attempt to log in, please reset your password immediately.</p>
    `)
  );
}

export async function sendPasswordChangedEmail(
  email: string,
  name: string,
  ip: string,
  time: string
) {
  await send(
    email,
    "🔑 Your Nexora password was changed",
    layout("Password Changed Successfully", `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your Nexora account password was recently changed.</p>
      <div class="alert">
        <div class="info-row"><span class="info-label">IP Address : </span><span class="info-value">${ip}</span></div>
        <div class="info-row"><span class="info-label">Time : </span><span class="info-value">${time}</span></div>
      </div>
      <p>If you made this change, no action is needed. If you did <strong>not</strong> make this change, contact our support team immediately.</p>
    `)
  );
}

export async function sendSuspiciousActivityAlert(
  email: string,
  name: string,
  reason: string,
  details: Record<string, string>
) {
  const rows = Object.entries(details)
    .map(([k, v]) => `<div class="info-row"><span class="info-label">${k}</span><span class="info-value">${v}</span></div>`)
    .join("");

  await send(
    email,
    "🚨 Suspicious activity on your Nexora account",
    layout("Suspicious Activity Detected", `
      <p>Hi <strong>${name}</strong>,</p>
      <p>We detected potentially suspicious activity on your account: <strong>${reason}</strong></p>
      <div class="alert">${rows}</div>
      <p>As a precaution, we recommend reviewing your recent login history and changing your password if you don\'t recognise this activity.</p>
    `)
  );
}

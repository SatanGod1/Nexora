// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const StudentProfileSchema = new Schema({
  college:       { type: String, required: true },
  degree:        { type: String, required: true },
  course:        { type: String, required: true },
  passoutYear:   { type: String, required: true },
  opportunities: { type: [String], default: [] }, // e.g. ["internship","placement"]
  companies:     { type: [String], default: [] },  // followed company names
}, { _id: false });

const ProfessionalProfileSchema = new Schema({
  jobTitle:    { type: String, required: true },
  experience:  { type: String, required: true }, // e.g. "3-5 years"
  industry:    { type: String, required: true },
  jobTypes:    { type: [String], default: [] },  // e.g. ["fulltime","remote"]
  companies:   { type: [String], default: [] },
}, { _id: false });

const LoginEventSchema = new Schema({
  success:    { type: Boolean, required: true },
  ip:         { type: String, default: "unknown" },
  device:     { type: String, default: "unknown" },
  failReason: { type: String, default: "" },
  at:         { type: Date, default: Date.now },
}, { _id: false });

const SessionSchema = new Schema({
  refreshTokenHash: { type: String, required: true },
  deviceName:       { type: String, default: "Unknown Device" },
  browser:          { type: String, default: "Unknown" },
  ip:               { type: String, default: "0.0.0.0" },
  createdAt:        { type: Date, default: Date.now },
  expiresAt:        { type: Date, required: true },
  isActive:         { type: Boolean, default: true },
}, { _id: true });

// ── Main User Interface ───────────────────────────────────────────────────────

export interface IUser extends Document {
  // Core identity
  name:             string;
  email:            string;
  passwordHash:     string;

  // Email verification
  isEmailVerified:  boolean;
  emailOtp:         string | null;
  emailOtpExpires:  Date | null;
  emailOtpAttempts: number;

  // Account security
  failedLoginCount: number;
  isLocked:         boolean;
  lockedUntil:      Date | null;
  lastFailedLogin:  Date | null;

  // Login OTP (for suspicious logins)
  loginOtp:         string | null;
  loginOtpExpires:  Date | null;

  // Profile (set during onboarding)
  profileType:      "student" | "professional" | null;
  studentProfile:   typeof StudentProfileSchema | null;
  professionalProfile: typeof ProfessionalProfileSchema | null;
  onboardingComplete: boolean;

  // Sessions (refresh token rotation)
  sessions:         Array<{
    _id: mongoose.Types.ObjectId;
    refreshTokenHash: string;
    deviceName: string;
    browser: string;
    ip: string;
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
  }>;

  // Login history for monitoring
  loginHistory: Array<{
    success: boolean;
    ip: string;
    device: string;
    failReason: string;
    at: Date;
  }>;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  verifyPassword(plain: string): Promise<boolean>;
  isAccountLocked(): boolean;
  incrementFailedLogin(): Promise<void>;
  resetFailedLogin(): Promise<void>;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash:     { type: String, required: true },

    isEmailVerified:  { type: Boolean, default: false },
    emailOtp:         { type: String, default: null },
    emailOtpExpires:  { type: Date,   default: null },
    emailOtpAttempts: { type: Number, default: 0 },

    failedLoginCount: { type: Number, default: 0 },
    isLocked:         { type: Boolean, default: false },
    lockedUntil:      { type: Date,   default: null },
    lastFailedLogin:  { type: Date,   default: null },

    loginOtp:         { type: String, default: null },
    loginOtpExpires:  { type: Date,   default: null },

    profileType:               { type: String, enum: ["student", "professional", null], default: null },
    studentProfile:            { type: StudentProfileSchema, default: null },
    professionalProfile:       { type: ProfessionalProfileSchema, default: null },
    onboardingComplete:        { type: Boolean, default: false },

    sessions:     { type: [SessionSchema], default: [] },
    loginHistory: { type: [LoginEventSchema], default: [] },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ── Instance Methods ──────────────────────────────────────────────────────────

UserSchema.methods.verifyPassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.methods.isAccountLocked = function (): boolean {
  if (!this.isLocked) return false;
  if (this.lockedUntil && new Date() > this.lockedUntil) {
    // Lock expired — will be cleared on next save
    return false;
  }
  return true;
};

UserSchema.methods.incrementFailedLogin = async function (): Promise<void> {
  this.failedLoginCount += 1;
  this.lastFailedLogin = new Date();
  const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS ?? "5");
  const LOCK_MINUTES = parseInt(process.env.LOCK_DURATION_MINUTES ?? "30");
  if (this.failedLoginCount >= MAX_ATTEMPTS) {
    this.isLocked = true;
    this.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
  }
  await this.save();
};

UserSchema.methods.resetFailedLogin = async function (): Promise<void> {
  this.failedLoginCount = 0;
  this.isLocked = false;
  this.lockedUntil = null;
  this.lastFailedLogin = null;
  await this.save();
};

// ── Indexes ───────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ "sessions.refreshTokenHash": 1 });

export const User = mongoose.model<IUser>("User", UserSchema);

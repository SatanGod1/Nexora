// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";

const app  = express();
const PORT = parseInt(process.env.PORT ?? "3001");
const FRONTEND = process.env.FRONTEND_URL ?? "http://localhost:5173";

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));

// ── Global Rate Limit ─────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
}));

// ── Strict Rate Limit for Auth Endpoints ──────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please wait 15 minutes." },
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/onboarding", authRoutes); // onboarding/save reuses the auth router

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀  Nexora API running on http://localhost:${PORT}`);
    console.log(`🌐  Accepting requests from: ${FRONTEND}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV ?? "development"}\n`);
  });
}

bootstrap().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

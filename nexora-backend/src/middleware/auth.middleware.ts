// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/crypto";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.userId    = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

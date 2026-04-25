/**
 * In-Memory Store
 * ────────────────────────────────────────────────────────────────────────────
 * This simulates a database for development / demo purposes.
 * In production, replace each Map with your ORM calls (Prisma, TypeORM, etc.)
 * and replace the Redis simulation with a real Redis client.
 */

import { User, Session, LoginEvent, OTPRecord } from "../types";

// ─── "Tables" ─────────────────────────────────────────────────────────────────
export const usersTable = new Map<string, User>();           // userId → User
export const emailIndex = new Map<string, string>();         // email  → userId
export const sessionsTable = new Map<string, Session>();     // sessionId → Session
export const loginEventsTable = new Map<string, LoginEvent[]>(); // userId → events[]

// ─── Redis-like Cache (OTPs, rate-limit keys, blacklisted tokens) ──────────
interface CacheEntry {
  value: string;
  expiresAt: number; // Unix ms
}

class MemoryCache {
  private store = new Map<string, CacheEntry>();

  set(key: string, value: string, ttlSeconds: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  del(key: string): void {
    this.store.delete(key);
  }

  incr(key: string, ttlSeconds?: number): number {
    const current = this.get(key);
    const next = current ? parseInt(current) + 1 : 1;
    this.set(key, String(next), ttlSeconds ?? 3600);
    return next;
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

export const cache = new MemoryCache();

// Run cleanup every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

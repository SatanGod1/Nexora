import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import { v4 as uuidv4 } from "uuid";
import { ParsedDevice } from "../types";
import { Request } from "express";

/**
 * Extract a structured device fingerprint from an Express request.
 * Combines User-Agent parsing with IP-based geolocation.
 */
export function parseDevice(req: Request): ParsedDevice {
  const ua = req.headers["user-agent"] ?? "";
  const parser = new UAParser(ua);
  const result = parser.getResult();

  const browser = [result.browser.name, result.browser.version]
    .filter(Boolean)
    .join(" ") || "Unknown Browser";

  const os = [result.os.name, result.os.version]
    .filter(Boolean)
    .join(" ") || "Unknown OS";

  const rawType = result.device.type;
  let deviceType: ParsedDevice["deviceType"] = "desktop";
  if (rawType === "mobile") deviceType = "mobile";
  else if (rawType === "tablet") deviceType = "tablet";
  else if (rawType) deviceType = "unknown";

  const deviceName = result.device.model
    ? `${result.device.vendor ?? ""} ${result.device.model}`.trim()
    : `${os} · ${browser}`;

  const ip = extractIP(req);
  const location = resolveLocation(ip);

  return {
    deviceId: uuidv4(), // Stable ID stored in session; callers may override with cookie value
    deviceName,
    deviceType,
    browser,
    os,
    ip,
    location,
  };
}

/**
 * Resolve the real client IP, respecting common proxy headers.
 */
export function extractIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "0.0.0.0";
}

/**
 * Geo-resolve an IP to a human-readable "City, Country" string.
 * Falls back to "Unknown Location" for private/loopback IPs.
 */
export function resolveLocation(ip: string): string {
  // Loopback / private IPs won't resolve
  if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "Local Network";
  }

  const geo = geoip.lookup(ip);
  if (!geo) return "Unknown Location";

  const parts = [geo.city, geo.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown Location";
}

/**
 * Build a consistent device fingerprint string for comparison.
 * Used to detect "new device" logins.
 */
export function buildDeviceFingerprint(device: ParsedDevice): string {
  return `${device.os}|${device.browser}|${device.deviceType}`;
}

import { LoginEvent, Session } from "../types";
import { config } from "../config";

export interface SuspicionResult {
  isSuspicious: boolean;
  reasons: string[];
}

/**
 * Analyse a login attempt for suspicious patterns.
 *
 * Checks:
 * 1. New device (fingerprint not seen before for this user)
 * 2. New country / location
 * 3. Velocity — many logins in a short window
 * 4. Impossible travel — login from two distant locations very close in time
 */
export function analyseSuspicion(
  newDevice: { ip: string; location?: string; os: string; browser: string },
  existingSessions: Session[],
  recentEvents: LoginEvent[]
): SuspicionResult {
  const reasons: string[] = [];

  // ── 1. New device fingerprint ─────────────────────────────────────────────
  if (config.alerts.onNewDevice) {
    const knownFingerprints = existingSessions.map(
      (s) => `${s.os}|${s.browser}`
    );
    const newFingerprint = `${newDevice.os}|${newDevice.browser}`;
    if (!knownFingerprints.includes(newFingerprint)) {
      reasons.push("Login from an unrecognised device");
    }
  }

  // ── 2. New location ───────────────────────────────────────────────────────
  if (config.alerts.onNewLocation && newDevice.location) {
    const knownLocations = [
      ...existingSessions.map((s) => s.location ?? ""),
      ...recentEvents.filter((e) => e.success).map((e) => e.location ?? ""),
    ].filter(Boolean);

    const newCountry = newDevice.location.split(",").pop()?.trim();
    const knownCountries = knownLocations.map((l) =>
      l.split(",").pop()?.trim()
    );

    if (
      knownLocations.length > 0 &&
      newCountry &&
      !knownCountries.includes(newCountry)
    ) {
      reasons.push(`Login from a new location: ${newDevice.location}`);
    }
  }

  // ── 3. Velocity check — more than 5 successful logins in 1 hour ───────────
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentSuccessful = recentEvents.filter(
    (e) => e.success && e.timestamp > oneHourAgo
  );
  if (recentSuccessful.length > 5) {
    reasons.push("Unusually high login frequency detected");
  }

  // ── 4. Impossible travel heuristic ────────────────────────────────────────
  // Rough: if last login was from a different country within the past 2 hours
  if (newDevice.location) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentFromDifferentLocation = recentEvents.find((e) => {
      if (!e.success || !e.location) return false;
      if (e.timestamp < twoHoursAgo) return false;
      const prevCountry = e.location.split(",").pop()?.trim();
      const newCountry = newDevice.location!.split(",").pop()?.trim();
      return prevCountry && newCountry && prevCountry !== newCountry;
    });

    if (recentFromDifferentLocation) {
      reasons.push(
        `Possible impossible travel — previous login from ${recentFromDifferentLocation.location}`
      );
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

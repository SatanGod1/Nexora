// ─── Nexora API Client ────────────────────────────────────────────────────────
// Drop this file alongside App.jsx and import from it.
// It handles token storage, auto-refresh, and typed calls to every auth endpoint.

const API_BASE = import.meta.env?.VITE_API_URL ?? "http://localhost:3001/api";

// ─── Token Storage ────────────────────────────────────────────────────────────
// Using sessionStorage so tokens are wiped when the tab closes.
// For persistent sessions, swap to localStorage — but never store refresh tokens there in prod.

const TOKEN_KEYS = {
  access: "nx_access_token",
  refresh: "nx_refresh_token",
  userId: "nx_user_id",
};

export const tokenStore = {
  setTokens(access, refresh) {
    sessionStorage.setItem(TOKEN_KEYS.access, access);
    if (refresh) sessionStorage.setItem(TOKEN_KEYS.refresh, refresh);
  },
  getAccess() { return sessionStorage.getItem(TOKEN_KEYS.access); },
  getRefresh() { return sessionStorage.getItem(TOKEN_KEYS.refresh); },
  setUserId(id) { sessionStorage.setItem(TOKEN_KEYS.userId, id); },
  getUserId() { return sessionStorage.getItem(TOKEN_KEYS.userId); },
  clear() {
    Object.values(TOKEN_KEYS).forEach(k => sessionStorage.removeItem(k));
  },
};

// ─── Core Fetcher ─────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue = [];

async function drainRefreshQueue(err, tokens) {
  refreshQueue.forEach(cb => cb(err, tokens));
  refreshQueue = [];
}

async function apiFetch(path, options = {}, retry = true) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const access = tokenStore.getAccess();
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();

  // Auto-refresh on 401 TOKEN_EXPIRED
  if (res.status === 401 && data.error === "TOKEN_EXPIRED" && retry) {
    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push((err, tokens) => {
          if (err) return reject(err);
          resolve(apiFetch(path, options, false));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshData = await authApi.refresh();
      tokenStore.setTokens(refreshData.tokens.accessToken, refreshData.tokens.refreshToken);
      await drainRefreshQueue(null, refreshData.tokens);
      isRefreshing = false;
      return apiFetch(path, options, false);
    } catch (err) {
      await drainRefreshQueue(err, null);
      isRefreshing = false;
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent("nexora:session-expired"));
      throw err;
    }
  }

  if (!res.ok) {
    const err = new Error(data.message ?? "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  // Register a new account
  async register(name, email, password) {
    return apiFetch("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
  },

  // Sign in
  async login(email, password) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  // Verify email or login OTP
  async verifyOTP(userId, otp, purpose) {
    return apiFetch("/auth/verify-otp", {
      method: "POST",
      body: { userId, otp, purpose },
    });
  },

  // Verify 2FA TOTP token
  async verify2FA(userId, token) {
    return apiFetch("/auth/verify-2fa", {
      method: "POST",
      body: { userId, token },
    });
  },

  // Refresh access token
  async refresh() {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) throw new Error("No refresh token available");
    return apiFetch("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    }, false);
  },

  // Resend OTP
  async resendOTP(userId, purpose) {
    return apiFetch("/auth/resend-otp", {
      method: "POST",
      body: { userId, purpose },
    });
  },

  // Logout current session
  async logout() {
    const refreshToken = tokenStore.getRefresh();
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: { refreshToken },
      });
    } finally {
      tokenStore.clear();
    }
  },

  // Logout all sessions
  async logoutAll() {
    try {
      await apiFetch("/auth/logout-all", { method: "POST" });
    } finally {
      tokenStore.clear();
    }
  },

  // Forgot password — request reset OTP
  async forgotPassword(email) {
    return apiFetch("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },

  // Reset password with OTP
  async resetPassword(userId, otp, newPassword) {
    return apiFetch("/auth/reset-password", {
      method: "POST",
      body: { userId, otp, newPassword },
    });
  },

  // Get 2FA setup QR code
  async get2FASetup() {
    return apiFetch("/auth/2fa/setup");
  },

  // Confirm 2FA setup
  async confirm2FA(token, secret) {
    return apiFetch("/auth/2fa/confirm", {
      method: "POST",
      body: { userId: tokenStore.getUserId(), token, secret },
    });
  },

  // Disable 2FA
  async disable2FA(token) {
    return apiFetch("/auth/2fa/disable", {
      method: "POST",
      body: { userId: tokenStore.getUserId(), token },
    });
  },

  // Get active sessions
  async getSessions() {
    return apiFetch("/auth/sessions");
  },

  // Revoke a specific session
  async revokeSession(sessionId) {
    return apiFetch(`/auth/sessions/${sessionId}`, { method: "DELETE" });
  },

  // Get login history
  async getLoginHistory(limit = 20) {
    return apiFetch(`/auth/login-history?limit=${limit}`);
  },

  // Get current user profile
  async getMe() {
    return apiFetch("/auth/me");
  },
};

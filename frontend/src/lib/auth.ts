import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.fasttypinglab.com';
const REFRESH_KEY = 'refreshToken';
const USER_KEYS = ['accessToken', REFRESH_KEY, 'ftl_user_name', 'ftl_user_avatar'];

// Refresh proactively once under this much time is left on the access token,
// rather than waiting for it to actually expire — an interval-based check
// (see initAuthRefresh) fires every few minutes, so this margin only needs to
// be comfortably wider than that interval, not exact.
const REFRESH_MARGIN_MS = 10 * 60 * 1000;
const REFRESH_CHECK_INTERVAL_MS = 4 * 60 * 1000;

/** exp (seconds since epoch) from a JWT, or null when unreadable. */
function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * The stored access token, or null. An expired token is removed on sight so the
 * UI never shows a logged-in state that the server would reject.
 */
export function getAccessToken(): string | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const exp = tokenExpiry(token);
    if (exp !== null && exp * 1000 <= Date.now() + 5000) {
      USER_KEYS.forEach(k => localStorage.removeItem(k));
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

/** True when a valid (unexpired) user session token is present in this browser. */
export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

/** Store a fresh access/refresh token pair (login, signup, or a successful refresh). */
export function storeSession(accessToken: string, refreshToken?: string | null): void {
  try {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch { /* ignore */ }
  window.dispatchEvent(new Event('ftl-auth-change'));
}

/**
 * Exchange the stored refresh token for a new access/refresh pair. Returns
 * true on success. On failure, deliberately leaves existing storage alone —
 * the access token's own expiry check in getAccessToken() is the fallback
 * that eventually logs the user out gracefully if refresh keeps failing,
 * rather than this function forcing an immediate logout on one bad attempt
 * (e.g. a transient network error).
 */
export async function refreshAccessToken(): Promise<boolean> {
  let refreshToken: string | null = null;
  try { refreshToken = localStorage.getItem(REFRESH_KEY); } catch { /* ignore */ }
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data?.accessToken) return false;
    storeSession(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

/**
 * Starts app-wide silent session renewal and returns a cleanup function.
 * Two independent mechanisms, one per login path:
 *  - Email/password sessions: this app's own accessToken/refreshToken pair,
 *    renewed via POST /auth/refresh a few minutes before it would expire.
 *  - Google sessions: the Supabase client already auto-refreshes its own
 *    session (autoRefreshToken: true in lib/supabase.ts) — this only mirrors
 *    the renewed token into the `accessToken` key the rest of the app reads,
 *    so a Google login also survives past the ~1hr mark.
 * Call once for the app's lifetime (e.g. from the root component); calling it
 * more than once is harmless but wasteful (duplicate timers/listeners).
 */
export function initAuthRefresh(): () => void {
  const checkAndRefresh = () => {
    let token: string | null = null;
    try { token = localStorage.getItem('accessToken'); } catch { /* ignore */ }
    if (!token) return;
    const exp = tokenExpiry(token);
    if (exp === null) return;
    if (exp * 1000 - Date.now() <= REFRESH_MARGIN_MS) refreshAccessToken();
  };
  checkAndRefresh();
  const timer = window.setInterval(checkAndRefresh, REFRESH_CHECK_INTERVAL_MS);

  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && session?.access_token) {
      localStorage.setItem('accessToken', session.access_token);
      window.dispatchEvent(new Event('ftl-auth-change'));
    }
  });

  return () => {
    window.clearInterval(timer);
    sub.subscription.unsubscribe();
  };
}

/**
 * Full sign-out: revokes the session on the server, drops the Supabase (Google)
 * session that would otherwise sign the user straight back in on /login, and
 * clears every local trace of the user.
 */
export async function logout(): Promise<void> {
  let token: string | null = null;
  try { token = localStorage.getItem('accessToken'); } catch { /* ignore */ }

  // Local state first so the UI is logged out even if the network calls fail.
  try {
    USER_KEYS.forEach(k => localStorage.removeItem(k));
    Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem('postAuthNext');
  } catch { /* ignore */ }
  window.dispatchEvent(new Event('ftl-auth-change'));

  const calls: Promise<unknown>[] = [supabase.auth.signOut({ scope: 'local' }).catch(() => {})];
  if (token) {
    calls.push(fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      keepalive: true,
    }).catch(() => {}));
  }
  await Promise.race([Promise.allSettled(calls), new Promise(r => setTimeout(r, 2500))]);
}

/** Sign out, then leave for the login page with a full reload (clears in-memory state). */
export async function logoutAndRedirect(): Promise<void> {
  await logout();
  window.location.replace('/login');
}

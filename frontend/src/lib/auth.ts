import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.fasttypinglab.com';
const USER_KEYS = ['accessToken', 'ftl_user_name', 'ftl_user_avatar'];

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

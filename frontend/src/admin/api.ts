import type { DashboardStats, AnalyticsPoint, PlatformUser, TypingTest, Category, ActivityLog, AppSettings, SeoTest, AdminAnalytics } from './types';

const API = import.meta.env.VITE_API_URL || 'https://typingteacher-2lnd.onrender.com';

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authedJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Request to ${path} failed (${res.status})`);
  return res.json();
}

// ─── Overview (real) ───────────────────────────────────────
export interface OverviewData {
  stats: DashboardStats;
  chartData: AnalyticsPoint[];
  difficultyDistribution: { easy: number; medium: number; hard: number };
}

export async function fetchOverview(): Promise<OverviewData> {
  return authedJson('/api/admin/stats');
}

// ─── Analytics (real, from test_sessions/users) ─────────────
export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  return authedJson('/api/admin/analytics');
}

// ─── Tests (real) ────────────────────────────────────────────
export async function fetchAdminTests(): Promise<TypingTest[]> {
  return authedJson('/api/admin/tests');
}

export async function deleteAdminTest(id: string): Promise<boolean> {
  const res = await fetch(`${API}/api/admin/tests/${id}`, { method: 'DELETE', headers: authHeaders() });
  return res.ok;
}

// ─── Categories (real, derived from typing_test.category — read-only) ──
export async function fetchAdminCategories(): Promise<Category[]> {
  return authedJson('/api/admin/categories');
}

// ─── Users (real) ────────────────────────────────────────────
export async function fetchAdminUsers(): Promise<PlatformUser[]> {
  return authedJson('/api/admin/users');
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const res = await fetch(`${API}/api/admin/users/${id}`, { method: 'DELETE', headers: authHeaders() });
  return res.ok;
}

export async function setUserBanned(id: string, is_banned: boolean): Promise<boolean> {
  const res = await fetch(`${API}/api/admin/users/${id}/ban`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_banned }),
  });
  return res.ok;
}

// ─── Settings (real, non-secret fields — app_settings table) ───
export async function fetchAppSettings(): Promise<AppSettings> {
  return authedJson('/api/admin/settings');
}

export async function updateAppSettings(partial: Partial<AppSettings>): Promise<boolean> {
  const res = await fetch(`${API}/api/admin/settings`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(partial),
  });
  return res.ok;
}

// ─── SEO (real, per typing_test row) ────────────────────────
export async function fetchAdminSeo(): Promise<SeoTest[]> {
  return authedJson('/api/admin/seo');
}

export async function updateTestSeo(id: string, fields: { seo_title?: string; seo_description?: string }): Promise<boolean> {
  const res = await fetch(`${API}/api/admin/tests/${id}/seo`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  return res.ok;
}

export async function fetchSitemapPreview(): Promise<string> {
  const res = await fetch(`${API}/api/admin/seo/sitemap`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load sitemap preview');
  return res.text();
}

// ─── Activity logs (real — backs Logs/Security/Notifications) ──
export async function fetchAdminLogs(): Promise<ActivityLog[]> {
  return authedJson('/api/admin/logs');
}

// ─── Two-Factor Auth (TOTP, authenticator-app based) ────────
export async function fetch2faStatus(): Promise<{ enabled: boolean }> {
  return authedJson('/api/admin/2fa/status');
}

export async function start2faSetup(): Promise<{ secret: string; qrCode: string }> {
  return authedJson('/api/admin/2fa/setup', { method: 'POST' });
}

export async function verify2faSetup(code: string): Promise<{ enabled: boolean }> {
  return authedJson('/api/admin/2fa/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
}

export async function disable2fa(code: string): Promise<{ enabled: boolean }> {
  return authedJson('/api/admin/2fa/disable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
}

export async function submit2faLogin(pendingToken: string, code: string): Promise<{ accessToken: string }> {
  const res = await fetch(`${API}/auth/login/2fa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pendingToken, code }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Invalid code');
  return res.json();
}

// ─── AI Generator — trigger one slot of the real backend pipeline ──
export type GenerationSlot = 'en' | 'hi_mangal' | 'hi_kruti';

export async function triggerGeneration(slot?: GenerationSlot, count?: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/api/tests/generate`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(slot ? { slot, count } : {}),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Failed to start generation');
  return res.json();
}

export interface GenerationLogEntry {
  id: string;
  run_date: string;
  slot: string;
  topic: string | null;
  status: 'success' | 'failed' | 'skipped_duplicate' | 'skipped_quality';
  test_id: string | null;
  error: string | null;
  attempt_count: number;
  created_at: string;
}

export async function fetchGenerationLog(): Promise<{ logs: GenerationLogEntry[]; summary: Record<string, number> }> {
  return authedJson('/api/admin/generation-log');
}

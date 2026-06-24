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

// ─── AI Generator — direct Gemini fallback if the backend route fails ──
export async function generateAIContent(topic: string, apiKey: string): Promise<{ title: string; content: string; excerpt: string; difficulty_level: string; category: string; seo_title: string; seo_description: string; tags: string[]; keywords: string[] } | null> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are an expert educational content writer. Create a high-quality, plagiarism-free typing practice article about: "${topic}". Write ~1000 words for typing practice. Determine difficulty ('easy', 'medium', 'hard'). Return ONLY valid JSON:\n{"title":"...","content":"...","excerpt":"...","difficulty_level":"medium","category":"...","seo_title":"...","seo_description":"...","tags":[],"keywords":[]}` }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch { return null; }
}

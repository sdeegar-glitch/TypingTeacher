import type { DashboardStats, AnalyticsPoint, PlatformUser, TypingTest, Category, AIGenerationLog, ActivityLog } from './types';

const API = import.meta.env.VITE_API_URL || 'https://typingteacher-2lnd.onrender.com';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Overview (real) ───────────────────────────────────────
export interface OverviewData {
  stats: DashboardStats;
  chartData: AnalyticsPoint[];
  difficultyDistribution: { easy: number; medium: number; hard: number };
}

export async function fetchOverview(): Promise<OverviewData> {
  const res = await fetch(`${API}/api/admin/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load dashboard stats');
  return res.json();
}

// ─── Analytics (still mock — no page-view tracking infra yet) ──
export function generateAnalyticsData(days = 30): AnalyticsPoint[] {
  const data: AnalyticsPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 200) + 50,
    });
  }
  return data;
}

// ─── Tests (real) ────────────────────────────────────────────
export async function fetchAdminTests(): Promise<TypingTest[]> {
  const res = await fetch(`${API}/api/admin/tests`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load tests');
  return res.json();
}

export async function deleteAdminTest(id: string): Promise<boolean> {
  const res = await fetch(`${API}/api/admin/tests/${id}`, { method: 'DELETE', headers: authHeaders() });
  return res.ok;
}

// ─── Categories (real, derived from typing_test.category — read-only) ──
export async function fetchAdminCategories(): Promise<Category[]> {
  const res = await fetch(`${API}/api/admin/categories`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

// ─── Users (real) ────────────────────────────────────────────
export async function fetchAdminUsers(): Promise<PlatformUser[]> {
  const res = await fetch(`${API}/api/admin/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
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

// ─── AI Logs (still mock — no ai_generation_log table yet) ──────
export const MOCK_AI_LOGS: AIGenerationLog[] = [
  { id: '1', title: 'India Economic Growth Analysis', status: 'success', created_at: new Date().toISOString(), tokens_used: 1820, source_url: 'thehindu.com' },
  { id: '2', title: 'Climate Change Editorial', status: 'success', created_at: new Date(Date.now() - 3600000 * 12).toISOString(), tokens_used: 1540 },
  { id: '3', title: 'Tech Innovation Article', status: 'failed', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', title: 'Education Policy Review', status: 'success', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), tokens_used: 1680 },
];

// ─── Activity Logs (still mock — no activity_log table yet) ────
export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  { id: '1', action: 'AI test generated', entity: 'typing_test', user: 'system', ip: '127.0.0.1', timestamp: new Date().toISOString(), status: 'success' },
  { id: '2', action: 'User banned', entity: 'user', user: 'admin@fasttypinglab.com', ip: '103.1.2.3', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'warning' },
  { id: '3', action: 'Test published', entity: 'typing_test', user: 'admin@fasttypinglab.com', ip: '103.1.2.3', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'success' },
  { id: '4', action: 'Failed login attempt', entity: 'auth', user: 'unknown', ip: '192.168.1.1', timestamp: new Date(Date.now() - 10800000).toISOString(), status: 'error' },
  { id: '5', action: 'Settings updated', entity: 'settings', user: 'admin@fasttypinglab.com', ip: '103.1.2.3', timestamp: new Date(Date.now() - 14400000).toISOString(), status: 'success' },
];

// ─── AI Generator (still mock save target — out of scope today) ──
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

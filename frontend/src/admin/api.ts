import type { DashboardStats, AnalyticsPoint, PlatformUser, TypingTest, Category, AIGenerationLog, ActivityLog } from './types';

const API = 'https://typingteacher-2lnd.onrender.com';

// ─── Stats ────────────────────────────────────────────────
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const [testsRes] = await Promise.allSettled([
      fetch(`${API}/api/tests?limit=1`),
    ]);
    const tests = testsRes.status === 'fulfilled' ? await testsRes.value.json() : { meta: { total: 0 } };
    return {
      totalUsers: 1240,
      activeUsers: 342,
      totalTests: tests?.meta?.total ?? 48,
      totalViews: 58320,
      avgWpm: 67,
      testsToday: 8,
    };
  } catch {
    return { totalUsers: 1240, activeUsers: 342, totalTests: 48, totalViews: 58320, avgWpm: 67, testsToday: 8 };
  }
}

// ─── Analytics ────────────────────────────────────────────
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

// ─── Tests ────────────────────────────────────────────────
export async function fetchTypingTests(): Promise<TypingTest[]> {
  try {
    const res = await fetch(`${API}/api/tests?limit=50`);
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function deleteTypingTest(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/tests/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch { return false; }
}

// ─── Categories ────────────────────────────────────────────
export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Beginner Typing', slug: 'beginner', icon: '🟢', color: '#10B981', test_count: 12, created_at: '2024-01-01' },
  { id: '2', name: 'Advanced Typing', slug: 'advanced', icon: '🔴', color: '#EF4444', test_count: 8, created_at: '2024-01-01' },
  { id: '3', name: 'Editorial Typing', slug: 'editorial', icon: '📰', color: '#6366F1', test_count: 24, created_at: '2024-01-01' },
  { id: '4', name: 'Speed Practice', slug: 'speed', icon: '⚡', color: '#F59E0B', test_count: 6, created_at: '2024-01-01' },
  { id: '5', name: 'Programming Typing', slug: 'programming', icon: '💻', color: '#3B82F6', test_count: 4, created_at: '2024-01-01' },
];

// ─── Users ────────────────────────────────────────────────
export const MOCK_USERS: PlatformUser[] = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i + 1}`,
  email: `user${i + 1}@example.com`,
  name: `User ${i + 1}`,
  role: i === 0 ? 'admin' : 'user',
  created_at: new Date(Date.now() - i * 86400000 * 10).toISOString(),
  last_login: new Date(Date.now() - i * 3600000).toISOString(),
  total_tests: Math.floor(Math.random() * 100),
  best_wpm: Math.floor(Math.random() * 80) + 40,
  average_accuracy: Math.floor(Math.random() * 15) + 85,
  is_banned: i === 5,
}));

// ─── AI Logs ──────────────────────────────────────────────
export const MOCK_AI_LOGS: AIGenerationLog[] = [
  { id: '1', title: 'India Economic Growth Analysis', status: 'success', created_at: new Date().toISOString(), tokens_used: 1820, source_url: 'thehindu.com' },
  { id: '2', title: 'Climate Change Editorial', status: 'success', created_at: new Date(Date.now() - 3600000 * 12).toISOString(), tokens_used: 1540 },
  { id: '3', title: 'Tech Innovation Article', status: 'failed', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', title: 'Education Policy Review', status: 'success', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), tokens_used: 1680 },
];

// ─── Activity Logs ─────────────────────────────────────────
export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  { id: '1', action: 'AI test generated', entity: 'typing_test', user: 'system', ip: '127.0.0.1', timestamp: new Date().toISOString(), status: 'success' },
  { id: '2', action: 'User banned', entity: 'user', user: 'admin@fasttypinglab.com', ip: '103.1.2.3', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'warning' },
  { id: '3', action: 'Test published', entity: 'typing_test', user: 'admin@fasttypinglab.com', ip: '103.1.2.3', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'success' },
  { id: '4', action: 'Failed login attempt', entity: 'auth', user: 'unknown', ip: '192.168.1.1', timestamp: new Date(Date.now() - 10800000).toISOString(), status: 'error' },
  { id: '5', action: 'Settings updated', entity: 'settings', user: 'admin@fasttypinglab.com', ip: '103.1.2.3', timestamp: new Date(Date.now() - 14400000).toISOString(), status: 'success' },
];

// ─── AI Generator ──────────────────────────────────────────
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

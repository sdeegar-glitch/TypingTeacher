export const API_URL = import.meta.env.VITE_API_URL || 'https://typingteacher-2lnd.onrender.com';

interface SessionPayload {
  user_id?: string | null;
  test_id?: number | null;
  duration: number;
  gross_wpm: number;
  net_wpm: number;
  errors: number;
  accuracy: number;
  lang?: string;
}

/** POST a completed typing session to the backend. Fire-and-forget — never throws. */
export async function saveSession(payload: SessionPayload): Promise<void> {
  try {
    await fetch(`${API_URL}/test_sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // non-blocking — local localStorage save is the source of truth
  }
}

interface GameScorePayload {
  game: string;
  score: number;
  wpm?: number;
  accuracy?: number;
  duration?: number;
  difficulty?: string;
  xp?: number;
}

/** POST a game result to the backend as a session. Fire-and-forget. */
export async function saveGameScore(payload: GameScorePayload): Promise<void> {
  try {
    await fetch(`${API_URL}/test_sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration: payload.duration || 60,
        gross_wpm: payload.wpm || 0,
        net_wpm: payload.wpm || 0,
        errors: 0,
        accuracy: payload.accuracy || 100,
      }),
    });
  } catch {}
}

/** Fetch the global leaderboard. Returns empty array on error. */
export async function fetchLeaderboard(): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/leaderboard`);
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch { return []; }
}

/** Call the AI coach with recent session data. Returns analysis object. */
export async function analyzeWithAI(sessions: any[]): Promise<any> {
  const res = await fetch(`${API_URL}/api/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessions }),
  });
  if (!res.ok) throw new Error('AI analyze failed');
  return res.json();
}

/* ─── Visitor tracking ──────────────────────────────────────────── */

const VISITOR_ID_KEY = 'ftl_visitor_id';

/** Stable per-browser id used to distinguish unique visitors. */
function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export interface VisitorCount {
  total: number;
  unique: number | null;
}

/** Record one visit and return updated totals. Fire-and-forget — never throws. */
export async function trackVisit(path: string): Promise<VisitorCount> {
  try {
    const res = await fetch(`${API_URL}/api/visitors/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: getVisitorId(),
        path,
        referrer: document.referrer || null,
      }),
    });
    return await res.json();
  } catch {
    return { total: 0, unique: null };
  }
}

/** Fetch current visit totals. Returns zeros on error. */
export async function fetchVisitorCount(): Promise<VisitorCount> {
  try {
    const res = await fetch(`${API_URL}/api/visitors/count`);
    return await res.json();
  } catch {
    return { total: 0, unique: null };
  }
}

/* ─── AI Tutor (Groq) ───────────────────────────────────────────── */

export interface TutorStats {
  avgWpm: number;
  bestWpm: number;
  avgAccuracy: number;
  totalSessions: number;
  trend: 'improving' | 'declining' | 'stable';
  hindiShare: number;
  goal?: string;
}

export interface TutorPlan {
  level: string;
  analysis: string;
  strengths: string[];
  weakAreas: string[];
  targetWpm: number;
  plan: { title: string; detail: string }[];
  dailyRoutine: string[];
  practiceText: string;
  encouragement: string;
  avgWpm?: number;
  bestWpm?: number;
  avgAccuracy?: number;
}

/** Ask the Groq-powered AI tutor for a one-shot personalized improvement plan. */
export async function getTutorPlan(stats: TutorStats): Promise<TutorPlan> {
  const res = await fetch(`${API_URL}/api/ai/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stats }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || 'The AI tutor is busy right now. Please try again in a moment.');
  }
  return res.json();
}

/** Fetch the site-wide mistake-handling mode (admin-configurable). Defaults to 'lenient' on any error. */
export async function fetchMistakeHandlingMode(): Promise<'strict' | 'lenient'> {
  try {
    const res = await fetch(`${API_URL}/api/settings/public`);
    const json = await res.json();
    return json.mistakeHandling === 'strict' ? 'strict' : 'lenient';
  } catch {
    return 'lenient';
  }
}

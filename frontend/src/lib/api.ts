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

/**
 * Syncs Hindi course progress between localStorage (works offline / logged out)
 * and the server (follows a signed-in user across devices).
 *
 * localStorage stays the source the course pages read from. On page load we
 * merge server + local by taking the best of each lesson, write the result
 * back to localStorage, and push anything the server is missing. Every failure
 * is swallowed: a network problem must never block practising.
 */
import { API_URL } from './api';
import type { CourseProgressState, LessonProgress } from '../data/hindiCourseData';

export type CourseKey = 'unicode' | 'kruti';

const STORAGE_KEY: Record<CourseKey, string> = {
  unicode: 'hindi_course_unicode_progress',
  kruti: 'hindi_course_krutidev_progress',
};

// Server write limit is 60/min; a first sync of a big local history is spread
// across visits rather than tripping the limiter.
const MAX_PUSH_PER_SYNC = 40;

interface ServerLesson {
  lesson_id: number;
  stars: number;
  best_wpm: number;
  best_accuracy: number;
  completed_at: string | null;
}

function authToken(): string | null {
  try { return localStorage.getItem('accessToken'); } catch { return null; }
}

function readLocal(course: CourseKey): CourseProgressState {
  const empty: CourseProgressState = { lessons: {}, lastPracticeDate: null, currentStreak: 0, longestStreak: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY[course]);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

function putLesson(token: string, course: CourseKey, l: { lessonId: number; stars: number; wpm: number; accuracy: number }) {
  return fetch(`${API_URL}/api/progress/lessons`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      course,
      lesson_id: l.lessonId,
      stars: Math.max(0, Math.min(5, Math.round(l.stars))),
      wpm: Math.max(0, Math.min(400, Math.round(l.wpm))),
      accuracy: Math.max(0, Math.min(100, l.accuracy)),
      passed: true,
    }),
  });
}

/** Record one passed lesson on the server. Fire-and-forget. */
export async function pushLessonResult(
  course: CourseKey,
  entry: { lessonId: number; stars: number; wpm: number; accuracy: number },
): Promise<void> {
  const token = authToken();
  if (!token) return;
  try { await putLesson(token, course, entry); } catch { /* local copy is still saved */ }
}

/**
 * Merge server + local progress for a course. Returns the merged state, or
 * null when logged out / offline (callers keep using the local state).
 */
export async function syncCourseProgress(course: CourseKey): Promise<CourseProgressState | null> {
  const token = authToken();
  if (!token) return null;

  let server: ServerLesson[];
  try {
    const res = await fetch(`${API_URL}/api/progress/lessons?course=${course}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    server = await res.json();
    if (!Array.isArray(server)) return null;
  } catch {
    return null;
  }

  const local = readLocal(course);
  const serverById = new Map(server.map(s => [s.lesson_id, s]));
  const lessons: Record<number, LessonProgress> = { ...local.lessons };

  for (const s of server) {
    const l = lessons[s.lesson_id];
    lessons[s.lesson_id] = {
      lessonId: s.lesson_id,
      stars: Math.max(l?.stars ?? 0, s.stars),
      bestWpm: Math.max(l?.bestWpm ?? 0, s.best_wpm),
      bestAccuracy: Math.max(l?.bestAccuracy ?? 0, s.best_accuracy),
      completed: !!l?.completed || !!s.completed_at,
      completedAt: l?.completedAt || s.completed_at || '',
    };
  }

  const merged: CourseProgressState = { ...local, lessons };
  try { localStorage.setItem(STORAGE_KEY[course], JSON.stringify(merged)); } catch { /* quota */ }

  // Push lessons the server lacks or has a worse result for.
  const toPush = Object.values(local.lessons).filter(l => {
    if (!l.completed) return false;
    const s = serverById.get(l.lessonId);
    return !s || l.stars > s.stars || l.bestWpm > s.best_wpm || l.bestAccuracy > s.best_accuracy;
  }).slice(0, MAX_PUSH_PER_SYNC);
  for (const l of toPush) {
    try {
      const res = await putLesson(token, course, { lessonId: l.lessonId, stars: l.stars, wpm: l.bestWpm, accuracy: l.bestAccuracy });
      if (res.status === 429) break;
    } catch { break; }
  }

  return merged;
}

/**
 * Hindi Typing Course — Kruti Dev 010 (Remington Gail) Keyboard
 *
 * Mirrors hindiCourseData.ts exactly: same 200 lessons, same 12 stages, same
 * practice text, same gamification. Only the keyboard mapping differs — and
 * unlike INSCRIPT, Kruti Dev isn't a 1:1 Unicode layout, so `content` here is
 * the real, algorithmically-derived Kruti Dev keystroke sequence (see
 * krutiDevConverter.ts), while `displayHindi` keeps the original Unicode text
 * as a readable reference.
 */

import {
  LESSONS as UNICODE_LESSONS,
  STAGES,
  LEVELS,
  levelForXp,
  BADGES,
  type CourseLesson,
  type StageMeta,
  type BadgeDef,
} from './hindiCourseData';
import { unicodeToKrutiDevKeys } from './krutiDevConverter';

export type { StageMeta, BadgeDef };
export { STAGES, LEVELS, levelForXp, BADGES };

export interface KrutiDevLesson extends CourseLesson {
  /** Original Unicode Hindi text — shown as a read-only reference. */
  displayHindi: string;
}

// hindiCourseData's stage 1–3 titles/descriptions name specific INSCRIPT keys
// (e.g. "Shift+K=ख", "Key e.") — wrong for this course, so they're regenerated
// below from the real Kruti Dev keys instead of reused verbatim.

const MATRA_LABELS: Record<string, string> = {
  'ा': 'aa-matra — the most frequent matra in Hindi',
  'ि': 'short i-matra',
  'ी': 'long ii-matra',
  'ु': 'short u-matra',
  'ू': 'long uu-matra',
  'े': 'e-matra',
  'ै': 'ai-matra',
  'ो': 'o-matra',
  'ौ': 'au-matra',
  'ं': 'anusvara (nasal sound)',
  'ः': 'visarga (aspirated ending)',
  'ँ': 'chandrabindu (nasalised vowel sound)',
  'ृ': 'vocalic r — rare but appears in formal Hindi',
  '्': 'halant — joins consonants into conjuncts',
};

function keyIntroTitle(pairs: Array<[string, string]>) {
  const keys = pairs.map(([k]) => k);
  return {
    title: `Key${keys.length > 1 ? 's' : ''}: ${keys.join(' and ')}`,
    titleHindi: `कुंजी: ${keys.join(' और ')}`,
    description: pairs.map(([k, c]) => `${k} = ${c}`).join(', ') + `. New character${pairs.length > 1 ? 's' : ''} introduced in this lesson.`,
  };
}

// ════════════════════════════════════════════════════════════════
// Build the 200 lessons by converting hindiCourseData's content
// ════════════════════════════════════════════════════════════════
function buildLessons(): KrutiDevLesson[] {
  let cumulativeMap: Record<string, string> = {};

  return UNICODE_LESSONS.map(lesson => {
    const displayHindi = lesson.content;
    const content = unicodeToKrutiDevKeys(displayHindi);

    let title = lesson.title;
    let titleHindi = lesson.titleHindi;
    let description = lesson.description;

    if (lesson.stage <= 2) {
      // Stage 1–2: cumulative across lessons, same teaching order as INSCRIPT.
      const pairs: Array<[string, string]> = lesson.newKeys.map(char => [unicodeToKrutiDevKeys(char), char]);
      pairs.forEach(([k, c]) => { cumulativeMap[k] = c; });
      if (pairs.length > 0) ({ title, titleHindi, description } = keyIntroTitle(pairs));
    } else if (lesson.stage === 3) {
      // Stage 3: the matra set is shared/static across all matra lessons.
      if (Object.keys(lesson.keymapHint).length > 0) {
        Object.values(lesson.keymapHint).forEach(char => {
          cumulativeMap[unicodeToKrutiDevKeys(char)] = char;
        });
      }
      // The matra each lesson covers is embedded in its (INSCRIPT-derived) title,
      // e.g. "Matra: ा (aa)" — pull it out rather than relying on newKeys (always
      // empty for stage 3, since the matra set is shared/static across lessons).
      const introducedChar = Object.keys(MATRA_LABELS).find(m => lesson.title.includes(m));
      if (introducedChar && MATRA_LABELS[introducedChar]) {
        const kdKey = unicodeToKrutiDevKeys(introducedChar);
        description = `${MATRA_LABELS[introducedChar]}. Key${kdKey.length > 1 ? 's' : ''}: ${kdKey}.`;
      }
    }

    // Pure-review lessons (no newKeys to trigger the override above) whose
    // original description still names INSCRIPT specifically.
    if (lesson.id === 30) {
      description = 'Every key learned in this course, upper and lower case. Type full words and short phrases.';
    }

    return {
      ...lesson,
      title,
      titleHindi,
      description,
      displayHindi,
      content,
      keymapHint: lesson.stage <= 3 ? { ...cumulativeMap } : {},
    };
  });
}

export const LESSONS: KrutiDevLesson[] = buildLessons();
export const TOTAL_LESSONS = LESSONS.length;

/** Single-keystroke base map for the persistent virtual keyboard reference. */
export const KRUTI_DEV_FULL_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const seen = new Set<string>();
  for (const lesson of LESSONS) {
    if (lesson.stage > 2) break;
    for (const char of lesson.newKeys) {
      if (seen.has(char)) continue;
      seen.add(char);
      const keys = unicodeToKrutiDevKeys(char);
      if (keys.length === 1) map[keys] = char;
    }
  }
  return map;
})();

// ════════════════════════════════════════════════════════════════
// Progress, XP, streak & badge persistence (independent of the
// Unicode course's progress — separate localStorage key)
// ════════════════════════════════════════════════════════════════
const STORAGE_KEY = 'hindi_course_krutidev_progress';

export interface LessonProgress {
  lessonId: number;
  stars: number;
  bestWpm: number;
  bestAccuracy: number;
  completed: boolean;
  completedAt: string;
}

export interface CourseProgressState {
  lessons: Record<number, LessonProgress>;
  lastPracticeDate: string | null;
  currentStreak: number;
  longestStreak: number;
}

function emptyState(): CourseProgressState {
  return { lessons: {}, lastPracticeDate: null, currentStreak: 0, longestStreak: 0 };
}

export function loadCourseProgress(): CourseProgressState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(state: CourseProgressState): CourseProgressState {
  const today = todayStr();
  if (state.lastPracticeDate === today) return state;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const currentStreak = state.lastPracticeDate === yesterday ? state.currentStreak + 1 : 1;
  return { ...state, lastPracticeDate: today, currentStreak, longestStreak: Math.max(state.longestStreak, currentStreak) };
}

export function saveCourseProgress(entry: { lessonId: number; stars: number; bestWpm: number; bestAccuracy: number }): CourseProgressState {
  const state = loadCourseProgress();
  const existing = state.lessons[entry.lessonId];
  const next: CourseProgressState = {
    ...updateStreak(state),
    lessons: {
      ...state.lessons,
      [entry.lessonId]: {
        lessonId: entry.lessonId,
        stars: Math.max(existing?.stars || 0, entry.stars),
        bestWpm: Math.max(existing?.bestWpm || 0, entry.bestWpm),
        bestAccuracy: Math.max(existing?.bestAccuracy || 0, entry.bestAccuracy),
        completed: true,
        completedAt: new Date().toISOString(),
      },
    },
  };
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function isLessonUnlocked(lessonId: number, progress?: CourseProgressState): boolean {
  if (lessonId <= 1) return true;
  const state = progress || loadCourseProgress();
  return !!state.lessons[lessonId - 1]?.completed;
}

export function totalXp(progress?: CourseProgressState): number {
  const state = progress || loadCourseProgress();
  return Object.keys(state.lessons)
    .filter(id => state.lessons[Number(id)].completed)
    .reduce((sum, id) => {
      const lesson = LESSONS.find(l => l.id === Number(id));
      return sum + (lesson?.xp || 0);
    }, 0);
}

export function earnedBadges(progress?: CourseProgressState): BadgeDef[] {
  const state = progress || loadCourseProgress();
  const completedIds = new Set(Object.keys(state.lessons).filter(id => state.lessons[Number(id)].completed).map(Number));
  const bestWpm = Math.max(0, ...Object.values(state.lessons).map(l => l.bestWpm));
  const bestAccuracy = Math.max(0, ...Object.values(state.lessons).map(l => l.bestAccuracy));
  return BADGES.filter(b => b.check({ completedIds, streak: state.currentStreak, bestWpm, bestAccuracy }));
}

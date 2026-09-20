import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncCourseProgress, pushLessonResult } from './courseSync';

const KEY = 'hindi_course_unicode_progress';

const lesson = (id: number, stars: number, wpm: number, acc: number) => ({
  lessonId: id, stars, bestWpm: wpm, bestAccuracy: acc, completed: true, completedAt: '2026-01-01T00:00:00.000Z',
});

describe('courseSync', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('does nothing and returns null when logged out', async () => {
    expect(await syncCourseProgress('unicode')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null (keeps local state) when the server errors', async () => {
    localStorage.setItem('accessToken', 't');
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    expect(await syncCourseProgress('unicode')).toBeNull();
  });

  it('merges by best-of and pushes lessons the server lacks or has worse', async () => {
    localStorage.setItem('accessToken', 't');
    localStorage.setItem(KEY, JSON.stringify({
      lessons: { 1: lesson(1, 2, 20, 90), 2: lesson(2, 3, 30, 95) },
      lastPracticeDate: '2026-09-20', currentStreak: 3, longestStreak: 5,
    }));
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => {
      if (!init?.method) {
        // GET: server has lesson 1 with a BETTER result, and lesson 7 the device lacks
        return {
          ok: true, status: 200,
          json: async () => [
            { lesson_id: 1, stars: 4, best_wpm: 25, best_accuracy: 97, completed_at: '2026-02-02T00:00:00Z' },
            { lesson_id: 7, stars: 1, best_wpm: 12, best_accuracy: 91, completed_at: '2026-02-03T00:00:00Z' },
          ],
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });

    const merged = await syncCourseProgress('unicode');
    expect(merged?.lessons[1]).toMatchObject({ stars: 4, bestWpm: 25, bestAccuracy: 97, completed: true });
    expect(merged?.lessons[7]).toMatchObject({ stars: 1, completed: true }); // pulled from server
    expect(merged?.lessons[2].stars).toBe(3);                              // local-only kept
    expect(merged?.currentStreak).toBe(3);                                 // streak untouched
    expect(JSON.parse(localStorage.getItem(KEY)!).lessons[7]).toBeTruthy(); // persisted

    // Only lesson 2 (missing on server) needs pushing; lesson 1 is worse locally.
    const puts = fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT');
    expect(puts).toHaveLength(1);
    expect(JSON.parse(puts[0][1].body)).toMatchObject({ course: 'unicode', lesson_id: 2, stars: 3, wpm: 30 });
  });

  it('pushLessonResult sends the auth token and clamps values', async () => {
    localStorage.setItem('accessToken', 'tok');
    fetchMock.mockResolvedValue({ ok: true });
    await pushLessonResult('kruti', { lessonId: 5, stars: 9, wpm: 55.6, accuracy: 120 });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(JSON.parse(init.body)).toMatchObject({ course: 'kruti', lesson_id: 5, stars: 5, wpm: 56, accuracy: 100 });
  });

  it('pushLessonResult never throws on network failure', async () => {
    localStorage.setItem('accessToken', 'tok');
    fetchMock.mockRejectedValue(new Error('offline'));
    await expect(pushLessonResult('unicode', { lessonId: 1, stars: 1, wpm: 10, accuracy: 90 })).resolves.toBeUndefined();
  });
});

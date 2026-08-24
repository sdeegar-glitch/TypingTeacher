// Offline test bundle + helpers. In the Tauri desktop app (and as a resilience
// fallback on the web) these bundled tests let practice work with no internet.
import offlineData from '../data/offlineTests.json';

const TESTS = offlineData as any[];

/** True when running inside the Tauri desktop shell. */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Filter the bundled tests the same way the /latest endpoint does. */
export function offlineList(query: Record<string, string> = {}): any[] {
  return TESTS.filter(t => {
    if (query.language && t.language !== query.language) return false;
    if (query.keyboard_layout && t.keyboard_layout !== query.keyboard_layout) return false;
    return true;
  });
}

/** Look a bundled test up by slug or id. */
export function offlineBySlug(slug: string): any | null {
  return TESTS.find(t => t.slug === slug || String(t.id) === String(slug)) || null;
}

export const OFFLINE_TEST_COUNT = TESTS.length;

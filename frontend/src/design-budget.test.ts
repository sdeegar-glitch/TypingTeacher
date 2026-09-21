import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Guardrails for the compact layout (see the site-wide space plan): oversized
 * display type and full-screen page wrappers must be a deliberate, listed choice,
 * not something that creeps back in page by page.
 */
const PAGES = path.resolve(__dirname, 'pages');

// Pages that legitimately need big type (live counters, result emoji, game screens)
// or a full-height layout (fixed runners, centred auth/loading screens).
const BIG_TYPE_OK = new Set([
  'CpsTestPage.tsx', 'SpacebarCounterPage.tsx', 'ExamPage.tsx', 'SpeedRacerPage.tsx',
  'HindiTypingJunglePage.tsx', 'LearningInterfacePage.tsx', 'BlogPostPage.tsx',
  'HomePage.tsx', 'MultiplayerPage.tsx', 'LeaderboardPage.tsx', 'TypingTestPage.tsx',
  'WordRainPage.tsx', 'ZombieTypingPage.tsx', 'OgMakerPage.tsx',
]);
const FULL_HEIGHT_OK = new Set([
  'ExamPage.tsx', 'AuthPage.tsx', 'TestConfigPage.tsx', 'TypingReportPage.tsx',
  'TypingTestPage.tsx', 'ProfilePage.tsx', 'OgMakerPage.tsx', 'WordRainPage.tsx',
  'ZombieTypingPage.tsx', 'LearningInterfacePage.tsx',
]);

const files = fs.readdirSync(PAGES).filter(f => f.endsWith('.tsx') && !f.includes('.test.'));
const read = (f: string) => fs.readFileSync(path.join(PAGES, f), 'utf8');

describe('layout budget', () => {
  it('no text-6xl or larger outside the allow-list', () => {
    const bad = files.filter(f => !BIG_TYPE_OK.has(f) && /\btext-(6xl|7xl|8xl|9xl)\b/.test(read(f)));
    expect(bad).toEqual([]);
  });

  it('page roots do not force min-h-screen outside the allow-list', () => {
    const bad = files.filter(f => !FULL_HEIGHT_OK.has(f) && /\bmin-h-screen\b/.test(read(f)));
    expect(bad).toEqual([]);
  });

  it('page-level headings use the standard scale (no text-4xl+ h1)', () => {
    const bad = files.filter(f => !BIG_TYPE_OK.has(f) && /<h1[^>]*className="[^"]*\btext-(4xl|5xl|6xl)\b/.test(read(f)));
    expect(bad).toEqual([]);
  });
});

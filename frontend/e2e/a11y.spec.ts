import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Real accessibility auditing with axe-core, against the production build.
 *
 * This replaces guesswork: a hand-rolled regex scan for "buttons without a
 * label" flagged 24 elements, nearly all of which were false positives whose
 * label sits inside a JSX expression. axe evaluates the rendered accessibility
 * tree, which is what a screen reader actually consumes.
 *
 * Scoped to serious and critical violations of WCAG 2.1 A/AA. Minor contrast
 * and best-practice noise is deliberately excluded — a suite that always fails
 * gets ignored, and an ignored suite protects nothing.
 */

const PAGES = [
  '/',
  '/refer',
  '/live-test',
  '/typing-drills',
  '/kruti-dev-to-unicode',
  '/wpm-calculator',
  '/typing-certificates',
  '/cpct-typing-test',
  '/hindi-typing-test',
  '/tools',
];

for (const route of PAGES) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toBeVisible();

    // Let entrance animations finish before sampling colours. Framer Motion
    // fades content in from opacity 0 and the theme tokens carry a 0.25s
    // transition; measuring mid-animation reports blended values and produces
    // contrast "failures" that do not exist once the page settles.
    await page.waitForFunction(
      () => document.getAnimations().every(a => a.playState !== 'running'),
      null,
      { timeout: 5000 }
    ).catch(() => { /* long-running decorative loops (blobs) never settle */ });
    await page.waitForTimeout(400);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const serious = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    );

    // Print a readable summary before asserting, so a CI failure says what to fix.
    if (serious.length) {
      console.log(`\n${route}:`);
      for (const v of serious) {
        console.log(`  [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node(s))`);
        for (const n of v.nodes.slice(0, 3)) console.log(`      ${n.target.join(' ')}`);
      }
    }

    expect(serious.map(v => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

import { test, expect } from '@playwright/test';

/**
 * Regression guard for the site-wide compact-layout pass (oversized headings,
 * near-empty first screens, and tall list rows were the reported problems —
 * see the design-budget unit test for the class-level checks; this is the
 * rendered-pixel check, against the real production build).
 *
 * A small representative set of routes, not the whole site: one of each page
 * shape that was touched (hub/list page, homepage, a tool page, a Hindi page,
 * a dashboard-style page, a dark exam screen). Runs at a fixed 1280x720 —
 * independent of whichever project (desktop/mobile) invokes it, so the
 * numeric budgets below stay meaningful.
 */
test.use({ viewport: { width: 1280, height: 720 } });

const PAGES = [
  '/',
  '/tests/',
  '/tools/',
  '/games/',
  '/blog/',
  '/learn/',
  '/learn-hindi-typing/',
  '/competitive-exam-typing/',
  '/wpm-calculator/',
  '/exam/ssc-chsl',
];

// The homepage hero is the one deliberate exception to the 30px h1 budget
// (see design-budget.test.ts's BIG_TYPE_OK) — everything else uses the
// standard PageHeader-style scale.
const H1_MAX: Record<string, number> = { '/': 48 };

test.describe('layout budget (rendered)', () => {
  for (const path of PAGES) {
    test(`${path} — h1 size and first-screen content`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(300); // motion/framer entrance animations settle

      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      const h1Size = await h1.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
      expect(h1Size, `${path}: h1 font-size`).toBeLessThanOrEqual(H1_MAX[path] ?? 30);

      const h1Top = await h1.evaluate(el => el.getBoundingClientRect().top);
      expect(h1Top, `${path}: h1 top offset`).toBeLessThan(300);
    });
  }

  test('/tests/ — English track list rows stay compact', async ({ page }) => {
    await page.goto('/tests/');
    await page.getByRole('button', { name: /English Typing/ }).click();
    await page.waitForTimeout(800);

    const rows = page.locator('a[href^="/tests/config/"]');
    const count = await rows.count();
    test.skip(count === 0, 'no English tests available right now');

    for (let i = 0; i < Math.min(count, 6); i++) {
      const h = await rows.nth(i).evaluate(el => el.getBoundingClientRect().height);
      expect(h, `row ${i} height`).toBeLessThanOrEqual(72);
    }
  });
});

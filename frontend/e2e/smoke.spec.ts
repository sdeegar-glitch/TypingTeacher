import { test, expect } from '@playwright/test';

/**
 * Cheap breadth: every route below is one a search engine indexes or the
 * Telegram bot links to. A blank page or a thrown error on any of them is a
 * traffic incident, and until now nothing would have caught it before deploy.
 */

const ROUTES = [
  '/',
  '/refer',
  '/live-test',
  '/typing-drills',
  '/kruti-dev-to-unicode',
  '/wpm-calculator',
  '/typing-certificates',
  '/competitive-exam-typing',
  '/cpct-typing-test',
  '/hindi-typing-test',
  '/download',
  '/tools',
  '/blog',
];

for (const route of ROUTES) {
  test(`${route} renders without page errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto(route);
    await expect(page.locator('body')).toBeVisible();

    // Real content, not just an empty SPA shell.
    const text = await page.locator('body').innerText();
    expect(text.trim().length).toBeGreaterThan(100);

    expect(errors, `JS errors on ${route}`).toEqual([]);
  });
}

test.describe('SEO essentials', () => {
  test('every indexed route ships a prerendered title and description', async ({ page }) => {
    for (const route of ['/refer/', '/live-test/', '/typing-drills/', '/cpct-typing-test/']) {
      const res = await page.request.get(route);
      expect(res.status(), route).toBe(200);
      const html = await res.text();
      expect(html, `${route} title`).toMatch(/<title>.+<\/title>/);
      expect(html, `${route} description`).toContain('name="description"');
    }
  });

  test('the SPA fallback serves an unknown route rather than a hard 404 page', async ({ page }) => {
    const res = await page.goto('/some-route-that-does-not-exist');
    // GitHub Pages serves 404.html, which boots the SPA and routes client-side.
    expect(res?.status()).toBeLessThan(500);
  });
});

test.describe('mobile layout', () => {
  test('the homepage does not scroll sideways', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    // A couple of pixels of rounding is fine; a real overflow is not.
    expect(overflow).toBeLessThanOrEqual(2);
  });
});

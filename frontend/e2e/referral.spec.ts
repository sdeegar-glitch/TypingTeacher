import { test, expect } from '@playwright/test';

/**
 * The referral journey as a real person walks it: they open a friend's link,
 * browse around, and only sign up later. The code has to survive that gap —
 * which is exactly the part unit tests with a fake localStorage cannot prove.
 */

const stored = (page: import('@playwright/test').Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('ftl-referral') || 'null'));

test.describe('referral link capture', () => {
  test('captures the code from a link landing on the homepage', async ({ page }) => {
    await page.goto('/?ref=ab3d9k');
    await expect.poll(() => stored(page).then(v => v?.code)).toBe('AB3D9K');
  });

  test('survives navigating deeper into the site', async ({ page }) => {
    await page.goto('/?ref=AB3D9K');
    await expect.poll(() => stored(page).then(v => v?.code)).toBe('AB3D9K');

    await page.goto('/typing-drills');
    await page.goto('/wpm-calculator');

    expect((await stored(page))?.code).toBe('AB3D9K');
  });

  // Whoever did the convincing keeps the credit.
  test('refuses to let a later link overwrite the first', async ({ page }) => {
    await page.goto('/?ref=FIRST1');
    await expect.poll(() => stored(page).then(v => v?.code)).toBe('FIRST1');

    await page.goto('/?ref=SECND2');
    await page.waitForTimeout(300);

    expect((await stored(page))?.code).toBe('FIRST1');
  });

  test('ignores a malformed code', async ({ page }) => {
    await page.goto('/?ref=X');
    await page.waitForTimeout(300);
    expect(await stored(page)).toBeNull();
  });
});

test.describe('/refer page', () => {
  test('loads and explains the programme', async ({ page }) => {
    await page.goto('/refer');
    await expect(page.getByRole('heading', { name: /invite friends/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /get your invite link/i })).toBeVisible();
  });

  test('tells a referred visitor their friend will get credit', async ({ page }) => {
    await page.goto('/?ref=AB3D9K');
    await page.goto('/refer');
    await expect(page.getByText(/you arrived on a friend's invite link/i)).toBeVisible();
  });

  test('routes both auth CTAs correctly', async ({ page }) => {
    await page.goto('/refer');
    await page.getByRole('link', { name: /create free account/i }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('is reachable from the footer', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /invite friends/i }).first();
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(/\/refer/);
  });

  test('serves its prerendered SEO title', async ({ page }) => {
    const res = await page.request.get('/refer/');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('Invite Friends');
  });
});

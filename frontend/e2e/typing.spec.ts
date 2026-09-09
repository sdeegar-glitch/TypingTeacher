import { test, expect, type Page } from '@playwright/test';

/**
 * The typing engine, driven through a real keyboard in a real browser.
 *
 * This is the site's core interaction and it had no automated coverage at all
 * before this file. The drills page is used deliberately: it generates its text
 * client-side, so these tests exercise the engine without depending on the
 * backend being awake.
 *
 * Keystrokes are sent one at a time with a small delay. Bulk-typing an entire
 * string produces bogus accuracy readings that are an artefact of synthetic
 * input, not a real defect — a person cannot type 200 characters in one tick.
 */

async function typeText(page: Page, text: string) {
  for (const ch of text) {
    await page.keyboard.press(ch === ' ' ? 'Space' : ch);
    await page.waitForTimeout(15);
  }
}

/** The passage currently on screen, read back from the rendered character spans. */
async function visibleText(page: Page): Promise<string> {
  return page.locator('.font-mono.text-lg, .font-mono.text-xl').first().innerText();
}

test.describe('typing drills engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/typing-drills');
    await expect(page.getByText(/start typing/i)).toBeVisible();
  });

  test('scores correct keystrokes as fully accurate', async ({ page }) => {
    const text = (await visibleText(page)).replace(/\s+/g, ' ').trim();
    const chunk = text.slice(0, 15);

    await typeText(page, chunk);

    // Accuracy is rendered as "100%" beside the live WPM counter.
    await expect(page.getByText('100%')).toBeVisible();
  });

  test('starts the timer only on the first keystroke', async ({ page }) => {
    await expect(page.getByText(/timer begins on your first keystroke/i)).toBeVisible();

    const text = (await visibleText(page)).replace(/\s+/g, ' ').trim();
    await typeText(page, text.slice(0, 3));

    await expect(page.getByText(/timer begins on your first keystroke/i)).not.toBeVisible();
  });

  test('counts a wrong keystroke against accuracy', async ({ page }) => {
    const text = (await visibleText(page)).replace(/\s+/g, ' ').trim();
    // Pick a character guaranteed to be wrong for the first position.
    const wrong = text[0] === 'z' ? 'q' : 'z';

    await page.keyboard.press(wrong);
    await page.waitForTimeout(200);

    await expect(page.getByText('100%')).not.toBeVisible();
  });

  test('reports a live WPM figure while typing', async ({ page }) => {
    const text = (await visibleText(page)).replace(/\s+/g, ' ').trim();
    await typeText(page, text.slice(0, 12));

    await expect(page.getByText(/\d+ WPM/)).toBeVisible();
  });

  test('restarts on Tab', async ({ page }) => {
    const text = (await visibleText(page)).replace(/\s+/g, ' ').trim();
    await typeText(page, text.slice(0, 8));
    await expect(page.getByText(/timer begins on your first keystroke/i)).not.toBeVisible();

    await page.keyboard.press('Tab');

    await expect(page.getByText(/timer begins on your first keystroke/i)).toBeVisible();
  });
});

test.describe('drill modes', () => {
  test('offers the number, punctuation and custom drills', async ({ page }) => {
    await page.goto('/typing-drills');
    for (const label of [/number/i, /punctuation/i, /custom/i]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
  });

  test('accepts weak keys handed over from a test result link', async ({ page }) => {
    await page.goto('/typing-drills?keys=a,e,t');
    const text = (await visibleText(page)).replace(/\s+/g, ' ').trim();
    expect(text.length).toBeGreaterThan(10);
  });
});

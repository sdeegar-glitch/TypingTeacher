import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  captureReferralFromUrl,
  getStoredReferral,
  clearStoredReferral,
  currentTier,
  nextTier,
  referralUrl,
  shareMessage,
  REFERRAL_TIERS,
} from './referral';

beforeEach(() => localStorage.clear());

describe('captureReferralFromUrl', () => {
  it('stores a valid code from the query string', () => {
    captureReferralFromUrl('?ref=AB3D9K');
    expect(getStoredReferral()).toBe('AB3D9K');
  });

  it('normalises case, because links get retyped by hand', () => {
    captureReferralFromUrl('?ref=ab3d9k');
    expect(getStoredReferral()).toBe('AB3D9K');
  });

  it('strips spaces and punctuation picked up in transit', () => {
    captureReferralFromUrl('?ref=a b-3d9k!');
    expect(getStoredReferral()).toBe('AB3D9K');
  });

  it('ignores a URL with no ref param', () => {
    captureReferralFromUrl('?utm_source=telegram');
    expect(getStoredReferral()).toBeNull();
  });

  it('rejects a code too short to be real', () => {
    captureReferralFromUrl('?ref=AB');
    expect(getStoredReferral()).toBeNull();
  });

  it('truncates an overlong code rather than storing junk', () => {
    captureReferralFromUrl('?ref=' + 'X'.repeat(50));
    expect(getStoredReferral()).toHaveLength(12);
  });

  // The rule that decides who gets paid: whoever convinced the user, not
  // whoever sent the most recent link before they happened to sign up.
  it('keeps the first code when a second link is opened later', () => {
    captureReferralFromUrl('?ref=FIRST1');
    captureReferralFromUrl('?ref=SECND2');
    expect(getStoredReferral()).toBe('FIRST1');
  });

  it('does not throw when localStorage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => captureReferralFromUrl('?ref=AB3D9K')).not.toThrow();
    spy.mockRestore();
  });
});

describe('getStoredReferral expiry', () => {
  afterEach(() => vi.useRealTimers());

  const store = (code: string, ageDays: number) =>
    localStorage.setItem(
      'ftl-referral',
      JSON.stringify({ code, at: Date.now() - ageDays * 24 * 3600 * 1000 })
    );

  it('honours a code inside the 30-day window', () => {
    store('FRESH1', 29);
    expect(getStoredReferral()).toBe('FRESH1');
  });

  it('drops a code past the window', () => {
    store('OLDCOD', 31);
    expect(getStoredReferral()).toBeNull();
  });

  it('clears the expired entry rather than re-reading it every load', () => {
    store('OLDCOD', 31);
    getStoredReferral();
    expect(localStorage.getItem('ftl-referral')).toBeNull();
  });

  it('survives corrupt storage written by an older build', () => {
    localStorage.setItem('ftl-referral', 'not json at all');
    expect(getStoredReferral()).toBeNull();
  });

  it('rejects an entry with a missing timestamp', () => {
    localStorage.setItem('ftl-referral', JSON.stringify({ code: 'NOTIME' }));
    expect(getStoredReferral()).toBeNull();
  });
});

describe('clearStoredReferral', () => {
  it('removes a redeemed code', () => {
    captureReferralFromUrl('?ref=AB3D9K');
    clearStoredReferral();
    expect(getStoredReferral()).toBeNull();
  });

  it('frees the slot so a future invite can be captured', () => {
    captureReferralFromUrl('?ref=AB3D9K');
    clearStoredReferral();
    captureReferralFromUrl('?ref=NEWCOD');
    expect(getStoredReferral()).toBe('NEWCOD');
  });
});

describe('tiers', () => {
  it('awards nothing before the first qualified referral', () => {
    expect(currentTier(0)).toBeNull();
  });

  it.each([
    [1, 'Supporter'],
    [2, 'Supporter'],
    [3, 'Advocate'],
    [4, 'Advocate'],
    [5, 'Ambassador'],
    [9, 'Ambassador'],
    [10, 'Legend'],
  ])('awards %i referrals the %s tier', (count, name) => {
    expect(currentTier(count)?.name).toBe(name);
  });

  it('does not overflow past the top tier', () => {
    expect(currentTier(9999)?.name).toBe('Legend');
  });

  it('points at the next tier to aim for', () => {
    expect(nextTier(0)?.name).toBe('Supporter');
    expect(nextTier(3)?.name).toBe('Ambassador');
  });

  it('has no next tier once every tier is earned', () => {
    expect(nextTier(10)).toBeNull();
  });

  it('defines tiers in ascending order, which the progress bar assumes', () => {
    const counts = REFERRAL_TIERS.map(t => t.count);
    expect([...counts].sort((a, b) => a - b)).toEqual(counts);
  });
});

describe('share helpers', () => {
  it('builds an absolute invite URL', () => {
    expect(referralUrl('AB3D9K')).toBe('https://fasttypinglab.com/?ref=AB3D9K');
  });

  it('embeds the working link in the share message', () => {
    expect(shareMessage('AB3D9K')).toContain('https://fasttypinglab.com/?ref=AB3D9K');
  });
});

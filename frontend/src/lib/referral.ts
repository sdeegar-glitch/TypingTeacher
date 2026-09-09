import { API_URL } from './api';

/**
 * Referral programme (client side).
 *
 * The invite code arrives as `?ref=CODE` on any page, but signup usually happens
 * several clicks later — someone follows a friend's link, takes a test, and only
 * then creates an account. So the code is parked in localStorage and replayed at
 * signup, rather than being read straight off the signup URL.
 */

const STORAGE_KEY = 'ftl-referral';
const CODE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const SITE_URL = 'https://fasttypinglab.com';

export interface ReferralInvite {
  name: string;
  joined_at: string;
  qualified: boolean;
}

export interface ReferralStats {
  code: string;
  total: number;
  qualified: number;
  invites: ReferralInvite[];
}

/**
 * Rewards are recognition, not money — this site runs at zero cost and a reward
 * that can't be paid for is a promise that gets broken. Each tier below is
 * something actually rendered in the product today.
 */
export interface ReferralTier {
  count: number;
  name: string;
  emoji: string;
  perk: string;
}

export const REFERRAL_TIERS: ReferralTier[] = [
  { count: 1, name: 'Supporter', emoji: '🌱', perk: 'Supporter badge on your dashboard and profile.' },
  { count: 3, name: 'Advocate', emoji: '⭐', perk: 'Advocate badge, plus your name in the monthly Telegram shout-out.' },
  { count: 5, name: 'Ambassador', emoji: '🏅', perk: 'Ambassador badge — the top tier shown publicly on your profile.' },
  { count: 10, name: 'Legend', emoji: '👑', perk: 'Legend badge and a pinned feature in the FastTypingLab Telegram group.' },
];

/** Highest tier earned at this many qualified referrals, or null below the first. */
export function currentTier(qualified: number): ReferralTier | null {
  let earned: ReferralTier | null = null;
  for (const tier of REFERRAL_TIERS) {
    if (qualified >= tier.count) earned = tier;
  }
  return earned;
}

/** The next tier to aim for, or null once every tier is earned. */
export function nextTier(qualified: number): ReferralTier | null {
  return REFERRAL_TIERS.find(t => qualified < t.count) || null;
}

function sanitise(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return cleaned.length >= 4 ? cleaned : null;
}

/**
 * Read `?ref=` off the current URL and remember it. Called once on app load.
 *
 * First code wins: if someone already has a pending referral, a later link does
 * not overwrite it. Otherwise the last person to send a link before signup would
 * steal the credit from whoever actually did the convincing.
 */
export function captureReferralFromUrl(search: string): void {
  try {
    const raw = new URLSearchParams(search).get('ref');
    if (!raw) return;
    const code = sanitise(raw);
    if (!code) return;
    if (getStoredReferral()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, at: Date.now() }));
  } catch {
    /* private browsing / storage disabled — referrals are a nice-to-have */
  }
}

/** The pending invite code for this browser, if one is stored and still fresh. */
export function getStoredReferral(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.code || typeof parsed.at !== 'number') return null;
    if (Date.now() - parsed.at > CODE_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
}

/** Clear the pending code once it has been redeemed at signup. */
export function clearStoredReferral(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function referralUrl(code: string): string {
  return `${SITE_URL}/?ref=${code}`;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Stats for the logged-in user. Returns null when unavailable. */
export async function fetchReferralStats(): Promise<ReferralStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/me/referral`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.code ? data : null;
  } catch {
    return null;
  }
}

/** Ready-made share text. Kept short — it is pasted into WhatsApp status a lot. */
export function shareMessage(code: string): string {
  return `I'm practising typing on FastTypingLab — free typing tests for SSC, CPCT and other govt exams, in English and Hindi (Mangal + Kruti Dev).\n\nJoin me here: ${referralUrl(code)}`;
}

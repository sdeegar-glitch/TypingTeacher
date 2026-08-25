import cron from 'node-cron';
import { generateEnglishTest } from './generation/englishGenerator.js';
import { generateHindiTest } from './generation/hindiGenerator.js';
import { supabase } from './supabaseClient.js';
import { postTestToTelegram, postLeaderboardToTelegram, postPollToTelegram } from './services/telegram.js';

// Guard against overlapping runs
let isRunning = false;

const SLOTS_PER_DAY = {
  en: 4,
  hi_mangal: 4,
  hi_kruti: 4,
};

function runSlotInner(slot) {
  if (slot === 'en') return generateEnglishTest();
  if (slot === 'hi_mangal') return generateHindiTest('mangal_inscript');
  if (slot === 'hi_kruti') return generateHindiTest('kruti_dev');
  throw new Error(`Unknown slot: ${slot}`);
}

// Hard cap on a single generation so a hung network call can never freeze the
// pipeline (which would leave isRunning stuck true and block all future runs).
export async function runSlot(slot) {
  return Promise.race([
    runSlotInner(slot),
    new Promise((_, reject) => setTimeout(() => reject(new Error('generation timed out after 180s')), 180000)),
  ]);
}

/**
 * Runs the daily generation batch.
 *
 * Default (no args): full 12-test batch — 4 English, 4 Hindi/Mangal-Inscript,
 * 4 Hindi/Kruti-Dev.
 *
 * Pass `{ slot, count }` to run just one slot type (used by the manual
 * admin trigger, e.g. to top up a single category without re-running
 * everything).
 */
export async function fetchAndGenerateTests(options = {}) {
  if (isRunning) {
    console.log('[CronService] Still running previous batch. Skipping this tick.');
    return { skipped: true };
  }
  isRunning = true;
  console.log('\n========== [CronService] Batch Generation Started ==========');

  if (!process.env.GEMINI_API_KEY) {
    console.error('[CronService] GEMINI_API_KEY missing. Aborting.');
    isRunning = false;
    return { error: 'GEMINI_API_KEY missing' };
  }

  const plan = options.slot
    ? [{ slot: options.slot, count: options.count || 1 }]
    : Object.entries(SLOTS_PER_DAY).map(([slot, count]) => ({ slot, count }));

  const results = [];
  let isFirst = true;

  for (const { slot, count } of plan) {
    for (let i = 0; i < count; i++) {
      if (!isFirst) {
        console.log('  Waiting 30s before next test (rate-limit friendly)...');
        await new Promise(r => setTimeout(r, 30000));
      }
      isFirst = false;

      console.log(`\n  → Generating slot "${slot}" (${i + 1}/${count})`);
      try {
        const result = await runSlot(slot);
        results.push({ slot, ...result });
        console.log(`  ${result.status === 'success' ? '✅' : '⚠️'} ${slot}: ${result.status}${result.error ? ' — ' + result.error : ''}`);
        if (result.status === 'success') await postTestToTelegram(result);
      } catch (err) {
        console.error(`  ❌ ${slot} threw unexpectedly:`, err.message);
        results.push({ slot, status: 'failed', error: err.message });
      }
    }
  }

  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`========== [CronService] Done — ${successCount}/${results.length} tests saved ==========\n`);
  isRunning = false;
  return { results, successCount, total: results.length };
}

// ─── CATCH-UP GENERATION ──────────────────────────────────────────────────────
// Render's free tier sleeps the instance when idle, so the scheduled 3 AM IST
// cron often never fires (no traffic at that hour). This runs on incoming
// traffic instead (throttled): if the newest test is stale, it generates a
// batch — making generation resilient to the instance sleeping at cron time.
// Generate ONE test per trigger (not a long batch) so each unit finishes within
// seconds — resilient to the instance idling mid-run. Rotates languages and
// stops once ~12 tests exist in the last 24h (the normal daily volume).
const CATCHUP_SLOTS = ['en', 'hi_mangal', 'hi_kruti'];
const DAILY_TARGET = 12;
let lastCatchUpCheck = 0;
let slotCursor = 0;

export async function maybeCatchUpGeneration() {
  const now = Date.now();
  if (now - lastCatchUpCheck < 6 * 60 * 1000) return; // at most once every 6 min
  lastCatchUpCheck = now;
  if (isRunning) return;
  if (!process.env.GEMINI_API_KEY) return;

  try {
    const dayAgo = new Date(now - 24 * 3600 * 1000).toISOString();
    const { count } = await supabase
      .from('typing_test')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dayAgo);
    if ((count || 0) >= DAILY_TARGET) return; // enough fresh tests already

    const slot = CATCHUP_SLOTS[slotCursor % CATCHUP_SLOTS.length];
    slotCursor++;
    isRunning = true;
    console.log(`[Catch-up] ${count || 0}/${DAILY_TARGET} tests in last 24h — generating one "${slot}".`);
    try {
      const result = await runSlot(slot);
      console.log(`[Catch-up] ${slot}: ${result?.status || 'done'}${result?.error ? ' — ' + result.error : ''}`);
      if (result?.status === 'success') await postTestToTelegram(result);
    } finally {
      isRunning = false;
    }
  } catch (e) {
    isRunning = false;
    console.error('[Catch-up] failed:', e.message);
  }
}

// Midnight-to-midnight IST bounds for "yesterday" (or N days ago), returned as
// UTC Date objects for querying started_at (stored in UTC).
const IST_OFFSET_MS = 5.5 * 3600 * 1000;
function istDayBoundsUTC(daysAgo = 1) {
  const istNow = new Date(Date.now() + IST_OFFSET_MS);
  const istMidnightTodayUTC = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())) - IST_OFFSET_MS;
  const start = new Date(istMidnightTodayUTC - daysAgo * 24 * 3600 * 1000);
  const end = new Date(istMidnightTodayUTC - (daysAgo - 1) * 24 * 3600 * 1000);
  return { start, end };
}

// ─── DAILY LEADERBOARD POST ────────────────────────────────────────────────────
// Pulls the top 5 net-WPM sessions from the previous IST calendar day (midnight
// to midnight) and posts them to the Telegram community. No-op (quietly) if
// Telegram isn't configured or there are no sessions yet.
export async function postDailyLeaderboard() {
  try {
    const { start, end } = istDayBoundsUTC(1);
    const { data, error } = await supabase
      .from('test_sessions')
      .select('net_wpm, accuracy, started_at, users ( name )')
      .gte('started_at', start.toISOString())
      .lt('started_at', end.toISOString())
      .order('net_wpm', { ascending: false })
      .limit(5);
    if (error) { console.warn('[Leaderboard] query failed:', error.message); return { error: error.message }; }
    if (!data || data.length === 0) { console.log('[Leaderboard] no sessions yesterday — skipping post.'); return { skipped: 'no-data' }; }

    const rows = data.map((s, i) => ({
      rank: i + 1,
      user: s.users?.name || 'Anonymous',
      net_wpm: s.net_wpm,
      accuracy: s.accuracy,
    }));
    return await postLeaderboardToTelegram(rows);
  } catch (e) {
    console.error('[Leaderboard] failed:', e.message);
    return { error: e.message };
  }
}

// ─── TELEGRAM POST CATCH-UP ────────────────────────────────────────────────────
// Render's free tier sleeps the instance when idle, so a cron tick scheduled
// for a quiet hour (e.g. 9 AM leaderboard) can simply never fire if nothing
// woke the instance up in time. This mirrors maybeCatchUpGeneration: on
// incoming traffic, check whether today's leaderboard / this week's poll is
// overdue and post it if so. "Already posted" is tracked in app_settings
// (not in-memory) so it survives instance restarts and isn't duplicated by
// both the cron tick and a catch-up check firing close together.
const LEADERBOARD_MARKER_KEY = 'telegram_last_leaderboard_ist_date';
const POLL_MARKER_KEY = 'telegram_last_poll_iso_week';

async function getMarker(key) {
  const { data } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle();
  return data?.value || null;
}
async function setMarker(key, value) {
  await supabase.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() });
}

function istNow() { return new Date(Date.now() + IST_OFFSET_MS); }
function istDateKey(d) { return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }
// ISO 8601 week number, computed on the IST-shifted date so it matches the IST calendar day.
function istIsoWeekKey(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${week}`;
}

let lastTelegramCatchUpCheck = 0;

export async function maybeCatchUpTelegramPosts() {
  const now = Date.now();
  if (now - lastTelegramCatchUpCheck < 6 * 60 * 1000) return; // at most once every 6 min
  lastTelegramCatchUpCheck = now;
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;

  try {
    const ist = istNow();
    const todayKey = istDateKey(ist);
    const hour = ist.getUTCHours(); // ist is already shifted, so getUTCHours() reads as IST hour

    // Daily leaderboard: due any time from 9:00 AM IST onward, once per IST day.
    if (hour >= 9) {
      const lastPosted = await getMarker(LEADERBOARD_MARKER_KEY);
      if (lastPosted !== todayKey) {
        console.log('[Telegram catch-up] Daily leaderboard overdue — posting now.');
        const result = await postDailyLeaderboard();
        if (result?.ok || result?.skipped === 'no-data') await setMarker(LEADERBOARD_MARKER_KEY, todayKey);
      }
    }

    // Wednesday poll: due any time from 7:00 PM IST onward on a Wednesday, once per ISO week.
    const isWednesday = ist.getUTCDay() === 3;
    if (isWednesday && hour >= 19) {
      const weekKey = istIsoWeekKey(ist);
      const lastPolled = await getMarker(POLL_MARKER_KEY);
      if (lastPolled !== weekKey) {
        console.log('[Telegram catch-up] Weekly poll overdue — posting now.');
        const result = await postPollToTelegram();
        if (result?.ok) await setMarker(POLL_MARKER_KEY, weekKey);
      }
    }
  } catch (e) {
    console.error('[Telegram catch-up] failed:', e.message);
  }
}

// ─── CRON JOBS ────────────────────────────────────────────────────────────────
export const initCronJobs = () => {
  // Production: once daily at 3:00 AM IST (= 21:30 UTC previous day), generates
  // the full 12-test batch (4 English + 4 Hindi/Mangal-Inscript + 4 Hindi/Kruti-Dev).
  // ⚠️  To test manually, call fetchAndGenerateTests() directly, or POST
  // /api/tests/generate with an optional { slot, count } body for a single slot.
  cron.schedule('30 21 * * *', () => {
    fetchAndGenerateTests();
  });
  console.log('[CronService] Scheduled: daily at 3:00 AM IST — 12 tests (4 EN + 4 HI/Mangal + 4 HI/KrutiDev).');

  // Daily leaderboard to Telegram — every day 9:00 AM IST (= 03:30 UTC),
  // ranking the previous day's top typists. Marks app_settings on success so
  // maybeCatchUpTelegramPosts() doesn't re-post the same day if it also fires.
  cron.schedule('30 3 * * *', async () => {
    const result = await postDailyLeaderboard();
    if (result?.ok || result?.skipped === 'no-data') await setMarker(LEADERBOARD_MARKER_KEY, istDateKey(istNow()));
  });
  console.log('[CronService] Scheduled: daily leaderboard to Telegram — every day 9:00 AM IST.');

  // Engagement poll to Telegram — Wednesday 7:00 PM IST (= 13:30 UTC). Rotates
  // through a pool of questions so the group stays active mid-week. Marks
  // app_settings on success for the same reason as the leaderboard above.
  cron.schedule('30 13 * * 3', async () => {
    const result = await postPollToTelegram();
    if (result?.ok) await setMarker(POLL_MARKER_KEY, istIsoWeekKey(istNow()));
  });
  console.log('[CronService] Scheduled: engagement poll to Telegram — Wednesday 7:00 PM IST.');

  // Keep-alive: ping /health every 14 min to prevent Render free-tier cold starts
  const BACKEND_URL = process.env.BACKEND_URL || 'https://typingteacher-2lnd.onrender.com';
  cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      console.log(`[Keep-alive] /health → ${res.status}`);
    } catch (err) {
      console.warn(`[Keep-alive] Ping failed: ${err.message}`);
    }
  });
  console.log(`[Keep-alive] Pinging ${BACKEND_URL}/health every 14 min (prevents cold starts).`);
};

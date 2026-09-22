import cron from 'node-cron';
import { generateEnglishTest } from './generation/englishGenerator.js';
import { generateHindiTest } from './generation/hindiGenerator.js';
import { supabase } from './supabaseClient.js';
import { postTestToTelegram, postLeaderboardToTelegram, postPollToTelegram, postLiveTestAnnouncement, postTopReferrersToTelegram } from './services/telegram.js';

// Guard against overlapping runs
let isRunning = false;

const SLOTS_PER_DAY = {
  en: 4,
  hi_mangal: 4,
  hi_kruti: 4,
};

/**
 * Difficulty for each test generated in a slot, in order. Guarantees at
 * least one easy, one medium and one hard test per section per day — the
 * model no longer decides this itself, which is why almost everything used
 * to come out "medium" (every prompt asked for the same word-mix regardless
 * of what the self-reported difficulty_level ended up saying).
 * Extra slots beyond 3 repeat the historically weighted tiers (medium, then
 * easy, then hard) so a 4-a-day section reads as 1 easy / 2 medium / 1 hard.
 *
 * A single test (the manual admin "top up one test" case, not the daily
 * batch) keeps the old plain "medium" default rather than always being
 * "easy" — the guarantee only matters once there's more than one test to
 * spread across the three tiers.
 */
export function difficultyPlanForCount(count) {
  const base = ['easy', 'medium', 'hard'];
  if (count <= 0) return [];
  if (count === 1) return ['medium'];
  if (count <= 3) return base.slice(0, count);
  const extras = ['medium', 'easy', 'hard'];
  const plan = [...base];
  let i = 0;
  while (plan.length < count) { plan.push(extras[i % extras.length]); i++; }
  return plan;
}

function runSlotInner(slot, targetDifficulty) {
  if (slot === 'en') return generateEnglishTest(targetDifficulty);
  if (slot === 'hi_mangal') return generateHindiTest('mangal_inscript', targetDifficulty);
  if (slot === 'hi_kruti') return generateHindiTest('kruti_dev', targetDifficulty);
  throw new Error(`Unknown slot: ${slot}`);
}

// Hard cap on a single generation so a hung network call can never freeze the
// pipeline (which would leave isRunning stuck true and block all future runs).
export async function runSlot(slot, targetDifficulty = 'medium') {
  return Promise.race([
    runSlotInner(slot, targetDifficulty),
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
    // An explicit difficulty (manual admin trigger) always wins; otherwise
    // spread the batch across easy/medium/hard (see difficultyPlanForCount).
    const difficulties = options.difficulty
      ? Array(count).fill(options.difficulty)
      : difficultyPlanForCount(count);
    for (let i = 0; i < count; i++) {
      if (!isFirst) {
        console.log('  Waiting 30s before next test (rate-limit friendly)...');
        await new Promise(r => setTimeout(r, 30000));
      }
      isFirst = false;

      const targetDifficulty = difficulties[i] || 'medium';
      console.log(`\n  → Generating slot "${slot}" (${i + 1}/${count}), difficulty "${targetDifficulty}"`);
      try {
        const result = await runSlot(slot, targetDifficulty);
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

// ─── TELEGRAM POST MARKERS ─────────────────────────────────────────────────────
// Tracks the last IST date/week/month each scheduled post actually went out,
// stored in app_settings (not in-memory) so it survives process restarts and
// a cron tick never double-posts if the app happens to restart right after.
const LEADERBOARD_MARKER_KEY = 'telegram_last_leaderboard_ist_date';
const POLL_MARKER_KEY = 'telegram_last_poll_iso_week';
const LIVE_TEST_MARKER_KEY = 'telegram_last_live_test';
const REFERRERS_MARKER_KEY = 'telegram_last_top_referrers_month';

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
  // ranking the previous day's top typists. Marks app_settings on success.
  cron.schedule('30 3 * * *', async () => {
    const result = await postDailyLeaderboard();
    if (result?.ok || result?.skipped === 'no-data') await setMarker(LEADERBOARD_MARKER_KEY, istDateKey(istNow()));
  });
  console.log('[CronService] Scheduled: daily leaderboard to Telegram — every day 9:00 AM IST.');

  // Weekly Live Test — one-hour reminder (Sunday 6:00 PM IST = 12:30 UTC) and
  // the go-live post (Sunday 7:00 PM IST = 13:30 UTC), matching the schedule
  // the /live-test page derives from the date.
  cron.schedule('30 12 * * 0', async () => {
    const r = await postLiveTestAnnouncement('soon');
    if (r?.ok) await setMarker(LIVE_TEST_MARKER_KEY + ':soon', istIsoWeekKey(istNow()));
  });
  cron.schedule('30 13 * * 0', async () => {
    const r = await postLiveTestAnnouncement('live');
    if (r?.ok) await setMarker(LIVE_TEST_MARKER_KEY + ':live', istIsoWeekKey(istNow()));
  });
  console.log('[CronService] Scheduled: Live Test announcements to Telegram — Sunday 6:00 PM & 7:00 PM IST.');

  // Monthly top-referrer shout-out — 1st of the month, 7:00 PM IST (= 13:30 UTC).
  // "no-referrers" also marks the month: there was nothing to post, and retrying
  // every request until someone refers would just hammer the database.
  cron.schedule('30 13 1 * *', async () => {
    const result = await postTopReferrersToTelegram();
    if (result?.ok || result?.skipped === 'no-referrers') {
      await setMarker(REFERRERS_MARKER_KEY, istDateKey(istNow()).slice(0, 7));
    }
  });
  console.log('[CronService] Scheduled: top referrers to Telegram — 1st of month, 7:00 PM IST.');

  // Engagement poll to Telegram — Wednesday 7:00 PM IST (= 13:30 UTC). Rotates
  // through a pool of questions so the group stays active mid-week. Marks
  // app_settings on success for the same reason as the leaderboard above.
  cron.schedule('30 13 * * 3', async () => {
    const result = await postPollToTelegram();
    if (result?.ok) await setMarker(POLL_MARKER_KEY, istIsoWeekKey(istNow()));
  });
  console.log('[CronService] Scheduled: engagement poll to Telegram — Wednesday 7:00 PM IST.');

  // No catch-up/keep-alive logic needed here. This process runs 24/7 on a VPS
  // (PM2, single fork-mode instance) rather than a free-tier host that sleeps
  // on idle, so node-cron's own schedules fire reliably on their own.
};

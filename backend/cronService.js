import cron from 'node-cron';
import { generateEnglishTest } from './generation/englishGenerator.js';
import { generateHindiTest } from './generation/hindiGenerator.js';
import { supabase } from './supabaseClient.js';

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
    } finally {
      isRunning = false;
    }
  } catch (e) {
    isRunning = false;
    console.error('[Catch-up] failed:', e.message);
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

import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// This is a public, unauthenticated write endpoint by necessity (it's called
// from every anonymous visitor's browser), which makes it a standing target
// for scripts that POST fake visits directly to inflate/pollute the counter.
// Two independent checks, since either one alone has a gap a script can avoid:
//  - Origin check: a real browser call from our own SPA always carries this;
//    a script hitting the endpoint directly usually doesn't bother forging it.
//  - A dedicated per-IP limit tighter than the global one in index.js, since
//    a single real visitor never legitimately fires more than a couple of
//    these per minute (route change), but a script rotating across many IPs
//    can still be slowed down per-IP even though it can't be stopped outright
//    this way alone — see infra/nginx and fail2ban for the rest of the layers.
const ALLOWED_TRACK_ORIGINS = new Set([
  'https://fasttypinglab.com',
  'http://localhost:5173',
]);

function requireBrowserOrigin(req, res, next) {
  const origin = req.headers.origin;
  // Tauri's desktop-app webview doesn't send a standard http(s) Origin.
  const isTauri = typeof origin === 'string' && origin.startsWith('tauri://');
  if (origin && (ALLOWED_TRACK_ORIGINS.has(origin) || isTauri)) return next();
  return res.status(403).json({ error: 'Origin not allowed' });
}

const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

// Compute total page views + unique visitors. Never throws — returns zeros if
// the site_visits table/RPC isn't present yet (see migrations/001_site_visits.sql).
async function getTotals() {
  try {
    const { count, error } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;

    let unique = null;
    const { data: uniqueCount, error: rpcError } = await supabase.rpc('count_unique_visitors');
    if (!rpcError && uniqueCount != null) unique = Number(uniqueCount);

    return { total: count || 0, unique };
  } catch {
    return { total: 0, unique: null };
  }
}

// POST /api/visitors/track — record a single visit, return updated totals.
router.post('/track', requireBrowserOrigin, trackLimiter, async (req, res) => {
  try {
    const { visitor_id, path, referrer } = req.body || {};
    if (typeof visitor_id !== 'string' || visitor_id.length < 8 || visitor_id.length > 100) {
      return res.status(400).json({ error: 'visitor_id is required' });
    }

    const forwarded = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
    const ip = forwarded || req.ip || null;

    await supabase.from('site_visits').insert({
      visitor_id,
      path: typeof path === 'string' ? path.slice(0, 512) : null,
      referrer: typeof referrer === 'string' ? referrer.slice(0, 512) : null,
      user_agent: (req.headers['user-agent'] || '').toString().slice(0, 512) || null,
      ip_address: ip,
    });

    res.json(await getTotals());
  } catch {
    // Tracking must never break the UI.
    res.json({ total: 0, unique: null });
  }
});

// GET /api/visitors/count — public visit totals.
router.get('/count', async (_req, res) => {
  res.json(await getTotals());
});

export default router;

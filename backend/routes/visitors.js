import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

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
router.post('/track', async (req, res) => {
  try {
    const { visitor_id, path, referrer } = req.body || {};
    if (!visitor_id) return res.status(400).json({ error: 'visitor_id is required' });

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

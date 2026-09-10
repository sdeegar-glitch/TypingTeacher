import express from 'express';
import fs from 'fs';
import { supabase } from '../supabaseClient.js';
import { requireUser } from '../middleware/requireUser.js';
import { getReferralStats } from '../services/referrals.js';

const router = express.Router();
router.use(requireUser);

// TEMP DIAGNOSTIC (2026-09-09, round 2): Connection: close didn't fix the
// no-op-write issue, so re-checking whether multiple backend processes are
// actually in play. A random id generated once at module load lets repeated
// calls reveal whether they're hitting the same process or different ones.
const PROCESS_MARKER = Math.random().toString(36).slice(2, 10);
router.get('/_procid', async (req, res) => {
  const id = req.profile.id;

  const upd = await supabase.from('users').update({ referral_code: 'PROCTEST' }).eq('id', id).select('id, referral_code');

  // Bypass supabase-js entirely: raw fetch PATCH, same URL/key, from inside
  // this same process. If this ALSO matches 0 rows, the library isn't the
  // variable — something about Render's outbound path or this exact request
  // is. If this WORKS, the bug is specific to supabase-js's request
  // construction as deployed here.
  let rawFetchResult;
  try {
    const url = `${process.env.SUPABASE_URL}/rest/v1/users?id=eq.${id}`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ referral_code: 'RAWFETCHTEST' }),
    });
    rawFetchResult = { status: r.status, body: await r.text() };
  } catch (e) {
    rawFetchResult = { threw: e.message };
  }

  let supabaseJsVersion = 'unknown';
  try {
    const raw = fs.readFileSync(
      new URL('../node_modules/@supabase/supabase-js/package.json', import.meta.url),
      'utf8'
    );
    supabaseJsVersion = JSON.parse(raw).version;
  } catch { /* ignore */ }

  res.json({
    processMarker: PROCESS_MARKER,
    uptimeSec: Math.round(process.uptime()),
    pid: process.pid,
    nodeVersion: process.version,
    supabaseJsVersion,
    idCharCodes: [...id].map(c => c.charCodeAt(0)),
    supabaseJsUpdate: { data: upd.data, error: upd.error },
    rawFetchUpdate: rawFetchResult,
  });
});

// GET /api/me — the caller's own profile
router.get('/', (req, res) => {
  const p = req.profile;
  res.json({
    id: p.id,
    email: p.email,
    name: p.name || null,
    phone: p.phone || null,
    avatar_url: p.avatar_url || null,
    role: p.role || 'user',
    created_at: p.created_at || null,
  });
});

// PATCH /api/me — update editable profile fields
router.patch('/', async (req, res) => {
  const updates = {};
  if (typeof req.body.name === 'string') updates.name = req.body.name.trim().slice(0, 80);
  if (typeof req.body.phone === 'string') {
    const cleaned = req.body.phone.trim().slice(0, 20);
    updates.phone = cleaned || null;
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Nothing to update.' });

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', req.profile.id)
    .select('id, name, email, phone, avatar_url')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /api/me/avatar — { image: 'data:image/<png|jpeg|webp>;base64,...' }
// The image is already compressed client-side (≤512px JPEG), so we store it
// directly as a data URL in users.avatar_url. This avoids Supabase Storage and
// its RLS entirely — updating the users row is all that's needed.
router.post('/avatar', async (req, res) => {
  const { image } = req.body;
  const match = typeof image === 'string' && image.match(/^data:(image\/(png|jpe?g|webp));base64,(.+)$/);
  if (!match) return res.status(400).json({ error: 'Invalid image. Use PNG, JPG or WEBP.' });

  const buffer = Buffer.from(match[3], 'base64');
  if (buffer.length > 1024 * 1024) return res.status(413).json({ error: 'Image too large (max 1 MB). Try a smaller photo.' });

  const { error: updErr } = await supabase.from('users').update({ avatar_url: image }).eq('id', req.profile.id);
  if (updErr) return res.status(400).json({ error: updErr.message });

  res.json({ avatar_url: image });
});

// GET /api/me/certificates — certificates linked to this account
router.get('/certificates', async (req, res) => {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', req.profile.id);

  if (error) return res.json([]); // user_id column may not be migrated yet
  const rows = Array.isArray(data) ? data : [];
  rows.sort((a, b) => new Date(b.issued_at || b.created_at || 0) - new Date(a.issued_at || a.created_at || 0));
  res.json(rows);
});

// GET /api/me/referral — this user's share code and who they have invited
router.get('/referral', async (req, res) => {
  try {
    const stats = await getReferralStats(req.profile.id);
    res.json(stats);
  } catch (err) {
    // Most likely cause is migration 002 not having been run yet. Fail soft so
    // the dashboard renders without the referral card rather than erroring out.
    res.status(503).json({ error: err.message || 'Referrals are not available right now.' });
  }
});

export default router;

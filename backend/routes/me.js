import express from 'express';
import { supabase } from '../supabaseClient.js';
import { requireUser } from '../middleware/requireUser.js';

const router = express.Router();
router.use(requireUser);

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
// Uploaded via the service-role client into the public `avatars` bucket, so no
// storage RLS policy is required.
router.post('/avatar', async (req, res) => {
  const { image } = req.body;
  const match = typeof image === 'string' && image.match(/^data:(image\/(png|jpe?g|webp));base64,(.+)$/);
  if (!match) return res.status(400).json({ error: 'Invalid image. Use PNG, JPG or WEBP.' });

  const contentType = match[1];
  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
  const buffer = Buffer.from(match[3], 'base64');
  if (buffer.length > 2 * 1024 * 1024) return res.status(413).json({ error: 'Image too large (max 2 MB).' });

  const path = `${req.profile.id}/avatar.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, { contentType, upsert: true });
  if (upErr) return res.status(400).json({ error: upErr.message });

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  const url = `${pub.publicUrl}?v=${Date.now()}`; // cache-bust after re-upload

  const { error: updErr } = await supabase.from('users').update({ avatar_url: url }).eq('id', req.profile.id);
  if (updErr) return res.status(400).json({ error: updErr.message });

  res.json({ avatar_url: url });
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

export default router;

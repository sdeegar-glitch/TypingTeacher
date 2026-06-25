import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Settings that are safe to expose without admin auth — deliberately a
// tiny allow-list, distinct from the admin SETTINGS_KEYS list in
// routes/admin.js, since most app_settings rows aren't meant for public
// consumption (e.g. maintenanceMode messaging, contact info).
const PUBLIC_KEYS = ['mistakeHandling'];

// GET /api/settings/public — read-only, used by the typing test page to
// know whether strict mistake-correction mode is enabled site-wide.
router.get('/public', async (req, res) => {
  const { data, error } = await supabase.from('app_settings').select('key, value').in('key', PUBLIC_KEYS);
  if (error) return res.status(500).json({ error: error.message });
  const settings = {};
  for (const row of data || []) settings[row.key] = row.value;
  res.json({
    mistakeHandling: settings.mistakeHandling === 'strict' ? 'strict' : 'lenient',
  });
});

export default router;

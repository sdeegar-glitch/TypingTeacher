import express from 'express';
import { supabase } from '../supabaseClient.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { logActivity } from '../activityLog.js';
import { generateSecret, verifyTotp, generateQrCode, startSetup, getSetupSecret, clearSetup } from '../twofa.js';

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/me — confirms the caller is a logged-in admin
router.get('/me', (req, res) => res.json(req.adminUser));

// ─── Two-Factor Auth (TOTP, authenticator-app based) ───────────────────
router.get('/2fa/status', (req, res) => res.json({ enabled: !!req.adminUser.totp_enabled }));

router.post('/2fa/setup', async (req, res) => {
  const secret = generateSecret();
  startSetup(req.adminUser.id, secret);
  const qrCode = await generateQrCode(req.adminUser.email, secret);
  res.json({ secret, qrCode });
});

router.post('/2fa/verify', async (req, res) => {
  const { code } = req.body;
  const secret = getSetupSecret(req.adminUser.id);
  if (!secret) return res.status(400).json({ error: 'No 2FA setup in progress — call /2fa/setup first.' });
  if (!verifyTotp(code, secret)) return res.status(400).json({ error: 'Invalid code. Check your authenticator app and try again.' });

  const { error } = await supabase.from('users').update({ totp_secret: secret, totp_enabled: true }).eq('id', req.adminUser.id);
  if (error) return res.status(500).json({ error: error.message });
  clearSetup(req.adminUser.id);
  logActivity({ action: 'twofa_enabled', entity: 'user', actor_email: req.adminUser.email, ip: req.ip });
  res.json({ enabled: true });
});

router.post('/2fa/disable', async (req, res) => {
  const { code } = req.body;
  const { data: u } = await supabase.from('users').select('totp_secret').eq('id', req.adminUser.id).single();
  if (!u?.totp_secret || !verifyTotp(code, u.totp_secret)) {
    return res.status(400).json({ error: 'Invalid code — enter your current authenticator code to confirm disabling 2FA.' });
  }

  const { error } = await supabase.from('users').update({ totp_secret: null, totp_enabled: false }).eq('id', req.adminUser.id);
  if (error) return res.status(500).json({ error: error.message });
  logActivity({ action: 'twofa_disabled', entity: 'user', actor_email: req.adminUser.email, ip: req.ip, status: 'warning' });
  res.json({ enabled: false });
});

// GET /api/admin/stats — overview dashboard numbers, derived from real tables
router.get('/stats', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);

    const [
      { count: totalUsers },
      { count: totalTests },
      { data: viewsRows },
      { data: recentSessions },
      { data: difficultyRows },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('typing_test').select('*', { count: 'exact', head: true }),
      supabase.from('typing_test').select('views'),
      supabase.from('test_sessions').select('user_id, net_wpm, started_at').gte('started_at', fourteenDaysAgo.toISOString()),
      supabase.from('typing_test').select('difficulty_level'),
    ]);

    const totalViews = (viewsRows || []).reduce((sum, r) => sum + (r.views || 0), 0);
    const sessions7d = (recentSessions || []).filter(s => new Date(s.started_at) >= sevenDaysAgo);
    const activeUsers = new Set(sessions7d.map(s => s.user_id).filter(Boolean)).size;
    const testsToday = (recentSessions || []).filter(s => new Date(s.started_at) >= startOfToday).length;
    const wpmValues = sessions7d.map(s => s.net_wpm).filter(v => typeof v === 'number');
    const avgWpm = wpmValues.length ? Math.round(wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length) : 0;

    const dailyCounts = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      dailyCounts[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
    }
    for (const s of recentSessions || []) {
      const key = new Date(s.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in dailyCounts) dailyCounts[key]++;
    }
    const chartData = Object.entries(dailyCounts).map(([date, value]) => ({ date, value }));

    const diffCounts = { easy: 0, medium: 0, hard: 0 };
    for (const r of difficultyRows || []) {
      if (r.difficulty_level in diffCounts) diffCounts[r.difficulty_level]++;
    }

    res.json({
      stats: { totalUsers: totalUsers || 0, activeUsers, totalTests: totalTests || 0, totalViews, avgWpm, testsToday },
      chartData,
      difficultyDistribution: diffCounts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — real user list with aggregated test stats
router.get('/users', async (req, res) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, name, role, created_at, is_banned')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const { data: sessions } = await supabase.from('test_sessions').select('user_id, net_wpm, accuracy');
  const byUser = {};
  for (const s of sessions || []) {
    if (!s.user_id) continue;
    const bucket = (byUser[s.user_id] ||= { total_tests: 0, best_wpm: 0, accSum: 0, accCount: 0 });
    bucket.total_tests++;
    if (typeof s.net_wpm === 'number' && s.net_wpm > bucket.best_wpm) bucket.best_wpm = s.net_wpm;
    if (typeof s.accuracy === 'number') { bucket.accSum += s.accuracy; bucket.accCount++; }
  }

  res.json(users.map(u => {
    const b = byUser[u.id] || { total_tests: 0, best_wpm: 0, accSum: 0, accCount: 0 };
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      created_at: u.created_at,
      total_tests: b.total_tests,
      best_wpm: b.best_wpm,
      average_accuracy: b.accCount ? Math.round(b.accSum / b.accCount) : 0,
      is_banned: !!u.is_banned,
    };
  }));
});

// PATCH /api/admin/users/:id/ban — { is_banned: true|false }. Enforced at
// login time (see /auth/login) — an already-active session stays valid
// until its access token naturally expires (~1h).
router.patch('/users/:id/ban', async (req, res) => {
  const { id } = req.params;
  const { is_banned } = req.body;
  if (typeof is_banned !== 'boolean') return res.status(400).json({ error: 'is_banned must be a boolean' });
  if (req.adminUser.id === id) return res.status(400).json({ error: "You can't ban your own admin account" });

  const { data: target } = await supabase.from('users').select('email').eq('id', id).maybeSingle();
  const { error } = await supabase.from('users').update({ is_banned }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });

  logActivity({
    action: is_banned ? 'user_banned' : 'user_unbanned',
    entity: 'user',
    actor_email: req.adminUser.email,
    ip: req.ip,
    status: is_banned ? 'warning' : 'success',
    meta: { target_email: target?.email },
  });
  res.json({ id, is_banned });
});

// DELETE /api/admin/users/:id — removes the auth user and their profile row
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (req.adminUser.id === id) return res.status(400).json({ error: "You can't delete your own admin account" });

  const { data: target } = await supabase.from('users').select('email').eq('id', id).maybeSingle();
  const { error: authErr } = await supabase.auth.admin.deleteUser(id);
  if (authErr) return res.status(500).json({ error: authErr.message });

  await supabase.from('users').delete().eq('id', id);
  logActivity({ action: 'user_deleted', entity: 'user', actor_email: req.adminUser.email, ip: req.ip, status: 'warning', meta: { target_email: target?.email } });
  res.status(204).end();
});

// GET /api/admin/tests — full list (including unpublished), for admin management
router.get('/tests', async (req, res) => {
  const { data, error } = await supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, category, views, is_published, is_featured, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/admin/tests/:id
router.delete('/tests/:id', async (req, res) => {
  const { data: target } = await supabase.from('typing_test').select('title').eq('id', req.params.id).maybeSingle();
  const { error } = await supabase.from('typing_test').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  logActivity({ action: 'test_deleted', entity: 'typing_test', actor_email: req.adminUser.email, ip: req.ip, status: 'warning', meta: { title: target?.title } });
  res.status(204).end();
});

// GET /api/admin/categories — real distinct categories + test counts
// (there's no dedicated categories table; this derives from typing_test.category)
router.get('/categories', async (req, res) => {
  const { data, error } = await supabase.from('typing_test').select('category');
  if (error) return res.status(500).json({ error: error.message });

  const counts = {};
  for (const row of data || []) {
    const name = row.category?.trim() || 'Uncategorized';
    counts[name] = (counts[name] || 0) + 1;
  }
  const categories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, test_count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      test_count,
    }));
  res.json(categories);
});

// GET /api/admin/analytics — real platform analytics from test_sessions/users
router.get('/analytics', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [{ data: sessions }, { count: newUsers30d }] = await Promise.all([
      supabase.from('test_sessions').select('started_at, duration, net_wpm, accuracy, mode').gte('started_at', thirtyDaysAgo.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
    ]);

    const rows = sessions || [];
    const totalSessions = rows.length;
    // A couple of historical rows have duration values in the billions (looks
    // like an epoch timestamp got written instead of elapsed seconds) — cap
    // at 1h so one bad row doesn't make the average meaningless.
    const saneDurations = rows.map(r => r.duration).filter(v => typeof v === 'number' && v > 0 && v <= 3600);
    const avgDurationSec = saneDurations.length ? Math.round(saneDurations.reduce((a, b) => a + b, 0) / saneDurations.length) : 0;
    const accValues = rows.map(r => r.accuracy).filter(v => typeof v === 'number');
    const avgAccuracy = accValues.length ? Math.round(accValues.reduce((a, b) => a + b, 0) / accValues.length) : 0;

    const dailySessions = {};
    const dailyWpmSum = {};
    const dailyWpmCount = {};
    for (let i = 29; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailySessions[key] = 0; dailyWpmSum[key] = 0; dailyWpmCount[key] = 0;
    }
    for (const r of rows) {
      const key = new Date(r.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!(key in dailySessions)) continue;
      dailySessions[key]++;
      if (typeof r.net_wpm === 'number') { dailyWpmSum[key] += r.net_wpm; dailyWpmCount[key]++; }
    }
    const dailySessionsChart = Object.entries(dailySessions).map(([date, value]) => ({ date, value }));
    const dailyWpmChart = Object.keys(dailySessions).map(date => ({
      date, value: dailyWpmCount[date] ? Math.round(dailyWpmSum[date] / dailyWpmCount[date]) : 0,
    }));

    const modeCounts = {};
    for (const r of rows) {
      const m = r.mode || 'unspecified';
      modeCounts[m] = (modeCounts[m] || 0) + 1;
    }
    const sessionsByMode = Object.entries(modeCounts).map(([name, value]) => ({ name, value }));

    const buckets = { '90-100%': 0, '80-89%': 0, '70-79%': 0, 'Below 70%': 0 };
    for (const v of accValues) {
      if (v >= 90) buckets['90-100%']++;
      else if (v >= 80) buckets['80-89%']++;
      else if (v >= 70) buckets['70-79%']++;
      else buckets['Below 70%']++;
    }
    const accuracyDistribution = Object.entries(buckets).map(([name, value]) => ({ name, value }));

    res.json({
      summary: { totalSessions, avgDurationSec, avgAccuracy, newUsers30d: newUsers30d || 0 },
      dailySessionsChart,
      dailyWpmChart,
      sessionsByMode,
      accuracyDistribution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Settings (non-secret fields only — API keys/SMTP stay env-managed) ──
const SETTINGS_KEYS = ['siteName', 'tagline', 'siteUrl', 'supportEmail', 'maintenanceMode', 'twitterUrl', 'githubUrl', 'mistakeHandling'];

router.get('/settings', async (req, res) => {
  const { data, error } = await supabase.from('app_settings').select('key, value').in('key', SETTINGS_KEYS);
  if (error) return res.status(500).json({ error: error.message });
  const settings = {};
  for (const row of data || []) settings[row.key] = row.value;
  settings.maintenanceMode = settings.maintenanceMode === 'true';
  res.json(settings);
});

router.put('/settings', async (req, res) => {
  const updates = Object.entries(req.body || {}).filter(([k]) => SETTINGS_KEYS.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid settings keys provided' });

  for (const [key, value] of updates) {
    const { error } = await supabase.from('app_settings').upsert({ key, value: String(value), updated_at: new Date().toISOString() });
    if (error) return res.status(500).json({ error: error.message });
  }
  logActivity({ action: 'settings_updated', entity: 'app_settings', actor_email: req.adminUser.email, ip: req.ip, meta: { keys: updates.map(([k]) => k) } });
  res.json({ ok: true });
});

// ─── SEO (real per-test data — no separate "pages" table exists) ──────────
router.get('/seo', async (req, res) => {
  const { data, error } = await supabase
    .from('typing_test')
    .select('id, title, slug, seo_title, seo_description, views, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });

  res.json(data.map(t => {
    const titleLen = (t.seo_title || t.title || '').length;
    const descLen = (t.seo_description || '').length;
    let score = 40;
    if (titleLen > 0 && titleLen <= 60) score += 30; else if (titleLen > 60) score += 10;
    if (descLen >= 70 && descLen <= 160) score += 30; else if (descLen > 0) score += 10;
    return { ...t, score };
  }));
});

router.patch('/tests/:id/seo', async (req, res) => {
  const { seo_title, seo_description } = req.body;
  const updates = {};
  if (typeof seo_title === 'string') updates.seo_title = seo_title;
  if (typeof seo_description === 'string') updates.seo_description = seo_description;
  if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });

  const { data, error } = await supabase.from('typing_test').update(updates).eq('id', req.params.id).select('id, seo_title, seo_description').single();
  if (error) return res.status(500).json({ error: error.message });
  logActivity({ action: 'test_seo_updated', entity: 'typing_test', actor_email: req.adminUser.email, ip: req.ip, meta: { id: req.params.id } });
  res.json(data);
});

// GET /api/admin/seo/sitemap — freshly generated sitemap XML for review/download
// (this does NOT write to the live frontend/public/sitemap.xml — that's a
// separate static-site deploy; this is a preview of what it should contain)
router.get('/seo/sitemap', async (req, res) => {
  const { data, error } = await supabase.from('typing_test').select('slug, updated_at').eq('is_published', true);
  if (error) return res.status(500).json({ error: error.message });

  const urls = [
    { loc: 'https://fasttypinglab.com/', lastmod: null },
    { loc: 'https://fasttypinglab.com/tests', lastmod: null },
    ...data.map(t => ({ loc: `https://fasttypinglab.com/tests/${t.slug}`, lastmod: t.updated_at })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u =>
    `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`
  ).join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

// GET /api/admin/generation-log — AI test-generation run history (success/
// failed/skipped_duplicate/skipped_quality per slot), for the admin dashboard
router.get('/generation-log', async (req, res) => {
  const { data, error } = await supabase
    .from('generation_log')
    .select('id, run_date, slot, topic, status, test_id, error, attempt_count, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });

  const summary = { success: 0, failed: 0, skipped_duplicate: 0, skipped_quality: 0 };
  for (const row of data || []) {
    if (row.status in summary) summary[row.status]++;
  }
  res.json({ logs: data, summary });
});

// GET /api/admin/logs — real activity feed (logins, bans, deletes, AI generation)
router.get('/logs', async (req, res) => {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;

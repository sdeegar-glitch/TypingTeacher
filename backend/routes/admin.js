import express from 'express';
import { supabase } from '../supabaseClient.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = express.Router();
router.use(requireAdmin);

// GET /api/admin/me — confirms the caller is a logged-in admin
router.get('/me', (req, res) => res.json(req.adminUser));

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

  const { error } = await supabase.from('users').update({ is_banned }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id, is_banned });
});

// DELETE /api/admin/users/:id — removes the auth user and their profile row
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (req.adminUser.id === id) return res.status(400).json({ error: "You can't delete your own admin account" });

  const { error: authErr } = await supabase.auth.admin.deleteUser(id);
  if (authErr) return res.status(500).json({ error: authErr.message });

  await supabase.from('users').delete().eq('id', id);
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
  const { error } = await supabase.from('typing_test').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
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

export default router;

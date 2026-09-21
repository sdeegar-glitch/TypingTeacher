/**
 * Certificates route
 * GET  /api/certificates/eligible - Saved sessions that qualify for a certificate
 * POST /api/certificates          - Issue a certificate for a qualifying saved session (login required)
 * GET  /api/certificates/:id      - Verify a certificate by UUID
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabaseClient.js';
import { requireBrowserOrigin } from '../middleware/requireBrowserOrigin.js';
import { requireUser } from '../middleware/requireUser.js';

const router = express.Router();

const issueLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

// Eligibility rules. Enforced here, against the saved session, never against
// numbers sent by the browser.
export const CERT_RULES = { minWpm: 30, minAccuracy: 85, minSeconds: 300 };

function qualifies(s) {
  return !!s &&
    s.net_wpm >= CERT_RULES.minWpm &&
    s.accuracy >= CERT_RULES.minAccuracy &&
    s.duration >= CERT_RULES.minSeconds;
}

// GET /api/certificates/eligible - the caller's saved sessions that qualify
// and have no certificate yet.
router.get('/eligible', requireUser, async (req, res) => {
  const uid = req.profile.id;
  const { data: sessions, error } = await supabase
    .from('test_sessions')
    .select('id, started_at, duration, net_wpm, accuracy, errors, test_id')
    .eq('user_id', uid)
    .gte('duration', CERT_RULES.minSeconds)
    .gte('net_wpm', CERT_RULES.minWpm)
    .gte('accuracy', CERT_RULES.minAccuracy)
    .order('started_at', { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: 'Could not load sessions.' });

  const { data: issued } = await supabase
    .from('certificates').select('session_id').eq('user_id', uid).not('session_id', 'is', null);
  const taken = new Set((issued || []).map(r => r.session_id));
  const list = (sessions || []).filter(s => !taken.has(s.id));

  const ids = [...new Set(list.map(s => s.test_id).filter(Boolean))];
  const titles = {};
  if (ids.length) {
    const { data: tests } = await supabase.from('tests').select('id, title').in('id', ids);
    (tests || []).forEach(t => { titles[t.id] = t.title; });
  }
  res.json({
    rules: CERT_RULES,
    name: req.profile.name || '',
    sessions: list.map(s => ({ ...s, test_title: titles[s.test_id] || 'Typing Speed Test' })),
  });
});

// POST /api/certificates - body { session_id, name }. Registered users only.
router.post('/', requireBrowserOrigin, issueLimiter, requireUser, async (req, res) => {
  try {
    const sessionId = Number(req.body.session_id);
    const name = typeof req.body.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : '';
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({ error: 'A completed test session is required.' });
    }
    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ error: 'Enter your full name (2-60 characters).' });
    }
    const uid = req.profile.id;

    const { data: s } = await supabase
      .from('test_sessions')
      .select('id, user_id, duration, net_wpm, accuracy, errors, test_id')
      .eq('id', sessionId).maybeSingle();
    if (!s || s.user_id !== uid) {
      return res.status(404).json({ error: 'Test session not found on your account.' });
    }
    if (!qualifies(s)) {
      return res.status(422).json({
        error: `A certificate needs at least ${CERT_RULES.minWpm} net WPM, ${CERT_RULES.minAccuracy}% accuracy and a ${CERT_RULES.minSeconds / 60}-minute test.`,
        rules: CERT_RULES,
      });
    }

    // One certificate per session: re-issuing returns the existing one.
    const { data: existing } = await supabase
      .from('certificates').select('*').eq('session_id', sessionId).maybeSingle();
    if (existing) return res.status(200).json(existing);

    let title = 'Typing Speed Test';
    if (s.test_id) {
      const { data: t } = await supabase.from('tests').select('title').eq('id', s.test_id).maybeSingle();
      if (t?.title) title = t.title;
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        username: name,
        wpm: s.net_wpm,
        accuracy: s.accuracy,
        errors: s.errors ?? 0,
        duration_seconds: s.duration,
        test_title: title,
        is_valid: true,
        user_id: uid,
        session_id: sessionId,
      })
      .select().single();

    if (error) {
      // Never hand out an ID that isn't stored: it could not be verified later.
      console.error('[Certificates] insert failed:', error.message);
      return res.status(503).json({ error: 'Could not issue certificate right now. Please try again.' });
    }
    res.status(201).json(data);
  } catch (err) {
    console.error('[Certificates] issue failed:', err.message);
    res.status(500).json({ error: 'Could not issue certificate.' });
  }
});

// GET /api/certificates/:id - Verify
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('certificates')
      .select('id, username, wpm, accuracy, errors, duration_seconds, test_title, issued_at, is_valid')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ valid: false, error: 'Certificate not found.' });
    }

    res.json({ valid: data.is_valid, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

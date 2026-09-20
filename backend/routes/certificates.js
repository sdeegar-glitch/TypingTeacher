/**
 * Certificates route
 * POST /api/certificates - Issue a certificate for a test session
 * GET  /api/certificates/:id - Verify a certificate by UUID
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabaseClient.js';
import { requireBrowserOrigin } from '../middleware/requireBrowserOrigin.js';

const router = express.Router();

// A real user only ever issues one certificate per completed test.
const issueLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

// POST /api/certificates
router.post('/', requireBrowserOrigin, issueLimiter, async (req, res) => {
  try {
    const { username, wpm, accuracy, errors, duration_seconds, test_title } = req.body;

    if (
      !username || typeof username !== 'string' || username.length > 100 ||
      typeof wpm !== 'number' || wpm <= 0 || wpm > 400 ||
      typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100
    ) {
      return res.status(400).json({ error: 'username, wpm, and accuracy are required.' });
    }

    // If the caller is logged in, link the certificate to their account so it
    // shows up on their profile. Anonymous certificates still work (user_id null).
    let userId = null;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      const { data: u } = await supabase.auth.getUser(token);
      if (u?.user) userId = u.user.id;
    }

    const baseRow = {
      username,
      wpm,
      accuracy,
      errors: errors ?? 0,
      duration_seconds: duration_seconds ?? 60,
      test_title: test_title ?? 'Typing Speed Test',
      is_valid: true,
    };

    let { data, error } = await supabase
      .from('certificates')
      .insert(userId ? { ...baseRow, user_id: userId } : baseRow)
      .select()
      .single();

    // If user_id column isn't migrated yet, retry without it so issuance never breaks.
    if (error && userId) {
      ({ data, error } = await supabase.from('certificates').insert(baseRow).select().single());
    }

    if (error) {
      // Never hand out an ID that isn't stored: it could not be verified later.
      console.error('[Certificates] insert failed:', error.message);
      return res.status(503).json({ error: 'Could not issue certificate right now. Please try again.' });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/certificates/:id - Verify
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('certificates')
      .select('id, username, wpm, accuracy, test_title, issued_at, is_valid')
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

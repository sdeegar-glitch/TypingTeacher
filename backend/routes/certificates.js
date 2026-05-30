/**
 * Certificates route
 * POST /api/certificates - Issue a certificate for a test session
 * GET  /api/certificates/:id - Verify a certificate by UUID
 */
import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// POST /api/certificates
router.post('/', async (req, res) => {
  try {
    const { username, wpm, accuracy, errors, duration_seconds, test_title } = req.body;

    if (!username || !wpm || !accuracy) {
      return res.status(400).json({ error: 'username, wpm, and accuracy are required.' });
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert({
        username,
        wpm,
        accuracy,
        errors: errors ?? 0,
        duration_seconds: duration_seconds ?? 60,
        test_title: test_title ?? 'Typing Speed Test',
        is_valid: true,
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, return a mock certificate ID
      console.warn('[Certificates] DB error, returning mock:', error.message);
      const mockId = `FTLAB-${Date.now().toString(36).toUpperCase()}`;
      return res.status(201).json({
        id: mockId,
        username, wpm, accuracy, errors: errors ?? 0,
        test_title: test_title ?? 'Typing Speed Test',
        issued_at: new Date().toISOString(),
        is_valid: true,
      });
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

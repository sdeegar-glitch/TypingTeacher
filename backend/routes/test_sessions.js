import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// POST /test_sessions - Submit test results
router.post('/', async (req, res) => {
  const { user_id, test_id, duration, gross_wpm, net_wpm, errors, accuracy } = req.body;
  
  if (duration === undefined || gross_wpm === undefined || net_wpm === undefined) {
    return res.status(400).json({ error: 'Missing required metrics' });
  }

  const { data, error } = await supabase
    .from('test_sessions')
    .insert([{ 
      user_id: user_id || null, // Allow anonymous submissions for now
      test_id: test_id || null, 
      duration, 
      gross_wpm, 
      net_wpm, 
      errors, 
      accuracy 
    }])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  
  // Return expected response format
  res.status(201).json({
    session_id: data.id,
    gross_wpm: data.gross_wpm,
    net_wpm: data.net_wpm,
    accuracy: data.accuracy
  });
});

// GET /test_sessions/:id - Get detailed results for a session
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('test_sessions')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Session not found' });
  
  res.json(data);
});

export default router;

import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  // A simplified leaderboard query: join test_sessions with users
  // Ordered by net_wpm descending
  const { data, error } = await supabase
    .from('test_sessions')
    .select(`
      id,
      net_wpm,
      accuracy,
      started_at,
      users ( name )
    `)
    .order('net_wpm', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });

  const formattedData = data.map((session, index) => ({
    rank: index + 1,
    user: session.users?.name || 'Anonymous',
    net_wpm: session.net_wpm,
    accuracy: session.accuracy,
    date: new Date(session.started_at).toISOString().split('T')[0]
  }));

  res.json(formattedData);
});

export default router;

import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  // Use Supabase auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  });

  if (error) return res.status(400).json({ error: error.message });

  // Insert into our users table
  if (data?.user) {
    await supabase.from('users').insert([
      { id: data.user.id, email: data.user.email, name: name }
    ]);
  }

  res.status(201).json({ user_id: data?.user?.id, email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Note: For actual user login, client usually calls supabase.auth.signInWithPassword directly.
  // Since we are wrapping it in Express, we use signInWithPassword.
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(401).json({ error: error.message });
  res.json({ accessToken: data.session?.access_token, user: data.user });
});

export default router;

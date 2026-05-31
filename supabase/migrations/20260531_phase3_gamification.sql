-- ============================================================
-- Phase 3 Migration: Gamification + Certificates Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Extended user profiles (one-to-one with Supabase auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'IN',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_test_date DATE,
  total_tests INTEGER DEFAULT 0,
  best_wpm INTEGER DEFAULT 0,
  avg_accuracy REAL DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Achievements catalog (seeded below)
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,           -- emoji
  xp_reward INTEGER DEFAULT 50,
  category TEXT DEFAULT 'speed', -- speed, accuracy, streak, social
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are public" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert achievements" ON user_achievements FOR INSERT WITH CHECK (true);

-- 4. Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy REAL NOT NULL,
  errors INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 60,
  test_title TEXT DEFAULT 'Typing Speed Test',
  is_valid BOOLEAN DEFAULT true,
  issued_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates are publicly verifiable" ON certificates FOR SELECT USING (true);
CREATE POLICY "Anyone can issue a certificate" ON certificates FOR INSERT WITH CHECK (true);

-- 5. Extend test_sessions with mode tracking
ALTER TABLE test_sessions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'article';
ALTER TABLE test_sessions ADD COLUMN IF NOT EXISTS cpm INTEGER;

-- ============================================================
-- Seed: Achievement Catalog
-- ============================================================
INSERT INTO achievements (key, name, description, icon, xp_reward, category) VALUES
  ('first_test',    'First Steps',        'Complete your very first typing test',         '🎯', 25,  'milestone'),
  ('wpm_30',        'Getting Warmed Up',  'Achieve 30 WPM in a single test',              '🔥', 50,  'speed'),
  ('wpm_50',        '50 WPM Club',        'Reach 50 WPM — faster than most people',       '⚡', 100, 'speed'),
  ('wpm_70',        '70 WPM Club',        'Hit 70 WPM — advanced typist territory',       '🚀', 150, 'speed'),
  ('wpm_100',       '100 WPM Legend',     'Break the 100 WPM barrier',                    '🏆', 300, 'speed'),
  ('acc_95',        'Sharpshooter',       'Achieve 95% accuracy or higher',               '🎯', 75,  'accuracy'),
  ('acc_100',       'Perfect Accuracy',   'Complete a test with 100% accuracy',           '💎', 200, 'accuracy'),
  ('streak_3',      '3-Day Streak',       'Practice 3 days in a row',                     '🔥', 75,  'streak'),
  ('streak_7',      'Week Warrior',       'Maintain a 7-day typing streak',               '🗓️', 150, 'streak'),
  ('streak_30',     'Monthly Champion',   'Practice for 30 consecutive days',             '🌟', 500, 'streak'),
  ('tests_10',      'Dedicated Typist',   'Complete 10 typing tests',                     '📚', 100, 'milestone'),
  ('tests_50',      'Power User',         'Complete 50 typing tests',                     '💪', 250, 'milestone'),
  ('speed_demon',   'Speed Demon',        'Hit 80+ WPM with 90%+ accuracy in one test',   '👹', 200, 'speed'),
  ('accuracy_master','Accuracy Master',   'Average 95%+ accuracy across 5 tests',         '🎓', 200, 'accuracy')
ON CONFLICT (key) DO NOTHING;

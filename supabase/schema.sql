-- Supabase Schema for TypingTeacher

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS exam_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  exam_type_id INT REFERENCES exam_types(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  duration INT NOT NULL,
  difficulty TEXT,
  language TEXT,
  created_by UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS test_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  test_id INT REFERENCES tests(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INT NOT NULL,
  gross_wpm INT,
  net_wpm INT,
  errors INT,
  accuracy REAL
);

CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria TEXT
);

CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_id INT REFERENCES badges(id),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

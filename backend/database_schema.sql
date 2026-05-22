-- Create enum type for difficulty
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create typing_test table
CREATE TABLE IF NOT EXISTS typing_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    original_source TEXT,
    content TEXT NOT NULL,
    excerpt TEXT,
    difficulty_level difficulty_level NOT NULL DEFAULT 'medium',
    word_count INTEGER NOT NULL,
    estimated_read_time INTEGER,
    typing_duration_options JSONB DEFAULT '["1min", "3min", "5min", "10min"]',
    category TEXT,
    tags TEXT[],
    featured_image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    keywords TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Full text search support
ALTER TABLE typing_test
ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
) STORED;

-- Indexes for fast querying
CREATE INDEX idx_typing_test_search ON typing_test USING GIN(search_vector);
CREATE INDEX idx_typing_test_slug ON typing_test(slug);
CREATE INDEX idx_typing_test_difficulty ON typing_test(difficulty_level);
CREATE INDEX idx_typing_test_category ON typing_test(category);
CREATE INDEX idx_typing_test_created_at ON typing_test(created_at DESC);

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_typing_test_modtime
BEFORE UPDATE ON typing_test
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Row Level Security (RLS) policies
ALTER TABLE typing_test ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published tests
CREATE POLICY "Public profiles are viewable by everyone."
ON typing_test FOR SELECT
USING (is_published = true);

-- Allow admins full access
CREATE POLICY "Admins can insert tests"
ON typing_test FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update tests"
ON typing_test FOR UPDATE
USING (auth.role() = 'authenticated');

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE typing_test
  SET views = views + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Phase 4 Migration: AI Generation Upgrade (Hindi + Quality + Dedup)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. pgvector extension (Supabase-native) for semantic similarity checks
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. New typing_test columns
ALTER TABLE typing_test
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS keyboard_layout TEXT,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS content_embedding vector(768),
  ADD COLUMN IF NOT EXISTS difficulty_breakdown JSONB;

COMMENT ON COLUMN typing_test.language IS '''en'' or ''hi''';
COMMENT ON COLUMN typing_test.keyboard_layout IS 'null for English; ''kruti_dev'' or ''mangal_inscript'' for Hindi';
COMMENT ON COLUMN typing_test.content_hash IS 'SHA256 of normalized content, for fast exact-duplicate pre-check';
COMMENT ON COLUMN typing_test.content_embedding IS 'Gemini text-embedding-004 vector (768-dim), for cosine-similarity duplicate detection';
COMMENT ON COLUMN typing_test.difficulty_breakdown IS 'e.g. {"easy_pct":40,"medium_pct":40,"hard_pct":20} — achieved word-level mix';

-- 3. Supporting indexes
CREATE INDEX IF NOT EXISTS idx_typing_test_language ON typing_test(language);
CREATE INDEX IF NOT EXISTS idx_typing_test_layout ON typing_test(keyboard_layout);
CREATE INDEX IF NOT EXISTS idx_typing_test_content_hash ON typing_test(content_hash);
CREATE INDEX IF NOT EXISTS idx_typing_test_embedding ON typing_test
  USING hnsw (content_embedding vector_cosine_ops);

-- 4. RPC used by embeddings.js to find the most similar existing test
--    (Supabase JS client can't do `<=>` directly, so we expose it as a function)
CREATE OR REPLACE FUNCTION match_typing_test_embedding(
  query_embedding vector(768),
  match_language TEXT DEFAULT NULL,
  match_limit INT DEFAULT 1
)
RETURNS TABLE (id UUID, similarity FLOAT)
LANGUAGE sql STABLE
AS $$
  SELECT id, 1 - (content_embedding <=> query_embedding) AS similarity
  FROM typing_test
  WHERE content_embedding IS NOT NULL
    AND (match_language IS NULL OR language = match_language)
  ORDER BY content_embedding <=> query_embedding
  LIMIT match_limit;
$$;

-- 5. Generation history / audit log
CREATE TABLE IF NOT EXISTS generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  slot TEXT NOT NULL,                 -- 'en' | 'hi_kruti' | 'hi_mangal'
  topic TEXT,
  status TEXT NOT NULL,               -- 'success' | 'failed' | 'skipped_duplicate' | 'skipped_quality'
  test_id UUID REFERENCES typing_test(id) ON DELETE SET NULL,
  error TEXT,
  attempt_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generation_log_run_date ON generation_log(run_date DESC);
CREATE INDEX IF NOT EXISTS idx_generation_log_status ON generation_log(status);

ALTER TABLE generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read generation_log"
ON generation_log FOR SELECT
USING (auth.role() = 'authenticated');

-- 6. One-off cleanup: retire (not delete) legacy sub-600-word tests.
--    Safe to leave in this file — idempotent (re-running just re-applies the same filter).
UPDATE typing_test
SET is_published = false
WHERE word_count < 600;

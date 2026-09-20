-- Phase 2: persist real per-key data, game scores and course progress.
-- Apply on the VPS:
--   docker exec -i postgres psql -U postgres -d fasttypinglab < 20260921_phase2_persistence.sql
-- Idempotent: safe to run twice.

-- Per-key stats for one typing session (feeds the heatmap + AI weak-key analysis).
CREATE TABLE IF NOT EXISTS public.session_key_stats (
    id          bigserial PRIMARY KEY,
    session_id  integer NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    user_id     uuid,
    key         text    NOT NULL CHECK (char_length(key) BETWEEN 1 AND 8),
    hits        integer NOT NULL CHECK (hits >= 0),
    errors      integer NOT NULL CHECK (errors >= 0),
    total_ms    integer NOT NULL DEFAULT 0 CHECK (total_ms >= 0),
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS session_key_stats_session_idx ON public.session_key_stats (session_id);
CREATE INDEX IF NOT EXISTS session_key_stats_user_idx    ON public.session_key_stats (user_id, key);

-- Per-user heatmap: all-time aggregate per key, computed from the rows above.
CREATE OR REPLACE VIEW public.user_key_heatmap AS
SELECT user_id,
       key,
       sum(hits)::int                                        AS hits,
       sum(errors)::int                                      AS errors,
       CASE WHEN sum(hits) > 0 THEN round(sum(total_ms)::numeric / sum(hits)) END AS avg_ms
FROM public.session_key_stats
WHERE user_id IS NOT NULL
GROUP BY user_id, key;

-- Game results (previously mis-filed as typing sessions and could hit the WPM leaderboard).
CREATE TABLE IF NOT EXISTS public.game_scores (
    id          bigserial PRIMARY KEY,
    user_id     uuid,
    game        text NOT NULL CHECK (char_length(game) BETWEEN 1 AND 40),
    score       integer NOT NULL CHECK (score >= 0),
    wpm         integer CHECK (wpm BETWEEN 0 AND 400),
    accuracy    real    CHECK (accuracy BETWEEN 0 AND 100),
    duration    integer CHECK (duration BETWEEN 0 AND 3600),
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS game_scores_game_score_idx ON public.game_scores (game, score DESC);
CREATE INDEX IF NOT EXISTS game_scores_user_idx       ON public.game_scores (user_id, game);

-- Hindi course progress, per user / course / lesson (replaces localStorage-only state).
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    user_id        uuid    NOT NULL,
    course         text    NOT NULL CHECK (course IN ('unicode', 'kruti')),
    lesson_id      integer NOT NULL CHECK (lesson_id BETWEEN 1 AND 1000),
    stars          integer NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 5),
    best_wpm       integer NOT NULL DEFAULT 0 CHECK (best_wpm BETWEEN 0 AND 400),
    best_accuracy  real    NOT NULL DEFAULT 0 CHECK (best_accuracy BETWEEN 0 AND 100),
    attempts       integer NOT NULL DEFAULT 0,
    completed_at   timestamptz,
    updated_at     timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, course, lesson_id)
);

-- RLS: the backend uses the service role (bypasses RLS); nothing here is
-- readable or writable directly by anon/authenticated through PostgREST.
ALTER TABLE public.session_key_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress   ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.session_key_stats, public.game_scores, public.lesson_progress FROM anon, authenticated;
REVOKE ALL ON public.user_key_heatmap FROM anon, authenticated;
GRANT ALL ON public.session_key_stats, public.game_scores, public.lesson_progress, public.user_key_heatmap TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

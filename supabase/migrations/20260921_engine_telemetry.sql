-- Typing engine v2 telemetry: which engine produced a run and how text was entered,
-- so v1 vs v2 error rates can be compared before v2 becomes the default.
-- Apply:  docker exec -i postgres psql -U postgres -d fasttypinglab < 20260921_engine_telemetry.sql
-- Idempotent. The backend keeps saving sessions even if this has not been applied yet.

ALTER TABLE public.test_sessions
  ADD COLUMN IF NOT EXISTS engine_version text,
  ADD COLUMN IF NOT EXISTS input_method   text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'test_sessions_engine_version_check') THEN
    ALTER TABLE public.test_sessions
      ADD CONSTRAINT test_sessions_engine_version_check
      CHECK (engine_version IS NULL OR engine_version IN ('v1', 'v2'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'test_sessions_input_method_check') THEN
    ALTER TABLE public.test_sessions
      ADD CONSTRAINT test_sessions_input_method_check
      CHECK (input_method IS NULL OR input_method IN ('key-events', 'os-layout', 'built-in-inscript', 'ime', 'touch', 'unknown'));
  END IF;
END $$;

-- Handy comparison once data arrives:
--   SELECT engine_version, input_method, count(*), round(avg(accuracy)::numeric,1) AS avg_acc, round(avg(net_wpm)::numeric,1) AS avg_wpm
--   FROM test_sessions WHERE engine_version IS NOT NULL GROUP BY 1,2 ORDER BY 1,2;

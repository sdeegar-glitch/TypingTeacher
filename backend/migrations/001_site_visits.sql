-- Visitor tracking for the public site.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- The backend talks to this table with the service-role key, which bypasses RLS,
-- so RLS is enabled with NO public policies (anon clients can't read raw visit rows).

CREATE TABLE IF NOT EXISTS site_visits (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    visitor_id  UUID NOT NULL,                 -- stable per-browser id (localStorage)
    path        TEXT,                          -- page the visit landed on
    referrer    TEXT,
    user_agent  TEXT,
    ip_address  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_visits_visitor ON site_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_created ON site_visits(created_at DESC);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Fast distinct-visitor count, callable via supabase.rpc('count_unique_visitors').
CREATE OR REPLACE FUNCTION count_unique_visitors()
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(DISTINCT visitor_id) FROM site_visits;
$$;

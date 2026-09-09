-- Referral programme.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- The backend talks to these with the service-role key, which bypasses RLS, so
-- RLS is enabled with NO public policies — anon clients cannot read referral rows
-- (they would otherwise expose who invited whom, which is personal data).

-- Each user gets a short share code, generated lazily the first time they open
-- the refer page. Nullable because existing accounts predate this column.
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Who invited this user. Denormalised alongside the referrals table below so a
-- single users row answers "was this account referred?" without a join.
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID;

-- Partial unique index (not a UNIQUE constraint) so the many existing rows with
-- NULL codes don't collide with each other.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code
    ON users(referral_code)
    WHERE referral_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS referrals (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    referrer_id       UUID NOT NULL,
    -- UNIQUE: an account can only ever be referred once. This is the database-level
    -- guarantee behind the anti-abuse rules; application checks can be raced, this
    -- cannot. A duplicate insert fails loudly instead of inflating someone's count.
    referred_user_id  UUID NOT NULL UNIQUE,
    code_used         TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created  ON referrals(created_at DESC);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Note: there is deliberately no "qualified" column. Whether a referral counts is
-- derived at read time from whether the referred user has actually completed a
-- typing test. Storing it would need a write hook on every session insert and
-- could drift out of sync; deriving it cannot.

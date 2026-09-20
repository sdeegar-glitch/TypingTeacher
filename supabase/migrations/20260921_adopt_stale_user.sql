-- Re-registered accounts vs. stale public.users rows.
--
-- Auth accounts were NOT migrated from Supabase Cloud, but public.users rows
-- were. A person who signs up again with the same email gets a NEW auth id, and
-- inserting their profile row fails on users_email_key -- so every FK to
-- users(id) (test_sessions, user_badges, ...) rejects them.
--
-- This function retires the orphaned row (frees its email) and creates a fresh
-- row for the real login. SECURITY: the fresh row is ALWAYS role='user' with no
-- 2FA secret -- privileges are never inherited from a stale row (GoTrue has
-- email autoconfirm on, so anyone can register any email). A ban IS inherited
-- so it cannot be evaded by re-registering.
--
-- Apply:  docker exec -i postgres psql -U postgres -d fasttypinglab < 20260921_adopt_stale_user.sql

CREATE OR REPLACE FUNCTION public.adopt_stale_user_row(p_id uuid, p_email text, p_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_id uuid;
  v_banned boolean;
BEGIN
  SELECT id, is_banned INTO v_old_id, v_banned
  FROM public.users
  WHERE lower(email) = lower(p_email) AND id <> p_id
  LIMIT 1;

  IF v_old_id IS NOT NULL THEN
    UPDATE public.users
       SET email = 'stale+' || v_old_id::text || '@invalid.local'
     WHERE id = v_old_id;
  END IF;

  INSERT INTO public.users (id, email, name, is_banned)
  VALUES (p_id, p_email, p_name, COALESCE(v_banned, false))
  ON CONFLICT (id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.adopt_stale_user_row(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adopt_stale_user_row(uuid, text, text) TO service_role;

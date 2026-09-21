-- Certificates are issued only from a saved test session that meets the
-- eligibility rules (enforced in backend/routes/certificates.js). Link each
-- certificate to its session so one session can only ever produce one.
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS session_id integer;
CREATE UNIQUE INDEX IF NOT EXISTS certificates_session_id_key
  ON public.certificates (session_id) WHERE session_id IS NOT NULL;

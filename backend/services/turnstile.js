// Cloudflare Turnstile (CAPTCHA) server-side verification.
//
// 1. In your Cloudflare dashboard: Turnstile -> Add widget -> pick "Managed"
//    -> add fasttypinglab.com as the domain.
// 2. Copy the Site Key into the frontend's VITE_TURNSTILE_SITE_KEY env var,
//    and the Secret Key into this server's TURNSTILE_SECRET_KEY in .env.
// 3. Restart the backend. Login/signup will start requiring a passed
//    challenge automatically -- no code change needed.
//
// Until TURNSTILE_SECRET_KEY is set, verification is skipped (returns valid),
// so auth keeps working exactly as before while you set this up.
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { success: true, skipped: true };
  if (!token || typeof token !== 'string') return { success: false, error: 'missing-token' };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    return { success: !!data.success, errorCodes: data['error-codes'] };
  } catch (err) {
    // Fail closed on a broken network call to Cloudflare -- don't let an
    // outage on their end silently disable the check.
    console.error('[Turnstile] verify request failed:', err.message);
    return { success: false, error: 'verify-request-failed' };
  }
}

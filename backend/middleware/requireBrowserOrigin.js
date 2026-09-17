// Shared guard for public write endpoints that should only ever be called
// from our own frontend's browser context, never scripted directly against
// the API. A real browser call always carries a matching Origin header; a
// script hitting the endpoint directly usually doesn't bother forging one.
//
// The global CORS middleware in index.js intentionally allows requests with
// no Origin through (needed for legitimate non-browser callers elsewhere,
// e.g. server-to-server or curl-based health checks), so this is enforced
// per-route instead of loosening that check for everyone.
const ALLOWED_ORIGINS = new Set([
  'https://fasttypinglab.com',
  'http://localhost:5173',
]);

export function requireBrowserOrigin(req, res, next) {
  const origin = req.headers.origin;
  // Tauri's desktop-app webview doesn't send a standard http(s) Origin.
  const isTauri = typeof origin === 'string' && origin.startsWith('tauri://');
  if (origin && (ALLOWED_ORIGINS.has(origin) || isTauri)) return next();
  return res.status(403).json({ error: 'Origin not allowed' });
}

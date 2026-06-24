import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

export function generateSecret() {
  return authenticator.generateSecret();
}

export function verifyTotp(token, secret) {
  try {
    return authenticator.verify({ token: String(token).trim(), secret });
  } catch {
    return false;
  }
}

export async function generateQrCode(email, secret) {
  const uri = authenticator.keyuri(email, 'FastTypingLab Admin', secret);
  return QRCode.toDataURL(uri);
}

// ── In-progress 2FA setup (admin id -> secret), not yet persisted/enabled ──
const setupInProgress = new Map();
export function startSetup(adminId, secret) { setupInProgress.set(adminId, secret); }
export function getSetupSecret(adminId) { return setupInProgress.get(adminId); }
export function clearSetup(adminId) { setupInProgress.delete(adminId); }

// ── Post-password, pre-2FA pending sessions ─────────────────────────────
// The real Supabase access token is held here, never sent to the client,
// until the TOTP code is verified.
const pendingLogins = new Map();
const PENDING_TTL_MS = 5 * 60 * 1000;

export function createPendingLogin(payload) {
  const token = crypto.randomBytes(32).toString('hex');
  pendingLogins.set(token, { ...payload, expiresAt: Date.now() + PENDING_TTL_MS });
  return token;
}

export function peekPendingLogin(token) {
  const entry = pendingLogins.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { pendingLogins.delete(token); return null; }
  return entry;
}

export function consumePendingLogin(token) {
  const entry = peekPendingLogin(token);
  if (entry) pendingLogins.delete(token);
  return entry;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pendingLogins) if (now > v.expiresAt) pendingLogins.delete(k);
}, 60000);

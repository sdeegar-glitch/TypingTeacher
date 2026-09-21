/** Must match CERT_RULES in backend/routes/certificates.js (the server is the authority). */
export const CERT_RULES = { minWpm: 35, minAccuracy: 85, minSeconds: 900 };

/** Human-readable reasons a run misses the certificate rules; empty when it qualifies. */
export function certificateShortfalls(wpm: number, accuracy: number, seconds: number): string[] {
  const out: string[] = [];
  if (wpm < CERT_RULES.minWpm) out.push(`speed ${wpm} of ${CERT_RULES.minWpm} WPM`);
  if (accuracy < CERT_RULES.minAccuracy) out.push(`accuracy ${Math.round(accuracy)}% of ${CERT_RULES.minAccuracy}%`);
  if (seconds < CERT_RULES.minSeconds) out.push(`test ${Math.floor(seconds / 60)} of ${CERT_RULES.minSeconds / 60} min`);
  return out;
}

import { useEffect, useRef, useState } from 'react';

// Cloudflare Turnstile (CAPTCHA) widget for the login/signup forms.
// Renders nothing until VITE_TURNSTILE_SITE_KEY is set — see
// backend/services/turnstile.js for the matching server-side setup, which
// no-ops the same way until its secret key is configured. This keeps auth
// working exactly as before if Turnstile hasn't been set up yet.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load Turnstile'));
      document.head.appendChild(s);
    });
  }
  return scriptLoadPromise;
}

interface TurnstileWidgetProps {
  onToken: (token: string | null) => void;
  /** Bump this to force the widget to reset (e.g. switching between login/register). */
  resetKey?: unknown;
}

/** Renders nothing (and calls onToken(null), i.e. "not required") if unconfigured. */
export default function TurnstileWidget({ onToken, resetKey }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) { onToken(null); return; }
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => { onToken(null); setError(true); },
        });
      })
      .catch(() => setError(true));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* already gone */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  if (!SITE_KEY) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 py-1">
      <div ref={containerRef} />
      {error && (
        <p className="text-[11px] text-rose-500 text-center">
          Verification widget failed to load. Check your connection and try again.
        </p>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';
import { isLoggedIn } from '../lib/auth';
import { trackEvent } from '../lib/analytics';

interface SignupPromptBannerProps {
  /** Short benefit-focused message shown to the visitor. */
  message?: string;
  /** Label on the call-to-action button. */
  cta?: string;
  /** localStorage key so a dismissal is remembered per-context. */
  dismissKey?: string;
}

/**
 * A soft, dismissible nudge to create a free account. Renders nothing for
 * logged-in users, so it never walls content or interrupts the funnel — it
 * only appears at "aha moments" (e.g. after a result / on the certificate page).
 */
export default function SignupPromptBanner({
  message = 'Create a free account to save your progress, track your speed over time, and download your certificate anytime.',
  cta = 'Create free account',
  dismissKey = 'signupPromptDismissed',
}: SignupPromptBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(dismissKey) === '1'; } catch { return false; }
  });

  const visible = !isLoggedIn() && !dismissed;

  useEffect(() => {
    if (visible) trackEvent('signup_banner_shown', { dismissKey, page: window.location.pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    trackEvent('signup_banner_dismiss', { dismissKey });
    setDismissed(true);
    try { localStorage.setItem(dismissKey, '1'); } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="relative flex flex-col sm:flex-row sm:items-center gap-3.5 rounded-lg p-4 sm:p-5 border border-brand-border bg-brand-surface shadow-sm overflow-hidden"
      >
        <div className="w-9 h-9 shrink-0 rounded-md flex items-center justify-center bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
          <UserPlus className="w-4 h-4" />
        </div>

        <p className="flex-1 text-sm text-brand-text leading-relaxed pr-6 sm:pr-0">
          {message}
        </p>

        <Link
          to="/signup"
          onClick={() => trackEvent('signup_banner_click', { dismissKey, page: window.location.pathname })}
          className="shrink-0 inline-flex items-center justify-center gap-2 text-white font-medium px-4 py-2 rounded-md text-sm bg-brand-primary hover:opacity-95 shadow-sm active:scale-[0.98] transition-all"
        >
          {cta}
        </Link>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2.5 right-2.5 sm:static sm:ml-1 p-1 text-brand-muted hover:text-brand-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

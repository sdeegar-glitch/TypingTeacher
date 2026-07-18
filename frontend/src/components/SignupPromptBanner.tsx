import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';
import { isLoggedIn } from '../lib/auth';

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

  if (isLoggedIn() || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(dismissKey, '1'); } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="relative flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl p-4 sm:p-5 border overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(48,76,83,0.10), rgba(42,157,174,0.10))',
          borderColor: 'rgba(42,157,174,0.25)',
        }}
      >
        <div
          className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white shadow-md"
          style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}
        >
          <UserPlus className="w-5 h-5" />
        </div>

        <p className="flex-1 text-sm text-brand-text leading-relaxed pr-6 sm:pr-0">
          {message}
        </p>

        <Link
          to="/signup"
          className="shrink-0 inline-flex items-center justify-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 14px rgba(188,108,80,.30)' }}
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

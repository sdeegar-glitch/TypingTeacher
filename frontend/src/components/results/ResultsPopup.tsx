import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronRight, MessageCircle, Send, UserPlus } from 'lucide-react';
import { WHATSAPP_URL, TELEGRAM_URL } from '../../lib/social';
import { isLoggedIn } from '../../lib/auth';
import { trackEvent } from '../../lib/analytics';

interface Unlock { icon: string; name: string; xp: number }

interface ResultsPopupProps {
  netWpm: number;
  accuracy: number;
  challengeUrl: string;
  newUnlock: Unlock | null;
  prefersReducedMotion: boolean;
  onReset: () => void;
}

/**
 * The short post-test popup: two numbers, one achievement banner, and the
 * primary highlighted actions — join WhatsApp/Telegram and create a free
 * account — with a low-key "share your score" link underneath rather than
 * its own buttons. Deliberately excludes everything else the old all-in-one
 * modal showed — that detail lives in the /results report instead. Sized to
 * a fixed content budget (no overflow-y-auto fallback) so it never scrolls,
 * on any screen size — `dvh` rather than `vh` because `vh` on mobile
 * Safari/Chrome doesn't account for the collapsing address bar, which is the
 * most likely reason the old modal still scrolled on phones even when its
 * content looked short enough in a desktop browser.
 */
export default function ResultsPopup({ netWpm, accuracy, challengeUrl, newUnlock, prefersReducedMotion, onReset }: ResultsPopupProps) {
  const showSignup = !isLoggedIn();

  const shareMessage = `I scored ${netWpm} WPM (${accuracy}% accuracy) on FastTypingLab. Think you can beat me on the same passage? 🏁 ${challengeUrl}`;
  const shareWhatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const shareTelegramHref = `https://t.me/share/url?url=${encodeURIComponent(challengeUrl)}&text=${encodeURIComponent(
    `I scored ${netWpm} WPM (${accuracy}% accuracy) on FastTypingLab. Think you can beat me on the same passage? 🏁`
  )}`;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
      >
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.9, y: 20, opacity: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0.15 } : { type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-brand-surface border border-brand-border rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl max-h-[85dvh] overflow-hidden flex flex-col"
        >
          <div className="text-4xl mb-2">{accuracy >= 95 ? '🏆' : accuracy >= 80 ? '🎉' : '💪'}</div>
          <h2 className="text-xl font-black text-brand-text mb-3">Test Complete!</h2>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-2xl py-4 text-white shadow-md" style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
              <div className="text-4xl font-black font-mono leading-none">{netWpm}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 mt-1">WPM</div>
            </div>
            <div className={`rounded-2xl py-4 text-white shadow-md`} style={{ background: accuracy >= 90 ? 'linear-gradient(135deg,#2A9DAE,#54c1cf)' : 'linear-gradient(135deg,#E05252,#c73f3f)' }}>
              <div className="text-4xl font-black font-mono leading-none">{accuracy}%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 mt-1">Accuracy</div>
            </div>
          </div>

          {newUnlock && (
            <div className="mb-3 flex items-center gap-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2 text-left">
              <span className="text-xl shrink-0">{newUnlock.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-none">Achievement Unlocked!</div>
                <div className="text-sm font-semibold text-brand-text truncate">{newUnlock.name}</div>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-500 shrink-0">+{newUnlock.xp} XP</span>
            </div>
          )}

          <div className={`grid ${showSignup ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 mb-2`}>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_cta_click', { variant: 'popup', page: window.location.pathname })}
              className="flex flex-col items-center justify-center gap-1 text-white font-bold text-[11px] py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#188842' }}
            >
              <MessageCircle className="w-4 h-4" /> Join
            </a>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('telegram_cta_click', { variant: 'popup', page: window.location.pathname })}
              className="flex flex-col items-center justify-center gap-1 text-white font-bold text-[11px] py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#1B7EAE' }}
            >
              <Send className="w-4 h-4" /> Join
            </a>
            {showSignup && (
              <Link
                to="/signup"
                onClick={() => trackEvent('signup_banner_click', { dismissKey: 'resultsPopup', page: window.location.pathname })}
                className="flex flex-col items-center justify-center gap-1 text-white font-bold text-[11px] py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}
              >
                <UserPlus className="w-4 h-4" /> Sign up
              </Link>
            )}
          </div>

          <p className="text-[11px] text-brand-muted mb-3">
            Or dare a friend to beat this score:{' '}
            <a
              href={shareWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_score_share_click', { page: window.location.pathname })}
              className="font-bold text-brand-primary hover:underline"
            >
              WhatsApp
            </a>
            {' · '}
            <a
              href={shareTelegramHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('telegram_score_share_click', { page: window.location.pathname })}
              className="font-bold text-brand-primary hover:underline"
            >
              Telegram
            </a>
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={onReset}
              className="flex-1 bg-brand-surface-2 hover:bg-brand-border text-brand-text py-2.5 rounded-xl font-bold text-sm transition-all border border-brand-border flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
            <Link
              to="/results"
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white text-center transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-1"
              style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}
            >
              Full report <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

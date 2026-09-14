import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronRight } from 'lucide-react';
import ScoreShareButtons from './ScoreShareButtons';

interface Unlock { icon: string; name: string; xp: number }

interface ResultsPopupProps {
  netWpm: number;
  accuracy: number;
  challengeUrl: string;
  newUnlock: Unlock | null;
  prefersReducedMotion: boolean;
  onReset: () => void;
}

/** One line, matched to how fast the run was — sets up the share buttons below it. */
function motivateLine(netWpm: number): string {
  if (netWpm >= 60) return "🔥 That's a fast run — flex it. Challenge your friends:";
  if (netWpm >= 35) return 'Solid speed! Bet your friends can\'t keep up 👀';
  return 'Every run makes you faster. Dare a friend to try it 🏁';
}

/**
 * The short post-test popup: two numbers, one nudge, two share buttons, one
 * way to see more. Deliberately excludes everything else the old all-in-one
 * modal showed — that detail lives in the /results report instead. Sized to
 * a fixed content budget (no overflow-y-auto fallback) so it never scrolls,
 * on any screen size — `dvh` rather than `vh` because `vh` on mobile
 * Safari/Chrome doesn't account for the collapsing address bar, which is the
 * most likely reason the old modal still scrolled on phones even when its
 * content looked short enough in a desktop browser.
 */
export default function ResultsPopup({ netWpm, accuracy, challengeUrl, newUnlock, prefersReducedMotion, onReset }: ResultsPopupProps) {
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

          <p className="text-xs text-brand-muted mb-2">{motivateLine(netWpm)}</p>
          <ScoreShareButtons wpm={netWpm} accuracy={accuracy} challengeUrl={challengeUrl} />

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

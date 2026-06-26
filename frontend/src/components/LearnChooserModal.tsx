import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Keyboard, Languages } from 'lucide-react';

interface LearnChooserModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'language' | 'hindiLayout';

/**
 * "Start Learning" entry flow.
 * Step 1 — English or Hindi.
 * Step 2 (Hindi only) — Mangal INSCRIPT (Unicode) or Kruti Dev.
 * Routes the user to the matching course.
 */
export default function LearnChooserModal({ open, onClose }: LearnChooserModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('language');

  // Reset to the first step whenever the modal is (re)opened.
  useEffect(() => {
    if (open) setStep('language');
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (to: string) => { onClose(); navigate(to); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-brand-bg/70 backdrop-blur-sm" onClick={onClose} />

          {/* Panel */}
          <motion.div
            role="dialog" aria-modal="true" aria-label="Choose what to learn"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl glass-card">

            <button onClick={onClose} aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-surface-2 transition-all">
              <X className="w-5 h-5" />
            </button>

            {step === 'language' ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-brand-text">What do you want to learn?</h2>
                  <p className="text-brand-text-muted text-sm mt-1.5">Pick a language to start your typing course.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* English */}
                  <button onClick={() => go('/learn')}
                    className="group text-left rounded-2xl p-5 border border-brand-border hover:border-brand-primary/40 hover:shadow-lg transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--brand-surface)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md mb-3"
                      style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                      <Keyboard className="w-6 h-6" />
                    </div>
                    <div className="font-black text-brand-text">English Typing</div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">QWERTY touch-typing from home row to speed drills.</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-primary mt-3">
                      Start <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Hindi */}
                  <button onClick={() => setStep('hindiLayout')}
                    className="group text-left rounded-2xl p-5 border border-brand-border hover:border-brand-cta/40 hover:shadow-lg transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--brand-surface)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md mb-3"
                      style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
                      <Languages className="w-6 h-6" />
                    </div>
                    <div className="font-black text-brand-text">Hindi Typing</div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">Devanagari typing for SSC, CPCT &amp; govt exams.</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-cta mt-3">
                      Choose layout <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setStep('language')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors mb-3">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-brand-text">Choose your Hindi layout</h2>
                  <p className="text-brand-text-muted text-sm mt-1.5">Both prepare you for government typing exams.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Mangal INSCRIPT (Unicode) */}
                  <button onClick={() => go('/learn-hindi-typing/unicode')}
                    className="group text-left rounded-2xl p-5 border border-brand-border hover:border-brand-primary/40 hover:shadow-lg transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--brand-surface)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md mb-3"
                      style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                      <span className="font-black" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>म</span>
                    </div>
                    <div className="font-black text-brand-text">Mangal INSCRIPT</div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">Unicode layout built into Windows — standard for most current exams.</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-primary mt-3">
                      Start <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Kruti Dev */}
                  <button onClick={() => go('/learn-hindi-typing/kruti-dev')}
                    className="group text-left rounded-2xl p-5 border border-brand-border hover:border-brand-cta/40 hover:shadow-lg transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--brand-surface)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md mb-3"
                      style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
                      <span className="font-black" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>क</span>
                    </div>
                    <div className="font-black text-brand-text">Kruti Dev</div>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">Legacy font layout still used by UP Police, Bihar SSC &amp; courts.</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-brand-cta mt-3">
                      Start <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

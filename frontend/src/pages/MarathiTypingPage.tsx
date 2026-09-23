import { useState, useEffect } from 'react';
import CertificateButton from '../components/CertificateButton';
import Seo from '../components/Seo';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Languages } from 'lucide-react';
import { saveSession } from '../lib/api';
import ClusterText from '../components/ClusterText';
import { useTypingEngineV2 } from '../hooks/useTypingEngineV2';
import type { TypingStats } from '../hooks/useTypingEngine';

// Marathi uses the same Devanagari script and Mangal/INSCRIPT keyboard layout
// as Hindi, so this page reuses the identical engine/keyboard plumbing as
// HindiTypingPage.tsx — only the passage content and labels differ.
const MARATHI_PASSAGES = [
  'भारत हा विविधतेने नटलेला विशाल देश आहे. येथे अनेक भाषा, धर्म आणि संस्कृती एकत्र नांदतात. भारतीय राज्यघटनेने सर्व नागरिकांना समान हक्क आणि स्वातंत्र्य दिले आहे.',
  'सरकारने ग्रामीण भागात डिजिटल साक्षरता वाढवण्यासाठी नवीन योजना जाहीर केली आहे. या उपक्रमांतर्गत मोफत संगणक प्रशिक्षण केंद्रे सुरू केली जातील.',
  'मराठी ही महाराष्ट्राची राजभाषा असून कोट्यवधी लोक ती बोलतात. मराठी टायपिंग शिकणे सरकारी नोकऱ्यांसाठी खूप उपयुक्त आहे. रोज सराव केल्याने टायपिंगचा वेग सुधारतो.',
  'भारतीय अर्थव्यवस्था वेगाने प्रगती करत आहे. डिजिटल पेमेंट प्रणालीमुळे व्यापार सोपा आणि सोयीस्कर झाला आहे. तरुणांसाठी रोजगाराच्या नव्या संधी निर्माण होत आहेत.',
  'शिक्षण हा प्रत्येक नागरिकाचा मूलभूत हक्क आहे. सरकारने प्राथमिक शिक्षण सक्तीचे आणि मोफत केले आहे. मुलांना दर्जेदार शिक्षण मिळाले पाहिजे जेणेकरून ते देशाचे भविष्य घडवू शकतील.',
  'महाराष्ट्र शासनाने प्रशासकीय कामकाज अधिक पारदर्शक आणि गतिमान करण्यासाठी अनेक सुधारणा राबवल्या आहेत. ई-गव्हर्नन्स प्रणालीमुळे नागरिकांना विविध सेवा ऑनलाइन उपलब्ध झाल्या असून वेळ आणि पैसा दोन्हींची बचत होत आहे. लोकसेवा हक्क कायद्यामुळे शासकीय कार्यालयांतील कामकाजाला ठराविक कालमर्यादा निश्चित करण्यात आली आहे.',
  'स्पर्धा परीक्षांची तयारी करणाऱ्या उमेदवारांसाठी नियमित सराव अत्यंत महत्त्वाचा असतो. टायपिंग चाचणी उत्तीर्ण होण्यासाठी वेग आणि अचूकता या दोन्ही गोष्टींवर लक्ष केंद्रित करणे आवश्यक आहे. रोज ठराविक वेळ सराव केल्यास आत्मविश्वास वाढतो आणि प्रत्यक्ष परीक्षेत चांगली कामगिरी करता येते.',
];
// Note: these passages are original text written for typing practice, not
// sourced from a native-speaker-reviewed or official corpus — flagged the
// same way to the site owner as the original five. Fine for general typing
// practice; treat as unverified if used to make exam-accuracy claims.

export default function MarathiTypingPage() {
  const [passageIdx] = useState(() => Math.floor(Math.random() * MARATHI_PASSAGES.length));
  const passage = MARATHI_PASSAGES[passageIdx];
  const [timeMode, setTimeMode] = useState<60|120|300>(60);
  const [done, setDone] = useState<TypingStats | null>(null);

  // Shared v2 engine: hidden textarea reads the text (OS Marathi keyboard, IME,
  // phone keyboard or built-in INSCRIPT), one timer and one scoring formula.
  const engine = useTypingEngineV2(passage, timeMode, (final) => {
    setDone(final);
    try {
      const hist = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      hist.push({ netWpm: final.netWpm, accuracy: final.accuracy, lang: 'marathi', date: new Date().toISOString() });
      localStorage.setItem('typingHistory', JSON.stringify(hist));
    } catch {}
    saveSession({
      duration: final.elapsedSeconds,
      gross_wpm: final.wpm,
      net_wpm: final.netWpm,
      errors: final.errors,
      accuracy: final.accuracy,
      lang: 'marathi',
      key_stats: engine.getKeyStats(),
      engine_version: 'v2',
      input_method: engine.inputMethod,
    });
  }, { enabled: true, mangal: true, onRestart: () => reset() });
  const { stats, userInput: typed, mistakes: wrongIdx, skipped } = engine;
  const started = stats.isActive || stats.isFinished;
  const finished = stats.isFinished;
  const timeLeft = stats.timeLeft;
  const wpm = done?.netWpm ?? stats.netWpm;
  const accuracy = done?.accuracy ?? stats.accuracy;
  const mistakes = done?.errors ?? stats.errors;

  useEffect(() => {
    document.title = 'Marathi Typing Test — Unicode | FastTypingLab';
    // Load Noto Sans Devanagari
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const reset = () => {
    engine.reset();
    setDone(null);
    setTimeout(() => engine.focus(), 50);
  };

  const progress = stats.progress;
  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  return (
    <div className="bg-brand-bg text-brand-text py-4 sm:py-6 px-4 sm:px-6">
      <Seo
        title="Marathi Typing Test — Unicode (Mangal/INSCRIPT) | FastTypingLab"
        description="Free Marathi typing test in Unicode Mangal/INSCRIPT — the layout used by GCC-TBC. Practice with real-time WPM and accuracy, plus the real MPSC Clerk-Typist speed and error-limit rules."
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/tests/" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm group">
            <ChevronLeft className="w-4 h-4" /> Tests
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Languages className="w-5 h-5 text-brand-primary" /> Marathi Typing Test
          </h1>
        </div>

        {/* Mode selector */}
        {!started && (
          <div className="flex gap-2 mb-5">
            {([60, 120, 300] as const).map(m => (
              <button key={m} onClick={() => setTimeMode(m)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${timeMode === m ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'}`}>
                {m === 60 ? '1 min' : m === 120 ? '2 min' : '5 min'}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-sm font-mono font-bold text-brand-primary">
              {formattedTime}
            </div>
          </div>
        )}

        {/* Stats bar */}
        {started && (
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'WPM', value: wpm, color: 'text-brand-primary' },
              { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? 'text-brand-accent' : 'text-rose-400' },
              { label: 'Errors', value: mistakes, color: mistakes > 5 ? 'text-rose-400' : 'text-brand-muted' },
              { label: 'Time', value: formattedTime, color: timeLeft <= 10 ? 'text-rose-400' : 'text-brand-text' },
            ].map(s => (
              <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
                <div className={`text-xl font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-brand-muted uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1.5 bg-brand-surface-2 rounded-full mb-4 overflow-hidden">
          <motion.div className="h-full bg-brand-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.15 }} />
        </div>

        {/* Passage display */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-4">
          <p className="text-xl leading-9 select-none" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <ClusterText text={passage} typedLength={typed.length} mistakes={wrongIdx} skipped={skipped} currentIndex={typed.length} />
          </p>
        </div>

        {/* Typing area: the real input is a hidden textarea owned by the engine */}
        {!finished && (
          <div
            onClick={() => engine.focus()}
            className="w-full min-h-[7rem] bg-brand-surface border-2 border-brand-border focus-within:border-brand-primary rounded-2xl px-5 py-4 text-brand-text text-lg cursor-text whitespace-pre-wrap break-words transition-all"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            <textarea {...engine.inputProps} />
            {typed || engine.composing ? (
              <>
                {typed}
                {engine.composing && <span className="text-brand-muted underline">{engine.composing}</span>}
              </>
            ) : (
              <span className="text-brand-muted">इथे टाइप करायला सुरुवात करा…</span>
            )}
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {finished && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">{wpm >= 25 ? '🏆' : '💪'}</div>
              <h2 className="text-2xl font-black text-brand-text mb-4">
                {wpm >= 30 ? 'Excellent!' : wpm >= 20 ? 'Good Job!' : 'Keep Practicing!'}
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Net WPM', value: wpm, color: 'text-brand-primary', target: '30+ for Govt' },
                  { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? 'text-brand-accent' : 'text-rose-400', target: '80%+ required' },
                  { label: 'Errors', value: mistakes, color: 'text-brand-muted', target: '' },
                ].map(s => (
                  <div key={s.label} className="bg-brand-surface-2 border border-brand-border rounded-xl p-4">
                    <div className={`text-3xl font-black font-mono ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-brand-muted mt-1">{s.label}</div>
                    {s.target && <div className="text-[10px] text-brand-muted mt-0.5">{s.target}</div>}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={reset} className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-secondary transition-all">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <CertificateButton wpm={wpm} accuracy={accuracy} seconds={done?.elapsedSeconds ?? 0} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-6 py-2.5 rounded-xl font-bold hover:bg-amber-500/20 transition-all" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO content */}
        <div className="mt-8 bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">Marathi Typing Test — Unicode Mangal/INSCRIPT</h2>
          <p>हा मराठी टायपिंग टेस्ट युनिकोड मंगल (INSCRIPT) कळफलकावर आधारित आहे — GCC-TBC प्रमाणपत्र परीक्षेत वापरला जाणारा तोच लेआउट. सराव करा आणि तुमचा वेग (WPM) वाढवा.</p>
          <p>This test uses the Unicode Mangal/INSCRIPT keyboard layout — the same layout used by GCC-TBC (Government Certificate in Computer Typing Basic Course, MSCE Pune), which grades typing at 30 and 40 WPM. For MPSC Clerk-Typist / Group C, Marathi is usually tested at around 30 WPM net (~1,500 keystrokes in 10 minutes) with a 7% error limit and no backspace — see the <Link to="/mpsc-clerk-typist-typing-test/" className="text-brand-primary hover:underline font-semibold">MPSC Clerk-Typist typing test guide</Link> for the full requirements. Note: some MPSC-track posts have historically required the legacy Remington (typewriter-style) layout instead of Unicode — always confirm the required layout from your own official notification before you start practicing seriously, since the two are not interchangeable.</p>
        </div>
      </div>
    </div>
  );
}

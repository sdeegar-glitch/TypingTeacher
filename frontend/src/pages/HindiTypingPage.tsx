import { useState, useEffect } from 'react';
import Seo from '../components/Seo';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Award, Languages } from 'lucide-react';
import { saveSession } from '../lib/api';
import ClusterText from '../components/ClusterText';
import { useTypingEngineV2 } from '../hooks/useTypingEngineV2';
import type { TypingStats } from '../hooks/useTypingEngine';

const HINDI_PASSAGES = [
  'भारत एक विशाल और विविधता से भरा देश है। यहाँ अनेक भाषाएँ, धर्म और संस्कृतियाँ एक साथ फलती-फूलती हैं। भारतीय संविधान ने सभी नागरिकों को समान अधिकार और स्वतंत्रता प्रदान की है।',
  'सरकार ने ग्रामीण क्षेत्रों में डिजिटल साक्षरता को बढ़ावा देने के लिए एक नई योजना की घोषणा की है। इस पहल के तहत निःशुल्क कंप्यूटर प्रशिक्षण केंद्र स्थापित किए जाएंगे।',
  'हिंदी भारत की राजभाषा है और करोड़ों लोगों द्वारा बोली जाती है। हिंदी टाइपिंग सीखना सरकारी नौकरियों के लिए अत्यंत आवश्यक है। प्रतिदिन अभ्यास करने से टाइपिंग गति में सुधार होता है।',
  'भारतीय अर्थव्यवस्था तेजी से विकास कर रही है। डिजिटल भुगतान प्रणाली ने व्यापार को सरल और सुविधाजनक बना दिया है। युवाओं के लिए रोजगार के नए अवसर उत्पन्न हो रहे हैं।',
  'शिक्षा प्रत्येक नागरिक का मौलिक अधिकार है। सरकार ने प्राथमिक शिक्षा को अनिवार्य और निःशुल्क बनाया है। बच्चों को गुणवत्तापूर्ण शिक्षा मिलनी चाहिए ताकि वे देश का भविष्य संवार सकें।',
];

export default function HindiTypingPage() {
  const [passageIdx] = useState(() => Math.floor(Math.random() * HINDI_PASSAGES.length));
  const passage = HINDI_PASSAGES[passageIdx];
  const [timeMode, setTimeMode] = useState<60|120|300>(60);
  const [done, setDone] = useState<TypingStats | null>(null);

  // Shared v2 engine: hidden textarea reads the text (OS Hindi keyboard, IME, phone
  // keyboard or built-in INSCRIPT), one timer and one scoring formula.
  const engine = useTypingEngineV2(passage, timeMode, (final) => {
    setDone(final);
    try {
      const hist = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      hist.push({ netWpm: final.netWpm, accuracy: final.accuracy, lang: 'hindi', date: new Date().toISOString() });
      localStorage.setItem('typingHistory', JSON.stringify(hist));
    } catch {}
    saveSession({
      duration: final.elapsedSeconds,
      gross_wpm: final.wpm,
      net_wpm: final.netWpm,
      errors: final.errors,
      accuracy: final.accuracy,
      lang: 'hindi',
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
    document.title = 'Hindi Typing Test — Unicode | FastTypingLab';
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
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="Hindi Typing Test — Unicode (Mangal/INSCRIPT) | FastTypingLab"
        description="Free Hindi typing test in Unicode (Mangal/INSCRIPT). Practice Devanagari typing with real-time WPM and accuracy — ideal for SSC, CPCT and government exam prep."
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/tests/" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm group">
            <ChevronLeft className="w-4 h-4" /> Tests
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Languages className="w-5 h-5 text-brand-primary" /> Hindi Typing Test
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
              <span className="text-brand-muted">यहाँ टाइप करना शुरू करें…</span>
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
                <Link to={`/certificate?wpm=${wpm}&acc=${accuracy}&title=Hindi+Typing+Test`}
                  className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-6 py-2.5 rounded-xl font-bold hover:bg-amber-500/20 transition-all">
                  <Award className="w-4 h-4" /> Certificate
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEO content */}
        <div className="mt-8 bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">Hindi Typing Test — Unicode</h2>
          <p>यह हिंदी टाइपिंग टेस्ट SSC, CPCT, न्यायालय और अन्य सरकारी परीक्षाओं की तैयारी के लिए बनाया गया है। यूनिकोड हिंदी टाइपिंग का अभ्यास करें और अपनी गति (WPM) बढ़ाएं।</p>
          <p>This Hindi typing test uses Unicode Devanagari script and is designed for SSC, CPCT, court typing, and other government exam preparation. Target: 25–30 WPM for most government posts.</p>
        </div>
      </div>
    </div>
  );
}

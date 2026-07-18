import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Play, RotateCcw, CheckCircle, ChevronLeft, Volume2, Square, AlertCircle } from 'lucide-react';
import Seo from '../components/Seo';

// Dictation passages — office / legal / general styles suited to steno transcription.
const PASSAGES: { title: string; text: string }[] = [
  {
    title: 'Office Circular',
    text: 'Dear team, please note that the quarterly review meeting has been rescheduled to Friday afternoon at three o clock in the main conference room. All department heads are requested to submit their progress reports before the meeting. Kindly confirm your attendance by end of day tomorrow so that seating and refreshments can be arranged accordingly.',
  },
  {
    title: 'News Report',
    text: 'The state government announced today a new scheme to improve digital literacy in rural areas. Under the programme, free computer training centres will be opened in every district over the next two years. Officials said the initiative aims to help students and job seekers gain the skills required for modern employment and to bridge the gap between urban and rural regions.',
  },
  {
    title: 'Legal Passage',
    text: 'After hearing the arguments advanced by both parties and examining the documents placed on record, the court is of the considered opinion that the matter requires further examination. The case is therefore adjourned to the next date of hearing, and both parties are directed to file their written submissions within two weeks from today.',
  },
  {
    title: 'Business Letter',
    text: 'Thank you for your enquiry regarding our products and services. We are pleased to inform you that the items you requested are currently available in stock. Please find enclosed our latest price list and catalogue for your reference. Should you require any further information, do not hesitate to contact our sales department at your convenience.',
  },
  {
    title: 'General Dictation',
    text: 'Good communication is one of the most valuable skills a person can develop in the workplace. It helps build strong relationships, avoids misunderstandings, and ensures that tasks are completed on time. Whether speaking or writing, being clear and concise saves everyone time and effort, and it reflects well on both the individual and the organisation.',
  },
];

const SPEEDS = [
  { label: 'Slow', wpm: 60, note: 'Beginner' },
  { label: 'Medium', wpm: 80, note: 'Grade D pace' },
  { label: 'Fast', wpm: 100, note: 'Grade C pace' },
];

// Normalise text into comparable words.
function words(s: string): string[] {
  return s.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
}

// Longest common subsequence length — how many source words were captured in order.
function lcsLength(a: string[], b: string[]): number {
  const m = a.length, n = b.length;
  if (!m || !n) return 0;
  let prev = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1).fill(0);
    for (let j = 1; j <= n; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}

type Phase = 'config' | 'dictating' | 'result';

export default function DictationTypingPage() {
  const [phase, setPhase] = useState<Phase>('config');
  const [speedWpm, setSpeedWpm] = useState(80);
  const [passageIdx, setPassageIdx] = useState(() => Math.floor(Math.random() * PASSAGES.length));
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [dictationDone, setDictationDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const passage = PASSAGES[passageIdx];

  useEffect(() => { document.title = 'Dictation Typing Test — Steno Transcription Practice | FastTypingLab'; }, []);
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  const speak = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(passage.text);
    // Map dictation WPM to TTS rate (default voice ≈ 165 wpm). Approximate.
    u.rate = Math.max(0.1, Math.min(1, speedWpm / 165));
    u.onstart = () => setSpeaking(true);
    u.onend = () => { setSpeaking(false); setDictationDone(true); };
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const startDictation = () => {
    setTyped('');
    setDictationDone(false);
    setPhase('dictating');
    setStartTime(Date.now());
    speak();
    setTimeout(() => taRef.current?.focus(), 150);
  };

  const submit = () => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
    setElapsed((Date.now() - startTime) / 1000);
    setPhase('result');
  };

  const reset = (newPassage = true) => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
    if (newPassage) setPassageIdx(Math.floor(Math.random() * PASSAGES.length));
    setTyped('');
    setDictationDone(false);
    setPhase('config');
  };

  // ── Results ──
  const srcWords = words(passage.text);
  const typedWords = words(typed);
  const captured = lcsLength(srcWords, typedWords);
  const accuracy = srcWords.length ? Math.round((captured / srcWords.length) * 100) : 0;
  const minutes = Math.max(elapsed / 60, 1 / 60);
  const wpm = Math.round(typedWords.length / minutes);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="Dictation Typing Test — Steno Transcription Practice | FastTypingLab"
        description="Free dictation typing test for stenography practice. Listen to a passage read at 60, 80 or 100 WPM and transcribe it by typing — build the transcription speed steno exams need."
      />
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/blog/how-to-learn-shorthand-stenography" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Shorthand Guide
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold">Dictation Typing Test</h1>
        </div>

        {/* ══ CONFIG ══ */}
        {phase === 'config' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-brand-primary" />
              </div>
              <h2 className="text-lg font-black text-brand-text mb-2">Transcribe the dictation</h2>
              <p className="text-brand-text-muted text-sm leading-relaxed mb-1">
                A passage is read aloud at your chosen speed. <strong className="text-brand-text">Listen and type what you hear</strong> — the text stays hidden, just like a real steno transcription test. When it ends, submit to see your transcription speed and accuracy.
              </p>
              <p className="text-brand-muted text-xs mt-2">🎧 Use speakers or headphones. Speeds are approximate — TTS pace varies by device.</p>
            </div>

            {!supported && (
              <div className="mb-5 flex items-start gap-2.5 p-4 rounded-xl border" style={{ background: 'rgba(224,82,82,0.08)', borderColor: 'rgba(224,82,82,0.2)' }}>
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <p className="text-rose-500 text-xs leading-relaxed">Your browser does not support speech synthesis, so audio dictation is unavailable. Try the latest Chrome, Edge or Safari.</p>
              </div>
            )}

            {/* Speed */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Dictation Speed</label>
              <div className="grid grid-cols-3 gap-2.5">
                {SPEEDS.map(s => (
                  <button key={s.wpm} onClick={() => setSpeedWpm(s.wpm)}
                    className={`rounded-xl p-3 border text-center transition-all ${speedWpm === s.wpm ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border bg-brand-surface hover:bg-brand-surface-2'}`}>
                    <div className="text-lg font-black text-brand-text">{s.wpm}</div>
                    <div className="text-[10px] text-brand-muted uppercase tracking-wide">WPM · {s.note}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startDictation} disabled={!supported}
              className="w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 6px 20px rgba(48,76,83,.25)' }}>
              <Play className="w-5 h-5" /> Start Dictation
            </button>
          </motion.div>
        )}

        {/* ══ DICTATING ══ */}
        {phase === 'dictating' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-2 text-sm font-bold ${speaking ? 'text-brand-primary' : 'text-brand-muted'}`}>
                <Volume2 className={`w-4 h-4 ${speaking ? 'animate-pulse' : ''}`} />
                {speaking ? 'Dictation playing… type what you hear' : dictationDone ? 'Dictation finished — finish typing' : 'Preparing…'}
              </div>
              {supported && (
                <button onClick={speak} className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-primary transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Replay
                </button>
              )}
            </div>

            <textarea
              ref={taRef}
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="Start typing what you hear…"
              rows={9}
              className="w-full rounded-2xl border border-brand-border bg-brand-surface p-4 text-brand-text text-sm sm:text-base leading-relaxed outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 resize-none font-mono"
            />

            <div className="flex items-center justify-between mt-2 mb-4 text-xs text-brand-muted">
              <span>{words(typed).length} words typed</span>
              <span>Text is hidden until you submit</span>
            </div>

            <button onClick={submit}
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 16px rgba(188,108,80,.3)' }}>
              <Square className="w-4 h-4" /> Done — Submit Transcription
            </button>
          </motion.div>
        )}

        {/* ══ RESULT ══ */}
        {phase === 'result' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Transcription WPM', value: wpm, color: 'text-brand-primary' },
                { label: 'Accuracy', value: `${accuracy}%`, color: 'text-brand-accent' },
                { label: 'Words Captured', value: `${captured}/${srcWords.length}`, color: 'text-brand-secondary' },
              ].map(s => (
                <div key={s.label} className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center">
                  <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-brand-muted mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-4">
              <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Original passage — {passage.title}</h3>
              <p className="text-brand-text-muted text-sm leading-relaxed">{passage.text}</p>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-6">
              <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Your transcription</h3>
              <p className="text-brand-text text-sm leading-relaxed font-mono whitespace-pre-wrap">{typed || <span className="text-brand-muted">(nothing typed)</span>}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => reset(true)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                <RotateCcw className="w-4 h-4" /> New Dictation
              </button>
              <Link to="/ssc-steno-typing-test"
                className="flex-1 py-3.5 rounded-2xl font-bold text-center bg-brand-surface-2 border border-brand-border hover:bg-brand-border text-brand-text flex items-center justify-center gap-2 transition-all">
                <CheckCircle className="w-4 h-4" /> SSC Steno Practice
              </Link>
            </div>
          </motion.div>
        )}

        {/* SEO / context footer */}
        <div className="mt-10 pt-6 border-t border-brand-border">
          <h2 className="font-bold text-brand-text mb-2">What is a dictation typing test?</h2>
          <p className="text-brand-text-muted text-sm leading-relaxed mb-3">
            A dictation typing test trains the transcription half of stenography — the skill of listening to speech and typing it accurately and fast. It is exactly what SSC Stenographer, court and PA candidates do after taking shorthand: transcribe the dictated matter on a computer within a time limit. Practising transcription at 60–100 WPM builds the typing speed and accuracy that decide whether you finish in time.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/blog/how-to-learn-shorthand-stenography" className="text-brand-primary font-semibold hover:underline">How to learn shorthand →</Link>
            <span className="text-brand-border">·</span>
            <Link to="/ssc-steno-typing-test" className="text-brand-primary font-semibold hover:underline">SSC Steno typing test →</Link>
            <span className="text-brand-border">·</span>
            <Link to="/court-typing-test" className="text-brand-primary font-semibold hover:underline">Court typing test →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

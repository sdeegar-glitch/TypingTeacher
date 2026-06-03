import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, Zap, Target, Clock, Activity, Award, Languages } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { saveSession } from '../lib/api';

// ─── Passage libraries ───────────────────────────────────────────────────────

const HINDI_ARTICLES = [
  'भारत एक विशाल और विविधता से भरा देश है। यहाँ अनेक भाषाएँ, धर्म और संस्कृतियाँ एक साथ फलती-फूलती हैं। भारतीय संविधान ने सभी नागरिकों को समान अधिकार और स्वतंत्रता प्रदान की है। देश की एकता और अखंडता ही इसकी सबसे बड़ी शक्ति है।',
  'सरकार ने ग्रामीण क्षेत्रों में डिजिटल साक्षरता को बढ़ावा देने के लिए एक नई योजना की घोषणा की है। इस पहल के तहत निःशुल्क कंप्यूटर प्रशिक्षण केंद्र स्थापित किए जाएंगे। युवाओं को तकनीकी शिक्षा देकर उन्हें रोजगार के लिए तैयार किया जाएगा।',
  'भारतीय अर्थव्यवस्था तेजी से विकास कर रही है। डिजिटल भुगतान प्रणाली ने व्यापार को सरल और सुविधाजनक बना दिया है। युवाओं के लिए रोजगार के नए अवसर उत्पन्न हो रहे हैं। स्टार्टअप संस्कृति ने देश में नवाचार की एक नई लहर पैदा की है।',
  'शिक्षा प्रत्येक नागरिक का मौलिक अधिकार है। सरकार ने प्राथमिक शिक्षा को अनिवार्य और निःशुल्क बनाया है। बच्चों को गुणवत्तापूर्ण शिक्षा मिलनी चाहिए ताकि वे देश का भविष्य संवार सकें। नई राष्ट्रीय शिक्षा नीति में कौशल विकास पर विशेष बल दिया गया है।',
  'स्वास्थ्य सेवाओं को आम जनता तक पहुंचाना सरकार की प्राथमिकता है। आयुष्मान भारत योजना के तहत करोड़ों परिवारों को निःशुल्क चिकित्सा सुविधा उपलब्ध कराई जा रही है। ग्रामीण क्षेत्रों में अस्पतालों और स्वास्थ्य केंद्रों की संख्या बढ़ाई जा रही है।',
  'पर्यावरण संरक्षण आज के समय की सबसे बड़ी आवश्यकता है। वृक्षारोपण अभियान के माध्यम से देश में हरियाली बढ़ाई जा रही है। सौर ऊर्जा और पवन ऊर्जा के उपयोग को प्रोत्साहित किया जा रहा है। स्वच्छ भारत मिशन ने देश में स्वच्छता के प्रति जागरूकता बढ़ाई है।',
  'भारत की कृषि व्यवस्था देश की रीढ़ है। किसानों की आय दोगुनी करने के लिए सरकार ने अनेक योजनाएं बनाई हैं। आधुनिक कृषि तकनीकों के उपयोग से उत्पादन में वृद्धि हो रही है। कृषि क्षेत्र में डिजिटल प्रौद्योगिकी का समावेश किसानों के जीवन को बेहतर बना रहा है।',
  'महिला सशक्तिकरण हमारे समाज के विकास के लिए अत्यंत आवश्यक है। बेटी बचाओ बेटी पढ़ाओ अभियान ने समाज में सकारात्मक बदलाव लाए हैं। महिलाएं आज हर क्षेत्र में पुरुषों के साथ कंधे से कंधा मिलाकर काम कर रही हैं।',
];

const HINDI_WORDS = [
  'भारत', 'देश', 'समाज', 'शिक्षा', 'विकास', 'सरकार', 'जनता', 'राज्य',
  'नागरिक', 'अधिकार', 'स्वतंत्रता', 'संविधान', 'कानून', 'न्याय', 'लोकतंत्र',
  'परिवार', 'समृद्धि', 'प्रगति', 'ज्ञान', 'विज्ञान', 'तकनीक', 'स्वास्थ्य',
  'शांति', 'एकता', 'सहयोग', 'संस्कृति', 'परंपरा', 'भाषा', 'साहित्य', 'कला',
  'पानी', 'खेती', 'किसान', 'मजदूर', 'व्यापार', 'उद्योग', 'सेवा', 'रोजगार',
];

const HINDI_QUOTES = [
  'जो व्यक्ति अपनी गलतियों से सीखता है वह महान बन जाता है।',
  'शिक्षा सबसे शक्तिशाली हथियार है जिसे आप दुनिया बदलने के लिए उपयोग कर सकते हैं।',
  'कर्म ही पूजा है और काम ही भगवान की आराधना है।',
  'मन के हारे हार है मन के जीते जीत। सकारात्मक सोच ही सफलता की कुंजी है।',
  'जीवन में सफलता के लिए कड़ी मेहनत और ईमानदारी सबसे जरूरी है।',
  'विद्या वही है जो मनुष्य को विनम्र बनाती है और अहंकार से दूर रखती है।',
];

type HindiMode = 'article' | 'words' | 'quote';

const MODE_META = {
  article: { label: 'अनुच्छेद', icon: '📄', desc: 'सरकारी परीक्षा पैसेज' },
  words:   { label: 'शब्द',     icon: '🔤', desc: 'सामान्य हिंदी शब्द' },
  quote:   { label: 'उद्धरण',  icon: '💬', desc: 'प्रेरक वाक्य' },
};

const DURATION_OPTIONS = [
  { label: '1 मिनट', value: 60 },
  { label: '2 मिनट', value: 120 },
  { label: '5 मिनट', value: 300 },
  { label: '10 मिनट', value: 600 },
];

function getRandomWords(count: number) {
  const arr: string[] = [];
  while (arr.length < count) arr.push(HINDI_WORDS[Math.floor(Math.random() * HINDI_WORDS.length)]);
  return arr.join(' ');
}

const ACHIEVEMENTS = [
  { key: 'hindi_first', cond: (t: number) => t >= 1,  icon: '🎯', name: 'हिंदी शुरुआत',   xp: 25  },
  { key: 'hindi_20',    cond: (_: number, w: number) => w >= 20, icon: '🔥', name: '20 WPM हिंदी',  xp: 50  },
  { key: 'hindi_30',    cond: (_: number, w: number) => w >= 30, icon: '⚡', name: '30 WPM क्लब',   xp: 100 },
  { key: 'hindi_50',    cond: (_: number, w: number) => w >= 50, icon: '🚀', name: '50 WPM गति',    xp: 200 },
  { key: 'hindi_acc',   cond: (_: number, __: number, a: number) => a >= 95, icon: '🎖️', name: '95% शुद्धता', xp: 75 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HindiTypingJunglePage() {
  const [mode, setMode] = useState<HindiMode>('article');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [newUnlocks, setNewUnlocks] = useState<{ icon: string; name: string; xp: number }[]>([]);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const activeText = useMemo(() => {
    if (mode === 'words')  return getRandomWords(40);
    if (mode === 'quote')  return HINDI_QUOTES[Math.floor(Math.random() * HINDI_QUOTES.length)];
    return HINDI_ARTICLES[Math.floor(Math.random() * HINDI_ARTICLES.length)];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    document.title = 'हिंदी टाइपिंग जंगल — Hindi Typing Jungle | FastTypingLab';
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  const engine = useTypingEngine(activeText, selectedDuration, 'timed', (finalStats) => {
    saveSession({
      duration: finalStats.elapsedSeconds,
      gross_wpm: finalStats.wpm,
      net_wpm: finalStats.netWpm,
      errors: finalStats.errors,
      accuracy: finalStats.accuracy,
      lang: 'hindi',
    });
    try {
      const hist = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      const session = { netWpm: finalStats.netWpm, accuracy: finalStats.accuracy, lang: 'hindi', date: new Date().toISOString() };
      const updated = [...hist, session].slice(-100);
      localStorage.setItem('typingHistory', JSON.stringify(updated));

      const total = updated.length;
      const bestWpm = Math.max(...updated.map((s: any) => s.netWpm || 0));
      const prevKeys = JSON.parse(localStorage.getItem('achievementKeys') || '[]') as string[];
      const unlocks: { icon: string; name: string; xp: number }[] = [];
      ACHIEVEMENTS.forEach(a => {
        if (a.cond(total, bestWpm, finalStats.accuracy) && !prevKeys.includes(a.key)) {
          unlocks.push({ icon: a.icon, name: a.name, xp: a.xp });
          prevKeys.push(a.key);
        }
      });
      localStorage.setItem('achievementKeys', JSON.stringify(prevKeys));
      if (unlocks.length) setNewUnlocks(unlocks);
    } catch {}
  });

  const { stats, userInput, mistakes, processChar, processBackspace, reset } = engine;

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [mobileVal, setMobileVal] = useState('');

  const onMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nv = e.target.value;
    engine.handleMobileInput(nv);
    setMobileVal(nv);
  }, [engine]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (stats.isFinished) return;
    const skip = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
    if (skip.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (e.key === ' ') e.preventDefault();
    if (e.key === 'Backspace') processBackspace();
    else if (e.key.length === 1) processChar(e.key);
  }, [stats.isFinished, processChar, processBackspace]);

  useEffect(() => {
    if (!isMobile) { window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }
  }, [handleKeyDown, isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    setTimeout(() => hiddenInputRef.current?.focus(), 300);
  }, [isMobile]);

  const handleReset = useCallback(() => {
    reset(); setMobileVal(''); setNewUnlocks([]);
    if (isMobile) setTimeout(() => hiddenInputRef.current?.focus(), 100);
  }, [reset, isMobile]);

  const formattedTime = `${Math.floor(stats.timeLeft / 60)}:${String(stats.timeLeft % 60).padStart(2, '0')}`;

  // ─── Render passage with coloring ─────────────────────────────────────────
  const renderText = () => activeText.split('').map((ch, i) => {
    const correct = i < userInput.length && !mistakes.has(i);
    const error   = i < userInput.length && mistakes.has(i);
    const caret   = i === userInput.length;
    return (
      <span key={i} className="relative">
        {caret && <span className="typing-caret" aria-hidden />}
        <span className={correct ? 'typing-correct' : error ? 'typing-error' : caret ? 'typing-current' : 'typing-upcoming'}>
          {ch === ' ' ? ' ' : ch}
        </span>
      </span>
    );
  });

  return (
    <div className="h-[100dvh] bg-brand-bg text-brand-text flex flex-col overflow-hidden select-none"
      onClick={() => isMobile && hiddenInputRef.current?.focus()}>

      {/* Hidden mobile input */}
      {isMobile && (
        <input ref={hiddenInputRef} type="text" value={mobileVal} onChange={onMobileChange}
          className="fixed opacity-0 pointer-events-none w-1 h-1 top-0 left-0 z-[-1]"
          autoCapitalize="none" autoComplete="off" autoCorrect="off"
          spellCheck={false} inputMode="text" aria-hidden disabled={stats.isFinished} />
      )}

      {/* ── TOP BAR ── */}
      <div className="shrink-0 bg-brand-surface border-b border-brand-border px-3 sm:px-6 h-14 flex items-center justify-between gap-3 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/hindi-typing-test"
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm font-medium group shrink-0">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">वापस</span>
          </Link>
          <div className="h-5 w-px bg-brand-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-brand-cta shrink-0" />
            <h1 className="text-sm font-bold text-brand-text hidden sm:block">हिंदी टाइपिंग जंगल</h1>
          </div>
        </div>

        {/* LIVE badge */}
        {stats.isActive && (
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(188,108,80,0.12)', color: 'var(--brand-cta)' }}>LIVE</span>
        )}

        {/* Right stats */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold flex items-center gap-0.5 justify-center">
              <Clock className="w-2.5 h-2.5" /><span className="hidden sm:inline">समय</span>
            </div>
            <div className={`text-sm sm:text-base font-black tabular-nums font-mono ${stats.timeLeft <= 10 && stats.isActive ? 'text-rose-500 animate-pulse' : 'text-brand-text'}`}>
              {formattedTime}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold flex items-center gap-0.5 justify-center">
              <Zap className="w-2.5 h-2.5" />WPM
            </div>
            <div className="text-sm sm:text-base font-black tabular-nums font-mono" style={{ color: 'var(--brand-cta)' }}>{stats.netWpm}</div>
          </div>
          <div className="text-center hidden sm:block">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold flex items-center gap-0.5 justify-center">
              <Target className="w-2.5 h-2.5" />शुद्धता
            </div>
            <div className={`text-sm sm:text-base font-black tabular-nums font-mono ${stats.accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500'}`}>
              {stats.accuracy}%
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); handleReset(); }}
            className="flex items-center gap-1.5 bg-brand-surface-2 hover:bg-brand-border text-brand-muted hover:text-brand-text px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-brand-border">
            <RotateCcw className="w-3.5 h-3.5" /><span className="hidden sm:inline">रीसेट</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-0.5 bg-brand-border">
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg,#BC6C50,#DDAD9C)' }}
          animate={{ width: `${stats.progress}%` }} transition={{ duration: 0.1 }} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-grow flex flex-col items-center justify-start gap-4 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">

        {/* ── CARD SETUP (pre-test) ── */}
        <AnimatePresence>
          {!stats.isActive && !stats.isFinished && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>

              {/* Mode cards */}
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2 px-1">मोड चुनें</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(MODE_META) as [HindiMode, typeof MODE_META[HindiMode]][]).map(([id, m]) => (
                    <button key={id} onClick={() => { setMode(id); reset(); }}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border font-semibold transition-all duration-200 text-center ${
                        mode === id ? 'text-white border-transparent shadow-lg scale-[1.02]' : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-cta/40 hover:text-brand-text'
                      }`}
                      style={mode === id ? { background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 14px rgba(188,108,80,.3)' } : {}}>
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-xs font-bold" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>{m.label}</span>
                      <span className={`text-[10px] ${mode === id ? 'text-white/70' : 'text-brand-muted'}`}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration cards */}
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2 px-1">अवधि चुनें</p>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setSelectedDuration(opt.value); reset(); }}
                      className={`py-3 rounded-xl border font-bold text-sm transition-all duration-200 ${
                        selectedDuration === opt.value ? 'text-white border-transparent shadow-lg scale-[1.02]' : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/40 hover:text-brand-text'
                      }`}
                      style={selectedDuration === opt.value ? { background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 4px 14px rgba(48,76,83,.3)' } : {}}>
                      <span style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-brand-muted flex items-center gap-1.5 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cta animate-pulse inline-block" />
                {isMobile ? 'नीचे टेक्स्ट क्षेत्र पर टैप करें' : 'नीचे टाइप करें — पहली कुंजी दबाने पर टाइमर शुरू होगा'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TYPING AREA ── */}
        <div className="w-full max-w-2xl">
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl px-4 sm:px-8 py-5 shadow-sm cursor-text overflow-hidden"
            onClick={() => isMobile && hiddenInputRef.current?.focus()}>
            {stats.isActive && (
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(188,108,80,.5),transparent)' }} />
            )}
            <div className="text-xl sm:text-2xl leading-[3.2rem] break-words overflow-y-auto"
              style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", maxHeight: isMobile ? '150px' : '200px' }}>
              {renderText()}
            </div>
            {!stats.isActive && !stats.isFinished && (
              <div className="absolute bottom-3 right-4 text-[10px] text-brand-muted/50 font-mono pointer-events-none select-none flex items-center gap-1">
                <span className="typing-caret h-3 w-0.5" /> टाइप करें
              </div>
            )}
          </div>

          {stats.isActive && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mt-2 px-1 text-xs text-brand-muted font-mono">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{stats.cpm} CPM</span>
              <span className="text-brand-border">·</span>
              <span>{stats.errors} गलतियाँ</span>
              <span className="text-brand-border">·</span>
              <span>{stats.progress}% पूर्ण</span>
            </motion.div>
          )}
        </div>

        {/* Mobile key hint */}
        {isMobile && !stats.isFinished && stats.isActive && (
          <div className="flex items-center gap-3 bg-brand-surface border border-brand-border rounded-xl px-5 py-2.5 shadow-sm">
            <span className="text-xs text-brand-muted">अगला:</span>
            <kbd className="text-white font-black px-3 py-1 rounded-lg text-lg min-w-[48px] text-center"
              style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
              {engine.nextChar === ' ' ? '⎵' : engine.nextChar}
            </kbd>
          </div>
        )}
      </div>

      {/* ── RESULT MODAL ── */}
      <AnimatePresence>
        {stats.isFinished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-brand-surface border border-brand-border rounded-3xl p-7 sm:p-10 max-w-sm w-full text-center shadow-2xl">

              <div className="text-5xl mb-4">{stats.accuracy >= 95 ? '🏆' : stats.accuracy >= 80 ? '🎉' : '💪'}</div>
              <h2 className="text-2xl font-black text-brand-text mb-1"
                style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
                परीक्षण पूर्ण!
              </h2>
              <p className="text-brand-muted text-sm mb-7">
                {stats.netWpm >= 40 ? 'शानदार गति! आप परीक्षा के लिए तैयार हैं।' :
                 stats.netWpm >= 25 ? 'अच्छा प्रयास! थोड़ा और अभ्यास करें।' :
                 'अभ्यास जारी रखें। गति अपने आप बढ़ेगी।'}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-7">
                {[
                  { label: 'Gross WPM', value: stats.wpm, cls: 'text-brand-text' },
                  { label: 'Net WPM',   value: stats.netWpm, style: { color: 'var(--brand-cta)' } },
                  { label: 'शुद्धता', value: `${stats.accuracy}%`, cls: stats.accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500' },
                ].map(s => (
                  <div key={s.label} className="bg-brand-surface-2 border border-brand-border p-4 rounded-2xl">
                    <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">{s.label}</div>
                    <div className={`text-2xl font-black font-mono ${s.cls || ''}`} style={s.style}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-brand-muted mb-6">
                <div className="bg-brand-surface-2 rounded-xl px-3 py-2 flex justify-between">
                  <span>CPM</span><span className="font-mono font-semibold text-brand-text">{stats.cpm}</span>
                </div>
                <div className="bg-brand-surface-2 rounded-xl px-3 py-2 flex justify-between">
                  <span>समय</span><span className="font-mono font-semibold text-brand-text">{stats.elapsedSeconds}s</span>
                </div>
              </div>

              {/* Achievement unlocks */}
              <AnimatePresence>
                {newUnlocks.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="mb-5 space-y-2">
                    {newUnlocks.map((u, i) => (
                      <motion.div key={u.name} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-left"
                        style={{ background: 'rgba(188,108,80,0.08)', border: '1px solid rgba(188,108,80,0.2)' }}>
                        <span className="text-2xl">{u.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-bold" style={{ color: 'var(--brand-cta)' }}>उपलब्धि अनलॉक!</div>
                          <div className="text-sm font-semibold text-brand-text"
                            style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>{u.name}</div>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--brand-cta)' }}>+{u.xp} XP</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button onClick={handleReset}
                  className="flex-1 bg-brand-surface-2 hover:bg-brand-border text-brand-text py-3 rounded-xl font-bold text-sm transition-all border border-brand-border flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> फिर करें
                </button>
                <Link to={`/certificate?wpm=${stats.netWpm}&acc=${stats.accuracy}&title=${encodeURIComponent('हिंदी टाइपिंग जंगल')}`}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white text-center transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 14px rgba(188,108,80,.25)' }}>
                  प्रमाण पत्र
                </Link>
              </div>
              <Link to="/hindi-typing-test"
                className="mt-2 w-full flex items-center justify-center gap-2 text-brand-muted hover:text-brand-primary text-sm font-semibold transition-colors">
                <Award className="w-4 h-4" /> हिंदी टेस्ट पेज
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

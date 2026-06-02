import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, Zap, Target, Award, RotateCcw, CheckCircle, XCircle, Trophy, Shield } from 'lucide-react';
import { saveSession } from '../lib/api';

// ─── Paragraph Library ──────────────────────────────────────────────────────

const PARAGRAPHS: Record<string, string[]> = {
  'ssc-chsl': [
    'The government of India has announced a new policy to promote digital literacy across the country. Under this initiative, free computer training centres will be set up in rural areas to educate citizens about the internet, online banking, and digital payments. The programme aims to bring technology to every household and help people access government services through digital platforms. Officials believe that digital literacy is essential for the economic development of the nation.',
    'The National Education Policy introduced by the central government aims to transform the learning experience of millions of students across India. The policy emphasises critical thinking, creativity, and multilingual education from the primary level. Schools will be encouraged to adopt modern teaching methods and reduce the burden of examinations. The government has allocated a significant portion of the national budget to improve infrastructure in rural schools and provide quality education to all children.',
    'India has made significant progress in the field of renewable energy over the past decade. The country is now among the top five nations in the world in terms of installed solar power capacity. The government has set ambitious targets to achieve five hundred gigawatts of renewable energy capacity by the year two thousand and thirty. This transition to clean energy is expected to reduce the nation\'s dependence on fossil fuels and help meet international climate change commitments.',
    'The central government has launched a comprehensive health insurance scheme to provide financial protection to millions of families living below the poverty line. Under this scheme, each eligible family will receive coverage of five lakh rupees per year for medical treatment at empanelled hospitals across the country. The initiative is expected to benefit over ten crore families and significantly reduce out-of-pocket healthcare expenditure for the poorest sections of society.',
    'India\'s agricultural sector has witnessed a remarkable transformation over the past several years. The introduction of modern farming techniques, improved seed varieties, and better irrigation systems has helped increase crop productivity significantly. The government has also implemented various schemes to provide financial assistance to farmers and ensure that they receive fair prices for their produce. Digital platforms are now being used to connect farmers directly with buyers, eliminating middlemen and increasing farmer income.',
  ],
  'ssc-cgl': [
    'The Income Tax Department has released the annual report for the financial year. According to the data, the total tax collection increased by fifteen percent compared to the previous year. The number of return filers grew to eighty million with direct tax contributing sixty percent of the revenue. The department processed refunds worth two thousand crore rupees online. New simplified tax forms reduced the compliance burden on small businesses and salaried individuals significantly.',
    'The Reserve Bank of India has published its latest monetary policy report indicating stable inflation and steady economic growth. The central bank maintained the benchmark interest rate at its current level after careful deliberation by the Monetary Policy Committee. The report highlighted improvements in industrial production, export growth, and rising foreign exchange reserves. Banking sector credit growth remained robust with non-performing assets declining consistently over the past four consecutive quarters.',
    'The ministry of finance has presented the annual union budget with total expenditure projected at forty-seven lakh crore rupees. Capital expenditure allocation was increased by thirty percent compared to the previous year to boost infrastructure development. The fiscal deficit target has been set at five point one percent of the gross domestic product. Major allocations include railways, road construction, defence modernisation, and digital infrastructure projects across rural and urban India.',
    'The Securities and Exchange Board of India has introduced new regulations to strengthen investor protection in the capital markets. The revised framework mandates stricter disclosure norms for listed companies and enhanced surveillance mechanisms to detect fraudulent trading activities. Market participants have welcomed the reforms aimed at improving transparency and boosting investor confidence. Foreign institutional investor inflows have shown an upward trend following the announcement of these comprehensive regulatory improvements.',
    'India\'s exports crossed a record level of seven hundred billion dollars during the previous financial year, registering a growth of twelve percent over the previous fiscal period. Engineering goods, pharmaceutical products, and information technology services remained the top contributing sectors. The government has signed several bilateral trade agreements to open new markets for Indian exporters. Special economic zones have played a crucial role in promoting manufacturing and generating substantial employment opportunities in various regions.',
  ],
  'hindi-typing': [
    'भारत सरकार ने ग्रामीण क्षेत्रों में डिजिटल साक्षरता को बढ़ावा देने के लिए एक नई योजना की घोषणा की है। इस पहल के तहत निःशुल्क कंप्यूटर प्रशिक्षण केंद्र स्थापित किए जाएंगे। सरकार का लक्ष्य है कि देश के प्रत्येक नागरिक को डिजिटल सेवाओं का लाभ मिल सके।',
    'भारतीय अर्थव्यवस्था तेजी से विकास कर रही है। डिजिटल भुगतान प्रणाली ने व्यापार को सरल और सुविधाजनक बना दिया है। युवाओं के लिए रोजगार के नए अवसर उत्पन्न हो रहे हैं। सरकार ने स्टार्टअप को प्रोत्साहित करने के लिए अनेक योजनाएं शुरू की हैं।',
    'शिक्षा प्रत्येक नागरिक का मौलिक अधिकार है। सरकार ने प्राथमिक शिक्षा को अनिवार्य और निःशुल्क बनाया है। बच्चों को गुणवत्तापूर्ण शिक्षा मिलनी चाहिए ताकि वे देश का भविष्य संवार सकें। नई राष्ट्रीय शिक्षा नीति में कौशल विकास पर विशेष बल दिया गया है।',
    'स्वास्थ्य सेवाओं को आम जनता तक पहुंचाना सरकार की प्राथमिकता है। आयुष्मान भारत योजना के तहत करोड़ों परिवारों को निःशुल्क चिकित्सा सुविधा उपलब्ध कराई जा रही है। ग्रामीण क्षेत्रों में स्वास्थ्य केंद्रों की संख्या बढ़ाई जा रही है।',
    'हिंदी भारत की राजभाषा है और करोड़ों लोगों द्वारा बोली जाती है। हिंदी टाइपिंग सीखना सरकारी नौकरियों के लिए अत्यंत आवश्यक है। प्रतिदिन अभ्यास करने से टाइपिंग गति में सुधार होता है। सरकारी कार्यालयों में हिंदी का प्रयोग बढ़ाने पर विशेष ध्यान दिया जा रहा है।',
  ],
  'up-police': [
    'उत्तर प्रदेश पुलिस विभाग ने नागरिकों की सुरक्षा के लिए नई पहल शुरू की है। पुलिस थानों में कंप्यूटर ऑपरेटर की भर्ती के लिए हिंदी टाइपिंग परीक्षा अनिवार्य है। अभ्यर्थियों को प्रतिदिन हिंदी टाइपिंग का अभ्यास करना चाहिए।',
    'महिला सुरक्षा को लेकर उत्तर प्रदेश सरकार ने कड़े कदम उठाए हैं। पुलिस विभाग में महिला कर्मियों की भर्ती बढ़ाई जा रही है। साइबर अपराधों से निपटने के लिए विशेष प्रकोष्ठ का गठन किया गया है। जन सुरक्षा के लिए आधुनिक तकनीक का उपयोग किया जा रहा है।',
    'यातायात व्यवस्था को सुधारने के लिए पुलिस विभाग ने नई तकनीक अपनाई है। सड़क दुर्घटनाओं को कम करने के लिए जागरूकता अभियान चलाया जा रहा है। यातायात नियमों का पालन करना प्रत्येक नागरिक का कर्तव्य है। वाहन चालकों को नियमित रूप से प्रशिक्षण दिया जा रहा है।',
    'ग्रामीण क्षेत्रों में कानून व्यवस्था बनाए रखने के लिए पुलिस चौकियों की संख्या बढ़ाई जा रही है। आम जनता से पुलिस का संपर्क बेहतर बनाने के लिए जन संवाद कार्यक्रम आयोजित किए जाते हैं। अपराध नियंत्रण के लिए आधुनिक उपकरणों का उपयोग किया जाता है।',
    'साइबर अपराधों से सुरक्षा के लिए नागरिकों को जागरूक करना आवश्यक है। ऑनलाइन ठगी और धोखाधड़ी से बचने के उपाय अपनाने चाहिए। पुलिस हेल्पलाइन नंबर पर शिकायत दर्ज कराएं और डिजिटल सुरक्षा के नियमों का पालन करें।',
  ],
  'court-typing': [
    'The Honourable High Court of India hereby issues the following order in the matter of the petition filed before this court. After careful consideration of the arguments presented by both the petitioner and the respondent, and having examined all the relevant documents and precedents, the court is of the considered opinion that the matter requires further examination. The case is therefore adjourned to the next date of hearing where additional evidence shall be produced before the bench.',
    'In the matter of the writ petition filed by the petitioner challenging the constitutional validity of the impugned legislation, this court has heard extensive arguments from learned counsel on both sides over a period of several days. The court has carefully perused all the documents placed on record, including the affidavits, counter affidavits, and the written submissions filed by the parties. Having considered the matter in its entirety, the court passes the following interim order pending final adjudication.',
    'The learned Sessions Judge, after hearing the arguments advanced by the prosecution and the defence, and after perusing the entire record of the case including the statements of witnesses, documentary evidence, and forensic reports, is of the view that the prosecution has established its case beyond reasonable doubt. The accused is hereby convicted under the relevant provisions of the Indian Penal Code and sentenced in accordance with the provisions of the law applicable to the offence committed.',
    'The Supreme Court of India, in its landmark judgment pronounced today, has upheld the constitutional validity of the Right to Information Act and reiterated that transparency in public administration is a fundamental requirement of democratic governance. The court held that citizens have an inherent right to seek information from public authorities and that such right can only be restricted in exceptional circumstances as provided under the act. This judgment reaffirms the commitment of the judiciary to uphold constitutional values.',
    'This agreement is entered into between the parties hereinafter referred to as the first party and the second party respectively. Both parties agree to abide by the terms and conditions set forth in this document, which shall be legally binding upon them and their respective successors, heirs, and legal representatives. Any dispute arising from this agreement shall be subject to the jurisdiction of the competent civil courts in accordance with the applicable laws and regulations of the relevant jurisdiction.',
  ],
};

// ─── Exam Config ────────────────────────────────────────────────────────────

const EXAM_CONFIG: Record<string, {
  title: string; fullName: string; badge: string;
  duration: number; wpmTarget: number; accuracyTarget: number;
  language: string; color: string; bg: string; border: string;
  icon: string;
  rules: string[];
}> = {
  'ssc-chsl': {
    title: 'SSC CHSL', fullName: 'Staff Selection Commission — CHSL', badge: 'English',
    duration: 600, wpmTarget: 35, accuracyTarget: 80,
    language: 'English', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: '🏛️',
    rules: ['Duration: 10 minutes', 'Target: 35+ WPM', 'Min accuracy: 80%', 'Backspace allowed'],
  },
  'ssc-cgl': {
    title: 'SSC CGL DEST', fullName: 'SSC CGL — Data Entry Speed Test', badge: 'English',
    duration: 900, wpmTarget: 40, accuracyTarget: 85,
    language: 'English', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: '📊',
    rules: ['Duration: 15 minutes', 'Target: 40+ WPM', 'Min accuracy: 85%', '8000 KDPH required'],
  },
  'hindi-typing': {
    title: 'Hindi Typing', fullName: 'Hindi Typing — INSCRIPT / Remington Gail', badge: 'Hindi',
    duration: 600, wpmTarget: 30, accuracyTarget: 80,
    language: 'Hindi', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'अ',
    rules: ['Duration: 10 minutes', 'Target: 30+ WPM', 'Min accuracy: 80%', 'Mangal font standard'],
  },
  'up-police': {
    title: 'UP Police Typing', fullName: 'UP Police Computer Operator Test', badge: 'Hindi',
    duration: 300, wpmTarget: 25, accuracyTarget: 80,
    language: 'Hindi', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '👮',
    rules: ['Duration: 5 minutes', 'Target: 25+ WPM', 'Min accuracy: 80%', 'Unicode Hindi'],
  },
  'court-typing': {
    title: 'Court Typing', fullName: 'High Court / District Court Typing Test', badge: 'English',
    duration: 600, wpmTarget: 40, accuracyTarget: 90,
    language: 'English', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: '⚖️',
    rules: ['Duration: 10 minutes', 'Target: 40+ WPM', 'Min accuracy: 90%', 'Legal passages'],
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

type Screen = 'info' | 'countdown' | 'active' | 'finished';

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const key = examId && EXAM_CONFIG[examId] ? examId : 'ssc-chsl';
  const exam = EXAM_CONFIG[key];
  const paragraphs = PARAGRAPHS[key] || PARAGRAPHS['ssc-chsl'];

  const [screen, setScreen] = useState<Screen>('info');
  const [passageIdx, setPassageIdx] = useState(() => Math.floor(Math.random() * paragraphs.length));
  const [countdown, setCountdown] = useState(3);
  const [userInput, setUserInput] = useState('');
  const [mistakes, setMistakes] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(exam.duration);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null); // ref for stale-closure-safe access

  const passage = paragraphs[passageIdx];
  const isHindi = exam.language === 'Hindi';

  useEffect(() => {
    document.title = `${exam.title} Mock Test | FastTypingLab`;
  }, [exam.title]);

  // ── Finish ──────────────────────────────────────────────────────────────
  const finish = useCallback((finalInput: string, finalMistakes: Set<number>, elapsed: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearInterval(timerRef.current);
    const mins = elapsed / 60;
    const w = mins > 0 ? Math.round((finalInput.length / 5) / mins) : 0;
    const acc = finalInput.length > 0
      ? Math.round(((finalInput.length - finalMistakes.size) / finalInput.length) * 100) : 100;
    setWpm(w);
    setAccuracy(acc);
    setScreen('finished');
    saveSession({ duration: elapsed, gross_wpm: w, net_wpm: w, errors: finalMistakes.size, accuracy: acc });
    try {
      const hist = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      hist.push({ netWpm: w, accuracy: acc, lang: exam.language.toLowerCase(), date: new Date().toISOString() });
      localStorage.setItem('typingHistory', JSON.stringify(hist));
    } catch {}
  }, [exam.language]);

  // ── Countdown ───────────────────────────────────────────────────────────
  const startCountdown = () => {
    setScreen('countdown');
    setCountdown(3);
    let c = 3;
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(t);
        beginExam();
      }
    }, 1000);
  };

  const beginExam = () => {
    finishedRef.current = false;
    setUserInput('');
    setMistakes(new Set());
    setStartTime(null);
    setTimeLeft(exam.duration);
    setWpm(0);
    setAccuracy(100);
    setScreen('active');
    setTimeout(() => containerRef.current?.focus(), 100);
  };

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'active' || !startTime) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setUserInput(inp => {
            setMistakes(m => {
              const elapsed = exam.duration;
              finish(inp, m, elapsed);
              return m;
            });
            return inp;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime, screen, exam.duration, finish]);

  // ── Navigation helpers (defined before keydown effect so Tab can reference them) ──
  const restart = useCallback(() => {
    clearInterval(timerRef.current);
    finishedRef.current = false;
    startTimeRef.current = null;
    setPassageIdx(Math.floor(Math.random() * paragraphs.length));
    setScreen('info');
  }, [paragraphs.length]);

  const tryAgain = useCallback(() => {
    clearInterval(timerRef.current);
    finishedRef.current = false;
    startTimeRef.current = null;
    setPassageIdx(Math.floor(Math.random() * paragraphs.length));
    startCountdown();
  }, [paragraphs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keydown handler ──────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'active') return;
    const onKey = (e: KeyboardEvent) => {
      // Tab = restart
      if (e.key === 'Tab') { e.preventDefault(); tryAgain(); return; }
      if (['Shift','Control','Alt','Meta','CapsLock','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','F1','F2','F3','F4','F5','F11','F12'].includes(e.key)) return;
      if (e.ctrlKey || e.metaKey) return;
      if (e.key === ' ') e.preventDefault();

      if (e.key === 'Backspace') {
        setUserInput(prev => {
          if (prev.length === 0) return prev;
          const newLen = prev.length - 1;
          setMistakes(m => { const s = new Set(m); s.delete(newLen); return s; });
          return prev.slice(0, newLen);
        });
        return;
      }

      if (e.key.length !== 1) return;

      setUserInput(prev => {
        if (finishedRef.current || prev.length >= passage.length) return prev;

        // Start timer on first keypress — use ref to avoid stale closure
        if (!startTimeRef.current) {
          const now = Date.now();
          startTimeRef.current = now;
          setStartTime(now);
        }

        const expected = passage[prev.length];
        const isWrong = e.key !== expected;
        let newMistakeCount = 0;
        if (isWrong) {
          setMistakes(m => { const s = new Set(m); s.add(prev.length); newMistakeCount = s.size; return s; });
        }

        const next = prev + e.key;

        // Live WPM & accuracy using ref (stale-closure-safe)
        const elapsedMins = startTimeRef.current ? (Date.now() - startTimeRef.current) / 60000 : 0.01;
        const liveWpm = Math.max(0, Math.round((next.length / 5) / elapsedMins));
        const totalErrs = newMistakeCount || (isWrong ? 1 : 0);
        const liveAcc = Math.max(0, Math.min(100, Math.round(((next.length - totalErrs) / next.length) * 100)));
        setWpm(liveWpm);
        setAccuracy(liveAcc);

        // Finish when passage complete
        if (next.length >= passage.length) {
          const elapsedSec = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : exam.duration;
          setMistakes(m => { finish(next, m, elapsedSec); return m; });
        }

        return next;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, passage, exam.duration, finish, tryAgain]);

  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;
  const progress = passage.length > 0 ? (userInput.length / passage.length) * 100 : 0;
  const passed = wpm >= exam.wpmTarget && accuracy >= exam.accuracyTarget;

  // ─── RENDER: passage chars ──────────────────────────────────────────────
  const renderPassage = () => {
    return passage.split('').map((ch, i) => {
      const typed = i < userInput.length;
      const correct = typed && !mistakes.has(i);
      const wrong = typed && mistakes.has(i);
      const isCaret = i === userInput.length;
      return (
        <span key={i} className="relative">
          {isCaret && (
            <span className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-brand-primary animate-pulse rounded-full" />
          )}
          <span className={
            correct ? 'text-emerald-400' :
            wrong ? 'text-rose-400 bg-rose-500/20 rounded-sm' :
            isCaret ? 'text-white' :
            'text-white/25'
          }>
            {ch === ' ' ? ' ' : ch}
          </span>
        </span>
      );
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN: INFO
  // ═══════════════════════════════════════════════════════════════════════════
  if (screen === 'info') {
    return (
      <div className="min-h-screen bg-[#0d0d14] text-white flex flex-col">
        {/* Back nav */}
        <div className="px-6 py-4">
          <Link to="/competitive-exam-typing" className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" /> All Exams
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl">

            {/* Exam badge */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-4xl w-14 h-14 rounded-2xl ${exam.bg} border ${exam.border} flex items-center justify-center`}>{exam.icon}</span>
              <div>
                <div className={`text-xs font-bold uppercase tracking-widest ${exam.color} mb-1`}>{exam.badge} Typing Test</div>
                <h1 className="text-3xl font-black text-white">{exam.title}</h1>
                <p className="text-white/40 text-sm mt-0.5">{exam.fullName}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'Duration', value: `${exam.duration / 60} min`, icon: Clock, color: 'text-white' },
                { label: 'Target WPM', value: `${exam.wpmTarget}+`, icon: Zap, color: exam.color },
                { label: 'Min Accuracy', value: `${exam.accuracyTarget}%`, icon: Target, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur">
                  <s.icon className={`w-4 h-4 mx-auto mb-2 ${s.color}`} />
                  <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-white/30 mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Rules */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
                <Shield className="w-3.5 h-3.5" /> Exam Rules
              </div>
              <div className="grid grid-cols-2 gap-2">
                {exam.rules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                    <span className={`w-1.5 h-1.5 rounded-full ${exam.color.replace('text-', 'bg-')} shrink-0`} />
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Passage preview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Passage Preview</div>
              <p className={`text-white/40 text-sm leading-relaxed line-clamp-2 ${isHindi ? '' : 'font-mono'}`}>
                {passage}
              </p>
              <div className="mt-2 text-[11px] text-white/20">{passage.length} characters · {Math.round(passage.split(' ').length)} words</div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={startCountdown}
              className={`w-full py-4 rounded-2xl font-black text-lg text-white transition-all shadow-2xl flex items-center justify-center gap-3 ${
                exam.language === 'Hindi'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 shadow-orange-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20'
              }`}>
              <Zap className="w-5 h-5" />
              Start Mock Test
            </motion.button>

            <p className="text-center text-white/20 text-xs mt-3">
              A new passage is selected randomly each attempt
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN: COUNTDOWN
  // ═══════════════════════════════════════════════════════════════════════════
  if (screen === 'countdown') {
    return (
      <div className="h-[100dvh] bg-[#0d0d14] flex items-center justify-center">
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div key={countdown}
              initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.35 }}>
              {countdown > 0 ? (
                <div className="text-[12rem] font-black text-white leading-none">{countdown}</div>
              ) : (
                <div className="text-7xl font-black text-emerald-400">GO!</div>
              )}
            </motion.div>
          </AnimatePresence>
          <p className="text-white/30 text-lg mt-4">Get ready…</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN: ACTIVE EXAM
  // ═══════════════════════════════════════════════════════════════════════════
  if (screen === 'active') {
    const urgentTime = timeLeft <= 30;
    const warningTime = timeLeft <= 60 && timeLeft > 30;

    return (
      <div
        ref={containerRef}
        tabIndex={0}
        className="h-[100dvh] bg-[#0d0d14] flex flex-col outline-none"
        style={{ fontFamily: isHindi ? "'Noto Sans Devanagari', sans-serif" : 'inherit' }}
      >
        {/* ── Top bar ── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/5">
          {/* Left: exam name */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${exam.bg} ${exam.color} border ${exam.border}`}>
              MOCK TEST
            </span>
            <span className="text-white/30 text-sm hidden sm:inline">{exam.title}</span>
          </div>

          {/* Center: live stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[9px] text-white/20 uppercase tracking-widest">WPM</div>
              <motion.div key={wpm} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                className={`text-xl font-black font-mono tabular-nums ${exam.color}`}>
                {startTime ? wpm : '—'}
              </motion.div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-white/20 uppercase tracking-widest">Accuracy</div>
              <div className={`text-xl font-black font-mono tabular-nums ${accuracy >= exam.accuracyTarget ? 'text-emerald-400' : 'text-rose-400'}`}>
                {startTime ? `${accuracy}%` : '—'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-white/20 uppercase tracking-widest">Errors</div>
              <div className={`text-xl font-black font-mono tabular-nums ${mistakes.size > 5 ? 'text-rose-400' : 'text-white/50'}`}>
                {mistakes.size}
              </div>
            </div>
          </div>

          {/* Right: timer */}
          <div className={`text-center ${urgentTime ? 'animate-pulse' : ''}`}>
            <div className="text-[9px] text-white/20 uppercase tracking-widest">Time</div>
            <div className={`text-2xl font-black font-mono tabular-nums ${urgentTime ? 'text-rose-500' : warningTime ? 'text-amber-400' : 'text-white'}`}>
              {formattedTime}
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="shrink-0 h-0.5 bg-white/5">
          <motion.div
            className={`h-full ${urgentTime ? 'bg-rose-500' : exam.color.replace('text-', 'bg-')}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* ── Typing area ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-12">

          {!startTime && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-white/20 text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
              Start typing to begin the timer
            </motion.div>
          )}

          {/* Passage */}
          <div className="w-full max-w-3xl">
            <div className={`text-xl sm:text-2xl leading-[3rem] tracking-wide select-none ${isHindi ? 'text-2xl leading-[3.5rem]' : 'font-mono'}`}>
              {renderPassage()}
            </div>

            {/* Bottom bar: progress + shortcut hint */}
            <div className="flex items-center justify-between mt-8 text-xs text-white/15">
              <span>{userInput.length} / {passage.length} characters</span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white/30">Tab</kbd>
                to restart
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCREEN: FINISHED
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0d0d14] text-white flex flex-col items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl">

        {/* Pass / Fail hero */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
            className={`w-24 h-24 rounded-3xl mx-auto mb-5 flex items-center justify-center text-5xl ${
              passed ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-rose-500/15 border border-rose-500/30'
            }`}>
            {passed ? '🏆' : '💪'}
          </motion.div>

          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className={`text-4xl font-black mb-2 ${passed ? 'text-emerald-400' : 'text-white'}`}>
            {passed ? 'Test Passed!' : 'Keep Pushing!'}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-white/40">
            {passed
              ? `You met the ${exam.title} requirements. You're exam-ready!`
              : `Need ${exam.wpmTarget} WPM & ${exam.accuracyTarget}% accuracy. You're getting closer!`}
          </motion.p>
        </div>

        {/* Stats grid */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mb-6">
          {[
            {
              label: 'Net WPM', value: wpm, suffix: '', target: exam.wpmTarget, targetLabel: `Need ${exam.wpmTarget}+`,
              pass: wpm >= exam.wpmTarget, big: true,
            },
            {
              label: 'Accuracy', value: accuracy, suffix: '%', target: exam.accuracyTarget, targetLabel: `Need ${exam.accuracyTarget}%+`,
              pass: accuracy >= exam.accuracyTarget, big: true,
            },
            {
              label: 'Errors', value: mistakes.size, suffix: '', target: 0, targetLabel: '',
              pass: mistakes.size <= 5, big: false,
            },
            {
              label: 'Characters', value: userInput.length, suffix: '', target: 0, targetLabel: `of ${passage.length}`,
              pass: true, big: false,
            },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
              className={`rounded-2xl p-5 border text-center ${
                s.pass ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
              }`}>
              <div className={`font-black font-mono ${s.big ? 'text-4xl' : 'text-2xl'} ${
                s.pass ? 'text-emerald-400' : 'text-rose-400'
              }`}>{s.value}{s.suffix}</div>
              <div className="text-xs text-white/30 uppercase tracking-wider mt-1">{s.label}</div>
              {s.target > 0 && (
                <div className={`text-xs mt-1.5 font-semibold flex items-center justify-center gap-1 ${s.pass ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {s.pass ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {s.pass ? 'Passed' : s.targetLabel}
                </div>
              )}
              {s.targetLabel && s.target === 0 && (
                <div className="text-xs text-white/20 mt-1">{s.targetLabel}</div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30 uppercase tracking-wider">Your WPM vs Target</span>
            <span className={`text-xs font-bold ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {wpm} / {exam.wpmTarget} WPM
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (wpm / exam.wpmTarget) * 100)}%` }}
              transition={{ duration: 0.8, delay: 0.65, ease: 'easeOut' }}
              className={`h-full rounded-full ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={tryAgain}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all ${
              exam.language === 'Hindi'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            } text-white shadow-lg`}>
            <RotateCcw className="w-4 h-4" /> Try Again
          </motion.button>

          {passed && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link to={`/certificate?wpm=${wpm}&acc=${accuracy}&title=${encodeURIComponent(exam.title + ' Test')}`}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">
                <Trophy className="w-4 h-4" /> Certificate
              </Link>
            </motion.div>
          )}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={restart}
            className="px-5 py-3.5 rounded-xl font-bold bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all">
            <Award className="w-4 h-4" />
          </motion.button>
        </motion.div>

        <p className="text-center text-white/15 text-xs mt-4">
          Each attempt uses a different paragraph from our exam library
        </p>
      </motion.div>
    </div>
  );
}

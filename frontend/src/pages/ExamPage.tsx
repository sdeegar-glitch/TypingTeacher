import { useEffect, useState } from 'react';
import CertificateButton from '../components/CertificateButton';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, Zap, Target, Award, RotateCcw, CheckCircle, XCircle, Shield } from 'lucide-react';
import { saveSession } from '../lib/api';
import type { ScoringProfile } from '../lib/typingScoring';
import ExamTypingInterface, { type ExamResult } from '../components/ExamTypingInterface';
import Seo from '../components/Seo';

// Exam keys that have a matching, SEO-owning landing page — canonicalize there
// instead of letting this interactive session page compete with it in search.
const LANDING_CANONICAL: Record<string, string> = {
  'ssc-chsl': '/ssc-chsl-typing-test/',
  'ssc-cgl': '/ssc-cgl-typing-test/',
  'up-police': '/up-police-typing-test/',
  'court-typing': '/court-typing-test/',
  // 'cpct-hindi' is the practice-mode version of the CPCT exam covered by
  // this landing page — canonicalize there instead of competing for the
  // same "CPCT typing test" search intent. 'hindi-typing' has no landing
  // page of its own (a self-canonical default is correct for it).
  'cpct-hindi': '/cpct-typing-test/',
};

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
  /** word-level scoring rules (lib/typingScoring) */
  profile: ScoringProfile;
  /** key depressions per hour required, where the exam sets one */
  kdphTarget?: number;
  /** passage library to draw from (defaults to the exam key) */
  passageKey?: string;
  language: string; color: string; bg: string; border: string;
  icon: string;
  rules: string[];
}> = {
  'ssc-chsl': {
    title: 'SSC CHSL', fullName: 'Staff Selection Commission — CHSL', badge: 'English',
    duration: 600, wpmTarget: 35, accuracyTarget: 80, profile: 'ssc',
    language: 'English', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: '🏛️',
    rules: ['Duration: 10 minutes', 'Target: 35+ WPM', 'Min accuracy: 80%', 'Backspace allowed'],
  },
  'ssc-cgl': {
    title: 'SSC CGL DEST', fullName: 'SSC CGL — Data Entry Speed Test', badge: 'English',
    duration: 900, wpmTarget: 40, accuracyTarget: 85, profile: 'kdph', kdphTarget: 8000,
    language: 'English', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: '📊',
    rules: ['Duration: 15 minutes', 'Target: 40+ WPM', 'Min accuracy: 85%', '8000 KDPH required'],
  },
  'hindi-typing': {
    title: 'Hindi Typing', fullName: 'Hindi Typing — INSCRIPT / Remington Gail', badge: 'Hindi',
    duration: 600, wpmTarget: 30, accuracyTarget: 80, profile: 'ssc',
    language: 'Hindi', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: 'अ',
    rules: ['Duration: 10 minutes', 'Target: 30+ WPM', 'Min accuracy: 80%', 'Mangal font standard'],
  },
  'cpct-hindi': {
    title: 'CPCT Hindi', fullName: 'MP CPCT — Hindi Typing (INSCRIPT / Remington)', badge: 'Hindi',
    duration: 900, wpmTarget: 30, accuracyTarget: 80, profile: 'cpct', passageKey: 'hindi-typing',
    language: 'Hindi', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: 'क',
    rules: ['Duration: 15 minutes', 'Target: 30+ WPM', 'Wrong words are not counted', 'Unicode Hindi (INSCRIPT)'],
  },
  'up-police': {
    title: 'UP Police Typing', fullName: 'UP Police Computer Operator Test', badge: 'Hindi',
    duration: 300, wpmTarget: 25, accuracyTarget: 80, profile: 'ssc',
    language: 'Hindi', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '👮',
    rules: ['Duration: 5 minutes', 'Target: 25+ WPM', 'Min accuracy: 80%', 'Unicode Hindi'],
  },
  'court-typing': {
    title: 'Court Typing', fullName: 'High Court / District Court Typing Test', badge: 'English',
    duration: 600, wpmTarget: 40, accuracyTarget: 90, profile: 'ssc',
    language: 'English', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: '⚖️',
    rules: ['Duration: 10 minutes', 'Target: 40+ WPM', 'Min accuracy: 90%', 'Legal passages'],
  },
};

type Screen = 'info' | 'countdown' | 'active' | 'finished';

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const key = examId && EXAM_CONFIG[examId] ? examId : 'ssc-chsl';
  const exam = EXAM_CONFIG[key];
  const paragraphs = PARAGRAPHS[exam.passageKey ?? key] || PARAGRAPHS['ssc-chsl'];

  const [screen, setScreen] = useState<Screen>('info');
  const [passageIdx, setPassageIdx] = useState(() => Math.floor(Math.random() * paragraphs.length));
  const [countdown, setCountdown] = useState(3);
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);

  const passage = paragraphs[passageIdx];
  const isHindi = exam.language === 'Hindi';

  useEffect(() => { document.title = `${exam.title} Mock Test | FastTypingLab`; }, [exam.title]);

  const handleFinish = (r: ExamResult) => {
    setResult(r);
    setScreen('finished');
    saveSession({
      duration: r.elapsedSec || exam.duration, gross_wpm: r.grossWpm, net_wpm: r.netWpm, errors: r.errors, accuracy: r.accuracy,
      lang: exam.language.toLowerCase(), engine_version: 'v2', input_method: r.inputMethod,
    });
    try {
      const hist = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      hist.push({ netWpm: r.netWpm, accuracy: r.accuracy, lang: exam.language.toLowerCase(), date: new Date().toISOString() });
      localStorage.setItem('typingHistory', JSON.stringify(hist));
    } catch {}
  };

  const startCountdown = () => {
    setScreen('countdown');
    setCountdown(3);
    let c = 3;
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(t); setResult(null); setRunId(r => r + 1); setScreen('active'); }
    }, 1000);
  };

  const restart = () => { setPassageIdx(Math.floor(Math.random() * paragraphs.length)); setScreen('info'); };
  const tryAgain = () => { setPassageIdx(Math.floor(Math.random() * paragraphs.length)); startCountdown(); };

  const wpm = result?.netWpm ?? 0;
  const accuracy = result?.accuracy ?? 0;
  const kdph = Math.round(result?.score.kdph ?? 0);
  const passed = !!result && wpm >= exam.wpmTarget && accuracy >= exam.accuracyTarget
    && (!exam.kdphTarget || kdph >= exam.kdphTarget);

  // ═══ ACTIVE (exam-style typing interface) ═══
  if (screen === 'active') {
    return (
      <ExamTypingInterface
        key={runId}
        passage={passage}
        durationSec={exam.duration}
        isHindi={isHindi}
        examTitle={exam.title}
        profile={exam.profile}
        onFinish={handleFinish}
        onExit={restart}
      />
    );
  }

  // ═══ COUNTDOWN ═══
  if (screen === 'countdown') {
    return (
      <div className="h-[100dvh] bg-[#0d0d14] flex items-center justify-center">
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div key={countdown}
              initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.35 }}>
              {countdown > 0
                ? <div className="text-[12rem] font-black text-white leading-none">{countdown}</div>
                : <div className="text-7xl font-black text-emerald-400">GO!</div>}
            </motion.div>
          </AnimatePresence>
          <p className="text-white/30 text-lg mt-4">Get ready…</p>
        </div>
      </div>
    );
  }

  // ═══ FINISHED ═══
  if (screen === 'finished') {
    return (
      <div className="bg-[#0d0d14] text-white flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
          <div className="text-center mb-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
              className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl ${passed ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-rose-500/15 border border-rose-500/30'}`}>
              {passed ? '🏆' : '💪'}
            </motion.div>
            <h1 className={`text-2xl sm:text-[28px] font-extrabold mb-1.5 ${passed ? 'text-emerald-400' : 'text-white'}`}>{passed ? 'Test Passed!' : 'Keep Pushing!'}</h1>
            <p className="text-white/40 text-sm">
              {passed ? `You met the ${exam.title} requirements. You're exam-ready!` : `Need ${exam.wpmTarget} WPM & ${exam.accuracyTarget}% accuracy. You're getting closer!`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Net WPM', value: wpm, suffix: '', pass: wpm >= exam.wpmTarget, big: true, targetLabel: `Need ${exam.wpmTarget}+` },
              { label: 'Accuracy', value: accuracy, suffix: '%', pass: accuracy >= exam.accuracyTarget, big: true, targetLabel: `Need ${exam.accuracyTarget}%+` },
              { label: 'Gross WPM', value: result?.grossWpm ?? 0, suffix: '', pass: true, big: false, targetLabel: '' },
              { label: 'Errors', value: result?.errors ?? 0, suffix: '', pass: (result?.errors ?? 0) <= 5, big: false, targetLabel: '' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 border text-center ${s.pass ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <div className={`font-black font-mono ${s.big ? 'text-2xl' : 'text-lg'} ${s.pass ? 'text-emerald-400' : 'text-rose-400'}`}>{s.value}{s.suffix}</div>
                <div className="text-xs text-white/30 uppercase tracking-wider mt-0.5">{s.label}</div>
                {s.targetLabel && (
                  <div className={`text-xs mt-1 font-semibold flex items-center justify-center gap-1 ${s.pass ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.pass ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{s.pass ? 'Passed' : s.targetLabel}
                  </div>
                )}
              </div>
            ))}
          </div>

          {result && <ScoreAudit result={result} kdphTarget={exam.kdphTarget} kdph={kdph} />}

          {/* Backspace / delete summary */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-around text-center">
            <div><div className="text-base font-black font-mono text-white/80">{result?.chars ?? 0}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">Chars</div></div>
            <div><div className="text-base font-black font-mono text-white/80">{result?.backspaces ?? 0}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">Backspace</div></div>
            <div><div className="text-base font-black font-mono text-white/80">{result?.deletes ?? 0}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">Delete</div></div>
          </div>

          <div className="flex gap-2.5">
            <button onClick={tryAgain}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white shadow-lg ${exam.language === 'Hindi' ? 'bg-gradient-to-r from-orange-600 to-amber-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <CertificateButton wpm={wpm} accuracy={accuracy} seconds={result?.elapsedSec || exam.duration} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all" />
            <button onClick={restart} className="px-4 py-3 rounded-xl font-bold bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10 transition-all">
              <Award className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-white/15 text-xs mt-3">Each attempt uses a different paragraph from our exam library</p>
        </motion.div>
      </div>
    );
  }

  // ═══ INFO (default) ═══
  return (
    <div className="bg-[#0d0d14] text-white flex flex-col">
      <Seo
        title={`${exam.title} Mock Test | FastTypingLab`}
        description={`Free ${exam.title} typing mock test — ${exam.duration / 60} minutes, target ${exam.wpmTarget}+ WPM at ${exam.accuracyTarget}%+ accuracy. Practice with real exam-style passages.`}
        canonical={LANDING_CANONICAL[key]}
      />
      <div className="px-6 py-3">
        <Link to="/competitive-exam-typing/" className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm transition-colors w-fit">
          <ChevronLeft className="w-4 h-4" /> All Exams
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-4 sm:py-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-lg w-9 h-9 rounded-lg ${exam.bg} border ${exam.border} flex items-center justify-center shrink-0`}>{exam.icon}</span>
            <div>
              <div className={`text-[11px] font-bold uppercase tracking-widest ${exam.color} mb-0.5`}>{exam.badge} Typing Test</div>
              <h1 className="text-2xl sm:text-[28px] font-extrabold leading-tight text-white">{exam.title}</h1>
              <p className="text-white/40 text-sm mt-0.5">{exam.fullName}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Duration', value: `${exam.duration / 60} min`, icon: Clock, color: 'text-white' },
              { label: 'Target WPM', value: `${exam.wpmTarget}+`, icon: Zap, color: exam.color },
              { label: 'Min Accuracy', value: `${exam.accuracyTarget}%`, icon: Target, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur">
                <s.icon className={`w-4 h-4 mx-auto mb-1.5 ${s.color}`} />
                <div className={`text-lg font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-white/30 mt-0.5 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-2.5">
              <Shield className="w-3.5 h-3.5" /> Exam Rules
            </div>
            <div className="grid grid-cols-2 gap-2">
              {exam.rules.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/50">
                  <span className={`w-1.5 h-1.5 rounded-full ${exam.color.replace('text-', 'bg-')} shrink-0`} />{r}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
            <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2.5">Passage Preview</div>
            <p className={`text-white/40 text-sm leading-relaxed line-clamp-2 ${isHindi ? '' : 'font-mono'}`} style={isHindi ? { fontFamily: "'Noto Sans Devanagari', sans-serif" } : undefined}>{passage}</p>
            <div className="mt-2 text-[11px] text-white/20">{passage.length} characters · {passage.split(' ').length} words</div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startCountdown}
            className={`w-full py-3.5 rounded-xl font-black text-base text-white transition-all shadow-2xl flex items-center justify-center gap-3 ${exam.language === 'Hindi' ? 'bg-gradient-to-r from-orange-600 to-amber-600 shadow-orange-500/20' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20'}`}>
            <Zap className="w-5 h-5" /> Start Mock Test
          </motion.button>
          <p className="text-center text-white/20 text-xs mt-2.5">A new passage is selected randomly each attempt</p>
        </motion.div>
      </div>
    </div>
  );
}

const REASON_LABEL: Record<string, string> = {
  wrong: 'wrong word', omitted: 'word skipped', extra: 'extra word', repeated: 'repeated word', incomplete: 'incomplete word',
  punctuation: 'punctuation', spacing: 'spacing', transposition: 'words swapped',
};

// Shows exactly how the score was counted so it can be checked (and trusted).
function ScoreAudit({ result, kdphTarget, kdph }: { result: ExamResult; kdphTarget?: number; kdph: number }) {
  const { score } = result;
  const [open, setOpen] = useState(false);
  const rules = score.profile === 'cpct'
    ? 'CPCT style: wrong words are not counted; there is no deduction.'
    : 'SSC style: a wrong, missing, extra, repeated or incomplete word is 1 full mistake; punctuation, spacing or swapped words are a half mistake (0.5). Net words = gross words (keys ÷ 5) − mistakes.';
  const uncorrected = result.wrongChars;
  const corrected = result.backspaces + result.deletes;
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-sm">
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div><div className="text-lg font-black font-mono text-white/80">{score.correctWords}/{score.typedWords}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">Correct words</div></div>
        <div><div className="text-lg font-black font-mono text-white/80">{score.fullMistakes} + {score.halfMistakes}×½</div><div className="text-[10px] text-white/30 uppercase tracking-wider">Full + half</div></div>
        <div><div className={`text-lg font-black font-mono ${kdphTarget ? (kdph >= kdphTarget ? 'text-emerald-400' : 'text-rose-400') : 'text-white/80'}`}>{kdph}</div><div className="text-[10px] text-white/30 uppercase tracking-wider">KDPH{kdphTarget ? ` (need ${kdphTarget})` : ''}</div></div>
      </div>
      <div className="text-xs text-white/40 mb-2">Errors left in text: <b className="text-white/70">{uncorrected}</b> characters · Corrections made: <b className="text-white/70">{corrected}</b> keys</div>
      <button onClick={() => setOpen(o => !o)} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
        {open ? 'Hide' : 'Show'} mistake list ({score.mistakes.length})
      </button>
      {open && (
        <ul className="mt-2 max-h-48 overflow-y-auto space-y-1 text-xs">
          {score.mistakes.length === 0 && <li className="text-emerald-400">No mistakes — clean run.</li>}
          {score.mistakes.map((m, i) => (
            <li key={i} className="flex flex-wrap gap-x-2 text-white/60">
              <span className={m.kind === 'full' ? 'text-rose-400 font-bold' : 'text-amber-300 font-bold'}>{m.kind === 'full' ? 'Full' : 'Half'}</span>
              <span>{REASON_LABEL[m.reason] ?? m.reason}</span>
              {m.expected && <span>expected <b className="text-white/80">{m.expected}</b></span>}
              {m.typed && <span>typed <b className="text-white/80">{m.typed}</b></span>}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-white/25 mt-3">{rules} These rules come from public summaries of exam guidelines, so confirm them against your exam notification.</p>
    </div>
  );
}

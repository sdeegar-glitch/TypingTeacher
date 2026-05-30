import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, BookOpen, AlertCircle, RotateCcw } from 'lucide-react';
import { useTypingEngine } from '../hooks/useTypingEngine';

// Exam configuration data
const EXAMS: Record<string, {
  title: string;
  fullName: string;
  duration: number;
  wpmTarget: number;
  accuracyTarget: number;
  language: string;
  rules: string[];
  tips: string[];
  text: string;
}> = {
  'ssc-chsl': {
    title: 'SSC CHSL Typing Test',
    fullName: 'Staff Selection Commission — Combined Higher Secondary Level',
    duration: 600, // 10 min
    wpmTarget: 35,
    accuracyTarget: 80,
    language: 'English',
    rules: [
      'Duration: 10 minutes for English, 15 minutes for Hindi',
      'Speed requirement: 35 WPM for English typing posts',
      'Accuracy target: Minimum 80% required to qualify',
      'Backspace is allowed, but it adds to your error count',
      'Test is conducted on a computer with standard QWERTY keyboard',
      'No spell check or auto-correction allowed during the test',
    ],
    tips: [
      'Practice daily for at least 30 minutes to build consistent speed',
      'Focus on accuracy first — speed follows naturally',
      'Learn all fingers on home row (ASDF JKL;) before moving to other rows',
      'Do not look at the keyboard — train your fingers to find keys by feel',
      'Practice common SSC passages which often include government and economics topics',
    ],
    text: 'The government of India has announced a new policy to promote digital literacy across the country. Under this initiative, free computer training centres will be set up in rural areas to educate citizens about the internet, online banking, and digital payments. The programme aims to bring technology to every household and help people access government services through digital platforms. Officials believe that digital literacy is essential for the economic development of the nation and will create new employment opportunities for the youth.',
  },
  'ssc-cgl': {
    title: 'SSC CGL DEST Test',
    fullName: 'SSC CGL — Data Entry Speed Test',
    duration: 900, // 15 min
    wpmTarget: 40,
    accuracyTarget: 85,
    language: 'English',
    rules: [
      'Duration: 15 minutes for DEST (Data Entry Speed Test)',
      'Speed requirement: 8,000 key depressions per hour',
      'Equivalent to approximately 27 WPM with accuracy',
      'Test passage will be provided on screen',
      'No word processor aids (spell check, autocorrect) allowed',
      'Final score calculated as net key depressions',
    ],
    tips: [
      'Practice data entry with numbers and special characters frequently',
      'DEST tests focus on numeric and alphanumeric data — practice these specifically',
      'Aim for minimum 8,500 KDPH to have a safety margin',
      'Use all 10 fingers and maintain proper posture throughout',
      'Practice on the actual exam software if possible for SSC CGL',
    ],
    text: 'The Income Tax Department has released the annual report for the financial year. According to the data, the total tax collection increased by fifteen percent compared to the previous year. The number of return filers grew to eighty million with direct tax contributing sixty percent of the revenue. The department processed refunds worth two thousand crore rupees online. New simplified tax forms reduced the compliance burden on small businesses and salaried individuals significantly this year.',
  },
  'hindi-typing': {
    title: 'Hindi Typing Test (Remington)',
    fullName: 'Hindi Typing — Remington/GAIL/INSCRIPT Layout',
    duration: 600,
    wpmTarget: 30,
    accuracyTarget: 80,
    language: 'Hindi',
    rules: [
      'Duration: 10 minutes for most government exams',
      'Speed: 30 WPM (Hindi) for most Central Government posts',
      'Keyboard layouts accepted: Remington Gail, INSCRIPT',
      'Mangal font is the standard font used in all examinations',
      'No transliteration software allowed during official exams',
      'Test passage is in Devanagari script',
    ],
    tips: [
      'Master the Remington Gail layout as it is the most commonly required layout',
      'Practice Devanagari matras (vowel marks) and half-letters daily',
      'Common mistake: confusing similar-looking keys — practice slow and deliberate',
      'Use online Hindi typing tutors to build finger memory for the layout',
      'Practice with actual exam-style passages about government schemes and news',
    ],
    text: 'Practice your Hindi typing speed here. The government of India requires Hindi typing proficiency for many central government posts including SSC, CPCT, and court examination posts. Consistent daily practice of at least one hour is recommended to achieve the required speed. Focus on accuracy over speed initially, as errors will reduce your net score significantly in the final examination.',
  },
  'court-typing': {
    title: 'Court Typing Test',
    fullName: 'High Court / District Court Typing Examination',
    duration: 600,
    wpmTarget: 40,
    accuracyTarget: 90,
    language: 'English',
    rules: [
      'Duration: 10 minutes for most court typing examinations',
      'English typing: 40 WPM with 90% accuracy for stenographer posts',
      'Hindi typing: 25–30 WPM for court clerk posts',
      'Legal passages are commonly used — practice legal terminology',
      'Error penalty: Each uncorrected error reduces your final word count',
      'Test is conducted in a supervised environment on provided computers',
    ],
    tips: [
      'Read legal documents and court orders to familiarise yourself with legal language',
      'Practice typing long paragraphs without stopping to maintain rhythm',
      'High accuracy (90%+) is critical for court posts — do not rush',
      'Learn to type punctuation marks quickly as they are common in legal texts',
      'Practice with passages from previous court exam papers for familiarity',
    ],
    text: 'The Honourable High Court of India hereby issues the following order in the matter of the petition filed before this court. After careful consideration of the arguments presented by both the petitioner and the respondent, and having examined all the relevant documents and precedents, the court is of the considered opinion that the matter requires further examination. The case is therefore adjourned to the next date of hearing where additional evidence shall be produced before the bench for final adjudication.',
  },
};

type ExamState = 'info' | 'active' | 'finished';

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const exam = EXAMS[examId || ''] || EXAMS['ssc-chsl'];
  const [examState, setExamState] = useState<ExamState>('info');

  useEffect(() => {
    document.title = `${exam.title} — Mock Practice | FastTypingLab`;
  }, [exam.title]);

  const engine = useTypingEngine(
    exam.text,
    exam.duration,
    'timed',
    () => setExamState('finished')
  );

  const { stats, userInput, mistakes, nextChar, processChar, processBackspace, reset } = engine;

  // Desktop key handler
  useEffect(() => {
    if (examState !== 'active') return;
    const onKey = (e: KeyboardEvent) => {
      if (['Shift','Control','Alt','Meta','CapsLock','Tab','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
      if (e.key === ' ') e.preventDefault();
      if (e.key === 'Backspace') processBackspace();
      else if (e.key.length === 1) processChar(e.key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [examState, processChar, processBackspace]);

  const formattedTime = `${Math.floor(stats.timeLeft / 60)}:${String(stats.timeLeft % 60).padStart(2, '0')}`;
  const passed = stats.netWpm >= exam.wpmTarget && stats.accuracy >= exam.accuracyTarget;

  const startExam = () => {
    reset();
    setExamState('active');
  };

  const resetExam = () => {
    reset();
    setExamState('info');
  };

  if (examState === 'info') {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/tools" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Tools
            </Link>
            <div className="h-4 w-px bg-brand-border" />
            <h1 className="text-lg font-bold text-brand-text">{exam.title}</h1>
          </div>

          {/* Exam header card */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-black text-brand-text mb-1">{exam.title}</h2>
                <p className="text-brand-muted text-sm">{exam.fullName}</p>
              </div>
              <span className="bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-3 py-1 rounded-full text-sm font-bold">
                {exam.language}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Duration', value: `${exam.duration / 60} min`, icon: Clock },
                { label: 'Target WPM', value: `${exam.wpmTarget}+ WPM`, icon: BookOpen },
                { label: 'Min Accuracy', value: `${exam.accuracyTarget}%`, icon: AlertCircle },
              ].map(s => (
                <div key={s.label} className="bg-brand-surface-2 rounded-xl p-3 text-center border border-brand-border">
                  <s.icon className="w-4 h-4 mx-auto mb-1 text-brand-muted" />
                  <div className="font-black text-brand-text font-mono">{s.value}</div>
                  <div className="text-xs text-brand-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-7">
            {/* Rules */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <h3 className="font-bold text-brand-text mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Exam Rules
              </h3>
              <ul className="space-y-2">
                {exam.rules.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-brand-text-muted">
                    <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <h3 className="font-bold text-brand-text mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-accent" />
                Preparation Tips
              </h3>
              <ul className="space-y-2">
                {exam.tips.map((t, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-brand-text-muted">
                    <span className="text-brand-accent font-bold shrink-0 mt-0.5">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={startExam}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
          >
            Start Mock Test
          </button>
        </div>
      </div>
    );
  }

  if (examState === 'finished') {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{passed ? '🎉' : '💪'}</div>
            <h2 className="text-3xl font-black text-brand-text mb-2">
              {passed ? 'Test Passed!' : 'Almost There!'}
            </h2>
            <p className="text-brand-muted">
              {passed
                ? `You met the ${exam.title} speed requirements!`
                : `Keep practicing to reach ${exam.wpmTarget} WPM and ${exam.accuracyTarget}% accuracy.`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Net WPM', value: stats.netWpm, target: exam.wpmTarget, suffix: ' WPM', colorPass: 'text-brand-accent', colorFail: 'text-rose-500' },
              { label: 'Accuracy', value: stats.accuracy, target: exam.accuracyTarget, suffix: '%', colorPass: 'text-brand-accent', colorFail: 'text-rose-500' },
              { label: 'Gross WPM', value: stats.wpm, target: 0, suffix: ' WPM', colorPass: 'text-brand-text', colorFail: 'text-brand-text' },
              { label: 'Errors', value: stats.errors, target: 0, suffix: '', colorPass: 'text-brand-muted', colorFail: 'text-rose-500' },
            ].map(s => {
              const ok = s.target === 0 || s.value >= s.target;
              return (
                <div key={s.label} className={`bg-brand-surface border rounded-2xl p-5 text-center ${ok ? 'border-brand-accent/30' : 'border-rose-500/20'}`}>
                  <div className={`text-3xl font-black font-mono ${ok ? s.colorPass : s.colorFail}`}>
                    {s.value}{s.suffix}
                  </div>
                  <div className="text-xs text-brand-muted mt-1 uppercase tracking-wider">{s.label}</div>
                  {s.target > 0 && (
                    <div className={`text-xs mt-1 font-semibold ${ok ? 'text-brand-accent' : 'text-rose-400'}`}>
                      {ok ? '✓ Passed' : `Need ${s.target}${s.suffix}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={startExam}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white py-3 rounded-xl font-bold transition-all">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button onClick={resetExam}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-surface-2 hover:bg-brand-border border border-brand-border text-brand-text py-3 rounded-xl font-semibold text-sm transition-all">
              Exam Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active exam
  return (
    <div className="h-[100dvh] bg-brand-bg text-brand-text flex flex-col overflow-hidden">
      {/* Exam header */}
      <div className="shrink-0 bg-brand-surface border-b border-brand-border px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2.5 py-1 rounded-md">MOCK EXAM</span>
          <span className="text-sm font-semibold text-brand-text hidden sm:inline">{exam.title}</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest">Time</div>
            <div className={`text-lg font-black font-mono tabular-nums ${stats.timeLeft <= 60 ? 'text-rose-500' : 'text-brand-text'}`}>{formattedTime}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest">WPM</div>
            <div className="text-lg font-black font-mono text-brand-primary tabular-nums">{stats.netWpm}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest">Acc</div>
            <div className={`text-lg font-black font-mono tabular-nums ${stats.accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500'}`}>{stats.accuracy}%</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-0.5 bg-brand-border">
        <motion.div className="h-full bg-brand-primary" animate={{ width: `${stats.progress}%` }} transition={{ duration: 0.1 }} />
      </div>

      {/* Typing area */}
      <div className="flex-grow flex items-start justify-center px-4 sm:px-8 pt-8 overflow-hidden">
        <div className="w-full max-w-3xl bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="text-lg sm:text-xl font-mono tracking-wide leading-relaxed break-words overflow-y-auto" style={{ maxHeight: 200 }}>
            {exam.text.split('').map((char, i) => {
              const isCorrect = i < userInput.length && !mistakes.has(i);
              const isError = i < userInput.length && mistakes.has(i);
              const isCurrent = i === userInput.length;
              return (
                <span key={i} className="relative">
                  {isCurrent && <span className="typing-caret" aria-hidden="true" />}
                  <span className={isCorrect ? 'typing-correct' : isError ? 'typing-error' : isCurrent ? 'typing-current' : 'typing-upcoming'}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                </span>
              );
            })}
          </div>
          {!stats.isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-surface/90 rounded-2xl">
              <p className="text-brand-text-muted font-semibold">Start typing to begin the exam timer…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

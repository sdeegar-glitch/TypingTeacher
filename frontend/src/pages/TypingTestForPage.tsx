import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Target, Clock, BookOpen, GraduationCap, CheckCircle, HelpCircle } from 'lucide-react';
import Seo from '../components/Seo';

interface Profession {
  title: string;          // used in breadcrumb + card labels
  h1?: string;            // on-page H1 (defaults to title)
  seoTitle?: string;      // <title> (defaults to `${title} | FastTypingLab`)
  metaDesc: string;
  intro: string;
  whyItMatters: string;
  targetWpm: number;
  practiceText: string;
  faqs: { q: string; a: string }[];
  relatedExams: { label: string; href: string }[];
}

// SEO content per profession keyword
const PROFESSION_DATA: Record<string, Profession> = {
  students: {
    title: 'Typing Test for Students',
    seoTitle: 'Typing Test for Students — Free WPM Speed Test & Practice',
    metaDesc: 'Free typing test for students. Improve your typing speed and accuracy for school, college exams, and competitive tests.',
    intro: 'Students who can type faster take better notes, finish assignments quicker, and score higher in computer-based exams. Our typing test is designed for school and college students to build speed progressively.',
    whyItMatters: 'Online exams, coding classes, and assignments are all timed. A student typing at 45 WPM finishes the same test in half the time of one typing at 22 WPM — leaving more time to think, review, and score higher.',
    targetWpm: 35,
    practiceText: 'Education is the most powerful weapon which you can use to change the world. The roots of education are bitter, but the fruit is sweet. An investment in knowledge pays the best interest. Learning is a treasure that will follow its owner everywhere.',
    faqs: [
      { q: 'What is a good typing speed for students?', a: 'Aim for 35–45 WPM with 95%+ accuracy. That is comfortably fast for notes, assignments and most computer-based exams.' },
      { q: 'How can students improve typing speed?', a: 'Practise 10–15 minutes daily using all ten fingers, keep your eyes off the keyboard, and prioritise accuracy before speed.' },
    ],
    relatedExams: [
      { label: 'SSC CHSL Typing Test', href: '/exam/ssc-chsl' },
      { label: 'Hindi Typing Test', href: '/exam/hindi-typing' },
    ],
  },
  'data-entry': {
    title: 'Typing Test for Data Entry Operators',
    seoTitle: 'Data Entry Typing Test — 8000 Key Depressions / Hour Practice',
    metaDesc: 'Typing speed test for data entry jobs. Practice to achieve 40+ WPM with 95%+ accuracy required for government and private data entry posts.',
    intro: 'Data entry operators must maintain high speed and near-perfect accuracy. Most government data entry posts require a minimum of 8,000 key depressions per hour (approximately 27 WPM). Private sector BPO jobs often demand 40–50 WPM.',
    whyItMatters: 'In data entry, accuracy is as important as speed — a single wrong digit in an invoice or record can be costly. Government DEO tests measure 8,000 key depressions per hour, so daily timed practice on a physical keyboard is essential.',
    targetWpm: 40,
    practiceText: 'Invoice number 7842-B dated March 15 2026. Customer: Rajesh Kumar, Address: 45 MG Road Bangalore 560001. Product: Laptop Model X200, Quantity: 2, Unit Price: 45000, Total: 90000. Payment method: NEFT, Bank Reference: TXN8842567.',
    faqs: [
      { q: 'What does 8000 key depressions per hour mean in WPM?', a: 'Roughly 27 WPM. Key depressions count every keystroke, so 8,000/hour ≈ 133/minute ≈ 27 words per minute at 5 characters per word.' },
      { q: 'What typing speed is needed for data entry jobs?', a: 'Government DEO posts usually require ~8,000 key depressions/hour (about 27 WPM). Private/BPO data entry often expects 40–50 WPM with 95%+ accuracy.' },
    ],
    relatedExams: [
      { label: 'SSC CGL DEST Test', href: '/exam/ssc-cgl' },
      { label: 'DEO Typing Test', href: '/deo-typing-test' },
      { label: 'Court Typing Test', href: '/exam/court-typing' },
    ],
  },
  'government-employees': {
    title: 'Typing Test for Government Employees',
    seoTitle: 'Typing Test for Government Jobs — SSC, CPCT & Court Practice',
    metaDesc: 'Practice typing test for government jobs in India. SSC, CPCT, Court, Railway exams require 30-40 WPM. Start your free mock test now.',
    intro: 'Most central and state government positions in India require a qualifying typing test. English typing requires 35 WPM for most SSC posts, while Hindi typing requires 25–30 WPM. Accuracy is equally important.',
    whyItMatters: 'A typing test is a qualifying skill test for SSC, CPCT, UP Police, court and railway posts — you must clear it to be selected. Practising in the exact exam format (duration, language and layout) is the fastest way to pass.',
    targetWpm: 35,
    practiceText: 'The Ministry of Finance has issued a circular regarding the revised pay structure for central government employees. All departments are required to submit compliance reports by the end of the current financial quarter. The circular is available on the official government portal for reference.',
    faqs: [
      { q: 'Which government exams have a typing test?', a: 'SSC CHSL & CGL, CPCT, UP Police, RSMSSB/LDC, DSSSB, court/steno and many railway posts include a qualifying typing skill test.' },
      { q: 'What speed is required for government typing tests?', a: 'Commonly 35 WPM in English or 25–30 WPM in Hindi, but always confirm your exact post notification.' },
    ],
    relatedExams: [
      { label: 'SSC CHSL Test', href: '/ssc-chsl-typing-test' },
      { label: 'CPCT Typing Test', href: '/cpct-typing-test' },
      { label: 'DSSSB Typing Test', href: '/dsssb-typing-test' },
      { label: 'All Exam Typing', href: '/competitive-exam-typing' },
    ],
  },
  professionals: {
    title: 'Typing Test for Working Professionals',
    h1: 'Professional Typing Test — Check Your WPM & Speed',
    seoTitle: 'Professional Typing Test — Free WPM Speed Test for Work',
    metaDesc: 'Free professional typing test. Check your WPM, see speed benchmarks by profession, and get AI coaching to type faster at work.',
    intro: 'The average professional spends 2+ hours per day typing emails, reports, and documents. A professional typing test tells you exactly where you stand — and improving from 35 WPM to 70 WPM can save you over an hour of work time every single day.',
    whyItMatters: 'Faster, more accurate typing means fewer hours on email and documentation and more time on actual work. Most proficient office professionals type 60–75 WPM; touch typists and developers often exceed 80 WPM. Testing your speed is the first step to improving it.',
    targetWpm: 65,
    practiceText: 'Dear team, please find attached the quarterly performance report for Q1 2026. The revenue increased by 18% compared to the same period last year. Marketing spend was optimised resulting in a 12% reduction in cost per acquisition. Please review the attached slides before Thursday\'s board meeting.',
    faqs: [
      { q: 'What is a good typing speed for professionals?', a: 'A proficient professional types 60–75 WPM with 95%+ accuracy. Anything above 80 WPM is excellent and typical of touch typists and developers.' },
      { q: 'How do I test my professional typing speed?', a: 'Take a free 1–5 minute WPM test on a physical keyboard. Your net WPM (speed minus errors) is the number employers and productivity tools care about.' },
      { q: 'Why does typing speed matter at work?', a: 'Professionals spend hours a day typing. Going from 35 to 70 WPM can save over an hour daily and reduces mistakes in emails, reports and code.' },
    ],
    relatedExams: [
      { label: 'Typing Test for Programmers', href: '/typing-test-for/programmers' },
      { label: 'Typing Test for Data Entry', href: '/typing-test-for/data-entry' },
      { label: 'Improve Typing Speed & Accuracy', href: '/blog/how-to-improve-typing-speed-and-accuracy' },
    ],
  },
  beginners: {
    title: 'Typing Test for Beginners',
    seoTitle: 'Typing Test for Beginners — Learn Touch Typing from Scratch',
    metaDesc: 'Start your typing journey with our beginner-friendly typing test. Learn touch typing from scratch, build finger memory, and improve your WPM.',
    intro: 'If you are a complete beginner, you are in the right place. The most important things to learn first are: proper finger placement on the home row (ASDF JKL;), not looking at the keyboard, and building accuracy before speed.',
    whyItMatters: 'Beginners who learn correct finger placement early avoid slow hunt-and-peck habits that are hard to unlearn later. Start with accuracy, keep your eyes on the screen, and speed builds naturally with daily practice.',
    targetWpm: 25,
    practiceText: 'the quick brown fox jumps over the lazy dog. a fast fox ran by the old barn. the sun set over the quiet hills. she sells sea shells by the sea shore. all good things come to those who wait.',
    faqs: [
      { q: 'What is a good typing speed for a beginner?', a: 'Beginners typically start at 15–25 WPM. Focus on accuracy and correct finger placement first — speed follows naturally.' },
      { q: 'How do I learn to type without looking?', a: 'Keep your fingers on the home row (ASDF JKL;), practise short daily sessions, and resist glancing down. Muscle memory builds within a few weeks.' },
    ],
    relatedExams: [
      { label: 'Learn Touch Typing', href: '/learn' },
      { label: 'How to Type Without Looking', href: '/blog/how-to-type-without-looking-touch-typing-guide' },
    ],
  },
  programmers: {
    title: 'Typing Test for Programmers & Developers',
    seoTitle: 'Typing Test for Programmers — Code Typing Speed Practice',
    metaDesc: 'Coding-focused typing test for software developers. Practice typing code snippets, special characters, and improve your programming speed.',
    intro: 'Developers type more special characters than average users — brackets, semicolons, underscores, and operators. A faster typing speed directly translates to faster coding speed and more productive programming sessions.',
    whyItMatters: 'Code is dense with symbols the average typist rarely uses. Practising real snippets trains your fingers for brackets, operators and camelCase, so you spend less time fighting the keyboard and more time solving problems.',
    targetWpm: 70,
    practiceText: 'const fetchUser = async (userId: string): Promise<User> => { const response = await fetch(`/api/users/${userId}`); if (!response.ok) { throw new Error("User not found"); } return response.json(); };',
    faqs: [
      { q: 'What is a good typing speed for programmers?', a: 'Many developers type 60–80 WPM on prose, but code is slower due to symbols. Practising real code snippets is the best way to speed up.' },
      { q: 'How can I type code faster?', a: 'Practise snippets with brackets and operators, learn your editor shortcuts, and use all ten fingers so your hands rarely leave the home row.' },
    ],
    relatedExams: [
      { label: 'Coding Typing Practice', href: '/coding-typing' },
      { label: 'Typing Test for Professionals', href: '/typing-test-for/professionals' },
    ],
  },
};

const IMPROVE_TIPS = [
  'Use all ten fingers and keep them resting on the home row (ASDF JKL;).',
  'Do not look at the keyboard — build muscle memory by watching the screen.',
  'Prioritise accuracy first; consistent speed follows naturally.',
  'Practise 10–15 minutes every day on a physical keyboard, not a phone.',
  'Take real timed tests to build stamina for exams and long work sessions.',
];

const DEFAULT = PROFESSION_DATA['students'];

export default function TypingTestForPage() {
  const { profession = 'students' } = useParams<{ profession: string }>();
  const data = PROFESSION_DATA[profession] || DEFAULT;
  const heading = data.h1 || data.title;

  useEffect(() => {
    document.title = data.seoTitle || `${data.title} | FastTypingLab`;
  }, [profession, data.title, data.seoTitle]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo title={data.seoTitle || `${data.title} | FastTypingLab`} description={data.metaDesc} />
      {data.faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/tests" className="hover:text-brand-primary transition-colors">Tests</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-text">{data.title}</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text mb-3">{heading}</h1>
          <p className="text-brand-text-muted leading-relaxed">{data.intro}</p>
        </motion.div>

        {/* Target stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Target WPM', value: `${data.targetWpm}+`, icon: Zap, color: 'text-brand-primary' },
            { label: 'Min Accuracy', value: '90%', icon: Target, color: 'text-brand-accent' },
            { label: 'Test Duration', value: '1–5 min', icon: Clock, color: 'text-brand-secondary' },
          ].map(s => (
            <div key={s.label} className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-brand-muted mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link to="/tests"
            className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20">
            <Zap className="w-4 h-4" /> Start Typing Test
          </Link>
          <Link to="/learn"
            className="flex-1 bg-brand-surface-2 border border-brand-border hover:bg-brand-border text-brand-text py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 transition-all">
            <BookOpen className="w-4 h-4" /> Learn Touch Typing
          </Link>
        </div>

        {/* Why it matters */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-brand-text mb-3">Why typing speed matters</h2>
          <p className="text-brand-text-muted text-sm leading-relaxed">{data.whyItMatters}</p>
        </div>

        {/* Practice passage */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-brand-primary" />
            <h2 className="font-bold text-brand-text">Sample Practice Passage</h2>
          </div>
          <p className="font-mono text-sm text-brand-text-muted leading-relaxed bg-brand-surface-2 border border-brand-border rounded-xl p-4">
            {data.practiceText}
          </p>
        </div>

        {/* Recommended typing speed by profession — benchmark table + cross-links */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-brand-text mb-4">Recommended typing speed by profession</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-muted border-b border-brand-border">
                  <th className="py-2 pr-4 font-semibold">Profession / Goal</th>
                  <th className="py-2 font-semibold">Target WPM</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PROFESSION_DATA).map(([key, val]) => (
                  <tr key={key} className="border-b border-brand-border/60 last:border-0">
                    <td className="py-2.5 pr-4">
                      <Link to={`/typing-test-for/${key}`}
                        className={`font-semibold hover:text-brand-primary transition-colors ${key === profession ? 'text-brand-primary' : 'text-brand-text'}`}>
                        {val.title.replace('Typing Test for ', '')}
                      </Link>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-brand-text-muted">{val.targetWpm}+ WPM</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to improve */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-brand-text mb-4">How to improve your typing speed</h2>
          <ul className="space-y-2.5">
            {IMPROVE_TIPS.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-brand-text-muted leading-relaxed">
                <CheckCircle className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        {data.faqs.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-primary" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {data.faqs.map((f, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-sm text-brand-text mb-1">{f.q}</h3>
                  <p className="text-brand-text-muted text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related exams */}
        {data.relatedExams.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-6">
            <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-secondary" />
              Recommended Practice
            </h2>
            <div className="space-y-2">
              {data.relatedExams.map(e => (
                <Link key={e.href} to={e.href}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-brand-surface-2 hover:bg-brand-border border border-brand-border transition-all group">
                  <span className="font-semibold text-sm text-brand-text">{e.label}</span>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Other professions nav */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Also see:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROFESSION_DATA).filter(([k]) => k !== profession).map(([key, val]) => (
              <Link key={key} to={`/typing-test-for/${key}`}
                className="text-xs bg-brand-surface-2 border border-brand-border hover:border-brand-primary/30 hover:text-brand-primary text-brand-muted px-3 py-1.5 rounded-full transition-all">
                {val.title.replace('Typing Test for ', '')}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

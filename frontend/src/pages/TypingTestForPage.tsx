import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Zap, Target, Clock, BookOpen, GraduationCap } from 'lucide-react';

// SEO content per profession keyword
const PROFESSION_DATA: Record<string, {
  title: string;
  metaDesc: string;
  intro: string;
  targetWpm: number;
  practiceText: string;
  relatedExams: { label: string; href: string }[];
}> = {
  students: {
    title: 'Typing Test for Students',
    metaDesc: 'Free typing test for students. Improve your typing speed and accuracy for school, college exams, and competitive tests.',
    intro: 'Students who can type faster take better notes, finish assignments quicker, and score higher in computer-based exams. Our typing test is designed for school and college students to build speed progressively.',
    targetWpm: 35,
    practiceText: 'Education is the most powerful weapon which you can use to change the world. The roots of education are bitter, but the fruit is sweet. An investment in knowledge pays the best interest. Learning is a treasure that will follow its owner everywhere.',
    relatedExams: [
      { label: 'SSC CHSL Typing Test', href: '/exam/ssc-chsl' },
      { label: 'Hindi Typing Test', href: '/exam/hindi-typing' },
    ],
  },
  'data-entry': {
    title: 'Typing Test for Data Entry Operators',
    metaDesc: 'Typing speed test for data entry jobs. Practice to achieve 40+ WPM with 95%+ accuracy required for government and private data entry posts.',
    intro: 'Data entry operators must maintain high speed and near-perfect accuracy. Most government data entry posts require a minimum of 8,000 key depressions per hour (approximately 27 WPM). Private sector BPO jobs often demand 40–50 WPM.',
    targetWpm: 40,
    practiceText: 'Invoice number 7842-B dated March 15 2026. Customer: Rajesh Kumar, Address: 45 MG Road Bangalore 560001. Product: Laptop Model X200, Quantity: 2, Unit Price: 45000, Total: 90000. Payment method: NEFT, Bank Reference: TXN8842567.',
    relatedExams: [
      { label: 'SSC CGL DEST Test', href: '/exam/ssc-cgl' },
      { label: 'Court Typing Test', href: '/exam/court-typing' },
    ],
  },
  'government-employees': {
    title: 'Typing Test for Government Employees',
    metaDesc: 'Practice typing test for government jobs in India. SSC, CPCT, Court, Railway exams require 30-40 WPM. Start your free mock test now.',
    intro: 'Most central and state government positions in India require a qualifying typing test. English typing requires 35 WPM for most SSC posts, while Hindi typing requires 25–30 WPM. Accuracy is equally important.',
    targetWpm: 35,
    practiceText: 'The Ministry of Finance has issued a circular regarding the revised pay structure for central government employees. All departments are required to submit compliance reports by the end of the current financial quarter. The circular is available on the official government portal for reference.',
    relatedExams: [
      { label: 'SSC CHSL Test', href: '/exam/ssc-chsl' },
      { label: 'SSC CGL DEST', href: '/exam/ssc-cgl' },
      { label: 'Hindi Typing', href: '/exam/hindi-typing' },
      { label: 'Court Typing', href: '/exam/court-typing' },
    ],
  },
  professionals: {
    title: 'Typing Test for Working Professionals',
    metaDesc: 'Typing speed test for professionals. Faster typing means more productivity. Test your WPM and get AI coaching to improve.',
    intro: 'The average professional spends 2+ hours per day typing emails, reports, and documents. Improving from 35 WPM to 70 WPM can save you over an hour of work time every single day.',
    targetWpm: 60,
    practiceText: 'Dear team, please find attached the quarterly performance report for Q1 2026. The revenue increased by 18% compared to the same period last year. Marketing spend was optimised resulting in a 12% reduction in cost per acquisition. Please review the attached slides before Thursday\'s board meeting.',
    relatedExams: [],
  },
  beginners: {
    title: 'Typing Test for Beginners',
    metaDesc: 'Start your typing journey with our beginner-friendly typing test. Learn touch typing from scratch, build finger memory, and improve your WPM.',
    intro: 'If you are a complete beginner, you are in the right place. The most important things to learn first are: proper finger placement on the home row (ASDF JKL;), not looking at the keyboard, and building accuracy before speed.',
    targetWpm: 25,
    practiceText: 'the quick brown fox jumps over the lazy dog. a fast fox ran by the old barn. the sun set over the quiet hills. she sells sea shells by the sea shore. all good things come to those who wait.',
    relatedExams: [
      { label: 'Learn Touch Typing', href: '/learn' },
    ],
  },
  programmers: {
    title: 'Typing Test for Programmers & Developers',
    metaDesc: 'Coding-focused typing test for software developers. Practice typing code snippets, special characters, and improve your programming speed.',
    intro: 'Developers type more special characters than average users — brackets, semicolons, underscores, and operators. A faster typing speed directly translates to faster coding speed and more productive programming sessions.',
    targetWpm: 70,
    practiceText: 'const fetchUser = async (userId: string): Promise<User> => { const response = await fetch(`/api/users/${userId}`); if (!response.ok) { throw new Error("User not found"); } return response.json(); };',
    relatedExams: [],
  },
};

const DEFAULT = PROFESSION_DATA['students'];

export default function TypingTestForPage() {
  const { profession = 'students' } = useParams<{ profession: string }>();
  const data = PROFESSION_DATA[profession] || DEFAULT;

  useEffect(() => {
    document.title = `${data.title} | FastTypingLab`;
  }, [profession, data.title]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
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
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text mb-3">{data.title}</h1>
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

        {/* Related exams */}
        {data.relatedExams.length > 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-secondary" />
              Recommended Exam Practice
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

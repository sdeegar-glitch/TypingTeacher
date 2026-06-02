import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Languages, Keyboard } from 'lucide-react';

const KRUTI_MAP = [
  { english: 'K', kruti: 'd', devanagari: 'क' },
  { english: '[', kruti: 'k', devanagari: 'ख' },
  { english: 'x', kruti: 'x', devanagari: 'ग' },
  { english: 'D', kruti: '?', devanagari: 'घ' },
  { english: 'F', kruti: 'p', devanagari: 'च' },
  { english: 'Q', kruti: 'N', devanagari: 'छ' },
  { english: 't', kruti: 't', devanagari: 'ज' },
  { english: 'V', kruti: '>', devanagari: 'झ' },
  { english: 'T', kruti: 'V', devanagari: 'ट' },
  { english: 'y', kruti: 'b', devanagari: 'ड' },
  { english: 'R', kruti: '=', devanagari: 'ण' },
  { english: 'r', kruti: 'r', devanagari: 'त' },
  { english: 'n', kruti: 'U', devanagari: 'थ' },
  { english: 'n', kruti: 'n', devanagari: 'द' },
  { english: 'N', kruti: '/k', devanagari: 'ध' },
  { english: 'o', kruti: 'u', devanagari: 'न' },
  { english: 'P', kruti: 'i', devanagari: 'प' },
  { english: 'I', kruti: 'Q', devanagari: 'फ' },
  { english: 'c', kruti: 'c', devanagari: 'ब' },
  { english: 'O', kruti: 'H', devanagari: 'भ' },
  { english: 'e', kruti: 'e', devanagari: 'म' },
  { english: 'Z', kruti: 'Z', devanagari: 'य' },
  { english: 'j', kruti: 'j', devanagari: 'र' },
  { english: 'y', kruti: 'y', devanagari: 'ल' },
  { english: 'o', kruti: 'o', devanagari: 'व' },
  { english: 'k', kruti: 'k', devanagari: 'श' },
  { english: 'k"', kruti: 'k"', devanagari: 'ष' },
  { english: 'l', kruti: 'l', devanagari: 'स' },
  { english: 'g', kruti: 'g', devanagari: 'ह' },
];

const STEPS = [
  {
    title: 'What is Kruti Dev?',
    content: 'Kruti Dev is a legacy Hindi font encoding system widely used in government offices, courts, and newspapers. It uses a non-Unicode encoding where English keyboard keys map to Hindi characters through a special font. Most SSC, UP Police, Railway, and court typing exams accept Kruti Dev.',
    icon: '📖',
  },
  {
    title: 'How Kruti Dev Works',
    content: 'When you type on a QWERTY keyboard with Kruti Dev font active, each key produces a different Hindi character. For example, pressing "d" shows "क", pressing "f" shows "ि" (i matra). The mapping is fixed and must be memorized.',
    icon: '⌨️',
  },
  {
    title: 'Setting Up Kruti Dev',
    content: 'Download Kruti Dev 010 font from the internet and install it on Windows. Then select Kruti Dev 010 as your font in the word processor. Type normally — the characters will appear as Hindi. Most exam centers pre-install this font.',
    icon: '⚙️',
  },
  {
    title: 'Key Differences from INSCRIPT',
    content: 'INSCRIPT is the official Unicode layout built into Windows. Kruti Dev is a legacy font-based system. Most older government exams use Kruti Dev. Newer central government exams (like SSC CHSL post-2019) prefer Unicode/INSCRIPT. Always check your specific exam notification.',
    icon: '🔀',
  },
];

const EXAMS = [
  { name: 'UP Police Computer Operator', wpm: 25, layout: 'Kruti Dev' },
  { name: 'MP Patwari / CPCT', wpm: 30, layout: 'Unicode/INSCRIPT' },
  { name: 'Rajasthan Patwari', wpm: 25, layout: 'Kruti Dev/INSCRIPT' },
  { name: 'Bihar SSC (BSSC)', wpm: 30, layout: 'Kruti Dev' },
  { name: 'High Court Steno/Clerk', wpm: 30, layout: 'Kruti Dev' },
  { name: 'Railway NTPC Clerk', wpm: 25, layout: 'Unicode' },
];

export default function KrutiDevPage() {
  useEffect(() => {
    document.title = 'Kruti Dev Typing Test & Guide | FastTypingLab';
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/tests" className="hover:text-brand-primary transition-colors">Tests</Link>
          <span>/</span>
          <span className="text-brand-text">Kruti Dev Typing</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">क</div>
            <div>
              <h1 className="text-3xl font-black text-brand-text">Kruti Dev Typing Guide</h1>
              <p className="text-brand-text-muted text-sm mt-0.5">Complete guide + practice for Kruti Dev Hindi typing exams</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Govt Exams Use It', value: '40+', color: 'text-orange-500' },
              { label: 'Target WPM', value: '25-35', color: 'text-brand-primary' },
              { label: 'Keys to Learn', value: '50+', color: 'text-brand-accent' },
            ].map(s => (
              <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
                <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-brand-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Guide steps */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {STEPS.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <div className="text-3xl mb-3">{step.icon}</div>
              <h2 className="font-bold text-brand-text mb-2">{step.title}</h2>
              <p className="text-brand-text-muted text-sm leading-relaxed">{step.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Key mapping table */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl mb-8 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-brand-primary" />
            <h2 className="font-bold text-brand-text">Kruti Dev 010 Key Mapping (Common Keys)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface-2">
                <tr>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Devanagari</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Kruti Dev Key</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Devanagari</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Kruti Dev Key</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(KRUTI_MAP.length / 2) }, (_, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-surface-2'}>
                    <td className="px-4 py-2.5 font-bold text-brand-text text-lg" style={{ fontFamily: 'serif' }}>{KRUTI_MAP[i * 2]?.devanagari}</td>
                    <td className="px-4 py-2.5 font-mono text-brand-primary">{KRUTI_MAP[i * 2]?.kruti}</td>
                    <td className="px-4 py-2.5 font-bold text-brand-text text-lg" style={{ fontFamily: 'serif' }}>{KRUTI_MAP[i * 2 + 1]?.devanagari}</td>
                    <td className="px-4 py-2.5 font-mono text-brand-primary">{KRUTI_MAP[i * 2 + 1]?.kruti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exams table */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl mb-8 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-secondary" />
            <h2 className="font-bold text-brand-text">Exams Using Kruti Dev / Hindi Typing</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface-2">
                <tr>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Exam</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">WPM Required</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Layout</th>
                </tr>
              </thead>
              <tbody>
                {EXAMS.map((exam, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-surface-2'}>
                    <td className="px-4 py-3 font-semibold text-brand-text">{exam.name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-primary">{exam.wpm}+ WPM</td>
                    <td className="px-4 py-3 text-brand-text-muted">{exam.layout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-brand-text text-lg mb-1">Ready to Practice?</h2>
            <p className="text-brand-text-muted text-sm">Use our Hindi Typing Test to practice Unicode Hindi — the modern standard for most exams.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/hindi-typing-test"
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-primary/20">
              <Languages className="w-4 h-4" /> Hindi Typing Test
            </Link>
            <Link to="/exam/hindi-typing"
              className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-border transition-all">
              Exam Mode <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* SEO text */}
        <div className="mt-8 bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">Kruti Dev Typing — FAQ</h2>
          <p><strong className="text-brand-text">What is Kruti Dev?</strong> Kruti Dev is a popular Hindi font encoding used in government offices across India. It is not Unicode — it maps QWERTY keys to Hindi characters through a special font.</p>
          <p><strong className="text-brand-text">Which exams require Kruti Dev typing?</strong> UP Police, Bihar SSC, Rajasthan Patwari, court clerk exams, and various state PSC exams commonly require Kruti Dev. Always check your exam notification for the specific requirement.</p>
          <p><strong className="text-brand-text">Kruti Dev vs INSCRIPT?</strong> INSCRIPT is the standard Unicode layout supported by all modern operating systems. Newer central government exams prefer INSCRIPT/Unicode. Kruti Dev is still required for many state exams.</p>
        </div>
      </div>
    </div>
  );
}

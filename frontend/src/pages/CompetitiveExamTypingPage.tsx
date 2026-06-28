import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Trophy, Clock, Target, BookOpen, Zap, Shield } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Seo from '../components/Seo';

const EXAMS = [
  {
    name: 'SSC CHSL',
    full: 'Staff Selection Commission — Combined Higher Secondary Level',
    wpm: 35, accuracy: 80, duration: '10 min', language: 'English',
    href: '/exam/ssc-chsl',
    color: 'text-brand-primary', bg: 'bg-brand-primary/10', border: 'border-brand-primary/20',
  },
  {
    name: 'SSC CGL',
    full: 'Staff Selection Commission — Combined Graduate Level',
    wpm: 35, accuracy: 80, duration: '15 min', language: 'English',
    href: '/exam/ssc-cgl',
    color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20',
  },
  {
    name: 'UP Police Typing',
    full: 'UP Police Computer Operator / Clerk Typing Test',
    wpm: 25, accuracy: 80, duration: '5 min', language: 'Hindi (Kruti Dev)',
    href: '/exam/hindi-typing',
    color: 'text-brand-cta', bg: 'bg-brand-cta/10', border: 'border-brand-cta/20',
  },
  {
    name: 'CPCT Hindi',
    full: 'Computer Proficiency Certification Test — Hindi Typing',
    wpm: 30, accuracy: 85, duration: '15 min', language: 'Hindi (Unicode)',
    href: '/exam/hindi-typing',
    color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20',
  },
  {
    name: 'Court Clerk',
    full: 'District / High Court Clerk & Steno Typing Test',
    wpm: 30, accuracy: 80, duration: '10 min', language: 'Hindi / English',
    href: '/exam/hindi-typing',
    color: 'text-brand-secondary', bg: 'bg-brand-secondary/10', border: 'border-brand-secondary/20',
  },
  {
    name: 'Railway NTPC',
    full: 'RRB NTPC — Skill Test (Typing)',
    wpm: 30, accuracy: 80, duration: '15 min', language: 'English',
    href: '/exam/ssc-chsl',
    color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20',
  },
];

const TIPS = [
  { icon: Target, title: 'Accuracy First', desc: 'Most exams penalise errors. Aim for 90%+ accuracy before pushing for speed.' },
  { icon: Clock, title: 'Timed Practice Daily', desc: 'Practice in exact exam duration daily. Your brain adapts to time pressure.' },
  { icon: Zap, title: '30 Min Per Day', desc: 'Consistent 30-minute daily sessions beat 3-hour weekend cramming sessions.' },
  { icon: Shield, title: 'Avoid Backspace Habit', desc: 'Backspace slows you down significantly. Learn to accept minor errors and move on.' },
  { icon: BookOpen, title: 'Use Exam Passages', desc: 'Practice on government exam-style passages — formal Hindi/English vocabulary is different.' },
  { icon: Trophy, title: 'Track Your WPM Daily', desc: 'Record your WPM every session. Progress tracking is the best motivator.' },
];

const FAQS = [
  { q: 'What WPM is needed for SSC CHSL typing test?', a: 'SSC CHSL requires a minimum of 35 WPM in English (10 minutes) or 30 WPM in Hindi (15 minutes). Aim for 40+ WPM to have a comfortable buffer.' },
  { q: 'Is Kruti Dev or Unicode Hindi required for government exams?', a: 'It depends on the exam. CPCT and most central government exams now require Unicode/INSCRIPT. State exams like UP Police and Bihar SSC still use Kruti Dev. Always check your specific exam notification.' },
  { q: 'How many months does it take to prepare for typing tests?', a: 'With 30 minutes of daily practice, most beginners can reach exam-level speed in 2–3 months. Existing typists may reach target speed in 3–4 weeks.' },
  { q: 'Are backspaces counted as errors in SSC typing tests?', a: 'In SSC exams, backspace is allowed but every corrected word still adds to your error count. The net WPM formula penalises excessive errors. Practice minimising backspace use.' },
  { q: 'Can I practice on mobile for government typing exams?', a: 'No — government typing tests are always conducted on desktop computers. Practice only on a physical keyboard for accurate preparation.' },
];

export default function CompetitiveExamTypingPage() {
  useEffect(() => {
    document.title = 'Competitive Exam Typing Practice — SSC, CPCT, UP Police | FastTypingLab';
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">
        <Seo
          title="Competitive Exam Typing Practice — SSC, CPCT, UP Police | FastTypingLab"
          description="Free typing practice for SSC CHSL, SSC CGL, CPCT, UP Police, court clerk and railway exams. Real exam duration, WPM and accuracy — in English and Hindi."
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map(f => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }}
        />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-text">Competitive Exam Typing</span>
        </div>

        {/* Hero */}
        <PageHeader
          icon={Trophy}
          title="Competitive Exam Typing Practice"
          subtitle="SSC, CPCT, UP Police, Court Clerk, Railway — all exams covered"
        >
          <div className="grid grid-cols-3 gap-3 mt-6 max-w-xl mx-auto">
            {[
              { label: 'Exams Covered', value: '10+', color: 'text-brand-primary' },
              { label: 'Min WPM Required', value: '25–35', color: 'text-brand-accent' },
              { label: 'Practice Tests', value: 'Free', color: 'text-amber-500' },
            ].map(s => (
              <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
                <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-brand-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </PageHeader>

        {/* Exam list */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-brand-text mb-4">Practice by Exam</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {EXAMS.map((exam, i) => (
              <motion.div key={exam.name}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to={exam.href}
                  className={`group block bg-brand-surface border ${exam.border} hover:border-brand-primary/40 rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${exam.bg} ${exam.color}`}>{exam.name}</div>
                    <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-brand-muted mb-3 leading-relaxed">{exam.full}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-brand-surface-2 rounded-lg p-2">
                      <div className={`font-black text-sm ${exam.color}`}>{exam.wpm}+</div>
                      <div className="text-[10px] text-brand-muted">WPM</div>
                    </div>
                    <div className="bg-brand-surface-2 rounded-lg p-2">
                      <div className="font-black text-sm text-brand-text">{exam.accuracy}%</div>
                      <div className="text-[10px] text-brand-muted">Accuracy</div>
                    </div>
                    <div className="bg-brand-surface-2 rounded-lg p-2">
                      <div className="font-black text-sm text-brand-text">{exam.duration}</div>
                      <div className="text-[10px] text-brand-muted">Duration</div>
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-brand-muted">Language: <span className="text-brand-text font-semibold">{exam.language}</span></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* In-depth exam guides */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-brand-text mb-4">In-Depth Exam Typing Guides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'SSC CHSL Typing Test', href: '/ssc-chsl-typing-test' },
              { label: 'SSC CGL DEST', href: '/ssc-cgl-typing-test' },
              { label: 'CPCT Typing Test', href: '/cpct-typing-test' },
              { label: 'UP Police Typing', href: '/up-police-typing-test' },
              { label: 'Railway NTPC Typing', href: '/railway-ntpc-typing-test' },
              { label: 'Court & Steno Typing', href: '/court-typing-test' },
            ].map(g => (
              <Link key={g.href} to={g.href}
                className="group flex items-center justify-between gap-2 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand-text hover:border-brand-primary/40 transition-all">
                {g.label}
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-brand-text mb-4">Expert Preparation Tips</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 bg-brand-surface border border-brand-border rounded-2xl p-4">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
                  <tip.icon className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-text mb-1 text-sm">{tip.title}</h3>
                  <p className="text-brand-text-muted text-sm">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          {[
            { label: 'English Typing Test', desc: '1/2/5/10 min tests', href: '/tests', color: 'bg-brand-primary' },
            { label: 'Hindi Typing Test', desc: 'Unicode Devanagari', href: '/hindi-typing-test', color: 'bg-orange-500' },
            { label: 'Learn Hindi Typing', desc: 'Step-by-step course', href: '/learn-hindi-typing', color: 'bg-emerald-600' },
          ].map(cta => (
            <Link key={cta.label} to={cta.href}
              className={`${cta.color} text-white rounded-2xl p-4 flex items-center justify-between group hover:opacity-90 transition-all`}>
              <div>
                <div className="font-bold text-sm">{cta.label}</div>
                <div className="text-white/70 text-xs">{cta.desc}</div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-xl font-black text-brand-text mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                <h3 className="font-bold text-brand-text mb-2">{faq.q}</h3>
                <p className="text-brand-text-muted text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEO text */}
        <div className="text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">Government Typing Exam Preparation</h2>
          <p>FastTypingLab provides free typing tests specifically designed for SSC CHSL, SSC CGL, UP Police, CPCT, court clerk, and railway typing exam preparation. Practice in exact exam conditions — same duration, same format, real WPM and accuracy calculations.</p>
          <p>सरकारी टाइपिंग परीक्षाओं की तैयारी — SSC CHSL, UP Police, CPCT, और न्यायालय परीक्षाओं के लिए फ्री टाइपिंग अभ्यास करें।</p>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Languages, Trophy, Target, Zap, Building2, Scale, Shield, GraduationCap, Star, Award, Flame } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function LearnHindiTypingPage() {
  useEffect(() => {
    document.title = 'Learn Hindi Typing Online Free — INSCRIPT & Kruti Dev | FastTypingLab';
  }, []);

  const BENEFITS = [
    { title: 'SSC Exam Prep', desc: 'Practice the exact passage style used in SSC CHSL, CGL, and Steno Hindi typing tests.', icon: Building2, color: '#2A9DAE' },
    { title: 'UP Police', desc: 'Build the speed and accuracy required for UP Police Computer Operator and Clerk exams.', icon: Shield, color: '#BC6C50' },
    { title: 'Court Typing', desc: 'Master legal-format Hindi — petitions, affidavits, and court clerk exam passages.', icon: Scale, color: '#9B4F6B' },
    { title: 'Government Exams', desc: 'CPCT, Bihar SSC, Railway and state PSC exams — all covered with real exam-pattern drills.', icon: GraduationCap, color: '#5FB89C' },
  ];

  const FEATURES = [
    { title: '200 Progressive Lessons', desc: '12 stages — home row to full exam-pattern passages, each unlocking the next.', icon: '📚' },
    { title: 'XP, Levels & Badges', desc: 'Earn XP and badges as you complete stages. Climb from Beginner to Master.', icon: '🏆' },
    { title: 'Daily Streaks', desc: 'Track consecutive practice days to build a real typing habit.', icon: '🔥' },
    { title: 'Live WPM & Accuracy', desc: 'Real-time speed and accuracy tracking on every single lesson.', icon: '⚡' },
    { title: 'On-Screen Keyboard', desc: 'A visual INSCRIPT keyboard reference so you always know which key to press.', icon: '⌨️' },
    { title: '100% Free, No Signup', desc: 'Everything is saved in your browser — no account needed to start practicing.', icon: '🆓' },
  ];

  const EXAMS = [
    { name: 'SSC CHSL / CGL', wpm: '35 WPM', layout: 'Unicode' },
    { name: 'UP Police Computer Operator', wpm: '25 WPM', layout: 'Kruti Dev / Unicode' },
    { name: 'MP CPCT', wpm: '30 WPM', layout: 'Unicode' },
    { name: 'Bihar SSC (BSSC)', wpm: '30 WPM', layout: 'Kruti Dev' },
    { name: 'High Court Clerk / Steno', wpm: '30 WPM', layout: 'Kruti Dev' },
    { name: 'Railway NTPC Clerk', wpm: '25 WPM', layout: 'Unicode' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center gap-2 text-xs text-brand-muted mb-8">
          <Link to="/" className="hover:text-brand-primary">Home</Link><span>/</span>
          <span className="text-brand-text">Learn Hindi Typing</span>
        </div>

        {/* ── Hero ── */}
        <PageHeader
          icon={Languages}
          gradient="linear-gradient(135deg,#304C53,#2A9DAE)"
          title="Learn Hindi Typing Online Free"
          subtitle="200 gamified lessons designed for SSC, UP Police, court, and government exam preparation. Pick your keyboard layout and start from home row to full exam-pattern passages."
        >
          {/* Two big buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/learn-hindi-typing/unicode"
              className="group flex items-center gap-3 w-full sm:w-auto justify-center px-8 py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-95 shadow-xl"
              style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 8px 24px rgba(42,157,174,0.3)' }}>
              <Languages className="w-5 h-5" />
              Learn Unicode (Mangal)
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/learn-hindi-typing/kruti-dev"
              className="group flex items-center gap-3 w-full sm:w-auto justify-center px-8 py-4 rounded-2xl font-bold text-white text-base transition-all hover:opacity-90 active:scale-95 shadow-xl"
              style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 8px 24px rgba(188,108,80,0.3)' }}>
              <Languages className="w-5 h-5" />
              Learn Kruti Dev
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              { label: 'Lessons', value: '200', icon: Trophy, color: 'text-brand-cta' },
              { label: 'Stages', value: '12', icon: Target, color: 'text-brand-accent' },
              { label: 'Target WPM', value: '35+', icon: Zap, color: 'text-amber-500' },
              { label: 'Cost', value: 'Free', icon: Star, color: 'text-emerald-500' },
            ].map(s => (
              <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
                <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                <div className={`font-black text-lg ${s.color}`}>{s.value}</div>
                <div className="text-xs text-brand-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </PageHeader>

        {/* ── Benefits grid ── */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-brand-text mb-4 text-center">Built for Real Exams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-brand-surface border border-brand-border rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${b.color}1a` }}>
                  <b.icon className="w-5 h-5" style={{ color: b.color }} />
                </div>
                <h3 className="font-bold text-brand-text text-sm mb-1">{b.title}</h3>
                <p className="text-brand-text-muted text-xs leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-brand-text mb-4 text-center">Why This Course Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-brand-text text-sm mb-1">{f.title}</h3>
                <p className="text-brand-text-muted text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Gamification strip ── */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {[
            { icon: Zap, label: 'Earn XP every lesson', color: 'text-amber-500' },
            { icon: Award, label: '13 unlockable badges', color: 'text-brand-cta' },
            { icon: Flame, label: 'Build a daily streak', color: 'text-orange-500' },
            { icon: Trophy, label: 'Beginner → Master levels', color: 'text-brand-accent' },
          ].map(g => (
            <div key={g.label} className="flex items-center gap-2 text-sm font-semibold text-brand-text-muted">
              <g.icon className={`w-4 h-4 ${g.color}`} />
              {g.label}
            </div>
          ))}
        </div>

        {/* ── Exam list ── */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl mb-12 overflow-hidden">
          <div className="px-5 py-4 border-b border-brand-border">
            <h2 className="font-bold text-brand-text">Exams This Course Prepares You For</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface-2">
                <tr>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Exam</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Min. Speed</th>
                  <th className="px-4 py-3 text-left text-brand-muted font-semibold text-xs uppercase">Layout</th>
                </tr>
              </thead>
              <tbody>
                {EXAMS.map((exam, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-brand-surface' : 'bg-brand-surface-2'}>
                    <td className="px-4 py-3 font-semibold text-brand-text">{exam.name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-primary">{exam.wpm}</td>
                    <td className="px-4 py-3 text-brand-text-muted">{exam.layout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="font-black text-brand-text text-lg mb-1">Start Lesson 1 Right Now</h2>
            <p className="text-brand-text-muted text-sm">No signup needed — your progress saves automatically in this browser.</p>
          </div>
          <Link to="/learn-hindi-typing/unicode"
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 shrink-0">
            <Languages className="w-4 h-4" /> Start Free Course
          </Link>
        </div>

        {/* SEO text */}
        <div className="text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">Learn Hindi Typing Online — Free</h2>
          <p>FastTypingLab provides a free, gamified Hindi typing course designed for SSC, CPCT, UP Police, court exam, and railway typing test preparation. Learn the INSCRIPT/Unicode layout (built into Windows) — the standard for most current government exams. Our course tracks your WPM, accuracy, XP, and streaks in real time, all saved locally in your browser.</p>
          <p>हिंदी टाइपिंग सीखें — SSC, CPCT, UP Police, न्यायालय और रेलवे टाइपिंग परीक्षाओं की तैयारी के लिए फ्री हिंदी टाइपिंग कोर्स। 200 पाठों के साथ होम रो से परीक्षा अभ्यास तक की पूरी यात्रा।</p>
        </div>
      </div>
    </div>
  );
}

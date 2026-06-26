import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, BookOpen, Trophy, ChevronRight, Target, Keyboard,
  TrendingUp, Star, ArrowRight, Languages, Gamepad2, Award, Shield,
} from 'lucide-react';

/* ─── Animated typing preview ──────────────────────────────────── */
function TypingPreview() {
  const text = 'The quick brown fox jumps over the lazy dog';
  const [typed, setTyped] = useState(0);
  const intv = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    intv.current = setInterval(() => {
      setTyped(p => {
        if (p >= text.length) { clearInterval(intv.current); setTimeout(() => setTyped(0), 1800); return p; }
        return p + 1;
      });
    }, 55);
    return () => clearInterval(intv.current);
  }, [typed === 0]);

  return (
    <p className="font-mono text-sm sm:text-base leading-relaxed select-none pointer-events-none tracking-wide">
      {text.split('').map((ch, i) => (
        <span key={i} className={
          i < typed       ? 'text-brand-accent' :
          i === typed     ? 'text-brand-text font-semibold border-b-2 border-brand-accent' :
                            'text-brand-muted'
        }>{ch}</span>
      ))}
    </p>
  );
}

/* ─── Count-up stat ─────────────────────────────────────────────── */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const step = to / 60;
      let v = 0;
      const t = setInterval(() => { v += step; if (v >= to) { setN(to); clearInterval(t); } else setN(Math.round(v)); }, 16);
    }, { threshold: 0.3 });
    if (el.current) obs.observe(el.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={el} className="tabular-nums">{n.toLocaleString()}{suffix}</span>;
}

/* ─── Data ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Zap, title: 'Real-time Speed Tests',
    desc: 'WPM, CPM, and accuracy tracked live. 15 seconds to 10 minutes — you choose.',
    iconClass: 'icon-teal', color: 'text-brand-primary',
    border: 'hover:border-brand-primary/30', link: '/tests',
  },
  {
    icon: BookOpen, title: 'Structured Lessons',
    desc: 'Build muscle memory from scratch with a guided curriculum for all skill levels.',
    iconClass: 'icon-terra', color: 'text-brand-cta',
    border: 'hover:border-brand-cta/30', link: '/learn',
  },
  {
    icon: Languages, title: 'Hindi Typing Tests',
    desc: 'Unicode & Kruti Dev. Full SSC, CPCT, UP Police, and court exam preparation.',
    iconClass: 'icon-aqua', color: 'text-brand-accent',
    border: 'hover:border-brand-accent/30', link: '/hindi-typing-test',
  },
  {
    icon: Trophy, title: 'Global Leaderboard',
    desc: 'Compete worldwide. Earn achievements, climb leagues, and track your rise.',
    iconClass: 'icon-sand', color: 'text-brand-sand',
    border: 'hover:border-brand-sand/30', link: '/leaderboard',
  },
  {
    icon: Shield, title: 'Exam Simulation',
    desc: 'SSC CHSL, CGL, Court typing — exact exam environment with real passages.',
    iconClass: 'icon-teal', color: 'text-brand-primary',
    border: 'hover:border-brand-primary/30', link: '/competitive-exam-typing',
  },
  {
    icon: Gamepad2, title: 'Typing Games',
    desc: 'Word Rain, Zombie Typing, Speed Racer — gamified practice that\'s actually fun.',
    iconClass: 'icon-terra', color: 'text-brand-cta',
    border: 'hover:border-brand-cta/30', link: '/games',
  },
];

const STATS = [
  { label: 'Tests Taken', value: 140000, suffix: '+', icon: '⚡' },
  { label: 'Active Users', value: 18000,  suffix: '+', icon: '👤' },
  { label: 'WPM Gain Avg', value: 30,     suffix: '%', icon: '📈' },
  { label: 'New Tests Daily', value: 3,   suffix: '+', icon: '✨' },
];

const STEPS = [
  { n: '01', icon: Keyboard,   title: 'Take a test',      desc: 'Pick any article or use random words. Timer starts with your first keystroke.' },
  { n: '02', icon: TrendingUp, title: 'See your stats',   desc: 'Instantly see WPM, accuracy, CPM, and error breakdown after every session.' },
  { n: '03', icon: Star,       title: 'Track progress',   desc: 'Scores saved automatically. Watch WPM climb and unlock achievements.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.',   role: 'SSC Aspirant',          rating: 5, text: 'Went from 30 to 55 WPM in 3 weeks. Structured lessons are exactly what I needed for government exam prep.' },
  { name: 'Rahul K.',   role: 'Software Developer',     rating: 5, text: 'AI-generated articles keep practice fresh. Love that there\'s new content every day — never gets boring.' },
  { name: 'Ananya M.',  role: 'Data Entry Specialist',  rating: 5, text: 'Finally achieved 95% accuracy on my exams! Finger placement guides made all the difference.' },
];

const QUICK_LINKS = [
  { label: 'Typing Speed Test', href: '/tests',                 tag: 'Popular' },
  { label: 'Hindi Typing Test', href: '/hindi-typing-test',     tag: 'Govt Exam' },
  { label: 'SSC CHSL Mock Test',href: '/exam/ssc-chsl',         tag: 'Exam' },
  { label: 'Learn Hindi Typing',href: '/learn-hindi-typing',    tag: 'Course' },
  { label: 'Kruti Dev Guide',   href: '/kruti-dev-typing',      tag: 'Guide' },
  { label: 'Word Rain Game',    href: '/games/word-rain',       tag: 'Game' },
];

/* ─── Floating blob bg ─────────────────────────────────────────── */
function HeroBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Primary teal blob */}
      <div className="animate-blob absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full opacity-[0.07] dark:opacity-[0.09]"
        style={{ background: 'radial-gradient(circle, #304C53 0%, transparent 70%)' }} />
      {/* Aqua blob */}
      <div className="animate-blob-r absolute top-10 right-[-100px] w-[450px] h-[450px] rounded-full opacity-[0.06] dark:opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #AFE0E7 0%, transparent 70%)' }} />
      {/* Terracotta blob — bottom */}
      <div className="animate-blob absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05] dark:opacity-[0.07]"
        style={{ background: 'radial-gradient(circle, #BC6C50 0%, transparent 70%)' }} />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] dot-grid" />
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function HomePage() {
  useEffect(() => {
    document.title = 'FastTypingLab — Free Typing Speed Test & AI Tutor';
  }, []);

  return (
    <div className="bg-brand-bg text-brand-text overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          HERO
         ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100dvh-64px)] flex items-center justify-center overflow-hidden px-4 sm:px-6">
        <HeroBlobs />

        <div className="container mx-auto max-w-5xl relative z-10 py-16 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }} className="text-center">

            {/* Live badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-8 text-sm font-medium shadow-sm"
              style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inset-0 rounded-full bg-brand-accent opacity-70" />
                <span className="relative rounded-full h-2 w-2 bg-brand-accent" />
              </span>
              <span className="text-brand-muted">3 new AI-generated tests added today</span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              <span className="text-brand-text block">Type Faster.</span>
              <span className="gradient-text block">Score Higher.</span>
              <span className="text-brand-text block text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 opacity-60">
                India's #1 Typing Platform
              </span>
            </h1>

            <p className="text-base sm:text-lg text-brand-text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Free typing speed tests, Hindi Unicode & Kruti Dev practice, SSC exam simulation, AI coaching,
              and typing games — everything you need in one place.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link to="/tests"
                className="inline-flex items-center gap-2.5 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 w-full sm:w-auto justify-center group shadow-xl active:scale-95"
                style={{ background: 'linear-gradient(135deg, #304C53 0%, #2A9DAE 100%)', boxShadow: '0 6px 24px rgba(48,76,83,0.30)' }}>
                <Zap className="w-5 h-5" />
                Test Your Speed
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/hindi-typing-test"
                className="inline-flex items-center gap-2.5 font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 w-full sm:w-auto justify-center group shadow-lg active:scale-95"
                style={{ background: 'linear-gradient(135deg, #BC6C50 0%, #CC7B5D 100%)', color: '#fff', boxShadow: '0 6px 24px rgba(188,108,80,0.30)' }}>
                <Languages className="w-5 h-5" />
                Hindi Typing
              </Link>
              <Link to="/learn"
                className="inline-flex items-center gap-2.5 text-brand-text font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 w-full sm:w-auto justify-center hover:bg-brand-surface-2 active:scale-95"
                style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }}>
                <BookOpen className="w-5 h-5 text-brand-muted" />
                Start Learning
              </Link>
            </div>

            {/* Live typing preview card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="max-w-2xl mx-auto rounded-2xl p-5 sm:p-7 text-left relative overflow-hidden shadow-2xl glass-card">

              {/* Top line gradient */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(42,157,174,0.5), transparent)' }} />

              {/* Window dots */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#AFE0E7' }} />
                </div>
                <span className="text-xs text-brand-muted font-mono bg-brand-surface-2 px-2.5 py-1 rounded-lg border border-brand-border">
                  live preview
                </span>
              </div>

              <TypingPreview />

              {/* Mini stats */}
              <div className="flex items-center gap-6 mt-5 pt-4 border-t border-brand-border">
                {[
                  { label: 'WPM', value: '72', color: 'text-brand-primary' },
                  { label: 'Accuracy', value: '98%', color: 'text-brand-accent' },
                  { label: 'CPM', value: '360', color: 'text-brand-cta' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-xs text-brand-muted mb-0.5">{s.label}</div>
                    <div className={`font-black font-mono text-lg ${s.color}`}>{s.value}</div>
                  </div>
                ))}
                <div className="ml-auto">
                  <Link to="/tests"
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:opacity-80 transition-opacity">
                    Try it <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS STRIP
         ══════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6 border-y border-brand-border"
        style={{ background: 'var(--brand-surface)' }}>
        <div className="container mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-1">
              <span className="text-2xl mb-1">{s.icon}</span>
              <div className="font-black text-2xl sm:text-3xl font-mono text-brand-text">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs font-medium text-brand-muted uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES GRID
         ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 mesh-bg">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-text mb-4 leading-tight">
              One platform.<br/>
              <span className="gradient-text">Your entire typing journey.</span>
            </h2>
            <p className="text-brand-text-muted max-w-xl mx-auto">
              From beginner lessons to exam preparation — structured learning, real tests, and AI coaching.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={f.link}
                  className={`group flex flex-col gap-4 p-6 rounded-2xl border border-brand-border ${f.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full`}
                  style={{ background: 'var(--brand-surface)' }}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.iconClass} group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-base font-bold text-brand-text mb-1.5">{f.title}</h3>
                    <p className="text-brand-text-muted text-sm leading-relaxed">{f.desc}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${f.color} opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0`}>
                    Get started <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
         ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 border-y border-brand-border" style={{ background: 'var(--brand-surface)' }}>
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-cta mb-3">Simple process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-text">How it works</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div className="hidden sm:block absolute top-7 left-[calc(33%+1.5rem)] right-[calc(33%+1.5rem)] h-px"
              style={{ background: 'linear-gradient(90deg, var(--brand-border), var(--brand-accent), var(--brand-border))' }} />

            {STEPS.map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, var(--brand-surface-2), var(--brand-surface))', border: '1px solid var(--brand-border)' }}>
                    <step.icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                    style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-brand-text">{step.title}</h3>
                <p className="text-brand-text-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          QUICK LINKS (SEO)
         ══════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl font-black text-brand-text mb-2">Popular Pages</h2>
            <p className="text-brand-text-muted text-sm">Jump directly to what you need</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map((l, i) => (
              <motion.div key={l.href} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Link to={l.href}
                  className="group flex items-center justify-between p-4 rounded-xl border border-brand-border hover:border-brand-primary/30 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: 'var(--brand-surface)' }}>
                  <div>
                    <div className="text-xs font-bold text-brand-accent mb-1">{l.tag}</div>
                    <div className="text-sm font-semibold text-brand-text">{l.label}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TESTIMONIALS
         ══════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 border-t border-brand-border mesh-bg">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-3">Social proof</p>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-text">
              Loved by typists <span className="gradient-text-cta">across India</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 glass-card flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-brand-text-muted text-sm leading-relaxed flex-grow">"{t.text}"</p>
                <div className="pt-3 border-t border-brand-border">
                  <div className="font-bold text-brand-text text-sm">{t.name}</div>
                  <div className="text-brand-muted text-xs mt-0.5">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA BANNER
         ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-3xl rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #304C53 0%, #2A6A78 50%, #1E4F5C 100%)' }}>

          {/* Decorative blobs inside banner */}
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #AFE0E7, transparent)' }} />
          <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #BC6C50, transparent)' }} />
          <div className="absolute inset-0 dot-grid opacity-[0.06]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
              <Award className="w-3.5 h-3.5" /> 100% Free Forever
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
              Start typing smarter today
            </h2>
            <p className="text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of students and professionals who improved their typing speed.
              No signup required to take your first test.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/tests"
                className="inline-flex items-center gap-2.5 bg-white font-bold px-8 py-4 rounded-2xl text-base transition-all w-full sm:w-auto justify-center hover:bg-white/90 active:scale-95 shadow-xl"
                style={{ color: '#304C53' }}>
                <Zap className="w-5 h-5" /> Take a Free Test
              </Link>
              <Link to="/competitive-exam-typing"
                className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all w-full sm:w-auto justify-center active:scale-95">
                <Target className="w-5 h-5" /> Exam Prep
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
         ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-brand-border py-10 px-4 sm:px-6" style={{ background: 'var(--brand-surface)' }}>
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                  style={{ background: 'linear-gradient(135deg, #304C53, #2A9DAE)' }}>F</span>
                <span className="font-black text-brand-text text-lg">FastTypingLab</span>
              </div>
              <p className="text-xs text-brand-muted max-w-xs leading-relaxed">
                India's most complete free typing platform for students, professionals, and govt exam aspirants.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3 text-sm text-brand-muted">
              {[
                { label: 'Typing Tests',    href: '/tests' },
                { label: 'Hindi Typing',   href: '/hindi-typing-test' },
                { label: 'Learn Typing',   href: '/learn' },
                { label: 'Exam Prep',      href: '/competitive-exam-typing' },
                { label: 'Games',          href: '/games' },
                { label: 'Blog',           href: '/blog' },
                { label: 'Leaderboard',    href: '/leaderboard' },
                { label: 'Tools',          href: '/tools' },
                { label: 'Certificates',   href: '/typing-certificates' },
              ].map(l => (
                <Link key={l.href} to={l.href}
                  className="hover:text-brand-primary transition-colors duration-150">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-brand-border text-xs text-brand-muted">
            <p>© 2026 FastTypingLab. All rights reserved. Made with ❤️ for India.</p>
            <a href="mailto:support@fasttypinglab.com"
              className="hover:text-brand-primary transition-colors">support@fasttypinglab.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

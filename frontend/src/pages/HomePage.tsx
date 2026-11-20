import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, BookOpen, Trophy, ChevronRight, Target, Keyboard,
  TrendingUp, ArrowRight, Languages, Gamepad2, Shield,
  Download, CheckCircle2, FileText, Headphones, Award
} from 'lucide-react';
import LearnChooserModal from '../components/LearnChooserModal';
import Seo from '../components/Seo';

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
      const step = Math.max(1, to / 40);
      let v = 0;
      const t = setInterval(() => {
        v += step;
        if (v >= to) {
          setN(to);
          clearInterval(t);
        } else {
          setN(Math.round(v));
        }
      }, 20);
    }, { threshold: 0.3 });
    if (el.current) obs.observe(el.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={el} className="tabular-nums font-mono font-bold text-2xl sm:text-3xl text-brand-text">{n.toLocaleString()}{suffix}</span>;
}

/* ─── Ground-Truth Platform Facts (Verifiable Metrics) ─────────── */
const PLATFORM_FACTS = [
  { label: 'Hindi Layout Matrices', value: 14, suffix: ' Tested', note: 'INSCRIPT, Kruti Dev & Remington' },
  { label: 'Structured Lessons', value: 461, suffix: ' Total', note: '61 English + 400 Hindi modules' },
  { label: 'Offline Windows App', value: 100, suffix: '% Free', note: 'Native Tauri installer for PC' },
  { label: 'Test Screen Ads', value: 0, suffix: ' Zero Ads', note: 'Distraction-free exam timers' },
];

/* ─── Official Examination Benchmarks (Replaces Fake Reviews) ─── */
const EXAM_BENCHMARKS = [
  {
    exam: 'SSC CHSL Tier-II',
    post: 'LDC / JSA / DEO',
    lang: 'English / Hindi (Inscript or Kruti)',
    speed: '35 WPM / 30 WPM',
    time: '10 Minutes',
    rules: 'Full deduction for omitted/wrong words; 0.5 for punctuation/spacing. UR ceiling 7% errors.',
    link: '/ssc-chsl-typing-test/'
  },
  {
    exam: 'MP CPCT',
    post: 'State Certification',
    lang: 'Hindi (Remington Gail) & English',
    speed: '20 WPM (Hin) / 30 WPM (Eng)',
    time: '15 Min Each',
    rules: 'Separate scored language sections. Scaled certificate percentiles. No backspace restriction.',
    link: '/cpct-typing-test/'
  },
  {
    exam: 'UP Police Computer Operator',
    post: 'Assistant Sub-Inspector',
    lang: 'Hindi (Mangal INSCRIPT)',
    speed: '25 WPM (Hindi)',
    time: '15 Minutes',
    rules: 'Qualifying test. Must maintain 85% accuracy on official UPPRPB notifications.',
    link: '/up-police-typing-test/'
  },
  {
    exam: 'High Court Clerk / Steno',
    post: 'District & High Courts',
    lang: 'Hindi (Kruti Dev 010 / Mangal)',
    speed: '25-30 WPM (Hin) / 30-40 WPM (Eng)',
    time: '10-15 Minutes',
    rules: 'Exact line-break matching. Editing tools and backspace frequently restricted.',
    link: '/court-typing-test/'
  }
];

/* ─── 3-Stage Qualification Pathway ─────────────────────────────── */
const PATHWAYS = [
  {
    step: '01',
    title: 'Baseline Diagnostic Test',
    desc: 'Take an authentic 5-minute timed passage to calculate your gross WPM, error rate, and backspace penalty cost.',
    link: '/tests/'
  },
  {
    step: '02',
    title: 'Keystroke & Matra Drills',
    desc: 'Master home-row ergonomics, number-row punctuation, and Devanagari ligatures (क्ष, त्र, ज्ञ) through 461 progressive lessons.',
    link: '/learn/'
  },
  {
    step: '03',
    title: 'Timed Exam Simulation',
    desc: 'Practice under real exam conditions: official 10-minute countdowns, disabled editing, and instant net WPM scorecards.',
    link: '/competitive-exam-typing/'
  }
];

const QUICK_LINKS = [
  { label: 'Typing Speed Test', href: '/tests/',                 tag: 'Popular' },
  { label: 'Hindi Typing Test', href: '/hindi-typing-test/',     tag: 'Govt Exam' },
  { label: 'SSC CHSL Mock Test',href: '/exam/ssc-chsl/',         tag: 'Exam' },
  { label: 'Learn Hindi Typing',href: '/learn-hindi-typing/',    tag: 'Course' },
  { label: 'Kruti Dev Guide',   href: '/kruti-dev-typing/',      tag: 'Guide' },
  { label: 'AI Typing Tutor',   href: '/ai-tutor/',              tag: 'AI' },
  { label: 'Type Without Looking', href: '/blog/how-to-type-without-looking-touch-typing-guide/', tag: 'Guide' },
  { label: 'How to Type Faster',   href: '/blog/how-to-type-faster/',                             tag: 'Guide' },
  { label: 'What Does WPM Mean?',  href: '/blog/what-does-wpm-mean/',                             tag: 'Basics' },
  { label: 'Typing Test for Jobs', href: '/blog/typing-test-for-jobs/',                          tag: 'Careers' },
  { label: 'Typing Test for Nurses', href: '/blog/typing-test-for-nurses-healthcare/',           tag: 'Careers' },
  { label: 'Typing Games for Kids', href: '/blog/best-typing-games-for-kids/',                   tag: 'Kids' },
  { label: 'Typing for Programmers', href: '/blog/typing-practice-for-programmers-coders/',      tag: 'Coding' },
  { label: 'Professional Typing Test', href: '/typing-test-for/professionals/',                   tag: 'Pro' },
];

export default function HomePage() {
  const [learnOpen, setLearnOpen] = useState(false);

  useEffect(() => {
    document.title = 'FastTypingLab — Free Typing Speed Test & Exam Preparation';
  }, []);

  return (
    <div className="bg-brand-bg text-brand-text overflow-x-hidden">
      <LearnChooserModal open={learnOpen} onClose={() => setLearnOpen(false)} />
      <Seo
        title="FastTypingLab — Free Typing Speed Test, Hindi Typing & Exam Practice"
        description="Free online typing speed test (WPM) in English, Hindi Unicode & Kruti Dev. Practice for SSC, CPCT & UP Police exams, get AI coaching, and play typing games — no signup."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'FastTypingLab',
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web, Windows',
          url: 'https://fasttypinglab.com/',
          description: 'Free online typing speed test and practice in English and Hindi (Unicode & Kruti Dev), with government-exam modes (SSC, CPCT, UPSSSC), an AI tutor, stenography dictation and typing games.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          featureList: [
            'Typing speed test (WPM & accuracy)',
            'Hindi typing (Mangal / Kruti Dev)',
            'Government exam typing practice',
            'Stenography dictation trainer',
            'AI typing tutor',
            'Offline Windows desktop app',
          ],
        }}
      />

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION (Product-in-Action & Domain Authority)
         ══════════════════════════════════════════════════════════ */}
      <section className="border-b border-brand-border bg-brand-surface pt-10 pb-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Eyebrow Status Chip */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono border border-brand-border bg-brand-surface-2 text-brand-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Official Syllabus Matched · SSC, CPCT, UP Police & State Courts</span>
            </div>
          </div>

          {/* Master Headline */}
          <div className="text-center max-w-4xl mx-auto mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-brand-text leading-[1.14] mb-3">
              Precision typing speed tests & <span className="text-brand-cta">government exam preparation</span>.
            </h1>
            <p className="text-sm sm:text-base text-brand-text-muted max-w-2xl mx-auto leading-relaxed">
              Targeted practice for SSC CHSL, CGL, MP CPCT, UP Police, and High Court clerk recruitments.
              Supports native Hindi (Mangal INSCRIPT & Kruti Dev 010) and English with official deduction scoring.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              to="/tests/"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold px-6 py-3 rounded-md text-sm transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-brand-accent w-full sm:w-auto justify-center"
            >
              <Zap className="w-4 h-4" />
              Take 5-Minute Speed Test &rarr;
            </Link>
            <button
              type="button"
              onClick={() => setLearnOpen(true)}
              className="inline-flex items-center gap-2 bg-brand-surface hover:bg-brand-surface-2 border border-brand-border text-brand-text font-semibold px-6 py-3 rounded-md text-sm transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-brand-accent w-full sm:w-auto justify-center"
            >
              <BookOpen className="w-4 h-4 text-brand-primary" />
              Browse Lessons (English & Hindi)
            </button>
            <Link
              to="/download"
              className="inline-flex items-center gap-1.5 text-brand-muted hover:text-brand-text px-4 py-2.5 text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Offline Windows App
            </Link>
          </div>

          {/* Live Exam Sandbox Card (Authentic Interactive Preview) */}
          <div className="max-w-3xl mx-auto border border-brand-border rounded-lg bg-brand-surface p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-brand-text uppercase tracking-wide">
                  LIVE EXAM SANDBOX
                </span>
              </div>
              <span className="text-xs font-mono text-brand-muted">
                SSC CHSL · 10 MIN · 35 WPM BENCHMARK
              </span>
            </div>

            <TypingPreview />

            {/* Metrics Telemetry Strip */}
            <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-brand-border text-center font-mono">
              <div>
                <div className="text-[10px] text-brand-muted uppercase">Gross WPM</div>
                <div className="text-base font-bold text-brand-text">72</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-muted uppercase">Accuracy</div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">98%</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-muted uppercase">Errors</div>
                <div className="text-base font-bold text-brand-cta">1.0</div>
              </div>
              <div>
                <div className="text-[10px] text-brand-muted uppercase">Net WPM</div>
                <div className="text-base font-bold text-brand-primary">71</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PLATFORM FACTS STRIP (Ground Truth Over Fabricated Counts)
         ══════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4 sm:px-6 border-b border-brand-border bg-brand-surface-2">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {PLATFORM_FACTS.map((fact) => (
            <div key={fact.label} className="flex flex-col items-center">
              <CountUp to={fact.value} suffix={fact.suffix} />
              <div className="text-xs font-semibold text-brand-text mt-1">{fact.label}</div>
              <div className="text-[11px] font-mono text-brand-muted mt-0.5">{fact.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ASYMMETRIC CORE ARCHITECTURE (Flagship vs Complementary)
         ══════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 border-b border-brand-border bg-brand-surface">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-primary font-bold">
              Examination Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-text mt-1">
              Built for real scoring rubrics, not toy counters.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 8-Column Flagship Anchor */}
            <div className="lg:col-span-8 border border-brand-border rounded-lg p-6 sm:p-8 bg-brand-surface shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-brand-primary" />
                <span className="text-xs font-mono font-bold uppercase text-brand-muted">Scoring Integrity</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-text">
                Exact Word Alignment & Deduction Calculations
              </h3>
              <p className="text-sm text-brand-text-muted mt-2 leading-relaxed max-w-2xl">
                Most online typing tests calculate speed simply as <code>(characters / 5) / minutes</code>. 
                In official examinations (SSC, CPCT, High Court), missing a word can invalidate the rest of the sentence. 
                FastTypingLab runs a Damerau-Levenshtein alignment engine that distinguishes full mistakes from half mistakes, 
                accounting for spacing, punctuation, and transposed words.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-brand-border text-xs font-mono">
                <div className="border border-brand-border p-3 rounded bg-brand-surface-2">
                  <span className="text-brand-text font-bold block">Full Mistakes (-1)</span>
                  <span className="text-brand-muted">Omitted, extra, repeated, or substituted words.</span>
                </div>
                <div className="border border-brand-border p-3 rounded bg-brand-surface-2">
                  <span className="text-brand-text font-bold block">Half Mistakes (-0.5)</span>
                  <span className="text-brand-muted">Punctuation errors, spacing, capitalization.</span>
                </div>
                <div className="border border-brand-border p-3 rounded bg-brand-surface-2">
                  <span className="text-brand-text font-bold block">Official Error Caps</span>
                  <span className="text-brand-muted">UR 5-7%, Reserved categories 8-10% allowance.</span>
                </div>
              </div>
            </div>

            {/* 4-Column Secondary Stack */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-brand-border rounded-lg p-6 bg-brand-surface shadow-sm">
                <div className="flex items-center gap-2 text-brand-cta mb-2">
                  <Languages className="w-5 h-5" />
                  <span className="text-xs font-mono font-bold uppercase text-brand-muted">Bilingual Core</span>
                </div>
                <h4 className="font-serif font-bold text-brand-text text-base">Mangal & Kruti Dev Dual Engines</h4>
                <p className="text-xs text-brand-text-muted mt-1.5 leading-relaxed">
                  Practice native Devanagari INSCRIPT or legacy Kruti Dev 010. Includes built-in Unicode conversion and half-letter ligature QA.
                </p>
                <Link to="/learn-hindi-typing/" className="inline-block mt-3 text-xs font-bold text-brand-primary hover:underline">
                  Explore 200 Hindi Lessons &rarr;
                </Link>
              </div>

              <div className="border border-brand-border rounded-lg p-6 bg-brand-surface shadow-sm">
                <div className="flex items-center gap-2 text-brand-accent mb-2">
                  <Headphones className="w-5 h-5" />
                  <span className="text-xs font-mono font-bold uppercase text-brand-muted">Stenography</span>
                </div>
                <h4 className="font-serif font-bold text-brand-text text-base">Audio Dictation Transcription</h4>
                <p className="text-xs text-brand-text-muted mt-1.5 leading-relaxed">
                  SSC Steno Grade C & D preparation with real-time audio playback at 80 WPM and 100 WPM dictation speeds.
                </p>
                <Link to="/dictation-typing-test/" className="inline-block mt-3 text-xs font-bold text-brand-primary hover:underline">
                  Launch Audio Trainer &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          OFFICIAL EXAMINATION BENCHMARK MATRIX (Replaces Testimonials)
         ══════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 border-b border-brand-border bg-brand-surface-2">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-primary font-bold">
              Official Target Benchmarks
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-text mt-1">
              Recruitment standards by examination board
            </h2>
            <p className="text-sm text-brand-text-muted mt-1.5">
              Verified against current 2026 recruitment circulars and skill-test instructions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {EXAM_BENCHMARKS.map((item) => (
              <div key={item.exam} className="border border-brand-border rounded-lg p-5 bg-brand-surface shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="font-serif font-bold text-brand-text text-base">{item.exam}</h3>
                      <div className="text-xs font-mono text-brand-muted">{item.post}</div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-surface-2 border border-brand-border text-brand-primary">
                      {item.speed}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-brand-border mb-3 text-brand-muted">
                    <div><span className="text-brand-text font-medium">Layout:</span> {item.lang}</div>
                    <div><span className="text-brand-text font-medium">Time:</span> {item.time}</div>
                  </div>

                  <p className="text-xs text-brand-text-muted leading-relaxed">
                    {item.rules}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-border">
                  <Link to={item.link} className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 inline-flex items-center gap-1">
                    Practice Exam Passage &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3-STAGE QUALIFICATION PATHWAY
         ══════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 border-b border-brand-border bg-brand-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-cta font-bold">
              Curriculum Roadmap
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-text mt-1">
              How aspirants reach qualifying speed
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {PATHWAYS.map((p) => (
              <div key={p.step} className="border border-brand-border rounded-lg p-6 bg-brand-surface shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded border border-brand-border bg-brand-surface-2 flex items-center justify-center font-mono font-bold text-xs text-brand-primary mb-3">
                    {p.step}
                  </div>
                  <h3 className="font-serif font-bold text-brand-text text-base mb-2">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-brand-border">
                  <Link to={p.link} className="text-xs font-bold text-brand-primary hover:underline">
                    Get Started &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          POPULAR PAGES INDEX
         ══════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-6 bg-brand-surface-2 border-b border-brand-border">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-serif font-bold text-brand-text">Direct Exam & Test Directory</h2>
            <p className="text-xs text-brand-muted">Quick access to exam preparation tools and typing guides.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="p-3 rounded border border-brand-border bg-brand-surface hover:border-brand-text transition-colors flex flex-col justify-between"
              >
                <div className="text-[10px] font-mono text-brand-primary uppercase font-semibold">{l.tag}</div>
                <div className="text-xs font-bold text-brand-text mt-1">{l.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP APP & TIMED TEST CALL TO ACTION
         ══════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 bg-brand-surface">
        <div className="max-w-4xl mx-auto border border-brand-border rounded-lg p-8 sm:p-10 bg-brand-surface-2 text-center shadow-sm">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-primary uppercase bg-brand-primary/10 px-3 py-1 rounded mb-4">
            <Award className="w-4 h-4" />
            100% Free · No Registration Required for Testing
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-text mb-3">
            Begin your timed examination practice today.
          </h2>

          <p className="text-sm text-brand-text-muted max-w-xl mx-auto mb-6 leading-relaxed">
            Practice directly in your web browser or install the free native Windows desktop app for full offline practice without an active internet connection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/tests/"
              className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/90 text-white font-bold px-6 py-3 rounded-md text-sm transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-brand-accent"
            >
              Start Free Speed Test &rarr;
            </Link>
            <Link
              to="/download"
              className="w-full sm:w-auto bg-brand-surface hover:bg-brand-surface-2 border border-brand-border text-brand-text font-bold px-6 py-3 rounded-md text-sm transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Download Windows App (.exe)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

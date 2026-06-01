import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Keyboard, MousePointer, Space, ChevronRight, Zap, GraduationCap, Clock, Users, Type, CaseSensitive, Code } from 'lucide-react';

const TOOL_CARDS = [
  {
    icon: Keyboard,
    title: 'Keyboard Tester',
    desc: 'Test every key on your keyboard. Press keys to see if they register correctly.',
    href: '/keyboard-tester',
    tag: 'Popular',
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/10 border-brand-primary/20',
    tagColor: 'bg-brand-primary/10 text-brand-primary',
  },
  {
    icon: MousePointer,
    title: 'CPS Test',
    desc: 'Measure your mouse click speed in clicks per second. 10-second timed test.',
    href: '/cps-test',
    tag: 'Gaming',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10 border-rose-500/20',
    tagColor: 'bg-rose-500/10 text-rose-500',
  },
  {
    icon: Space,
    title: 'Spacebar Counter',
    desc: 'Test your spacebar pressing speed. How many times can you press it in 10 seconds?',
    href: '/spacebar-counter',
    tag: 'Fun',
    color: 'text-brand-accent',
    bg: 'bg-brand-accent/10 border-brand-accent/20',
    tagColor: 'bg-brand-accent/10 text-brand-accent',
  },
  {
    icon: Zap,
    title: 'Speed Test',
    desc: 'Full typing speed test with WPM, accuracy, CPM. Article, words, and quote modes.',
    href: '/tests',
    tag: 'Core',
    color: 'text-brand-secondary',
    bg: 'bg-brand-secondary/10 border-brand-secondary/20',
    tagColor: 'bg-brand-secondary/10 text-brand-secondary',
  },
  {
    icon: Type,
    title: 'Word Counter',
    desc: 'Count words, characters, sentences, paragraphs and estimate reading time instantly.',
    href: '/word-counter',
    tag: 'New',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10 border-teal-500/20',
    tagColor: 'bg-teal-500/10 text-teal-500',
  },
  {
    icon: Users,
    title: 'Multiplayer Race',
    desc: 'Race against friends and AI bots in real-time typing competitions.',
    href: '/race',
    tag: 'Live',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
    tagColor: 'bg-amber-500/10 text-amber-500',
  },
  {
    icon: CaseSensitive,
    title: 'Case Converter',
    desc: 'Convert text between UPPER, lower, Title, camelCase, snake_case, and 6 more formats.',
    href: '/case-converter',
    tag: 'New',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10 border-violet-500/20',
    tagColor: 'bg-violet-500/10 text-violet-500',
  },
  {
    icon: Code,
    title: 'Coding Typing',
    desc: 'Type real JS, Python, TypeScript, SQL and CSS code snippets. Track WPM while coding.',
    href: '/coding-typing',
    tag: 'Dev',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    tagColor: 'bg-emerald-500/10 text-emerald-500',
  },
];

const EXAM_CARDS = [
  {
    title: 'SSC CHSL Typing Test',
    desc: '35 WPM target · 10 minutes · English',
    href: '/exam/ssc-chsl',
    badge: 'SSC',
  },
  {
    title: 'SSC CGL DEST',
    desc: '40 WPM target · 15 minutes · English',
    href: '/exam/ssc-cgl',
    badge: 'SSC',
  },
  {
    title: 'Hindi Typing Test',
    desc: '30 WPM target · 10 minutes · Remington',
    href: '/exam/hindi-typing',
    badge: 'Hindi',
  },
  {
    title: 'Court Typing Test',
    desc: '40 WPM target · 10 minutes · Legal text',
    href: '/exam/court-typing',
    badge: 'Court',
  },
];

export default function ToolsPage() {
  useEffect(() => {
    document.title = 'Keyboard Tools & Exam Typing Practice | FastTypingLab';
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text mb-3">Typing Tools & Utilities</h1>
          <p className="text-brand-text-muted max-w-2xl">
            Free online tools for typing speed tests, keyboard diagnostics, and exam preparation. All tools work directly in your browser — no download required.
          </p>
        </motion.div>

        {/* Tools Section */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-brand-primary" />
            Keyboard & Click Tools
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TOOL_CARDS.map((tool, i) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={tool.href}
                  className="group flex items-start gap-4 p-5 bg-brand-surface border border-brand-border rounded-2xl hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${tool.bg} group-hover:scale-105 transition-transform`}>
                    <tool.icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-brand-text">{tool.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${tool.tagColor}`}>{tool.tag}</span>
                    </div>
                    <p className="text-brand-text-muted text-sm leading-relaxed">{tool.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Exam Prep Section */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-secondary" />
            Government Exam Typing Practice
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {EXAM_CARDS.map((exam, i) => (
              <motion.div
                key={exam.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Link
                  to={exam.href}
                  className="group flex items-center gap-4 p-5 bg-brand-surface border border-brand-border rounded-2xl hover:border-brand-secondary/30 hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-brand-secondary">{exam.badge}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-brand-text">{exam.title}</h3>
                    <p className="text-brand-text-muted text-sm mt-0.5">{exam.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-secondary group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section>
          <h2 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-muted" />
            Coming Soon
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Typing Trainer AI', desc: 'AI-generated drills targeting your weakest keys and common error patterns.' },
              { title: 'Typing History Export', desc: 'Export your full typing history as CSV or PDF for analysis.' },
            ].map(t => (
              <div key={t.title} className="p-5 bg-brand-surface border border-dashed border-brand-border rounded-2xl opacity-60">
                <h3 className="font-bold text-brand-text mb-1">{t.title}</h3>
                <p className="text-brand-text-muted text-sm">{t.desc}</p>
                <span className="mt-2 inline-block text-[10px] bg-brand-surface-2 border border-brand-border px-2 py-0.5 rounded-full text-brand-muted font-semibold uppercase">Coming Soon</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Code, Zap } from 'lucide-react';

interface CodeSnippet {
  language: string;
  title: string;
  icon: string;
  code: string;
}

const SNIPPETS: CodeSnippet[] = [
  {
    language: 'JavaScript',
    title: 'Async Fetch Function',
    icon: 'JS',
    code: `async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Network error");
  }
  const data = await response.json();
  return data;
}`,
  },
  {
    language: 'Python',
    title: 'List Comprehension',
    icon: 'PY',
    code: `def get_even_squares(n):
    return [x ** 2 for x in range(n) if x % 2 == 0]

numbers = get_even_squares(10)
print(numbers)`,
  },
  {
    language: 'TypeScript',
    title: 'Interface & Generic',
    icon: 'TS',
    code: `interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}`,
  },
  {
    language: 'SQL',
    title: 'JOIN Query',
    icon: 'SQL',
    code: `SELECT u.name, COUNT(o.id) AS total_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2025-01-01'
GROUP BY u.name
ORDER BY total_orders DESC
LIMIT 10;`,
  },
  {
    language: 'React JSX',
    title: 'Custom Hook',
    icon: 'JSX',
    code: `function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}`,
  },
  {
    language: 'CSS',
    title: 'Glassmorphism Card',
    icon: 'CSS',
    code: `.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}`,
  },
];

const LANG_COLORS: Record<string, string> = {
  JavaScript: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  Python: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  TypeScript: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  SQL: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  'React JSX': 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  CSS: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
};

export default function CodingTypingPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'Coding Typing Test | FastTypingLab'; }, []);

  const snippet = SNIPPETS[selectedIdx];
  const target = snippet.code;

  const errors = typed.split('').filter((c, i) => c !== target[i]).length;
  const progress = target.length > 0 ? Math.round((typed.length / target.length) * 100) : 0;

  useEffect(() => {
    if (finished || !started || !startTime) return;
    const elapsed = (Date.now() - startTime) / 60000;
    const words = typed.length / 5;
    setWpm(elapsed > 0 ? Math.round(words / elapsed) : 0);
    setAccuracy(typed.length > 0 ? Math.round(((typed.length - errors) / typed.length) * 100) : 100);
    if (typed === target) setFinished(true);
  }, [typed, finished, started, startTime, errors, target]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (finished) return;
    if (!started) { setStarted(true); setStartTime(Date.now()); }

    if (e.key === 'Backspace') {
      setTyped(t => t.slice(0, -1));
    } else if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const ch = e.key === 'Enter' ? '\n' : e.key === 'Tab' ? '  ' : e.key;
      setTyped(t => t.length < target.length ? t + ch : t);
    }
  }, [finished, started, target]);

  const reset = () => {
    setTyped('');
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setAccuracy(100);
    setStartTime(0);
    hiddenRef.current?.focus();
  };

  const selectSnippet = (i: number) => {
    setSelectedIdx(i);
    reset();
  };

  // Render characters with color coding
  const renderCode = () => {
    return target.split('').map((char, i) => {
      let cls = 'text-brand-muted';
      if (i < typed.length) {
        cls = typed[i] === char ? 'text-brand-accent' : 'text-rose-400 bg-rose-500/20 rounded-sm';
      } else if (i === typed.length) {
        cls = 'text-brand-text border-b-2 border-brand-primary animate-pulse';
      }
      return (
        <span key={i} className={cls}>
          {char === '\n' ? (i < typed.length ? '\n' : <span className="text-brand-border">↵{'\n'}</span>) : char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/tools" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Tools
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold">Coding Typing Test</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-black text-brand-text mb-2 flex items-center gap-2">
            <Code className="w-8 h-8 text-brand-primary" /> Coding Typing Test
          </h2>
          <p className="text-brand-text-muted">Type real code snippets in JavaScript, Python, TypeScript, SQL, and more.</p>
        </div>

        {/* Language selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SNIPPETS.map((s, i) => (
            <button key={i} onClick={() => selectSnippet(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedIdx === i
                  ? `${LANG_COLORS[s.language]} border-current`
                  : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'
              }`}>
              <span className="font-mono font-black">{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'WPM', value: wpm, color: 'text-brand-primary' },
            { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 95 ? 'text-brand-accent' : 'text-rose-500' },
            { label: 'Progress', value: `${progress}%`, color: 'text-brand-secondary' },
          ].map(s => (
            <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
              <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-brand-muted mt-0.5 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-brand-surface-2 rounded-full mb-4 overflow-hidden">
          <motion.div className="h-full bg-brand-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
        </div>

        {/* Code area */}
        <div
          className="relative bg-brand-surface border border-brand-border rounded-2xl overflow-hidden cursor-text"
          onClick={() => hiddenRef.current?.focus()}
        >
          {/* File tab header */}
          <div className={`flex items-center gap-3 px-5 py-3 border-b border-brand-border bg-brand-surface-2`}>
            <div className={`px-3 py-1 rounded-md text-xs font-bold border ${LANG_COLORS[snippet.language]}`}>
              {snippet.icon}
            </div>
            <span className="text-sm font-semibold text-brand-text">{snippet.title}</span>
            <span className="ml-auto text-xs text-brand-muted">{snippet.language}</span>
          </div>

          {/* Code display */}
          <pre className="px-6 py-5 font-mono text-sm leading-7 overflow-x-auto select-none whitespace-pre">
            {renderCode()}
          </pre>

          {/* Hidden input */}
          <input
            ref={hiddenRef}
            onKeyDown={handleKey}
            className="opacity-0 absolute top-0 left-0 w-0 h-0"
            autoFocus
            readOnly
          />

          {!started && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-surface/80 backdrop-blur-sm rounded-2xl">
              <div className="text-center">
                <Zap className="w-8 h-8 text-brand-primary mx-auto mb-2" />
                <p className="font-bold text-brand-text">Click here and start typing!</p>
                <p className="text-brand-muted text-sm mt-1">Tab = 2 spaces · Enter = new line</p>
              </div>
            </div>
          )}
        </div>

        {/* Finish result */}
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 bg-brand-accent/10 border border-brand-accent/30 rounded-2xl p-5 text-center"
            >
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-black text-brand-text mb-1">Code Typed!</h3>
              <p className="text-brand-muted text-sm mb-4">
                <span className="font-bold text-brand-primary">{wpm} WPM</span> · <span className="font-bold text-brand-accent">{accuracy}% accuracy</span>
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={reset}
                  className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <button onClick={() => { setSelectedIdx((selectedIdx + 1) % SNIPPETS.length); reset(); }}
                  className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-border transition-all">
                  Next Snippet →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        {!finished && started && (
          <div className="mt-4 flex justify-end">
            <button onClick={reset}
              className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm transition-colors">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        )}

        {/* SEO text */}
        <div className="mt-10 bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">About Coding Typing Test</h2>
          <p>Practice typing real programming code in JavaScript, Python, TypeScript, SQL, React JSX, and CSS. Coding typing tests improve your programming speed, muscle memory for special characters, and reduce typos in real development work.</p>
        </div>
      </div>
    </div>
  );
}

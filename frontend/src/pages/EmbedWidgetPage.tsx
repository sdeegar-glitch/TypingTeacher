import { useState, useEffect, useRef } from 'react';
import Seo from '../components/Seo';

const SITE = 'https://fasttypinglab.com';
const DURATION = 60; // seconds

const PASSAGES = [
  'The quick brown fox jumps over the lazy dog while the sun sets behind the distant hills and the birds fly home to rest.',
  'Practice makes perfect, so keep your fingers on the home row and type a little every single day to build real speed and accuracy.',
  'Good typing is about accuracy first and speed second, because every small mistake you make will cost you extra time to fix it later.',
];

const EMBED_CODE =
  `<iframe src="${SITE}/embed" width="100%" height="440" ` +
  `style="border:0;border-radius:16px;max-width:620px" ` +
  `title="Typing Speed Test by FastTypingLab" loading="lazy"></iframe>`;

export default function EmbedWidgetPage() {
  const [passage] = useState(() => PASSAGES[Math.floor(Math.random() * PASSAGES.length)]);
  const [input, setInput] = useState('');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const inIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    if (!startedAt || finished) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [startedAt, finished]);

  const elapsed = startedAt ? Math.min((now - startedAt) / 1000, DURATION) : 0;
  const timeLeft = Math.max(0, Math.ceil(DURATION - elapsed));

  useEffect(() => {
    if (startedAt && !finished && DURATION - elapsed <= 0) setFinished(true);
  }, [elapsed, startedAt, finished]);

  let correct = 0;
  for (let i = 0; i < input.length; i++) if (input[i] === passage[i]) correct++;
  const accuracy = input.length ? Math.round((correct / input.length) * 100) : 100;
  const minutes = Math.max(elapsed / 60, 1 / 60);
  const wpm = elapsed > 0.5 ? Math.max(0, Math.round(correct / 5 / minutes)) : 0;

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return;
    if (!startedAt) setStartedAt(Date.now());
    const v = e.target.value.slice(0, passage.length);
    setInput(v);
    if (v.length >= passage.length) setFinished(true);
  };

  const reset = () => {
    setInput(''); setStartedAt(null); setFinished(false); setNow(Date.now());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(EMBED_CODE).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="min-h-[100dvh] bg-brand-bg text-brand-text flex flex-col items-center justify-center p-4">
      <Seo title="Free Embeddable Typing Speed Test Widget | FastTypingLab" description="Add a free typing speed test to your website, blog or school page — copy one line of code. Free embeddable WPM typing widget by FastTypingLab." />

      <div className="w-full max-w-[600px] bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white"
              style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>F</span>
            <span className="font-black text-sm">Test Your Typing Speed</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono font-bold">
            <span className="text-brand-primary">{wpm} WPM</span>
            <span className="text-brand-accent">{accuracy}%</span>
            <span className="text-brand-muted">{timeLeft}s</span>
          </div>
        </div>

        {/* Passage */}
        <div
          className="font-mono text-sm sm:text-base leading-relaxed bg-brand-surface-2 border border-brand-border rounded-xl p-4 mb-3 cursor-text select-none"
          onClick={() => inputRef.current?.focus()}
        >
          {passage.split('').map((ch, i) => {
            const typed = i < input.length;
            const ok = typed && input[i] === ch;
            const isCurrent = i === input.length && !finished;
            return (
              <span key={i}
                className={ok ? 'text-brand-accent' : typed ? 'text-rose-500 bg-rose-500/10' : 'text-brand-muted'}
                style={isCurrent ? { borderBottom: '2px solid var(--brand-primary)' } : undefined}>
                {ch}
              </span>
            );
          })}
        </div>

        {/* Input / result */}
        {!finished ? (
          <textarea
            ref={inputRef}
            value={input}
            onChange={onChange}
            autoFocus
            rows={2}
            placeholder="Start typing here — the timer begins on your first keystroke…"
            className="w-full rounded-xl border border-brand-border bg-brand-surface p-3 text-sm outline-none focus:border-brand-primary resize-none font-mono"
          />
        ) : (
          <div className="text-center py-2">
            <div className="text-3xl font-black font-mono text-brand-primary">{wpm} <span className="text-base text-brand-muted">WPM</span></div>
            <div className="text-sm text-brand-muted mb-3">{accuracy}% accuracy</div>
            <div className="flex items-center justify-center gap-2">
              <button onClick={reset} className="text-xs font-bold text-white px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                Try Again
              </button>
              <a href={`${SITE}/tests`} target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold px-4 py-2 rounded-lg border border-brand-border hover:bg-brand-surface-2 transition-colors">
                Full Test →
              </a>
            </div>
          </div>
        )}

        {/* Attribution — the backlink */}
        <div className="text-center mt-3">
          <a href={SITE} target="_blank" rel="noopener noreferrer" className="text-[11px] text-brand-muted hover:text-brand-primary transition-colors">
            Powered by <strong>FastTypingLab</strong> — free typing speed test
          </a>
        </div>
      </div>

      {/* Embed instructions — only when NOT embedded (i.e. viewing the page directly) */}
      {!inIframe && (
        <div className="w-full max-w-[600px] mt-6 bg-brand-surface border border-brand-border rounded-2xl p-5">
          <h1 className="font-black text-lg mb-1">Embed this typing test on your site — free</h1>
          <p className="text-brand-text-muted text-sm mb-3">
            Add a free typing speed test to your blog, school site or resource page. Just paste this code where you want it to appear:
          </p>
          <pre className="bg-brand-surface-2 border border-brand-border rounded-xl p-3 text-[11px] overflow-x-auto whitespace-pre-wrap break-all">{EMBED_CODE}</pre>
          <button onClick={copyCode} className="mt-3 text-xs font-bold text-white px-4 py-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
            {copied ? 'Copied!' : 'Copy embed code'}
          </button>
          <p className="text-[11px] text-brand-muted mt-3">
            Free to use. Please keep the "Powered by FastTypingLab" link. Want the full experience?{' '}
            <a href={`${SITE}/tests`} className="text-brand-primary hover:underline">Take the full typing test →</a>
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Type, Hash, AlignLeft, FileText, Clock, Trash2, Copy, Check } from 'lucide-react';

const READING_SPEED_WPM = 200; // avg adult reading speed

function analyzeText(text: string) {
  const trimmed = text.trim();
  const words = trimmed === '' ? [] : trimmed.split(/\s+/);
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed === '' ? 0 : (trimmed.match(/[.!?]+/g) || []).length || (trimmed.length > 0 ? 1 : 0);
  const paragraphs = trimmed === '' ? 0 : text.split(/\n{2,}/).filter(p => p.trim() !== '').length || (trimmed.length > 0 ? 1 : 0);
  const readingMinutes = words.length / READING_SPEED_WPM;
  const readingTime = readingMinutes < 1
    ? `${Math.round(readingMinutes * 60)} sec`
    : `${Math.round(readingMinutes)} min`;

  // Keyword density — top 5 words (excluding stop words)
  const stops = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','been','have','has','it','its','this','that','i','you','he','she','they','we']);
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 2 && !stops.has(clean)) wordFreq[clean] = (wordFreq[clean] || 0) + 1;
  });
  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count, pct: words.length > 0 ? Math.round((count / words.length) * 100) : 0 }));

  return { words: words.length, chars, charsNoSpaces, sentences, paragraphs, readingTime, topKeywords };
}

export default function WordCounterPage() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = 'Word Counter — Free Online Tool | FastTypingLab';
  }, []);

  const stats = analyzeText(text);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statCards = [
    { label: 'Words', value: stats.words, icon: Type, color: 'text-brand-primary', bg: 'bg-brand-primary/10 border-brand-primary/20' },
    { label: 'Characters', value: stats.chars, icon: Hash, color: 'text-brand-accent', bg: 'bg-brand-accent/10 border-brand-accent/20' },
    { label: 'No Spaces', value: stats.charsNoSpaces, icon: Hash, color: 'text-brand-text', bg: 'bg-brand-surface-2 border-brand-border' },
    { label: 'Sentences', value: stats.sentences, icon: AlignLeft, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Paragraphs', value: stats.paragraphs, icon: FileText, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10 border-brand-secondary/20' },
    { label: 'Reading Time', value: stats.readingTime, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text mb-2">Word Counter</h1>
          <p className="text-brand-text-muted">Free online word and character counter. Paste or type your text below for instant analysis.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statCards.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border rounded-2xl p-4 text-center ${s.bg}`}>
              <s.icon className={`w-4 h-4 mx-auto mb-2 ${s.color}`} />
              <div className={`text-2xl font-black font-mono tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-brand-muted mt-1 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Text Editor */}
          <div className="lg:col-span-2">
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-surface-2">
                <span className="text-sm font-semibold text-brand-text">Your Text</span>
                <div className="flex gap-2">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-primary transition-colors px-2 py-1 rounded-lg hover:bg-brand-border">
                    {copied ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={() => setText('')}
                    className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Start typing or paste your text here…"
                rows={14}
                className="w-full bg-transparent px-5 py-4 text-brand-text text-sm leading-relaxed outline-none resize-none placeholder:text-brand-muted"
              />
              <div className="px-5 py-2 border-t border-brand-border bg-brand-surface-2 flex justify-between text-[11px] text-brand-muted">
                <span>{stats.words} words · {stats.chars} characters</span>
                <span>~{stats.readingTime} read</span>
              </div>
            </div>
          </div>

          {/* Keyword density sidebar */}
          <div className="space-y-4">
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <h2 className="font-bold text-brand-text mb-4 text-sm">Top Keywords</h2>
              {stats.topKeywords.length === 0 ? (
                <p className="text-brand-muted text-xs">Start typing to see keyword frequency.</p>
              ) : (
                <div className="space-y-3">
                  {stats.topKeywords.map(k => (
                    <div key={k.word}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-brand-text">{k.word}</span>
                        <span className="text-brand-muted">{k.count}× ({k.pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-brand-surface-2 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-brand-primary rounded-full"
                          animate={{ width: `${Math.min(k.pct * 5, 100)}%` }} transition={{ duration: 0.3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick presets */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <h2 className="font-bold text-brand-text mb-3 text-sm">Test Samples</h2>
              <div className="space-y-2">
                {[
                  { label: 'Article (200 words)', text: 'The quick development of technology has transformed how people communicate, work, and learn. From the invention of the printing press to the rise of the internet, each era has brought new tools that changed society in fundamental ways. Today, artificial intelligence is once again reshaping industries, automating repetitive tasks, and enabling machines to understand natural language. As these technologies continue to evolve, professionals across all sectors must adapt their skills to stay relevant in a rapidly changing economy. The future belongs to those who are willing to learn, unlearn, and relearn continuously.' },
                  { label: 'Essay intro', text: 'In recent years, the importance of digital literacy has grown exponentially. As technology becomes increasingly integrated into every aspect of modern life, the ability to read, write, and interact with digital systems is no longer optional. Schools, governments, and corporations must work together to ensure that all citizens have access to the training and tools they need to participate fully in the digital economy.' },
                ].map(p => (
                  <button key={p.label} onClick={() => setText(p.text)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-brand-text-muted hover:bg-brand-surface-2 hover:text-brand-text transition-all border border-transparent hover:border-brand-border">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO text */}
        <div className="mt-10 bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted leading-relaxed space-y-2">
          <h2 className="text-base font-bold text-brand-text">About This Word Counter</h2>
          <p>This free online word counter tool counts words, characters (with and without spaces), sentences, paragraphs, and estimates your reading time in real time. It also shows keyword density — how often specific words appear in your text.</p>
          <p>Use it for essays, articles, blog posts, social media captions, or any writing project where word count matters. No sign-up required — everything runs instantly in your browser.</p>
        </div>
      </div>
    </div>
  );
}

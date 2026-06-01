import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Copy, Check, Trash2, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

type ConversionType = 'uppercase' | 'lowercase' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'alternating' | 'inverse';

const CONVERSIONS: { key: ConversionType; label: string; example: string }[] = [
  { key: 'uppercase', label: 'UPPER CASE', example: 'HELLO WORLD' },
  { key: 'lowercase', label: 'lower case', example: 'hello world' },
  { key: 'title', label: 'Title Case', example: 'Hello World' },
  { key: 'sentence', label: 'Sentence case', example: 'Hello world' },
  { key: 'camel', label: 'camelCase', example: 'helloWorld' },
  { key: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
  { key: 'snake', label: 'snake_case', example: 'hello_world' },
  { key: 'kebab', label: 'kebab-case', example: 'hello-world' },
  { key: 'alternating', label: 'aLtErNaTiNg', example: 'hElLo WoRlD' },
  { key: 'inverse', label: 'iNVERSE cASE', example: 'hELLO wORLD' },
];

function convertText(text: string, type: ConversionType): string {
  const words = text.split(/\s+/);
  switch (type) {
    case 'uppercase': return text.toUpperCase();
    case 'lowercase': return text.toLowerCase();
    case 'title': return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    case 'sentence': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'camel':
      return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'pascal':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake': return text.toLowerCase().replace(/\s+/g, '_');
    case 'kebab': return text.toLowerCase().replace(/\s+/g, '-');
    case 'alternating':
      return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    case 'inverse':
      return text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
    default: return text;
  }
}

export default function CaseConverterPage() {
  const [input, setInput] = useState('');
  const [active, setActive] = useState<ConversionType>('uppercase');
  const [copied, setCopied] = useState(false);

  useEffect(() => { document.title = 'Case Converter — Free Online Tool | FastTypingLab'; }, []);

  const output = convertText(input, active);

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h1 className="text-xl font-bold text-brand-text">Case Converter</h1>
        </div>

        <div className="mb-3">
          <h2 className="text-3xl font-black text-brand-text mb-2">Case Converter</h2>
          <p className="text-brand-text-muted">Convert your text between UPPER, lower, Title, camelCase, snake_case and more — instantly.</p>
        </div>

        {/* Conversion type buttons */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CONVERSIONS.map(c => (
            <button key={c.key} onClick={() => setActive(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                active === c.key
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/20'
                  : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-primary/30'
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Input */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-surface-2">
              <span className="text-sm font-semibold text-brand-text">Input</span>
              <div className="flex gap-2">
                <button onClick={() => setInput('')}
                  className="flex items-center gap-1 text-xs text-brand-muted hover:text-rose-500 transition-colors px-2 py-1 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type or paste your text here…"
              rows={10}
              className="w-full bg-transparent px-5 py-4 text-brand-text text-sm leading-relaxed outline-none resize-none placeholder:text-brand-muted" />
          </div>

          {/* Output */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-surface-2">
              <span className="text-sm font-semibold text-brand-text">
                Output — <span className="text-brand-primary">{CONVERSIONS.find(c => c.key === active)?.label}</span>
              </span>
              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-primary transition-colors px-2 py-1 rounded-lg">
                  {copied ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => setInput(output)}
                  className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-primary transition-colors px-2 py-1 rounded-lg">
                  <RefreshCcw className="w-3.5 h-3.5" /> Use as Input
                </button>
              </div>
            </div>
            <div className="px-5 py-4 text-sm leading-relaxed text-brand-text font-mono min-h-[200px] select-all whitespace-pre-wrap break-words">
              {output || <span className="text-brand-muted">Converted text will appear here…</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        {input && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Characters', value: input.length },
              { label: 'Words', value: input.trim() ? input.trim().split(/\s+/).length : 0 },
              { label: 'Lines', value: input.split('\n').length },
            ].map(s => (
              <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
                <div className="text-xl font-black font-mono text-brand-primary">{s.value}</div>
                <div className="text-xs text-brand-muted">{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* SEO */}
        <div className="mt-8 bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">About Case Converter</h2>
          <p>This free online case converter transforms text between 10 case formats including UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, aLtErNaTiNg, and iNVERSE. Useful for developers, writers, students, and content creators.</p>
        </div>
      </div>
    </div>
  );
}

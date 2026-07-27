import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Zap, HelpCircle } from 'lucide-react';
import Seo from '../components/Seo';

const FAQS = [
  { q: 'How is WPM calculated?', a: 'The standard formula counts every 5 characters as one word. Gross WPM = (characters typed ÷ 5) ÷ minutes. Net WPM subtracts your errors: Net WPM = ((characters ÷ 5) − errors) ÷ minutes.' },
  { q: 'What is a good typing speed?', a: 'The average is about 40 WPM. 50–65 WPM is a solid touch-typing speed, 70–90 WPM is professional, and 100+ WPM is top 1%. For Indian government exams the bar is usually 30–40 WPM.' },
  { q: 'What is the difference between gross and net WPM?', a: 'Gross WPM is your raw speed. Net WPM subtracts mistakes, so it reflects usable speed — this is the number that matters for exams and real work.' },
  { q: 'Why 5 characters per word?', a: 'It is the long-standing typing-test standard (including spaces and punctuation), so results are comparable across different texts and tools.' },
];

const BENCHMARKS = [
  ['Beginner', '15–25 WPM'],
  ['Average adult', '~40 WPM'],
  ['Good touch typist', '50–65 WPM'],
  ['Professional', '70–90 WPM'],
  ['Top 1%', '100+ WPM'],
  ['Govt exam bar (SSC/CPCT)', '30–40 WPM'],
];

export default function WpmCalculatorPage() {
  const [chars, setChars] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [errors, setErrors] = useState('');

  useEffect(() => { document.title = 'WPM Calculator — Typing Speed Calculator | FastTypingLab'; }, []);

  const c = Math.max(0, Number(chars) || 0);
  const totalMin = (Math.max(0, Number(minutes) || 0) * 60 + Math.max(0, Number(seconds) || 0)) / 60;
  const e = Math.max(0, Number(errors) || 0);
  const hasInput = c > 0 && totalMin > 0;

  const grossWpm = hasInput ? Math.round(c / 5 / totalMin) : 0;
  const netWpm = hasInput ? Math.max(0, Math.round((c / 5 - e) / totalMin)) : 0;
  const accuracy = c > 0 ? Math.max(0, Math.round(((c - e) / c) * 100)) : 100;

  const inputCls = 'w-full px-4 py-2.5 rounded-xl text-brand-text text-sm outline-none transition-all border bg-brand-surface-2 border-brand-border focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15';

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="WPM Calculator — Free Typing Speed Calculator (Gross & Net) | FastTypingLab"
        description="Free WPM calculator. Enter characters typed, time and errors to get your gross and net typing speed (words per minute) and accuracy, with the exact formula explained."
        jsonLd={{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-brand-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">WPM Calculator</h1>
        </div>
        <p className="text-brand-text-muted text-sm leading-relaxed mb-6">
          Calculate your typing speed in words per minute (WPM). Enter how many characters you typed, how long it took, and how many mistakes you made — the calculator shows your gross WPM, net WPM and accuracy instantly.
        </p>

        {/* Calculator */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">Characters typed</label>
              <input className={inputCls} type="number" min="0" inputMode="numeric" value={chars} onChange={e => setChars(e.target.value)} placeholder="e.g. 300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">Errors (optional)</label>
              <input className={inputCls} type="number" min="0" inputMode="numeric" value={errors} onChange={e => setErrors(e.target.value)} placeholder="e.g. 5" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">Minutes</label>
              <input className={inputCls} type="number" min="0" inputMode="numeric" value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="e.g. 1" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">Seconds</label>
              <input className={inputCls} type="number" min="0" max="59" inputMode="numeric" value={seconds} onChange={e => setSeconds(e.target.value)} placeholder="e.g. 30" />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="rounded-2xl py-4 text-center text-white shadow-md" style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
              <div className="text-3xl font-black font-mono leading-none">{netWpm}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 mt-1">Net WPM</div>
            </div>
            <div className="rounded-2xl py-4 text-center bg-brand-surface-2 border border-brand-border">
              <div className="text-3xl font-black font-mono leading-none text-brand-text">{grossWpm}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-muted mt-1">Gross WPM</div>
            </div>
            <div className="rounded-2xl py-4 text-center bg-brand-surface-2 border border-brand-border">
              <div className="text-3xl font-black font-mono leading-none text-brand-accent">{accuracy}%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-muted mt-1">Accuracy</div>
            </div>
          </div>

          <Link to="/tests" className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white py-3 rounded-xl font-bold text-sm transition-all">
            <Zap className="w-4 h-4" /> Or take a real typing test →
          </Link>
        </div>

        {/* Formula */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
          <h2 className="font-black text-lg mb-2">The WPM formula</h2>
          <p className="text-brand-text-muted text-sm leading-relaxed mb-3">
            Typing tests treat every <strong className="text-brand-text">5 characters as one word</strong> (including spaces). So:
          </p>
          <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-4 font-mono text-sm text-brand-text space-y-1">
            <div>Gross WPM = (characters ÷ 5) ÷ minutes</div>
            <div>Net WPM&nbsp;&nbsp; = ((characters ÷ 5) − errors) ÷ minutes</div>
            <div>Accuracy&nbsp;&nbsp; = (characters − errors) ÷ characters × 100</div>
          </div>
        </div>

        {/* Benchmarks */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
          <h2 className="font-black text-lg mb-3">What is a good typing speed?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {BENCHMARKS.map(([label, val], i) => (
                  <tr key={label} className={i % 2 ? '' : 'bg-brand-surface-2'}>
                    <td className="py-2 px-3 font-semibold text-brand-text">{label}</td>
                    <td className="py-2 px-3 font-mono text-brand-text-muted text-right">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="font-black text-lg mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-brand-primary" /> FAQ</h2>
          <div className="space-y-4">
            {FAQS.map(f => (
              <div key={f.q}>
                <h3 className="font-semibold text-sm text-brand-text mb-1">{f.q}</h3>
                <p className="text-brand-text-muted text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

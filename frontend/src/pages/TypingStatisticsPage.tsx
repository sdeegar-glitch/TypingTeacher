import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Calculator, Zap, HelpCircle } from 'lucide-react';
import Seo from '../components/Seo';

const FAQS = [
  { q: 'What is the average typing speed in India?', a: 'The average typing speed in India is around 35–40 words per minute (WPM), close to the global average of about 40 WPM. Students and beginners often type 25–35 WPM, while government-exam typists usually train to 30–40 WPM in English and 25–30 WPM in Hindi.' },
  { q: 'What is the average typing speed?', a: 'The average typing speed is about 40 words per minute (WPM) for adults using a computer keyboard. Skilled touch typists reach 55–65 WPM, and professionals often type 70–90 WPM.' },
  { q: 'What is a good typing speed for a job?', a: 'Most office and data-entry jobs expect 40–60 WPM with high accuracy. Specialised roles like transcription or programming often require 65–90 WPM.' },
  { q: 'What is the average typing speed by age?', a: 'Typing speed usually peaks between ages 20 and 35 (around 40–45 WPM average) and declines gradually after that. Children and teenagers typically type slower as they build muscle memory.' },
  { q: 'What typing speed is required for Indian government exams?', a: 'Most Indian government typing tests (SSC, CPCT, UPSSSC, UP Police) require 25–40 WPM, commonly 35 WPM in English and 25–30 WPM in Hindi.' },
  { q: 'What is a good typing accuracy?', a: 'Aim for 95%+ accuracy. Skilled typists usually stay between 92% and 98%. Accuracy matters more than raw speed because every mistake costs time to fix.' },
];

const SkillTable = [
  ['Beginner', '15–25 WPM', 'Learning the keys, often hunt-and-peck'],
  ['Average adult', '~40 WPM', 'Everyday computer user'],
  ['Intermediate', '45–55 WPM', 'Comfortable touch typist'],
  ['Professional', '65–90 WPM', 'Data entry, writers, programmers'],
  ['Expert / Top 1%', '100+ WPM', 'Competitive and highly trained typists'],
];

const AgeTable = [
  ['Under 18', '~30–35 WPM'],
  ['18–25', '~38–42 WPM'],
  ['26–35', '~40–45 WPM (peak)'],
  ['36–50', '~38–42 WPM'],
  ['50+', '~30–38 WPM'],
];

const ProfessionTable = [
  ['Data entry operator', '50–70 WPM', '8,000+ key depressions/hour'],
  ['Transcriptionist', '60–90 WPM', 'High accuracy required'],
  ['Programmer / developer', '60–80 WPM', 'Slower on symbol-heavy code'],
  ['Writer / journalist', '55–75 WPM', 'Sustained long-form typing'],
  ['Office / admin', '40–60 WPM', 'General document work'],
  ['Student', '30–45 WPM', 'Improves with practice'],
];

const ExamTable = [
  ['SSC CHSL / CGL', '35 WPM English / 30 WPM Hindi'],
  ['CPCT (MP)', '~30 WPM (Hindi Mangal / English)'],
  ['UPSSSC Junior Assistant', '~25 WPM Hindi / 30 WPM English'],
  ['UP Police', '~25 WPM Hindi'],
  ['SSC Stenographer', '80–100 WPM shorthand dictation'],
];

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-brand-muted border-b border-brand-border">
            {head.map(h => <th key={h} className="py-2 pr-4 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-brand-border/60 last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`py-2.5 pr-4 ${j === 0 ? 'font-semibold text-brand-text' : 'text-brand-text-muted'} ${j === 1 ? 'font-mono' : ''}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-black text-brand-text mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function TypingStatisticsPage() {
  useEffect(() => { document.title = 'Typing Statistics — Average Typing Speed & WPM Benchmarks | FastTypingLab'; }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="Average Typing Speed in India & Worldwide — Typing Statistics (2026) | FastTypingLab"
        description="The average typing speed in India is about 35–40 WPM. See full typing statistics — average WPM by skill level, age, profession and country, plus accuracy and Indian exam speeds."
        jsonLd={{
          '@context': 'https://schema.org', '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-brand-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Average Typing Speed in India &amp; Typing Statistics</h1>
        </div>

        {/* Direct answer — optimised for the "average typing speed in India" featured snippet */}
        <div className="bg-brand-surface border-l-4 border-brand-primary rounded-r-2xl rounded-l-md p-5 mb-6">
          <p className="text-brand-text text-sm sm:text-base leading-relaxed">
            <strong className="text-brand-text">The average typing speed in India is about 35–40 words per minute (WPM)</strong>,
            close to the global average of roughly 40 WPM. Beginners and students typically type 25–35 WPM,
            skilled touch typists reach 55–65 WPM, and professionals often exceed 70 WPM. For Indian government
            typing exams, the usual requirement is 30–40 WPM in English and 25–30 WPM in Hindi.
          </p>
        </div>

        <p className="text-brand-text-muted text-sm leading-relaxed mb-6">
          Where do you stand? This page collects typing-speed benchmarks — average WPM by skill level, age,
          profession and country — plus accuracy stats, the most common typing mistakes, and the speeds
          required for Indian government exams. Figures are compiled from widely reported typing-test benchmarks.
          You can <Link to="/tests" className="text-brand-primary hover:underline">test your own typing speed free</Link> or
          use our <Link to="/wpm-calculator" className="text-brand-primary hover:underline">WPM calculator</Link>.
        </p>

        <Section title="Average typing speed at a glance">
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: '40', l: 'WPM average adult' },
              { v: '65–90', l: 'WPM professional' },
              { v: '95%+', l: 'good accuracy' },
            ].map(s => (
              <div key={s.l} className="rounded-2xl py-4 text-center text-white shadow-md" style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                <div className="text-2xl font-black font-mono leading-none">{s.v}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typing speed by skill level">
          <Table head={['Level', 'Speed', 'Description']} rows={SkillTable} />
        </Section>

        <Section title="Average typing speed by age">
          <Table head={['Age group', 'Average speed']} rows={AgeTable} />
          <p className="text-brand-text-muted text-sm mt-3">
            Typing speed tends to peak in the 20s–30s and declines slightly with age. For a deeper breakdown, read{' '}
            <Link to="/blog/average-typing-speed-by-age-and-profession" className="text-brand-primary hover:underline">average typing speed by age &amp; profession</Link>.
          </p>
        </Section>

        <Section title="Typing speed by profession">
          <Table head={['Profession', 'Typical speed', 'Notes']} rows={ProfessionTable} />
        </Section>

        <Section title="Typing speed for Indian government exams">
          <Table head={['Exam', 'Required speed']} rows={ExamTable} />
          <p className="text-brand-text-muted text-sm mt-3">
            Always confirm your official notification. Practise in the exact format on our{' '}
            <Link to="/competitive-exam-typing" className="text-brand-primary hover:underline">exam typing tests</Link>.
          </p>
        </Section>

        <Section title="Typing accuracy & common mistakes">
          <p className="text-brand-text-muted text-sm leading-relaxed mb-3">
            Skilled typists maintain 92–98% accuracy. The most common typing mistakes are:
          </p>
          <ul className="text-brand-text-muted text-sm space-y-1.5">
            <li>• <strong className="text-brand-text">Transposition</strong> — swapping letters (typing "teh" for "the").</li>
            <li>• <strong className="text-brand-text">Adjacent-key errors</strong> — hitting a neighbouring key.</li>
            <li>• <strong className="text-brand-text">Doubled letters</strong> — repeating or missing a repeated letter.</li>
            <li>• <strong className="text-brand-text">Capitalisation & punctuation</strong> — missed shift, wrong symbol.</li>
            <li>• In Hindi typing, <strong className="text-brand-text">matras and half-letters</strong> slow most candidates down.</li>
          </ul>
        </Section>

        {/* CTA cluster */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <Link to="/wpm-calculator" className="flex items-center gap-3 bg-brand-surface border border-brand-border rounded-2xl p-4 hover:border-brand-primary/40 transition-all">
            <Calculator className="w-5 h-5 text-brand-primary shrink-0" />
            <div>
              <div className="font-bold text-sm">WPM Calculator</div>
              <div className="text-xs text-brand-muted">Work out your speed from characters &amp; time</div>
            </div>
          </Link>
          <Link to="/tests" className="flex items-center gap-3 bg-brand-surface border border-brand-border rounded-2xl p-4 hover:border-brand-primary/40 transition-all">
            <Zap className="w-5 h-5 text-brand-accent shrink-0" />
            <div>
              <div className="font-bold text-sm">Take a Typing Test</div>
              <div className="text-xs text-brand-muted">Measure your real WPM &amp; accuracy free</div>
            </div>
          </Link>
        </div>

        {/* FAQ */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="font-black text-lg mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-brand-primary" /> Frequently Asked Questions</h2>
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

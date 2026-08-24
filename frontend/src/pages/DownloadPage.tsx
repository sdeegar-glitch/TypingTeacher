import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, WifiOff, Languages, Shield, Zap, CheckCircle2, Monitor, ScanSearch } from 'lucide-react';
import Seo from '../components/Seo';

// Points at the latest GitHub Release. After you push a tag (e.g. app-v1.0.0),
// the Windows installer is attached there automatically by the build workflow.
const WINDOWS_DOWNLOAD_URL = 'https://github.com/sdeegar-glitch/TypingTeacher/releases/latest';

// Free trust signal: scan the installer at virustotal.com, then paste the
// report URL here (e.g. https://www.virustotal.com/gui/file/<hash>/detection).
// Leave empty to hide the badge until a scan is linked.
const VIRUSTOTAL_SCAN_URL = '';

const FEATURES = [
  { icon: WifiOff, title: 'Works Offline', desc: 'Practice typing with no internet — tests are built into the app. Perfect for unstable or expensive connections.' },
  { icon: Languages, title: 'English & Hindi', desc: 'Includes English, Hindi Mangal (Unicode/INSCRIPT) and Kruti Dev passages in one app.' },
  { icon: Shield, title: 'Exam-Style Practice', desc: 'Real-format passages for SSC, CPCT, UPSSSC, court and other government typing tests.' },
  { icon: Zap, title: 'Live WPM & Accuracy', desc: 'See your net speed, accuracy and errors in real time — the same engine as the website.' },
];

const FAQS = [
  { q: 'Is the FastTypingLab Windows app free?', a: 'Yes. The app is completely free, just like the website. There are no charges to download or practice.' },
  { q: 'Does it work without internet?', a: 'Yes. The app ships with a set of English and Hindi typing tests built in, so you can practise fully offline. Account features, the AI tutor and certificates need internet.' },
  { q: 'What are the system requirements?', a: 'Windows 10 or 11 (64-bit). The app is lightweight — only a few megabytes — and installs in seconds.' },
  { q: 'I see a "Windows protected your PC" warning. Is it safe?', a: 'Yes. New apps from independent developers show a Microsoft SmartScreen notice until they build reputation. Click "More info" then "Run anyway" to install.' },
  { q: 'Is it different from the website?', a: 'It uses the same typing engine and design. The main advantage is offline practice and a native app you can open without a browser.' },
];

export default function DownloadPage() {
  useEffect(() => { document.title = 'Download Free Typing Software for Windows | FastTypingLab'; }, []);

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="Download Free Typing Software for Windows — English & Hindi | FastTypingLab"
        description="Download the free FastTypingLab typing software for Windows. Practise English and Hindi (Mangal & Kruti Dev) typing offline, with live WPM and accuracy — great for SSC, CPCT and government exam prep."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            <Monitor className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Download FastTypingLab for Windows</h1>
          <p className="text-brand-text-muted leading-relaxed max-w-xl mx-auto mb-6">
            Free typing software for Windows with <strong className="text-brand-text">offline practice</strong> in
            English and Hindi. Build your speed and accuracy for SSC, CPCT and government typing exams — no internet required.
          </p>
          <a href={WINDOWS_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-white px-7 py-3.5 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 6px 20px rgba(188,108,80,.35)' }}>
            <Download className="w-5 h-5" /> Download for Windows (Free)
          </a>
          <p className="text-xs text-brand-muted mt-3">Windows 10 &amp; 11 · 64-bit · Only a few MB</p>

          {VIRUSTOTAL_SCAN_URL && (
            <a href={VIRUSTOTAL_SCAN_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent hover:underline mt-2">
              <ScanSearch className="w-3.5 h-3.5" /> View VirusTotal scan report
            </a>
          )}
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <f.icon className="w-5 h-5 text-brand-primary mb-2" />
              <h2 className="font-bold text-sm mb-1">{f.title}</h2>
              <p className="text-brand-text-muted text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* How to install */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-10">
          <h2 className="font-bold text-lg mb-3">How to install</h2>
          <ol className="space-y-2.5 text-brand-text-muted text-sm">
            {[
              'Click "Download for Windows" above to get the installer (.exe).',
              'Open the downloaded file. If Windows shows a SmartScreen notice, click "More info" → "Run anyway".',
              'Follow the quick installer — it takes only a few seconds.',
              'Launch FastTypingLab from your Start menu and start practising, online or offline.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-brand-primary/15 text-brand-primary text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-brand-muted mt-4 pt-4 border-t border-brand-border">
            Want to verify it's safe first? The full source code is public on{' '}
            <a href="https://github.com/sdeegar-glitch/TypingTeacher" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-semibold hover:underline">GitHub</a>,
            and the installer is built automatically from that exact code via GitHub Actions — nothing hidden.
          </p>
        </div>

        {/* Prefer the browser */}
        <div className="flex items-center gap-3 bg-brand-surface-2 border border-brand-border rounded-2xl p-5 mb-10">
          <CheckCircle2 className="w-5 h-5 text-brand-accent shrink-0" />
          <p className="text-sm text-brand-text-muted">
            Prefer not to install anything? You can use the full{' '}
            <Link to="/tests" className="text-brand-primary font-semibold hover:underline">typing test online</Link>{' '}
            right in your browser — no download needed.
          </p>
        </div>

        {/* FAQ */}
        <h2 className="text-xl font-black mb-4">Frequently asked questions</h2>
        <div className="space-y-3 mb-10">
          {FAQS.map(f => (
            <div key={f.q} className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-1.5">{f.q}</h3>
              <p className="text-brand-text-muted text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href={WINDOWS_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-white px-7 py-3.5 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            <Download className="w-5 h-5" /> Download FastTypingLab for Windows
          </a>
        </div>
      </div>
    </div>
  );
}

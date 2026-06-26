import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, QrCode, Download, Shield, ChevronRight, CheckCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const CERT_FEATURES = [
  { icon: '🏆', title: 'WPM Certified', desc: 'Your words per minute score is officially recorded and displayed on the certificate.' },
  { icon: '🎯', title: 'Accuracy Score', desc: 'Your typing accuracy percentage is included — crucial for government exam requirements.' },
  { icon: '🔐', title: 'QR Verification', desc: 'Each certificate has a unique QR code that verifies authenticity at fasttypinglab.com/certificate.' },
  { icon: '📅', title: 'Date & Name', desc: 'Certificate includes your name, test title, language, and date of issue.' },
  { icon: '📥', title: 'Instant Download', desc: 'Download as a PNG image instantly — no registration required for basic certificates.' },
  { icon: '🌐', title: 'Share Online', desc: 'Share your certificate link on LinkedIn, WhatsApp, or email for professional credibility.' },
];

const HOW_STEPS = [
  { step: '1', title: 'Take a Typing Test', desc: 'Complete any typing test on FastTypingLab — 1 min, 5 min, or exam mode.', link: '/tests', cta: 'Start Test' },
  { step: '2', title: 'View Your Results', desc: 'After the test ends, you\'ll see your WPM, accuracy, and a certificate button.', link: '/tests', cta: 'Try It' },
  { step: '3', title: 'Generate Certificate', desc: 'Click "Get Certificate", enter your name, and it generates instantly.', link: '/certificate', cta: 'See Example' },
  { step: '4', title: 'Download & Share', desc: 'Download the certificate PNG and share it — it\'s free, instant, and verifiable.', link: '/certificate', cta: 'Download' },
];

const SAMPLE_SCORES = [
  { wpm: 30, label: 'SSC CHSL Minimum', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  { wpm: 40, label: 'Good — Most Exams', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { wpm: 60, label: 'Professional Typist', color: 'text-brand-primary', bg: 'bg-brand-primary/10 border-brand-primary/20' },
  { wpm: 80, label: 'Expert Level', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
];

export default function TypingCertificatesPage() {
  useEffect(() => {
    document.title = 'Typing Certificates — Free Verifiable Certificates | FastTypingLab';
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">

        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary">Home</Link><span>/</span>
          <span className="text-brand-text">Typing Certificates</span>
        </div>

        {/* Hero */}
        <PageHeader
          icon={Award}
          title="Free Typing Certificates"
          subtitle="Generate verifiable typing speed certificates instantly. Share on LinkedIn, use for government exam documentation, or keep as a personal milestone."
        >
          <div className="flex flex-wrap gap-3 justify-center mt-5">
            <Link to="/tests" className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20">
              <Award className="w-4 h-4" /> Get Your Certificate
            </Link>
            <Link to="/certificate" className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-text px-6 py-3 rounded-xl font-bold hover:bg-brand-border transition-all">
              Verify a Certificate
            </Link>
          </div>
        </PageHeader>

        {/* Score levels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {SAMPLE_SCORES.map(s => (
            <div key={s.wpm} className={`border rounded-xl p-4 text-center ${s.bg}`}>
              <div className={`text-3xl font-black font-mono ${s.color}`}>{s.wpm}</div>
              <div className="text-[10px] text-brand-muted uppercase tracking-wider mt-1">WPM</div>
              <div className="text-xs text-brand-text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Certificate features */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-brand-text mb-4">What's on Your Certificate?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CERT_FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 bg-brand-surface border border-brand-border rounded-2xl p-4">
                <div className="text-3xl shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-brand-text mb-1">{f.title}</h3>
                  <p className="text-brand-text-muted text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-brand-text mb-4">How to Get Your Certificate</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="flex gap-4 bg-brand-surface border border-brand-border rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-sm shrink-0">{s.step}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-brand-text mb-1">{s.title}</h3>
                  <p className="text-brand-text-muted text-sm mb-2">{s.desc}</p>
                  <Link to={s.link} className="text-brand-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    {s.cta} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR verify section */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h2 className="font-black text-brand-text mb-2">QR Code Verification</h2>
            <p className="text-brand-text-muted text-sm leading-relaxed">Every certificate contains a unique QR code. Anyone can scan it to verify the certificate is genuine and view the original test results at fasttypinglab.com/certificate. This makes our certificates trustworthy for employers and exam authorities.</p>
            <Link to="/certificate" className="text-brand-primary text-sm font-bold flex items-center gap-1 mt-2 hover:gap-2 transition-all">
              Verify a Certificate <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* SEO */}
        <div className="text-sm text-brand-text-muted space-y-2">
          <h2 className="text-base font-bold text-brand-text">Typing Speed Certificates — FAQ</h2>
          <p><strong className="text-brand-text">Are these certificates free?</strong> Yes, completely free. Take any typing test and generate your certificate instantly with no registration required.</p>
          <p><strong className="text-brand-text">Can I use this for government exam applications?</strong> Our certificates are for practice and personal milestone tracking. For official government exam certification, you must appear in the official exam conducted by SSC, CPCT, etc.</p>
          <p><strong className="text-brand-text">How are certificates verified?</strong> Each certificate has a unique ID and QR code. Scanning the QR code takes you to our verification page where anyone can confirm the certificate's authenticity.</p>
        </div>
      </div>
    </div>
  );
}

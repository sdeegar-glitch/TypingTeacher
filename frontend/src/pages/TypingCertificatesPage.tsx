import { useEffect } from 'react';
import Seo from '../components/Seo';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, QrCode, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const CERT_FEATURES = [
  { icon: '🏆', title: 'WPM Certified', desc: 'Your words per minute score is officially recorded and displayed on the certificate.' },
  { icon: '🎯', title: 'Accuracy Score', desc: 'Your typing accuracy percentage is included — crucial for government exam requirements.' },
  { icon: '🔐', title: 'QR Verification', desc: 'Each certificate has a unique QR code that verifies authenticity at fasttypinglab.com/certificate.' },
  { icon: '📅', title: 'Date & Name', desc: 'Certificate includes your name, test title, language, and date of issue.' },
  { icon: '📥', title: 'Instant Download', desc: 'Download a print-ready PDF or a PNG image as soon as it is issued. Needs a free account.' },
  { icon: '🌐', title: 'Share Online', desc: 'Share your certificate link on LinkedIn, WhatsApp, or email for professional credibility.' },
];

const HOW_STEPS = [
  { step: '1', title: 'Take a Typing Test', desc: 'Log in and complete a test of 5 minutes or more on FastTypingLab. Results are saved to your account.', link: '/tests/', cta: 'Start Test' },
  { step: '2', title: 'View Your Results', desc: 'After the test you see your WPM and accuracy. The certificate button turns on if you meet the requirements above.', link: '/tests/', cta: 'Try It' },
  { step: '3', title: 'Generate Certificate', desc: 'Open the certificate page, pick your qualifying test, confirm your name and generate it.', link: '/certificate', cta: 'See Example' },
  { step: '4', title: 'Download & Share', desc: 'Download the PDF or PNG and share the verify link. Anyone can check it by scanning the QR code.', link: '/certificate', cta: 'Download' },
];

export default function TypingCertificatesPage() {
  useEffect(() => {
    document.title = 'Typing Certificates — Free Verifiable Certificates | FastTypingLab';
  }, []);

  return (
    <div className="bg-brand-bg text-brand-text py-4 sm:py-6 px-4 sm:px-6">
      <Seo
        title="Free Typing Certificate — Verifiable WPM Certificate | FastTypingLab"
        description="Earn a free, verifiable typing certificate. Take a timed WPM test and download a shareable certificate of your typing speed and accuracy."
      />
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center gap-2 text-xs text-brand-muted mb-3">
          <Link to="/" className="hover:text-brand-primary">Home</Link><span>/</span>
          <span className="text-brand-text">Typing Certificates</span>
        </div>

        {/* Hero */}
        <PageHeader
          icon={Award}
          title="Free Typing Certificates"
          subtitle="A verifiable typing-speed certificate with a QR code, for registered users who pass a 5-minute or longer test."
        >
          <div className="flex flex-wrap gap-2 justify-center mt-3 mb-3">
            <Link to="/tests/" className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-primary/20">
              <Award className="w-4 h-4" /> Get Your Certificate
            </Link>
            <Link to="/certificate" className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-text px-6 py-3 rounded-xl font-bold hover:bg-brand-border transition-all">
              Verify a Certificate
            </Link>
          </div>
        </PageHeader>

        {/* Eligibility (mirrors the rules enforced on the server) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { k: 'Account', v: 'Free login', c: 'text-brand-primary' },
            { k: 'Speed', v: '30+ net WPM', c: 'text-emerald-600' },
            { k: 'Accuracy', v: '85% or more', c: 'text-brand-accent' },
            { k: 'Test length', v: '5 min or more', c: 'text-amber-600' },
          ].map(r => (
            <div key={r.k} className="bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-center">
              <div className="text-[10px] uppercase tracking-wider text-brand-muted">{r.k}</div>
              <div className={`text-sm font-extrabold ${r.c}`}>{r.v}</div>
            </div>
          ))}
        </div>

        {/* Certificate features */}
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-brand-text mb-3">What's on Your Certificate?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {CERT_FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 bg-brand-surface border border-brand-border rounded-xl p-3">
                <div className="text-2xl shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-brand-text text-sm mb-0.5">{f.title}</h3>
                  <p className="text-brand-text-muted text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-5">
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
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
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
        </div>      </div>
    </div>
  );
}

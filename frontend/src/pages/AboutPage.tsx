import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Languages, Shield, Headphones, Sparkles, Gamepad2 } from 'lucide-react';
import Seo from '../components/Seo';

const OFFERINGS = [
  { icon: Zap, title: 'Typing Speed Tests', desc: 'Free English & Hindi WPM tests from 1 to 10 minutes, with live speed and accuracy.' },
  { icon: Shield, title: 'Government Exam Practice', desc: 'Exact-format practice for SSC, CPCT, UPSSSC, UP Police, court, DEO and more.' },
  { icon: Languages, title: 'Hindi Typing', desc: 'Unicode (Mangal/INSCRIPT) and Kruti Dev, with an on-screen keyboard and matra practice.' },
  { icon: Headphones, title: 'Stenography & Dictation', desc: 'A shorthand guide and a dictation transcription trainer for steno aspirants.' },
  { icon: Sparkles, title: 'AI Typing Tutor', desc: 'A personalised improvement plan based on your speed, accuracy and weak keys.' },
  { icon: Gamepad2, title: 'Typing Games', desc: 'Fun, gamified practice to build speed without the boredom of drills.' },
];

export default function AboutPage() {
  useEffect(() => { document.title = 'About Us | FastTypingLab'; }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="About FastTypingLab — Free Typing & Govt Exam Practice for India"
        description="FastTypingLab is a free typing platform built for India — English & Hindi typing tests, SSC/CPCT/UPSSSC exam practice, stenography, an AI tutor and games, all free."
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black mb-4">About FastTypingLab</h1>
        <p className="text-brand-text-muted leading-relaxed mb-6">
          FastTypingLab is a free online typing platform built for India. Our mission is simple:
          give every student, professional and government-exam aspirant the tools to type faster and
          more accurately — without paywalls, and without needing to sign up just to practise.
        </p>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-lg mb-2">Why we built it</h2>
          <p className="text-brand-text-muted text-sm leading-relaxed">
            Most typing sites are built for English keyboards and generic speed tests. They don't handle
            Hindi (Mangal and Kruti Dev), the exact formats of Indian government typing exams, or the
            transcription skills stenographers need. Lakhs of Indian candidates need this practice every
            year — so we made a platform that focuses on exactly that, and keeps it free.
          </p>
        </div>

        <h2 className="text-xl font-black mb-4">What you get — all free</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {OFFERINGS.map(o => (
            <div key={o.title} className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <o.icon className="w-5 h-5 text-brand-primary mb-2" />
              <h3 className="font-bold text-sm mb-1">{o.title}</h3>
              <p className="text-brand-text-muted text-xs leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-lg mb-2">Our commitment</h2>
          <ul className="text-brand-text-muted text-sm leading-relaxed space-y-2">
            <li>• <strong className="text-brand-text">Free to use</strong> — the core practice is, and will stay, free.</li>
            <li>• <strong className="text-brand-text">Exam-accurate</strong> — we design tests around real exam formats, and always tell you to confirm your official notification.</li>
            <li>• <strong className="text-brand-text">Privacy-respecting</strong> — see our <Link to="/privacy" className="text-brand-primary hover:underline">Privacy Policy</Link> for exactly what we collect and why.</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/tests" className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold text-sm transition-all">
            <Zap className="w-4 h-4" /> Start a Free Test
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:bg-brand-border text-brand-text px-6 py-3 rounded-xl font-bold text-sm transition-all">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

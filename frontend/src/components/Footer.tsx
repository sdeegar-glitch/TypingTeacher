import { Link } from 'react-router-dom';
import VisitorCounter from './VisitorCounter';
import TelegramCTA from './TelegramCTA';
import WhatsAppCTA from './WhatsAppCTA';
import { YOUTUBE_URL, X_URL } from '../lib/social';
import { trackEvent } from '../lib/analytics';

// lucide-react dropped brand/logo icons a while back, so these two are
// small inline SVGs sized to match the lucide icons used elsewhere (w-4 h-4).
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.6V8.4l6.4 3.6Z" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
    <path d="M18.9 2H22l-7.6 8.7L23.3 22H16.7l-5.2-6.8L5.6 22H2.4l8.1-9.3L1.2 2h6.8l4.7 6.2Zm-1.2 18h1.7L6.4 4H4.6Z" />
  </svg>
);

const PRODUCT_LINKS = [
  { label: 'Typing Tests', href: '/tests/' },
  { label: 'Live Test', href: '/live-test/' },
  { label: 'Hindi Typing', href: '/hindi-typing-test/' },
  { label: 'Marathi Typing', href: '/marathi-typing-test/' },
  { label: 'Learn Typing', href: '/learn/' },
  { label: 'Exam Prep', href: '/competitive-exam-typing/' },
  { label: 'Shorthand', href: '/blog/how-to-learn-shorthand-stenography/' },
  { label: 'Typing Statistics', href: '/typing-statistics/' },
  { label: 'WPM Calculator', href: '/wpm-calculator/' },
  { label: 'Games', href: '/games/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Certificates', href: '/typing-certificates/' },
  { label: 'Windows App', href: '/download/' },
  { label: 'Invite Friends', href: '/refer/' },
  { label: 'Site Map', href: '/all-pages/' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about/' },
  { label: 'Contact Us', href: '/contact/' },
  { label: 'Privacy Policy', href: '/privacy/' },
  { label: 'Terms of Service', href: '/terms/' },
  { label: 'Disclaimer', href: '/disclaimer/' },
  { label: 'Cookie Policy', href: '/cookie-policy/' },
];

const linkCls = 'hover:text-brand-primary transition-colors duration-150';

/**
 * Site footer. Compact by design: brand + the one community call-to-action on
 * the left, all links in three columns, one legal line at the bottom. This is
 * the only place the Telegram/WhatsApp pair appears on ordinary pages.
 */
export default function Footer() {
  return (
    <footer className="border-t border-brand-border py-6 px-4 sm:px-6 mt-auto" style={{ background: 'var(--brand-surface)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)_minmax(0,1.1fr)] mb-5">
          {/* Brand + community */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #304C53, #2A9DAE)' }}>F</span>
              <span className="font-extrabold text-brand-text text-base">FastTypingLab</span>
            </div>
            <p className="text-xs text-brand-muted max-w-xs leading-snug mb-3">
              Free typing practice for students, professionals and govt exam aspirants.
            </p>
            <div className="flex flex-wrap gap-2 mb-2.5">
              <TelegramCTA variant="inline" className="px-3! py-1.5! text-xs!" />
              <WhatsAppCTA variant="inline" className="px-3! py-1.5! text-xs!" />
            </div>
            <div className="flex items-center gap-2">
              <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('social_click', { network: 'youtube', page: typeof window !== 'undefined' ? window.location.pathname : '' })}
                aria-label="FastTypingLab on YouTube"
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-border text-brand-muted hover:text-brand-primary hover:border-brand-primary/40 transition-colors">
                <YouTubeIcon />
              </a>
              <a href={X_URL} target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('social_click', { network: 'x', page: typeof window !== 'undefined' ? window.location.pathname : '' })}
                aria-label="FastTypingLab on X"
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-brand-border text-brand-muted hover:text-brand-primary hover:border-brand-primary/40 transition-colors">
                <XIcon />
              </a>
            </div>
          </div>

          {/* Product links */}
          <nav aria-label="Explore">
            <h2 className="text-[11px] font-bold text-brand-text uppercase tracking-wider mb-2">Explore</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-[13px] text-brand-muted">
              {PRODUCT_LINKS.map(l => (
                <Link key={l.href} to={l.href} className={linkCls}>{l.label}</Link>
              ))}
            </div>
          </nav>

          {/* Company / legal links */}
          <nav aria-label="Company">
            <h2 className="text-[11px] font-bold text-brand-text uppercase tracking-wider mb-2">Company</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] text-brand-muted">
              {COMPANY_LINKS.map(l => (
                <Link key={l.href} to={l.href} className={linkCls}>{l.label}</Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-3 border-t border-brand-border text-xs text-brand-muted">
          <p>© 2026 FastTypingLab. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <VisitorCounter />
            <a href="mailto:fasttypinglab@gmail.com" className={linkCls}>fasttypinglab@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

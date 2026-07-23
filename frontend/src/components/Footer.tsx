import { Link } from 'react-router-dom';
import VisitorCounter from './VisitorCounter';

const PRODUCT_LINKS = [
  { label: 'Typing Tests', href: '/tests' },
  { label: 'Hindi Typing', href: '/hindi-typing-test' },
  { label: 'Learn Typing', href: '/learn' },
  { label: 'Exam Prep', href: '/competitive-exam-typing' },
  { label: 'Shorthand', href: '/blog/how-to-learn-shorthand-stenography' },
  { label: 'Games', href: '/games' },
  { label: 'Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
  { label: 'Certificates', href: '/typing-certificates' },
  { label: 'Site Map', href: '/all-pages' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-border py-10 px-4 sm:px-6 mt-auto" style={{ background: 'var(--brand-surface)' }}>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #304C53, #2A9DAE)' }}>F</span>
              <span className="font-black text-brand-text text-lg">FastTypingLab</span>
            </div>
            <p className="text-xs text-brand-muted max-w-xs leading-relaxed">
              India's most complete free typing platform for students, professionals, and govt exam aspirants.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3">Explore</h3>
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-brand-muted">
              {PRODUCT_LINKS.map(l => (
                <Link key={l.href} to={l.href} className="hover:text-brand-primary transition-colors duration-150">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company / legal links */}
          <div>
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3">Company</h3>
            <div className="flex flex-col gap-2 text-sm text-brand-muted">
              {COMPANY_LINKS.map(l => (
                <Link key={l.href} to={l.href} className="hover:text-brand-primary transition-colors duration-150">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-brand-border text-xs text-brand-muted">
          <p>© 2026 FastTypingLab. All rights reserved. Made with ❤️ for India.</p>
          <div className="flex flex-wrap items-center gap-4">
            <VisitorCounter />
            <a href="mailto:fasttypinglab@gmail.com" className="hover:text-brand-primary transition-colors">fasttypinglab@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

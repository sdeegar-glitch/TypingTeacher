import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { isLoggedIn, logoutAndRedirect, initAuthRefresh } from './lib/auth';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, MessageCircle, Send, ChevronDown } from 'lucide-react';
import { fetchMe } from './lib/user';
import Footer from './components/Footer';
import { useTheme } from './store/useThemeStore';
import { trackVisit } from './lib/api';
import { initAnalytics, trackPageview, trackEvent } from './lib/analytics';
import { captureReferralFromUrl } from './lib/referral';
import { WHATSAPP_URL, TELEGRAM_URL } from './lib/social';

const TypingTestPage = lazy(() => import('./pages/TypingTestPage'));
const TypingReportPage = lazy(() => import('./pages/TypingReportPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LearningCoursePage = lazy(() => import('./pages/LearningCoursePage'));
const LearningInterfacePage = lazy(() => import('./pages/LearningInterfacePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));
const TypingDrillsPage = lazy(() => import('./pages/TypingDrillsPage'));
const FontConverterPage = lazy(() => import('./pages/FontConverterPage'));
const LiveTestPage = lazy(() => import('./pages/LiveTestPage'));
const ReferPage = lazy(() => import('./pages/ReferPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const EmbedWidgetPage = lazy(() => import('./pages/EmbedWidgetPage'));
const WpmCalculatorPage = lazy(() => import('./pages/WpmCalculatorPage'));
const TypingStatisticsPage = lazy(() => import('./pages/TypingStatisticsPage'));
const OgMakerPage = lazy(() => import('./pages/OgMakerPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

const LearningInterfacePageWithKey = () => {
  const { lessonId } = useParams();
  return <LearningInterfacePage key={lessonId} />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = isLoggedIn();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// One "Learn Typing" menu instead of two separate English / Hindi links.
const LEARN_LINKS = [
  { to: '/learn/', label: 'English Typing', sub: '50 lessons · QWERTY' },
  { to: '/learn-hindi-typing/', label: 'Hindi Typing', sub: '200 lessons · Mangal & Kruti Dev' },
];

const NAV_LINKS: { to: string; label: string; short?: string; wide?: string }[] = [
  { to: '/tests/',                  label: 'Typing Test' },
  { to: '/competitive-exam-typing/',label: 'Exams' },
  { to: '/blog/how-to-learn-shorthand-stenography/', label: 'Shorthand' },
  { to: '/games/',                  label: 'Games' },
  { to: '/tools/',                  label: 'Tools' },
  { to: '/blog/',                   label: 'Blog' },
];

/** Desktop dropdown: click (or Enter/Space) to open, Esc or outside click to close. */
const LearnMenu = ({ pathname }: { pathname: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = LEARN_LINKS.some(l => pathname === l.to || pathname.startsWith(l.to));

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1 px-2 xl:px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
          active || open ? 'text-brand-primary bg-brand-primary/10 font-semibold' : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-2'
        }`}>
        Learn Typing
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-brand-border bg-brand-surface shadow-xl p-1.5 z-50">
          {LEARN_LINKS.map(l => (
            <Link key={l.to} to={l.to} role="menuitem"
              className="block rounded-lg px-3 py-2 hover:bg-brand-surface-2 transition-colors">
              <span className="block text-sm font-semibold text-brand-text">{l.label}</span>
              <span className="block text-xs text-brand-muted">{l.sub}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Reactive auth state — reading localStorage once at render doesn't update the
  // navbar after an in-app login or a login in another tab. Re-check on route
  // change, tab focus, cross-tab storage events, and our own auth-change event.
  const [isAuthenticated, setIsAuthenticated] = useState(() => isLoggedIn());
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const sync = () => setIsAuthenticated(isLoggedIn());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener('ftl-auth-change', sync);
    const timer = window.setInterval(sync, 60_000);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener('ftl-auth-change', sync);
      window.clearInterval(timer);
    };
  }, []);

  // Re-check whenever the route changes (e.g. redirect to /dashboard after login).
  useEffect(() => { setIsAuthenticated(isLoggedIn()); }, [location.pathname]);

  // Logged-in identity for the welcome chip. Seed from cache to avoid a flash,
  // then refresh from the server.
  const [me, setMe] = useState<{ name: string; avatar: string | null }>(() => ({
    name: localStorage.getItem('ftl_user_name') || '',
    avatar: localStorage.getItem('ftl_user_avatar') || null,
  }));

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMe().then(p => {
      if (!p) return;
      const name = p.name || (p.email ? p.email.split('@')[0] : '');
      setMe({ name, avatar: p.avatar_url });
      localStorage.setItem('ftl_user_name', name);
      if (p.avatar_url) localStorage.setItem('ftl_user_avatar', p.avatar_url);
      else localStorage.removeItem('ftl_user_avatar');
    });
  }, [isAuthenticated]);

  const firstName = me.name ? me.name.trim().split(/\s+/)[0] : '';
  const avatarInitials = (me.name || 'U').trim().slice(0, 2).toUpperCase();

  const closeMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { closeMenu(); }, [location.pathname]);

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav shadow-lg shadow-black/5' : 'glass-nav'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 xl:gap-4">

          {/* ── Logo ── */}
          <Link to="/" onClick={closeMenu}
            className="flex items-center gap-2.5 font-black text-lg tracking-tight text-brand-text hover:opacity-85 transition-opacity z-50 relative shrink-0">
            <img src="/logo-icon.png" alt="FastTypingLab logo" width={32} height={32} className="w-8 h-8 shrink-0" />
            <span className="hidden sm:inline">FastTypingLab</span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[13px] xl:text-sm font-medium flex-1 justify-center min-w-0">
            <LearnMenu pathname={location.pathname} />
            {NAV_LINKS.map(link => {
              const active = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
              return (
                <Link key={link.to} to={link.to} title={link.label}
                  className={`px-2 xl:px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
                    active
                      ? 'text-brand-primary bg-brand-primary/10 font-semibold'
                      : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-2'
                  }`}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Community links — wide desktop only (always in the mobile menu) */}
            <div className="hidden xl:flex items-center gap-1.5">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" title="Join our WhatsApp channel"
                onClick={() => trackEvent('whatsapp_cta_click', { variant: 'navbar', page: window.location.pathname })}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 hover:-translate-y-px"
                style={{ background: '#188842' }}>
                <MessageCircle size={16} />
              </a>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" title="Join our Telegram channel"
                onClick={() => trackEvent('telegram_cta_click', { variant: 'navbar', page: window.location.pathname })}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 hover:-translate-y-px"
                style={{ background: '#1B7EAE' }}>
                <Send size={16} />
              </a>
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-surface-2 transition-all duration-200">
              {isDark
                ? <Sun size={17} />
                : <Moon size={17} />}
            </button>

            {/* Auth buttons — desktop only */}
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                <Link to="/dashboard"
                  className="px-2 xl:px-3 py-1.5 rounded-lg text-[13px] xl:text-sm font-semibold whitespace-nowrap text-brand-muted hover:text-brand-text hover:bg-brand-surface-2 transition-all duration-200">
                  Dashboard
                </Link>
                <Link to="/profile" title="View profile"
                  className="flex items-center gap-2 pl-1 xl:pr-3 py-1 rounded-full border border-brand-border hover:bg-brand-surface-2 transition-all duration-200">
                  <span className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                    {me.avatar ? <img src={me.avatar} alt="" width={28} height={28} className="w-full h-full object-cover" /> : avatarInitials}
                  </span>
                  <span className="hidden xl:inline text-sm font-semibold text-brand-text max-w-[120px] truncate">
                    {firstName ? `Hi, ${firstName}` : 'Profile'}
                  </span>
                </Link>
                <button onClick={() => { void logoutAndRedirect(); }}
                  className="px-2 xl:px-3 py-1.5 rounded-lg text-[13px] xl:text-sm font-semibold whitespace-nowrap text-brand-muted hover:text-rose-500 transition-all duration-200">
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link to="/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap text-brand-muted hover:text-brand-text hover:bg-brand-surface-2 transition-all duration-200">
                  Log in
                </Link>
                <Link to="/signup"
                  className="px-4 py-1.5 rounded-xl text-sm font-bold whitespace-nowrap text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-px active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #BC6C50 0%, #CC7B5D 100%)', boxShadow: '0 3px 12px rgba(188,108,80,0.35)' }}>
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="lg:hidden z-50 relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-surface-2 text-brand-text transition-all"
              onClick={() => setIsMobileMenuOpen(v => !v)} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm" onClick={closeMenu} />

        {/* Slide-in panel */}
        <div className={`absolute right-0 top-0 bottom-0 w-72 transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`} style={{ background: 'var(--brand-surface)', borderLeft: '1px solid var(--brand-border)' }}>
          <div className="flex flex-col h-full pt-20 pb-8 px-6 overflow-y-auto">
            <div className="flex flex-col gap-1">
              <p className="px-4 pt-1 text-xs font-bold uppercase tracking-wider text-brand-muted">Learn Typing</p>
              {LEARN_LINKS.map(l => (
                <Link key={l.to} to={l.to} onClick={closeMenu}
                  className={`flex flex-col px-4 py-2.5 rounded-xl transition-all ${
                    location.pathname.startsWith(l.to) ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-text hover:bg-brand-surface-2 hover:text-brand-primary'
                  }`}>
                  <span className="font-semibold text-base">{l.label}</span>
                  <span className="text-xs text-brand-muted">{l.sub}</span>
                </Link>
              ))}
              {NAV_LINKS.map(link => {
                const active = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to} onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-all ${
                      active
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-brand-text hover:bg-brand-surface-2 hover:text-brand-primary'
                    }`}>
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Community links */}
            <div className="mt-4 pt-4 border-t border-brand-border">
              <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wider text-brand-muted">Join our community</p>
              <div className="flex gap-2 px-1">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => { trackEvent('whatsapp_cta_click', { variant: 'navbar_mobile', page: window.location.pathname }); closeMenu(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
                  style={{ background: '#188842' }}>
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => { trackEvent('telegram_cta_click', { variant: 'navbar_mobile', page: window.location.pathname }); closeMenu(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
                  style={{ background: '#1B7EAE' }}>
                  <Send size={16} /> Telegram
                </a>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-brand-border flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={closeMenu}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl border border-brand-border hover:bg-brand-surface-2 transition-all">
                    <span className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                      {me.avatar ? <img src={me.avatar} alt="" width={36} height={36} className="w-full h-full object-cover" /> : avatarInitials}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-brand-text truncate">{firstName ? `Hi, ${firstName}` : 'My Profile'}</span>
                      <span className="block text-xs text-brand-muted">View & edit profile</span>
                    </span>
                  </Link>
                  <Link to="/dashboard" onClick={closeMenu}
                    className="w-full text-center py-3 rounded-xl font-semibold border border-brand-border text-brand-text hover:bg-brand-surface-2 transition-all">
                    Dashboard
                  </Link>
                  <button onClick={() => { void logoutAndRedirect(); }}
                    className="w-full py-3 rounded-xl font-semibold text-rose-500 border border-rose-200 dark:border-rose-900/40 transition-all">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}
                    className="w-full text-center py-3 rounded-xl font-semibold border border-brand-border text-brand-text hover:bg-brand-surface-2 transition-all">
                    Log in
                  </Link>
                  <Link to="/signup" onClick={closeMenu}
                    className="w-full text-center py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 14px rgba(188,108,80,.3)' }}>
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



const HomePage = lazy(() => import('./pages/HomePage'));
const TestsListPage = lazy(() => import('./pages/TestsListPage'));
const TestConfigPage = lazy(() => import('./pages/TestConfigPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const KeyboardTesterPage = lazy(() => import('./pages/KeyboardTesterPage'));
const DictationTypingPage = lazy(() => import('./pages/DictationTypingPage'));
const SpacebarCounterPage = lazy(() => import('./pages/SpacebarCounterPage'));
const CpsTestPage = lazy(() => import('./pages/CpsTestPage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const WordCounterPage = lazy(() => import('./pages/WordCounterPage'));
const TypingTestForPage = lazy(() => import('./pages/TypingTestForPage'));
const MultiplayerPage = lazy(() => import('./pages/MultiplayerPage'));
const CaseConverterPage = lazy(() => import('./pages/CaseConverterPage'));
const CodingTypingPage = lazy(() => import('./pages/CodingTypingPage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const SpeedRacerPage = lazy(() => import('./pages/SpeedRacerPage'));
const NinjaSlashPage = lazy(() => import('./pages/games/NinjaSlashPage'));
const SpaceShooterPage = lazy(() => import('./pages/games/SpaceShooterPage'));
const ZombieArenaPage = lazy(() => import('./pages/games/ZombieArenaPage'));
const WordRainGame = lazy(() => import('./pages/games/WordRainGame'));
const CastleDefensePage = lazy(() => import('./pages/games/CastleDefensePage'));
const CyberHackerPage = lazy(() => import('./pages/games/CyberHackerPage'));
const HindiTypingPage = lazy(() => import('./pages/HindiTypingPage'));
const MarathiTypingPage = lazy(() => import('./pages/MarathiTypingPage'));
const HindiTypingJunglePage = lazy(() => import('./pages/HindiTypingJunglePage'));
const HindiLessonCoursePage = lazy(() => import('./pages/HindiLessonCoursePage'));
const HindiLessonPage = lazy(() => import('./pages/HindiLessonPage'));
const KrutiDevPage = lazy(() => import('./pages/KrutiDevPage'));
const CompetitiveExamTypingPage = lazy(() => import('./pages/CompetitiveExamTypingPage'));
const LearnHindiTypingPage = lazy(() => import('./pages/LearnHindiTypingPage'));
const HindiCourseSelectPage = lazy(() => import('./pages/HindiCourseSelectPage'));
const HindiCourseLessonPage = lazy(() => import('./pages/HindiCourseLessonPage'));
const TypingCertificatesPage = lazy(() => import('./pages/TypingCertificatesPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const AiTutorPage = lazy(() => import('./pages/AiTutorPage'));
const ExamLandingPage = lazy(() => import('./pages/ExamLandingPage'));
const SiteMapPage = lazy(() => import('./pages/SiteMapPage'));

const AppContent = () => {
  const location = useLocation();

  // Record one visit per browser session (survives SPA navigation & remounts).
  useEffect(() => {
    initAnalytics();
    if (sessionStorage.getItem('ftl_visit_tracked')) return;
    sessionStorage.setItem('ftl_visit_tracked', '1');
    trackVisit(window.location.pathname);
  }, []);

  // Silently renews the session before the access token expires, so a logged-in
  // visitor is never bounced back to /login just for staying on the site for
  // over an hour. One subscription for the whole app lifetime (AppContent is
  // never remounted by routing).
  useEffect(() => initAuthRefresh(), []);

  // GA4 page view on every SPA route change.
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Invite links can land on any page, so `?ref=` is captured app-wide rather
  // than on /refer alone. Stored until signup, which is usually several clicks
  // and one typing test later.
  useEffect(() => {
    captureReferralFromUrl(location.search);
  }, [location.search]);

  // Only /embed/* stays navbar-less -- it's rendered inside other sites'
  // iframes, where the parent site's own nav would be broken/pointless.
  // Every other full-height practice/lesson page now carries the shared
  // navbar too (it used to be suppressed there as well); each of those
  // pages' own height calc accounts for the navbar's height instead.
  const isEmbed = location.pathname.startsWith('/embed');

  return (
    // No font-sans here: that Tailwind utility sets the generic ui-sans-serif
    // stack and, being closer than body, would override body's Inter for
    // every element on the site (it did, until this was found and removed).
    <div className={`min-h-screen flex flex-col bg-brand-bg transition-colors ${isEmbed ? 'h-screen overflow-hidden' : ''}`}>
      {!isEmbed && <Navbar />}
      <main className={`flex-grow ${isEmbed ? 'overflow-hidden' : ''}`}>
        <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Programmatic SEO Routes */}
          <Route path="/typing-test" element={<TypingTestPage />} />
          <Route path="/typing-test/:duration" element={<TypingTestPage />} />
          <Route path="/typing-test/language/:language" element={<TypingTestPage />} />
          <Route path="/results" element={<TypingReportPage />} />
          
          {/* New Dynamic Routes */}
          <Route path="/tests/config/:slug" element={<TestConfigPage />} />
          
          {/* Legacy/Existing Routes */}
          <Route path="/tests/:id" element={<TypingTestPage />} />
          <Route path="/tests" element={<TestsListPage />} />
          <Route path="/learn" element={<LearningCoursePage />} />
          <Route path="/learn/:lessonId" element={<LearningInterfacePageWithKey />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          {/* Dashboard is intentionally usable while logged out (local practice
              stats from localStorage) — not wrapped. Profile is account-only
              and previously redirected itself only after mount (a brief flash
              of the page shell); ProtectedRoute now redirects before it renders. */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Phase 2: Tools & Utilities */}
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/keyboard-tester" element={<KeyboardTesterPage />} />
          <Route path="/dictation-typing-test" element={<DictationTypingPage />} />
          <Route path="/spacebar-counter" element={<SpacebarCounterPage />} />
          <Route path="/cps-test" element={<CpsTestPage />} />

          {/* Phase 2: Exam Practice */}
          <Route path="/exam/:examId" element={<ExamPage />} />

          {/* Phase 3: Gamification */}
          <Route path="/certificate" element={<CertificatePage />} />

          {/* Phase 4: Multiplayer + SEO + Tools */}
          <Route path="/race" element={<MultiplayerPage />} />
          <Route path="/word-counter" element={<WordCounterPage />} />
          <Route path="/typing-test-for/:profession" element={<TypingTestForPage />} />
          <Route path="/case-converter" element={<CaseConverterPage />} />
          <Route path="/coding-typing" element={<CodingTypingPage />} />

          {/* Phase 5: Games + Hindi + Blog */}
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/word-rain" element={<WordRainGame />} />
          <Route path="/games/zombie" element={<ZombieArenaPage />} />
          <Route path="/games/speed-racer" element={<SpeedRacerPage />} />
          <Route path="/games/ninja-slash" element={<NinjaSlashPage />} />
          <Route path="/games/space-shooter" element={<SpaceShooterPage />} />
          <Route path="/games/castle-defense" element={<CastleDefensePage />} />
          <Route path="/games/cyber-hacker" element={<CyberHackerPage />} />
          <Route path="/hindi-typing-test" element={<HindiTypingPage />} />
          <Route path="/marathi-typing-test" element={<MarathiTypingPage />} />
          <Route path="/hindi-typing-jungle" element={<HindiTypingJunglePage />} />
          <Route path="/hindi-lessons" element={<HindiLessonCoursePage />} />
          <Route path="/hindi-lessons/:lessonId" element={<HindiLessonPage />} />
          <Route path="/kruti-dev-typing" element={<KrutiDevPage />} />
          <Route path="/learn-hindi-typing" element={<LearnHindiTypingPage />} />
          <Route path="/learn-hindi-typing/:layout" element={<HindiCourseSelectPage />} />
          <Route path="/learn-hindi-typing/:layout/:lessonId" element={<HindiCourseLessonPage />} />
          <Route path="/typing-certificates" element={<TypingCertificatesPage />} />
          <Route path="/competitive-exam-typing" element={<CompetitiveExamTypingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/ai-tutor" element={<AiTutorPage />} />

          {/* Exam typing landing pages (SEO) */}
          <Route path="/ssc-chsl-typing-test" element={<ExamLandingPage slug="ssc-chsl" />} />
          <Route path="/ssc-cgl-typing-test" element={<ExamLandingPage slug="ssc-cgl" />} />
          <Route path="/cpct-typing-test" element={<ExamLandingPage slug="cpct" />} />
          <Route path="/up-police-typing-test" element={<ExamLandingPage slug="up-police" />} />
          <Route path="/railway-ntpc-typing-test" element={<ExamLandingPage slug="railway-ntpc" />} />
          <Route path="/court-typing-test" element={<ExamLandingPage slug="court" />} />
          <Route path="/bihar-ssc-typing-test" element={<ExamLandingPage slug="bihar-ssc" />} />
          <Route path="/deo-typing-test" element={<ExamLandingPage slug="deo" />} />
          <Route path="/rsmssb-typing-test" element={<ExamLandingPage slug="rsmssb" />} />
          <Route path="/ldc-typing-test" element={<ExamLandingPage slug="ldc" />} />
          <Route path="/ssc-steno-typing-test" element={<ExamLandingPage slug="ssc-steno" />} />
          <Route path="/dsssb-typing-test" element={<ExamLandingPage slug="dsssb" />} />
          <Route path="/upsssc-typing-test" element={<ExamLandingPage slug="upsssc" />} />
          <Route path="/ahc-ro-aro-typing-test" element={<ExamLandingPage slug="ahc-ro-aro" />} />
          <Route path="/delhi-police-typing-test" element={<ExamLandingPage slug="delhi-police" />} />
          <Route path="/rrb-typing-test" element={<ExamLandingPage slug="rrb" />} />
          <Route path="/ctsp-typing-test" element={<ExamLandingPage slug="ctsp" />} />
          <Route path="/psssb-typing-test" element={<ExamLandingPage slug="psssb" />} />
          <Route path="/hartron-typing-test" element={<ExamLandingPage slug="hartron" />} />
          <Route path="/all-pages" element={<SiteMapPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/typing-drills" element={<TypingDrillsPage />} />
          <Route path="/kruti-dev-to-unicode" element={<FontConverterPage />} />
          <Route path="/font-converter" element={<FontConverterPage />} />
          <Route path="/live-test" element={<LiveTestPage />} />
          <Route path="/refer" element={<ReferPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/cookie-policy" element={<CookiePolicyPage />} />
          <Route path="/embed" element={<EmbedWidgetPage />} />
          <Route path="/wpm-calculator" element={<WpmCalculatorPage />} />
          <Route path="/typing-statistics" element={<TypingStatisticsPage />} />
          <Route path="/og-maker" element={<OgMakerPage />} />
        </Routes>
        </Suspense>
      </main>
      {!isEmbed && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

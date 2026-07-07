import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from './store/useThemeStore';
import { trackVisit } from './lib/api';
import { initAnalytics, trackPageview } from './lib/analytics';

const TypingTestPage = lazy(() => import('./pages/TypingTestPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LearningCoursePage = lazy(() => import('./pages/LearningCoursePage'));
const LearningInterfacePage = lazy(() => import('./pages/LearningInterfacePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));

const LearningInterfacePageWithKey = () => {
  const { lessonId } = useParams();
  return <LearningInterfacePage key={lessonId} />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const NAV_LINKS = [
  { to: '/learn',                  label: 'Learn English Typing' },
  { to: '/learn-hindi-typing',      label: 'Learn Hindi Typing' },
  { to: '/tests',                  label: 'Typing Test' },
  { to: '/competitive-exam-typing',label: 'Exams' },
  { to: '/games',                  label: 'Games' },
  { to: '/tools',                  label: 'Tools' },
  { to: '/blog',                   label: 'Blog' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

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
        scrolled ? 'glass-nav shadow-lg shadow-black/5' : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/" onClick={closeMenu}
            className="flex items-center gap-2.5 font-black text-lg tracking-tight text-brand-text hover:opacity-85 transition-opacity z-50 relative shrink-0">
            <img src="/logo-icon.png" alt="FastTypingLab logo" width={32} height={32} className="w-8 h-8 shrink-0" />
            <span className="hidden sm:inline">FastTypingLab</span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium flex-1 justify-center">
            {NAV_LINKS.map(link => {
              const active = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
              return (
                <Link key={link.to} to={link.to}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
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
            {/* Theme toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-muted hover:text-brand-text hover:bg-brand-surface-2 transition-all duration-200">
              {isDark
                ? <Sun size={17} />
                : <Moon size={17} />}
            </button>

            {/* Auth buttons — desktop only */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/dashboard"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-surface-2 transition-all duration-200">
                  Dashboard
                </Link>
                <button onClick={() => { localStorage.removeItem('accessToken'); window.location.href = '/login'; }}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-brand-muted hover:text-rose-500 transition-all duration-200">
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-surface-2 transition-all duration-200">
                  Log in
                </Link>
                <Link to="/signup"
                  className="px-4 py-1.5 rounded-xl text-sm font-bold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-px active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #BC6C50 0%, #CC7B5D 100%)', boxShadow: '0 3px 12px rgba(188,108,80,0.35)' }}>
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden z-50 relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-surface-2 text-brand-text transition-all"
              onClick={() => setIsMobileMenuOpen(v => !v)} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
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

            <div className="mt-auto pt-6 border-t border-brand-border flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={closeMenu}
                    className="w-full text-center py-3 rounded-xl font-semibold border border-brand-border text-brand-text hover:bg-brand-surface-2 transition-all">
                    Dashboard
                  </Link>
                  <button onClick={() => { localStorage.removeItem('accessToken'); window.location.href = '/login'; }}
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
const WordRainPage = lazy(() => import('./pages/WordRainPage'));
const ZombieTypingPage = lazy(() => import('./pages/ZombieTypingPage'));
const SpeedRacerPage = lazy(() => import('./pages/SpeedRacerPage'));
const HindiTypingPage = lazy(() => import('./pages/HindiTypingPage'));
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

  // GA4 page view on every SPA route change.
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);

  const isLearningInterface =
    (location.pathname.startsWith('/learn/') && location.pathname !== '/learn' && location.pathname !== '/learn/') ||
    (location.pathname.startsWith('/tests/') && location.pathname !== '/tests' && location.pathname !== '/tests/' && !location.pathname.includes('/config/'));

  return (
    <div className={`min-h-screen flex flex-col font-sans bg-brand-bg transition-colors ${isLearningInterface ? 'h-screen overflow-hidden' : ''}`}>
      {!isLearningInterface && <Navbar />}
      <main className={`flex-grow ${isLearningInterface ? 'overflow-hidden' : ''}`}>
        <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Programmatic SEO Routes */}
          <Route path="/typing-test" element={<TypingTestPage />} />
          <Route path="/typing-test/:duration" element={<TypingTestPage />} />
          <Route path="/typing-test-for/:profession" element={<TypingTestPage />} />
          <Route path="/typing-test/language/:language" element={<TypingTestPage />} />
          
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Phase 2: Tools & Utilities */}
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/keyboard-tester" element={<KeyboardTesterPage />} />
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
          <Route path="/games/word-rain" element={<WordRainPage />} />
          <Route path="/games/zombie" element={<ZombieTypingPage />} />
          <Route path="/games/speed-racer" element={<SpeedRacerPage />} />
          <Route path="/hindi-typing-test" element={<HindiTypingPage />} />
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
          <Route path="/all-pages" element={<SiteMapPage />} />
        </Routes>
        </Suspense>
      </main>
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

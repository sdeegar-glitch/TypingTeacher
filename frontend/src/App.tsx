import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from './store/useThemeStore';
import TypingTestPage from './pages/TypingTestPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DashboardPage from './pages/DashboardPage';
import LearningCoursePage from './pages/LearningCoursePage';
import LearningInterfacePage from './pages/LearningInterfacePage';
import AuthPage from './pages/AuthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

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
  { to: '/tests',                  label: 'Tests' },
  { to: '/learn',                  label: 'Lessons' },
  { to: '/hindi-typing-test',      label: 'Hindi' },
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
            <span className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #304C53 0%, #2A9DAE 100%)' }}>
              F
            </span>
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



import HomePage from './pages/HomePage';
import TestsListPage from './pages/TestsListPage';
import TestConfigPage from './pages/TestConfigPage';
import ToolsPage from './pages/ToolsPage';
import KeyboardTesterPage from './pages/KeyboardTesterPage';
import SpacebarCounterPage from './pages/SpacebarCounterPage';
import CpsTestPage from './pages/CpsTestPage';
import ExamPage from './pages/ExamPage';
import CertificatePage from './pages/CertificatePage';
import WordCounterPage from './pages/WordCounterPage';
import TypingTestForPage from './pages/TypingTestForPage';
import MultiplayerPage from './pages/MultiplayerPage';
import CaseConverterPage from './pages/CaseConverterPage';
import CodingTypingPage from './pages/CodingTypingPage';
import GamesPage from './pages/GamesPage';
import WordRainPage from './pages/WordRainPage';
import ZombieTypingPage from './pages/ZombieTypingPage';
import SpeedRacerPage from './pages/SpeedRacerPage';
import HindiTypingPage from './pages/HindiTypingPage';
import KrutiDevPage from './pages/KrutiDevPage';
import CompetitiveExamTypingPage from './pages/CompetitiveExamTypingPage';
import LearnHindiTypingPage from './pages/LearnHindiTypingPage';
import TypingCertificatesPage from './pages/TypingCertificatesPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

const AppContent = () => {
  const location = useLocation();
  const isLearningInterface = 
    (location.pathname.startsWith('/learn/') && location.pathname !== '/learn' && location.pathname !== '/learn/') ||
    (location.pathname.startsWith('/tests/') && location.pathname !== '/tests' && location.pathname !== '/tests/' && !location.pathname.includes('/config/'));

  return (
    <div className={`min-h-screen flex flex-col font-sans bg-brand-bg transition-colors ${isLearningInterface ? 'h-screen overflow-hidden' : ''}`}>
      {!isLearningInterface && <Navbar />}
      <main className={`flex-grow ${isLearningInterface ? 'overflow-hidden' : ''}`}>
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
          <Route path="/kruti-dev-typing" element={<KrutiDevPage />} />
          <Route path="/learn-hindi-typing" element={<LearnHindiTypingPage />} />
          <Route path="/typing-certificates" element={<TypingCertificatesPage />} />
          <Route path="/competitive-exam-typing" element={<CompetitiveExamTypingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
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

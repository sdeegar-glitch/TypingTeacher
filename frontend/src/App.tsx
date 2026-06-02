import React, { useState } from 'react';
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

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const { isDark, toggleTheme } = useTheme();

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-brand-bg/80 backdrop-blur-xl border-b border-brand-muted/20 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link 
          to="/" 
          onClick={closeMenu}
          className="text-xl font-bold tracking-tight text-brand-text flex items-center gap-2 hover:opacity-80 transition-opacity z-50 relative"
        >
          <span className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-lg shadow-md shadow-brand-primary/20">
            T
          </span>
          TypingTeacher
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/learn" className="text-brand-muted hover:text-brand-primary transition-colors">Lessons</Link>
          <Link to="/tests" className="text-brand-muted hover:text-brand-primary transition-colors">Tests</Link>
          <Link to="/hindi-typing-test" className="text-brand-muted hover:text-brand-primary transition-colors">Hindi</Link>
          <Link to="/competitive-exam-typing" className="text-brand-muted hover:text-brand-primary transition-colors">Exams</Link>
          <Link to="/tools" className="text-brand-muted hover:text-brand-primary transition-colors">Tools</Link>
          <Link to="/games" className="text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1">
            <span>🎮</span> Games
          </Link>
          <Link to="/blog" className="text-brand-muted hover:text-brand-primary transition-colors">Blog</Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-brand-muted/20">
              <Link to="/dashboard" className="text-brand-muted hover:text-brand-primary transition-colors">Dashboard</Link>
              <button 
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  window.location.href = '/login';
                }}
                className="text-brand-muted hover:text-rose-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-4 border-l border-brand-muted/20">
              <Link 
                to="/login" 
                className="text-brand-muted hover:text-brand-text transition-colors"
              >
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="bg-brand-primary text-white hover:bg-brand-secondary px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Theme Toggle + Mobile Menu Toggle Button */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-surface-2 transition-all"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            className="md:hidden z-50 relative p-2 text-brand-text"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Overlay */}
        <div 
          className={`fixed inset-0 bg-brand-bg/95 backdrop-blur-md z-40 flex flex-col pt-24 px-6 md:hidden transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-6 text-xl font-medium">
            <Link to="/learn" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">Lessons</Link>
            <Link to="/tests" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">Tests</Link>
            <Link to="/hindi-typing-test" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">Hindi Typing</Link>
            <Link to="/competitive-exam-typing" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">Exam Prep</Link>
            <Link to="/games" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">🎮 Games</Link>
            <Link to="/tools" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">Tools</Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">Dashboard</Link>
                <button 
                  onClick={() => {
                    localStorage.removeItem('accessToken');
                    window.location.href = '/login';
                  }}
                  className="text-left text-rose-500 hover:text-rose-600 transition-colors py-2 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4 mt-4">
                <Link 
                  to="/login" 
                  onClick={closeMenu}
                  className="bg-brand-surface border border-brand-muted/20 text-brand-text text-center px-4 py-3 rounded-xl font-semibold transition-all"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  onClick={closeMenu}
                  className="bg-brand-primary text-white text-center px-4 py-3 rounded-xl font-semibold shadow-md shadow-brand-primary/20"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
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

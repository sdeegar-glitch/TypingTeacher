import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden z-50 relative p-2 text-brand-text"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation Overlay */}
        <div 
          className={`fixed inset-0 bg-brand-bg/95 backdrop-blur-md z-40 flex flex-col pt-24 px-6 md:hidden transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-6 text-xl font-medium">
            <Link to="/learn" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">Lessons</Link>
            <Link to="/tests" onClick={closeMenu} className="text-brand-text hover:text-brand-primary transition-colors py-2 border-b border-brand-muted/10">Tests</Link>

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

const AppContent = () => {
  const location = useLocation();
  const isLearningInterface = 
    (location.pathname.startsWith('/learn/') && location.pathname !== '/learn') ||
    (location.pathname.startsWith('/tests/') && location.pathname !== '/tests' && !location.pathname.includes('/config/'));

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
          <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminDashboardPage />} />
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

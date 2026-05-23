import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams, useLocation } from 'react-router-dom';
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

const Navbar = () => (
  <nav className="bg-brand-bg/80 backdrop-blur-xl border-b border-brand-muted/20 sticky top-0 z-50 transition-colors">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <Link 
        to="/" 
        className="text-xl font-bold tracking-tight text-brand-text flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-lg shadow-md shadow-brand-primary/20">
          T
        </span>
        TypingTeacher
      </Link>
      
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/learn" className="text-brand-muted hover:text-brand-primary transition-colors hidden sm:block">Lessons</Link>
        <Link to="/tests" className="text-brand-muted hover:text-brand-primary transition-colors hidden sm:block">Tests</Link>

        {localStorage.getItem('accessToken') ? (
          <div className="flex items-center gap-4 pl-4 sm:border-l border-brand-muted/20">
            <Link to="/dashboard" className="text-brand-muted hover:text-brand-primary transition-colors hidden sm:block">Dashboard</Link>
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
          <div className="flex items-center gap-4 pl-4 sm:border-l border-brand-muted/20">
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
    </div>
  </nav>
);



import HomePage from './pages/HomePage';
import TestsListPage from './pages/TestsListPage';
import TestConfigPage from './pages/TestConfigPage';

const AppContent = () => {
  const location = useLocation();
  const isLearningInterface = 
    (location.pathname.startsWith('/learn/') && location.pathname !== '/learn') ||
    (location.pathname.startsWith('/tests/') && location.pathname !== '/tests' && !location.pathname.includes('/config/')) ||
    location.pathname === '/tests';

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

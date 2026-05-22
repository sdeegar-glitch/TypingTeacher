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
  <nav className="bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-50 transition-colors">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <Link 
        to="/" 
        className="text-xl font-bold tracking-tight text-[#09090b] dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
          T
        </span>
        TypingTeacher
      </Link>
      
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/learn" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block">Lessons</Link>
        <Link to="/tests" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block">Tests</Link>

        {localStorage.getItem('accessToken') ? (
          <div className="flex items-center gap-4 pl-4 sm:border-l border-slate-200 dark:border-white/10">
            <Link to="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:block">Dashboard</Link>
            <button 
              onClick={() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 pl-4 sm:border-l border-slate-200 dark:border-white/10">
            <Link 
              to="/login" 
              className="text-slate-600 dark:text-slate-300 hover:text-[#09090b] dark:hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="bg-[#09090b] dark:bg-white text-white dark:text-[#09090b] hover:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-sm"
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
import TestConfigPage from './pages/TestConfigPage';

const AppContent = () => {
  const location = useLocation();
  const isLearningInterface = 
    (location.pathname.startsWith('/learn/') && location.pathname !== '/learn') ||
    (location.pathname.startsWith('/tests/') && location.pathname !== '/tests' && !location.pathname.includes('/config/')) ||
    location.pathname === '/tests';

  return (
    <div className={`min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 transition-colors ${isLearningInterface ? 'h-screen overflow-hidden' : ''}`}>
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
          <Route path="/tests" element={<TypingTestPage />} />
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

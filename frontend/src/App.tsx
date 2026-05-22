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
  <nav className="bg-indigo-600 text-white p-4 shadow-md shrink-0">
    <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
      <Link to="/" className="text-2xl font-bold tracking-wider">TypingTeacher</Link>
      <div className="flex flex-wrap justify-center gap-4">
        {localStorage.getItem('accessToken') ? (
          <>
            <Link to="/dashboard" className="hover:text-indigo-200 transition-colors">Dashboard</Link>
            <Link to="/leaderboard" className="hover:text-indigo-200 transition-colors">Leaderboard</Link>
            <button 
              onClick={() => {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded shadow transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded shadow transition-all">Login</Link>
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
          <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
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

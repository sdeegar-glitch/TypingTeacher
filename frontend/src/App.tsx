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
    <div className="container mx-auto flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold tracking-wider">TypingTeacher</Link>
      <div className="space-x-4">
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

const Home = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
    <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Master Your Typing Skills</h1>
    <p className="text-xl text-gray-600 mb-8 max-w-2xl">
      Improve your typing speed and accuracy with our engaging lessons, real-time feedback, and competitive leaderboards. Practice for SSC, RRB, and more.
    </p>
    <div className="flex space-x-4">
      <Link to="/learn" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg transition-transform transform hover:-translate-y-1">
        Start Learning
      </Link>
      <Link to="/login" className="bg-white hover:bg-gray-100 text-indigo-600 font-bold py-3 px-8 rounded-lg shadow-lg text-lg border border-indigo-100 transition-transform transform hover:-translate-y-1">
        Save Progress (Login)
      </Link>
    </div>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const isLearningInterface = 
    (location.pathname.startsWith('/learn/') && location.pathname !== '/learn') ||
    (location.pathname.startsWith('/tests/') && location.pathname !== '/tests') ||
    location.pathname === '/tests';

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isLearningInterface ? 'h-screen overflow-hidden' : ''}`}>
      {!isLearningInterface && <Navbar />}
      <main className={`flex-grow ${isLearningInterface ? 'overflow-hidden' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Programmatic SEO Routes */}
          <Route path="/typing-test" element={<TypingTestPage />} />
          <Route path="/typing-test/:duration" element={<TypingTestPage />} />
          <Route path="/typing-test-for/:profession" element={<TypingTestPage />} />
          <Route path="/typing-test/language/:language" element={<TypingTestPage />} />
          
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

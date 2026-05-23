import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const mockUser = {
  name: 'Alex Developer',
  email: 'alex@example.com',
  totalTests: 42,
  bestWpm: 120,
  averageAccuracy: 96.5,
  badges: [
    { id: 1, name: '100 WPM Club', icon: '🚀', description: 'Achieved a net speed over 100 WPM' },
    { id: 2, name: 'Sharpshooter', icon: '🎯', description: 'Completed a test with 100% accuracy' },
    { id: 3, name: 'Night Owl', icon: '🦉', description: 'Practiced after midnight' },
  ]
};


const DashboardPage = () => {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://typingteacher-2lnd.onrender.com/api/tests/latest')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTests(data);
      })
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* User Stats Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Welcome back, {mockUser.name}! 👋</h1>
            <p className="text-gray-500 text-sm sm:text-base">Ready to break your record of {mockUser.bestWpm} WPM?</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-2 md:mt-0">
            <div className="text-center bg-gray-50 md:bg-transparent rounded-lg p-3 md:p-0">
              <p className="text-3xl sm:text-4xl font-black text-indigo-600">{mockUser.totalTests}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Tests Taken</p>
            </div>
            <div className="text-center bg-gray-50 md:bg-transparent rounded-lg p-3 md:p-0">
              <p className="text-3xl sm:text-4xl font-black text-amber-500">{mockUser.bestWpm}</p>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Best WPM</p>
            </div>
            <div className="text-center bg-gray-50 md:bg-transparent rounded-lg p-3 md:p-0">
              <p className="text-3xl sm:text-4xl font-black text-green-500">{mockUser.averageAccuracy}%</p>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">Avg Accuracy</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Test List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Available Tests</h2>
              <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option>All Categories</option>
                <option>General</option>
                <option>SSC Exam</option>
                <option>RRB Exam</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => (
                <div key={test.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                        {test.category || 'General'}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        test.difficulty_level === 'easy' ? 'bg-green-50 text-green-700' :
                        test.difficulty_level === 'medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {test.difficulty_level || 'Medium'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{test.title}</h3>
                    <p className="text-gray-500 text-sm mb-6">⏱️ {test.estimated_read_time || Math.round(test.duration/60) || 5} min read</p>
                  </div>
                  <Link 
                    to={`/tests/config/${test.slug || test.id}`}
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Start Test
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Badges & Leaderboard Preview */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Your Badges</h2>
                <span className="text-sm font-medium text-indigo-600 cursor-pointer hover:underline">View All</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {mockUser.badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center group relative cursor-pointer">
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{badge.icon}</div>
                    <div className="text-xs text-center font-semibold text-gray-600">{badge.name}</div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10">
                      {badge.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600 p-6 rounded-xl shadow-md text-white text-center">
              <h3 className="text-lg font-bold mb-2">Compete Globally</h3>
              <p className="text-indigo-100 text-sm mb-4">See how you rank against typists worldwide.</p>
              <Link to="/leaderboard" className="inline-block bg-white text-indigo-600 font-bold py-2 px-6 rounded-full hover:bg-gray-50 transition-colors">
                View Leaderboard
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

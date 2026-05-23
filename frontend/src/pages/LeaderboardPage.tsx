import { useState, useEffect } from 'react';

// Mock data to simulate leaderboard before backend integration is fully hooked up
const mockLeaderboard = [
  { rank: 1, user: 'Alex', net_wpm: 120, accuracy: 98.5, date: '2024-05-12' },
  { rank: 2, user: 'Sarah', net_wpm: 115, accuracy: 99.1, date: '2024-05-11' },
  { rank: 3, user: 'JohnD', net_wpm: 105, accuracy: 96.0, date: '2024-05-10' },
  { rank: 4, user: 'Emily', net_wpm: 98, accuracy: 97.2, date: '2024-05-12' },
  { rank: 5, user: 'Michael', net_wpm: 92, accuracy: 94.5, date: '2024-05-09' },
];

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<'overall' | 'exam'>('overall');
  const [data, setData] = useState(mockLeaderboard);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://typingteacher-2lnd.onrender.com/leaderboard');
        const result = await response.json();
        if (response.ok) {
          // Use real data, even if empty
          setData(result);
        } else {
          console.error('Failed to fetch leaderboard', result);
        }
      } catch (err) {
        console.error('Error fetching leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [activeTab]);

  return (
    <div className="min-h-[80vh] bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Global Leaderboard</h1>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex space-x-1">
            <button
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-colors ${
                activeTab === 'overall' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overall')}
            >
              Overall Top Speeds
            </button>
            <button
              className={`px-6 py-2 rounded-md font-semibold text-sm transition-colors ${
                activeTab === 'exam' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('exam')}
            >
              Exam Specific (SSC/RRB)
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Net WPM
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {row.rank === 1 && <span className="text-2xl mr-2" title="1st Place">🏆</span>}
                        {row.rank === 2 && <span className="text-2xl mr-2" title="2nd Place">🥈</span>}
                        {row.rank === 3 && <span className="text-2xl mr-2" title="3rd Place">🥉</span>}
                        {row.rank > 3 && <span className="text-lg font-semibold text-gray-500 w-8 text-center inline-block">{row.rank}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{row.user}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full bg-indigo-100 text-indigo-800">
                        {row.net_wpm} WPM
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-700">
                      {row.accuracy}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;

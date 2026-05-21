import { useState, useEffect } from 'react';

// Mock data for Admin
const mockTests = [
  { id: 1, title: 'Standard English - 1 Min', exam_type_id: 1, duration: 60, difficulty: 'Easy' },
];

const mockUsers = [
  { id: 'uuid-1', email: 'alex@example.com', role: 'user', created_at: '2024-05-10' },
  { id: 'uuid-2', email: 'admin@typing.com', role: 'admin', created_at: '2024-01-01' },
];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'tests' | 'users'>('tests');
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  const [tests, setTests] = useState<any[]>(mockTests);
  const [newTest, setNewTest] = useState({ title: '', content: '', duration: 60, difficulty: 'Easy' });

  useEffect(() => {
    fetch('http://localhost:3000/tests')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) setTests(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleCreateTest = async () => {
    try {
      const res = await fetch('http://localhost:3000/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest)
      });
      if (res.ok) {
        const added = await res.json();
        setTests([...tests, added]);
        setShowAddTestModal(false);
      }
    } catch (e) {
      console.error('Failed to create test', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage tests, users, and platform settings.</p>
          </div>
          <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
            Admin Access Only
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-100 inline-flex mb-8">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Manage Tests
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Manage Users
          </button>
        </div>

        {/* Tab Content: Tests */}
        {activeTab === 'tests' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Test Library</h2>
              <button 
                onClick={() => setShowAddTestModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-sm transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Add New Test
              </button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{test.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.exam_type_id ? 'Exam' : 'General'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.duration}s</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        test.difficulty === 'Easy' ? 'bg-green-50 text-green-700' :
                        test.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {test.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">User Directory</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.created_at}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== 'admin' && (
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Make Admin</button>
                      )}
                      <button className="text-red-600 hover:text-red-900">Disable</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Test Modal (Simplified) */}
        {showAddTestModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Test</h3>
                <button onClick={() => setShowAddTestModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={newTest.title} onChange={e => setNewTest({...newTest, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. SSC CGL Tier 1 Practice" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passage Content</label>
                  <textarea rows={4} value={newTest.content} onChange={e => setNewTest({...newTest, content: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" placeholder="Type or paste the exact passage here..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Seconds)</label>
                    <input type="number" value={newTest.duration} onChange={e => setNewTest({...newTest, duration: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select value={newTest.difficulty} onChange={e => setNewTest({...newTest, difficulty: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddTestModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                  <button type="button" onClick={handleCreateTest} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium shadow-sm transition-colors">Save Test</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboardPage;

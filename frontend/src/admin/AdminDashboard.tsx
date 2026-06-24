import { useState, useEffect } from 'react';
import { Bell, Search, User } from 'lucide-react';
import type { SidebarPage } from './types';
import AdminSidebar from './Sidebar';
import AdminLogin from './AdminLogin';
import OverviewPage from './pages/OverviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage';
import TestsPage from './pages/TestsPage';
import CategoriesPage from './pages/CategoriesPage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import SEOPage from './pages/SEOPage';
import SecurityPage from './pages/SecurityPage';
import SettingsPage from './pages/SettingsPage';
import LogsPage from './pages/LogsPage';


const PAGE_LABELS: Record<SidebarPage, string> = {
  overview:       'Dashboard Overview',
  analytics:      'Analytics',
  users:          'Users Management',
  tests:          'Typing Tests',
  categories:     'Categories',
  'ai-generator': 'AI Content Generator',
  seo:            'SEO Manager',
  notifications:  'Notifications',
  logs:           'Reports & Logs',
  security:       'Security Center',
  settings:       'Settings',
};

function NotificationsPanel() {
  const NOTIFS = [
    { id: 1, text: '2 new AI-generated tests ready to publish', time: '5m ago', type: 'info' },
    { id: 2, text: 'Failed login attempt from 192.168.1.1', time: '3h ago', type: 'warning' },
    { id: 3, text: 'User #482 banned for suspicious activity', time: '1d ago', type: 'error' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">{NOTIFS.length} unread notifications</p>
      </div>
      <div className="space-y-3">
        {NOTIFS.map(n => (
          <div key={n.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${n.type === 'info' ? 'bg-indigo-500/10 border-indigo-500/20' : n.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'info' ? 'bg-indigo-400' : n.type === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
            <div>
              <p className="text-sm text-white">{n.text}</p>
              <p className="text-xs text-slate-500 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const API = import.meta.env.VITE_API_URL || 'https://typingteacher-2lnd.onrender.com';

type SessionState = 'checking' | 'loggedOut' | 'loggedIn';

export default function AdminDashboard() {
  const [session, setSession] = useState<SessionState>('checking');
  const [adminUser, setAdminUser] = useState<{ email: string; name: string | null } | null>(null);
  const [activePage, setActivePage] = useState<SidebarPage>('overview');
  const [notifOpen, setNotifOpen] = useState(false);

  const verifySession = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { setSession('loggedOut'); return; }
    fetch(`${API}/api/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(me => { setAdminUser(me); setSession('loggedIn'); })
      .catch(() => { localStorage.removeItem('adminToken'); setSession('loggedOut'); });
  };

  useEffect(() => { verifySession(); }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdminUser(null);
    setSession('loggedOut');
  };

  if (session === 'checking') {
    return <div className="min-h-screen bg-[#0a0b0f]" />;
  }

  if (session === 'loggedOut') {
    return <AdminLogin onLogin={verifySession} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':      return <OverviewPage />;
      case 'analytics':     return <AnalyticsPage />;
      case 'users':         return <UsersPage />;
      case 'tests':         return <TestsPage />;
      case 'categories':    return <CategoriesPage />;
      case 'ai-generator':  return <AIGeneratorPage />;
      case 'seo':           return <SEOPage />;
      case 'notifications': return <NotificationsPanel />;
      case 'logs':          return <LogsPage />;
      case 'security':      return <SecurityPage />;
      case 'settings':      return <SettingsPage />;
      default:              return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex">
      <AdminSidebar activePage={activePage} onNavigate={setActivePage} onLogout={logout} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="shrink-0 bg-[#0f1117] border-b border-white/5 px-6 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{PAGE_LABELS[activePage]}</h2>
            <p className="text-xs text-slate-500 hidden sm:block">fasttypinglab.com · Admin Panel</p>
          </div>

          {/* Search */}
          <div className="hidden md:flex relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              placeholder="Quick search..."
              className="pl-8 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 w-48"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 bg-white/5 px-1 rounded">⌘K</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center">
                <User size={12} className="text-indigo-400" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white">{adminUser?.name || adminUser?.email || 'Admin'}</div>
                <div className="text-[10px] text-slate-500">{adminUser?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Bell, Search, User } from 'lucide-react';
import type { SidebarPage, ActivityLog } from './types';
import { fetchAdminLogs } from './api';
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

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationsPanel() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminLogs().then(all => setLogs(all.slice(0, 15))).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const typeFor = (status: string) => status === 'success' ? 'info' : status === 'warning' ? 'warning' : 'error';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">{loading ? 'Loading…' : `${logs.length} recent events`}</p>
      </div>
      <div className="space-y-3">
        {!loading && logs.length === 0 && <p className="text-sm text-slate-500">No activity recorded yet.</p>}
        {logs.map(log => {
          const type = typeFor(log.status);
          return (
            <div key={log.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${type === 'info' ? 'bg-indigo-500/10 border-indigo-500/20' : type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${type === 'info' ? 'bg-indigo-400' : type === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
              <div>
                <p className="text-sm text-white">{log.action.replace(/_/g, ' ')}{log.actor_email ? ` — ${log.actor_email}` : ''}</p>
                <p className="text-xs text-slate-500 mt-1">{relativeTime(log.created_at)}</p>
              </div>
            </div>
          );
        })}
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
  const [userCount, setUserCount] = useState<number | undefined>(undefined);
  const [recentLogCount, setRecentLogCount] = useState<number | undefined>(undefined);

  const verifySession = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { setSession('loggedOut'); return; }
    fetch(`${API}/api/admin/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(me => { setAdminUser(me); setSession('loggedIn'); })
      .catch(() => { localStorage.removeItem('adminToken'); setSession('loggedOut'); });
  };

  useEffect(() => { verifySession(); }, []);

  useEffect(() => {
    if (session !== 'loggedIn') return;
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API}/api/admin/stats`, { headers }).then(r => r.ok ? r.json() : null).then(j => j && setUserCount(j.stats?.totalUsers)).catch(() => {});
    fetch(`${API}/api/admin/logs`, { headers }).then(r => r.ok ? r.json() : null).then(logs => {
      if (!Array.isArray(logs)) return;
      const dayAgo = Date.now() - 86400000;
      setRecentLogCount(logs.filter((l: { created_at: string }) => new Date(l.created_at).getTime() >= dayAgo).length);
    }).catch(() => {});
  }, [session]);

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
      <AdminSidebar activePage={activePage} onNavigate={setActivePage} onLogout={logout} userCount={userCount} notificationCount={recentLogCount} />

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

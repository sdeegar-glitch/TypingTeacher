import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Eye, Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { DashboardStats, AnalyticsPoint, ActivityLog } from '../types';
import { fetchDashboardStats, generateAnalyticsData, MOCK_ACTIVITY_LOGS } from '../api';

const STAT_CARDS = [
  { label: 'Total Users',   key: 'totalUsers',   icon: <Users size={20} />,    color: 'indigo', trend: '+12.4%', up: true },
  { label: 'Active Today',  key: 'activeUsers',  icon: <Activity size={20} />, color: 'emerald', trend: '+5.1%',  up: true },
  { label: 'Typing Tests',  key: 'totalTests',   icon: <FileText size={20} />, color: 'violet', trend: '+3 today', up: true },
  { label: 'Total Views',   key: 'totalViews',   icon: <Eye size={20} />,      color: 'cyan',   trend: '+18.2%', up: true },
  { label: 'Avg WPM',       key: 'avgWpm',       icon: <Zap size={20} />,      color: 'amber',  trend: '+2 wpm', up: true },
  { label: 'Tests Today',   key: 'testsToday',   icon: <FileText size={20} />, color: 'rose',   trend: '-2',     up: false },
];

const COLOR_MAP: Record<string, string> = {
  indigo:  'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
  violet:  'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400',
  cyan:    'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
  amber:   'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
  rose:    'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
};

const PIE_DATA = [
  { name: 'Easy',   value: 35, color: '#10B981' },
  { name: 'Medium', value: 45, color: '#6366F1' },
  { name: 'Hard',   value: 20, color: '#EF4444' },
];

const DEVICE_DATA = [
  { name: 'Desktop', value: 62 },
  { name: 'Mobile',  value: 30 },
  { name: 'Tablet',  value: 8 },
];

function StatCard({ label, value, icon, color, trend, up }: { label: string; value: number; icon: React.ReactNode; color: string; trend: string; up: boolean }) {
  const cls = COLOR_MAP[color] || COLOR_MAP.indigo;
  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <span className={`p-2 rounded-xl bg-white/5`}>{icon}</span>
      </div>
      <div className="text-3xl font-black text-white">{value.toLocaleString()}</div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend} vs last 7d
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<AnalyticsPoint[]>([]);
  const [logs] = useState<ActivityLog[]>(MOCK_ACTIVITY_LOGS);

  useEffect(() => {
    fetchDashboardStats().then(setStats);
    setChartData(generateAnalyticsData(14));
  }, []);

  if (!stats) return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back. Here's what's happening with FastTypingLab today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {STAT_CARDS.map(card => (
          <StatCard
            key={card.key}
            label={card.label}
            value={(stats as any)[card.key]}
            icon={card.icon}
            color={card.color}
            trend={card.trend}
            up={card.up}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold">Visitor Traffic</h3>
              <p className="text-slate-400 text-xs">Last 14 days</p>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full font-semibold">Daily</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-1">Test Difficulty</h3>
          <p className="text-slate-400 text-xs mb-4">Distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {PIE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-300">{d.name}</span>
                </div>
                <span className="text-white font-bold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* WPM Bar Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-1">Avg WPM by Device</h3>
          <p className="text-slate-400 text-xs mb-4">Performance breakdown</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={DEVICE_DATA}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">Live Activity Feed</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.user} · {formatTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

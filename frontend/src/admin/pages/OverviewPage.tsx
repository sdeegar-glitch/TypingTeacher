import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, Eye, Zap, Activity } from 'lucide-react';
import type { DashboardStats, AnalyticsPoint, ActivityLog } from '../types';
import { fetchOverview, fetchAdminLogs } from '../api';

const STAT_CARDS = [
  { label: 'Total Users',   key: 'totalUsers',   icon: <Users size={20} />,    color: 'indigo' },
  { label: 'Active (7d)',   key: 'activeUsers',  icon: <Activity size={20} />, color: 'emerald' },
  { label: 'Typing Tests',  key: 'totalTests',   icon: <FileText size={20} />, color: 'violet' },
  { label: 'Total Views',   key: 'totalViews',   icon: <Eye size={20} />,      color: 'cyan' },
  { label: 'Avg WPM (7d)',  key: 'avgWpm',       icon: <Zap size={20} />,      color: 'amber' },
  { label: 'Tests Today',   key: 'testsToday',   icon: <FileText size={20} />, color: 'rose' },
];

const COLOR_MAP: Record<string, string> = {
  indigo:  'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
  violet:  'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400',
  cyan:    'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
  amber:   'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
  rose:    'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
};

const DIFF_COLORS: Record<string, string> = { easy: '#10B981', medium: '#6366F1', hard: '#EF4444' };

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const cls = COLOR_MAP[color] || COLOR_MAP.indigo;
  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <span className={`p-2 rounded-xl bg-white/5`}>{icon}</span>
      </div>
      <div className="text-3xl font-black text-white">{value.toLocaleString()}</div>
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
  const [diffDist, setDiffDist] = useState({ easy: 0, medium: 0, hard: 0 });
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchOverview().then(({ stats, chartData, difficultyDistribution }) => {
      setStats(stats);
      setChartData(chartData);
      setDiffDist(difficultyDistribution);
    }).catch(() => {});
    fetchAdminLogs().then(all => setLogs(all.slice(0, 8))).catch(() => {});
  }, []);

  if (!stats) return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}
      </div>
    </div>
  );

  const pieData = [
    { name: 'Easy', value: diffDist.easy, color: DIFF_COLORS.easy },
    { name: 'Medium', value: diffDist.medium, color: DIFF_COLORS.medium },
    { name: 'Hard', value: diffDist.hard, color: DIFF_COLORS.hard },
  ];

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
            value={stats[card.key as keyof DashboardStats]}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold">Typing Tests Started</h3>
              <p className="text-slate-400 text-xs">Last 14 days · real test_sessions data</p>
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
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-1">Test Difficulty</h3>
          <p className="text-slate-400 text-xs mb-4">Distribution across all tests</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-300">{d.name}</span>
                </div>
                <span className="text-white font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed (real — activity_log table) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4">Live Activity Feed</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {logs.length === 0 && <p className="text-sm text-slate-500">No activity recorded yet.</p>}
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{log.action.replace(/_/g, ' ')}</p>
                <p className="text-xs text-slate-500">{log.actor_email || 'system'} · {formatTime(log.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

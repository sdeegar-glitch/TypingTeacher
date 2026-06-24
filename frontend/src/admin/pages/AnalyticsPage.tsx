import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { AdminAnalytics } from '../types';
import { fetchAdminAnalytics } from '../api';

const chartStyle = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="text-white font-bold">{title}</h3>
        {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    fetchAdminAnalytics().then(setData).catch(() => {});
  }, []);

  if (!data) return (
    <div className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)}
      </div>
    </div>
  );

  const { summary, dailySessionsChart, dailyWpmChart, sessionsByMode, accuracyDistribution } = data;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Real typing activity over the last 30 days</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total Sessions (30d)', value: summary.totalSessions.toLocaleString() },
          { label: 'Avg. Session Duration', value: `${summary.avgDurationSec}s` },
          { label: 'Avg. Accuracy', value: `${summary.avgAccuracy}%` },
          { label: 'New Users (30d)', value: summary.newUsers30d.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex-1 min-w-40">
            <div className="text-xs text-slate-400 font-semibold mb-1">{s.label}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Daily Test Sessions" subtitle="Last 30 days · real test_sessions data">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailySessionsChart}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartStyle} />
              <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average WPM Trend" subtitle="Platform-wide typing speed">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyWpmChart}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...chartStyle} />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sessions by Mode" subtitle="How tests were taken">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionsByMode} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...chartStyle} />
              <Bar dataKey="value" fill="#6366F1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Accuracy Distribution" subtitle="Across all sessions in range">
          <div className="space-y-3 pt-2">
            {accuracyDistribution.map(d => {
              const max = Math.max(1, ...accuracyDistribution.map(x => x.value));
              return (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-300 w-20 shrink-0">{d.name}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(d.value / max) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white font-semibold w-8 text-right">{d.value}</span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

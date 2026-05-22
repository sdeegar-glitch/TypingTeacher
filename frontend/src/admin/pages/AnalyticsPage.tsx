import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { generateAnalyticsData } from '../api';

const usersData = generateAnalyticsData(30);
const wpmData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: Math.floor(Math.random() * 30) + 55 };
});

const traficSources = [
  { name: 'Organic', value: 55 },
  { name: 'Direct',  value: 20 },
  { name: 'Social',  value: 15 },
  { name: 'Referral',value: 10 },
];

const countries = [
  { flag: '🇮🇳', name: 'India', users: 680, pct: 55 },
  { flag: '🇺🇸', name: 'United States', users: 185, pct: 15 },
  { flag: '🇧🇩', name: 'Bangladesh', users: 98, pct: 8 },
  { flag: '🇵🇰', name: 'Pakistan', users: 74, pct: 6 },
  { flag: '🇬🇧', name: 'United Kingdom', users: 49, pct: 4 },
];

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
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Platform performance over the last 30 days</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total Sessions', value: '18,240', change: '+22%', up: true },
          { label: 'Avg. Session Duration', value: '4m 32s', change: '+8%', up: true },
          { label: 'Bounce Rate', value: '34.2%', change: '-6%', up: true },
          { label: 'New Users (30d)', value: '2,150', change: '+31%', up: true },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex-1 min-w-40">
            <div className="text-xs text-slate-400 font-semibold mb-1">{s.label}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className={`text-xs font-semibold mt-1 ${s.up ? 'text-emerald-400' : 'text-rose-400'}`}>{s.change} vs prev</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Daily Active Users" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={usersData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartStyle} />
              <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average WPM Trend" subtitle="Platform-wide typing speed">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={wpmData}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartStyle} />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Traffic Sources" subtitle="Session origin breakdown">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={traficSources} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip {...chartStyle} />
              <Bar dataKey="value" fill="#6366F1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Countries" subtitle="By user count">
          <div className="space-y-3">
            {countries.map(c => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-white font-semibold">{c.users}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{c.pct}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

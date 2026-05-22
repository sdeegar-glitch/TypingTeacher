import { useState } from 'react';
import { Globe, Key, Bell, Palette, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'FastTypingLab',
    tagline: 'Master Typing. Elevate Your Speed.',
    siteUrl: 'https://fasttypinglab.com',
    supportEmail: 'support@fasttypinglab.com',
    geminiApiKey: '••••••••••••••••',
    geminiModel: 'gemini-1.5-flash',
    articlesPerDay: '2',
    cronSchedule: '0 0,12 * * *',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    theme: 'dark',
    primaryColor: '#6366F1',
    maintenanceMode: false,
    analyticsId: '',
    twitterUrl: 'https://twitter.com/fasttypinglab',
    githubUrl: '',
  });

  const set = (key: string, val: string | boolean) => setSettings(prev => ({ ...prev, [key]: val }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <span className="text-indigo-400">{icon}</span>
        <h3 className="text-white font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) => (
    <div>
      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
      {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
    </div>
  );

  const Input = ({ value, onChange, type = 'text', placeholder = '' }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
    />
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure your platform</p>
        </div>
        <button onClick={save} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save All</>}
        </button>
      </div>

      {/* Maintenance Banner */}
      {settings.maintenanceMode && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-rose-400 text-sm font-semibold">
          ⚠️ Maintenance mode is ACTIVE — site is hidden from public users
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Section icon={<Globe size={16} />} title="General">
          <Field label="Site Name">
            <Input value={settings.siteName} onChange={v => set('siteName', v)} />
          </Field>
          <Field label="Tagline">
            <Input value={settings.tagline} onChange={v => set('tagline', v)} />
          </Field>
          <Field label="Site URL">
            <Input value={settings.siteUrl} onChange={v => set('siteUrl', v)} />
          </Field>
          <Field label="Support Email">
            <Input value={settings.supportEmail} onChange={v => set('supportEmail', v)} type="email" />
          </Field>
          <Field label="Maintenance Mode">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('maintenanceMode', !settings.maintenanceMode)}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-slate-300">{settings.maintenanceMode ? 'Site offline' : 'Site online'}</span>
            </label>
          </Field>
        </Section>

        <Section icon={<Key size={16} />} title="AI & API Keys">
          <Field label="Gemini API Key" note="Used for automatic content generation">
            <Input value={settings.geminiApiKey} onChange={v => set('geminiApiKey', v)} type="password" />
          </Field>
          <Field label="Gemini Model">
            <select value={settings.geminiModel} onChange={e => set('geminiModel', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
              <option value="gemini-1.5-flash">gemini-1.5-flash (Fast)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Advanced)</option>
            </select>
          </Field>
          <Field label="Articles Per Day">
            <Input value={settings.articlesPerDay} onChange={v => set('articlesPerDay', v)} type="number" />
          </Field>
          <Field label="Cron Schedule" note="Unix cron format — 0 0,12 * * * = midnight and noon">
            <Input value={settings.cronSchedule} onChange={v => set('cronSchedule', v)} placeholder="0 0,12 * * *" />
          </Field>
          <Field label="Google Analytics ID">
            <Input value={settings.analyticsId} onChange={v => set('analyticsId', v)} placeholder="G-XXXXXXXXXX" />
          </Field>
        </Section>

        <Section icon={<Bell size={16} />} title="Email / SMTP">
          <div className="grid grid-cols-2 gap-4">
            <Field label="SMTP Host">
              <Input value={settings.smtpHost} onChange={v => set('smtpHost', v)} />
            </Field>
            <Field label="SMTP Port">
              <Input value={settings.smtpPort} onChange={v => set('smtpPort', v)} />
            </Field>
          </div>
          <Field label="SMTP Username">
            <Input value={settings.smtpUser} onChange={v => set('smtpUser', v)} placeholder="your@gmail.com" />
          </Field>
          <Field label="SMTP Password">
            <Input value={settings.smtpPass} onChange={v => set('smtpPass', v)} type="password" placeholder="app password" />
          </Field>
          <button className="text-sm bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-4 py-2 rounded-xl transition-colors">
            Test Email Connection
          </button>
        </Section>

        <Section icon={<Palette size={16} />} title="Appearance & Social">
          <Field label="Theme">
            <select value={settings.theme} onChange={e => set('theme', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none">
              <option value="dark">Dark (Default)</option>
              <option value="light">Light</option>
            </select>
          </Field>
          <Field label="Primary Accent Color">
            <div className="flex items-center gap-3">
              <input type="color" value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border border-white/10 bg-transparent" />
              <span className="text-sm text-slate-400 font-mono">{settings.primaryColor}</span>
            </div>
          </Field>
          <Field label="Twitter / X URL">
            <Input value={settings.twitterUrl} onChange={v => set('twitterUrl', v)} placeholder="https://twitter.com/..." />
          </Field>
          <Field label="GitHub URL">
            <Input value={settings.githubUrl} onChange={v => set('githubUrl', v)} placeholder="https://github.com/..." />
          </Field>
        </Section>
      </div>
    </div>
  );
}

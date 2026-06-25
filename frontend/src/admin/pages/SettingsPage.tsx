import { useEffect, useState } from 'react';
import { Globe, Key, Save, CheckCircle, Lock, Keyboard } from 'lucide-react';
import type { AppSettings } from '../types';
import { fetchAppSettings, updateAppSettings } from '../api';

const DEFAULTS: AppSettings = {
  siteName: '', tagline: '', siteUrl: '', supportEmail: '',
  maintenanceMode: false, twitterUrl: '', githubUrl: '',
  mistakeHandling: 'lenient',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchAppSettings().then(s => setSettings({ ...DEFAULTS, ...s })).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => setSettings(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true);
    const ok = await updateAppSettings(settings);
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
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

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Real, persisted platform configuration</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> {saving ? 'Saving…' : 'Save All'}</>}
        </button>
      </div>

      {settings.maintenanceMode && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 flex items-center gap-2 text-rose-400 text-sm font-semibold">
          ⚠️ Maintenance mode is ON (this flag is saved, but no page currently checks it to actually hide the site)
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
          <Field label="Twitter / X URL">
            <Input value={settings.twitterUrl} onChange={v => set('twitterUrl', v)} placeholder="https://twitter.com/..." />
          </Field>
          <Field label="GitHub URL">
            <Input value={settings.githubUrl} onChange={v => set('githubUrl', v)} placeholder="https://github.com/..." />
          </Field>
        </Section>

        <Section icon={<Keyboard size={16} />} title="Typing Behavior">
          <Field label="Mistake Handling" note="Lenient: keep typing past errors, they're just marked red. Strict: a wrong keystroke is rejected — the user must correct it before continuing. Applies site-wide on the public typing test page.">
            <div className="grid grid-cols-2 gap-2">
              {(['lenient', 'strict'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => set('mistakeHandling', mode)}
                  className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors border ${
                    settings.mistakeHandling === mode
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-500/40'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        <Section icon={<Key size={16} />} title="Secrets & API Keys">
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
            <Lock size={16} className="shrink-0 mt-0.5" />
            <p>These are environment variables on the Render backend (<code className="text-amber-200">GEMINI_API_KEY</code>, <code className="text-amber-200">GROQ_API_KEY</code>, <code className="text-amber-200">SUPABASE_SERVICE_KEY</code>), not editable here. Storing live secrets behind a settings-page UI is a different risk tier than the rest of this form — change them in Render's dashboard instead.</p>
          </div>
          <Field label="Rewrite Model" note="Set in backend/generation/groqClient.js">
            <input disabled value="Groq openai/gpt-oss-120b (source/dedup stay on Gemini 2.5 Flash + embeddings)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
          </Field>
          <Field label="Generation Schedule" note="Set in backend/cronService.js">
            <input disabled value="3:00 AM IST · 12 tests/day (4 EN + 4 HI/Mangal + 4 HI/Kruti)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
          </Field>
        </Section>
      </div>
    </div>
  );
}

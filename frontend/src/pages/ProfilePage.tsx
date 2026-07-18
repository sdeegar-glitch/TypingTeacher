import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Loader2, Check, Award, Mail, Phone, User, Calendar, ChevronLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import Seo from '../components/Seo';
import { isLoggedIn } from '../lib/auth';
import { fetchMe, updateMe, uploadAvatar, fetchMyCertificates, type MeProfile, type MyCertificate } from '../lib/user';

/** Downscale an image file to a small JPEG data URL so uploads stay tiny. */
function fileToCompressedDataUrl(file: File, max = 512, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

function initials(name: string | null, email: string): string {
  const src = (name || email || '?').trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [certs, setCerts] = useState<MyCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'My Profile | FastTypingLab';
    if (!isLoggedIn()) { navigate('/login'); return; }
    (async () => {
      const [me, myCerts] = await Promise.all([fetchMe(), fetchMyCertificates()]);
      if (!me) { navigate('/login'); return; }
      setProfile(me);
      setName(me.name || '');
      setPhone(me.phone || '');
      setCerts(myCerts);
      setLoading(false);
    })();
  }, [navigate]);

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const updated = await updateMe({ name, phone });
      setProfile(p => (p ? { ...p, name: updated.name, phone: updated.phone } : p));
      // Refresh the cached name/avatar the navbar reads.
      localStorage.setItem('ftl_user_name', updated.name || '');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true); setError('');
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      const url = await uploadAvatar(dataUrl);
      setProfile(p => (p ? { ...p, avatar_url: url } : p));
      localStorage.setItem('ftl_user_avatar', url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl text-brand-text text-sm placeholder:text-brand-muted outline-none transition-all duration-200 border bg-brand-surface-2 border-brand-border focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15';

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
      </div>
    );
  }
  if (!profile) return null;

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-6 px-4 sm:px-6">
      <Seo title="My Profile | FastTypingLab" description="Manage your FastTypingLab profile." noindex />
      <div className="container mx-auto max-w-3xl">

        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Dashboard
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>

        {error && (
          <div className="mb-4 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">{error}</div>
        )}

        {/* ── Profile card ── */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-black shadow-lg"
                style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : initials(profile.name, profile.email)}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                aria-label="Change photo"
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white flex items-center justify-center shadow-md transition-all disabled:opacity-60">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onPickAvatar} />
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="text-xl font-black text-brand-text">{profile.name || 'Your Name'}</div>
              <div className="text-sm text-brand-muted flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {profile.email}
              </div>
              {memberSince && (
                <div className="text-xs text-brand-muted flex items-center gap-1.5 justify-center sm:justify-start mt-1">
                  <Calendar className="w-3.5 h-3.5" /> Member since {memberSince}
                </div>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="text-xs font-semibold text-brand-muted mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-muted mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Mobile Number</label>
              <input className={inputCls} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 98765 43210" />
              <p className="text-[11px] text-brand-muted mt-1.5">📲 For free typing tips & exam reminders on WhatsApp.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button onClick={save} disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 shadow-md shadow-brand-primary/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Certificates ── */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
          <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-accent" /> My Certificates
            <span className="text-xs font-semibold text-brand-muted">({certs.length})</span>
          </h2>

          {certs.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-8 h-8 text-brand-muted mx-auto mb-3" />
              <p className="text-brand-text-muted text-sm">No certificates yet.</p>
              <Link to="/tests" className="mt-2 inline-block text-sm font-semibold text-brand-primary hover:underline">
                Take a test to earn one →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {certs.map(c => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="border border-brand-border rounded-xl p-4 bg-brand-surface-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-brand-text truncate">{c.test_title}</div>
                      <div className="text-xs text-brand-muted mt-0.5">
                        {c.issued_at || c.created_at
                          ? new Date(c.issued_at || c.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : ''}
                      </div>
                    </div>
                    {c.is_valid && <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div><span className="font-black font-mono text-brand-primary">{c.wpm}</span> <span className="text-[10px] text-brand-muted uppercase">WPM</span></div>
                    <div><span className="font-black font-mono text-brand-accent">{c.accuracy}%</span> <span className="text-[10px] text-brand-muted uppercase">Acc</span></div>
                  </div>
                  <Link to={`/certificate?verify=${c.id}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline">
                    View / Share <ExternalLink className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

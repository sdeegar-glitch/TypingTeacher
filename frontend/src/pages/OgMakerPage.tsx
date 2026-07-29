import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import Seo from '../components/Seo';

// Pure inline hex styles inside every captured card — Tailwind v4's oklch colors
// break html2canvas, so these avoid brand-token classes entirely.
const GRAD = 'linear-gradient(135deg, #304C53 0%, #2A9DAE 100%)';

function Logo({ size = 64, radius = 16 }: { size?: number; radius?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: '#ffffff', color: '#304C53', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.6, fontWeight: 900, fontFamily: 'Georgia, serif' }}>F</div>
  );
}

export default function OgMakerPage() {
  const ogRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState('');

  useEffect(() => { document.title = 'Social Image Maker | FastTypingLab'; }, []);

  const capture = async (ref: React.RefObject<HTMLDivElement | null>, file: string, w: number, h: number) => {
    if (!ref.current) return;
    setBusy(file);
    try {
      const canvas = await html2canvas(ref.current, { width: w, height: h, scale: 1, backgroundColor: '#304C53', useCORS: true });
      const link = document.createElement('a');
      link.download = file;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setBusy('');
    }
  };

  const btn = (label: string, file: string, ref: React.RefObject<HTMLDivElement | null>, w: number, h: number) => (
    <button onClick={() => capture(ref, file, w, h)} disabled={!!busy}
      className="text-sm font-bold text-white px-5 py-2.5 rounded-xl disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
      {busy === file ? 'Rendering…' : `⬇ ${label}`}
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 flex flex-col items-center gap-8">
      <Seo title="Social Image Maker | FastTypingLab" description="Internal social image generator." noindex />

      <div className="max-w-2xl text-center">
        <h1 className="text-2xl font-black mb-2">Social Image Maker</h1>
        <p className="text-brand-text-muted text-sm">
          Click a download button under each image. Save the OG image as
          <code className="bg-brand-surface-2 px-1 rounded"> og-image.png </code> in
          <code className="bg-brand-surface-2 px-1 rounded"> frontend/public/</code>; upload the Facebook ones directly to your Page.
          Best rendered in Chrome.
        </p>
      </div>

      {/* ── OG IMAGE 1200×630 ── */}
      <section className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-3">
          <h2 className="font-bold">OG / Share image — 1200×630</h2>
          {btn('og-image.png', 'og-image.png', ogRef, 1200, 630)}
        </div>
        <div className="w-full overflow-auto border border-brand-border rounded-2xl">
          <div ref={ogRef} style={{ width: 1200, height: 630, position: 'relative', overflow: 'hidden', background: GRAD, color: '#fff', fontFamily: 'Inter, Arial, sans-serif', padding: '72px 80px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', top: -140, right: -120, width: 420, height: 420, borderRadius: '50%', background: 'rgba(175,224,231,0.15)' }} />
            <div style={{ position: 'absolute', bottom: -180, left: -100, width: 360, height: 360, borderRadius: '50%', background: 'rgba(188,108,80,0.18)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
              <Logo size={64} /><div style={{ fontSize: 34, fontWeight: 800 }}>FastTypingLab</div>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1px' }}>Free Typing<br />Speed Test</div>
              <div style={{ fontSize: 30, marginTop: 22, color: 'rgba(255,255,255,0.9)', fontWeight: 500, maxWidth: 900 }}>English &amp; Hindi (Kruti Dev / Mangal) · SSC · CPCT · UPSSSC exam practice · live WPM &amp; accuracy</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                {['⚡ Live WPM', '🎯 Accuracy', '🏆 Certificate', '🤖 AI Tutor'].map(t => (
                  <div key={t} style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999, padding: '10px 20px', fontSize: 22, fontWeight: 700 }}>{t}</div>
                ))}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, opacity: 0.95 }}>fasttypinglab.com</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACEBOOK PROFILE 500×500 (shows as a circle — keep content centred) ── */}
      <section className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-bold">Facebook profile — 500×500</h2>
          {btn('fb-profile.png', 'fb-profile.png', profileRef, 500, 500)}
        </div>
        <div className="border border-brand-border rounded-2xl overflow-hidden">
          <div ref={profileRef} style={{ width: 500, height: 500, background: GRAD, color: '#fff', fontFamily: 'Inter, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center' }}>
            <div style={{ width: 150, height: 150, borderRadius: 34, background: '#fff', color: '#304C53', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 900, fontFamily: 'Georgia, serif', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>F</div>
            <div>
              <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>FastTypingLab</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 6 }}>⌨️ Free Typing Test</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FACEBOOK COVER 851×315 (keep text centred — edges/bottom-left get cropped) ── */}
      <section className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-3">
          <h2 className="font-bold">Facebook cover — 851×315</h2>
          {btn('fb-cover.png', 'fb-cover.png', coverRef, 851, 315)}
        </div>
        <div className="w-full overflow-auto border border-brand-border rounded-2xl">
          <div ref={coverRef} style={{ width: 851, height: 315, position: 'relative', overflow: 'hidden', background: GRAD, color: '#fff', fontFamily: 'Inter, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 60px', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: -100, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(175,224,231,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, position: 'relative' }}>
              <Logo size={44} radius={12} /><div style={{ fontSize: 28, fontWeight: 800 }}>FastTypingLab</div>
            </div>
            <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.05, position: 'relative' }}>Free Typing Speed Test</div>
            <div style={{ fontSize: 21, fontWeight: 500, color: 'rgba(255,255,255,0.9)', marginTop: 10, position: 'relative' }}>English &amp; Hindi · SSC · CPCT · UPSSSC exam practice · WPM &amp; accuracy</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 12, position: 'relative' }}>fasttypinglab.com</div>
          </div>
        </div>
      </section>
    </div>
  );
}

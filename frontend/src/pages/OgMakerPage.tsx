import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import Seo from '../components/Seo';

// Pure inline hex styles inside the captured card — Tailwind v4's oklch colors
// break html2canvas, so the OG card avoids brand-token classes entirely.
export default function OgMakerPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = 'OG Image Maker | FastTypingLab'; }, []);

  const download = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, { width: 1200, height: 630, scale: 1, backgroundColor: '#304C53', useCORS: true });
      const link = document.createElement('a');
      link.download = 'og-image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 flex flex-col items-center gap-6">
      <Seo title="OG Image Maker | FastTypingLab" description="Internal OG image generator." noindex />

      <div className="max-w-2xl text-center">
        <h1 className="text-2xl font-black mb-2">OG Image Maker</h1>
        <p className="text-brand-text-muted text-sm">
          Click download to save <code className="bg-brand-surface-2 px-1 rounded">og-image.png</code> (1200×630),
          then place it in <code className="bg-brand-surface-2 px-1 rounded">frontend/public/</code>. Tell me when it's added and I'll point the site's social image at it.
        </p>
      </div>

      <button onClick={download} disabled={busy}
        className="text-sm font-bold text-white px-6 py-3 rounded-xl disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
        {busy ? 'Rendering…' : '⬇ Download og-image.png'}
      </button>

      {/* Scrollable preview of the real 1200x630 card */}
      <div className="w-full overflow-auto border border-brand-border rounded-2xl">
        <div
          ref={cardRef}
          style={{
            width: 1200, height: 630, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, #304C53 0%, #2A9DAE 100%)',
            color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif',
            padding: '72px 80px', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -140, right: -120, width: 420, height: 420, borderRadius: '50%', background: 'rgba(175,224,231,0.15)' }} />
          <div style={{ position: 'absolute', bottom: -180, left: -100, width: 360, height: 360, borderRadius: '50%', background: 'rgba(188,108,80,0.18)' }} />

          {/* Top: logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#ffffff', color: '#304C53', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, fontFamily: 'Georgia, serif' }}>F</div>
            <div style={{ fontSize: 34, fontWeight: 800 }}>FastTypingLab</div>
          </div>

          {/* Middle: headline */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1px' }}>
              Free Typing<br />Speed Test
            </div>
            <div style={{ fontSize: 30, marginTop: 22, color: 'rgba(255,255,255,0.9)', fontWeight: 500, maxWidth: 900 }}>
              English &amp; Hindi (Kruti Dev / Mangal) · SSC · CPCT · UPSSSC exam practice · live WPM &amp; accuracy
            </div>
          </div>

          {/* Bottom: chips + url */}
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
    </div>
  );
}

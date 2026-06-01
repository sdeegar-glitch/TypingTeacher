import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, CheckCircle, Award, ExternalLink, ChevronLeft, Check } from 'lucide-react';

const API_URL = 'https://typingteacher-2lnd.onrender.com';

interface CertData {
  id: string;
  username: string;
  wpm: number;
  accuracy: number;
  errors: number;
  test_title: string;
  issued_at: string;
  is_valid: boolean;
}

function drawCertificateOnCanvas(canvas: HTMLCanvasElement, data: CertData) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Top gradient bar
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0, '#6366f1');
  topGrad.addColorStop(0.5, '#a855f7');
  topGrad.addColorStop(1, '#6366f1');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 18);

  // Border frame
  ctx.strokeStyle = '#e0e7ff';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // Decorative corner dots
  [24, W - 24].forEach(x => [24, H - 24].forEach(y => {
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }));

  // Logo circle
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 28, 50, 56, 56, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('T', W / 2, 91);

  // Site name
  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('FastTypingLab', W / 2, 130);

  // Subtitle
  ctx.fillStyle = '#9ca3af';
  ctx.font = '500 13px Arial, sans-serif';
  ctx.letterSpacing = '0.3em';
  ctx.fillText('CERTIFICATE OF ACHIEVEMENT', W / 2, 160);
  ctx.letterSpacing = '0';

  // Divider line
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 160, 178);
  ctx.lineTo(W / 2 + 160, 178);
  ctx.stroke();

  // "This certifies that"
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('This is to certify that', W / 2, 210);

  // Name
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText(data.username, W / 2, 262);

  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('has successfully demonstrated typing proficiency', W / 2, 292);

  // WPM & Accuracy stats
  const leftX = W / 2 - 120;
  const rightX = W / 2 + 120;
  const statY = 360;

  // WPM box
  ctx.fillStyle = '#eef2ff';
  ctx.beginPath();
  ctx.roundRect(leftX - 80, statY - 42, 160, 90, 12);
  ctx.fill();
  ctx.fillStyle = '#4338ca';
  ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(String(data.wpm), leftX, statY + 8);
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('WORDS PER MINUTE', leftX, statY + 34);

  // Divider
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2, statY - 40);
  ctx.lineTo(W / 2, statY + 40);
  ctx.stroke();

  // Accuracy box
  ctx.fillStyle = '#ecfdf5';
  ctx.beginPath();
  ctx.roundRect(rightX - 80, statY - 42, 160, 90, 12);
  ctx.fill();
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${data.accuracy}%`, rightX, statY + 8);
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial, sans-serif';
  ctx.fillText('ACCURACY', rightX, statY + 34);

  // Test title & date
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Test: ${data.test_title}`, W / 2, 476);
  const dateStr = data.issued_at ? new Date(data.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(dateStr, W / 2, 498);

  // Footer
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, H - 72);
  ctx.lineTo(W - 60, H - 72);
  ctx.stroke();

  ctx.fillStyle = '#9ca3af';
  ctx.font = '11px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Verify at: fasttypinglab.com/certificate', 60, H - 48);
  ctx.textAlign = 'right';
  ctx.fillText(`ID: ${data.id.slice(0, 16)}… | FastTypingLab © 2026`, W - 60, H - 48);

  // Bottom gradient bar
  const botGrad = ctx.createLinearGradient(0, 0, W, 0);
  botGrad.addColorStop(0, '#6366f1');
  botGrad.addColorStop(0.5, '#a855f7');
  botGrad.addColorStop(1, '#6366f1');
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, H - 12, W, 12);
}

export default function CertificatePage() {
  const [searchParams] = useSearchParams();
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [username, setUsername] = useState(searchParams.get('name') || '');
  const [wpm] = useState(Number(searchParams.get('wpm') || 0));
  const [accuracy] = useState(Number(searchParams.get('acc') || 0));
  const [testTitle] = useState(searchParams.get('title') || 'Typing Speed Test');
  const [certData, setCertData] = useState<CertData | null>(null);
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; data?: CertData } | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'generate' | 'verify'>(wpm > 0 ? 'generate' : 'verify');

  useEffect(() => {
    document.title = 'Typing Certificate | FastTypingLab';
  }, []);

  const issueCertificate = async () => {
    if (!username.trim()) return;
    setIsIssuing(true);
    try {
      const res = await fetch(`${API_URL}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), wpm: wpm || 50, accuracy: accuracy || 90, test_title: testTitle }),
      });
      const data = await res.json();
      setCertData(data);
    } catch {
      setCertData({
        id: `FTLAB-${Date.now().toString(36).toUpperCase()}`,
        username: username.trim(), wpm: wpm || 50, accuracy: accuracy || 90, errors: 0,
        test_title: testTitle, issued_at: new Date().toISOString(), is_valid: true,
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const downloadCertificate = () => {
    if (!certData || !hiddenCanvasRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = hiddenCanvasRef.current;
      canvas.width = 900;
      canvas.height = 560;
      drawCertificateOnCanvas(canvas, certData);
      const link = document.createElement('a');
      link.download = `FastTypingLab-Certificate-${certData.username}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please take a screenshot instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  const verifyCertificate = async () => {
    if (!verifyId.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/certificates/${verifyId.trim()}`);
      const data = await res.json();
      setVerifyResult({ valid: data.valid, data });
    } catch {
      setVerifyResult({ valid: false });
    }
  };

  const shareUrl = certData ? `${window.location.origin}/certificate?verify=${certData.id}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview canvas render
  useEffect(() => {
    if (!certData || !hiddenCanvasRef.current) return;
    const canvas = hiddenCanvasRef.current;
    canvas.width = 900;
    canvas.height = 560;
    drawCertificateOnCanvas(canvas, certData);
  }, [certData]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold">Typing Certificate</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-brand-surface-2 rounded-xl p-1 mb-6 w-fit">
          {(['generate', 'verify'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-brand-surface shadow text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}>
              {t === 'generate' ? '🎓 Generate' : '🔍 Verify'}
            </button>
          ))}
        </div>

        {/* GENERATE TAB */}
        {tab === 'generate' && (
          <div className="space-y-6">
            {!certData && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
                <h2 className="font-bold text-brand-text mb-4">Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-muted mb-1.5">Your Full Name</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-4 py-3 text-brand-text text-sm outline-none focus:border-brand-primary transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-4">
                      <div className="text-2xl font-black text-brand-primary font-mono">{wpm || 50}</div>
                      <div className="text-xs text-brand-muted">Net WPM</div>
                    </div>
                    <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-4">
                      <div className="text-2xl font-black text-brand-accent font-mono">{accuracy || 90}%</div>
                      <div className="text-xs text-brand-muted">Accuracy</div>
                    </div>
                  </div>
                  <button onClick={issueCertificate} disabled={!username.trim() || isIssuing}
                    className="w-full bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    {isIssuing
                      ? <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Generating…</>
                      : <><Award className="w-4 h-4" /> Generate Certificate</>}
                  </button>
                  {wpm === 0 && (
                    <p className="text-xs text-brand-muted text-center">
                      <Link to="/tests" className="text-brand-primary font-semibold hover:underline">Take a typing test</Link> to get your real WPM and accuracy on your certificate.
                    </p>
                  )}
                </div>
              </div>
            )}

            {certData && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <button onClick={downloadCertificate} disabled={isDownloading}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 shadow-lg shadow-brand-primary/20">
                    {isDownloading
                      ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      : <Download className="w-4 h-4" />}
                    {isDownloading ? 'Downloading…' : 'Download PNG'}
                  </button>
                  <button onClick={copyLink}
                    className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:bg-brand-border text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                    {copied ? <Check className="w-4 h-4 text-brand-accent" /> : <Share2 className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Share Link'}
                  </button>
                  <button onClick={() => setCertData(null)}
                    className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:bg-brand-border text-brand-muted px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
                    Edit Name
                  </button>
                </div>

                {/* Certificate Preview — pure white card rendered from canvas */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  <canvas ref={node => {
                    if (node && certData) {
                      node.width = 900; node.height = 560;
                      drawCertificateOnCanvas(node, certData);
                    }
                  }} className="w-full h-auto" style={{ maxHeight: 480 }} />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* VERIFY TAB */}
        {tab === 'verify' && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 max-w-lg">
            <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand-accent" /> Verify a Certificate
            </h2>
            <p className="text-brand-text-muted text-sm mb-5">Enter the certificate ID found at the bottom of any FastTypingLab certificate.</p>
            <div className="flex gap-2">
              <input type="text" value={verifyId}
                onChange={e => { setVerifyId(e.target.value); setVerifyResult(null); }}
                placeholder="Certificate ID"
                className="flex-1 bg-brand-surface-2 border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-primary transition-all font-mono" />
              <button onClick={verifyCertificate}
                className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-3 rounded-xl font-bold text-sm transition-all">
                Verify
              </button>
            </div>
            {verifyResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl border ${verifyResult.valid ? 'bg-brand-accent/10 border-brand-accent/30' : 'bg-rose-500/10 border-rose-500/20'}`}>
                {verifyResult.valid ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-brand-accent">Valid Certificate ✓</p>
                      {verifyResult.data && (
                        <div className="text-sm text-brand-text-muted mt-1 space-y-0.5">
                          <p>Name: <span className="font-semibold text-brand-text">{verifyResult.data.username}</span></p>
                          <p>Speed: <span className="font-semibold text-brand-text">{verifyResult.data.wpm} WPM</span></p>
                          <p>Accuracy: <span className="font-semibold text-brand-text">{verifyResult.data.accuracy}%</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-rose-500 font-semibold flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Certificate not found or invalid.
                  </p>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

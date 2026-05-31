import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, CheckCircle, Award, ExternalLink, ChevronLeft } from 'lucide-react';

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

export default function CertificatePage() {
  const [searchParams] = useSearchParams();
  const certRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState(searchParams.get('name') || '');
  const [wpm] = useState(Number(searchParams.get('wpm') || 0));
  const [accuracy] = useState(Number(searchParams.get('acc') || 0));
  const [testTitle] = useState(searchParams.get('title') || 'Typing Speed Test');
  const [certData, setCertData] = useState<CertData | null>(null);
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; data?: CertData } | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tab, setTab] = useState<'generate' | 'verify'>(wpm > 0 ? 'generate' : 'verify');

  useEffect(() => {
    document.title = 'Typing Certificate | FastTypingLab';
  }, []);

  const issueCertificate = async () => {
    if (!username.trim() || !wpm) return;
    setIsIssuing(true);
    try {
      const res = await fetch(`${API_URL}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), wpm, accuracy, test_title: testTitle }),
      });
      const data = await res.json();
      setCertData(data);
    } catch {
      // Create a local mock if backend is unavailable
      setCertData({
        id: `FTLAB-${Date.now().toString(36).toUpperCase()}`,
        username: username.trim(), wpm, accuracy, errors: 0,
        test_title: testTitle, issued_at: new Date().toISOString(), is_valid: true,
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`FastTypingLab-Certificate-${certData?.username || 'Typist'}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not generate PDF. Please try taking a screenshot.');
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
  const displayData = certData || (wpm > 0 ? { username, wpm, accuracy, test_title: testTitle, id: '', issued_at: new Date().toISOString(), is_valid: true, errors: 0 } : null);
  const issuedDate = displayData?.issued_at ? new Date(displayData.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold">Typing Certificate</h1>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 bg-brand-surface-2 rounded-xl p-1 mb-6 w-fit">
          {(['generate', 'verify'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-brand-surface shadow text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}>
              {t === 'generate' ? '🎓 Generate' : '🔍 Verify'}
            </button>
          ))}
        </div>

        {/* ── GENERATE TAB ── */}
        {tab === 'generate' && (
          <div className="space-y-6">
            {/* Input form */}
            {!certData && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
                <h2 className="font-bold text-brand-text mb-4">Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-muted mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-4 py-3 text-brand-text text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-4">
                      <div className="text-2xl font-black text-brand-primary font-mono">{wpm}</div>
                      <div className="text-xs text-brand-muted">Net WPM</div>
                    </div>
                    <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-4">
                      <div className="text-2xl font-black text-brand-accent font-mono">{accuracy}%</div>
                      <div className="text-xs text-brand-muted">Accuracy</div>
                    </div>
                  </div>
                  {wpm > 0 ? (
                    <button onClick={issueCertificate} disabled={!username.trim() || isIssuing}
                      className="w-full bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                      {isIssuing ? <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Generating…</> : <><Award className="w-4 h-4" /> Generate Certificate</>}
                    </button>
                  ) : (
                    <div className="text-center text-brand-muted text-sm py-4">
                      Complete a typing test to generate your certificate.{' '}
                      <Link to="/tests" className="text-brand-primary font-semibold hover:underline">Take a test →</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certificate preview */}
            {displayData && certData && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                {/* Actions */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <button onClick={downloadCertificate} disabled={isDownloading}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60">
                    {isDownloading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                    {isDownloading ? 'Generating PDF…' : 'Download PDF'}
                  </button>
                  {certData?.id && (
                    <button onClick={() => navigator.clipboard.writeText(shareUrl)}
                      className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:bg-brand-border text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
                      <Share2 className="w-4 h-4" /> Copy Verify Link
                    </button>
                  )}
                  <button onClick={() => setCertData(null)}
                    className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:bg-brand-border text-brand-muted px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
                    Edit Name
                  </button>
                </div>

                {/* Certificate visual */}
                <div ref={certRef} className="bg-white rounded-3xl overflow-hidden shadow-2xl" style={{ fontFamily: 'Georgia, serif' }}>
                  {/* Top accent bar */}
                  <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                  <div className="p-8 sm:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg">T</div>
                        <span className="text-xl font-bold text-gray-800">FastTypingLab</span>
                      </div>
                      <p className="text-gray-400 uppercase tracking-[0.3em] text-xs font-semibold">Certificate of Achievement</p>
                    </div>

                    {/* Body */}
                    <div className="text-center mb-8">
                      <p className="text-gray-500 text-sm mb-2">This is to certify that</p>
                      <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>{certData.username}</h2>
                      <p className="text-gray-500 text-sm">has successfully demonstrated typing proficiency</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 sm:gap-16 mb-8">
                      <div className="text-center">
                        <div className="text-4xl sm:text-5xl font-black text-indigo-600" style={{ fontFamily: 'monospace' }}>{certData.wpm}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Words Per Minute</div>
                      </div>
                      <div className="h-16 w-px bg-gray-200" />
                      <div className="text-center">
                        <div className="text-4xl sm:text-5xl font-black text-emerald-600" style={{ fontFamily: 'monospace' }}>{certData.accuracy}%</div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Accuracy</div>
                      </div>
                    </div>

                    {/* Test & Date */}
                    <div className="text-center mb-8">
                      <p className="text-gray-500 text-sm">on the test: <span className="font-semibold text-gray-700">{certData.test_title}</span></p>
                      <p className="text-gray-400 text-xs mt-1">{issuedDate}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Verify this certificate at:</p>
                        <p className="text-xs text-indigo-500 font-mono">fasttypinglab.com/certificate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-mono">ID: {certData.id.slice(0, 16)}…</p>
                        <p className="text-xs text-gray-400">FastTypingLab © 2026</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ── VERIFY TAB ── */}
        {tab === 'verify' && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 max-w-lg">
            <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand-accent" /> Verify a Certificate
            </h2>
            <p className="text-brand-text-muted text-sm mb-5">Enter the certificate ID (found at the bottom of any FastTypingLab certificate) to verify its authenticity.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyId}
                onChange={e => { setVerifyId(e.target.value); setVerifyResult(null); }}
                placeholder="Certificate ID or UUID"
                className="flex-1 bg-brand-surface-2 border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-primary transition-all font-mono"
              />
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

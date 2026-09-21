import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Share2, CheckCircle, Award, ExternalLink, ChevronLeft, Check, Lock, FileText, Clock, Target, Gauge } from 'lucide-react';

import { API_URL } from '../lib/api';
import TelegramCTA from '../components/TelegramCTA';
import WhatsAppCTA from '../components/WhatsAppCTA';
import { isLoggedIn } from '../lib/auth';
import { trackEvent } from '../lib/analytics';
import Seo from '../components/Seo';
import {
  drawCertificate, makeQr, verifyUrl, certificateToPdf, certificateNumber,
  type CertificateData,
} from '../lib/certificateRender';

interface EligibleSession {
  id: number;
  started_at: string;
  duration: number;
  net_wpm: number;
  accuracy: number;
  errors: number;
  test_title: string;
}
interface Rules { minWpm: number; minAccuracy: number; minSeconds: number }

const DEFAULT_RULES: Rules = { minWpm: 30, minAccuracy: 85, minSeconds: 300 };

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function CertificatePage() {
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loggedIn = isLoggedIn();

  const [tab, setTab] = useState<'get' | 'verify'>(searchParams.get('verify') ? 'verify' : 'get');
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const [sessions, setSessions] = useState<EligibleSession[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [name, setName] = useState('');
  const [issuingId, setIssuingId] = useState<number | null>(null);
  const [issueError, setIssueError] = useState('');
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [busy, setBusy] = useState<'' | 'png' | 'pdf'>('');
  const [copied, setCopied] = useState(false);

  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; data?: CertificateData } | null>(null);

  // Eligible sessions come from the server: it checks the rules against saved results.
  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/certificates/eligible`, { headers: authHeaders() });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        setRules(data.rules || DEFAULT_RULES);
        setSessions(data.sessions || []);
        if (data.name) setName(n => n || data.name);
      } catch {
        if (!cancelled) setLoadError('Could not load your tests right now. Please refresh.');
      }
    })();
    return () => { cancelled = true; };
  }, [loggedIn]);

  const runVerify = useCallback(async (id: string) => {
    if (!id.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/certificates/${id.trim()}`);
      const data = await res.json();
      setVerifyResult({ valid: !!data.valid, data });
    } catch {
      setVerifyResult({ valid: false });
    }
  }, []);

  // Deep link (QR code / share link): /certificate?verify=<id>
  useEffect(() => {
    const vid = searchParams.get('verify');
    if (!vid) return;
    setTab('verify');
    setVerifyId(vid);
    runVerify(vid);
  }, [searchParams, runVerify]);

  const issue = async (s: EligibleSession) => {
    if (name.trim().length < 2) { setIssueError('Enter your full name as it should appear on the certificate.'); return; }
    setIssuingId(s.id);
    setIssueError('');
    try {
      const res = await fetch(`${API_URL}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ session_id: s.id, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not issue certificate.');
      setCert(data);
      setSessions(list => (list || []).filter(x => x.id !== s.id));
      trackEvent('certificate_issued');
    } catch (e) {
      setIssueError(e instanceof Error ? e.message : 'Could not issue certificate.');
    } finally {
      setIssuingId(null);
    }
  };

  // Paint the preview (and keep the canvas ready for PNG / PDF export).
  useEffect(() => {
    if (!cert || !canvasRef.current) return;
    const canvas = canvasRef.current;
    let cancelled = false;
    drawCertificate(canvas, cert, null);
    makeQr(verifyUrl(window.location.origin, cert.id))
      .then(qr => { if (!cancelled) drawCertificate(canvas, cert, qr); })
      .catch(() => { /* certificate still valid without the QR image */ });
    return () => { cancelled = true; };
  }, [cert]);

  const fileBase = cert ? `FastTypingLab-Certificate-${certificateNumber(cert.id)}` : '';

  const downloadPng = () => {
    if (!cert || !canvasRef.current) return;
    setBusy('png');
    canvasRef.current.toBlob(b => { if (b) saveBlob(b, `${fileBase}.png`); setBusy(''); }, 'image/png');
    trackEvent('certificate_download', { format: 'png' });
  };

  const downloadPdf = async () => {
    if (!cert || !canvasRef.current) return;
    setBusy('pdf');
    try {
      saveBlob(await certificateToPdf(canvasRef.current), `${fileBase}.pdf`);
      trackEvent('certificate_download', { format: 'pdf' });
    } catch {
      setIssueError('Could not create the PDF. Try the PNG download.');
    } finally {
      setBusy('');
    }
  };

  const shareUrl = cert ? verifyUrl(window.location.origin, cert.id) : '';
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rulesList = (
    <div className="grid sm:grid-cols-3 gap-3">
      {[
        { icon: Gauge, label: 'Speed', value: `${rules.minWpm}+ net WPM` },
        { icon: Target, label: 'Accuracy', value: `${rules.minAccuracy}% or higher` },
        { icon: Clock, label: 'Test length', value: `${rules.minSeconds / 60} minutes or more` },
      ].map(r => (
        <div key={r.label} className="bg-brand-surface-2 border border-brand-border rounded-xl p-4 flex items-center gap-3">
          <r.icon className="w-5 h-5 text-brand-primary shrink-0" />
          <div>
            <div className="text-xs text-brand-muted">{r.label}</div>
            <div className="font-bold text-sm">{r.value}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="Typing Certificate | FastTypingLab"
        description="Earn a verifiable FastTypingLab typing certificate with a QR code."
        noindex
      />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold">Typing Certificate</h1>
        </div>

        <div className="flex gap-1 bg-brand-surface-2 rounded-xl p-1 mb-6 w-fit">
          {(['get', 'verify'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-brand-surface shadow text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}>
              {t === 'get' ? 'Get certificate' : 'Verify'}
            </button>
          ))}
        </div>

        {tab === 'get' && (
          <div className="space-y-6">
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
              <h2 className="font-bold mb-1">Who can get a certificate?</h2>
              <p className="text-sm text-brand-text-muted mb-4">
                Registered users who pass one full test meeting all three conditions. The result is checked on our server against your saved test.
              </p>
              {rulesList}
            </div>

            {!loggedIn && (
              <div className="rounded-2xl p-6 border border-brand-border bg-brand-surface flex items-start gap-4">
                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">Create a free account to earn certificates</p>
                  <p className="text-sm text-brand-text-muted mt-1 mb-4">
                    Your tests are saved to your account, so your certificate can be verified by anyone with the link or QR code.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/signup?next=%2Fcertificate" onClick={() => trackEvent('cert_login_gate_click', { action: 'signup' })}
                      className="inline-flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                      style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
                      Create free account
                    </Link>
                    <Link to="/login?next=%2Fcertificate" onClick={() => trackEvent('cert_login_gate_click', { action: 'login' })}
                      className="inline-flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-text font-semibold px-5 py-2.5 rounded-xl text-sm">
                      I already have an account
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {loggedIn && !cert && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
                <label htmlFor="cert-name" className="block text-sm font-medium text-brand-text-muted mb-1.5">
                  Name on certificate
                </label>
                <input id="cert-name" type="text" value={name} maxLength={60} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-primary" />
                <p className="text-xs text-brand-muted mt-1.5">Check the spelling: it is printed exactly as entered and cannot be changed later.</p>

                {loadError && <p role="alert" className="text-sm text-red-500 mt-4">{loadError}</p>}
                {issueError && <p role="alert" className="text-sm text-red-500 mt-4">{issueError}</p>}

                <h3 className="font-bold mt-6 mb-3">Your qualifying tests</h3>
                {sessions === null && !loadError && <p className="text-sm text-brand-muted">Loading…</p>}
                {sessions?.length === 0 && (
                  <div className="text-sm text-brand-text-muted bg-brand-surface-2 border border-brand-border rounded-xl p-4">
                    No qualifying test yet. Take a <strong>{rules.minSeconds / 60}-minute</strong> test while signed in and reach{' '}
                    <strong>{rules.minWpm}+ net WPM</strong> with <strong>{rules.minAccuracy}%+ accuracy</strong>.{' '}
                    <Link to="/tests/?duration=300" className="text-brand-primary font-semibold hover:underline">Start a 5-minute test</Link>
                  </div>
                )}
                <ul className="space-y-2">
                  {sessions?.map(s => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 bg-brand-surface-2 border border-brand-border rounded-xl p-4">
                      <div>
                        <div className="font-semibold text-sm">{s.test_title}</div>
                        <div className="text-xs text-brand-muted">
                          {new Date(s.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}{s.net_wpm} WPM · {Math.round(s.accuracy * 10) / 10}% · {Math.round(s.duration / 60)} min
                        </div>
                      </div>
                      <button onClick={() => issue(s)} disabled={issuingId !== null}
                        className="bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        {issuingId === s.id
                          ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          : <Award className="w-4 h-4" />}
                        Get certificate
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cert && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-wrap gap-3 mb-4">
                  <button onClick={downloadPdf} disabled={busy !== ''}
                    className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-60">
                    <FileText className="w-4 h-4" /> {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
                  </button>
                  <button onClick={downloadPng} disabled={busy !== ''}
                    className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:bg-brand-border px-5 py-2.5 rounded-xl font-bold text-sm">
                    <Download className="w-4 h-4" /> PNG image
                  </button>
                  <button onClick={copyLink}
                    className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:bg-brand-border px-5 py-2.5 rounded-xl font-bold text-sm">
                    {copied ? <Check className="w-4 h-4 text-brand-accent" /> : <Share2 className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy verify link'}
                  </button>
                </div>
                {issueError && <p role="alert" className="text-sm text-red-500 mb-3">{issueError}</p>}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                  <canvas ref={canvasRef} className="w-full h-auto block" aria-label={`Typing certificate for ${cert.username}`} role="img" />
                </div>
                <p className="text-xs text-brand-muted mt-3">
                  Anyone can confirm this certificate by scanning the QR code or opening <span className="font-mono break-all">{shareUrl}</span>
                </p>
                <div className="mt-4 space-y-2.5">
                  <TelegramCTA message="Share your achievement and challenge others — join our typing community for daily tests and weekly leaderboards." />
                  <WhatsAppCTA message="Follow for daily typing tests and exam-prep updates, straight in WhatsApp." />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {tab === 'verify' && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 max-w-lg">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-brand-accent" /> Verify a certificate
            </h2>
            <p className="text-brand-text-muted text-sm mb-5">Scan the QR code on the certificate, or paste the certificate ID.</p>
            <div className="flex gap-2">
              <input type="text" value={verifyId} aria-label="Certificate ID"
                onChange={e => { setVerifyId(e.target.value); setVerifyResult(null); }}
                placeholder="Certificate ID"
                className="flex-1 bg-brand-surface-2 border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-primary font-mono" />
              <button onClick={() => runVerify(verifyId)}
                className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-3 rounded-xl font-bold text-sm">
                Verify
              </button>
            </div>
            {verifyResult && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl border ${verifyResult.valid ? 'bg-brand-accent/10 border-brand-accent/30' : 'bg-rose-500/10 border-rose-500/20'}`}>
                {verifyResult.valid && verifyResult.data ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                    <div className="text-sm text-brand-text-muted space-y-0.5">
                      <p className="font-bold text-brand-accent text-base">Valid certificate</p>
                      <p>Name: <span className="font-semibold text-brand-text">{verifyResult.data.username}</span></p>
                      <p>Speed: <span className="font-semibold text-brand-text">{verifyResult.data.wpm} net WPM</span></p>
                      <p>Accuracy: <span className="font-semibold text-brand-text">{verifyResult.data.accuracy}%</span></p>
                      {!!verifyResult.data.duration_seconds && (
                        <p>Test length: <span className="font-semibold text-brand-text">{Math.round(verifyResult.data.duration_seconds / 60)} minutes</span></p>
                      )}
                      <p>Test: <span className="font-semibold text-brand-text">{verifyResult.data.test_title}</span></p>
                      <p>Issued: <span className="font-semibold text-brand-text">
                        {new Date(verifyResult.data.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span></p>
                      <p>Certificate No.: <span className="font-mono text-brand-text">{certificateNumber(verifyResult.data.id)}</span></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-rose-500 font-semibold flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Certificate not found or no longer valid.
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

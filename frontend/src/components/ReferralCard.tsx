import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Copy, Check, Users, Loader2 } from 'lucide-react';
import {
  fetchReferralStats,
  referralUrl,
  shareMessage,
  currentTier,
  nextTier,
  REFERRAL_TIERS,
  type ReferralStats,
} from '../lib/referral';
import { TELEGRAM_URL } from '../lib/social';

/**
 * Invite card. Shows the user's share link, how many invites have actually
 * typed, and the next tier. Renders nothing at all if the API is unavailable —
 * an invite box that can't produce a working link is worse than no box.
 */
export default function ReferralCard({ showTiers = false }: { showTiers?: boolean }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchReferralStats().then(s => {
      if (!alive) return;
      setStats(s);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const copyLink = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(referralUrl(stats.code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the link is visible on screen to copy by hand */
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex items-center gap-3 text-sm text-brand-muted">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your invite link…
      </div>
    );
  }

  if (!stats) return null;

  const tier = currentTier(stats.qualified);
  const next = nextTier(stats.qualified);
  const url = referralUrl(stats.code);
  const msg = encodeURIComponent(shareMessage(stats.code));
  const toGo = next ? next.count - stats.qualified : 0;
  const pct = next ? Math.round((stats.qualified / next.count) * 100) : 100;

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}
          >
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-brand-text leading-none">Invite a friend</h3>
            <p className="text-xs text-brand-muted mt-1.5">
              {stats.qualified === 0
                ? 'Share your link — invites count once they take a test.'
                : `${stats.qualified} friend${stats.qualified === 1 ? '' : 's'} joined and started typing.`}
            </p>
          </div>
        </div>
        {tier && (
          <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-brand-surface-2 border border-brand-border text-brand-text">
            {tier.emoji} {tier.name}
          </span>
        )}
      </div>

      {/* Share link */}
      <div className="flex items-stretch gap-2 mb-3">
        <div className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-brand-surface-2 border border-brand-border font-mono text-sm text-brand-text truncate flex items-center">
          {url}
        </div>
        <button
          onClick={copyLink}
          className="shrink-0 px-4 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          aria-label="Copy your invite link"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <a
          href={`https://wa.me/?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold px-3 py-2 rounded-lg bg-[#25D366]/10 text-[#1DA851] border border-[#25D366]/25 hover:bg-[#25D366]/20 transition-colors"
        >
          Share on WhatsApp
        </a>
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold px-3 py-2 rounded-lg bg-[#229ED9]/10 text-[#1B7FAE] border border-[#229ED9]/25 hover:bg-[#229ED9]/20 transition-colors"
        >
          Share on Telegram
        </a>
      </div>

      {/* Progress to the next tier */}
      {next && (
        <div className="mb-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-brand-muted">
              {toGo} more to unlock <span className="font-bold text-brand-text">{next.emoji} {next.name}</span>
            </span>
            <span className="font-bold text-brand-text">{stats.qualified}/{next.count}</span>
          </div>
          <div className="h-2 rounded-full bg-brand-surface-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#304C53,#2A9DAE)' }}
            />
          </div>
        </div>
      )}

      {/* Pending invites are worth naming: the referrer can nudge them */}
      {stats.total > stats.qualified && (
        <p className="text-xs text-brand-muted mt-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 shrink-0" />
          {stats.total - stats.qualified} signed up but haven't taken a test yet — they'll count once they do.
        </p>
      )}

      {stats.invites.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-border">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Your invites</h4>
          <ul className="flex flex-col gap-1.5">
            {stats.invites.slice(0, 8).map((inv, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-brand-text truncate">{inv.name}</span>
                <span className={`text-xs font-bold shrink-0 ml-3 ${inv.qualified ? 'text-emerald-600' : 'text-brand-muted'}`}>
                  {inv.qualified ? 'Counted' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showTiers && (
        <div className="mt-4 pt-4 border-t border-brand-border">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3">Tiers</h4>
          <ul className="flex flex-col gap-2.5">
            {REFERRAL_TIERS.map(t => {
              const earned = stats.qualified >= t.count;
              return (
                <li key={t.count} className="flex items-start gap-3 text-sm">
                  <span className={`text-lg leading-none shrink-0 ${earned ? '' : 'opacity-35 grayscale'}`}>{t.emoji}</span>
                  <div className="min-w-0">
                    <span className={`font-bold ${earned ? 'text-brand-text' : 'text-brand-muted'}`}>
                      {t.name} · {t.count} friend{t.count === 1 ? '' : 's'}
                    </span>
                    <p className="text-xs text-brand-muted">{t.perk}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-brand-muted mt-3">
            Shout-outs are posted in the{' '}
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-brand-primary hover:underline">
              Telegram group
            </a>
            . <Link to="/refer" className="font-bold text-brand-primary hover:underline">How it works</Link>
          </p>
        </div>
      )}
    </div>
  );
}

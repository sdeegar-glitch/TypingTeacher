import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Clock, Trophy, Users, ChevronRight, Zap } from 'lucide-react';
import Seo from '../components/Seo';
import PageHeader from '../components/PageHeader';
import TelegramCTA from '../components/TelegramCTA';
import WhatsAppCTA from '../components/WhatsAppCTA';
import { fetchTestList } from '../lib/api';
import { getLiveTestSchedule, pickWeeklyTest, formatCountdown, LIVE_TEST_DURATION_SEC } from '../lib/liveTest';

const TRACKS = [
  { id: 'en', label: 'English', query: { language: 'en' } },
  { id: 'mangal', label: 'Hindi — Mangal', query: { language: 'hi', keyboard_layout: 'mangal_inscript' } },
  { id: 'kruti', label: 'Hindi — Kruti Dev', query: { language: 'hi', keyboard_layout: 'kruti_dev' } },
] as const;

export default function LiveTestPage() {
  const [track, setTrack] = useState<(typeof TRACKS)[number]['id']>('en');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => { document.title = 'Weekly Live Typing Test | FastTypingLab'; }, []);

  // Tick the countdown once a minute — a per-second timer would just burn
  // battery for a countdown displayed in minutes.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const schedule = useMemo(() => getLiveTestSchedule(now), [now]);

  useEffect(() => {
    setLoading(true);
    const cfg = TRACKS.find(t => t.id === track)!;
    fetchTestList(cfg.query as Record<string, string>)
      .then(d => setTests(Array.isArray(d) ? d : []))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, [track]);

  // Same week + same track => same passage for everyone.
  const weeklyTest = useMemo(
    () => pickWeeklyTest(tests, `${schedule.weekKey}:${track}`),
    [tests, schedule.weekKey, track]
  );

  const startLabel = schedule.start.toLocaleString(undefined, {
    weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="Weekly Live Typing Test — Compete Every Sunday | FastTypingLab"
        description="Join the free weekly Live Typing Test every Sunday at 7 PM IST. Everyone types the same passage, then compare your WPM on the leaderboard. English, Hindi Mangal and Kruti Dev."
      />
      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon={Radio}
          eyebrow="Every Sunday · 7:00 PM IST"
          title="Weekly Live Test"
          subtitle="One passage. Everyone types it in the same hour. Compare your speed against the whole community on the leaderboard."
        />

        {/* Status card */}
        <div
          className="rounded-2xl border p-5 mb-6"
          style={
            schedule.isLive
              ? { background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))', borderColor: 'rgba(34,197,94,0.35)' }
              : { background: 'linear-gradient(135deg, rgba(48,76,83,0.08), rgba(42,157,174,0.05))', borderColor: 'var(--brand-border)' }
          }
        >
          {schedule.isLive ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inset-0 rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <p className="font-black text-emerald-600 dark:text-emerald-400">LIVE NOW</p>
                  <p className="text-xs text-brand-text-muted">
                    Event ends at {schedule.end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {weeklyTest && (
                <Link
                  to={`/tests/${weeklyTest.slug}?duration=${LIVE_TEST_DURATION_SEC}`}
                  className="inline-flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}
                >
                  <Zap className="w-4 h-4" /> Take the Live Test
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Clock className="w-8 h-8 text-brand-primary shrink-0" />
                <div>
                  <p className="font-black text-brand-text">Starts in {formatCountdown(schedule.msUntilStart)}</p>
                  <p className="text-xs text-brand-text-muted">{startLabel} · 1-minute test</p>
                </div>
              </div>
              {weeklyTest && (
                <Link
                  to={`/tests/${weeklyTest.slug}?duration=${LIVE_TEST_DURATION_SEC}`}
                  className="inline-flex items-center justify-center gap-2 bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  Practise this week's passage <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Track picker */}
        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Choose your track</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {TRACKS.map(t => (
            <button
              key={t.id}
              onClick={() => setTrack(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                track === t.id
                  ? 'bg-brand-primary text-white border-transparent'
                  : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* This week's passage */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2">
            This week's passage · {schedule.weekKey}
          </p>
          {loading ? (
            <div className="h-16 flex items-center text-sm text-brand-muted">Loading this week's passage…</div>
          ) : weeklyTest ? (
            <>
              <h2 className="font-black text-brand-text mb-1">{weeklyTest.title}</h2>
              {weeklyTest.excerpt && (
                <p className="text-sm text-brand-text-muted line-clamp-2 mb-3">{weeklyTest.excerpt}</p>
              )}
              <div className="flex flex-wrap gap-2 text-[11px] text-brand-muted">
                {weeklyTest.category && (
                  <span className="bg-brand-surface-2 border border-brand-border px-2 py-1 rounded-lg">{weeklyTest.category}</span>
                )}
                {weeklyTest.difficulty_level && (
                  <span className="bg-brand-surface-2 border border-brand-border px-2 py-1 rounded-lg">{weeklyTest.difficulty_level}</span>
                )}
                <span className="bg-brand-surface-2 border border-brand-border px-2 py-1 rounded-lg">1 minute</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-brand-muted">
              No passage available for this track right now — try another track, or{' '}
              <Link to="/tests/" className="text-brand-primary font-semibold hover:underline">browse all tests</Link>.
            </p>
          )}
        </div>

        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {[
            { icon: Users, title: 'Same passage', desc: "Everyone in your track types the identical text, so the ranking is fair." },
            { icon: Clock, title: 'Same hour', desc: 'Sunday 7–8 PM IST. Practise the passage any time before it.' },
            { icon: Trophy, title: 'Compare', desc: 'Your score lands on the leaderboard and the Telegram results post.' },
          ].map(s => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-4"
            >
              <s.icon className="w-5 h-5 text-brand-primary mb-2" />
              <h3 className="font-bold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-brand-text-muted leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            to="/leaderboard/"
            className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}
          >
            <Trophy className="w-4 h-4" /> View leaderboard
          </Link>
          <Link
            to="/tests/"
            className="inline-flex items-center gap-2 bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            Practise other tests
          </Link>
        </div>

        {/* Reminders */}
        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Get reminded</p>
        <div className="space-y-3 mb-8">
          <TelegramCTA message="We announce the Live Test in the group before it starts, and post the results after — join to get reminded." />
          <WhatsAppCTA message="Follow the WhatsApp channel for Live Test reminders and weekly results." />
        </div>

        <div className="text-sm text-brand-text-muted space-y-3">
          <h2 className="text-base font-black text-brand-text">How the Live Test works</h2>
          <p>
            Every Sunday at 7:00 PM IST, one passage per track becomes the week's Live Test. Because everyone types the same text in the same hour, the comparison is genuinely fair — unlike a normal leaderboard where different people typed different passages of different difficulty.
          </p>
          <p>
            You can practise the week's passage any time before the event, but only runs during the live hour count towards that week's event standings. There's nothing to sign up for: just open this page during the window and start typing. Creating a free account does mean your result is saved to your profile and can appear on the{' '}
            <Link to="/leaderboard/" className="text-brand-primary font-semibold hover:underline">leaderboard</Link> with your name.
          </p>
        </div>
      </div>
    </div>
  );
}

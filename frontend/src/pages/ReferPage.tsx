import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Share2, Keyboard, Trophy, ChevronRight } from 'lucide-react';
import Seo from '../components/Seo';
import PageHeader from '../components/PageHeader';
import ReferralCard from '../components/ReferralCard';
import TelegramCTA from '../components/TelegramCTA';
import { isLoggedIn } from '../lib/auth';
import { REFERRAL_TIERS, getStoredReferral } from '../lib/referral';

const STEPS = [
  {
    icon: Share2,
    title: 'Share your link',
    body: 'Every account gets a personal invite link. Send it on WhatsApp, paste it in a study group, or put it in your Telegram status.',
  },
  {
    icon: Keyboard,
    title: 'They take a test',
    body: 'Your friend opens the link and practises. They can try everything free — no account needed to start.',
  },
  {
    icon: Trophy,
    title: 'It counts',
    body: 'Once they create a free account and finish a typing test, the invite counts towards your tier. Signups alone do not count.',
  },
];

export default function ReferPage() {
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn());
  const invitedBy = getStoredReferral();

  useEffect(() => {
    const sync = () => setLoggedIn(isLoggedIn());
    window.addEventListener('ftl-auth-change', sync);
    return () => window.removeEventListener('ftl-auth-change', sync);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg px-4 sm:px-6 py-10">
      <Seo
        title="Invite Friends & Earn Badges | FastTypingLab Referral Programme"
        description="Share FastTypingLab with friends preparing for SSC, CPCT and other government typing exams. Earn Supporter, Advocate, Ambassador and Legend badges as they join and practise."
      />

      <div className="max-w-3xl mx-auto">
        <PageHeader
          icon={Gift}
          eyebrow="Referral Programme"
          title={<>Invite friends, <span className="gradient-text">earn your badge</span></>}
          subtitle="FastTypingLab is free and always will be. The best way to support it is to bring in one more person who needs typing practice for their exam."
        />

        {/* The invite box itself — or the reason there isn't one yet */}
        {loggedIn ? (
          <ReferralCard showTiers />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-surface border border-brand-border rounded-2xl p-6 text-center"
          >
            <h2 className="font-black text-brand-text text-lg mb-2">Get your invite link</h2>
            <p className="text-sm text-brand-muted mb-5 max-w-md mx-auto">
              Create a free account to get your personal link and start tracking who joins. It takes about twenty seconds.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                Create free account <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-brand-surface-2 border border-brand-border text-brand-text text-sm font-bold hover:border-brand-accent transition-colors"
              >
                I already have one
              </Link>
            </div>
            {invitedBy && (
              <p className="text-xs text-brand-muted mt-4">
                You arrived on a friend's invite link — they'll get credit when you sign up and take a test.
              </p>
            )}
          </motion.div>
        )}

        {/* How it works */}
        <section className="mt-10">
          <h2 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                <Icon className="w-5 h-5 text-brand-accent mb-3" />
                <h3 className="font-bold text-brand-text text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-brand-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tiers — shown here too, because logged-out visitors can't see the card */}
        {!loggedIn && (
          <section className="mt-8">
            <h2 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-4">What you earn</h2>
            <div className="bg-brand-surface border border-brand-border rounded-2xl divide-y divide-brand-border">
              {REFERRAL_TIERS.map(t => (
                <div key={t.count} className="flex items-start gap-3 p-4">
                  <span className="text-xl leading-none shrink-0">{t.emoji}</span>
                  <div>
                    <span className="font-bold text-brand-text text-sm">
                      {t.name} · {t.count} friend{t.count === 1 ? '' : 's'}
                    </span>
                    <p className="text-xs text-brand-muted mt-0.5">{t.perk}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Being straight about what the rewards are, and are not */}
        <section className="mt-8 bg-brand-surface-2 border border-brand-border rounded-2xl p-5">
          <h2 className="font-bold text-brand-text text-sm mb-2">The honest version</h2>
          <p className="text-xs text-brand-muted leading-relaxed">
            There is no cash payout, and there never will be — FastTypingLab has no subscriptions and no paywalled
            features to give away, because everything is already free. What you get is recognition: a badge on your
            profile, and a mention in the community. If that isn't worth it to you, that's completely fair — just
            keep using the site, which helps plenty on its own.
          </p>
          <ul className="text-xs text-brand-muted leading-relaxed mt-3 list-disc pl-5 space-y-1">
            <li>An invite counts once, when a new account completes its first typing test.</li>
            <li>Inviting yourself with a second email doesn't work — accounts can only be referred once, and self-referrals are rejected.</li>
            <li>We never show your friends' email addresses to you, or yours to them.</li>
          </ul>
        </section>

        <section className="mt-8 text-center">
          <p className="text-sm text-brand-muted mb-3">Monthly shout-outs are posted in the community group.</p>
          <div className="flex justify-center">
            <TelegramCTA variant="inline" />
          </div>
        </section>
      </div>
    </div>
  );
}

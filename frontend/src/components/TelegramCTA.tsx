import { Send } from 'lucide-react';
import { TELEGRAM_URL } from '../lib/social';

interface TelegramCTAProps {
  /** 'card' = full banner (results screen); 'inline' = compact button (footer). */
  variant?: 'card' | 'inline';
  message?: string;
}

/**
 * Invites visitors into the Telegram community. Placed at high-intent spots
 * (after a test result, in the footer) to convert existing site traffic into
 * group members — the cheapest, highest-quality growth channel.
 */
export default function TelegramCTA({ variant = 'card', message }: TelegramCTAProps) {
  if (variant === 'inline') {
    return (
      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-semibold text-white px-4 py-2 rounded-lg text-sm transition-all active:scale-95 hover:opacity-90"
        style={{ background: '#229ED9', boxShadow: '0 4px 14px rgba(34,158,217,.30)' }}>
        <Send className="w-4 h-4" /> Join our Telegram
      </a>
    );
  }

  return (
    <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-lg active:scale-[0.99] group"
      style={{ background: 'linear-gradient(135deg, rgba(34,158,217,0.10), rgba(34,158,217,0.04))', borderColor: 'rgba(34,158,217,0.30)' }}>
      <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white shadow-md"
        style={{ background: '#229ED9' }}>
        <Send className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-brand-text text-sm">Join our Telegram community</p>
        <p className="text-xs text-brand-text-muted leading-relaxed">
          {message || 'Get daily new typing tests, weekly WPM leaderboards, and exam-typing tips — free.'}
        </p>
      </div>
      <span className="shrink-0 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all group-hover:opacity-90"
        style={{ background: '#229ED9' }}>
        Join
      </span>
    </a>
  );
}

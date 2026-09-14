import { MessageCircle, Send } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';

interface ScoreShareButtonsProps {
  wpm: number;
  accuracy: number;
  /** Absolute URL back to this exact passage/duration, so the recipient can actually attempt it. */
  challengeUrl: string;
}

/**
 * Two real "beat my score" invites — deep links, not the site's "follow our
 * channel" WhatsAppCTA/TelegramCTA banners (a different job: those grow the
 * community, these convert one result into one more player). Plain <a> deep
 * links rather than navigator.share/clipboard: wa.me and t.me open directly
 * on both desktop (web client) and mobile (native app if installed), so
 * there's no share-sheet branching to get wrong.
 */
export default function ScoreShareButtons({ wpm, accuracy, challengeUrl }: ScoreShareButtonsProps) {
  const message = `I scored ${wpm} WPM (${accuracy}% accuracy) on FastTypingLab. Think you can beat me on the same passage? 🏁 ${challengeUrl}`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(challengeUrl)}&text=${encodeURIComponent(
    `I scored ${wpm} WPM (${accuracy}% accuracy) on FastTypingLab. Think you can beat me on the same passage? 🏁`
  )}`;

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('whatsapp_score_share_click', { page: window.location.pathname })}
        className="flex items-center justify-center gap-1.5 text-white font-bold text-sm py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#188842' }}
      >
        <MessageCircle className="w-4 h-4" /> WhatsApp
      </a>
      <a
        href={telegramHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('telegram_score_share_click', { page: window.location.pathname })}
        className="flex items-center justify-center gap-1.5 text-white font-bold text-sm py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#1B7EAE' }}
      >
        <Send className="w-4 h-4" /> Telegram
      </a>
    </div>
  );
}

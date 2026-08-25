import { MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '../lib/social';

interface WhatsAppCTAProps {
  /** 'card' = full banner (results screen); 'inline' = compact button (footer). */
  variant?: 'card' | 'inline';
  message?: string;
}

/**
 * Invites visitors to follow the WhatsApp channel — a second, India-heavy
 * community channel alongside Telegram (see TelegramCTA). Placed at the same
 * high-intent spots so both channels grow together.
 */
export default function WhatsAppCTA({ variant = 'card', message }: WhatsAppCTAProps) {
  if (variant === 'inline') {
    return (
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-semibold text-white px-4 py-2 rounded-lg text-sm transition-all active:scale-95 hover:opacity-90"
        style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,.30)' }}>
        <MessageCircle className="w-4 h-4" /> Follow on WhatsApp
      </a>
    );
  }

  return (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-lg active:scale-[0.99] group"
      style={{ background: 'linear-gradient(135deg, rgba(37,211,102,0.10), rgba(37,211,102,0.04))', borderColor: 'rgba(37,211,102,0.30)' }}>
      <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white shadow-md"
        style={{ background: '#25D366' }}>
        <MessageCircle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-brand-text text-sm">Follow us on WhatsApp</p>
        <p className="text-xs text-brand-text-muted leading-relaxed">
          {message || 'Get daily new typing tests and exam-prep updates straight in WhatsApp — free.'}
        </p>
      </div>
      <span className="shrink-0 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all group-hover:opacity-90"
        style={{ background: '#25D366' }}>
        Follow
      </span>
    </a>
  );
}

// ─── TELEGRAM AUTO-POST ───────────────────────────────────────────────────────
// Posts a message to the community group/channel whenever a new typing test is
// generated. Configured entirely via environment variables so it degrades to a
// no-op (never throws) when not set up:
//
//   TELEGRAM_BOT_TOKEN   token from @BotFather
//   TELEGRAM_CHAT_ID     the group/channel to post to. For a public group or
//                        channel use its @username (e.g. "@fasttypinglab").
//                        For a private supergroup use its numeric -100… id.
//
// Setup: create a bot with @BotFather, add it to the group, and make it an
// admin (bots can only post to groups/channels where they're an admin).

const SITE = 'https://fasttypinglab.com';

const LANG_INTRO = {
  en: '🆕 New Typing Test Just Dropped!',
  hi: '🆕 नया टाइपिंग टेस्ट आ गया है!',
};

function escapeHtml(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildMessage(test) {
  const lang = test.language === 'hi' ? 'hi' : 'en';
  const intro = LANG_INTRO[lang];
  const title = escapeHtml(test.title || 'New Typing Test');
  const bits = [test.category, test.difficulty, test.wordCount ? `${test.wordCount} words` : null]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' · ');
  const layoutTag = test.layout === 'kruti_dev' ? ' #KrutiDev'
    : test.layout === 'mangal_inscript' ? ' #Mangal' : '';
  const cta = lang === 'hi'
    ? '⌨️ अभी प्रैक्टिस करें और अपनी स्पीड बढ़ाएँ:'
    : '⌨️ Practice now and beat your best WPM:';

  return `${intro}\n\n📝 <b>${title}</b>\n🏷️ ${bits}\n\n${cta}\n\n#TypingTest #FastTypingLab${layoutTag}`;
}

/**
 * Post a newly generated test to the Telegram community.
 * Safe to call unconditionally — returns quietly when unconfigured or on error.
 * @param {{ slug?:string, title?:string, category?:string, difficulty?:string,
 *           wordCount?:number, language?:string, layout?:string }} test
 */
export async function postTestToTelegram(test) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { skipped: 'not-configured' };
  if (!test || !test.slug) return { skipped: 'no-slug' };

  const url = `${SITE}/tests/${test.slug}`;
  const body = {
    chat_id: chatId,
    text: buildMessage(test),
    parse_mode: 'HTML',
    disable_web_page_preview: false,
    reply_markup: {
      inline_keyboard: [[
        { text: test.language === 'hi' ? '🚀 टेस्ट दें' : '🚀 Take the Test', url },
      ]],
    },
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) {
      console.warn('[Telegram] post failed:', json.description || res.status);
      return { ok: false, error: json.description };
    }
    console.log(`[Telegram] Posted new test → ${test.slug}`);
    return { ok: true };
  } catch (err) {
    console.warn('[Telegram] post error:', err.message);
    return { ok: false, error: err.message };
  }
}

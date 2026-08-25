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

/**
 * Low-level sender. Returns { skipped } when unconfigured, { ok:true } on
 * success, or { ok:false, error } on failure — never throws.
 */
async function sendMessage({ text, replyMarkup, disablePreview = false }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { skipped: 'not-configured' };

  const body = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: disablePreview,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
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
    return { ok: true };
  } catch (err) {
    console.warn('[Telegram] post error:', err.message);
    return { ok: false, error: err.message };
  }
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
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return { skipped: 'not-configured' };
  if (!test || !test.slug) return { skipped: 'no-slug' };

  const url = `${SITE}/tests/config/${test.slug}`;
  const result = await sendMessage({
    text: buildMessage(test),
    replyMarkup: {
      inline_keyboard: [[
        { text: test.language === 'hi' ? '🚀 टेस्ट दें' : '🚀 Take the Test', url },
      ]],
    },
  });
  if (result.ok) console.log(`[Telegram] Posted new test → ${test.slug}`);
  return result;
}

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

/**
 * Post the weekly WPM leaderboard to the community. Keeps the group active with
 * real, competitive content (not just new-test spam) and nudges people back to
 * the site to climb the ranks.
 * @param {Array<{rank:number,user:string,net_wpm:number,accuracy:number}>} rows
 */
export async function postLeaderboardToTelegram(rows) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return { skipped: 'not-configured' };
  if (!Array.isArray(rows) || rows.length === 0) return { skipped: 'no-data' };

  const lines = rows.slice(0, 5).map((r, i) =>
    `${MEDALS[i] || `${i + 1}.`} <b>${escapeHtml(r.user || 'Anonymous')}</b> — ${r.net_wpm} WPM · ${r.accuracy}% acc`
  );

  const text =
    `🏆 <b>Daily WPM Leaderboard</b>\n` +
    `<i>Top typists on FastTypingLab today</i>\n\n` +
    lines.join('\n') +
    `\n\n💪 Think you can beat them? Take a test and climb the ranks!\n#TypingChallenge #FastTypingLab`;

  const result = await sendMessage({
    text,
    replyMarkup: { inline_keyboard: [[{ text: '⌨️ Beat the leaderboard', url: `${SITE}/tests` }]] },
  });
  if (result.ok) console.log('[Telegram] Posted daily leaderboard.');
  return result;
}

// A rotating pool of engagement polls. Telegram polls are the single biggest
// driver of group activity — one vote surfaces the group in every member's chat
// list and pulls lurkers in. Rotated by ISO-week so the same one doesn't repeat.
const POLLS = [
  { question: '⌨️ What is your target typing speed for govt exams?', options: ['25–30 WPM', '30–35 WPM (SSC/CPCT pass)', '35–40 WPM', '40+ WPM (topper zone)'] },
  { question: '🖥️ Which typing do you practice most?', options: ['English typing', 'Hindi Mangal (Inscript)', 'Hindi Kruti Dev', 'All of them'] },
  { question: '🎯 Which exam are you preparing for?', options: ['SSC CHSL / CGL', 'CPCT (MP)', 'Court / RO-ARO', 'Bank / RRB / Other'] },
  { question: '⏱️ How much do you practice typing daily?', options: ['Less than 15 min', '15–30 min', '30–60 min', 'More than 1 hour'] },
  { question: '😤 What slows your typing down the most?', options: ['Accuracy / mistakes', 'Number row', 'Special symbols', 'Speed under time pressure'] },
  { question: '📈 What is your current typing speed?', options: ['Below 25 WPM', '25–35 WPM', '35–45 WPM', '45+ WPM'] },
];

function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

/**
 * Post an engagement poll to the community. Rotates through POLLS by ISO week.
 * No-op when Telegram isn't configured. Uses the Bot API sendPoll method.
 */
export async function postPollToTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { skipped: 'not-configured' };

  const poll = POLLS[isoWeek() % POLLS.length];
  const body = {
    chat_id: chatId,
    question: poll.question,
    options: JSON.stringify(poll.options),
    is_anonymous: true,
    allows_multiple_answers: false,
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPoll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const json = await res.json().catch(() => ({}));
    if (!json.ok) {
      console.warn('[Telegram] poll failed:', json.description || res.status);
      return { ok: false, error: json.description };
    }
    console.log('[Telegram] Posted poll:', poll.question);
    return { ok: true };
  } catch (err) {
    console.warn('[Telegram] poll error:', err.message);
    return { ok: false, error: err.message };
  }
}

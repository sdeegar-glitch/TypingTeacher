// Tops up a rewritten passage that came back under the minimum word count.
//
// Groq's free tier caps a request at 8000 tokens/minute (prompt + output), so
// output is capped at 3500 tokens. Devanagari tokenizes heavily: a Hindi
// passage that fits in 3500 tokens lands around 650-900 words, below the
// 1000-word floor, no matter how the prompt is worded. Rather than lower the
// floor, ask for a continuation in a second, much smaller request once the
// per-minute budget has reset.

import { countWords, MIN_WORDS } from './qualityGate.js';
import { cleanTypingText } from './cleanTypingText.js';
import { rewriteWithFallback } from './groqClient.js';

const MAX_EXTENSIONS = 2;
const TPM_RESET_MS = 60000; // let Groq's tokens-per-minute window roll over

function continuationPrompt(content, lang, wordsNeeded) {
  // Only the tail of the passage — enough for continuity, cheap in tokens.
  const tail = content.split(/\s+/).slice(-180).join(' ');
  const language = lang === 'hi'
    ? 'Hindi, in pure Unicode Devanagari (same style and vocabulary level)'
    : 'English (same style and vocabulary level)';
  return `You are continuing a typing-practice article. Here is how it currently ends:

"""${tail}"""

Continue the article in ${language} with about ${wordsNeeded} more words. Pick up exactly where it stops, add new points (do not repeat or summarise what came before), and end with a natural concluding paragraph. Plain flowing paragraphs only: no markdown, no headings, no bullet points.

Return ONLY valid JSON: {"continuation": "the new text"}`;
}

/**
 * Returns the content, extended in place when it is short. Never throws: if a
 * continuation request fails, the original content is returned and the quality
 * gate reports the word count as before.
 */
export async function extendToMinimum(content, lang, { log = console.log } = {}) {
  let text = content;
  for (let i = 0; i < MAX_EXTENSIONS; i++) {
    const words = countWords(text);
    if (words >= MIN_WORDS) break;
    const wordsNeeded = Math.min(700, MIN_WORDS - words + 250);
    log(`  ↪ passage is ${words} words (< ${MIN_WORDS}); requesting ~${wordsNeeded} more after ${TPM_RESET_MS / 1000}s`);
    await new Promise(r => setTimeout(r, TPM_RESET_MS));
    try {
      const raw = await rewriteWithFallback(continuationPrompt(text, lang, wordsNeeded));
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      const parsed = JSON.parse(start !== -1 && end !== -1 ? raw.substring(start, end + 1) : raw);
      const more = cleanTypingText(String(parsed.continuation || '')).trim();
      if (!more) break;
      text = `${text.trim()} ${more}`;
    } catch (err) {
      log(`  ↪ continuation failed: ${err.message}`);
      break;
    }
  }
  return text;
}

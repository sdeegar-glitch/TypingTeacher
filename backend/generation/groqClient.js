// Groq client for the content-rewrite step only. Search-grounding
// (sourceEngine.js) and embeddings/dedup (embeddings.js) stay on Gemini —
// Groq has no comparable embeddings endpoint, and Gemini's Google Search
// grounding is what sources factual material in the first place.
//
// Groq's API is OpenAI-compatible (https://api.groq.com/openai/v1/chat/completions),
// so this is a plain fetch rather than a new SDK dependency.
//
// Model id: llama-3.3-70b-versatile was deprecated for free/developer tier
// on 2026-06-17. Defaulting to Groq's own recommended replacement,
// openai/gpt-oss-120b — keep this in an env var since the lineup shifts
// fast; check https://console.groq.com/docs/models if this starts 404ing
// or erroring with a deprecation notice.

import { withRetry } from './sourceEngine.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Sends a single-turn prompt to Groq and returns the raw text response.
 * Throws on HTTP/network failure — callers handle retry/fallback.
 */
export async function rewriteWithGroq(prompt) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');

  return withRetry(async () => {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        // Free tier caps at 8000 TPM (tokens per minute, prompt + completion
        // combined) on gpt-oss-120b — 8192 alone nearly blew that budget.
        // 6000 leaves headroom for the ~800-1000 token prompt while still
        // comfortably covering a 1500-word article (even Hindi, which runs
        // more tokens-per-word) plus JSON structure overhead.
        max_completion_tokens: 6000,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Groq API ${res.status}: ${body.slice(0, 500)}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Groq response missing choices[0].message.content');
    return text;
  });
}

// Content sourcing for automatic test generation.
//
// IMPORTANT (legal/ToS): this engine NEVER scrapes or stores raw text from
// paywalled/ToS-restricted commercial publishers (news sites, magazines,
// etc.). It only uses:
//   1) Gemini + Google Search grounding — gets facts/topics, not copyrighted
//      article text (same pattern the original cronService.js used).
//   2) Wikipedia/Wikimedia API — explicitly CC-BY-SA licensed for reuse.
//   3) A curated allow-list of genuinely open government/educational APIs.
// All of these return SOURCE MATERIAL that is then rewritten into wholly
// original content by the AI rewrite step — nothing here is published as-is.

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function withRetry(fn, maxRetries = 3, baseDelayMs = 20000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('Too Many Requests');
      if (is429 && attempt < maxRetries) {
        const delay = baseDelayMs * attempt;
        console.warn(`[SourceEngine] Rate limited. Retrying in ${delay / 1000}s... (${attempt}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// ── 1. Gemini + Google Search grounding ───────────────────────────────────
async function fetchViaGeminiSearch(topic, lang) {
  const searchModel = genAI.getGenerativeModel({
    // gemini-2.0-flash has 0 free-tier quota as of mid-2026 (Google has
    // moved free-tier allocation to 2.5) — verified via a live 429 with
    // limit: 0 on a freshly issued key, not just exhausted usage.
    model: 'gemini-2.5-flash',
    tools: [{ googleSearch: {} }],
  });

  const langInstruction = lang === 'hi'
    ? 'Respond in Hindi (Devanagari script).'
    : 'Respond in English.';

  const prompt = `Search the internet and find a recent, detailed, factual article about: "${topic}".
${langInstruction}

Provide:
TITLE: [article title]
SOURCE: [URL]
CONTENT: [detailed 900-1200 word factual summary covering multiple angles of the topic]`;

  const result = await withRetry(() => searchModel.generateContent(prompt));
  const rawText = result.response.text();

  const titleMatch = rawText.match(/TITLE:\s*(.+)/i);
  const contentMatch = rawText.match(/CONTENT:\s*([\s\S]+)/i);
  const title = titleMatch?.[1]?.trim() || topic;
  const content = contentMatch?.[1]?.trim() || rawText;

  let sourceUrl = `https://www.google.com/search?q=${encodeURIComponent(topic)}`;
  const chunks = result.response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks?.length > 0) sourceUrl = chunks[0]?.web?.uri || sourceUrl;

  if (!content || content.length < 200) return null;
  return { title, content, sourceUrl };
}

// ── 2. Wikipedia / Wikimedia fallback (CC-BY-SA, explicitly reusable) ─────
// Always searches English Wikipedia, even for Hindi generation: topicPool.js
// topics are English strings, and hi.wikipedia.org search on an English
// query returns near-zero hits (Hindi article titles are in Hindi). The
// Hindi rewrite prompt already translates+rewrites whatever source content
// it's given into Hindi, so an English source is fine — and en.wikipedia.org
// has far deeper coverage of these topics than hi.wikipedia.org anyway.
async function fetchViaWikipedia(topic) {
  try {
    const host = 'en.wikipedia.org';
    const searchUrl = `https://${host}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&srlimit=1&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const title = searchData?.query?.search?.[0]?.title;
    if (!title) return null;

    const pageUrl = `https://${host}/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro=false&explaintext=true&exsectionformat=plain&format=json&origin=*`;
    const pageRes = await fetch(pageUrl);
    const pageData = await pageRes.json();
    const pages = pageData?.query?.pages;
    const page = pages ? Object.values(pages)[0] : null;
    if (!page || !page.extract) return null;

    const extract = page.extract.substring(0, 3500).trim();
    if (extract.length < 300) return null;
    return {
      title: page.title,
      content: extract,
      sourceUrl: `https://${host}/wiki/${encodeURIComponent(page.title)}`,
    };
  } catch (err) {
    console.warn(`[SourceEngine] Wikipedia fallback failed: ${err.message}`);
    return null;
  }
}

// ── 3. Curated open-API allow-list, by category (English only — used as a
//      last-resort factual fallback; Hindi always falls back to hi.wikipedia) ─
const CATEGORY_APIS = {
  Space: async () => {
    const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    const d = await res.json();
    if (!d?.explanation) return null;
    return { title: d.title || 'NASA: Astronomy Picture of the Day', content: d.explanation, sourceUrl: 'https://apod.nasa.gov/' };
  },
};

async function fetchViaOpenApiAllowlist(category) {
  const fn = CATEGORY_APIS[category];
  if (!fn) return null;
  try {
    return await fn();
  } catch (err) {
    console.warn(`[SourceEngine] Open-API allow-list fetch failed for ${category}: ${err.message}`);
    return null;
  }
}

/**
 * Find source material for a topic, trying sources in priority order.
 * Returns { title, content, sourceUrl } or null if every source failed.
 */
export async function findSourceMaterial(topic, category, lang = 'en') {
  try {
    const viaSearch = await fetchViaGeminiSearch(topic, lang);
    if (viaSearch) return viaSearch;
  } catch (err) {
    console.warn(`[SourceEngine] Gemini Search grounding failed: ${err.message}`);
  }

  const viaWiki = await fetchViaWikipedia(topic);
  if (viaWiki) return viaWiki;

  if (lang === 'en') {
    const viaApi = await fetchViaOpenApiAllowlist(category);
    if (viaApi) return viaApi;
  }

  return null;
}

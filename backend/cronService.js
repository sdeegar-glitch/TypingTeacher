import cron from 'node-cron';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Guard against overlapping runs
let isRunning = false;

// ─── Retry helper (handles 429 rate limits) ───────────────────────────────────
async function withRetry(fn, maxRetries = 3, baseDelayMs = 20000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('Too Many Requests');
      if (is429 && attempt < maxRetries) {
        const delay = baseDelayMs * attempt;
        console.warn(`[CronService] Rate limited. Retrying in ${delay / 1000}s... (${attempt}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// ─── TOPIC POOL ───────────────────────────────────────────────────────────────
const TOPICS = [
  // Technology
  'artificial intelligence in healthcare', 'quantum computing breakthroughs',
  'cybersecurity threats 2025', 'electric vehicles future', 'blockchain real-world uses',
  'robotics in manufacturing', '5G technology impact', 'augmented reality education',
  'self-driving cars progress', 'open source AI models', 'cloud computing trends',
  'internet of things smart cities', 'machine learning drug discovery',

  // Science & Environment
  'climate change solutions', 'renewable energy innovations', 'ocean plastic pollution',
  'space exploration Mars mission', 'gene editing CRISPR therapy', 'biodiversity loss crisis',
  'deep sea discoveries', 'solar energy record efficiency', 'nuclear fusion energy breakthrough',
  'microplastics human body effects', 'reforestation carbon capture',

  // Health & Lifestyle
  'mental health awareness teens', 'benefits of daily exercise', 'sleep science research',
  'plant-based diet health', 'meditation and brain health', 'microbiome gut health',
  'longevity research aging', 'vaccine technology advances', 'wearable health technology',
  'air quality health effects', 'childhood obesity prevention',

  // Society & Education
  'online learning future education', 'financial literacy youth', 'urban farming cities',
  'women in STEM fields', 'gig economy workers rights', 'homeschooling trends',
  'social media mental health teens', 'volunteering community benefits',
  'public transportation future cities', 'universal basic income debate',

  // History & Culture
  'ancient civilizations discoveries', 'cultural heritage preservation',
  'history of printing press impact', 'evolution of human language',
  'forgotten women in history', 'sport as cultural diplomacy',
  'music influence on society', 'street art urban culture',

  // Economy & Business
  'startup ecosystem emerging markets', 'remote work productivity research',
  'sustainable business practices', 'supply chain resilience',
  'circular economy examples', 'green hydrogen economy',
  'future of retail shopping', 'AI replacing jobs debate',
  'women in leadership business', 'small business recovery pandemic',

  // Nature & Animals
  'endangered species conservation', 'coral reef restoration', 'wolf reintroduction ecology',
  'urban wildlife coexistence', 'insect population decline', 'reforestation success stories',
  'animal intelligence research', 'rewilding projects Europe', 'marine protected areas',
  'elephant conservation Africa',
];

// Keep track of recently used topics to avoid repeats in same run
const recentTopics = new Set();

function getRandomTopic() {
  const available = TOPICS.filter(t => !recentTopics.has(t));
  const pool = available.length > 0 ? available : TOPICS;
  const topic = pool[Math.floor(Math.random() * pool.length)];
  recentTopics.add(topic);
  // Clear after 20 topics so pool doesn't shrink forever
  if (recentTopics.size > 20) {
    const first = recentTopics.values().next().value;
    recentTopics.delete(first);
  }
  return topic;
}

// ─── WIKIPEDIA FALLBACK ────────────────────────────────────────────────────────
// Free, no-auth, returns JSON with extract text for any topic
async function fetchWikipediaContent(topic) {
  try {
    const searchTerm = encodeURIComponent(topic.replace(/\s+/g, '_'));
    // First, search for the best matching article title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&srlimit=1&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const title = searchData?.query?.search?.[0]?.title;
    if (!title) return null;

    // Then fetch the full extract
    const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro=false&explaintext=true&exsectionformat=plain&format=json&origin=*`;
    const pageRes = await fetch(pageUrl);
    const pageData = await pageRes.json();
    const pages = pageData?.query?.pages;
    const page = pages ? Object.values(pages)[0] : null;
    if (!page || !page.extract) return null;

    // Get first ~1500 chars of extract (enough context for rewriting)
    const extract = page.extract.substring(0, 2500).trim();
    return {
      title: page.title,
      content: extract,
      sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    };
  } catch (err) {
    console.warn(`[CronService] Wikipedia fallback failed: ${err.message}`);
    return null;
  }
}

// ─── SINGLE TEST GENERATOR ────────────────────────────────────────────────────
async function generateOneTest(topic) {
  console.log(`\n  → Generating test for topic: "${topic}"`);

  let foundTitle = topic;
  let foundContent = '';
  let sourceUrl = `https://www.google.com/search?q=${encodeURIComponent(topic)}`;

  // ── STEP 1: Try Gemini + Google Search grounding ──────────────────────────
  try {
    console.log(`  [Step 1] Searching internet via Gemini grounding...`);
    const searchModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{ googleSearch: {} }],
    });

    const searchPrompt = `Search the internet and find a recent, detailed article about: "${topic}".

Provide:
TITLE: [article title]
SOURCE: [URL]
CONTENT: [detailed 700-900 word summary of the article]`;

    const searchResult = await withRetry(() => searchModel.generateContent(searchPrompt));
    const rawText = searchResult.response.text();

    const titleMatch = rawText.match(/TITLE:\s*(.+)/i);
    const contentMatch = rawText.match(/CONTENT:\s*([\s\S]+)/i);
    foundTitle = titleMatch?.[1]?.trim() || topic;
    foundContent = contentMatch?.[1]?.trim() || rawText;

    // Extract real URL from grounding metadata
    const chunks = searchResult.response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks?.length > 0) sourceUrl = chunks[0]?.web?.uri || sourceUrl;

    console.log(`  [Step 1] ✅ Got ${foundContent.length} chars from Gemini Search`);
  } catch (searchErr) {
    console.warn(`  [Step 1] Gemini Search failed: ${searchErr.message}`);

    // ── STEP 1B: Wikipedia fallback ──────────────────────────────────────────
    console.log(`  [Step 1B] Trying Wikipedia fallback...`);
    const wiki = await fetchWikipediaContent(topic);
    if (wiki && wiki.content.length > 300) {
      foundTitle = wiki.title;
      foundContent = wiki.content;
      sourceUrl = wiki.sourceUrl;
      console.log(`  [Step 1B] ✅ Got ${foundContent.length} chars from Wikipedia`);
    } else {
      console.warn(`  [Step 1B] Wikipedia returned too little. Skipping this topic.`);
      return false;
    }
  }

  if (!foundContent || foundContent.length < 200) {
    console.warn(`  Content too short. Skipping.`);
    return false;
  }

  // ── STEP 2: Rewrite into structured typing test JSON ──────────────────────
  console.log(`  [Step 2] Rewriting into typing test JSON...`);
  
  let data;
  try {
    const rewriteModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const rewritePrompt = `You are an expert educational writer creating typing practice content.

Source article about "${topic}":
TITLE: ${foundTitle}
CONTENT: ${foundContent}

Rewrite this as a unique, original ~1000-word educational article for typing practice. Requirements:
- Plain text only, NO markdown, no bullet points, no headers — just flowing paragraphs
- Excellent grammar, clear sentences ideal for typing practice
- Different enough from the original to be plagiarism-free

Return ONLY valid JSON:
{
  "title": "Engaging SEO title",
  "content": "Full ~1000 word plain text article...",
  "excerpt": "2-3 sentence summary.",
  "difficulty_level": "easy|medium|hard",
  "category": "Technology|Science|Health|Society|History|Economy|Nature",
  "seo_title": "Title | FastTypingLab",
  "seo_description": "150-160 char meta description",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["kw1", "kw2", "kw3"]
}`;

    const rewriteResult = await withRetry(() => rewriteModel.generateContent(rewritePrompt), 2, 10000); // reduced retries to fail faster
    const rewriteText = rewriteResult.response.text();

    // Strip markdown fences if any
    const start = rewriteText.indexOf('{');
    const end = rewriteText.lastIndexOf('}');
    const jsonString = start !== -1 && end !== -1 ? rewriteText.substring(start, end + 1) : rewriteText;
    data = JSON.parse(jsonString);
    
    if (!data.title || !data.content) throw new Error("Parsed JSON missing title or content");
  } catch (err) {
    console.warn(`  [Step 2] Gemini rewrite failed: ${err.message}. Falling back to raw content.`);
    // ── STEP 2B: Pure Wikipedia / Raw Content Fallback ──
    // Clean up content slightly for typing (remove multiple newlines, weird characters)
    let cleanContent = foundContent.replace(/\n+/g, ' ').replace(/[\[\]]/g, '').trim();
    
    data = {
      title: foundTitle,
      content: cleanContent,
      excerpt: cleanContent.substring(0, 120) + '...',
      difficulty_level: 'medium',
      category: 'General Education',
      seo_title: `${foundTitle} - Typing Test | FastTypingLab`,
      seo_description: `Practice your typing speed with our test about ${foundTitle}.`,
      tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'typing', 'education'],
      keywords: [topic.toLowerCase(), 'typing test', 'wpm']
    };
  }

  // ── STEP 3: Save to Supabase ──────────────────────────────────────────────
  const wordCount = data.content.trim().split(/\s+/).length;
  const estimatedReadTime = Math.ceil(wordCount / 200);
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

  console.log(`  [Step 3] Saving: "${data.title}" (${wordCount} words, ${data.difficulty_level})`);

  const { error } = await supabase.from('typing_test').insert({
    title: data.title,
    slug,
    original_source: sourceUrl,
    content: data.content,
    excerpt: data.excerpt,
    difficulty_level: data.difficulty_level,
    word_count: wordCount,
    estimated_read_time: estimatedReadTime,
    category: data.category,
    tags: data.tags,
    seo_title: data.seo_title,
    seo_description: data.seo_description,
    keywords: data.keywords,
    typing_duration_options: ['1min', '3min', '5min', '10min'],
  });

  if (error) {
    console.error(`  DB insert failed: ${error.message}`);
    return false;
  }

  console.log(`  ✅ Saved: "${data.title}"`);
  return true;
}

// ─── MAIN RUN FUNCTION (generates TESTS_PER_RUN tests) ───────────────────────
const TESTS_PER_RUN = 1; // 1 test × 3 runs/day = 3 tests/day

export async function fetchAndGenerateTests() {
  if (isRunning) {
    console.log('[CronService] Still running previous batch. Skipping this tick.');
    return;
  }
  isRunning = true;
  console.log('\n========== [CronService] Batch Generation Started ==========');

  if (!process.env.GEMINI_API_KEY) {
    console.error('[CronService] GEMINI_API_KEY missing. Aborting.');
    isRunning = false;
    return;
  }

  let successCount = 0;
  for (let i = 0; i < TESTS_PER_RUN; i++) {
    const topic = getRandomTopic();
    try {
      const ok = await generateOneTest(topic);
      if (ok) successCount++;
    } catch (err) {
      console.error(`[CronService] Error generating test ${i + 1}:`, err.message);
    }

    // 30s gap between tests to avoid rate limiting
    if (i < TESTS_PER_RUN - 1) {
      console.log(`  Waiting 30s before next test...`);
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  console.log(`========== [CronService] Done — ${successCount}/${TESTS_PER_RUN} tests saved ==========\n`);
  isRunning = false;
}

// ─── CRON JOBS ────────────────────────────────────────────────────────────────
export const initCronJobs = () => {
  // Production: 3× per day at 8:00, 14:00, 20:00 IST (= 2:30, 8:30, 14:30 UTC)
  // ⚠️  To test manually, call fetchAndGenerateTests() directly
  cron.schedule('30 2,8,14 * * *', () => {
    fetchAndGenerateTests();
  });
  console.log('[CronService] Scheduled: 3× daily at 8am, 2pm, 8pm IST (1 test each = 3/day).');

  // Keep-alive: ping /health every 14 min to prevent Render free-tier cold starts
  const BACKEND_URL = process.env.BACKEND_URL || 'https://typingteacher-2lnd.onrender.com';
  cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      console.log(`[Keep-alive] /health → ${res.status}`);
    } catch (err) {
      console.warn(`[Keep-alive] Ping failed: ${err.message}`);
    }
  });
  console.log(`[Keep-alive] Pinging ${BACKEND_URL}/health every 14 min (prevents cold starts).`);
};

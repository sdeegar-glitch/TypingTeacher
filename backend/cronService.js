import cron from 'node-cron';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Prevent overlapping runs if generation takes > 1 min
let isRunning = false;

// Retry a Gemini API call up to maxRetries times on 429 rate-limit errors
async function withRetry(fn, maxRetries = 3, baseDelayMs = 15000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.message?.includes('429') || err.message?.includes('Too Many Requests');
      if (is429 && attempt < maxRetries) {
        const delay = baseDelayMs * attempt; // 15s, 30s, 45s
        console.warn(`[CronService] Rate limited (429). Retrying in ${delay / 1000}s... (attempt ${attempt}/${maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Large topic pool — Gemini will search the internet for a real article on
// a randomly chosen topic each time the cron fires.
// ─────────────────────────────────────────────────────────────────────────────
const TOPICS = [
  // Technology
  'artificial intelligence in healthcare', 'quantum computing breakthroughs',
  'cybersecurity threats 2025', 'electric vehicles future', 'blockchain real-world uses',
  'robotics in manufacturing', '5G technology impact', 'augmented reality education',
  'self-driving cars progress', 'open source AI models',

  // Science & Environment
  'climate change solutions', 'renewable energy innovations', 'ocean plastic pollution',
  'space exploration Mars mission', 'gene editing CRISPR therapy', 'biodiversity loss crisis',
  'deep sea discoveries', 'asteroid mining plans', 'solar energy record efficiency',
  'nuclear fusion energy breakthrough',

  // Health & Lifestyle
  'mental health awareness teens', 'benefits of daily exercise', 'sleep science research',
  'plant-based diet health', 'meditation and brain health', 'microbiome gut health',
  'longevity research aging', 'vaccine technology advances', 'digital detox benefits',
  'wearable health technology',

  // Society & Education
  'online learning future education', 'financial literacy youth', 'urban farming cities',
  'women in STEM fields', 'income inequality global', 'gig economy workers rights',
  'homeschooling trends', 'libraries future digital age', 'social media mental health',
  'volunteering community benefits',

  // History & Culture
  'ancient civilizations discoveries', 'cultural heritage preservation',
  'indigenous knowledge conservation', 'history of printing press impact',
  'evolution of human language', 'art museums digital experience',
  'forgotten women history', 'sport as cultural diplomacy',
  'history of public libraries', 'music influence on society',

  // Economy & Business
  'startup ecosystem emerging markets', 'remote work productivity research',
  'sustainable business practices', 'microfinance poverty alleviation',
  'supply chain resilience', 'circular economy examples', 'entrepreneurship education',
  'green hydrogen economy', 'future of retail shopping', 'AI replacing jobs debate',

  // Nature & Animals
  'endangered species conservation', 'coral reef restoration', 'wolf reintroduction ecology',
  'urban wildlife coexistence', 'insect population decline', 'reforestation success stories',
  'animal intelligence research', 'migratory birds climate', 'rewilding projects Europe',
  'marine protected areas',
];

// ─────────────────────────────────────────────────────────────────────────────
// Pick a random topic that hasn't been used recently
// ─────────────────────────────────────────────────────────────────────────────
function getRandomTopic() {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION
// Step 1 → Gemini + Google Search: find & summarize a real web article
// Step 2 → Gemini: rewrite it into structured typing test JSON
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchAndGenerateTests() {
  if (isRunning) {
    console.log('[CronService] Previous generation still running. Skipping this tick.');
    return;
  }
  isRunning = true;
  console.log('\n========== [CronService] Typing Test Generation Started ==========');

  if (!process.env.GEMINI_API_KEY) {
    console.error('[CronService] GEMINI_API_KEY is missing. Skipping.');
    return;
  }

  const topic = getRandomTopic();
  console.log(`[CronService] Selected topic: "${topic}"`);

  try {
    // ── STEP 1: Search the internet for a real article using Gemini grounding ──
    console.log('[CronService] Step 1: Searching the internet for a real article...');

    const searchModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      tools: [{ googleSearch: {} }],
    });

    const searchPrompt = `Search the internet and find a recent, informative article about the topic: "${topic}".

Read the full article carefully and then provide:
1. The article title
2. The source website URL
3. A detailed summary of the full article content in around 700-900 words, capturing all key ideas, facts, statistics, and conclusions from the original.

Format your response as:
TITLE: [article title]
SOURCE: [URL]
CONTENT: [detailed 700-900 word summary]`;

    const searchResult = await withRetry(() => searchModel.generateContent(searchPrompt));
    const rawText = searchResult.response.text();

    // Extract source URL from grounding metadata if available
    let sourceUrl = 'https://www.google.com/search?q=' + encodeURIComponent(topic);
    const groundingChunks = searchResult.response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      sourceUrl = groundingChunks[0]?.web?.uri || sourceUrl;
    }

    // Parse the structured response
    const titleMatch = rawText.match(/TITLE:\s*(.+)/i);
    const contentMatch = rawText.match(/CONTENT:\s*([\s\S]+)/i);

    const foundTitle = titleMatch ? titleMatch[1].trim() : topic;
    const foundContent = contentMatch ? contentMatch[1].trim() : rawText;

    if (!foundContent || foundContent.length < 200) {
      console.warn('[CronService] Step 1 returned too little content. Skipping this run.');
      return;
    }

    console.log(`[CronService] Found article: "${foundTitle}" from ${sourceUrl}`);
    console.log(`[CronService] Content length: ${foundContent.length} chars`);

    // ── STEP 2: Rewrite into a structured typing test JSON ──
    console.log('[CronService] Step 2: Rewriting into typing test JSON...');

    const rewriteModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const rewritePrompt = `You are an expert educational content writer specializing in typing practice material.

Below is a real article found on the internet about "${topic}":

ORIGINAL TITLE: ${foundTitle}
ORIGINAL CONTENT:
${foundContent}

Your task:
1. Rewrite this article in your own words as an original, engaging ~1000-word educational article suitable for typing practice.
2. The rewritten text must be completely readable, with excellent grammar and NO markdown (no **, no #, no bullet points — only plain paragraph text).
3. Determine the difficulty level: 'easy' (simple vocabulary), 'medium' (intermediate), or 'hard' (complex/technical vocabulary).
4. Create an SEO-optimized title, meta description, 2-3 sentence excerpt, a category name, tags, and keywords.

Return ONLY a valid JSON object in exactly this format:
{
  "title": "Engaging, SEO-friendly article title",
  "content": "The full rewritten ~1000-word plain-text article with no markdown...",
  "excerpt": "A 2-3 sentence engaging summary of the article.",
  "difficulty_level": "medium",
  "category": "Technology",
  "seo_title": "SEO Title Here | FastTypingLab",
  "seo_description": "Compelling 150-160 character meta description.",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    const rewriteResult = await withRetry(() => rewriteModel.generateContent(rewritePrompt));
    const rewriteText = rewriteResult.response.text();

    // Parse JSON — strip any accidental markdown code fences
    let jsonString = rewriteText;
    const start = rewriteText.indexOf('{');
    const end = rewriteText.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      jsonString = rewriteText.substring(start, end + 1);
    }

    const generatedData = JSON.parse(jsonString);

    if (!generatedData.title || !generatedData.content) {
      console.error('[CronService] Parsed JSON is missing title or content. Skipping.');
      return;
    }

    // ── STEP 3: Save to Supabase ──
    const wordCount = generatedData.content.trim().split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200);
    const slug =
      generatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now();

    console.log(`[CronService] Saving: "${generatedData.title}" (${wordCount} words, ${generatedData.difficulty_level})`);

    const { error } = await supabase.from('typing_test').insert({
      title: generatedData.title,
      slug,
      original_source: sourceUrl,
      content: generatedData.content,
      excerpt: generatedData.excerpt,
      difficulty_level: generatedData.difficulty_level,
      word_count: wordCount,
      estimated_read_time: estimatedReadTime,
      category: generatedData.category,
      tags: generatedData.tags,
      seo_title: generatedData.seo_title,
      seo_description: generatedData.seo_description,
      keywords: generatedData.keywords,
      typing_duration_options: ['1min', '3min', '5min', '10min'],
    });

    if (error) {
      console.error(`[CronService] DB insert failed: ${error.message}`);
    } else {
      console.log(`[CronService] ✅ Successfully saved: "${generatedData.title}"`);
    }
  } catch (err) {
    console.error(`[CronService] ❌ Error during generation: ${err.message}`);
  } finally {
    isRunning = false;
  }

  console.log('========== [CronService] Generation Complete ==========\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Cron Job Initializer
// ─────────────────────────────────────────────────────────────────────────────
export const initCronJobs = () => {
  // ⚠️ TESTING MODE: every minute. Change to '0 0,12 * * *' for production.
  cron.schedule('* * * * *', () => {
    fetchAndGenerateTests();
  });
  console.log('[CronService] ⚠️  TESTING MODE — generating a new test every minute.');
  console.log('[CronService] Change schedule to "0 0,12 * * *" before going to production.');

  // Keep-alive: ping /health every 14 min to prevent Render free-tier cold starts
  const BACKEND_URL = process.env.BACKEND_URL || 'https://typingteacher-2lnd.onrender.com';
  cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      console.log(`[Keep-alive] Pinged /health → ${res.status}`);
    } catch (err) {
      console.warn(`[Keep-alive] Ping failed: ${err.message}`);
    }
  });
  console.log(`[Keep-alive] Pinging ${BACKEND_URL}/health every 14 min to prevent cold starts.`);
};

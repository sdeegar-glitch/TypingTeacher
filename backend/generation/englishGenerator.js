import { supabase } from '../supabaseClient.js';
import { getRandomTopic } from './topicPool.js';
import { findSourceMaterial } from './sourceEngine.js';
import { findSimilarTest } from './embeddings.js';
import { validateTest, countWords, makeSlug } from './qualityGate.js';
import { DIFFICULTY_MIX_INSTRUCTIONS, buildDifficultyJsonField, normalizeDifficultyBreakdown } from './difficultyMixer.js';
import { rewriteWithGroq } from './groqClient.js';

async function rewriteToTest(topic, foundTitle, foundContent) {
  const prompt = `You are an expert educational writer creating typing practice content for a competitive-exam-style passage.

Source material about "${topic}":
TITLE: ${foundTitle}
CONTENT: ${foundContent}

Rewrite this as a unique, original 600-1500 word article (aim for ~1000 words) for typing practice. Requirements:
- Plain text only, NO markdown, no bullet points, no headers — just flowing paragraphs
- Excellent grammar, clear sentences
- Different enough from the source to be plagiarism-free (your own words and structure)
${DIFFICULTY_MIX_INSTRUCTIONS}
Return ONLY valid JSON:
{
  "title": "Engaging SEO title",
  "content": "Full 600-1500 word plain text article...",
  "excerpt": "2-3 sentence summary.",
  "difficulty_level": "easy|medium|hard",
  "category": "Technology|Science|Health|Society|History|Economy|Nature|...",
  "seo_title": "Title | FastTypingLab",
  "seo_description": "150-160 char meta description",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["kw1", "kw2", "kw3"],
  ${buildDifficultyJsonField()}
}`;

  const rawText = await rewriteWithGroq(prompt);
  const start = rawText.indexOf('{');
  const end = rawText.lastIndexOf('}');
  const jsonString = start !== -1 && end !== -1 ? rawText.substring(start, end + 1) : rawText;
  const data = JSON.parse(jsonString);
  if (!data.title || !data.content) throw new Error('Parsed JSON missing title or content');
  return data;
}

async function logAttempt({ slot, topic, status, testId = null, error = null, attemptCount = 1 }) {
  try {
    await supabase.from('generation_log').insert({
      slot, topic, status, test_id: testId, error, attempt_count: attemptCount,
    });
  } catch (err) {
    // Logging must never take down a generation slot — just surface to console.
    console.warn(`[EnglishGenerator] Failed to write generation_log: ${err.message}`);
  }
}

/**
 * Generates one English test, with one retry on a fresh topic if the first
 * attempt fails quality/duplicate checks. Always resolves (never throws) —
 * failures are logged to generation_log and reported in the return value.
 */
export async function generateEnglishTest() {
  const MAX_ATTEMPTS = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { topic, category } = getRandomTopic('en');
    try {
      const source = await findSourceMaterial(topic, category, 'en');
      if (!source) {
        lastError = 'No source material found from any source.';
        await logAttempt({ slot: 'en', topic, status: 'failed', error: lastError, attemptCount: attempt });
        continue;
      }

      const data = await rewriteToTest(topic, source.title, source.content);
      const { valid, reasons } = validateTest(data);
      if (!valid) {
        lastError = reasons.join('; ');
        await logAttempt({ slot: 'en', topic, status: 'skipped_quality', error: lastError, attemptCount: attempt });
        continue;
      }

      const { isDuplicate, maxSimilarity, hash, embedding } = await findSimilarTest(data.content, 'en');
      if (isDuplicate) {
        lastError = `Too similar to an existing test (similarity ${(maxSimilarity * 100).toFixed(1)}%).`;
        await logAttempt({ slot: 'en', topic, status: 'skipped_duplicate', error: lastError, attemptCount: attempt });
        continue;
      }

      const wordCount = countWords(data.content);
      const slug = makeSlug(data.title);

      const { data: inserted, error: insertError } = await supabase
        .from('typing_test')
        .insert({
          title: data.title,
          slug,
          original_source: source.sourceUrl,
          content: data.content,
          excerpt: data.excerpt,
          difficulty_level: data.difficulty_level,
          word_count: wordCount,
          estimated_read_time: Math.ceil(wordCount / 200),
          category: data.category,
          tags: data.tags,
          seo_title: data.seo_title,
          seo_description: data.seo_description,
          keywords: data.keywords,
          typing_duration_options: ['1min', '3min', '5min', '10min'],
          language: 'en',
          keyboard_layout: null,
          content_hash: hash,
          content_embedding: embedding,
          difficulty_breakdown: normalizeDifficultyBreakdown(data.difficulty_breakdown),
        })
        .select('id')
        .single();

      if (insertError) {
        lastError = insertError.message;
        await logAttempt({ slot: 'en', topic, status: 'failed', error: lastError, attemptCount: attempt });
        continue;
      }

      await logAttempt({ slot: 'en', topic, status: 'success', testId: inserted.id, attemptCount: attempt });
      return { status: 'success', testId: inserted.id, topic };
    } catch (err) {
      lastError = err.message;
      await logAttempt({ slot: 'en', topic, status: 'failed', error: lastError, attemptCount: attempt });
    }
  }

  return { status: 'failed', error: lastError };
}

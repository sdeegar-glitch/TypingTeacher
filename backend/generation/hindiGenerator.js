import { supabase } from '../supabaseClient.js';
import { getRandomTopic } from './topicPool.js';
import { findSourceMaterial } from './sourceEngine.js';
import { findSimilarTest } from './embeddings.js';
import { validateTest, countWords, makeSlug } from './qualityGate.js';
import { DIFFICULTY_MIX_INSTRUCTIONS, buildDifficultyJsonField, normalizeDifficultyBreakdown } from './difficultyMixer.js';
import { unicodeToKrutiDev } from './krutiDevConverter.js';
import { rewriteWithGroq } from './groqClient.js';

async function rewriteToHindiTest(topic, foundTitle, foundContent) {
  const prompt = `आप हिंदी टंकण (typing) अभ्यास के लिए मूल लेख लिखने वाले एक कुशल शिक्षण-लेखक हैं।

विषय "${topic}" पर स्रोत सामग्री:
शीर्षक: ${foundTitle}
सामग्री: ${foundContent}

इसे 600-1500 शब्दों (लक्ष्य ~1000 शब्द) के एक मूल, अद्वितीय हिंदी लेख के रूप में फिर से लिखें — टंकण अभ्यास के लिए। आवश्यकताएँ:
- केवल शुद्ध यूनिकोड देवनागरी पाठ — कोई मार्कडाउन, बुलेट पॉइंट या हेडिंग नहीं, केवल प्रवाहमयी अनुच्छेद
- उत्कृष्ट व्याकरण, स्पष्ट वाक्य
- स्रोत से पर्याप्त भिन्न ताकि यह मूल रचना हो (अपने स्वयं के शब्दों और संरचना में)
${DIFFICULTY_MIX_INSTRUCTIONS}
केवल मान्य JSON लौटाएँ (सभी मान हिंदी में, except difficulty_level/category जो अंग्रेज़ी में रहें):
{
  "title": "आकर्षक शीर्षक (हिंदी में)",
  "content": "600-1500 शब्दों का पूर्ण हिंदी पाठ...",
  "excerpt": "2-3 वाक्यों का सारांश (हिंदी में)",
  "difficulty_level": "easy|medium|hard",
  "category": "Technology|Science|Health|Society|History|Economy|Nature|...",
  "seo_title": "Title | FastTypingLab Hindi Typing",
  "seo_description": "150-160 अक्षरों का मेटा विवरण",
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
    console.warn(`[HindiGenerator] Failed to write generation_log: ${err.message}`);
  }
}

/**
 * Generates one Hindi test for the given keyboard layout.
 * layout: 'mangal_inscript' (Unicode content stored as-is) or
 *         'kruti_dev' (content run through unicodeToKrutiDev before storage).
 * Always resolves (never throws) — failures are logged and reported back.
 */
export async function generateHindiTest(layout) {
  if (!['mangal_inscript', 'kruti_dev'].includes(layout)) {
    throw new Error(`Unknown Hindi keyboard layout: ${layout}`);
  }
  const slot = layout === 'kruti_dev' ? 'hi_kruti' : 'hi_mangal';
  const MAX_ATTEMPTS = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { topic, category } = getRandomTopic('hi');
    try {
      const source = await findSourceMaterial(topic, category, 'hi');
      if (!source) {
        lastError = 'No source material found from any source.';
        await logAttempt({ slot, topic, status: 'failed', error: lastError, attemptCount: attempt });
        continue;
      }

      const data = await rewriteToHindiTest(topic, source.title, source.content);
      const { valid, reasons } = validateTest(data);
      if (!valid) {
        lastError = reasons.join('; ');
        await logAttempt({ slot, topic, status: 'skipped_quality', error: lastError, attemptCount: attempt });
        continue;
      }

      // Similarity/word-count checks run on the underlying Unicode content
      // (pre-conversion) — that's the actual semantic text either way.
      const { isDuplicate, maxSimilarity, hash, embedding } = await findSimilarTest(data.content, 'hi');
      if (isDuplicate) {
        lastError = `Too similar to an existing test (similarity ${(maxSimilarity * 100).toFixed(1)}%).`;
        await logAttempt({ slot, topic, status: 'skipped_duplicate', error: lastError, attemptCount: attempt });
        continue;
      }

      const wordCount = countWords(data.content);
      const finalContent = layout === 'kruti_dev' ? unicodeToKrutiDev(data.content) : data.content;
      const slug = makeSlug(data.title);

      const { data: inserted, error: insertError } = await supabase
        .from('typing_test')
        .insert({
          title: data.title,
          slug,
          original_source: source.sourceUrl,
          content: finalContent,
          display_content: layout === 'kruti_dev' ? data.content : null,
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
          language: 'hi',
          keyboard_layout: layout,
          content_hash: hash,
          content_embedding: embedding,
          difficulty_breakdown: normalizeDifficultyBreakdown(data.difficulty_breakdown),
        })
        .select('id')
        .single();

      if (insertError) {
        lastError = insertError.message;
        await logAttempt({ slot, topic, status: 'failed', error: lastError, attemptCount: attempt });
        continue;
      }

      await logAttempt({ slot, topic, status: 'success', testId: inserted.id, attemptCount: attempt });
      return { status: 'success', testId: inserted.id, topic };
    } catch (err) {
      lastError = err.message;
      await logAttempt({ slot, topic, status: 'failed', error: lastError, attemptCount: attempt });
    }
  }

  return { status: 'failed', error: lastError };
}

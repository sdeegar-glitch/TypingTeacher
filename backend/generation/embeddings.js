// Duplicate / near-duplicate detection: SHA256 exact-hash pre-check, then
// pgvector cosine similarity via the match_typing_test_embedding() RPC
// defined in supabase/migrations/20260624_phase4_ai_generation_upgrade.sql.

import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabaseClient.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// The original spec called for a 20% cap, but that's not realistic for
// embedding cosine similarity: unrelated articles in the same language/
// style/length land naturally in the 40-65% range with this model (verified
// empirically — two manually-confirmed-unrelated Hindi articles scored 57%).
// 90% reliably catches genuine near-duplicates/paraphrases instead.
const SIMILARITY_THRESHOLD = 0.90; // max allowed similarity (90%) vs recent tests
// The topic pool is finite (~150), so after a few months every topic has an
// older article, and a fresh rewrite on the same topic lands at 92-96% vs
// that old one — which blocked nearly every slot. Only tests from the last
// DEDUP_WINDOW_DAYS count as duplicates at 90%; older tests only block a
// near-verbatim copy (>= 97%).
const DEDUP_WINDOW_DAYS = 60;
const NEAR_VERBATIM_THRESHOLD = 0.97;

export function normalizeForHash(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function sha256(text) {
  return crypto.createHash('sha256').update(normalizeForHash(text)).digest('hex');
}

export async function getEmbedding(text) {
  // text-embedding-004 was retired (404s as of mid-2026). gemini-embedding-001
  // defaults to 3072 dims, so outputDimensionality is required to match the
  // existing vector(768) column without a migration.
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent({
    content: { parts: [{ text: text.slice(0, 8000) }] },
    outputDimensionality: 768,
  });
  return result.embedding.values; // number[768]
}

/**
 * Checks a candidate test's content against existing tests in the same
 * language. Returns { isDuplicate, maxSimilarity, hash, embedding }.
 */
export async function findSimilarTest(content, lang) {
  const hash = sha256(content);

  // Fast exact-duplicate pre-check (normalized hash match).
  const { data: hashMatch } = await supabase
    .from('typing_test')
    .select('id')
    .eq('content_hash', hash)
    .limit(1)
    .maybeSingle();

  if (hashMatch) {
    return { isDuplicate: true, maxSimilarity: 1.0, hash, embedding: null };
  }

  let embedding;
  try {
    embedding = await getEmbedding(content);
  } catch (err) {
    console.warn(`[Embeddings] Failed to compute embedding: ${err.message}`);
    // If embeddings fail, don't block generation on this check alone —
    // the hash check above still caught exact dups.
    return { isDuplicate: false, maxSimilarity: 0, hash, embedding: null };
  }

  const { data: matches, error } = await supabase.rpc('match_typing_test_embedding', {
    query_embedding: embedding,
    match_language: lang,
    match_limit: 10,
  });

  if (error) {
    console.warn(`[Embeddings] Similarity RPC failed: ${error.message}`);
    return { isDuplicate: false, maxSimilarity: 0, hash, embedding };
  }

  const close = (matches || []).filter(m => m.similarity >= SIMILARITY_THRESHOLD);
  if (close.length === 0) {
    return { isDuplicate: false, maxSimilarity: matches?.[0]?.similarity ?? 0, hash, embedding };
  }

  const { data: rows } = await supabase
    .from('typing_test')
    .select('id, created_at')
    .in('id', close.map(m => m.id));
  const createdAt = new Map((rows || []).map(r => [r.id, new Date(r.created_at).getTime()]));
  const windowStart = Date.now() - DEDUP_WINDOW_DAYS * 24 * 3600 * 1000;

  const blocking = close.filter(m =>
    m.similarity >= NEAR_VERBATIM_THRESHOLD || (createdAt.get(m.id) ?? Date.now()) >= windowStart
  );
  const maxSimilarity = blocking[0]?.similarity ?? close[0].similarity;
  return { isDuplicate: blocking.length > 0, maxSimilarity, hash, embedding };
}

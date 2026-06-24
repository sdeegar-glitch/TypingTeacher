// Structural quality gate run before any generated test is published.
// This is a structural/heuristic check, not a full grammar engine — Gemini's
// own output quality is the first line of defense; this catches the things
// that actually break the site (bad word count, missing SEO fields, bad slug).

const REQUIRED_FIELDS = [
  'title', 'content', 'excerpt', 'difficulty_level', 'category',
  'seo_title', 'seo_description', 'keywords', 'tags',
];

const MIN_WORDS = 600;
const MAX_WORDS = 1500;

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9ऀ-ॿ]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
}

/**
 * Lightweight readability heuristic: flags content that's almost certainly
 * malformed (e.g. one giant run-on sentence, or excessive repeated
 * punctuation/markdown artifacts that slipped through the rewrite).
 */
function readabilityIssues(content) {
  const issues = [];
  const sentences = content.split(/(?<=[.!?।])\s+/).filter(s => s.trim().length > 0);
  if (sentences.length < 5) {
    issues.push('Too few sentences for the word count — likely malformed content.');
  }
  const avgLen = content.length / Math.max(sentences.length, 1);
  if (avgLen > 400) {
    issues.push('Average sentence length is too long — likely missing punctuation.');
  }
  if (/[#*_`]{2,}|\[.*\]\(.*\)/.test(content)) {
    issues.push('Content contains leftover markdown syntax.');
  }
  return issues;
}

/**
 * Validates a generated test payload before it's persisted.
 * Returns { valid: boolean, reasons: string[] }.
 */
export function validateTest(data) {
  const reasons = [];

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      reasons.push(`Missing required field: ${field}`);
    }
  }

  if (typeof data.content === 'string') {
    const wordCount = countWords(data.content);
    if (wordCount < MIN_WORDS) reasons.push(`Word count ${wordCount} is below minimum ${MIN_WORDS}.`);
    if (wordCount > MAX_WORDS) reasons.push(`Word count ${wordCount} exceeds maximum ${MAX_WORDS}.`);
    reasons.push(...readabilityIssues(data.content));
  } else {
    reasons.push('content must be a string.');
  }

  if (!['easy', 'medium', 'hard'].includes(data.difficulty_level)) {
    reasons.push(`difficulty_level must be easy|medium|hard, got "${data.difficulty_level}".`);
  }

  return { valid: reasons.length === 0, reasons };
}

export { MIN_WORDS, MAX_WORDS };

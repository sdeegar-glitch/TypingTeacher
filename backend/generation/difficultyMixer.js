// Shared prompt fragment + parsing helpers for the easy/medium/hard word-mix
// and "real exam passage" content requirements, reused by the English and
// Hindi rewrite prompts so both stay consistent.

export const DIFFICULTY_MIX_INSTRUCTIONS = `
Difficulty mix (apply across the whole passage, by word/phrase difficulty):
- ~40% easy words/phrases (common, short, everyday vocabulary)
- ~40% medium words/phrases (moderately complex, domain-relevant vocabulary)
- ~20% hard words/phrases (technical, formal, or low-frequency vocabulary)

Also include, naturally woven into the passage (not as a checklist):
- Numbers (e.g. statistics, counts)
- At least one date
- At least one currency value
- Varied punctuation: commas, semicolons, colons
- At least one quotation in quotation marks
- At least one special symbol (%, &, @, #, or similar) where natural
- A mix of long and short sentences, like a real competitive-exam reading passage
`;

export function buildDifficultyJsonField() {
  return `"difficulty_breakdown": {"easy_pct": 40, "medium_pct": 40, "hard_pct": 20}`;
}

/**
 * Normalizes whatever the model reports into a clean 0-100 breakdown object,
 * defaulting to the target mix if the model omitted/mangled it. Different
 * models report this on different scales (e.g. Groq's gpt-oss-120b returned
 * fractions like 0.4 instead of 40) — detect and rescale rather than trust
 * the raw numbers.
 */
export function normalizeDifficultyBreakdown(reported) {
  const fallback = { easy_pct: 40, medium_pct: 40, hard_pct: 20 };
  if (!reported || typeof reported !== 'object') return fallback;
  let { easy_pct, medium_pct, hard_pct } = reported;
  const allNumbers = [easy_pct, medium_pct, hard_pct].every(n => typeof n === 'number' && n >= 0);
  if (!allNumbers) return fallback;

  const sum = easy_pct + medium_pct + hard_pct;
  if (sum <= 0) return fallback;
  // Rescale to a 0-100 sum regardless of whether the model reported
  // fractions (sum ~1) or percentages (sum ~100).
  const scale = 100 / sum;
  return {
    easy_pct: Math.round(easy_pct * scale),
    medium_pct: Math.round(medium_pct * scale),
    hard_pct: Math.round(hard_pct * scale),
  };
}

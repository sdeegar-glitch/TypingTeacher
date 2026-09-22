// Shared prompt fragments + parsing helpers for the easy/medium/hard word-mix
// and "real exam passage" content requirements, reused by the English and
// Hindi rewrite prompts so both stay consistent.
//
// The overall difficulty tier (easy/medium/hard) for a test is decided by the
// CALLER before generation (see cronService.js's difficultyPlanForCount) and
// baked into the prompt below, then written to the database as-is — it is no
// longer left to the model to self-report after the fact. Letting the model
// choose freely, while every prompt asked for the same word-mix regardless of
// tier, is why nearly every generated test ended up classified "medium".

const TIER_INSTRUCTIONS = {
  easy: `Overall difficulty: EASY. Use mostly short, common, everyday words and simple sentence structure — the kind a beginner typist (home-row level) can read and type comfortably. Roughly 70% easy words, 25% medium, 5% hard/technical.`,
  medium: `Overall difficulty: MEDIUM. A mix of everyday and moderately complex, domain-relevant vocabulary, with some longer sentences — the level of a typical newspaper feature. Roughly 40% easy words, 40% medium, 20% hard/technical.`,
  hard: `Overall difficulty: HARD. Favour technical, formal or low-frequency vocabulary, longer and more complex sentences, and denser factual content — the level of an exam-prep or professional/academic passage. Roughly 15% easy words, 35% medium, 50% hard/technical.`,
};

export function difficultyMixInstructions(tier) {
  const key = ['easy', 'medium', 'hard'].includes(tier) ? tier : 'medium';
  return `
${TIER_INSTRUCTIONS[key]}

Also include, naturally woven into the passage (not as a checklist):
- Numbers (e.g. statistics, counts)
- At least one date
- At least one currency value
- Varied punctuation: commas, semicolons, colons
- At least one quotation in quotation marks
- At least one special symbol (%, &, @, #, or similar) where natural
- A mix of long and short sentences, like a real competitive-exam reading passage
`;
}

export function buildDifficultyJsonField() {
  // Still asked as a self-reported estimate for the internal word-level mix
  // (used for analytics only) — the stored difficulty_level itself comes
  // from the caller's target tier, not from this or from the model.
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

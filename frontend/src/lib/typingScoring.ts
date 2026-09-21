/**
 * Word-level typing scoring shared by exam mode (and, via scorePractice, by
 * practice mode), replacing the ~8 divergent formulas that lived in individual
 * pages.
 *
 * Exam profiles follow the rules as published by SSC-focused sources:
 *   ssc   full mistake (1 word): wrong / omitted / extra / repeated / incomplete word
 *         half mistake (0.5):    punctuation, spacing (missing/extra space), transposition
 *         net words = gross words (key depressions / 5) - deductions
 *   cpct  wrong words are simply NOT counted (no deduction); net words = correct words
 *   kdph  same deductions as ssc, and reports key depressions per hour
 *
 * IMPORTANT: these rules come from third-party summaries, not the official
 * notifications. Keep them here as named constants so they can be corrected in
 * one place, and show users a "confirm with your exam notification" note.
 *
 * Error-rate reporting follows Soukoreff & MacKenzie (CHI 2003): corrected and
 * uncorrected errors are reported separately, not as a single number.
 */
import { codePointCount } from './graphemes';

export type ScoringProfile = 'ssc' | 'cpct' | 'kdph';

export type MistakeReason =
  | 'wrong' | 'omitted' | 'extra' | 'repeated' | 'incomplete'
  | 'punctuation' | 'spacing' | 'transposition';

export interface WordMistake {
  kind: 'full' | 'half';
  reason: MistakeReason;
  expected: string | null; // passage word(s); null for an extra word
  typed: string | null;    // typed word(s); null for an omitted word
  passageIndex: number;    // first passage word involved
}

export interface ExamScoreInput {
  passage: string;
  typed: string;
  elapsedSeconds: number;
  profile: ScoringProfile;
  /** Every character key press, incl. spaces and corrections. Defaults to typed length in code points. */
  keyDepressions?: number;
}

export interface ExamScore {
  profile: ScoringProfile;
  typedWords: number;
  correctWords: number;
  fullMistakes: number;
  halfMistakes: number;
  deductions: number;   // 0 for cpct
  grossWords: number;
  netWords: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;     // 0-100
  kdph: number;         // key depressions per hour
  keyDepressions: number;
  mistakes: WordMistake[];
}

// ── Tunable rules ───────────────────────────────────────────────────────────
export const RULES = {
  fullMistakeWeight: 1,
  halfMistakeWeight: 0.5,
  /** Characters per "gross word" (key depressions / 5). */
  charsPerWord: 5,
  /** How far past the typed word count the passage may be aligned (omissions near the end). */
  alignSlack: 5,
} as const;

/** Minutes used for speed: real elapsed time, floored at 1 s so a 0 s run cannot divide by zero. */
export function minutesFor(elapsedSeconds: number): number {
  return Math.max(elapsedSeconds, 1) / 60;
}

export function splitWords(s: string): string[] {
  const t = s.trim();
  return t ? t.split(/\s+/) : [];
}

const stripPunct = (w: string) => w.replace(/[\p{P}\p{S}]/gu, '');

// alignment operations
const OP = { NONE: 0, MATCH: 1, PUNCT: 2, SUB: 3, INS: 4, DEL: 5, MERGE: 6, SPLIT: 7, TRANSP: 8 } as const;

interface Alignment {
  mistakes: WordMistake[];
  correctWords: number;
}

/**
 * Aligns typed words to the passage (Damerau-style word edit distance with
 * spacing/punctuation/transposition as half-cost operations). The end of the
 * alignment is free within a small window, so stopping early does not make the
 * untyped remainder count as omissions.
 */
export function alignWords(passageWords: string[], typedWords: string[]): Alignment {
  const n = typedWords.length;
  if (n === 0) return { mistakes: [], correctWords: 0 };
  const m = Math.min(passageWords.length, n + RULES.alignSlack);
  const P = passageWords.slice(0, m);
  const T = typedWords;
  const W = m + 1;

  const D = new Float64Array((n + 1) * W).fill(Infinity);
  const B = new Uint8Array((n + 1) * W);
  const at = (i: number, j: number) => i * W + j;

  D[at(0, 0)] = 0;
  for (let j = 1; j <= m; j++) { D[at(0, j)] = D[at(0, j - 1)] + 1; B[at(0, j)] = OP.DEL; }
  for (let i = 1; i <= n; i++) { D[at(i, 0)] = D[at(i - 1, 0)] + 1; B[at(i, 0)] = OP.INS; }

  const try_ = (i: number, j: number, cost: number, op: number) => {
    if (cost < D[at(i, j)] - 1e-9) { D[at(i, j)] = cost; B[at(i, j)] = op; }
  };

  // Per-word values used in the inner loop, computed once (string building and
  // regex work inside an O(n*m) loop made long runs slow).
  const Ps = P.map(stripPunct);
  const Ts = T.map(stripPunct);
  const PP = P.map((w, k) => (k >= 1 ? P[k - 1] + w : ''));   // PP[k] = P[k-1] + P[k]
  const TT = T.map((w, k) => (k >= 1 ? T[k - 1] + w : ''));   // TT[k] = T[k-1] + T[k]

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const t = T[i - 1], p = P[j - 1];
      // preference order (first wins ties): match, half-cost ops, substitution, insert, delete
      if (t === p) try_(i, j, D[at(i - 1, j - 1)], OP.MATCH);
      else if (Ts[i - 1] !== '' && Ts[i - 1] === Ps[j - 1]) try_(i, j, D[at(i - 1, j - 1)] + RULES.halfMistakeWeight, OP.PUNCT);
      if (j >= 2 && t === PP[j - 1]) try_(i, j, D[at(i - 1, j - 2)] + RULES.halfMistakeWeight, OP.MERGE);
      if (i >= 2 && TT[i - 1] === p) try_(i, j, D[at(i - 2, j - 1)] + RULES.halfMistakeWeight, OP.SPLIT);
      if (i >= 2 && j >= 2 && T[i - 2] === p && t === P[j - 2] && t !== T[i - 2]) {
        try_(i, j, D[at(i - 2, j - 2)] + RULES.halfMistakeWeight, OP.TRANSP);
      }
      try_(i, j, D[at(i - 1, j - 1)] + RULES.fullMistakeWeight, OP.SUB);
      try_(i, j, D[at(i - 1, j)] + RULES.fullMistakeWeight, OP.INS);
      try_(i, j, D[at(i, j - 1)] + RULES.fullMistakeWeight, OP.DEL);
    }
  }

  // free end within the slack window; ties prefer the end closest to n
  let bestJ = 0, best = Infinity;
  for (let j = Math.max(0, n - RULES.alignSlack); j <= m; j++) {
    const c = D[at(n, j)];
    if (c < best - 1e-9 || (Math.abs(c - best) < 1e-9 && Math.abs(j - n) < Math.abs(bestJ - n))) { best = c; bestJ = j; }
  }

  const mistakes: WordMistake[] = [];
  let correct = 0;
  let i = n, j = bestJ;
  while (i > 0 || j > 0) {
    const op = B[at(i, j)];
    switch (op) {
      case OP.MATCH: correct++; i--; j--; break;
      case OP.PUNCT:
        mistakes.push({ kind: 'half', reason: 'punctuation', expected: P[j - 1], typed: T[i - 1], passageIndex: j - 1 });
        i--; j--; break;
      case OP.SUB: {
        const incomplete = P[j - 1].startsWith(T[i - 1]) && T[i - 1].length < P[j - 1].length;
        mistakes.push({ kind: 'full', reason: incomplete ? 'incomplete' : 'wrong', expected: P[j - 1], typed: T[i - 1], passageIndex: j - 1 });
        i--; j--; break;
      }
      case OP.INS:
        mistakes.push({
          // a repeat duplicates a neighbouring typed word (either side: the aligner
          // may keep the first or the second copy as the "real" one)
          kind: 'full', reason: (i >= 2 && T[i - 1] === T[i - 2]) || (i < n && T[i - 1] === T[i]) ? 'repeated' : 'extra',
          expected: null, typed: T[i - 1], passageIndex: j,
        });
        i--; break;
      case OP.DEL:
        mistakes.push({ kind: 'full', reason: 'omitted', expected: P[j - 1], typed: null, passageIndex: j - 1 });
        j--; break;
      case OP.MERGE:
        mistakes.push({ kind: 'half', reason: 'spacing', expected: `${P[j - 2]} ${P[j - 1]}`, typed: T[i - 1], passageIndex: j - 2 });
        i--; j -= 2; break;
      case OP.SPLIT:
        mistakes.push({ kind: 'half', reason: 'spacing', expected: P[j - 1], typed: `${T[i - 2]} ${T[i - 1]}`, passageIndex: j - 1 });
        i -= 2; j--; break;
      case OP.TRANSP:
        mistakes.push({ kind: 'half', reason: 'transposition', expected: `${P[j - 2]} ${P[j - 1]}`, typed: `${T[i - 2]} ${T[i - 1]}`, passageIndex: j - 2 });
        i -= 2; j -= 2; break;
      default: i = 0; j = 0; // unreachable safety
    }
  }
  mistakes.reverse();
  return { mistakes, correctWords: correct };
}

/** Score a finished (or stopped) exam run under one of the exam profiles. */
export function scoreExam(input: ExamScoreInput): ExamScore {
  const passageWords = splitWords(input.passage);
  const typedWords = splitWords(input.typed);
  const { mistakes, correctWords } = alignWords(passageWords, typedWords);

  const full = mistakes.filter(x => x.kind === 'full').length;
  const half = mistakes.filter(x => x.kind === 'half').length;
  const keyDepressions = input.keyDepressions ?? codePointCount(input.typed);
  const minutes = minutesFor(input.elapsedSeconds);
  const grossWords = keyDepressions / RULES.charsPerWord;

  let deductions: number;
  let netWords: number;
  let accuracy: number;
  if (input.profile === 'cpct') {
    // wrong words are not counted, nothing is deducted
    deductions = 0;
    netWords = correctWords;
    accuracy = typedWords.length ? (correctWords / typedWords.length) * 100 : 100;
  } else {
    deductions = full * RULES.fullMistakeWeight + half * RULES.halfMistakeWeight;
    netWords = Math.max(0, grossWords - deductions);
    accuracy = typedWords.length ? Math.max(0, 100 - (deductions / typedWords.length) * 100) : 100;
  }

  return {
    profile: input.profile,
    typedWords: typedWords.length,
    correctWords,
    fullMistakes: full,
    halfMistakes: half,
    deductions,
    grossWords,
    netWords,
    grossWpm: grossWords / minutes,
    netWpm: netWords / minutes,
    accuracy,
    kdph: keyDepressions / (minutes / 60),
    keyDepressions,
    mistakes,
  };
}

// ── Practice mode (character level; same formulas the live engine used) ─────
export interface PracticeScoreInput {
  typedChars: number;
  errors: number;
  elapsedSeconds: number;
  /** Strict mode counts rejected keystrokes in the accuracy denominator. */
  rejectedKeystrokes?: number;
}

export interface PracticeScore {
  grossWpm: number;
  netWpm: number;
  cpm: number;
  accuracy: number;
}

export function scorePractice(input: PracticeScoreInput): PracticeScore {
  const minutes = minutesFor(input.elapsedSeconds);
  const grossWpm = Math.round(input.typedChars / RULES.charsPerWord / minutes);
  const denom = input.typedChars + (input.rejectedKeystrokes ?? 0);
  return {
    grossWpm,
    netWpm: Math.max(0, Math.round(grossWpm - input.errors / minutes)),
    cpm: Math.round(input.typedChars / minutes),
    accuracy: denom > 0 ? Math.round(((denom - input.errors) / denom) * 100) : 100,
  };
}

// ── Corrected / uncorrected error rates (Soukoreff & MacKenzie, CHI 2003) ───
export interface ErrorRates {
  total: number;
  corrected: number;
  uncorrected: number;
}

/**
 * correct = right characters in the final text, incorrectNotFixed = wrong
 * characters left in it, incorrectFixed = wrong characters typed then corrected
 * (approximated by the number of correcting deletions).
 */
export function errorRates(c: { correct: number; incorrectNotFixed: number; incorrectFixed: number }): ErrorRates {
  const denom = c.correct + c.incorrectNotFixed + c.incorrectFixed;
  if (denom <= 0) return { total: 0, corrected: 0, uncorrected: 0 };
  return {
    total: ((c.incorrectNotFixed + c.incorrectFixed) / denom) * 100,
    corrected: (c.incorrectFixed / denom) * 100,
    uncorrected: (c.incorrectNotFixed / denom) * 100,
  };
}

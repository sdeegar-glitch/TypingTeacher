import { describe, it, expect } from 'vitest';
import offlineTests from '../data/offlineTests.json';
import { splitClusters, clusterCount, codePointCount } from './graphemes';
import { normalizeTypingText } from './hindiInput';
import {
  scoreExam, scorePractice, errorRates, alignWords, splitWords, minutesFor, RULES,
} from './typingScoring';

const P = 'मेरा घर बहुत सुंदर है और वहाँ प्रतिक्रिया अच्छी रही।';
const exam = (typed: string, profile: 'ssc' | 'cpct' | 'kdph' = 'ssc', elapsedSeconds = 60, passage = P) =>
  scoreExam({ passage, typed, elapsedSeconds, profile });

describe('graphemes', () => {
  it('treats a conjunct as one cluster (8 code points, 3 clusters)', () => {
    expect(codePointCount('क्षत्रिय')).toBe(8);
    expect(splitClusters('क्षत्रिय')).toEqual(['क्ष', 'त्रि', 'य']);
  });
  it('keeps a consonant+matra together and handles empty input', () => {
    expect(clusterCount('कि')).toBe(1);
    expect(splitClusters('')).toEqual([]);
  });
  it('counts ASCII normally', () => {
    expect(splitClusters('abc')).toEqual(['a', 'b', 'c']);
  });
});

describe('scoreExam — SSC full / half mistakes', () => {
  it('a perfect run has no mistakes', () => {
    const r = exam(P);
    expect(r.mistakes).toEqual([]);
    expect(r.fullMistakes).toBe(0);
    expect(r.halfMistakes).toBe(0);
    expect(r.correctWords).toBe(splitWords(P).length);
    expect(r.accuracy).toBe(100);
  });

  it('a wrong word is one full mistake', () => {
    const r = exam(P.replace('सुंदर', 'सुन्दर'));
    expect(r.fullMistakes).toBe(1);
    expect(r.halfMistakes).toBe(0);
    expect(r.mistakes[0]).toMatchObject({ kind: 'full', reason: 'wrong', expected: 'सुंदर', typed: 'सुन्दर' });
  });

  it('an omitted word is a full mistake', () => {
    const r = exam(P.replace('बहुत ', ''));
    expect(r.fullMistakes).toBe(1);
    expect(r.mistakes[0]).toMatchObject({ kind: 'full', reason: 'omitted', expected: 'बहुत', typed: null });
  });

  it('an added word is a full mistake', () => {
    const r = exam(P.replace('घर ', 'घर नया '));
    expect(r.fullMistakes).toBe(1);
    expect(r.mistakes[0]).toMatchObject({ kind: 'full', reason: 'extra', typed: 'नया' });
  });

  it('a repeated word is a full mistake with reason "repeated"', () => {
    const r = exam(P.replace('घर ', 'घर घर '));
    expect(r.fullMistakes).toBe(1);
    expect(r.mistakes[0].reason).toBe('repeated');
  });

  it('a half-typed word is a full mistake with reason "incomplete"', () => {
    const r = exam(P.replace('प्रतिक्रिया', 'प्रति'));
    expect(r.fullMistakes).toBe(1);
    expect(r.mistakes[0]).toMatchObject({ kind: 'full', reason: 'incomplete' });
  });

  it('omitted punctuation is a half mistake', () => {
    const r = exam(P.replace('रही।', 'रही'));
    expect(r.halfMistakes).toBe(1);
    expect(r.fullMistakes).toBe(0);
    expect(r.mistakes[0]).toMatchObject({ kind: 'half', reason: 'punctuation' });
  });

  it('a missing space is a half mistake', () => {
    const r = exam(P.replace('बहुत सुंदर', 'बहुतसुंदर'));
    expect(r.halfMistakes).toBe(1);
    expect(r.fullMistakes).toBe(0);
    expect(r.mistakes[0]).toMatchObject({ kind: 'half', reason: 'spacing' });
  });

  it('an extra space inside a word is a half mistake', () => {
    const r = exam(P.replace('बहुत', 'बहु त'));
    expect(r.halfMistakes).toBe(1);
    expect(r.fullMistakes).toBe(0);
    expect(r.mistakes[0].reason).toBe('spacing');
  });

  it('swapped adjacent words are one half mistake (transposition)', () => {
    const r = exam(P.replace('बहुत सुंदर', 'सुंदर बहुत'));
    expect(r.halfMistakes).toBe(1);
    expect(r.fullMistakes).toBe(0);
    expect(r.mistakes[0].reason).toBe('transposition');
  });

  it('stopping early does not count the untyped rest as omissions', () => {
    const r = exam('मेरा घर बहुत');
    expect(r.mistakes).toEqual([]);
    expect(r.correctWords).toBe(3);
  });

  it('net words = gross words - (full + 0.5*half)', () => {
    const typed = P.replace('सुंदर', 'सुन्दर').replace('रही।', 'रही'); // 1 full + 1 half
    const r = exam(typed, 'ssc', 60);
    expect(r.deductions).toBe(1.5);
    expect(r.grossWords).toBeCloseTo(codePointCount(typed) / 5, 6);
    expect(r.netWords).toBeCloseTo(r.grossWords - 1.5, 6);
    expect(r.netWpm).toBeCloseTo(r.netWords / 1, 6); // 60 s = 1 minute
  });

  it('net words never go negative', () => {
    const r = scoreExam({ passage: 'a b c d e f', typed: 'x y z', elapsedSeconds: 60, profile: 'ssc', keyDepressions: 1 });
    expect(r.netWords).toBe(0);
    expect(r.netWpm).toBe(0);
  });
});

describe('scoreExam — CPCT and KDPH', () => {
  it('CPCT does not deduct: net words = correct words', () => {
    const typed = P.replace('सुंदर', 'सुन्दर'); // one wrong word
    const r = exam(typed, 'cpct', 60);
    expect(r.deductions).toBe(0);
    expect(r.correctWords).toBe(splitWords(P).length - 1);
    expect(r.netWords).toBe(r.correctWords);
    expect(r.accuracy).toBeCloseTo((r.correctWords / r.typedWords) * 100, 6);
  });

  it('KDPH reports key depressions per hour and keeps SSC-style deductions', () => {
    const r = scoreExam({ passage: P, typed: P, elapsedSeconds: 600, profile: 'kdph', keyDepressions: 1500 });
    expect(r.kdph).toBeCloseTo(9000, 6); // 1500 keys in 10 min = 9000 / hour
    expect(r.deductions).toBe(0);
  });

  it('uses supplied key depressions instead of typed length', () => {
    const r = scoreExam({ passage: P, typed: P, elapsedSeconds: 60, profile: 'ssc', keyDepressions: 500 });
    expect(r.grossWords).toBe(100);
  });
});

describe('time floor', () => {
  it('never divides by zero and never inflates below 1 second', () => {
    expect(minutesFor(0)).toBeCloseTo(1 / 60, 9);
    const r = scoreExam({ passage: P, typed: P, elapsedSeconds: 0, profile: 'ssc' });
    expect(Number.isFinite(r.netWpm)).toBe(true);
  });
});

describe('scorePractice matches the live engine formulas', () => {
  it('gross, net, cpm and accuracy', () => {
    // 300 chars in 60 s with 3 errors: gross 60, net 57
    const r = scorePractice({ typedChars: 300, errors: 3, elapsedSeconds: 60 });
    expect(r).toEqual({ grossWpm: 60, netWpm: 57, cpm: 300, accuracy: 99 });
  });
  it('strict-mode rejections count in the accuracy denominator', () => {
    const r = scorePractice({ typedChars: 90, errors: 10, elapsedSeconds: 60, rejectedKeystrokes: 10 });
    expect(r.accuracy).toBe(90);
  });
  it('is 100% accurate with no input', () => {
    expect(scorePractice({ typedChars: 0, errors: 0, elapsedSeconds: 0 }).accuracy).toBe(100);
  });
});

describe('errorRates (Soukoreff & MacKenzie)', () => {
  it('reports corrected and uncorrected separately', () => {
    const r = errorRates({ correct: 90, incorrectNotFixed: 4, incorrectFixed: 6 });
    expect(r.total).toBeCloseTo(10, 6);
    expect(r.uncorrected).toBeCloseTo(4, 6);
    expect(r.corrected).toBeCloseTo(6, 6);
  });
  it('handles no input', () => {
    expect(errorRates({ correct: 0, incorrectNotFixed: 0, incorrectFixed: 0 })).toEqual({ total: 0, corrected: 0, uncorrected: 0 });
  });
});

describe('real Mangal passages', () => {
  const tests = (offlineTests as unknown as Array<{ content: string; keyboard_layout: string | null }>)
    .filter(t => t.keyboard_layout === 'mangal_inscript');

  it('typing a normalised passage perfectly scores zero mistakes', () => {
    expect(tests.length).toBeGreaterThan(0);
    for (const t of tests) {
      const passage = normalizeTypingText(t.content);
      const r = scoreExam({ passage, typed: passage, elapsedSeconds: 600, profile: 'ssc' });
      expect(r.mistakes).toEqual([]);
      expect(r.correctWords).toBe(splitWords(passage).length);
    }
  });

  it('three corrupted words give exactly three full mistakes', () => {
    const passage = normalizeTypingText(tests[0].content);
    const words = splitWords(passage);
    const typed = words.map((w, i) => (i === 10 || i === 60 || i === 200 ? w + 'x' : w)).join(' ');
    const r = scoreExam({ passage, typed, elapsedSeconds: 600, profile: 'ssc' });
    expect(r.fullMistakes).toBe(3);
    expect(r.halfMistakes).toBe(0);
  });

  it('aligns a ~600-word run quickly', () => {
    const passage = normalizeTypingText(tests[0].content);
    const start = performance.now();
    alignWords(splitWords(passage), splitWords(passage));
    expect(performance.now() - start).toBeLessThan(500);
  });
});

describe('rules are exposed for one-place correction', () => {
  it('has the published weights', () => {
    expect(RULES.fullMistakeWeight).toBe(1);
    expect(RULES.halfMistakeWeight).toBe(0.5);
    expect(RULES.charsPerWord).toBe(5);
  });
});

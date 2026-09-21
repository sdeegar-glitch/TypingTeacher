import { describe, it, expect } from 'vitest';
import {
  createState, applyValue, mistakeIndices, errorCount, getKeyStats, canDelete,
  type TypingOptions, type TypingState,
} from './typingReducer';

const LENIENT: TypingOptions = { skipWordOnSpace: true, strict: false };
const STRICT: TypingOptions = { skipWordOnSpace: false, strict: true };
const EXAM: TypingOptions = { skipWordOnSpace: false, strict: false };

/** Type a string one code point at a time, the way the textarea reports it. */
function type(state: TypingState, s: string, opts = LENIENT, t0 = 0): TypingState {
  let st = state;
  let t = t0;
  for (const ch of s) {
    st = applyValue(st, st.typed + ch, opts, (t += 100)).state;
  }
  return st;
}

describe('applyValue — appending', () => {
  it('records correct characters', () => {
    const st = type(createState('abc'), 'abc');
    expect(st.typed).toBe('abc');
    expect(mistakeIndices(st)).toEqual([]);
    expect(st.keystrokes).toBe(3);
    expect(st.corrections).toBe(0);
  });

  it('records a wrong character as a mistake (lenient)', () => {
    const st = type(createState('abc'), 'axc');
    expect(st.typed).toBe('axc');
    expect(mistakeIndices(st)).toEqual([1]);
    expect(errorCount(st, false)).toBe(1);
  });

  it('strict mode rejects a wrong character and asks the DOM to restore the value', () => {
    const s0 = type(createState('abc'), 'a', STRICT);
    const r = applyValue(s0, 'ax', STRICT, 500);
    expect(r.rejected).toBe(true);
    expect(r.needsSync).toBe(true);
    expect(r.state.typed).toBe('a');
    expect(r.state.rejected).toBe(1);
    expect(errorCount(r.state, true)).toBe(1);
  });

  it('accepts a multi-code-point insertion in one edit (ligature key)', () => {
    const r = applyValue(createState('क्षमा'), 'क्ष', EXAM, 100);
    expect(r.state.typed).toBe('क्ष');
    expect(mistakeIndices(r.state)).toEqual([]);
    expect(r.state.keystrokes).toBe(3);
  });

  it('ignores input past the end of the passage', () => {
    const st = type(createState('ab'), 'abzz');
    expect(st.typed).toBe('ab');
  });

  it('maps a Devanagari digit onto an expected ASCII digit', () => {
    const r = applyValue(createState('2026'), '२', EXAM, 100);
    expect(r.state.typed).toBe('2');
    expect(r.needsSync).toBe(true); // textarea must be rewritten to "2"
  });

  it('converts a typed line break into a space and asks for a resync', () => {
    const r = applyValue(createState('a b'), 'a\n', EXAM, 100);
    expect(r.state.typed).toBe('a ');
    expect(r.needsSync).toBe(true);
  });

  it('is idempotent for an unchanged value', () => {
    const st = type(createState('abc'), 'ab');
    const r = applyValue(st, 'ab', LENIENT, 999);
    expect(r.state).toBe(st);
    expect(r.needsSync).toBe(false);
  });
});

describe('applyValue — deleting', () => {
  it('shortens the text, clears the mistake and counts a correction', () => {
    let st = type(createState('abc'), 'ax');
    st = applyValue(st, 'a', LENIENT, 900).state;
    expect(st.typed).toBe('a');
    expect(mistakeIndices(st)).toEqual([]);
    expect(st.corrections).toBe(1);
  });

  it('deleting several code points at once counts each as a correction', () => {
    let st = type(createState('क्षमा'), 'क्षमा', EXAM);
    st = applyValue(st, '', EXAM, 900).state;
    expect(st.typed).toBe('');
    expect(st.corrections).toBe(Array.from('क्षमा').length);
  });
});

describe('skip-word (practice mode)', () => {
  it('Space mid-word jumps to the next word and marks the skipped letters as errors', () => {
    const st = type(createState('abc def'), 'a ');
    expect(st.typed).toBe('abc ');
    expect([...st.skipped]).toEqual([1, 2]);
    expect(mistakeIndices(st)).toEqual([]);
    expect(errorCount(st, false)).toBe(2);
  });

  it('does not skip on a Space at the end of a word', () => {
    const st = type(createState('abc def'), 'abc ');
    expect(st.typed).toBe('abc ');
    expect(st.skipped.size).toBe(0);
  });

  it('is disabled in exam mode: a wrong Space is just a wrong character', () => {
    const st = type(createState('abc def'), 'a ', EXAM);
    expect(st.typed).toBe('a ');
    expect(st.skipped.size).toBe(0);
    expect(mistakeIndices(st)).toEqual([1]);
  });

  it('FIX vs v1: deleting back over a skipped word clears the stale skipped marks', () => {
    let st = type(createState('abc def'), 'a ');   // typed "abc ", skipped {1,2}
    st = applyValue(st, 'a', LENIENT, 900).state;   // delete the auto-filled "bc "
    expect(st.typed).toBe('a');
    expect(st.skipped.size).toBe(0);
    expect(errorCount(st, false)).toBe(0);
  });
});

describe('applyValue — edits in the middle (autocorrect)', () => {
  it('handles a replacement that is not at the end', () => {
    let st = type(createState('hello world'), 'helo wor', EXAM);
    st = applyValue(st, 'hello wor', EXAM, 900).state;
    expect(st.typed).toBe('hello wor');
    expect(mistakeIndices(st)).toEqual([]);
  });
});

describe('key stats (heatmap data)', () => {
  it('counts hits/errors against the EXPECTED character', () => {
    const st = type(createState('aab'), 'axb');
    const stats = getKeyStats(st);
    const a = stats.find(k => k.key === 'a')!;
    expect(a.hits).toBe(2);        // typed 'a' then 'x' where 'a' was expected
    expect(a.errors).toBe(1);
    expect(stats.find(k => k.key === 'b')!.errors).toBe(0);
  });

  it('caps the per-key gap at 3000 ms and skips the first keystroke gap', () => {
    let st = applyValue(createState('ab'), 'a', EXAM, 1_000).state;
    st = applyValue(st, 'ab', EXAM, 1_000 + 10_000).state;
    const b = getKeyStats(st).find(k => k.key === 'b')!;
    expect(b.total_ms).toBe(3000);
    expect(getKeyStats(st).find(k => k.key === 'a')!.total_ms).toBe(0);
  });

  it('sorts by hits and caps at 200 entries', () => {
    const text = Array.from({ length: 260 }, (_, i) => String.fromCharCode(0x100 + i)).join('');
    const st = type(createState(text), text, EXAM);
    expect(getKeyStats(st).length).toBe(200);
  });
});

describe('canDelete (backspace policy)', () => {
  const st = (typed: string) => type(createState('abc def ghi'), typed, EXAM);
  it('full allows any deletion except on empty', () => {
    expect(canDelete(st('abc '), 'full')).toBe(true);
    expect(canDelete(st(''), 'full')).toBe(false);
  });
  it('off never allows deletion', () => {
    expect(canDelete(st('abc'), 'off')).toBe(false);
  });
  it('word only allows deleting inside the current word', () => {
    expect(canDelete(st('abc d'), 'word')).toBe(true);
    expect(canDelete(st('abc '), 'word')).toBe(false); // would cross back into the previous word
  });
});

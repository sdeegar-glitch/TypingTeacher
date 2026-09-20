import { describe, it, expect } from 'vitest';
import offlineTests from '../data/offlineTests.json';
import {
  normalizeTypingText, charsFromKeyEvent, isImeKey, INSCRIPT_CHAR_TO_KEY, INSCRIPT_BY_CODE,
} from './hindiInput';

const ev = (key: string, code = '', shiftKey = false) => ({ key, code, shiftKey });

describe('normalizeTypingText', () => {
  it('maps untypable characters to what a person can type', () => {
    expect(normalizeTypingText('a\u2011b')).toBe('a-b');                 // non-breaking hyphen
    expect(normalizeTypingText('x\u202Fy\u00A0z')).toBe('x y z');        // narrow / no-break space
    expect(normalizeTypingText('\u201Chi\u201D \u2019s')).toBe('"hi" \'s'); // curly quotes
    expect(normalizeTypingText('a \u2014 b')).toBe('a - b');             // em dash
    expect(normalizeTypingText('\u20B95')).toBe('Rs.5');
  });
  it('turns line breaks into single spaces and trims', () => {
    expect(normalizeTypingText('एक\nदो\r\n\r\nतीन  चार \n')).toBe('एक दो तीन चार');
  });
  it('strips zero-width characters', () => {
    expect(normalizeTypingText('क\u200D\u200Cष')).toBe('कष');
  });
  it('keeps nukta letters as base + U+093C (what INSCRIPT typing produces)', () => {
    expect(normalizeTypingText('\u0958')).toBe('\u0915\u093C');
  });
  it('leaves legacy-font (Kruti Dev) glyphs alone except whitespace/hyphens', () => {
    expect(normalizeTypingText('ç\u2018Å\u2011\n', { legacyFont: true })).toBe('ç\u2018Å-');
  });
});

describe('charsFromKeyEvent', () => {
  it('passes Devanagari from an OS Hindi layout straight through', () => {
    expect(charsFromKeyEvent(ev('क', 'KeyK'), 'क', true)).toEqual(['क']);
  });
  it('expands ligature keys that emit several code points (was silently dropped)', () => {
    expect(charsFromKeyEvent(ev('क्ष', 'Digit7', true), 'क', true)).toEqual(['क', '्', 'ष']);
  });
  it('ignores named keys', () => {
    for (const k of ['Shift', 'Process', 'Dead', 'Unidentified', 'F5', 'ArrowLeft']) {
      expect(charsFromKeyEvent(ev(k), 'क', true)).toEqual([]);
    }
  });
  it('translates the physical key when the OS layout is Latin but Devanagari is expected', () => {
    expect(charsFromKeyEvent(ev('k', 'KeyK'), 'क', true)).toEqual(['क']);
    expect(charsFromKeyEvent(ev('K', 'KeyK', true), 'ख', true)).toEqual(['ख']);
    expect(charsFromKeyEvent(ev('/', 'Slash'), 'य', true)).toEqual(['य']);
    expect(charsFromKeyEvent(ev('&', 'Digit7', true), 'क', true)).toEqual(['क', '्', 'ष']);
  });
  it('does not translate when the passage expects ASCII (digits, punctuation, English)', () => {
    expect(charsFromKeyEvent(ev('2', 'Digit2'), '2', true)).toEqual(['2']);
    expect(charsFromKeyEvent(ev(',', 'Comma'), ',', true)).toEqual([',']);
    expect(charsFromKeyEvent(ev(' ', 'Space'), ' ', true)).toEqual([' ']);
  });
  it('does not translate on non-Mangal tests', () => {
    expect(charsFromKeyEvent(ev('k', 'KeyK'), 'क', false)).toEqual(['k']);
  });
  it('accepts a Devanagari digit where the passage has an ASCII digit', () => {
    expect(charsFromKeyEvent(ev('२', 'Digit2'), '2', true)).toEqual(['2']);
    expect(charsFromKeyEvent(ev('२', 'Digit2'), 'क', true)).toEqual(['२']); // not expected -> unchanged
  });
  it('accepts Enter only when the passage expects a newline', () => {
    expect(charsFromKeyEvent(ev('Enter', 'Enter'), '\n', false)).toEqual(['\n']);
    expect(charsFromKeyEvent(ev('Enter', 'Enter'), 'a', false)).toEqual([]);
  });
});

describe('isImeKey', () => {
  it('detects IME-intercepted keys', () => {
    expect(isImeKey({ key: 'Process' })).toBe(true);
    expect(isImeKey({ key: 'a', keyCode: 229 })).toBe(true);
    expect(isImeKey({ key: 'a', isComposing: true })).toBe(true);
    expect(isImeKey({ key: 'a', keyCode: 65 })).toBe(false);
  });
});

describe('INSCRIPT_CHAR_TO_KEY (on-screen keyboard highlight)', () => {
  it('covers letters the old lesson-derived map missed', () => {
    for (const ch of ['य', 'ै', 'ट', 'ष', 'ृ', 'ँ', 'ॉ', 'ढ', 'ौ', 'ऑ', '।', '़']) {
      expect(INSCRIPT_CHAR_TO_KEY[ch], ch).toBeTruthy();
    }
  });
  it('prefers the unshifted key and reports shifted keys as their shifted character', () => {
    expect(INSCRIPT_CHAR_TO_KEY['ा']).toBe('e');
    expect(INSCRIPT_CHAR_TO_KEY['ख']).toBe('K');
    expect(INSCRIPT_CHAR_TO_KEY['ष']).toBe('<');
  });
});

// Regression test against the site's REAL Hindi Mangal passages: after
// normalisation every character must be typable on an INSCRIPT keyboard.
describe('real Mangal passages', () => {
  const tests = offlineTests as unknown as Array<{ slug: string; content: string; keyboard_layout: string | null }>;
  const reachable = new Set<string>();
  for (const [n, s] of Object.values(INSCRIPT_BY_CODE)) {
    for (const ch of n + s) reachable.add(ch);
  }
  const mangal = tests.filter(t => t.keyboard_layout === 'mangal_inscript');

  it('has Mangal passages to check', () => expect(mangal.length).toBeGreaterThan(0));

  for (const t of mangal) {
    it(`every character is typable: ${t.slug.slice(0, 30)}`, () => {
      const norm = normalizeTypingText(t.content);
      const untypable = [...new Set(Array.from(norm).filter(ch => {
        const cp = ch.codePointAt(0)!;
        const ascii = cp >= 0x20 && cp <= 0x7e;
        return !ascii && !reachable.has(ch);
      }))].map(ch => `${ch} U+${ch.codePointAt(0)!.toString(16).toUpperCase()}`);
      expect(untypable).toEqual([]);
    });
  }
});

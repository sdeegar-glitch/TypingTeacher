/**
 * Hindi (Mangal / Unicode INSCRIPT) input handling shared by the typing pages.
 *
 * Three real-world problems this fixes (each verified against the site's own
 * passages and MDN/Unicode docs):
 *
 * 1. Passages contain characters no keyboard can type in ONE keypress --
 *    non-breaking hyphen U+2011, narrow no-break space U+202F, curly quotes,
 *    dashes, the rupee sign and hard line breaks (AI-generated text). A correct
 *    keystroke could never match them. normalizeTypingText() maps them to what
 *    a user actually types.
 * 2. Some INSCRIPT keys emit SEVERAL code points from one keypress (क्ष, ज्ञ,
 *    त्र, श्र, र्, ्र), so KeyboardEvent.key is a multi-character string that
 *    a `key.length === 1` check silently drops. charsFromKeyEvent() expands it.
 * 3. With an English (Latin) OS layout active, INSCRIPT keys arrive as Latin
 *    letters. When the passage expects Devanagari we translate the PHYSICAL key
 *    (KeyboardEvent.code + Shift) through the INSCRIPT layout instead.
 *
 * Note: nukta/composition is NOT an issue for these passages -- U+0958..095F
 * are Unicode composition exclusions, so NFC already yields base + U+093C, which
 * is exactly what INSCRIPT typing produces.
 */

// ── Layout: KeyboardEvent.code -> [normal, shift] ───────────────────────────
// Letter/punctuation rows follow the standard Devanagari INSCRIPT (BIS / Windows
// "Devanagari - INSCRIPT"). Digit-row Shift entries are the BIS ligature keys;
// Windows places some of these on AltGr, which only matters for the Latin-layout
// fallback (users with the real Hindi layout active never go through this table).
export const INSCRIPT_BY_CODE: Record<string, [string, string]> = {
  Digit1: ['१', 'ऍ'], Digit2: ['२', 'ॅ'], Digit3: ['३', '्र'], Digit4: ['४', 'र्'],
  Digit5: ['५', 'ज्ञ'], Digit6: ['६', 'त्र'], Digit7: ['७', 'क्ष'], Digit8: ['८', 'श्र'],
  Digit9: ['९', '('], Digit0: ['०', ')'], Minus: ['-', 'ः'], Equal: ['ृ', 'ऋ'],
  KeyQ: ['ौ', 'औ'], KeyW: ['ै', 'ऐ'], KeyE: ['ा', 'आ'], KeyR: ['ी', 'ई'], KeyT: ['ू', 'ऊ'],
  KeyY: ['ब', 'भ'], KeyU: ['ह', 'ङ'], KeyI: ['ग', 'घ'], KeyO: ['द', 'ध'], KeyP: ['ज', 'झ'],
  BracketLeft: ['ड', 'ढ'], BracketRight: ['़', 'ञ'], Backslash: ['ॉ', 'ऑ'],
  KeyA: ['ो', 'ओ'], KeyS: ['े', 'ए'], KeyD: ['्', 'अ'], KeyF: ['ि', 'इ'], KeyG: ['ु', 'उ'],
  KeyH: ['प', 'फ'], KeyJ: ['र', 'ऱ'], KeyK: ['क', 'ख'], KeyL: ['त', 'थ'],
  Semicolon: ['च', 'छ'], Quote: ['ट', 'ठ'],
  KeyZ: ['ॆ', 'ऎ'], KeyX: ['ं', 'ँ'], KeyC: ['म', 'ण'], KeyV: ['न', 'ऩ'], KeyB: ['व', 'ऴ'],
  KeyN: ['ल', 'ळ'], KeyM: ['स', 'श'], Comma: [',', 'ष'], Period: ['.', '।'], Slash: ['य', 'य़'],
};

// The character each physical key types on a US layout: [normal, shift].
const US_CHARS: Record<string, [string, string]> = {
  Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'], Digit4: ['4', '$'], Digit5: ['5', '%'],
  Digit6: ['6', '^'], Digit7: ['7', '&'], Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'],
  Minus: ['-', '_'], Equal: ['=', '+'],
  KeyQ: ['q', 'Q'], KeyW: ['w', 'W'], KeyE: ['e', 'E'], KeyR: ['r', 'R'], KeyT: ['t', 'T'],
  KeyY: ['y', 'Y'], KeyU: ['u', 'U'], KeyI: ['i', 'I'], KeyO: ['o', 'O'], KeyP: ['p', 'P'],
  BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'],
  KeyA: ['a', 'A'], KeyS: ['s', 'S'], KeyD: ['d', 'D'], KeyF: ['f', 'F'], KeyG: ['g', 'G'],
  KeyH: ['h', 'H'], KeyJ: ['j', 'J'], KeyK: ['k', 'K'], KeyL: ['l', 'L'],
  Semicolon: [';', ':'], Quote: ["'", '"'],
  KeyZ: ['z', 'Z'], KeyX: ['x', 'X'], KeyC: ['c', 'C'], KeyV: ['v', 'V'], KeyB: ['b', 'B'],
  KeyN: ['n', 'N'], KeyM: ['m', 'M'], Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'],
};

/**
 * Devanagari string -> the US-layout key character to highlight on the on-screen
 * keyboard. Covers EVERY letter/matra of the layout (the lesson-derived map the
 * page used before lacked य ै ट ष ृ ँ ॉ ढ ौ ऑ । and more). Normal keys win over Shift.
 */
export const INSCRIPT_CHAR_TO_KEY: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const state of [0, 1] as const) {
    for (const [code, pair] of Object.entries(INSCRIPT_BY_CODE)) {
      const dev = pair[state];
      const us = US_CHARS[code]?.[state];
      if (dev && us && !(dev in out) && /[\u0900-\u097F]/.test(dev)) out[dev] = us;
    }
  }
  return out;
})();

const DEVANAGARI = /[\u0900-\u097F]/;
const NON_ASCII = /[^\x00-\x7f]/;

/**
 * Turns one keydown into the characters to feed the engine, in order.
 *  - OS Hindi layout active: `key` is already Devanagari (possibly several code
 *    points for ligature keys) -> pass every code point through.
 *  - Latin layout + the passage expects Devanagari (mangal): translate the
 *    physical key through INSCRIPT.
 *  - Named keys (Enter, Process, Dead, F5...) are never text.
 */
export function charsFromKeyEvent(
  e: { key: string; code: string; shiftKey: boolean },
  expected: string | undefined,
  mangal: boolean,
): string[] {
  const chars = rawChars(e, expected, mangal);
  // The Hindi layout's number row types Devanagari digits, but many passages use
  // ASCII digits (2026). Typing the matching digit is correct either way.
  if (chars.length === 1 && expected && /[0-9]/.test(expected)) {
    const cp = chars[0].codePointAt(0)!;
    if (cp >= 0x966 && cp <= 0x96f) return [String(cp - 0x966)];
  }
  return chars;
}

function rawChars(
  e: { key: string; code: string; shiftKey: boolean },
  expected: string | undefined,
  mangal: boolean,
): string[] {
  const { key } = e;
  if (key === 'Enter') return expected === '\n' ? ['\n'] : [];
  if (key.length > 1 && !NON_ASCII.test(key)) return []; // named key
  if (NON_ASCII.test(key)) return Array.from(key);        // OS layout produced Devanagari
  // single ASCII character from here on
  if (mangal && expected && DEVANAGARI.test(expected)) {
    const pair = INSCRIPT_BY_CODE[e.code];
    if (pair) return Array.from(pair[e.shiftKey ? 1 : 0]);
  }
  return [key];
}

/** True when the browser reports that an IME is intercepting the key (e.g. Hindi *Phonetic*). */
export function isImeKey(e: { key: string; keyCode?: number; isComposing?: boolean }): boolean {
  return e.key === 'Process' || e.keyCode === 229 || !!e.isComposing;
}

// ── Passage normalisation ───────────────────────────────────────────────────
/**
 * Rewrites characters a person cannot type into their typable equivalents so
 * a correct keystroke always matches. `legacyFont` (Kruti Dev keystroke text)
 * only gets whitespace/hyphen fixes because its Latin-1 glyph characters are
 * meaningful and must not be touched.
 */
export function normalizeTypingText(text: string, opts: { legacyFont?: boolean } = {}): string {
  let s = text;
  if (!opts.legacyFont) s = s.normalize('NFC');
  s = s
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')               // zero-width chars (untypable)
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // exotic spaces -> space
    .replace(/[\u2010-\u2015\u2212]/g, '-');                    // non-breaking hyphen, dashes, minus
  if (!opts.legacyFont) {
    s = s
      .replace(/[\u2018\u2019\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201F]/g, '"')
      .replace(/\u20B9/g, 'Rs.');
  }
  return s.replace(/\s*[\r\n]+\s*/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
}

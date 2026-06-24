/**
 * Unicode Devanagari → Kruti Dev 010 keystroke converter.
 *
 * Kruti Dev is a legacy non-Unicode font encoding: each "key" in the
 * output below is the literal ASCII/extended-Latin character a typist
 * presses, which the Kruti Dev font then renders as a Devanagari glyph.
 * Unlike Unicode (where rendering reorders matras automatically), Kruti
 * Dev requires the typist to press matra keys in visual order — e.g. the
 * i-matra key is pressed *before* its consonant's key. This function
 * reproduces that reordering so the output string is the exact keystroke
 * sequence, in order, that produces the given Unicode text.
 *
 * Ported from the widely-used Convert_to_Kritidev_010 algorithm
 * (https://github.com/TGNYC/Kriti-Dev-to-Unicode), cross-verified against
 * SIL International's KrutiDev011 TECkit mapping and round-trip tested.
 */

const UNICODE_PATTERNS = [
  '‘', '’', '“', '”', '(', ')', '{', '}', '=', '।', '?', '-', 'µ', '॰', ',', '.', '् ',
  '०', '१', '२', '३', '४', '५', '६', '७', '८', '९', 'x',

  'फ़्', 'क़', 'ख़', 'ग़', 'ज़्', 'ज़', 'ड़', 'ढ़', 'फ़', 'य़', 'ऱ', 'ऩ',
  'त्त्', 'त्त', 'क्त', 'दृ', 'कृ',

  'ह्न', 'ह्य', 'हृ', 'ह्म', 'ह्र', 'ह्', 'द्द', 'क्ष्', 'क्ष', 'त्र्', 'त्र', 'ज्ञ',
  'छ्य', 'ट्य', 'ठ्य', 'ड्य', 'ढ्य', 'द्य', 'द्व',
  'श्र', 'ट्र', 'ड्र', 'ढ्र', 'छ्र', 'क्र', 'फ्र', 'द्र', 'प्र', 'ग्र', 'रु', 'रू',
  '्र',

  'ओ', 'औ', 'आ', 'अ', 'ई', 'इ', 'उ', 'ऊ', 'ऐ', 'ए', 'ऋ',

  'क्', 'क', 'क्क', 'ख्', 'ख', 'ग्', 'ग', 'घ्', 'घ', 'ङ',
  'चै', 'च्', 'च', 'छ', 'ज्', 'ज', 'झ्', 'झ', 'ञ',

  'ट्ट', 'ट्ठ', 'ट', 'ठ', 'ड्ड', 'ड्ढ', 'ड', 'ढ', 'ण्', 'ण',
  'त्', 'त', 'थ्', 'थ', 'द्ध', 'द', 'ध्', 'ध', 'न्', 'न',

  'प्', 'प', 'फ्', 'फ', 'ब्', 'ब', 'भ्', 'भ', 'म्', 'म',
  'य्', 'य', 'र', 'ल्', 'ल', 'ळ', 'व्', 'व',
  'श्', 'श', 'ष्', 'ष', 'स्', 'स', 'ह',

  'ऑ', 'ॉ', 'ो', 'ौ', 'ा', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै',
  'ं', 'ँ', 'ः', 'ॅ', 'ऽ', '् ', '्',
] as const;

const KEY_SEQUENCES = [
  '^', '*', 'Þ', 'ß', '¼', '½', '¿', 'À', '¾', 'A', '\\', '&', '&', 'Œ', ']', '-', '~ ',
  'å', 'ƒ', '„', '…', '†', '‡', 'ˆ', '‰', 'Š', '‹', 'Û',

  '¶', 'd', '[k', 'x', 'T', 't', 'M+', '<+', 'Q', ';', 'j', 'u',
  'Ù', 'Ùk', 'ä', '–', '—',

  'à', 'á', 'â', 'ã', 'ºz', 'º', 'í', '{', '{k', '«', '=', 'K',
  'Nî', 'Vî', 'Bî', 'Mî', '<î', '|', '}',
  'J', 'Vª', 'Mª', '<ªª', 'Nª', 'Ø', 'Ý', 'æ', 'ç', 'xz', '#', ':',
  'z',

  'vks', 'vkS', 'vk', 'v', 'bZ', 'b', 'm', 'Å', ',s', ',', '_',

  'D', 'd', 'ô', '[', '[k', 'X', 'x', '?', '?k', '³',
  'pkS', 'P', 'p', 'N', 'T', 't', '÷', '>', '¥',

  'ê', 'ë', 'V', 'B', 'ì', 'ï', 'M', '<', '.', '.k',
  'R', 'r', 'F', 'Fk', ')', 'n', '/', '/k', 'U', 'u',

  'I', 'i', '¶', 'Q', 'C', 'c', 'H', 'Hk', 'E', 'e',
  '¸', ';', 'j', 'Y', 'y', 'G', 'O', 'o',
  "'", "'k", '"', '"k', 'L', 'l', 'g',

  'v‚', '‚', 'ks', 'kS', 'k', 'h', 'q', 'w', '`', 's', 'S',
  'a', '¡', '%', 'W', '·', '~ ', '~',
] as const;

const MATRA_SET = 'ािीुूृेैोौं:ँॅ';
const NUKTA_NORMALIZE: Array<[RegExp, string]> = [
  [/क़/g, 'क़'], [/ख़‌/g, 'ख़'], [/ग़/g, 'ग़'], [/ज़/g, 'ज़'],
  [/ड़/g, 'ड़'], [/ढ़/g, 'ढ़'], [/ऩ/g, 'ऩ'], [/फ़/g, 'फ़'],
  [/य़/g, 'य़'], [/ऱ/g, 'ऱ'],
];

/** Converts Unicode Devanagari text into the literal Kruti Dev 010 keystroke sequence. */
export function unicodeToKrutiDevKeys(unicodeText: string): string {
  if (!unicodeText) return unicodeText;
  let s = unicodeText;

  for (const [pattern, replacement] of NUKTA_NORMALIZE) s = s.replace(pattern, replacement);

  // Reorder the i-matra (ि) to precede its consonant — Kruti Dev has no
  // automatic shaping, so it must be typed in visual (pre-consonant) order.
  let posF = s.indexOf('ि');
  while (posF !== -1) {
    const leftChar = s.charAt(posF - 1);
    s = s.replace(leftChar + 'ि', 'f' + leftChar);
    posF -= 1;
    while (s.charAt(posF - 1) === '्' && posF !== 0) {
      const pair = s.charAt(posF - 2) + '्';
      s = s.replace(pair + 'f', 'f' + pair);
      posF -= 2;
    }
    posF = s.indexOf('ि', posF + 1);
  }

  // Reorder half-र (reph, र्) to follow the syllable it attaches to.
  s += '  ';
  let posHalfR = s.indexOf('र्');
  while (posHalfR > 0) {
    let probableZ = posHalfR + 2;
    let charAfter = s.charAt(probableZ + 1);
    while (MATRA_SET.indexOf(charAfter) !== -1) {
      probableZ += 1;
      charAfter = s.charAt(probableZ + 1);
    }
    const chunk = s.substr(posHalfR + 2, probableZ - posHalfR - 1);
    s = s.replace('र्' + chunk, chunk + 'Z');
    posHalfR = s.indexOf('र्');
  }
  s = s.substr(0, s.length - 2);

  for (let i = 0; i < UNICODE_PATTERNS.length; i++) {
    const pattern = UNICODE_PATTERNS[i];
    const replacement = KEY_SEQUENCES[i];
    let idx = s.indexOf(pattern);
    while (idx !== -1) {
      s = s.replace(pattern, replacement);
      idx = s.indexOf(pattern);
    }
  }

  return s;
}

/**
 * Makes AI-generated passage text typable on a normal keyboard BEFORE it is
 * stored. LLM output routinely contains characters no keyboard can produce in
 * one keypress (non-breaking hyphen U+2011, narrow no-break space U+202F, curly
 * quotes, dashes, the rupee sign, hard line breaks); a person typing the passage
 * correctly could never match them. Mirrors normalizeTypingText() in
 * frontend/src/lib/hindiInput.ts, which also cleans passages already stored.
 *
 * Only for Unicode text -- run it BEFORE any Kruti Dev conversion.
 */
export function cleanTypingText(text) {
  return String(text)
    .normalize('NFC')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')                       // zero-width chars
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')    // exotic spaces
    .replace(/[\u2010-\u2015\u2212]/g, '-')                            // hyphens, dashes, minus
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201F]/g, '"')
    .replace(/\u20B9/g, 'Rs.')
    .replace(/\s*[\r\n]+\s*/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

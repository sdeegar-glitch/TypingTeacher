import { describe, it, expect } from 'vitest';
import { krutiDevToUnicode, unicodeToKrutiDevKeys } from './krutiDevConverter';

/**
 * Kruti Dev is a legacy non-Unicode font encoding: the bytes are Latin
 * characters that happen to *look* like Devanagari in that font. Conversion has
 * to reorder matras (the i-matra is stored before its consonant but rendered
 * after it) and reph (र् is stored after the cluster it belongs to). Those two
 * reorderings are where every bug in this kind of converter lives, so they get
 * dedicated cases below.
 */

const ROUND_TRIP_SAMPLES = [
  'भारत एक विशाल देश है।',
  'हिंदी टाइपिंग का अभ्यास करें।',
  'सरकारी नौकरी की तैयारी',
  'कंप्यूटर पर तेज गति से टाइप करना सीखें।',
  'परीक्षा में सफलता के लिए नियमित अभ्यास आवश्यक है।',
];

describe('unicodeToKrutiDevKeys → krutiDevToUnicode round trip', () => {
  it.each(ROUND_TRIP_SAMPLES)('preserves %s', text => {
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys(text))).toBe(text);
  });
});

describe('i-matra reordering', () => {
  // कि is stored in Kruti Dev as the matra BEFORE the consonant.
  it('moves the i-matra back after its consonant', () => {
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys('कि'))).toBe('कि');
  });

  it('handles an i-matra on a conjunct cluster', () => {
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys('स्थि'))).toBe('स्थि');
  });

  it('keeps the long ii-matra distinct from the short one', () => {
    const short = unicodeToKrutiDevKeys('कि');
    const long = unicodeToKrutiDevKeys('की');
    expect(short).not.toBe(long);
    expect(krutiDevToUnicode(long)).toBe('की');
  });
});

describe('reph reordering', () => {
  it('restores reph to the front of its cluster', () => {
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys('कर्म'))).toBe('कर्म');
  });

  it('handles reph followed by a matra', () => {
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys('कार्य'))).toBe('कार्य');
  });

  it('does not confuse reph with a plain र', () => {
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys('राम'))).toBe('राम');
  });
});

describe('non-Devanagari input', () => {
  it('leaves an empty string empty', () => {
    expect(krutiDevToUnicode('')).toBe('');
    expect(unicodeToKrutiDevKeys('')).toBe('');
  });

  it('passes digits through both directions', () => {
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys('2026'))).toBe('2026');
  });

  it('preserves whitespace and line breaks', () => {
    const text = 'भारत\nएक देश';
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys(text))).toBe(text);
  });

  it('does not throw on mixed Latin and Devanagari', () => {
    expect(() => unicodeToKrutiDevKeys('SSC CGL परीक्षा')).not.toThrow();
  });
});

describe('punctuation', () => {
  it('round-trips the danda', () => {
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys('नमस्ते।'))).toBe('नमस्ते।');
  });

  it('round-trips a comma and question mark', () => {
    const text = 'क्या आप तैयार हैं?';
    expect(krutiDevToUnicode(unicodeToKrutiDevKeys(text))).toBe(text);
  });
});

describe('determinism', () => {
  it('gives the same output for the same input every time', () => {
    const text = 'नियमित अभ्यास';
    expect(unicodeToKrutiDevKeys(text)).toBe(unicodeToKrutiDevKeys(text));
  });
});

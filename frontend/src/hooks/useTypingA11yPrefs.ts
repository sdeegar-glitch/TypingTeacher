/**
 * Accessibility preferences scoped to the typing test page: font size
 * (affects the typing text only, not the whole site) and high-contrast
 * mode. Both persist in localStorage, independent of the site-wide
 * dark/light theme.
 */
import { useState, useEffect, useCallback } from 'react';

const FONT_SIZES = [16, 18, 20, 22, 26] as const; // px, applied to the typing text
const DEFAULT_FONT_INDEX = 1; // 18px, matches the existing text-lg default

function getInitialFontIndex(): number {
  try {
    const raw = localStorage.getItem('typingFontSizeIndex');
    if (raw !== null) {
      const stored = Number(raw);
      if (!isNaN(stored) && stored >= 0 && stored < FONT_SIZES.length) return stored;
    }
  } catch {}
  return DEFAULT_FONT_INDEX;
}

function getInitialHighContrast(): boolean {
  try {
    return localStorage.getItem('typingHighContrast') === 'true';
  } catch {
    return false;
  }
}

export function useTypingA11yPrefs() {
  const [fontIndex, setFontIndex] = useState(getInitialFontIndex);
  const [highContrast, setHighContrast] = useState(getInitialHighContrast);

  useEffect(() => {
    try { localStorage.setItem('typingFontSizeIndex', String(fontIndex)); } catch {}
  }, [fontIndex]);

  useEffect(() => {
    try { localStorage.setItem('typingHighContrast', String(highContrast)); } catch {}
  }, [highContrast]);

  const increaseFontSize = useCallback(() => setFontIndex(i => Math.min(i + 1, FONT_SIZES.length - 1)), []);
  const decreaseFontSize = useCallback(() => setFontIndex(i => Math.max(i - 1, 0)), []);
  const toggleHighContrast = useCallback(() => setHighContrast(h => !h), []);

  return {
    fontSize: FONT_SIZES[fontIndex],
    canIncreaseFontSize: fontIndex < FONT_SIZES.length - 1,
    canDecreaseFontSize: fontIndex > 0,
    increaseFontSize,
    decreaseFontSize,
    highContrast,
    toggleHighContrast,
  };
}

/**
 * Lightweight typing sound effects — synthesized via Web Audio API so no
 * external audio assets are needed. Off by default; persists the user's
 * choice in localStorage. AudioContext is created lazily on first use
 * since browsers block audio until a user gesture has occurred.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

function getInitialEnabled(): boolean {
  try {
    return localStorage.getItem('typingSoundEnabled') === 'true';
  } catch {
    return false;
  }
}

export function useSoundEffects() {
  const [enabled, setEnabled] = useState(getInitialEnabled);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try { localStorage.setItem('typingSoundEnabled', String(enabled)); } catch {}
  }, [enabled]);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback((freq: number, durationMs: number, type: OscillatorType, gain: number) => {
    if (!enabled) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gainNode.gain.value = gain;
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  }, [enabled, getCtx]);

  const playKey = useCallback(() => tone(700, 30, 'square', 0.04), [tone]);
  const playError = useCallback(() => tone(180, 90, 'sawtooth', 0.07), [tone]);
  const playComplete = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startAt = ctx.currentTime + i * 0.09;
      gainNode.gain.setValueAtTime(0.08, startAt);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.2);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 0.2);
    });
  }, [enabled, getCtx]);

  const toggle = useCallback(() => setEnabled(e => !e), []);

  return { enabled, toggle, playKey, playError, playComplete };
}

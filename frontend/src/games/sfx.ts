// Zero-asset, low-latency sound effects via the Web Audio API — synthesised on
// the fly, so there are no audio files to download and no playback latency.
// Shared across games. Toggle + volume are persisted.

type Win = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
function ac(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as Win).webkitAudioContext!;
    ctx = new Ctor();
  }
  return ctx;
}

let enabled = (() => { try { return localStorage.getItem('ftl_sfx') !== '0'; } catch { return true; } })();
let volume = (() => { try { return Number(localStorage.getItem('ftl_sfx_vol') ?? '0.5'); } catch { return 0.5; } })();

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 1, sweepTo?: number) {
  if (!enabled) return;
  try {
    const c = ac();
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (sweepTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * vol), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  } catch { /* ignore */ }
}

export const sfx = {
  get enabled() { return enabled; },
  setEnabled(v: boolean) { enabled = v; try { localStorage.setItem('ftl_sfx', v ? '1' : '0'); } catch { /**/ } },
  setVolume(v: number) { volume = Math.max(0, Math.min(1, v)); try { localStorage.setItem('ftl_sfx_vol', String(volume)); } catch { /**/ } },
  get volume() { return volume; },
  resume() { try { ac().resume(); } catch { /**/ } },

  key() { tone(320, 0.03, 'square', 0.12); },
  slice() { tone(680, 0.12, 'triangle', 0.5, 1100); },
  combo(n: number) { tone(520 + Math.min(n, 24) * 34, 0.11, 'sine', 0.5, 900); },
  perfect() { tone(880, 0.16, 'sine', 0.6, 1320); window.setTimeout(() => tone(1320, 0.14, 'sine', 0.5), 55); },
  miss() { tone(180, 0.16, 'sawtooth', 0.4, 90); },
  bomb() { tone(90, 0.4, 'sawtooth', 0.7, 45); },
  coin() { tone(1046, 0.07, 'square', 0.3); window.setTimeout(() => tone(1568, 0.09, 'square', 0.3), 45); },
  levelup() { [523, 659, 784, 1046].forEach((f, i) => window.setTimeout(() => tone(f, 0.16, 'sine', 0.55), i * 85)); },
  start() { [392, 523, 659].forEach((f, i) => window.setTimeout(() => tone(f, 0.1, 'triangle', 0.4), i * 70)); },
  over() { [440, 330, 262].forEach((f, i) => window.setTimeout(() => tone(f, 0.2, 'sine', 0.5), i * 130)); },
};

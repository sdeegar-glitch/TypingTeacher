import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Zap, Coins, ChevronLeft, Volume2, VolumeX, Target as TargetIcon, Flame } from 'lucide-react';
import Seo from '../components/Seo';
import { sfx } from './sfx';
import { loadProfile, levelProgress, addRewards, type RewardOutcome } from '../lib/gameRewards';

// ── Shared "type-the-word-to-destroy-the-approaching-target" engine ──
// Powers Space Shooter, Zombie, Word Rain, Castle Defense, etc. Each game
// supplies a config with its theme, spawn, movement, and draw functions;
// the engine handles the 60fps loop, typing/targeting, combos, particles,
// lives, WPM/accuracy, HUD, rewards, SFX, mobile and responsiveness.

export interface GameTarget {
  active: boolean; word: string; typed: number; x: number; y: number; vx: number; vy: number;
  r: number; hue: number; born: number; dead: boolean; kind: number; seed: number;
}

export interface EngineState {
  W: number; H: number; elapsed: number; score: number; combo: number; level: number;
}

export interface GameConfig {
  id: string;
  title: string;
  titleAccent: string;
  emoji: string;
  subtitle: string;
  howTo: string;
  bg: string;
  accent: string; // hex, for UI + word highlight
  words: string[];
  lives: number;
  bestKey?: string;
  spawnEvery: number;   // seconds base
  minSpawn: number;     // fastest spawn
  /** position + velocity a fresh target (word already chosen). */
  spawn: (t: GameTarget, s: EngineState, pickWord: () => string) => void;
  /** move a target; return true when it crosses the fail line (costs a life). */
  update: (t: GameTarget, sdt: number, s: EngineState) => boolean;
  /** draw the target body (engine draws the word label on top). */
  draw: (ctx: CanvasRenderingContext2D, t: GameTarget, accent: string) => void;
  /** optional per-frame scene (background, ship, base). */
  scene?: (ctx: CanvasRenderingContext2D, s: EngineState, now: number) => void;
  /** optional origin for a destroy beam (laser). */
  beamOrigin?: (s: EngineState) => { x: number; y: number };
}

interface Particle { active: boolean; x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hue: number; }
interface FloatText { active: boolean; x: number; y: number; vy: number; life: number; max: number; text: string; color: string; size: number; }
interface Beam { active: boolean; x1: number; y1: number; x2: number; y2: number; life: number; hue: number; }

type Screen = 'menu' | 'playing' | 'over';

export default function WordTargetGame({ config }: { config: GameConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const scoreEl = useRef<HTMLSpanElement>(null);
  const comboEl = useRef<HTMLSpanElement>(null);
  const wpmEl = useRef<HTMLSpanElement>(null);
  const accEl = useRef<HTMLSpanElement>(null);
  const livesEl = useRef<HTMLDivElement>(null);
  const coinsEl = useRef<HTMLSpanElement>(null);

  const [screen, setScreen] = useState<Screen>('menu');
  const screenRef = useRef<Screen>('menu');
  const [soundOn, setSoundOn] = useState(sfx.enabled);
  const [profile, setProfile] = useState(() => loadProfile());
  const [result, setResult] = useState<{ score: number; maxCombo: number; wpm: number; acc: number; xp: number; coins: number; reward: RewardOutcome } | null>(null);
  const isMobile = useRef(typeof navigator !== 'undefined' && (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || 'ontouchstart' in window)).current;
  const cfg = useRef(config); cfg.current = config;

  const g = useRef({
    targets: [] as GameTarget[], parts: [] as Particle[], texts: [] as FloatText[], beams: [] as Beam[],
    buffer: '', score: 0, combo: 0, maxCombo: 0, lives: config.lives, shownLives: -1,
    keysGood: 0, keysBad: 0, goodChars: 0, startTime: 0, spawnTimer: 0, elapsed: 0,
    shake: 0, timeScale: 1, slowmo: 0, flash: 0, hurtFlash: 0, W: 800, H: 600, level: 1,
  });

  const getT = () => { const p = g.current.targets.find(o => !o.active); if (p) return p; const n = { active: false } as GameTarget; g.current.targets.push(n); return n; };
  const getP = () => { const p = g.current.parts.find(o => !o.active); if (p) return p; const n = { active: false } as Particle; g.current.parts.push(n); return n; };
  const getTx = () => { const p = g.current.texts.find(o => !o.active); if (p) return p; const n = { active: false } as FloatText; g.current.texts.push(n); return n; };
  const getB = () => { const p = g.current.beams.find(o => !o.active); if (p) return p; const n = { active: false } as Beam; g.current.beams.push(n); return n; };

  const burst = (x: number, y: number, hue: number, n: number) => {
    for (let i = 0; i < n; i++) { const p = getP(); const a = Math.random() * 7; const s = 70 + Math.random() * 260; p.active = true; p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s; p.life = p.max = 0.35 + Math.random() * 0.5; p.r = 2 + Math.random() * 4; p.hue = hue + (Math.random() * 40 - 20); }
  };
  const floaty = (x: number, y: number, text: string, color: string, size = 20) => { const t = getTx(); t.active = true; t.x = x; t.y = y; t.vy = -60; t.life = t.max = 1; t.text = text; t.color = color; t.size = size; };

  const pickWord = () => {
    const st = g.current; const words = cfg.current.words; const level = st.level;
    const maxLen = Math.min(9, 4 + Math.floor(level / 2));
    for (let i = 0; i < 8; i++) {
      const w = words[(Math.random() * words.length) | 0];
      if (w.length > maxLen) continue;
      if (!st.targets.some(o => o.active && !o.dead && o.word && o.word[0] === w[0])) return w;
    }
    return words[(Math.random() * words.length) | 0];
  };

  const spawn = () => { const t = getT(); t.dead = false; t.typed = 0; t.born = g.current.elapsed; t.seed = Math.random(); cfg.current.spawn(t, g.current as EngineState, pickWord); t.active = true; };

  const destroy = (t: GameTarget) => {
    const st = g.current; t.dead = true; t.active = false;
    const dt = st.elapsed - t.born; const crit = dt < 1.1;
    st.combo += 1; st.maxCombo = Math.max(st.maxCombo, st.combo); st.goodChars += t.word.length;
    const mult = 1 + Math.floor(st.combo / 5); let gain = (10 + t.word.length * 4) * mult; if (crit) gain *= 2;
    st.score += gain; st.level = 1 + Math.floor(st.score / 400);
    st.shake = Math.min(16, 6 + st.combo * 0.3);
    sfx.slice(); if (st.combo > 1) sfx.combo(st.combo);
    burst(t.x, t.y, t.hue, 16 + Math.min(20, st.combo));
    floaty(t.x, t.y - 6, (crit ? 'CRIT ' : '+') + gain, crit ? '#fbbf24' : '#a7f3d0', crit ? 24 : 18);
    if (cfg.current.beamOrigin) { const o = cfg.current.beamOrigin(st as EngineState); const b = getB(); b.active = true; b.x1 = o.x; b.y1 = o.y; b.x2 = t.x; b.y2 = t.y; b.life = 0.14; b.hue = t.hue; }
    if (st.combo > 0 && st.combo % 12 === 0) { st.slowmo = 0.6; st.flash = 0.8; sfx.perfect(); floaty(st.W / 2, st.H / 2 - 40, 'PERFECT x' + st.combo, '#22d3ee', 38); }
  };

  const onChar = useCallback((raw: string) => {
    const st = g.current; if (screenRef.current !== 'playing') return;
    const ch = raw.toLowerCase(); if (ch.length !== 1 || ch === ' ') return;
    const nb = st.buffer + ch;
    const cands = st.targets.filter(o => o.active && !o.dead && o.word.startsWith(nb));
    if (cands.length === 0) { st.keysBad += 1; st.combo = 0; st.shake = Math.max(st.shake, 5); sfx.miss(); st.buffer = ''; for (const o of st.targets) o.typed = 0; return; }
    st.buffer = nb; st.keysGood += 1; sfx.key();
    for (const o of st.targets) if (o.active && !o.dead) o.typed = o.word.startsWith(nb) ? nb.length : 0;
    const exact = cands.find(o => o.word === nb);
    if (exact) { destroy(exact); st.buffer = ''; for (const o of st.targets) o.typed = 0; }
  }, []);

  const endGame = () => {
    const st = g.current; screenRef.current = 'over';
    const mins = Math.max(0.05, (performance.now() - st.startTime) / 60000);
    const wpm = Math.round((st.goodChars / 5) / mins);
    const tk = st.keysGood + st.keysBad; const acc = tk ? Math.round((st.keysGood / tk) * 100) : 100;
    const xp = Math.floor(st.score / 8) + st.maxCombo; const coins = Math.floor(st.score / 20);
    const reward = addRewards({ game: cfg.current.id, score: st.score, xp, coins });
    if (cfg.current.bestKey) { try { localStorage.setItem(cfg.current.bestKey, String(reward.profile.bestScores[cfg.current.id] || st.score)); } catch { /**/ } }
    setProfile(reward.profile); setResult({ score: st.score, maxCombo: st.maxCombo, wpm, acc, xp, coins, reward });
    sfx.over(); if (reward.leveledUp) window.setTimeout(() => sfx.levelup(), 400);
    setScreen('over');
  };

  const start = useCallback(() => {
    sfx.resume(); sfx.start(); const st = g.current;
    st.targets.forEach(o => o.active = false); st.parts.forEach(p => p.active = false); st.texts.forEach(t => t.active = false); st.beams.forEach(b => b.active = false);
    st.buffer = ''; st.score = 0; st.combo = 0; st.maxCombo = 0; st.lives = cfg.current.lives; st.shownLives = -1;
    st.keysGood = 0; st.keysBad = 0; st.goodChars = 0; st.spawnTimer = 0.8; st.elapsed = 0; st.level = 1;
    st.shake = 0; st.timeScale = 1; st.slowmo = 0; st.flash = 0; st.hurtFlash = 0; st.startTime = performance.now();
    setResult(null); screenRef.current = 'playing'; setScreen('playing');
    if (isMobile) setTimeout(() => hiddenRef.current?.focus(), 100);
  }, [isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current!; const ctx = canvas.getContext('2d')!;
    let raf = 0; let last = performance.now(); let running = true;
    const dprOf = () => Math.min(2, window.devicePixelRatio || 1);
    const resize = () => { const wrap = wrapRef.current!; const dpr = dprOf(); const w = wrap.clientWidth, h = wrap.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; g.current.W = w; g.current.H = h; };
    resize(); const ro = new ResizeObserver(resize); ro.observe(wrapRef.current!);

    const frame = (now: number) => {
      if (!running) return;
      const st = g.current; const c = cfg.current;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const target = st.slowmo > 0 ? 0.35 : 1; st.timeScale += (target - st.timeScale) * 0.15; if (st.slowmo > 0) st.slowmo -= dt;
      const sdt = dt * st.timeScale; const W = st.W, H = st.H;

      ctx.setTransform(dprOf(), 0, 0, dprOf(), 0, 0);
      if (c.scene) c.scene(ctx, st as EngineState, now); else { ctx.fillStyle = 'rgba(8,10,22,0.35)'; ctx.fillRect(0, 0, W, H); }
      if (st.shake > 0) { ctx.translate((Math.random() * 2 - 1) * st.shake, (Math.random() * 2 - 1) * st.shake); st.shake *= 0.86; if (st.shake < 0.4) st.shake = 0; }

      if (screenRef.current === 'playing') {
        st.elapsed += sdt; st.spawnTimer -= sdt;
        const every = Math.max(c.minSpawn, c.spawnEvery - st.elapsed * 0.004 - st.score * 0.0001);
        if (st.spawnTimer <= 0) { spawn(); st.spawnTimer = every * (0.7 + Math.random() * 0.6); }
        for (const t of st.targets) { if (!t.active) continue; if (c.update(t, sdt, st as EngineState)) { t.active = false; st.lives -= 1; st.combo = 0; st.shake = 12; st.hurtFlash = 1; sfx.miss(); floaty(t.x, t.y, 'MISS', '#f87171', 20); if (st.lives <= 0) { endGame(); } } }
      }

      for (const p of st.parts) { if (!p.active) continue; p.vy += 300 * sdt; p.x += p.vx * sdt; p.y += p.vy * sdt; p.life -= dt; if (p.life <= 0) p.active = false; }
      for (const t of st.texts) { if (!t.active) continue; t.y += t.vy * dt; t.vy *= 0.94; t.life -= dt; if (t.life <= 0) t.active = false; }
      for (const b of st.beams) { if (!b.active) continue; b.life -= dt; if (b.life <= 0) b.active = false; }

      // draw targets
      for (const t of st.targets) {
        if (!t.active || t.dead) continue;
        c.draw(ctx, t, c.accent);
        ctx.font = `800 ${Math.max(15, t.r * 0.6)}px ui-monospace, monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.strokeText(t.word, t.x, t.y + 1);
        if (t.typed > 0) {
          const tw = ctx.measureText(t.word).width; const s0 = t.x - tw / 2; const done = t.word.slice(0, t.typed); const rest = t.word.slice(t.typed);
          ctx.textAlign = 'left'; ctx.fillStyle = c.accent; ctx.fillText(done, s0, t.y + 1); ctx.fillStyle = '#fff'; ctx.fillText(rest, s0 + ctx.measureText(done).width, t.y + 1); ctx.textAlign = 'center';
        } else { ctx.fillStyle = '#fff'; ctx.fillText(t.word, t.x, t.y + 1); }
      }
      // beams
      for (const b of st.beams) { if (!b.active) continue; ctx.globalAlpha = Math.max(0, b.life / 0.14); ctx.strokeStyle = `hsl(${b.hue},90%,65%)`; ctx.lineWidth = 3 + b.life * 20; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 12; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
      // particles
      for (const p of st.parts) { if (!p.active) continue; const a = p.life / p.max; ctx.globalAlpha = a; ctx.fillStyle = `hsl(${p.hue},90%,62%)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * a + 0.5, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      // floating text
      for (const t of st.texts) { if (!t.active) continue; ctx.globalAlpha = Math.max(0, t.life / t.max); ctx.font = `900 ${t.size}px ui-sans-serif,system-ui`; ctx.textAlign = 'center'; ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y); }
      ctx.globalAlpha = 1;
      if (st.flash > 0) { ctx.fillStyle = `rgba(34,211,238,${st.flash * 0.22})`; ctx.fillRect(-40, -40, W + 80, H + 80); st.flash -= dt * 2; }
      if (st.hurtFlash > 0) { ctx.fillStyle = `rgba(244,63,94,${st.hurtFlash * 0.35})`; ctx.fillRect(-40, -40, W + 80, H + 80); st.hurtFlash -= dt * 2; }

      if (screenRef.current === 'playing') {
        if (scoreEl.current) scoreEl.current.textContent = String(st.score);
        if (comboEl.current) comboEl.current.textContent = st.combo > 1 ? 'x' + st.combo : '';
        if (coinsEl.current) coinsEl.current.textContent = String(Math.floor(st.score / 20));
        const mins = Math.max(0.03, (performance.now() - st.startTime) / 60000);
        if (wpmEl.current) wpmEl.current.textContent = String(Math.round((st.goodChars / 5) / mins));
        const tk = st.keysGood + st.keysBad; if (accEl.current) accEl.current.textContent = (tk ? Math.round((st.keysGood / tk) * 100) : 100) + '%';
        if (st.lives !== st.shownLives && livesEl.current) { st.shownLives = st.lives; livesEl.current.innerHTML = '❤️'.repeat(Math.max(0, st.lives)) + '<span style="opacity:.25">' + '🖤'.repeat(Math.max(0, cfg.current.lives - st.lives)) + '</span>'; }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => { if (screenRef.current !== 'playing') return; if (e.key === 'Backspace') { e.preventDefault(); g.current.buffer = g.current.buffer.slice(0, -1); return; } if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); onChar(e.key); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, onChar]);

  const mobileLast = useRef('');
  const onMobile = (e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value; const prev = mobileLast.current; if (v.length > prev.length) for (const c of v.slice(prev.length)) onChar(c); mobileLast.current = v; if (v.length > 40) { mobileLast.current = ''; e.target.value = ''; } };
  const toggleSound = () => { const n = !soundOn; sfx.setEnabled(n); setSoundOn(n); if (n) { sfx.resume(); sfx.key(); } };
  const lp = levelProgress(profile.xp);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden text-white select-none" style={{ background: config.bg }}
      onClick={() => isMobile && screen === 'playing' && hiddenRef.current?.focus()}>
      <Seo title={`${config.title} — Typing Game | FastTypingLab`} description={config.subtitle} />
      {isMobile && (<input ref={hiddenRef} onChange={onMobile} className="fixed opacity-0 pointer-events-none w-1 h-1 top-0 left-0 z-[-1]" autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} aria-hidden />)}

      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 h-14">
        <Link to="/games" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold transition-colors"><ChevronLeft className="w-4 h-4" /> Games</Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-white/80 bg-white/5 border border-white/10 rounded-full px-3 py-1"><Zap className="w-3.5 h-3.5" style={{ color: config.accent }} /> Lv {lp.level}</div>
          <button onClick={toggleSound} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">{soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
        </div>
      </div>

      <div ref={wrapRef} className="relative mx-auto max-w-4xl h-[calc(100dvh-3.5rem-1rem)] px-0 sm:px-4">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-none sm:rounded-3xl" />

        {screen === 'playing' && (
          <div className="absolute inset-x-0 top-0 z-10 p-3 sm:p-4 flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="bg-black/30 backdrop-blur border border-white/10 rounded-2xl px-3 py-2"><div className="text-[9px] uppercase tracking-widest text-white/50">Score</div><span ref={scoreEl} className="text-2xl font-black font-mono tabular-nums">0</span></div>
              <span ref={comboEl} className="text-3xl font-black" style={{ color: config.accent, textShadow: `0 0 10px ${config.accent}` }}></span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div ref={livesEl} className="text-lg leading-none">❤️❤️❤️</div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-black/30 border border-white/10 rounded-lg px-2 py-1"><span className="text-white/50">WPM </span><span ref={wpmEl}>0</span></span>
                <span className="bg-black/30 border border-white/10 rounded-lg px-2 py-1"><span className="text-white/50">ACC </span><span ref={accEl}>100%</span></span>
                <span className="bg-black/30 border border-amber-400/20 rounded-lg px-2 py-1 text-amber-300 flex items-center gap-1"><Coins className="w-3 h-3" /><span ref={coinsEl}>0</span></span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {screen === 'menu' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white/[0.06] backdrop-blur-xl border border-white/12 rounded-3xl p-7 text-center shadow-2xl">
                <motion.div initial={{ scale: 0.6, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 12 }} className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-lg" style={{ background: `linear-gradient(135deg,${config.accent},#7c3aed)` }}>{config.emoji}</motion.div>
                <h1 className="text-3xl font-black tracking-tight mb-1">{config.title.split(' ')[0]} <span style={{ color: config.accent }}>{config.title.split(' ').slice(1).join(' ')}</span></h1>
                <p className="text-white/50 text-sm mb-5">{config.howTo}</p>
                <div className="grid grid-cols-2 gap-2 mb-5 text-left">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">Best</div><div className="text-lg font-black text-amber-300 flex items-center gap-1"><Trophy className="w-4 h-4" />{profile.bestScores[config.id] || 0}</div></div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">Streak</div><div className="text-lg font-black text-orange-300 flex items-center gap-1"><Flame className="w-4 h-4" />{profile.streak}d</div></div>
                </div>
                <div className="mb-5"><div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Level {lp.level}</span><span>{lp.into}/{lp.needed} XP</span></div><div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: lp.pct + '%', background: `linear-gradient(90deg,${config.accent},#a78bfa)` }} /></div></div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={start} className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl" style={{ background: `linear-gradient(135deg,${config.accent},#7c3aed)` }}><Play className="w-5 h-5" /> Play</motion.button>
                <p className="text-white/30 text-xs mt-3">{isMobile ? 'Tap and type on your keyboard' : 'Just start typing — no clicking needed'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {screen === 'over' && result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }} className="w-full max-w-md bg-white/[0.06] backdrop-blur-xl border border-white/12 rounded-3xl p-7 text-center shadow-2xl">
                {result.reward.leveledUp && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-3 inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 rounded-full px-3 py-1 text-xs font-bold"><Zap className="w-3.5 h-3.5" /> Level Up! Level {result.reward.newLevel}</motion.div>)}
                <div className="text-4xl mb-2">{result.reward.isBest ? '🏆' : config.emoji}</div>
                <h2 className="text-2xl font-black mb-1">{result.reward.isBest ? 'New Best Score!' : 'Run Over'}</h2>
                <div className="text-4xl font-black font-mono mb-4" style={{ color: config.accent }}>{result.score}</div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[{ label: 'Max Combo', value: 'x' + result.maxCombo, c: 'text-fuchsia-300' }, { label: 'WPM', value: result.wpm, c: 'text-cyan-300' }, { label: 'Accuracy', value: result.acc + '%', c: 'text-emerald-300' }, { label: 'Best', value: profile.bestScores[config.id] || 0, c: 'text-amber-300' }].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">{s.label}</div><div className={`text-xl font-black font-mono ${s.c}`}>{s.value}</div></div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mb-5 text-sm font-bold"><span className="flex items-center gap-1 text-cyan-300"><Zap className="w-4 h-4" /> +{result.xp} XP</span><span className="flex items-center gap-1 text-amber-300"><Coins className="w-4 h-4" /> +{result.coins}</span></div>
                <div className="flex gap-3">
                  <motion.button whileTap={{ scale: 0.96 }} onClick={start} className="flex-1 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg" style={{ background: `linear-gradient(135deg,${config.accent},#7c3aed)` }}><RotateCcw className="w-4 h-4" /> Play Again</motion.button>
                  <Link to="/games" className="px-5 py-3.5 rounded-2xl font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors flex items-center">All Games</Link>
                </div>
                <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-white/30"><TargetIcon className="w-3 h-3" /> Typed {result.acc}% accurate at {result.wpm} WPM</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Zap, Coins, ChevronLeft, Volume2, VolumeX, Target, Flame } from 'lucide-react';
import Seo from '../../components/Seo';
import { sfx } from '../../games/sfx';
import { loadProfile, levelProgress, addRewards, type RewardOutcome } from '../../lib/gameRewards';

const GAME_ID = 'ninja-slash';

const WORDS = [
  'ninja','slash','blade','swift','katana','strike','dash','sharp','edge','flow','focus','shadow','storm','flash',
  'quick','type','speed','combo','burst','power','pixel','laser','turbo','nitro','swipe','glow','spark','bolt',
  'zen','arc','flick','whirl','sever','cut','snap','rush','glide','pulse','saber','honor','steel','wind','fire',
  'rapid','agile','vault','pivot','razor','strike','master','dojo','shuriken','tempo','rhythm','streak','frost',
  'code','key','word','fast','hero','epic','wave','rise','peak','apex','elite','prime','swiftly','glory',
];
const BOMB_WORDS = ['stop','trap','doom','void','halt','bomb','risk','curse'];

interface Orb {
  active: boolean; word: string; typed: number; x: number; y: number; vx: number; vy: number;
  r: number; hue: number; bomb: boolean; born: number; sliced: boolean;
}
interface Particle { active: boolean; x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hue: number; }
interface Half { active: boolean; x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number; r: number; hue: number; dir: number; }
interface FloatText { active: boolean; x: number; y: number; vy: number; life: number; max: number; text: string; color: string; size: number; }

type Screen = 'menu' | 'playing' | 'over';

export default function NinjaSlashPage() {
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

  const g = useRef({
    orbs: [] as Orb[], parts: [] as Particle[], halves: [] as Half[], texts: [] as FloatText[],
    buffer: '', score: 0, combo: 0, maxCombo: 0, lives: 3, shownLives: -1, keysGood: 0, keysBad: 0,
    slicedChars: 0, startTime: 0, spawnTimer: 0, spawnEvery: 1.1, elapsed: 0,
    shake: 0, timeScale: 1, slowmo: 0, flash: 0, bombFlash: 0, W: 800, H: 600,
  });

  // ── pools ──
  const getOrb = () => { const p = g.current.orbs.find(o => !o.active); if (p) return p; const n = { active: false } as Orb; g.current.orbs.push(n); return n; };
  const getPart = () => { const p = g.current.parts.find(o => !o.active); if (p) return p; const n = { active: false } as Particle; g.current.parts.push(n); return n; };
  const getHalf = () => { const p = g.current.halves.find(o => !o.active); if (p) return p; const n = { active: false } as Half; g.current.halves.push(n); return n; };
  const getText = () => { const p = g.current.texts.find(o => !o.active); if (p) return p; const n = { active: false } as FloatText; g.current.texts.push(n); return n; };

  const burst = (x: number, y: number, hue: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const p = getPart(); const a = Math.random() * Math.PI * 2; const s = 60 + Math.random() * 260;
      p.active = true; p.x = x; p.y = y; p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s - 40;
      p.life = p.max = 0.4 + Math.random() * 0.5; p.r = 2 + Math.random() * 4; p.hue = hue + (Math.random() * 40 - 20);
    }
  };
  const floaty = (x: number, y: number, text: string, color: string, size = 22) => {
    const t = getText(); t.active = true; t.x = x; t.y = y; t.vy = -60; t.life = t.max = 1; t.text = text; t.color = color; t.size = size;
  };

  const spawnOrb = () => {
    const st = g.current;
    const level = 1 + Math.floor(st.score / 400);
    const maxLen = Math.min(9, 4 + Math.floor(level / 2));
    const bomb = Math.random() < 0.14;
    const pool = bomb ? BOMB_WORDS : WORDS;
    // pick a word not already on screen and with a unique first letter when possible
    let word = pool[(Math.random() * pool.length) | 0];
    for (let tries = 0; tries < 6; tries++) {
      const w = pool[(Math.random() * pool.length) | 0];
      const clash = st.orbs.some(o => o.active && !o.sliced && o.word[0] === w[0]);
      if (!bomb && w.length > maxLen) continue;
      if (!clash) { word = w; break; }
      word = w;
    }
    const o = getOrb();
    o.active = true; o.sliced = false; o.word = word; o.typed = 0; o.bomb = bomb;
    o.x = 60 + Math.random() * (st.W - 120);
    o.y = st.H + 40;
    o.vx = (Math.random() * 2 - 1) * 60;
    o.vy = -(520 + Math.random() * 160 + level * 12);
    o.r = 26 + word.length * 2;
    o.hue = bomb ? 0 : (30 + Math.random() * 300);
    o.born = st.elapsed;
  };

  const sliceOrb = (o: Orb) => {
    const st = g.current;
    o.sliced = true; o.active = false;
    if (o.bomb) {
      st.lives -= 1; st.combo = 0; st.bombFlash = 1; st.shake = 22; sfx.bomb();
      burst(o.x, o.y, 0, 26); floaty(o.x, o.y, 'BOMB! -1', '#f43f5e', 26);
      if (st.lives <= 0) endGame();
      return;
    }
    const dt = st.elapsed - o.born;
    const crit = dt < 1.0;
    st.combo += 1; st.maxCombo = Math.max(st.maxCombo, st.combo);
    st.slicedChars += o.word.length;
    const mult = 1 + Math.floor(st.combo / 5);
    let gain = (10 + o.word.length * 4) * mult;
    if (crit) gain *= 2;
    st.score += gain;
    st.shake = Math.min(16, 6 + st.combo * 0.3);
    sfx.slice(); if (st.combo > 1) sfx.combo(st.combo);
    burst(o.x, o.y, o.hue, 16 + Math.min(20, st.combo));
    // two halves fly apart
    for (const dir of [-1, 1]) {
      const h = getHalf(); h.active = true; h.x = o.x; h.y = o.y; h.vx = dir * (120 + Math.random() * 120); h.vy = -120 - Math.random() * 120;
      h.rot = 0; h.vr = dir * (4 + Math.random() * 4); h.life = 0.8; h.r = o.r; h.hue = o.hue; h.dir = dir;
    }
    floaty(o.x, o.y - 6, (crit ? 'CRIT ' : '+') + gain, crit ? '#fbbf24' : '#a7f3d0', crit ? 26 : 20);
    // combo milestones → slow-mo flash
    if (st.combo > 0 && st.combo % 12 === 0) {
      st.slowmo = 0.7; st.flash = 0.8; sfx.perfect();
      floaty(st.W / 2, st.H / 2 - 40, 'PERFECT x' + st.combo, '#22d3ee', 40);
    }
  };

  const onChar = useCallback((raw: string) => {
    const st = g.current;
    if (screenRef.current !== 'playing') return;
    const ch = raw.toLowerCase();
    if (ch.length !== 1 || ch === ' ') return;
    const nb = st.buffer + ch;
    const cands = st.orbs.filter(o => o.active && !o.sliced && o.word.startsWith(nb));
    if (cands.length === 0) {
      st.keysBad += 1; st.combo = 0; st.shake = Math.max(st.shake, 5); sfx.miss();
      st.buffer = ''; for (const o of st.orbs) o.typed = 0;
      return;
    }
    st.buffer = nb; st.keysGood += 1; sfx.key();
    for (const o of st.orbs) if (o.active && !o.sliced) o.typed = o.word.startsWith(nb) ? nb.length : 0;
    const exact = cands.find(o => o.word === nb);
    if (exact) { sliceOrb(exact); st.buffer = ''; for (const o of st.orbs) o.typed = 0; }
  }, []);

  const endGame = () => {
    const st = g.current;
    screenRef.current = 'over';
    const mins = Math.max(0.05, (performance.now() - st.startTime) / 60000);
    const wpm = Math.round((st.slicedChars / 5) / mins);
    const totalKeys = st.keysGood + st.keysBad;
    const acc = totalKeys ? Math.round((st.keysGood / totalKeys) * 100) : 100;
    const xp = Math.floor(st.score / 8) + st.maxCombo;
    const coins = Math.floor(st.score / 20);
    const reward = addRewards({ game: GAME_ID, score: st.score, xp, coins });
    try { localStorage.setItem('ninjaslash_best', String(reward.profile.bestScores[GAME_ID] || st.score)); } catch { /**/ }
    setProfile(reward.profile);
    setResult({ score: st.score, maxCombo: st.maxCombo, wpm, acc, xp, coins, reward });
    sfx.over();
    if (reward.leveledUp) window.setTimeout(() => sfx.levelup(), 400);
    setScreen('over');
  };

  const startGame = useCallback(() => {
    sfx.resume(); sfx.start();
    const st = g.current;
    st.orbs.forEach(o => o.active = false); st.parts.forEach(p => p.active = false);
    st.halves.forEach(h => h.active = false); st.texts.forEach(t => t.active = false);
    st.buffer = ''; st.score = 0; st.combo = 0; st.maxCombo = 0; st.lives = 3; st.shownLives = -1;
    st.keysGood = 0; st.keysBad = 0; st.slicedChars = 0; st.spawnTimer = 0; st.spawnEvery = 1.15;
    st.elapsed = 0; st.shake = 0; st.timeScale = 1; st.slowmo = 0; st.flash = 0; st.bombFlash = 0;
    st.startTime = performance.now();
    setResult(null);
    screenRef.current = 'playing';
    setScreen('playing');
    if (isMobile) setTimeout(() => hiddenRef.current?.focus(), 100);
  }, [isMobile]);

  // ── main loop ──
  useEffect(() => {
    const canvas = canvasRef.current!; const ctx = canvas.getContext('2d')!;
    let raf = 0; let last = performance.now(); let running = true;

    const resize = () => {
      const wrap = wrapRef.current!; const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = wrap.clientWidth, h = wrap.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.current.W = w; g.current.H = h;
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrapRef.current!);

    const frame = (now: number) => {
      if (!running) return;
      const st = g.current;
      let dt = Math.min(0.05, (now - last) / 1000); last = now;
      // slow-mo easing
      const target = st.slowmo > 0 ? 0.35 : 1; st.timeScale += (target - st.timeScale) * 0.15;
      if (st.slowmo > 0) st.slowmo -= dt;
      const sdt = dt * st.timeScale;
      const W = st.W, H = st.H;

      // trail bg
      ctx.setTransform(Math.min(2, window.devicePixelRatio || 1), 0, 0, Math.min(2, window.devicePixelRatio || 1), 0, 0);
      ctx.fillStyle = 'rgba(8,10,22,0.32)'; ctx.fillRect(0, 0, W, H);

      // screen shake
      const sh = st.shake; if (sh > 0) { ctx.translate((Math.random() * 2 - 1) * sh, (Math.random() * 2 - 1) * sh); st.shake *= 0.86; if (st.shake < 0.4) st.shake = 0; }

      if (screenRef.current === 'playing') {
        st.elapsed += sdt;
        // spawn
        st.spawnTimer -= sdt;
        st.spawnEvery = Math.max(0.42, 1.15 - st.elapsed * 0.006 - st.score * 0.00012);
        if (st.spawnTimer <= 0) { spawnOrb(); st.spawnTimer = st.spawnEvery * (0.7 + Math.random() * 0.6); }

        // update orbs
        for (const o of st.orbs) {
          if (!o.active) continue;
          o.vy += 720 * sdt; o.x += o.vx * sdt; o.y += o.vy * sdt;
          if (o.y - o.r > H + 30 && o.vy > 0) {
            o.active = false;
            if (!o.bomb) { st.lives -= 1; st.combo = 0; st.shake = 10; sfx.miss(); floaty(o.x, H - 40, 'MISS', '#f87171', 20); if (st.lives <= 0) endGame(); }
          }
        }
      }

      // update halves
      for (const h of st.halves) { if (!h.active) continue; h.vy += 720 * sdt; h.x += h.vx * sdt; h.y += h.vy * sdt; h.rot += h.vr * sdt; h.life -= dt; if (h.life <= 0 || h.y - h.r > H + 40) h.active = false; }
      // particles
      for (const p of st.parts) { if (!p.active) continue; p.vy += 380 * sdt; p.x += p.vx * sdt; p.y += p.vy * sdt; p.life -= dt; if (p.life <= 0) p.active = false; }
      // floating text
      for (const t of st.texts) { if (!t.active) continue; t.y += t.vy * dt; t.vy *= 0.94; t.life -= dt; if (t.life <= 0) t.active = false; }

      // ── DRAW ──
      // particles
      for (const p of st.parts) { if (!p.active) continue; const a = p.life / p.max; ctx.globalAlpha = a; ctx.fillStyle = `hsl(${p.hue},90%,62%)`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * a + 0.5, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      // halves (arc slices)
      for (const h of st.halves) {
        if (!h.active) continue; ctx.save(); ctx.globalAlpha = Math.max(0, h.life); ctx.translate(h.x, h.y); ctx.rotate(h.rot);
        ctx.fillStyle = `hsla(${h.hue},85%,58%,0.9)`; ctx.beginPath();
        ctx.arc(0, 0, h.r, h.dir > 0 ? -Math.PI / 2 : Math.PI / 2, h.dir > 0 ? Math.PI / 2 : (Math.PI * 3) / 2); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      ctx.globalAlpha = 1;
      // orbs
      for (const o of st.orbs) {
        if (!o.active || o.sliced) continue;
        const grad = ctx.createRadialGradient(o.x - o.r * 0.3, o.y - o.r * 0.3, o.r * 0.2, o.x, o.y, o.r);
        if (o.bomb) { grad.addColorStop(0, '#fecaca'); grad.addColorStop(1, '#b91c1c'); }
        else { grad.addColorStop(0, `hsl(${o.hue},95%,72%)`); grad.addColorStop(1, `hsl(${o.hue},85%,45%)`); }
        ctx.shadowColor = o.bomb ? '#ef4444' : `hsl(${o.hue},90%,60%)`; ctx.shadowBlur = 22;
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
        // word
        ctx.font = `800 ${Math.max(16, o.r * 0.62)}px ui-monospace, monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const label = o.word;
        ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.strokeText(label, o.x, o.y + 1);
        if (o.typed > 0 && !o.bomb) {
          const tw = ctx.measureText(label).width; const start = o.x - tw / 2;
          const done = label.slice(0, o.typed); const rest = label.slice(o.typed);
          ctx.textAlign = 'left';
          ctx.fillStyle = '#22d3ee'; ctx.fillText(done, start, o.y + 1);
          ctx.fillStyle = '#ffffff'; ctx.fillText(rest, start + ctx.measureText(done).width, o.y + 1);
          ctx.textAlign = 'center';
        } else {
          ctx.fillStyle = o.bomb ? '#fff' : '#ffffff'; ctx.fillText(o.bomb ? '☠ ' + label : label, o.x, o.y + 1);
        }
      }
      // floating texts
      for (const t of st.texts) { if (!t.active) continue; ctx.globalAlpha = Math.max(0, t.life / t.max); ctx.font = `900 ${t.size}px ui-sans-serif, system-ui`; ctx.textAlign = 'center'; ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y); }
      ctx.globalAlpha = 1;

      // flashes
      if (st.flash > 0) { ctx.fillStyle = `rgba(34,211,238,${st.flash * 0.25})`; ctx.fillRect(-40, -40, W + 80, H + 80); st.flash -= dt * 2; }
      if (st.bombFlash > 0) { ctx.fillStyle = `rgba(244,63,94,${st.bombFlash * 0.4})`; ctx.fillRect(-40, -40, W + 80, H + 80); st.bombFlash -= dt * 2; }

      // HUD imperative updates
      if (screenRef.current === 'playing') {
        if (scoreEl.current) scoreEl.current.textContent = String(st.score);
        if (comboEl.current) comboEl.current.textContent = st.combo > 1 ? 'x' + st.combo : '';
        if (coinsEl.current) coinsEl.current.textContent = String(Math.floor(st.score / 20));
        const mins = Math.max(0.03, (performance.now() - st.startTime) / 60000);
        if (wpmEl.current) wpmEl.current.textContent = String(Math.round((st.slicedChars / 5) / mins));
        const tk = st.keysGood + st.keysBad; if (accEl.current) accEl.current.textContent = (tk ? Math.round((st.keysGood / tk) * 100) : 100) + '%';
        if (st.lives !== st.shownLives && livesEl.current) { st.shownLives = st.lives; livesEl.current.innerHTML = '❤️'.repeat(Math.max(0, st.lives)) + '<span style="opacity:.25">' + '🖤'.repeat(Math.max(0, 3 - st.lives)) + '</span>'; }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // desktop keyboard
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (screenRef.current !== 'playing') return;
      if (e.key === 'Backspace') { e.preventDefault(); g.current.buffer = g.current.buffer.slice(0, -1); return; }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); onChar(e.key); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, onChar]);

  const mobileLast = useRef('');
  const onMobile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; const prev = mobileLast.current;
    if (v.length > prev.length) for (const c of v.slice(prev.length)) onChar(c);
    mobileLast.current = v;
    if (v.length > 40) { mobileLast.current = ''; e.target.value = ''; }
  };

  const toggleSound = () => { const n = !soundOn; sfx.setEnabled(n); setSoundOn(n); if (n) { sfx.resume(); sfx.key(); } };
  const lp = levelProgress(profile.xp);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden text-white select-none"
      style={{ background: 'radial-gradient(1200px 600px at 50% -10%, #1e293b, #0a0a16 60%, #060610)' }}
      onClick={() => isMobile && screen === 'playing' && hiddenRef.current?.focus()}>
      <Seo title="Ninja Slash — Typing Game | FastTypingLab" description="Slice flying words with lightning-fast typing. Combos, crits, slow-mo and XP — a modern typing game that makes you faster without feeling like practice." />

      {/* animated glow blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle,#22d3ee,transparent)' }} />
      <div className="pointer-events-none absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle,#a78bfa,transparent)' }} />

      {isMobile && (
        <input ref={hiddenRef} onChange={onMobile}
          className="fixed opacity-0 pointer-events-none w-1 h-1 top-0 left-0 z-[-1]"
          autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} aria-hidden />
      )}

      {/* top bar */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 h-14">
        <Link to="/games" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold transition-colors">
          <ChevronLeft className="w-4 h-4" /> Games
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <Zap className="w-3.5 h-3.5" /> Lv {lp.level}
          </div>
          <button onClick={toggleSound} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* game viewport */}
      <div ref={wrapRef} className="relative mx-auto max-w-4xl h-[calc(100dvh-3.5rem-1rem)] px-0 sm:px-4">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-none sm:rounded-3xl" />

        {/* in-game HUD */}
        {screen === 'playing' && (
          <div className="absolute inset-x-0 top-0 z-10 p-3 sm:p-4 flex items-start justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="bg-black/30 backdrop-blur border border-white/10 rounded-2xl px-3 py-2">
                <div className="text-[9px] uppercase tracking-widest text-white/50">Score</div>
                <span ref={scoreEl} className="text-2xl font-black font-mono tabular-nums">0</span>
              </div>
              <span ref={comboEl} className="text-3xl font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]"></span>
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

        {/* MENU */}
        <AnimatePresence>
          {screen === 'menu' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white/[0.06] backdrop-blur-xl border border-white/12 rounded-3xl p-7 text-center shadow-2xl">
                <motion.div initial={{ scale: 0.6, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 12 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-lg" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>🥷</motion.div>
                <h1 className="text-3xl font-black tracking-tight mb-1">Ninja <span className="text-cyan-300">Slash</span></h1>
                <p className="text-white/50 text-sm mb-5">Slice the flying words by typing them. Build combos, land crits, dodge the <span className="text-rose-400 font-semibold">☠ bombs</span>.</p>
                <div className="grid grid-cols-2 gap-2 mb-5 text-left">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">Best</div><div className="text-lg font-black text-amber-300 flex items-center gap-1"><Trophy className="w-4 h-4" />{profile.bestScores[GAME_ID] || 0}</div></div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">Streak</div><div className="text-lg font-black text-orange-300 flex items-center gap-1"><Flame className="w-4 h-4" />{profile.streak}d</div></div>
                </div>
                {/* level bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Level {lp.level}</span><span>{lp.into}/{lp.needed} XP</span></div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: lp.pct + '%', background: 'linear-gradient(90deg,#06b6d4,#a78bfa)' }} /></div>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={startGame}
                  className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
                  <Play className="w-5 h-5" /> Play
                </motion.button>
                <p className="text-white/30 text-xs mt-3">{isMobile ? 'Tap and type on your keyboard' : 'Just start typing — no clicking needed'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GAME OVER */}
        <AnimatePresence>
          {screen === 'over' && result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}
                className="w-full max-w-md bg-white/[0.06] backdrop-blur-xl border border-white/12 rounded-3xl p-7 text-center shadow-2xl">
                {result.reward.leveledUp && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-3 inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-300 rounded-full px-3 py-1 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5" /> Level Up! You're now Level {result.reward.newLevel}
                  </motion.div>
                )}
                <div className="text-4xl mb-2">{result.reward.isBest ? '🏆' : '🥷'}</div>
                <h2 className="text-2xl font-black mb-1">{result.reward.isBest ? 'New Best Score!' : 'Run Over'}</h2>
                <div className="text-4xl font-black font-mono text-cyan-300 mb-4">{result.score}</div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Max Combo', value: 'x' + result.maxCombo, icon: Target, c: 'text-fuchsia-300' },
                    { label: 'WPM', value: result.wpm, icon: Zap, c: 'text-cyan-300' },
                    { label: 'Accuracy', value: result.acc + '%', icon: Target, c: 'text-emerald-300' },
                    { label: 'Best', value: profile.bestScores[GAME_ID] || 0, icon: Trophy, c: 'text-amber-300' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="text-[10px] uppercase tracking-widest text-white/40">{s.label}</div>
                      <div className={`text-xl font-black font-mono ${s.c}`}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mb-5 text-sm font-bold">
                  <span className="flex items-center gap-1 text-cyan-300"><Zap className="w-4 h-4" /> +{result.xp} XP</span>
                  <span className="flex items-center gap-1 text-amber-300"><Coins className="w-4 h-4" /> +{result.coins}</span>
                </div>
                <div className="flex gap-3">
                  <motion.button whileTap={{ scale: 0.96 }} onClick={startGame}
                    className="flex-1 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </motion.button>
                  <Link to="/games" className="px-5 py-3.5 rounded-2xl font-bold bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors flex items-center">All Games</Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import WordTargetGame, { type GameConfig, type GameTarget, type EngineState } from '../../games/WordTargetGame';

const WORDS = [
  'star','nova','orbit','comet','laser','pulse','warp','photon','ion','plasma','rocket','galaxy','cosmos','meteor',
  'astro','solar','lunar','quark','void','flare','drone','alien','beam','shield','turbo','blast','core','fusion',
  'nebula','gravity','vortex','proton','saturn','venus','mars','jupiter','eclipse','signal','engine','thrust',
  'zap','ray','dash','burst','glow','swift','strike','target','pilot','hyper','cyber','matrix','quantum',
];

// Persistent starfield (module scope so it survives across frames).
const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 1.6, sp: 18 + Math.random() * 55 }));

function scene(ctx: CanvasRenderingContext2D, s: EngineState, now: number) {
  const { W, H } = s;
  ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff';
  for (const st of stars) {
    const y = (st.y * H + (now / 1000) * st.sp) % H;
    ctx.globalAlpha = 0.35 + Math.sin(now / 320 + st.x * 12) * 0.3;
    ctx.fillRect(st.x * W, y, st.s, st.s);
  }
  ctx.globalAlpha = 1;
  // ship
  const sx = W / 2, sy = H - 30;
  ctx.save();
  ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 16; ctx.fillStyle = '#22d3ee';
  ctx.beginPath(); ctx.moveTo(sx, sy - 18); ctx.lineTo(sx - 16, sy + 12); ctx.lineTo(sx, sy + 4); ctx.lineTo(sx + 16, sy + 12); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = `rgba(251,191,36,${0.5 + Math.sin(now / 55) * 0.3})`;
  ctx.beginPath(); ctx.arc(sx, sy + 13, 3.5 + Math.sin(now / 45) * 1.8, 0, 7); ctx.fill();
}

function draw(ctx: CanvasRenderingContext2D, t: GameTarget) {
  ctx.save();
  ctx.shadowColor = `hsl(${t.hue},90%,60%)`; ctx.shadowBlur = 18;
  const grad = ctx.createRadialGradient(t.x, t.y - t.r * 0.3, t.r * 0.2, t.x, t.y, t.r);
  grad.addColorStop(0, `hsl(${t.hue},95%,72%)`); grad.addColorStop(1, `hsl(${t.hue},80%,45%)`);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(t.x, t.y, t.r, t.r * 0.72, 0, 0, 7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function spawn(t: GameTarget, s: EngineState, pick: () => string) {
  t.word = pick(); t.x = 46 + Math.random() * (s.W - 92); t.y = -30; t.vx = (Math.random() * 2 - 1) * 20;
  t.vy = 58 + Math.random() * 42 + s.level * 10; t.r = 24 + t.word.length * 2; t.hue = 160 + Math.random() * 140;
}
function update(t: GameTarget, sdt: number, s: EngineState) { t.y += t.vy * sdt; t.x += t.vx * sdt; return t.y > s.H - 44; }

const config: GameConfig = {
  id: 'space-shooter', title: 'Space Shooter', titleAccent: '#22d3ee', emoji: '🚀',
  subtitle: 'Type the enemy words to fire your laser and blast the alien fleet before they reach your ship — a free typing game.',
  howTo: 'Aliens descend from deep space. Type the word on each one to lock your laser and blast it. Don\'t let them reach your ship!',
  bg: 'radial-gradient(1200px 600px at 50% -10%, #0b1026, #05060f 60%, #03030a)',
  accent: '#22d3ee', words: WORDS, lives: 3, bestKey: 'spaceshooter_best',
  spawnEvery: 1.2, minSpawn: 0.45, spawn, update, draw, scene, beamOrigin: (s) => ({ x: s.W / 2, y: s.H - 40 }),
};

export default function SpaceShooterPage() { return <WordTargetGame config={config} />; }

import WordTargetGame, { type GameConfig, type GameTarget, type EngineState } from '../../games/WordTargetGame';

const WORDS = [
  'rain','drop','storm','cloud','splash','pond','river','ocean','wave','flood','mist','dew','pour','drip','puddle',
  'thunder','wet','flow','stream','tide','ripple','soak','damp','swim','float','blue','cool','fresh','wash','spray',
  'type','quick','swift','fast','word','flash','burst','glow','pulse','dash','snap','flick','rush','glide','tempo',
  'focus','rhythm','streak','combo','power','turbo','breeze','frost','chill','clear','sky','light','shine',
];

const drops = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), len: 8 + Math.random() * 14, sp: 320 + Math.random() * 300 }));

function scene(ctx: CanvasRenderingContext2D, s: EngineState, now: number) {
  const { W, H } = s;
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0a1628'); sky.addColorStop(1, '#0e2140');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(147,197,253,0.22)'; ctx.lineWidth = 1.5;
  for (const d of drops) { const y = (d.y * H + (now / 1000) * d.sp) % H; const x = d.x * W; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + d.len); ctx.stroke(); }
  ctx.fillStyle = 'rgba(59,130,246,0.22)'; ctx.fillRect(0, H - 14, W, 14);
}

function draw(ctx: CanvasRenderingContext2D, t: GameTarget) {
  ctx.save(); ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 16;
  const g = ctx.createRadialGradient(t.x, t.y - t.r * 0.3, t.r * 0.2, t.x, t.y, t.r);
  g.addColorStop(0, '#bae6fd'); g.addColorStop(1, '#0284c7'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
}

function spawn(t: GameTarget, s: EngineState, pick: () => string) {
  t.word = pick(); t.x = 44 + Math.random() * (s.W - 88); t.y = -30; t.vx = 0;
  t.vy = 55 + Math.random() * 40 + s.level * 9; t.r = 24 + t.word.length * 2; t.hue = 205;
}
function update(t: GameTarget, sdt: number, s: EngineState) { t.y += t.vy * sdt; return t.y > s.H - 20; }

const config: GameConfig = {
  id: 'word-rain', title: 'Word Rain', titleAccent: '#38bdf8', emoji: '🌧️',
  subtitle: 'Type the falling words before they splash into the ground. Combos, crits and XP — a free typing game.',
  howTo: 'Words rain down from the storm. Type each one before it hits the ground. Speed rises the longer you survive!',
  bg: 'radial-gradient(1200px 600px at 50% -10%, #12325e, #0a1628 60%, #060d1a)',
  accent: '#38bdf8', words: WORDS, lives: 3, bestKey: 'wordrain_best',
  spawnEvery: 1.15, minSpawn: 0.42, spawn, update, draw, scene,
};

export default function WordRainGame() { return <WordTargetGame config={config} />; }

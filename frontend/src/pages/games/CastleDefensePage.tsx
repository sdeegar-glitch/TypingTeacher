import WordTargetGame, { type GameConfig, type GameTarget, type EngineState } from '../../games/WordTargetGame';

const WORDS = [
  'orc','troll','siege','sword','shield','arrow','castle','knight','dragon','magic','spell','tower','gate','wall',
  'guard','blade','armor','quest','realm','crown','forge','honor','valor','storm','fire','bolt','rune','beast',
  'giant','goblin','archer','battle','defend','strike','slay','charge','rampart','moat','banner','warrior','lance',
  'quick','swift','sharp','fast','type','combo','power','turbo','strong','brave','mighty','iron','steel',
];

function scene(ctx: CanvasRenderingContext2D, s: EngineState, now: number) {
  const { W, H } = s;
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#1e1b4b'); sky.addColorStop(0.6, '#4c1d95'); sky.addColorStop(1, '#7c2d12');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  // moon
  ctx.fillStyle = 'rgba(253,230,138,0.25)'; ctx.beginPath(); ctx.arc(70, 64, 28, 0, 7); ctx.fill();
  // ground
  ctx.fillStyle = '#3f2d1a'; ctx.fillRect(0, H - 40, W, 40);
  // castle
  const cx = W / 2;
  ctx.fillStyle = '#78716c'; ctx.fillRect(cx - 44, H - 92, 88, 60);
  ctx.fillStyle = '#57534e'; for (let i = -44; i < 44; i += 18) ctx.fillRect(cx + i, H - 100, 12, 12);
  ctx.fillStyle = '#292524'; ctx.fillRect(cx - 10, H - 62, 20, 30);
  // flag
  ctx.fillStyle = '#f59e0b'; ctx.fillRect(cx - 1, H - 122, 2, 24);
  ctx.beginPath(); ctx.moveTo(cx + 1, H - 122); ctx.lineTo(cx + 16, H - 116 + Math.sin(now / 300) * 2); ctx.lineTo(cx + 1, H - 110); ctx.fill();
}

function draw(ctx: CanvasRenderingContext2D, t: GameTarget) {
  ctx.save(); ctx.shadowColor = '#84cc16'; ctx.shadowBlur = 12;
  ctx.fillStyle = `hsl(${90 + t.seed * 35},34%,40%)`;
  ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#fde047';
  ctx.beginPath(); ctx.arc(t.x - t.r * 0.33, t.y - t.r * 0.16, t.r * 0.12, 0, 7); ctx.arc(t.x + t.r * 0.33, t.y - t.r * 0.16, t.r * 0.12, 0, 7); ctx.fill();
  ctx.restore();
}

function spawn(t: GameTarget, s: EngineState, pick: () => string) {
  t.word = pick(); t.x = 44 + Math.random() * (s.W - 88); t.y = -30; t.vx = 0;
  t.vy = 40 + Math.random() * 30 + s.level * 8; t.r = 24 + t.word.length * 2; t.hue = 100;
}
function update(t: GameTarget, sdt: number, s: EngineState) { t.y += t.vy * sdt; return t.y > s.H - 78; }

const config: GameConfig = {
  id: 'castle-defense', title: 'Castle Defense', titleAccent: '#f59e0b', emoji: '🏰',
  subtitle: 'Defend your castle by typing the words on approaching enemies to loose your arrows. A free typing game.',
  howTo: 'Enemies march on your castle. Type the word on each to fire an arrow and strike it down before it reaches the walls!',
  bg: 'radial-gradient(1200px 600px at 50% -10%, #3b1d6e, #1e1b4b 60%, #120f30)',
  accent: '#f59e0b', words: WORDS, lives: 3, bestKey: 'castledefense_best',
  spawnEvery: 1.25, minSpawn: 0.5, spawn, update, draw, scene, beamOrigin: (s) => ({ x: s.W / 2, y: s.H - 92 }),
};

export default function CastleDefensePage() { return <WordTargetGame config={config} />; }

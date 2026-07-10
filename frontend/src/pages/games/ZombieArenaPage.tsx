import WordTargetGame, { type GameConfig, type GameTarget, type EngineState } from '../../games/WordTargetGame';

const WORDS = [
  'brain','dead','grave','flesh','decay','rot','moan','crawl','bite','virus','undead','curse','doom','fear','dark',
  'blood','skull','bone','shadow','night','ghoul','horde','corpse','plague','infect','stalk','lurk','howl','dread',
  'zombie','panic','escape','fight','shoot','survive','hunt','claw','snarl','feast','tomb','crypt','ghost','wraith',
  'run','hide','strike','defend','barricade','ammo','flare','torch','axe','blade','swift','quick','sharp',
];

function scene(ctx: CanvasRenderingContext2D, s: EngineState, now: number) {
  const { W, H } = s;
  ctx.fillStyle = '#080d08'; ctx.fillRect(0, 0, W, H);
  // eerie moon glow
  ctx.fillStyle = 'rgba(180,255,190,0.10)'; ctx.beginPath(); ctx.arc(W - 60, 62, 40, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(210,255,215,0.22)'; ctx.beginPath(); ctx.arc(W - 60, 62, 26, 0, 7); ctx.fill();
  // ground fog
  const fog = ctx.createLinearGradient(0, H - 90, 0, H); fog.addColorStop(0, 'rgba(30,60,30,0)'); fog.addColorStop(1, 'rgba(40,90,50,0.4)');
  ctx.fillStyle = fog; ctx.fillRect(0, H - 90, W, 90);
  // barricade
  ctx.fillStyle = 'rgba(90,60,30,0.65)'; ctx.fillRect(0, H - 22, W, 22);
  ctx.strokeStyle = 'rgba(60,40,20,0.8)'; ctx.lineWidth = 2;
  for (let x = 10; x < W; x += 26) { ctx.beginPath(); ctx.moveTo(x, H - 22); ctx.lineTo(x + 6, H); ctx.stroke(); }
  void now;
}

function draw(ctx: CanvasRenderingContext2D, t: GameTarget) {
  ctx.save();
  ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 14;
  const hue = 95 + t.seed * 40;
  ctx.fillStyle = `hsl(${hue},42%,42%)`;
  ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, 7); ctx.fill();
  ctx.shadowBlur = 0;
  // sunken glowing eyes
  ctx.fillStyle = '#bef264';
  ctx.beginPath(); ctx.arc(t.x - t.r * 0.34, t.y - t.r * 0.18, t.r * 0.13, 0, 7); ctx.arc(t.x + t.r * 0.34, t.y - t.r * 0.18, t.r * 0.13, 0, 7); ctx.fill();
  ctx.restore();
}

function spawn(t: GameTarget, s: EngineState, pick: () => string) {
  t.word = pick(); t.x = 44 + Math.random() * (s.W - 88); t.y = -30; t.vx = (Math.random() * 2 - 1) * 12;
  t.vy = 38 + Math.random() * 28 + s.level * 8; t.r = 24 + t.word.length * 2; t.hue = 110;
}
function update(t: GameTarget, sdt: number, s: EngineState) { t.y += t.vy * sdt; t.x += t.vx * sdt; return t.y > s.H - 28; }

const config: GameConfig = {
  id: 'zombie', title: 'Zombie Typing', titleAccent: '#22c55e', emoji: '🧟',
  subtitle: 'Zombies claw toward your barricade — type the word on each one to take it down before it breaks through. A free typing survival game.',
  howTo: 'Zombies shamble toward your barricade. Type the word on each to destroy it. Keep the horde back — don\'t let them break through!',
  bg: 'radial-gradient(1200px 600px at 50% -10%, #10231a, #0a0f0a 60%, #060a06)',
  accent: '#22c55e', words: WORDS, lives: 3, bestKey: 'zombie_best',
  spawnEvery: 1.25, minSpawn: 0.5, spawn, update, draw, scene,
};

export default function ZombieArenaPage() { return <WordTargetGame config={config} />; }

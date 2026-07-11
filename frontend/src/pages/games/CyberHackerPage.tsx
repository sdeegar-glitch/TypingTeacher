import WordTargetGame, { type GameConfig, type GameTarget, type EngineState } from '../../games/WordTargetGame';

const WORDS = [
  'hack','root','node','byte','code','shell','proxy','cipher','token','script','packet','breach','crypto','admin',
  'kernel','socket','buffer','stack','daemon','exploit','payload','firewall','decrypt','malware','trojan','vpn',
  'server','query','bypass','inject','trace','ping','ssh','port','data','login','access','override','matrix','virus',
  'binary','logic','array','loop','patch','debug','ghost','worm','spoof','scan','pivot','signal','grid',
];

const cols: number[] = [];
function scene(ctx: CanvasRenderingContext2D, s: EngineState, now: number) {
  const { W, H } = s;
  ctx.fillStyle = '#02070a'; ctx.fillRect(0, 0, W, H);
  const n = Math.floor(W / 16);
  if (cols.length !== n) { cols.length = 0; for (let i = 0; i < n; i++) cols.push(Math.random() * -30); }
  ctx.font = '14px monospace';
  for (let i = 0; i < n; i++) {
    cols[i] += 0.35 + (i % 4) * 0.12;
    if (cols[i] * 16 > H + 40) cols[i] = Math.random() * -20;
    const x = i * 16, y = cols[i] * 16;
    ctx.fillStyle = 'rgba(134,239,172,0.85)'; ctx.fillText(String.fromCharCode(0x30A0 + (((now / 90) + i) | 0) % 96), x, y);
    ctx.fillStyle = 'rgba(34,197,94,0.28)'; ctx.fillText(String.fromCharCode(0x30A0 + (((now / 130) + i * 3) | 0) % 96), x, y - 16);
  }
}

function hexPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
  ctx.closePath();
}
function draw(ctx: CanvasRenderingContext2D, t: GameTarget) {
  ctx.save(); ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 16;
  ctx.fillStyle = 'rgba(20,83,45,0.55)'; hexPath(ctx, t.x, t.y, t.r); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = '#4ade80'; hexPath(ctx, t.x, t.y, t.r); ctx.stroke();
  ctx.shadowBlur = 0; ctx.restore();
}

function spawn(t: GameTarget, s: EngineState, pick: () => string) {
  t.word = pick(); t.x = 46 + Math.random() * (s.W - 92); t.y = -30; t.vx = (Math.random() * 2 - 1) * 14;
  t.vy = 52 + Math.random() * 38 + s.level * 9; t.r = 26 + t.word.length * 2; t.hue = 140;
}
function update(t: GameTarget, sdt: number, s: EngineState) { t.y += t.vy * sdt; t.x += t.vx * sdt; return t.y > s.H - 40; }

const config: GameConfig = {
  id: 'cyber-hacker', title: 'Cyber Hacker', titleAccent: '#4ade80', emoji: '💻',
  subtitle: 'Breach the firewall by typing code fast. Matrix-style hacking action — a free typing game.',
  howTo: 'Data nodes stream down the network. Type each code word to hack and destroy it before it breaches your terminal!',
  bg: 'radial-gradient(1200px 600px at 50% -10%, #052e16, #02070a 60%, #010304)',
  accent: '#4ade80', words: WORDS, lives: 3, bestKey: 'cyberhacker_best',
  spawnEvery: 1.15, minSpawn: 0.44, spawn, update, draw, scene, beamOrigin: (s) => ({ x: s.W / 2, y: s.H - 20 }),
};

export default function CyberHackerPage() { return <WordTargetGame config={config} />; }

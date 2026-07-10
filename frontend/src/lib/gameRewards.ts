// Player progression + economy foundation — shared by every FastTypingLab game.
// XP, levels, coins, streaks, per-game best scores and achievements, persisted
// to localStorage. (Supabase sync can be layered on later without changing the
// call sites.)

export interface PlayerProfile {
  xp: number;
  coins: number;
  bestScores: Record<string, number>;
  achievements: string[];
  lastPlayed: string; // YYYY-MM-DD
  streak: number;
  gamesPlayed: number;
}

const KEY = 'ftl_player_v1';

const empty = (): PlayerProfile => ({
  xp: 0, coins: 0, bestScores: {}, achievements: [], lastPlayed: '', streak: 0, gamesPlayed: 0,
});

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch { return empty(); }
}

function persist(p: PlayerProfile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// Level curve: each level L needs L*120 XP; cumulative is a triangular number.
export function levelForXp(xp: number): number {
  let level = 1, need = 120, acc = 0;
  while (acc + need <= xp) { acc += need; level++; need = level * 120; }
  return level;
}
export function levelProgress(xp: number): { level: number; into: number; needed: number; pct: number } {
  const level = levelForXp(xp);
  let acc = 0;
  for (let l = 1; l < level; l++) acc += l * 120;
  const into = xp - acc;
  const needed = level * 120;
  return { level, into, needed, pct: Math.min(100, Math.round((into / needed) * 100)) };
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

export interface RewardOutcome {
  profile: PlayerProfile;
  leveledUp: boolean;
  newLevel: number;
  isBest: boolean;
  streak: number;
}

/** Award XP + coins for a finished game run; updates best score, streak, level. */
export function addRewards(opts: { game: string; score: number; xp: number; coins: number }): RewardOutcome {
  const p = loadProfile();
  const beforeLevel = levelForXp(p.xp);

  p.xp += Math.max(0, Math.round(opts.xp));
  p.coins += Math.max(0, Math.round(opts.coins));
  p.gamesPlayed += 1;

  const prevBest = p.bestScores[opts.game] || 0;
  const isBest = opts.score > prevBest;
  if (isBest) p.bestScores[opts.game] = opts.score;

  // Daily play streak.
  const today = todayStr();
  if (p.lastPlayed !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    p.streak = p.lastPlayed === yesterday ? p.streak + 1 : 1;
    p.lastPlayed = today;
  }

  const afterLevel = levelForXp(p.xp);
  persist(p);
  return { profile: p, leveledUp: afterLevel > beforeLevel, newLevel: afterLevel, isBest, streak: p.streak };
}

export function unlockAchievement(id: string): boolean {
  const p = loadProfile();
  if (p.achievements.includes(id)) return false;
  p.achievements.push(id);
  persist(p);
  return true;
}

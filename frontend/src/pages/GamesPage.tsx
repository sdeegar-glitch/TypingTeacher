import { useEffect } from 'react';
import Seo from '../components/Seo';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Gamepad2, Trophy, Zap, Star } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const GAMES = [
  {
    id: 'word-rain',
    title: 'Word Rain',
    emoji: '🌧️',
    desc: 'Words fall from the sky — type them before they hit the ground! Speed increases each level.',
    gradient: 'from-blue-600 to-cyan-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    tag: 'Most Popular',
    tagColor: 'bg-blue-500/20 text-blue-400',
    href: '/games/word-rain',
    bestKey: 'wordrain_best',
  },
  {
    id: 'zombie',
    title: 'Zombie Typing',
    emoji: '🧟',
    desc: 'Zombies march toward you — type the word on each zombie to destroy it before it reaches you!',
    gradient: 'from-emerald-600 to-green-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    tag: 'Action',
    tagColor: 'bg-emerald-500/20 text-emerald-400',
    href: '/games/zombie',
    bestKey: 'zombie_best',
  },
  {
    id: 'speed-racer',
    title: 'Speed Racer',
    emoji: '🏎️',
    desc: 'Race against a ghost driver! Type the passage faster than your opponent across 3 difficulty levels.',
    gradient: 'from-amber-600 to-orange-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    tag: 'Race Mode',
    tagColor: 'bg-amber-500/20 text-amber-400',
    href: '/games/speed-racer',
    bestKey: 'speedracer_best',
  },
  {
    id: 'falling-letters',
    title: 'Falling Letters',
    emoji: '🔤',
    desc: 'Single letters fall and multiply — press the key before the screen fills up!',
    gradient: 'from-violet-600 to-purple-500',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    tag: 'Coming Soon',
    tagColor: 'bg-violet-500/20 text-violet-400',
    href: '/games',
    bestKey: '',
  },
];

export default function GamesPage() {
  useEffect(() => {
    document.title = 'Typing Games — Fun Zone | FastTypingLab';
  }, []);

  const getBest = (key: string) => {
    if (!key) return null;
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="Typing Games — Word Rain, Zombie & Speed Racer | FastTypingLab"
        description="Free typing games to boost your speed while having fun — Word Rain, Zombie Typing and Speed Racer. Improve WPM and accuracy through play."
      />
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <PageHeader
          icon={Gamepad2}
          title="Typing Games"
          subtitle="Improve your typing speed while having fun. Earn XP and compete for high scores!"
        />

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'XP Earned', value: (() => { try { return JSON.parse(localStorage.getItem('typingHistory') || '[]').length * 15; } catch { return 0; } })(), icon: Zap, color: 'text-brand-primary' },
            { label: 'Games Played', value: (getBest('wordrain_best') ? 1 : 0) + (getBest('zombie_best') ? 1 : 0), icon: Gamepad2, color: 'text-brand-accent' },
            { label: 'Best Score', value: Math.max(getBest('wordrain_best')?.score || 0, getBest('zombie_best')?.score || 0), icon: Trophy, color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-brand-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Games grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {GAMES.map((game, i) => {
            const best = getBest(game.bestKey);
            const isLive = !game.href.includes('/games') || game.href !== '/games';
            return (
              <motion.div key={game.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}>
                <Link to={game.href}
                  className={`group block relative overflow-hidden bg-brand-surface border ${game.border} rounded-3xl p-6 hover:shadow-xl transition-all duration-300 ${!isLive ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                  onClick={e => !isLive && e.preventDefault()}>

                  {/* Gradient blob */}
                  <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${game.gradient} opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl ${game.bg} border ${game.border} flex items-center justify-center text-3xl`}>
                        {game.emoji}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${game.tagColor}`}>
                          {game.tag}
                        </span>
                        {best && (
                          <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" /> Best: {best.score}
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="text-xl font-black text-brand-text mb-2">{game.title}</h2>
                    <p className="text-brand-text-muted text-sm leading-relaxed mb-4">{game.desc}</p>

                    <div className={`flex items-center gap-2 text-sm font-bold ${isLive ? 'text-brand-primary' : 'text-brand-muted'}`}>
                      {isLive ? (
                        <><span>Play Now</span><ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                      ) : (
                        <span>Coming Soon</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* XP info */}
        <div className="mt-10 bg-brand-surface border border-brand-border rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h3 className="font-bold text-brand-text mb-1">Earn XP by Playing!</h3>
            <p className="text-brand-text-muted text-sm">Every game awards XP that counts toward your level on the Dashboard. Higher scores = more XP. Complete daily challenges for bonus XP rewards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

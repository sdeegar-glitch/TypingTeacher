import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import Seo from '../components/Seo';

// Real-time multiplayer is not built yet. The previous version simulated
// opponents with bots, which was misleading, so this page is honest until the
// realtime backend exists (see the completion plan, Phase 5).
export default function MultiplayerPage() {
  return (
    <div className="bg-brand-bg text-brand-text py-6 px-4">
      <Seo
        title="Multiplayer Typing Race | FastTypingLab"
        description="Real-time multiplayer typing races are coming to FastTypingLab. Practice with our typing tests and games in the meantime."
        noindex
      />
      <div className="max-w-xl mx-auto text-center">
        <Users className="w-10 h-10 mx-auto mb-4 text-brand-primary" />
        <h1 className="text-3xl font-black mb-3">Multiplayer Race — Coming Soon</h1>
        <p className="text-brand-muted mb-8">
          We're building real head-to-head typing races against other people. Until it's ready,
          sharpen your speed with a timed test or one of our typing games.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/tests/" className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold transition-all">
            Take a Typing Test
          </Link>
          <Link to="/games/" className="bg-brand-surface border border-brand-border px-6 py-3 rounded-xl font-bold hover:bg-brand-surface-2 transition-all">
            Play Typing Games
          </Link>
        </div>
      </div>
    </div>
  );
}

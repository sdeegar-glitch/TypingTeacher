import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { fetchVisitorCount, type VisitorCount } from '../lib/api';

/** Live site visitor counter. Hidden until real data is available. */
export default function VisitorCounter({ className = '' }: { className?: string }) {
  const [count, setCount] = useState<VisitorCount | null>(null);

  useEffect(() => {
    let alive = true;
    fetchVisitorCount().then(c => { if (alive) setCount(c); });
    return () => { alive = false; };
  }, []);

  if (!count || count.total <= 0) return null;

  const fmt = (n: number) => n.toLocaleString('en-IN');

  return (
    <div className={`inline-flex items-center gap-2 text-xs text-brand-muted ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inset-0 rounded-full bg-brand-accent opacity-70" />
        <span className="relative rounded-full h-2 w-2 bg-brand-accent" />
      </span>
      <Eye className="w-3.5 h-3.5" />
      <span>
        <span className="font-bold text-brand-text">{fmt(count.total)}</span> visits
        {count.unique != null && (
          <> · <span className="font-bold text-brand-text">{fmt(count.unique)}</span> visitors</>
        )}
      </span>
    </div>
  );
}

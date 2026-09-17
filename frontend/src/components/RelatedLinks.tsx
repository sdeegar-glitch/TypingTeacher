import { Link } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';

export interface RelatedLinkItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface RelatedLinksProps {
  title?: string;
  items: RelatedLinkItem[];
  className?: string;
}

/** Reusable "related pages" strip — 2-3 linked cards used across exam, blog,
 *  tool and lesson pages to strengthen internal linking (AdSense roadmap Phase 3). */
export default function RelatedLinks({ title = 'Related pages', items, className = '' }: RelatedLinksProps) {
  if (items.length === 0) return null;
  return (
    <section className={`mt-10 ${className}`}>
      <h2 className="text-base font-black text-brand-text mb-3">{title}</h2>
      <div className={`grid grid-cols-1 ${items.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
        {items.map(item => (
          <Link key={item.href} to={item.href}
            className="group flex items-center justify-between gap-2 bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm font-semibold text-brand-text hover:border-brand-primary/40 transition-all">
            <span className="flex items-center gap-2 min-w-0">
              {item.icon && <item.icon className="w-4 h-4 text-brand-primary shrink-0" />}
              <span className="truncate">{item.label}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  /** Icon shown in the rounded badge beside the title. */
  icon: LucideIcon;
  /** Heading text (can include <span className="gradient-text"> highlights). */
  title: ReactNode;
  /** Optional one-line supporting text shown centered below the heading. */
  subtitle?: ReactNode;
  /** Small label above the title. Only use when it adds information the title lacks. */
  eyebrow?: ReactNode;
  /** Custom icon background gradient. Defaults to the teal brand badge. */
  gradient?: string;
  /** Render title/eyebrow in the Devanagari font. */
  devanagari?: boolean;
  /** Back link / actions: left of the title on wide screens, above it on phones. */
  actions?: ReactNode;
  /** Extra content rendered below the subtitle (stats strips, buttons…). */
  children?: ReactNode;
  className?: string;
}

/**
 * Compact, centered page header used across the app: icon + one h1 on a single
 * line, an optional one-line subtitle, and a slot for the back link so it does
 * not need a row of its own. Sizes follow the site type scale (h1 24/28px).
 */
export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  eyebrow,
  gradient,
  devanagari,
  actions,
  children,
  className = '',
}: PageHeaderProps) {
  const devFont = devanagari ? { fontFamily: "'Noto Sans Devanagari',sans-serif" } : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative text-center mb-4 ${className}`}
    >
      {actions && (
        <div className="mb-2 text-left sm:mb-0 sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2">
          {actions}
        </div>
      )}

      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-muted mb-1" style={devFont}>
          {eyebrow}
        </p>
      )}

      <div className="flex items-center justify-center gap-2.5">
        <div
          className={`shrink-0 inline-flex w-9 h-9 rounded-lg items-center justify-center shadow-sm ${gradient ? 'text-white' : 'icon-teal'}`}
          style={gradient ? { background: gradient } : undefined}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h1 className="text-2xl sm:text-[28px] font-extrabold leading-tight tracking-tight text-brand-text" style={devFont}>
          {title}
        </h1>
      </div>

      {subtitle && (
        <p className="text-brand-text-muted text-sm mt-1.5 max-w-2xl mx-auto leading-snug">
          {subtitle}
        </p>
      )}

      {children}
    </motion.div>
  );
}

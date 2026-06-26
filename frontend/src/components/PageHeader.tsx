import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  /** Icon shown in the rounded badge beside the title. */
  icon: LucideIcon;
  /** Heading text (can include <span className="gradient-text"> highlights). */
  title: ReactNode;
  /** Optional supporting line shown centered below the heading. */
  subtitle?: ReactNode;
  /** Optional small eyebrow label shown above the title row. */
  eyebrow?: ReactNode;
  /** Custom icon background gradient. Defaults to the teal brand badge. */
  gradient?: string;
  /** Render title/eyebrow in the Devanagari font. */
  devanagari?: boolean;
  /** Extra content rendered below the subtitle (stats strips, buttons…). */
  children?: ReactNode;
  className?: string;
}

/**
 * Compact, centered page header used across the app.
 * Icon + heading sit on a single line; the tagline (and any extra
 * content) is centered beneath it for a consistent, professional look.
 */
export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  eyebrow,
  gradient,
  devanagari,
  children,
  className = '',
}: PageHeaderProps) {
  const devFont = devanagari ? { fontFamily: "'Noto Sans Devanagari',sans-serif" } : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center mb-10 ${className}`}
    >
      {eyebrow && (
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-muted mb-2" style={devFont}>
          {eyebrow}
        </p>
      )}

      <div className="flex items-center justify-center gap-3">
        <div
          className={`shrink-0 inline-flex w-11 h-11 rounded-xl items-center justify-center shadow-md ${gradient ? 'text-white' : 'icon-teal'}`}
          style={gradient ? { background: gradient } : undefined}
        >
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-text" style={devFont}>
          {title}
        </h1>
      </div>

      {subtitle && (
        <p className="text-brand-text-muted text-sm mt-3 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}

      {children}
    </motion.div>
  );
}

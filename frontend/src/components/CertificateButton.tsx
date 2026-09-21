import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { certificateShortfalls, CERT_RULES } from '../lib/certificateRules';

interface Props {
  wpm: number;
  accuracy: number;
  seconds: number;
  className?: string;
  label?: string;
  disabledLabel?: string;
}

/** Certificate link that is disabled, with the reason, when the run does not qualify. */
export default function CertificateButton({ wpm, accuracy, seconds, className = '', label = 'Certificate', disabledLabel = 'Not qualified for certificate' }: Props) {
  const short = certificateShortfalls(wpm, accuracy, seconds);
  if (short.length === 0) {
    return (
      <Link to="/certificate" className={className}>
        <Award className="w-4 h-4" /> {label}
      </Link>
    );
  }
  const need = `Needs ${CERT_RULES.minWpm}+ WPM, ${CERT_RULES.minAccuracy}%+ accuracy and a ${CERT_RULES.minSeconds / 60}-minute test. This run: ${short.join(', ')}.`;
  return (
    <button type="button" disabled aria-disabled="true" title={need}
      className={`${className} opacity-50 cursor-not-allowed pointer-events-auto`}>
      <Award className="w-4 h-4" /> {disabledLabel}
    </button>
  );
}

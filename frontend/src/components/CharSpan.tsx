import { memo } from 'react';

interface CharSpanProps {
  char: string;
  isCorrect: boolean;
  isError: boolean;
  isCurrent: boolean;
}

/**
 * One character of the typing display. Memoized so a keystroke only
 * re-renders the handful of characters whose status actually changed
 * (the one just typed + the new current-char position), instead of
 * React re-rendering and reconciling all ~8000 spans of a long article
 * on every single key press.
 */
function CharSpanImpl({ char, isCorrect, isError, isCurrent }: CharSpanProps) {
  return (
    <span className="relative">
      {isCurrent && <span className="typing-caret" aria-hidden="true" />}
      <span
        id={isCurrent ? 'current-char' : undefined}
        className={`transition-colors duration-75 ${
          isCorrect ? 'typing-correct' :
          isError ? 'typing-error' :
          isCurrent ? 'typing-current' :
          'typing-upcoming'
        }`}
      >
        {char === ' ' ? ' ' : char}
      </span>
    </span>
  );
}

const CharSpan = memo(CharSpanImpl);
export default CharSpan;

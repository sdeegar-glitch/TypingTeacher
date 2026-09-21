import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PassageComparison from './PassageComparison';

describe('PassageComparison', () => {
  it('shows the exact typed text, with the wrong letters marked', () => {
    const { container } = render(
      <PassageComparison passage="the quick fox" typed="the quack fox" mistakes={[6]} skipped={[]} />,
    );
    const panels = container.querySelectorAll('.overflow-y-auto');
    expect(panels[1].textContent).toBe('the quack fox'); // what was typed, not the passage
    expect(panels[1].querySelector('.typing-error')!.textContent).toBe('a');
  });

  it('says so when nothing was typed', () => {
    const { container } = render(<PassageComparison passage="abc" typed="" mistakes={[]} skipped={[]} />);
    expect(container.textContent).toContain('Nothing was typed.');
  });
});

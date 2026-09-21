import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ClusterText, { buildRuns } from './ClusterText';

const set = (...n: number[]) => new Set(n);
const join = (runs: { text: string }[]) => runs.map(r => r.text).join('');

describe('buildRuns', () => {
  it('reproduces the passage exactly and never splits a cluster', () => {
    const text = 'क्षत्रिय स्पोर्ट श्रीमान्';
    const runs = buildRuns(text, 5, set(1), set());
    expect(join(runs)).toBe(text);
  });

  it('styles a whole conjunct when only one of its code units is wrong', () => {
    // index 1 is the virama inside क्ष
    const runs = buildRuns('क्षत्रिय', 8, set(1), set());
    expect(runs[0]).toMatchObject({ text: 'क्ष', status: 'error' });
    expect(runs[1]).toMatchObject({ text: 'त्रिय', status: 'correct' });
  });

  it('merges neighbouring clusters with the same status into one span', () => {
    const runs = buildRuns('क्षत्रिय', 8, set(), set());
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({ text: 'क्षत्रिय', status: 'correct' });
  });

  it('marks untyped text as upcoming and typed as correct', () => {
    const runs = buildRuns('abcdef', 3, set(), set());
    expect(runs).toEqual([
      { text: 'abc', status: 'correct', start: 0 },
      { text: 'def', status: 'upcoming', start: 3 },
    ]);
  });

  it('marks skipped letters', () => {
    const runs = buildRuns('abc def', 4, set(), set(1, 2));
    expect(runs.map(r => r.status)).toEqual(['correct', 'skipped', 'correct', 'upcoming']);
    expect(runs[1].text).toBe('bc');
    expect(join(runs)).toBe('abc def');
  });

  it('gives the caret cluster its own run', () => {
    const runs = buildRuns('क्षमा', 0, set(), set(), 0);
    expect(runs[0]).toMatchObject({ text: 'क्ष', status: 'current' });
    expect(join(runs)).toBe('क्षमा');
  });

  it('error beats skipped beats correct on a shared cluster', () => {
    expect(buildRuns('कि', 2, set(1), set(0))[0].status).toBe('error');
    expect(buildRuns('कि', 2, set(), set(1))[0].status).toBe('skipped');
  });

  it('handles empty text', () => {
    expect(buildRuns('', 0, set(), set())).toEqual([]);
  });
});

describe('<ClusterText>', () => {
  it('renders one span per run with the typing status class', () => {
    const { container } = render(<ClusterText text="क्षत्रिय" typedLength={8} mistakes={set(1)} skipped={set()} />);
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(2);
    expect(spans[0].className).toBe('typing-error');
    expect(spans[0].textContent).toBe('क्ष');
    expect(container.textContent).toBe('क्षत्रिय');
  });

  it('marks the caret cluster with id="current-char"', () => {
    const { container } = render(<ClusterText text="abc" typedLength={1} mistakes={set()} skipped={set()} currentIndex={1} />);
    expect(container.querySelector('#current-char')?.textContent).toBe('b');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act, screen, cleanup } from '@testing-library/react';
import { useTypingEngineV2, type TypingEngineV2, type TypingEngineV2Options } from './useTypingEngineV2';

let engine: TypingEngineV2;
function Harness(p: { text: string; duration: number; onFinish?: (s: any) => void; opts: TypingEngineV2Options }) {
  engine = useTypingEngineV2(p.text, p.duration, p.onFinish, p.opts);
  return <textarea {...engine.inputProps} />;
}
const setup = (over: Partial<TypingEngineV2Options> = {}, text = 'abc def', duration = 60, onFinish?: (s: any) => void) => {
  render(<Harness text={text} duration={duration} onFinish={onFinish} opts={{ enabled: true, ...over }} />);
  return screen.getByLabelText('Typing input') as HTMLTextAreaElement;
};
const typeValue = (ta: HTMLTextAreaElement, v: string) => act(() => { fireEvent.input(ta, { target: { value: v } }); });
const tick = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('useTypingEngineV2 (same shape as v1)', () => {
  it('exposes userInput, mistakes, nextChar and caret', () => {
    const ta = setup();
    typeValue(ta, 'a');
    typeValue(ta, 'ax');
    expect(engine.userInput).toBe('ax');
    expect([...engine.mistakes]).toEqual([1]);
    expect(engine.nextChar).toBe('c');
    expect(engine.caretIndex).toBe(2);
    expect(engine.stats.errors).toBe(1);
  });

  it('starts the clock on first input and counts down with history samples', async () => {
    const ta = setup({}, 'abc def', 10);
    expect(engine.stats.isActive).toBe(false);
    typeValue(ta, 'a');
    expect(engine.stats.isActive).toBe(true);
    await tick(3000);
    expect(engine.stats.timeLeft).toBe(7);
    expect(engine.history.map(h => h.t)).toEqual([1, 2, 3]);
  });

  it('finishes when time runs out and fires onFinish once', async () => {
    const onFinish = vi.fn();
    const ta = setup({}, 'abc def', 3, onFinish);
    typeValue(ta, 'a');
    await tick(3000);
    expect(engine.stats.isFinished).toBe(true);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0].elapsedSeconds).toBe(3);
  });

  it('finishes when the passage is completed', () => {
    const onFinish = vi.fn();
    const ta = setup({}, 'ab', 60, onFinish);
    typeValue(ta, 'a');
    typeValue(ta, 'ab');
    expect(engine.stats.isFinished).toBe(true);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(engine.stats.progress).toBe(100);
  });

  it('strict mode counts rejections as errors and bumps rejectedFlash', () => {
    const ta = setup({ strict: true });
    typeValue(ta, 'a');
    typeValue(ta, 'ax');
    expect(engine.userInput).toBe('a');
    expect(engine.stats.errors).toBe(1);
    expect(engine.rejectedFlash).toBe(1);
  });

  it('skip-word behaves like v1 in practice mode', () => {
    const ta = setup();
    typeValue(ta, 'a');
    typeValue(ta, 'a ');
    expect(engine.userInput).toBe('abc ');
    expect([...engine.skipped]).toEqual([1, 2]);
    expect(engine.stats.errors).toBe(2);
  });

  it('reset restores a fresh run', async () => {
    const ta = setup({}, 'abc def', 30);
    typeValue(ta, 'ab');
    await tick(2000);
    act(() => engine.reset());
    expect(engine.userInput).toBe('');
    expect(engine.stats.timeLeft).toBe(30);
    expect(engine.stats.isFinished).toBe(false);
    expect(engine.history).toEqual([]);
    expect(ta.value).toBe('');
  });

  it('provides heatmap key stats', () => {
    const ta = setup();
    typeValue(ta, 'a');
    typeValue(ta, 'ax');
    const a = engine.getKeyStats().find(k => k.key === 'a')!;
    const b = engine.getKeyStats().find(k => k.key === 'b')!;
    expect(a).toMatchObject({ hits: 1, errors: 0 });
    expect(b).toMatchObject({ hits: 1, errors: 1 });
  });

  it('is inert when disabled (v1 owns the page)', () => {
    const ta = setup({ enabled: false });
    const ev = new InputEvent('beforeinput', { inputType: 'insertText', cancelable: true, bubbles: true });
    ta.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('deducts error WORDS from net WPM: 3 wrong letters in one word cost 1, not 3', async () => {
    const text = 'a'.repeat(400); // longer than what is typed, so the run ends on time
    const ta = setup({}, text, 60);
    typeValue(ta, 'x'.repeat(3) + 'a'.repeat(297));
    await tick(60_000);
    expect(engine.stats.isFinished).toBe(true);
    expect(engine.stats.wpm).toBe(60);
    expect(engine.stats.errors).toBe(3); // accuracy still counts characters
    expect(engine.stats.netWpm).toBe(59); // all 3 wrong letters sit in a single word
  });
});

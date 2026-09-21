import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import ExamTypingInterface, { type ExamResult } from './ExamTypingInterface';

afterEach(cleanup);

const input = () => screen.getByLabelText('Typing input') as HTMLTextAreaElement;
const typeValue = (v: string) => act(() => { fireEvent.input(input(), { target: { value: v } }); });

function setup(passage: string, profile: 'ssc' | 'cpct' | 'kdph' = 'ssc') {
  const onFinish = vi.fn<(r: ExamResult) => void>();
  render(<ExamTypingInterface passage={passage} durationSec={60} isHindi={false} examTitle="T" profile={profile} onFinish={onFinish} onExit={() => {}} />);
  return onFinish;
}

describe('ExamTypingInterface', () => {
  it('finishes with a word-level score when the passage is completed', () => {
    vi.useFakeTimers();
    const onFinish = setup('the cat sat');
    typeValue('the cat sat');
    act(() => { vi.advanceTimersByTime(10); });
    vi.useRealTimers();
    expect(onFinish).toHaveBeenCalledTimes(1);
    const r = onFinish.mock.calls[0][0];
    expect(r.score.correctWords).toBe(3);
    expect(r.score.fullMistakes).toBe(0);
    expect(r.accuracy).toBe(100);
    expect(r.profile).toBe('ssc');
  });

  it('counts a wrong word as one full mistake (SSC) via the Result button', () => {
    const onFinish = setup('the cat sat down');
    typeValue('the cot sat down');
    fireEvent.click(screen.getByText('Result'));
    const r = onFinish.mock.calls[0][0];
    expect(r.score.fullMistakes).toBe(1);
    expect(r.errors).toBe(1);
    expect(r.wrongChars).toBe(1);
  });

  it('cpct does not deduct for a wrong word', () => {
    const onFinish = setup('the cat sat down', 'cpct');
    typeValue('the cot sat down');
    fireEvent.click(screen.getByText('Result'));
    const r = onFinish.mock.calls[0][0];
    expect(r.score.deductions).toBe(0);
    expect(r.score.correctWords).toBe(3);
  });

  it('refuses paste', () => {
    setup('the cat sat');
    const paste = new InputEvent('beforeinput', { inputType: 'insertFromPaste', cancelable: true, bubbles: true });
    act(() => { input().dispatchEvent(paste); });
    expect(paste.defaultPrevented).toBe(true);
    expect(input().value).toBe('');
  });

  it('counts backspaces and honours the disabled mode', () => {
    setup('hello world');
    typeValue('hel');
    fireEvent.keyDown(input(), { key: 'Backspace' });
    expect(screen.getByText('Backspace').nextSibling).toHaveTextContent('1');
    fireEvent.click(screen.getByLabelText('Disable'));
    fireEvent.keyDown(input(), { key: 'Backspace' });
    expect(screen.getByText('Backspace').nextSibling).toHaveTextContent('1');
  });
});

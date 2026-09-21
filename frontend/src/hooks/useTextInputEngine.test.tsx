import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, act, screen, cleanup } from '@testing-library/react';
import { useTextInputEngine, type TextInputEngine, type UseTextInputEngineOptions } from './useTextInputEngine';

const flush = () => act(async () => { await Promise.resolve(); });

let engine: TextInputEngine;
function Harness(props: UseTextInputEngineOptions) {
  engine = useTextInputEngine(props);
  return <textarea {...engine.inputProps} />;
}

const LENIENT = { skipWordOnSpace: true, strict: false };
const STRICT = { skipWordOnSpace: false, strict: true };

function setup(props: Partial<UseTextInputEngineOptions> = {}) {
  const utils = render(<Harness text="कमल" options={LENIENT} {...props} />);
  const ta = screen.getByLabelText('Typing input') as HTMLTextAreaElement;
  return { ...utils, ta, rerenderWith: (p: Partial<UseTextInputEngineOptions>) => utils.rerender(<Harness text="कमल" options={LENIENT} {...props} {...p} />) };
}
const typeValue = (ta: HTMLTextAreaElement, value: string) => act(() => { fireEvent.input(ta, { target: { value } }); });
const beforeInput = (ta: HTMLTextAreaElement, inputType: string) => {
  const ev = new InputEvent('beforeinput', { inputType, cancelable: true, bubbles: true });
  ta.dispatchEvent(ev);
  return ev;
};

afterEach(cleanup);

describe('typing through the textarea', () => {
  it('accepts correct input and keeps the textarea value in sync', () => {
    const { ta } = setup();
    typeValue(ta, 'क');
    typeValue(ta, 'कम');
    expect(engine.state.typed).toBe('कम');
    expect(ta.value).toBe('कम');
    expect(engine.state.keystrokes).toBe(2);
  });

  it('calls onStart once, on the first accepted input', () => {
    const onStart = vi.fn();
    const { ta } = setup({ onStart });
    typeValue(ta, 'क');
    typeValue(ta, 'कम');
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('reports whether each new character was correct (for key sounds)', () => {
    const onKey = vi.fn();
    const { ta } = setup({ onKey });
    typeValue(ta, 'क');
    typeValue(ta, 'कx');
    expect(onKey).toHaveBeenNthCalledWith(1, { correct: true });
    expect(onKey).toHaveBeenNthCalledWith(2, { correct: false });
  });

  it('strict mode rejects a wrong character and restores the textarea', () => {
    const onRejected = vi.fn();
    const { ta } = setup({ options: STRICT, onRejected });
    typeValue(ta, 'क');
    typeValue(ta, 'कx');
    expect(engine.state.typed).toBe('क');
    expect(ta.value).toBe('क');
    expect(onRejected).toHaveBeenCalledTimes(1);
  });

  it('accepts a multi-code-point value from an OS-layout ligature key', () => {
    const { ta } = setup({ text: 'क्षमा' });
    typeValue(ta, 'क्ष');
    expect(engine.state.typed).toBe('क्ष');
    expect(engine.state.keystrokes).toBe(3);
    expect(engine.inputMethod).toBe('os-layout');
  });

  it('resets when the passage changes', () => {
    const { ta, rerenderWith } = setup();
    typeValue(ta, 'कम');
    rerenderWith({ text: 'नया' });
    expect(engine.state.typed).toBe('');
    expect(ta.value).toBe('');
    expect(engine.state.text).toBe('नया');
  });
});

describe('policy via beforeinput', () => {
  it('cancels paste and reports it', () => {
    const onPaste = vi.fn();
    const { ta } = setup({ onPaste });
    const ev = beforeInput(ta, 'insertFromPaste');
    expect(ev.defaultPrevented).toBe(true);
    expect(onPaste).toHaveBeenCalledTimes(1);
  });

  it.each(['insertFromDrop', 'historyUndo', 'historyRedo', 'deleteByCut', 'insertReplacementText', 'insertLineBreak'])(
    'cancels %s', (type) => {
      const { ta } = setup();
      expect(beforeInput(ta, type).defaultPrevented).toBe(true);
    },
  );

  it('does not cancel ordinary text insertion', () => {
    const { ta } = setup();
    expect(beforeInput(ta, 'insertText').defaultPrevented).toBe(false);
  });

  it('backspace mode "off" blocks deletion; "full" allows it', () => {
    const off = setup({ backspaceMode: 'off' });
    typeValue(off.ta, 'कम');
    expect(beforeInput(off.ta, 'deleteContentBackward').defaultPrevented).toBe(true);
    cleanup();

    const full = setup({ backspaceMode: 'full' });
    typeValue(full.ta, 'कम');
    expect(beforeInput(full.ta, 'deleteContentBackward').defaultPrevented).toBe(false);
  });

  it('backspace mode "word" blocks deleting across a word boundary', () => {
    const { ta } = setup({ text: 'ab cd', backspaceMode: 'word', options: { skipWordOnSpace: false, strict: false } });
    typeValue(ta, 'ab ');
    expect(beforeInput(ta, 'deleteContentBackward').defaultPrevented).toBe(true);
    typeValue(ta, 'ab c');
    expect(beforeInput(ta, 'deleteContentBackward').defaultPrevented).toBe(false);
  });

  it('cancels everything while disabled', () => {
    const { ta } = setup({ disabled: true });
    expect(beforeInput(ta, 'insertText').defaultPrevented).toBe(true);
  });
});

describe('IME composition', () => {
  it('does not score while composing and commits on compositionend (input first)', async () => {
    const { ta } = setup({ text: 'नमस्ते दुनिया' });
    act(() => { fireEvent.compositionStart(ta); });
    typeValue(ta, 'न');
    typeValue(ta, 'नम');
    expect(engine.state.typed).toBe('');          // nothing scored yet
    expect(engine.composing).toBe('नम');           // shown as in-progress
    expect(engine.inputMethod).toBe('ime');

    typeValue(ta, 'नमस्ते');
    act(() => { fireEvent.compositionEnd(ta); });
    await flush();
    expect(engine.state.typed).toBe('नमस्ते');
    expect(engine.composing).toBe('');
    expect(engine.state.keystrokes).toBe(Array.from('नमस्ते').length);
  });

  it('handles the other browser ordering (compositionend before the final input) without double counting', async () => {
    const { ta } = setup({ text: 'नमस्ते दुनिया' });
    act(() => { fireEvent.compositionStart(ta); });
    act(() => { ta.value = 'नमस्ते'; });
    act(() => { fireEvent.compositionEnd(ta); });
    typeValue(ta, 'नमस्ते'); // late, non-composing input carrying the same value
    await flush();
    expect(engine.state.typed).toBe('नमस्ते');
    expect(engine.state.keystrokes).toBe(Array.from('नमस्ते').length);
  });

  it('does not run the built-in INSCRIPT mapping for IME keys', () => {
    const { ta } = setup({ mangal: true });
    const ev = new KeyboardEvent('keydown', { key: 'Process', code: 'KeyK', bubbles: true, cancelable: true });
    ta.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });
});

describe('built-in INSCRIPT (English layout)', () => {
  const key = (ta: HTMLTextAreaElement, init: KeyboardEventInit) => {
    const ev = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
    act(() => { ta.dispatchEvent(ev); });
    return ev;
  };

  it('maps a Latin key to the expected Devanagari character', () => {
    const { ta } = setup({ mangal: true });
    const ev = key(ta, { key: 'k', code: 'KeyK' });
    expect(ev.defaultPrevented).toBe(true);
    expect(engine.state.typed).toBe('क');
    expect(ta.value).toBe('क');
    expect(engine.inputMethod).toBe('built-in-inscript');
  });

  it('expands a ligature key (Shift+7 → क्ष)', () => {
    const { ta } = setup({ text: 'क्षमा', mangal: true });
    key(ta, { key: '&', code: 'Digit7', shiftKey: true });
    expect(engine.state.typed).toBe('क्ष');
  });

  it('can be turned off', () => {
    const { ta } = setup({ mangal: true, builtInInscript: false });
    const ev = key(ta, { key: 'k', code: 'KeyK' });
    expect(ev.defaultPrevented).toBe(false);
    expect(engine.state.typed).toBe('');
  });

  it('leaves ASCII passages alone', () => {
    const { ta } = setup({ text: 'kamal', mangal: false });
    const ev = key(ta, { key: 'k', code: 'KeyK' });
    expect(ev.defaultPrevented).toBe(false);
  });

  it('ignores Ctrl/Meta shortcuts but treats AltGr (Ctrl+Alt) as text', () => {
    const { ta } = setup({ mangal: true });
    expect(key(ta, { key: 'k', code: 'KeyK', ctrlKey: true }).defaultPrevented).toBe(false);
    expect(key(ta, { key: 'k', code: 'KeyK', metaKey: true }).defaultPrevented).toBe(false);
    expect(key(ta, { key: 'k', code: 'KeyK', ctrlKey: true, altKey: true }).defaultPrevented).toBe(true);
  });
});

describe('control keys', () => {
  it('Tab restarts and is prevented; Enter is prevented and ignored', () => {
    const onRestart = vi.fn();
    const { ta } = setup({ onRestart });
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    ta.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(onRestart).toHaveBeenCalledTimes(1);

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    ta.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    expect(engine.state.typed).toBe('');
  });
});

describe('accessibility attributes', () => {
  it('is labelled, Hindi, and has autocorrect/spellcheck off', () => {
    const { ta } = setup();
    expect(ta.getAttribute('aria-label')).toBe('Typing input');
    expect(ta.getAttribute('lang')).toBe('hi');
    expect(ta.getAttribute('autocorrect')).toBe('off');
    expect(ta.getAttribute('autocapitalize')).toBe('off');
    expect(ta.getAttribute('spellcheck')).toBe('false');
  });
});

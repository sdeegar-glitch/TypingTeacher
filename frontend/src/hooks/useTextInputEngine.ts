/**
 * DOM layer for typing engine v2: one hidden <textarea> is the ONLY input.
 *
 * Why (see the rebuild plan): IndiaTyping reads the text the OS puts into a
 * textarea and only uses keydown for control keys; Monkeytype uses the `input`
 * event by default and keydown only for Tab/Esc/Backspace/Enter plus an
 * optional layout-emulation path. Key events are unreliable for text -- IMEs
 * and Android keyboards report key "Process"/"Unidentified" (keyCode 229) --
 * so we read the *result* (`input` after composition) and let the pure reducer
 * (lib/typingReducer.ts) decide what it means.
 *
 *  - Uncontrolled textarea: a controlled one snaps back and breaks composition.
 *  - During IME composition nothing is scored; the in-progress text is exposed
 *    as `composing` and committed on `compositionend` (finalised in a microtask
 *    because `input` and `compositionend` fire in different orders per browser;
 *    applying the same value twice is a no-op).
 *  - beforeinput enforces policy: paste/drop/undo/cut/replacement/line breaks are
 *    cancelled; deletions obey the backspace mode.
 *  - keydown handles Tab (restart), Enter (ignored) and the built-in INSCRIPT
 *    path: with an English layout active and Devanagari expected, the physical
 *    key is mapped through lib/hindiInput and inserted for the user.
 */
import { useCallback, useEffect, useReducer, useRef, useState, type RefCallback, type TextareaHTMLAttributes } from 'react';
import {
  applyValue, canDelete, createState,
  type BackspaceMode, type TypingOptions, type TypingState,
} from '../lib/typingReducer';
import { charsFromKeyEvent, isImeKey } from '../lib/hindiInput';

export type InputMethod = 'unknown' | 'os-layout' | 'built-in-inscript' | 'ime' | 'touch';

export interface UseTextInputEngineOptions {
  text: string;
  options: TypingOptions;
  backspaceMode?: BackspaceMode;
  /** Passage is Devanagari (Unicode/INSCRIPT) -- enables the built-in INSCRIPT path. */
  mangal?: boolean;
  /** Map INSCRIPT keys for users on an English layout. Default true. */
  builtInInscript?: boolean;
  disabled?: boolean;
  /** First accepted input (start the timer). */
  onStart?: () => void;
  onPaste?: () => void;
  /** Tab pressed. */
  onRestart?: () => void;
  /** Strict mode refused a keystroke. */
  onRejected?: () => void;
  /** After each accepted edit that added text; `correct` = the newly typed character matched. */
  onKey?: (info: { correct: boolean }) => void;
}

export interface TextInputEngine {
  state: TypingState;
  /** In-progress IME text (not yet committed). Empty when not composing. */
  composing: string;
  inputMethod: InputMethod;
  inputProps: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref: RefCallback<HTMLTextAreaElement> };
  focus: () => void;
  reset: (text?: string) => void;
  /** Programmatic insertion (built-in INSCRIPT, tests). */
  insertText: (s: string) => void;
  /** Replace the whole typed value (deletions, adapters). */
  setValue: (value: string) => void;
}

const HIDDEN_STYLE = {
  position: 'fixed', top: 0, left: 0, width: 1, height: 1, padding: 0, border: 0,
  opacity: 0, caretColor: 'transparent', pointerEvents: 'none', resize: 'none', overflow: 'hidden',
} as const;

const DEVANAGARI = /[ऀ-ॿ]/;
const isCoarsePointer = () => {
  try { return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches; } catch { return false; }
};

export function useTextInputEngine(opts: UseTextInputEngineOptions): TextInputEngine {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  // Callback ref + state so listeners attach whenever the textarea (re)appears,
  // e.g. when the beta toggle renders it after the first paint.
  const [el, setEl] = useState<HTMLTextAreaElement | null>(null);
  const attachRef = useCallback((node: HTMLTextAreaElement | null) => { taRef.current = node; setEl(node); }, []);
  const stateRef = useRef<TypingState>(createState(opts.text));
  const startedRef = useRef(false);
  const composingRef = useRef(false);
  const methodRef = useRef<InputMethod>('unknown');
  const [, force] = useReducer((x: number) => x + 1, 0);
  const [composing, setComposing] = useState('');
  const [inputMethod, setInputMethod] = useState<InputMethod>('unknown');

  // Latest props for the native listeners (bound once; avoids re-attaching mid-composition).
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const setMethod = useCallback((m: InputMethod) => {
    if (methodRef.current !== m) { methodRef.current = m; setInputMethod(m); }
  }, []);

  const apply = useCallback((value: string) => {
    const o = optsRef.current;
    const before = stateRef.current;
    const r = applyValue(before, value, o.options, performance.now());
    if (r.state !== before) {
      if (!startedRef.current) { startedRef.current = true; o.onStart?.(); }
      stateRef.current = r.state;
      if (r.state.typed.length > before.typed.length) {
        const i = before.typed.length;
        o.onKey?.({ correct: r.state.typed[i] === r.state.text[i] });
      }
      force();
    }
    const ta = taRef.current;
    if (ta && (r.needsSync || ta.value !== r.state.typed)) ta.value = r.state.typed;
    if (r.rejected) o.onRejected?.();
  }, []);

  const insertText = useCallback((s: string) => {
    apply(stateRef.current.typed + s);
  }, [apply]);

  const reset = useCallback((text?: string) => {
    stateRef.current = createState(text ?? optsRef.current.text);
    startedRef.current = false;
    composingRef.current = false;
    if (taRef.current) taRef.current.value = '';
    setComposing('');
    force();
  }, []);

  const focus = useCallback(() => { taRef.current?.focus({ preventScroll: true }); }, []);

  // New passage => fresh state.
  useEffect(() => { reset(opts.text); }, [opts.text, reset]);

  // Keep the textarea focused while typing is possible.
  useEffect(() => {
    if (opts.disabled) return;
    focus();
    const refocus = () => { if (!optsRef.current.disabled) focus(); };
    document.addEventListener('visibilitychange', refocus);
    window.addEventListener('focus', refocus);
    return () => {
      document.removeEventListener('visibilitychange', refocus);
      window.removeEventListener('focus', refocus);
    };
  }, [opts.disabled, focus, el]);

  // Native listeners on the textarea.
  useEffect(() => {
    const ta = el;
    if (!ta) return;

    const onBeforeInput = (e: InputEvent) => {
      const o = optsRef.current;
      if (o.disabled) { e.preventDefault(); return; }
      if (e.isComposing || composingRef.current) return; // composition text is not cancelable
      const t = e.inputType || '';
      if (t === 'insertFromPaste' || t === 'insertFromDrop' || t === 'insertFromYank' || t === 'insertFromPasteAsQuotation') {
        e.preventDefault();
        o.onPaste?.();
        return;
      }
      if (['historyUndo', 'historyRedo', 'deleteByCut', 'insertReplacementText', 'insertLineBreak', 'insertParagraph'].includes(t)) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (t.startsWith('delete') && !canDelete(stateRef.current, o.backspaceMode ?? 'full') && e.cancelable) {
        e.preventDefault();
      }
    };

    const onInput = (e: Event) => {
      const ie = e as InputEvent;
      if (ie.isComposing || composingRef.current) {
        const typed = stateRef.current.typed;
        setComposing(ta.value.startsWith(typed) ? ta.value.slice(typed.length) : '');
        return;
      }
      if (methodRef.current !== 'built-in-inscript' && methodRef.current !== 'ime') {
        const added = ta.value.slice(stateRef.current.typed.length);
        if (DEVANAGARI.test(added)) setMethod(isCoarsePointer() ? 'touch' : 'os-layout');
        else if (isCoarsePointer()) setMethod('touch');
      }
      apply(ta.value);
    };

    const onCompositionStart = () => {
      composingRef.current = true;
      setMethod('ime');
    };
    const onCompositionEnd = () => {
      composingRef.current = false;
      setComposing('');
      // `input` may fire before or after compositionend depending on the browser:
      // finalise once here; applying an unchanged value is a no-op.
      queueMicrotask(() => apply(ta.value));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const o = optsRef.current;
      if (o.disabled) return;
      if (composingRef.current || isImeKey(e)) return; // the IME owns this key
      if (e.key === 'Tab') { e.preventDefault(); o.onRestart?.(); return; }
      if (e.key === 'Enter') { e.preventDefault(); return; }
      // shortcuts (AltGr reports Ctrl+Alt on Windows and is a real text key)
      if ((e.ctrlKey || e.metaKey) && !(e.ctrlKey && e.altKey)) return;

      if (o.mangal && o.builtInInscript !== false && e.key.length === 1 && !/[^\x00-\x7f]/.test(e.key)) {
        const st = stateRef.current;
        const expected = st.text[st.typed.length];
        if (expected && DEVANAGARI.test(expected)) {
          const chars = charsFromKeyEvent(e, expected, true);
          if (chars.length !== 1 || chars[0] !== e.key) {
            e.preventDefault();
            setMethod('built-in-inscript');
            apply(st.typed + chars.join(''));
          }
        }
      }
    };

    ta.addEventListener('beforeinput', onBeforeInput as EventListener);
    ta.addEventListener('input', onInput);
    ta.addEventListener('compositionstart', onCompositionStart);
    ta.addEventListener('compositionend', onCompositionEnd);
    ta.addEventListener('keydown', onKeyDown);
    return () => {
      ta.removeEventListener('beforeinput', onBeforeInput as EventListener);
      ta.removeEventListener('input', onInput);
      ta.removeEventListener('compositionstart', onCompositionStart);
      ta.removeEventListener('compositionend', onCompositionEnd);
      ta.removeEventListener('keydown', onKeyDown);
    };
  }, [el, apply, setMethod]);

  const setValue = useCallback((value: string) => { apply(value); }, [apply]);

  return {
    state: stateRef.current,
    composing,
    inputMethod,
    inputProps: {
      ref: attachRef,
      'aria-label': 'Typing input',
      lang: 'hi',
      rows: 1,
      autoCapitalize: 'off',
      autoCorrect: 'off',
      autoComplete: 'off',
      spellCheck: false,
      inputMode: 'text',
      enterKeyHint: 'done',
      disabled: opts.disabled,
      style: HIDDEN_STYLE,
    },
    focus,
    reset,
    insertText,
    setValue,
  };
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const saveSession = vi.fn();
vi.mock('../lib/api', async (orig) => ({
  ...(await orig<typeof import('../lib/api')>()),
  saveSession: (...a: unknown[]) => saveSession(...a),
  fetchMistakeHandlingMode: async () => 'lenient',
  fetchTestList: async () => [],
  fetchTestBySlug: async () => null,
}));

import TypingTestPage from './TypingTestPage';

function renderPage(search: string) {
  return render(
    <MemoryRouter initialEntries={[`/typing-test${search}`]}>
      <Routes><Route path="/typing-test" element={<TypingTestPage />} /></Routes>
    </MemoryRouter>,
  );
}
const input = () => screen.queryByLabelText('Typing input') as HTMLTextAreaElement | null;
const typeValue = (ta: HTMLTextAreaElement, v: string) => act(() => { fireEvent.input(ta, { target: { value: v } }); });

beforeEach(() => { localStorage.clear(); saveSession.mockClear(); });
afterEach(cleanup);

describe('TypingTestPage engine selection', () => {
  it('uses the legacy engine by default (no hidden textarea)', () => {
    renderPage('');
    expect(input()).toBeNull();
    expect(screen.getByRole('switch', { name: /new typing engine/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('?engine=v2 enables the new engine and remembers the choice', () => {
    renderPage('?engine=v2');
    expect(input()).not.toBeNull();
    expect(localStorage.getItem('ftl_engine')).toBe('v2');
    expect(screen.getByRole('switch', { name: /new typing engine/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('?engine=v1 turns it back off', () => {
    localStorage.setItem('ftl_engine', 'v2');
    renderPage('?engine=v1');
    expect(input()).toBeNull();
    expect(localStorage.getItem('ftl_engine')).toBe('v1');
  });

  it('the switch toggles between engines', () => {
    renderPage('');
    const sw = screen.getByRole('switch', { name: /new typing engine/i });
    act(() => { fireEvent.click(sw); });
    expect(input()).not.toBeNull();
    expect(localStorage.getItem('ftl_engine')).toBe('v2');
    act(() => { fireEvent.click(sw); });
    expect(input()).toBeNull();
  });
});

describe('TypingTestPage with the new engine', () => {
  it('accepts typing through the textarea and cancels paste', () => {
    renderPage('?engine=v2');
    const ta = input()!;
    const passage = document.body.textContent ?? '';
    expect(passage.length).toBeGreaterThan(0);

    typeValue(ta, 'T');
    expect(ta.value).toBe('T');

    const paste = new InputEvent('beforeinput', { inputType: 'insertFromPaste', cancelable: true, bubbles: true });
    act(() => { ta.dispatchEvent(paste); });
    expect(paste.defaultPrevented).toBe(true);
    expect(screen.getByText(/paste detected/i)).toBeInTheDocument();
    expect(ta.value).toBe(''); // the paste kill resets the run
  });
});

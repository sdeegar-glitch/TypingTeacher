import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../lib/api', async (orig) => ({ ...(await orig<typeof import('../lib/api')>()), saveSession: vi.fn() }));
import HindiTypingPage from './HindiTypingPage';

afterEach(cleanup);
const ta = () => screen.getByLabelText('Typing input') as HTMLTextAreaElement;
const typeValue = (v: string) => act(() => { fireEvent.input(ta(), { target: { value: v } }); });

describe('HindiTypingPage on the shared engine', () => {
  it('starts on the first keystroke and shows live stats', () => {
    render(<MemoryRouter><HindiTypingPage /></MemoryRouter>);
    expect(screen.queryByText('Accuracy')).not.toBeInTheDocument();
    typeValue('भ');
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('finishes when the passage is completed and reports net (not gross) speed', () => {
    const { container } = render(<MemoryRouter><HindiTypingPage /></MemoryRouter>);
    const passage = container.querySelector('p.select-none')!.textContent ?? '';
    expect(passage.length).toBeGreaterThan(30);
    typeValue(passage);
    expect(screen.getByText('Net WPM')).toBeInTheDocument();
  });
});

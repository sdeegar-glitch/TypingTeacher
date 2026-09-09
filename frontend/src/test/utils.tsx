import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Renders inside a router, because most components here use <Link>. Everything
 * else is deliberately left alone — tests should exercise the real component
 * tree, not a stubbed one.
 */
export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...options }: RenderOptions & { route?: string } = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

/** Pretend a user is signed in — components read this token to decide what to show. */
export function signIn(token = 'test-token') {
  localStorage.setItem('accessToken', token);
}

export * from '@testing-library/react';

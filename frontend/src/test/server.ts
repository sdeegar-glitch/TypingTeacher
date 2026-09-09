import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const API = 'https://typingteacher-2lnd.onrender.com';

/**
 * Default happy-path API. Individual tests override these with
 * `server.use(...)` to exercise error and empty states — the point of MSW is
 * that components keep using real `fetch`, so nothing in the app is aware it
 * is under test.
 */
export const handlers = [
  http.get(`${API}/api/me/referral`, () =>
    HttpResponse.json({
      code: 'AB3D9K',
      total: 3,
      qualified: 2,
      invites: [
        { name: 'Priya', joined_at: '2026-09-01T10:00:00Z', qualified: true },
        { name: 'Rahul', joined_at: '2026-09-02T10:00:00Z', qualified: true },
        { name: 'am••••', joined_at: '2026-09-03T10:00:00Z', qualified: false },
      ],
    })
  ),

  http.get(`${API}/api/me`, () =>
    HttpResponse.json({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      phone: null,
      avatar_url: null,
      role: 'user',
      created_at: '2026-01-01T00:00:00Z',
    })
  ),

  http.get(`${API}/api/tests`, () => HttpResponse.json([])),
  http.post(`${API}/api/visitors`, () => HttpResponse.json({ ok: true })),
];

export const server = setupServer(...handlers);
export { http, HttpResponse, API };

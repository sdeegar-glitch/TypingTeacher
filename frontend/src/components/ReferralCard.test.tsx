import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, renderWithRouter, signIn } from '../test/utils';
import { server, http, HttpResponse, API } from '../test/server';
import ReferralCard from './ReferralCard';

beforeEach(() => signIn());

/** Wait for the card to finish its initial fetch. */
const settled = () => screen.findByRole('button', { name: /copy your invite link/i });

describe('ReferralCard — loading', () => {
  it('tells the user something is happening before the link arrives', () => {
    renderWithRouter(<ReferralCard />);
    expect(screen.getByText(/loading your invite link/i)).toBeInTheDocument();
  });
});

describe('ReferralCard — loaded', () => {
  it('shows the invite link the user has to share', async () => {
    renderWithRouter(<ReferralCard />);
    await settled();
    expect(screen.getByText('https://fasttypinglab.com/?ref=AB3D9K')).toBeInTheDocument();
  });

  it('reports how many friends actually started typing', async () => {
    renderWithRouter(<ReferralCard />);
    expect(await screen.findByText(/2 friends joined and started typing/i)).toBeInTheDocument();
  });

  it('shows the tier earned at that count', async () => {
    renderWithRouter(<ReferralCard />);
    expect(await screen.findByText(/Supporter/)).toBeInTheDocument();
  });

  it('shows how many more are needed for the next tier', async () => {
    renderWithRouter(<ReferralCard />);
    // 2 qualified, Advocate is at 3.
    expect(await screen.findByText(/1 more to unlock/i)).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  // Naming the pending ones is the point — the referrer can go nudge them.
  it('explains that signed-up-but-not-typed invites are still pending', async () => {
    renderWithRouter(<ReferralCard />);
    expect(
      await screen.findByText(/1 signed up but haven't taken a test yet/i)
    ).toBeInTheDocument();
  });

  it('lists invitees by name with their status', async () => {
    renderWithRouter(<ReferralCard />);
    expect(await screen.findByText('Priya')).toBeInTheDocument();
    expect(screen.getByText('Rahul')).toBeInTheDocument();
    expect(screen.getAllByText('Counted')).toHaveLength(2);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('offers WhatsApp and Telegram share links carrying the code', async () => {
    renderWithRouter(<ReferralCard />);
    await settled();
    const whatsapp = screen.getByRole('link', { name: /share on whatsapp/i });
    const telegram = screen.getByRole('link', { name: /share on telegram/i });
    expect(whatsapp).toHaveAttribute('href', expect.stringContaining('AB3D9K'));
    expect(telegram).toHaveAttribute('href', expect.stringContaining('AB3D9K'));
  });

  it('opens share links in a new tab without leaking the referrer', async () => {
    renderWithRouter(<ReferralCard />);
    await settled();
    const whatsapp = screen.getByRole('link', { name: /share on whatsapp/i });
    expect(whatsapp).toHaveAttribute('target', '_blank');
    expect(whatsapp).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});

describe('ReferralCard — copying', () => {
  it('copies the link and confirms it to the user', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ReferralCard />);
    const button = await settled();

    await user.click(button);

    await waitFor(async () => {
      expect(await navigator.clipboard.readText()).toBe('https://fasttypinglab.com/?ref=AB3D9K');
    });
    expect(await screen.findByText('Copied')).toBeInTheDocument();
  });
});

describe('ReferralCard — states the API can return', () => {
  // Before migration 002 is run the endpoint 503s. The card must disappear
  // rather than render a box with a broken link in it.
  it('renders nothing when the endpoint is unavailable', async () => {
    server.use(http.get(`${API}/api/me/referral`, () => new HttpResponse(null, { status: 503 })));
    const { container } = renderWithRouter(<ReferralCard />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('renders nothing when the network fails outright', async () => {
    server.use(http.get(`${API}/api/me/referral`, () => HttpResponse.error()));
    const { container } = renderWithRouter(<ReferralCard />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('prompts a brand-new user to share rather than showing an empty list', async () => {
    server.use(
      http.get(`${API}/api/me/referral`, () =>
        HttpResponse.json({ code: 'NEW123', total: 0, qualified: 0, invites: [] })
      )
    );
    renderWithRouter(<ReferralCard />);
    expect(await screen.findByText(/share your link/i)).toBeInTheDocument();
    expect(screen.queryByText(/your invites/i)).not.toBeInTheDocument();
  });

  it('uses the singular for a single referral', async () => {
    server.use(
      http.get(`${API}/api/me/referral`, () =>
        HttpResponse.json({
          code: 'ONE123',
          total: 1,
          qualified: 1,
          invites: [{ name: 'Asha', joined_at: '2026-09-01T10:00:00Z', qualified: true }],
        })
      )
    );
    renderWithRouter(<ReferralCard />);
    expect(await screen.findByText(/1 friend joined/i)).toBeInTheDocument();
  });

  it('hides the progress bar once every tier is earned', async () => {
    server.use(
      http.get(`${API}/api/me/referral`, () =>
        HttpResponse.json({ code: 'TOP123', total: 12, qualified: 12, invites: [] })
      )
    );
    renderWithRouter(<ReferralCard />);
    await settled();
    expect(screen.queryByText(/more to unlock/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Legend/)).toBeInTheDocument();
  });
});

describe('ReferralCard — tier list', () => {
  it('is hidden by default so the dashboard card stays compact', async () => {
    renderWithRouter(<ReferralCard />);
    await settled();
    expect(screen.queryByText(/^Tiers$/i)).not.toBeInTheDocument();
  });

  it('shows every tier when asked, for the dedicated page', async () => {
    renderWithRouter(<ReferralCard showTiers />);
    await settled();
    expect(screen.getByText(/^Tiers$/i)).toBeInTheDocument();
    for (const name of ['Supporter', 'Advocate', 'Ambassador', 'Legend']) {
      // getAllBy, not getBy: an earned tier also appears in the header badge.
      expect(screen.getAllByText(new RegExp(name)).length).toBeGreaterThan(0);
    }
  });
});

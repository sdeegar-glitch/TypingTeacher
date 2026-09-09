import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, renderWithRouter, signIn } from '../test/utils';
import ReferPage from './ReferPage';
import { captureReferralFromUrl } from '../lib/referral';

beforeEach(() => localStorage.clear());

describe('ReferPage — signed out', () => {
  it('asks the visitor to create an account to get a link', () => {
    renderWithRouter(<ReferPage />);
    expect(screen.getByRole('heading', { name: /get your invite link/i })).toBeInTheDocument();
  });

  it('offers both signup and login routes', () => {
    renderWithRouter(<ReferPage />);
    expect(screen.getByRole('link', { name: /create free account/i })).toHaveAttribute('href', '/signup');
    expect(screen.getByRole('link', { name: /i already have one/i })).toHaveAttribute('href', '/login');
  });

  it('lists every tier, since there is no card to show them in', () => {
    renderWithRouter(<ReferPage />);
    for (const name of ['Supporter', 'Advocate', 'Ambassador', 'Legend']) {
      // The name appears both as the tier heading and inside its perk sentence.
      expect(screen.getAllByText(new RegExp(name)).length).toBeGreaterThan(0);
    }
  });

  it('explains the three steps', () => {
    renderWithRouter(<ReferPage />);
    expect(screen.getByText(/share your link/i)).toBeInTheDocument();
    expect(screen.getByText(/they take a test/i)).toBeInTheDocument();
    expect(screen.getByText(/it counts/i)).toBeInTheDocument();
  });

  // The programme's credibility rests on saying this out loud.
  it('states plainly that there is no cash payout', () => {
    renderWithRouter(<ReferPage />);
    expect(screen.getByText(/no cash payout/i)).toBeInTheDocument();
  });

  it('warns that self-referral does not work', () => {
    renderWithRouter(<ReferPage />);
    expect(screen.getByText(/inviting yourself.*doesn't work/i)).toBeInTheDocument();
  });

  it('promises not to expose friends\' email addresses', () => {
    renderWithRouter(<ReferPage />);
    expect(screen.getByText(/never show your friends' email/i)).toBeInTheDocument();
  });

  it('tells a visitor who arrived on an invite link that their friend gets credit', () => {
    captureReferralFromUrl('?ref=AB3D9K');
    renderWithRouter(<ReferPage />);
    expect(screen.getByText(/you arrived on a friend's invite link/i)).toBeInTheDocument();
  });

  it('does not show that notice to an ordinary visitor', () => {
    renderWithRouter(<ReferPage />);
    expect(screen.queryByText(/you arrived on a friend's invite link/i)).not.toBeInTheDocument();
  });
});

describe('ReferPage — signed in', () => {
  beforeEach(() => signIn());

  it('shows the real invite card instead of the signup prompt', async () => {
    renderWithRouter(<ReferPage />);
    expect(await screen.findByText('https://fasttypinglab.com/?ref=AB3D9K')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /get your invite link/i })).not.toBeInTheDocument();
  });

  it('shows the tier list expanded on this page', async () => {
    renderWithRouter(<ReferPage />);
    await waitFor(() => expect(screen.getByText(/^Tiers$/)).toBeInTheDocument());
  });
});

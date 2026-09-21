import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const EMAIL = 'fasttypinglab@gmail.com';
const UPDATED = 'September 16, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-black text-brand-text mb-2">{title}</h2>
      <div className="text-brand-text-muted text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function CookiePolicyPage() {
  useEffect(() => { document.title = 'Cookie Policy | FastTypingLab'; }, []);

  return (
    <div className="bg-brand-bg text-brand-text py-4 sm:py-6 px-4 sm:px-6">
      <Seo
        title="Cookie Policy | FastTypingLab"
        description="How FastTypingLab uses cookies and browser local storage — for sign-in, preferences, analytics and advertising — and how to control them."
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-[28px] font-extrabold mb-2">Cookie Policy</h1>
        <p className="text-brand-muted text-sm mb-8">Last updated: {UPDATED}</p>

        <p className="text-brand-text-muted text-sm leading-relaxed mb-6">
          This Cookie Policy explains what cookies and similar technologies (such as browser local
          storage) fasttypinglab.com ("the Service") uses, and the choices you have. It should be read
          alongside our <Link to="/privacy/" className="text-brand-primary hover:underline">Privacy Policy</Link>.
        </p>

        <Section title="1. What Cookies Are">
          <p>Cookies are small text files placed on your device by a website. We also use browser local storage, a similar technology that lets the Service remember information on your device between visits. Together, these let a site recognize your browser and remember things like sign-in state or preferences.</p>
        </Section>

        <Section title="2. How We Use Them">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-brand-text">Essential / authentication.</strong> To keep you signed in and secure your account session.</li>
            <li><strong className="text-brand-text">Preferences.</strong> Stored in local storage — theme (light/dark), font size, sound and accessibility settings, and your typing history on this device.</li>
            <li><strong className="text-brand-text">Analytics.</strong> To understand how the Service is used (pages visited, approximate region, device type) so we can improve it.</li>
            <li><strong className="text-brand-text">Advertising.</strong> To serve and measure ads, including through Google AdSense, and to limit how often you see the same ad.</li>
          </ul>
        </Section>

        <Section title="3. Third-Party Cookies">
          <p>Some cookies are set by services we rely on, not directly by us:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-brand-text">Supabase</strong> — authentication and session cookies for account sign-in.</li>
            <li><strong className="text-brand-text">Google</strong> — sign-in (OAuth), and, where enabled, analytics and advertising cookies (including AdSense).</li>
          </ul>
          <p>These providers set and control their own cookies according to their own privacy and cookie policies.</p>
        </Section>

        <Section title="4. Managing Cookies">
          <p>Most browsers let you view, delete and block cookies through their settings. You can also clear local storage for this site in your browser's site-data settings. Blocking essential cookies may prevent sign-in and some features from working correctly.</p>
          <p>To opt out of personalized advertising from Google specifically, visit{' '}
            <a href="https://www.google.com/settings/ads" className="text-brand-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>{' '}
            or <a href="https://www.aboutads.info/choices/" className="text-brand-primary hover:underline" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
          </p>
        </Section>

        <Section title="5. Changes to This Policy">
          <p>We may update this Cookie Policy from time to time. We will revise the "Last updated" date above when we do. Continued use of the Service after changes means you accept the updated policy.</p>
        </Section>

        <Section title="6. Contact Us">
          <p>Questions about this Cookie Policy? Email us at{' '}
            <a href={`mailto:${EMAIL}`} className="text-brand-primary hover:underline">{EMAIL}</a>, or see our{' '}
            <Link to="/contact/" className="text-brand-primary hover:underline">Contact page</Link>.
          </p>
        </Section>

        <p className="text-brand-muted text-xs mt-8">
          This policy is provided for general information and is not legal advice.
        </p>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const EMAIL = 'fasttypinglab@gmail.com';
const UPDATED = 'July 19, 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-black text-brand-text mb-2">{title}</h2>
      <div className="text-brand-text-muted text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  useEffect(() => { document.title = 'Privacy Policy | FastTypingLab'; }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="Privacy Policy | FastTypingLab"
        description="How FastTypingLab collects, uses, and protects your data — account information, typing statistics, cookies, analytics and advertising."
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Privacy Policy</h1>
        <p className="text-brand-muted text-sm mb-8">Last updated: {UPDATED}</p>

        <p className="text-brand-text-muted text-sm leading-relaxed mb-6">
          This Privacy Policy explains what information FastTypingLab ("we", "us") collects when you use
          fasttypinglab.com, how we use it, and the choices you have. By using the site, you agree to
          this policy.
        </p>

        <Section title="1. Information We Collect">
          <p><strong className="text-brand-text">Account information.</strong> If you create an account (by email/password or by signing in with Google), we collect your name, email address, and — if you choose to provide it — your mobile number. If you sign in with Google, we receive your name, email and profile photo from Google.</p>
          <p><strong className="text-brand-text">Typing activity.</strong> Your test results (WPM, accuracy, history, streaks, achievements) are stored in your browser (local storage) and, where applicable, linked to your account so you can track progress.</p>
          <p><strong className="text-brand-text">Certificates.</strong> If you generate a typing certificate, we store the name and score you chose to include.</p>
          <p><strong className="text-brand-text">Usage data.</strong> Like most websites, we may automatically collect anonymous usage and device information (pages visited, browser type, approximate region) to understand and improve the service.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide the service — run tests, save your progress, and issue certificates.</li>
            <li>To manage your account and keep it secure.</li>
            <li>If you provide your mobile number, to send you typing tips and exam reminders (for example on WhatsApp). You can ask us to stop at any time.</li>
            <li>To understand usage and improve our content, tests and features.</li>
          </ul>
        </Section>

        <Section title="3. Cookies & Local Storage">
          <p>We use browser local storage to remember your preferences (such as theme) and to save your typing history on your device. We (and our providers) may use cookies for authentication, analytics and advertising. You can clear these at any time in your browser settings.</p>
        </Section>

        <Section title="4. Analytics & Advertising">
          <p>We may use analytics tools to measure how the site is used. We may also display advertising, including through <strong className="text-brand-text">Google AdSense</strong>. Third-party vendors, including Google, may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalised advertising via <a href="https://www.google.com/settings/ads" className="text-brand-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
        </Section>

        <Section title="5. Service Providers We Share Data With">
          <p>We do not sell your personal information. We share it only with providers that help us run the service:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-brand-text">Supabase</strong> — authentication and database hosting for accounts and data.</li>
            <li><strong className="text-brand-text">Google</strong> — sign-in (OAuth), and, where used, analytics and advertising.</li>
            <li><strong className="text-brand-text">Hosting providers</strong> — to serve the website and backend.</li>
          </ul>
        </Section>

        <Section title="6. Data Retention & Your Rights">
          <p>We keep account data for as long as your account is active. You can request access to, correction of, or deletion of your personal data by emailing us. Deleting your account removes your profile information from our database.</p>
        </Section>

        <Section title="7. Data Security">
          <p>We take reasonable measures to protect your information. No method of transmission or storage is 100% secure, but we work to safeguard your data and limit access to it.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>The service is intended for a general audience and is not directed at children under 13. We do not knowingly collect personal information from children under 13.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this policy from time to time. We will revise the "Last updated" date above when we do. Continued use of the site after changes means you accept the updated policy.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>Questions about this policy or your data? Email us at{' '}
            <a href={`mailto:${EMAIL}`} className="text-brand-primary hover:underline">{EMAIL}</a>, or see our{' '}
            <Link to="/contact" className="text-brand-primary hover:underline">Contact page</Link>.
          </p>
        </Section>

        <p className="text-brand-muted text-xs mt-8">
          This policy is provided for general information and is not legal advice.
        </p>
      </div>
    </div>
  );
}

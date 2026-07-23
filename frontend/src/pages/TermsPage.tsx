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

export default function TermsPage() {
  useEffect(() => { document.title = 'Terms of Service | FastTypingLab'; }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="Terms of Service | FastTypingLab"
        description="The terms and conditions for using FastTypingLab — a free online typing and government-exam practice platform."
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Terms of Service</h1>
        <p className="text-brand-muted text-sm mb-8">Last updated: {UPDATED}</p>

        <p className="text-brand-text-muted text-sm leading-relaxed mb-6">
          These Terms govern your use of fasttypinglab.com (the "Service"). By using the Service, you
          agree to these Terms. If you do not agree, please do not use the Service.
        </p>

        <Section title="1. Use of the Service">
          <p>FastTypingLab provides free online typing tests, courses, exam practice, tools and games. You may use the Service for your personal, non-commercial practice and learning. You agree not to misuse the Service, disrupt it, attempt to gain unauthorised access, or use it to break any law.</p>
        </Section>

        <Section title="2. Accounts">
          <p>Some features require an account. You are responsible for the accuracy of the information you provide and for keeping your login secure. You are responsible for activity that happens under your account. Notify us promptly of any unauthorised use.</p>
        </Section>

        <Section title="3. Exam Information Disclaimer">
          <p>We provide practice tests and information about government typing exams (such as SSC, CPCT, UPSSSC, UP Police, court and stenography exams) for preparation purposes only. Exam requirements — speeds, layouts, durations and rules — can change and vary by post. <strong className="text-brand-text">Always confirm the official notification of your exam.</strong> We are not affiliated with any government body or examination authority, and we do not guarantee any exam result.</p>
        </Section>

        <Section title="4. No Warranty">
          <p>The Service is provided "as is" and "as available", without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that results (such as WPM or accuracy figures) are perfectly precise. Use it at your own discretion.</p>
        </Section>

        <Section title="5. Intellectual Property">
          <p>The FastTypingLab name, content, design and software are owned by us or our licensors and are protected by applicable laws. You may not copy, redistribute, or create derivative works from the Service without permission, except for your own personal use.</p>
        </Section>

        <Section title="6. Certificates">
          <p>Certificates generated on the Service are for personal and motivational use. They reflect the information and score you enter or achieve in a practice test and are not an official qualification.</p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>To the maximum extent permitted by law, FastTypingLab shall not be liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the Service.</p>
        </Section>

        <Section title="8. Changes to the Service and Terms">
          <p>We may change, suspend, or discontinue any part of the Service at any time. We may also update these Terms; the "Last updated" date will reflect changes. Continued use after changes means you accept the updated Terms.</p>
        </Section>

        <Section title="9. Governing Law">
          <p>These Terms are governed by the laws of India, without regard to conflict-of-law principles.</p>
        </Section>

        <Section title="10. Contact">
          <p>Questions about these Terms? Email{' '}
            <a href={`mailto:${EMAIL}`} className="text-brand-primary hover:underline">{EMAIL}</a>, or visit our{' '}
            <Link to="/contact" className="text-brand-primary hover:underline">Contact page</Link>. See also our{' '}
            <Link to="/privacy" className="text-brand-primary hover:underline">Privacy Policy</Link>.
          </p>
        </Section>

        <p className="text-brand-muted text-xs mt-8">
          These Terms are provided for general information and are not legal advice.
        </p>
      </div>
    </div>
  );
}

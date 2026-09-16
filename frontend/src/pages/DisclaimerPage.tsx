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

export default function DisclaimerPage() {
  useEffect(() => { document.title = 'Disclaimer | FastTypingLab'; }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="Disclaimer | FastTypingLab"
        description="Important disclaimers for FastTypingLab — exam information, typing results and certificates, educational content, and advertising."
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Disclaimer</h1>
        <p className="text-brand-muted text-sm mb-8">Last updated: {UPDATED}</p>

        <p className="text-brand-text-muted text-sm leading-relaxed mb-6">
          The information and tools on fasttypinglab.com ("the Service") are provided in good faith,
          for general practice and informational purposes only. By using the Service, you accept this
          Disclaimer in full. If you disagree with any part of it, please do not use the Service.
        </p>

        <Section title="1. Not Official Exam Guidance">
          <p>FastTypingLab provides practice tests and information related to government and competitive typing exams (including but not limited to SSC, CPCT, UPSSSC, UP Police, RRB, court and stenography exams) purely to help you practice. We are <strong className="text-brand-text">not affiliated with, endorsed by, or representing</strong> any government department, recruitment board, or examination authority.</p>
          <p>Exam eligibility, typing speed requirements, keyboard layouts, durations and rules change over time and can vary by post or notification. <strong className="text-brand-text">Always verify current requirements against the official notification</strong> published by the relevant exam authority before relying on anything shown here.</p>
        </Section>

        <Section title="2. Typing Results & Certificates Are Not Official">
          <p>WPM, accuracy, CPM and other statistics shown during or after a test are measured by your browser on your device and are estimates for self-practice, not a certified or proctored measurement. Certificates generated on the Service are for personal motivation only and do not constitute an official qualification, degree, or proof of skill recognized by any employer, institution or examination body.</p>
        </Section>

        <Section title="3. Educational Content">
          <p>Lessons, guides, blog posts and tips on the Service — including content that was drafted with AI assistance and reviewed before publishing — are provided for general learning purposes. We aim for accuracy but do not guarantee that all content is complete, current, or error-free. Content here is not professional, legal, or career advice; use your own judgement and consult authoritative sources for decisions that matter.</p>
        </Section>

        <Section title="4. External Links">
          <p>The Service may link to third-party websites (for example, official exam portals or reference material) for convenience. We do not control and are not responsible for the content, accuracy, or practices of external sites.</p>
        </Section>

        <Section title="5. Advertising">
          <p>The Service may display advertising, including through Google AdSense. Ads are served by third parties and their presence does not imply our endorsement of the advertised product or service. See our <Link to="/cookie-policy/" className="text-brand-primary hover:underline">Cookie Policy</Link> for how ad-related cookies are used.</p>
        </Section>

        <Section title="6. No Warranty & Limitation of Liability">
          <p>The Service is provided "as is" without warranties of any kind, express or implied. To the maximum extent permitted by law, FastTypingLab is not liable for any loss or damage arising from reliance on information found on the Service, including exam-preparation outcomes. This section supplements, and does not replace, the fuller terms in our <Link to="/terms/" className="text-brand-primary hover:underline">Terms of Service</Link>.</p>
        </Section>

        <Section title="7. Changes to This Disclaimer">
          <p>We may update this Disclaimer from time to time. We will revise the "Last updated" date above when we do. Continued use of the Service after changes means you accept the updated Disclaimer.</p>
        </Section>

        <Section title="8. Contact Us">
          <p>Questions about this Disclaimer? Email us at{' '}
            <a href={`mailto:${EMAIL}`} className="text-brand-primary hover:underline">{EMAIL}</a>, or see our{' '}
            <Link to="/contact/" className="text-brand-primary hover:underline">Contact page</Link>.
          </p>
        </Section>

        <p className="text-brand-muted text-xs mt-8">
          This Disclaimer is provided for general information and is not legal advice.
        </p>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';
import Seo from '../components/Seo';

const EMAIL = 'fasttypinglab@gmail.com';

export default function ContactPage() {
  useEffect(() => { document.title = 'Contact Us | FastTypingLab'; }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:px-6">
      <Seo
        title="Contact FastTypingLab — Support, Feedback & Enquiries"
        description="Get in touch with the FastTypingLab team. Email us for support, feedback, bug reports, content suggestions or partnership enquiries."
      />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black mb-4">Contact Us</h1>
        <p className="text-brand-text-muted leading-relaxed mb-8">
          We'd love to hear from you — whether it's feedback, a bug report, a request for a specific
          exam or content, or a partnership enquiry. The fastest way to reach us is email.
        </p>

        {/* Email card */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="font-bold text-base mb-1">Email us</h2>
              <a href={`mailto:${EMAIL}`} className="text-brand-primary font-semibold hover:underline break-all">{EMAIL}</a>
              <p className="text-brand-text-muted text-sm mt-1">We usually reply within 1–2 working days.</p>
            </div>
          </div>
        </div>

        {/* What to reach out about */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <MessageCircle className="w-5 h-5 text-brand-accent mb-2" />
            <h3 className="font-bold text-sm mb-1">Feedback & requests</h3>
            <p className="text-brand-text-muted text-xs leading-relaxed">Want a specific exam, layout or feature added? Tell us — a lot of our content comes from user requests.</p>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <HelpCircle className="w-5 h-5 text-brand-secondary mb-2" />
            <h3 className="font-bold text-sm mb-1">Help & bug reports</h3>
            <p className="text-brand-text-muted text-xs leading-relaxed">Something not working? Email us with your device/browser and what happened, and we'll fix it.</p>
          </div>
        </div>

        <p className="text-brand-text-muted text-sm">
          Looking for how we handle your data? Read our{' '}
          <Link to="/privacy" className="text-brand-primary hover:underline">Privacy Policy</Link> and{' '}
          <Link to="/terms" className="text-brand-primary hover:underline">Terms of Service</Link>.
        </p>

        {/* Social — placeholder for when accounts are live */}
        <p className="text-brand-muted text-xs mt-6">Our social media channels are coming soon.</p>
      </div>
    </div>
  );
}

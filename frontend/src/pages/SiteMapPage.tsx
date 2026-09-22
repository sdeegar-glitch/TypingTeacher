import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Seo from '../components/Seo';
import { BLOG_POSTS } from '../data/blogPosts';
import { EXAM_LANDINGS } from '../data/examLandingData';

// HTML sitemap — a single crawlable hub linking every page, so search engines
// (and users) can discover the whole site from one place.
const SECTIONS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Typing Tests',
    links: [
      { label: 'Typing Speed Tests', to: '/tests/' },
      { label: 'Typing Test', to: '/typing-test/' },
      { label: '1 Minute Typing Test', to: '/typing-test/1/' },
      { label: '2 Minute Typing Test', to: '/typing-test/2/' },
      { label: '3 Minute Typing Test', to: '/typing-test/3/' },
      { label: '5 Minute Typing Test', to: '/typing-test/5/' },
      { label: '10 Minute Typing Test', to: '/typing-test/10/' },
      { label: 'Typing Test for Students', to: '/typing-test-for/students/' },
      { label: 'Typing Test for Professionals', to: '/typing-test-for/professionals/' },
      { label: 'Typing Test for Government Employees', to: '/typing-test-for/government-employees/' },
      { label: 'Typing Test for Data Entry', to: '/typing-test-for/data-entry/' },
      { label: 'Typing Test for Beginners', to: '/typing-test-for/beginners/' },
      { label: 'Typing Test for Programmers', to: '/typing-test-for/programmers/' },
      { label: 'Hindi Typing Test', to: '/hindi-typing-test/' },
      { label: 'Kruti Dev Typing Test', to: '/kruti-dev-typing/' },
      { label: 'Dictation Typing Test', to: '/dictation-typing-test/' },
      { label: 'Typing Drills', to: '/typing-drills/' },
      { label: 'Weekly Live Typing Test', to: '/live-test/' },
      { label: 'Typing Certificates', to: '/typing-certificates/' },
      { label: 'Leaderboard', to: '/leaderboard/' },
    ],
  },
  {
    title: 'Learn Typing',
    links: [
      { label: 'Learn English Typing', to: '/learn/' },
      { label: 'Learn Hindi Typing', to: '/learn-hindi-typing/' },
      { label: 'Learn Hindi (Mangal/Unicode)', to: '/learn-hindi-typing/unicode/' },
      { label: 'Learn Kruti Dev', to: '/learn-hindi-typing/kruti-dev/' },
      { label: 'AI Typing Tutor', to: '/ai-tutor/' },
    ],
  },
  {
    title: 'Exam Typing Tests',
    links: [
      { label: 'All Competitive Exam Typing', to: '/competitive-exam-typing/' },
      ...Object.values(EXAM_LANDINGS).map(e => ({ label: `${e.examName} Typing Test`, to: `/${e.slug}-typing-test` })),
      { label: 'SSC CHSL Practice (exam format)', to: '/exam/ssc-chsl/' },
      { label: 'SSC CGL Practice (exam format)', to: '/exam/ssc-cgl/' },
      { label: 'Hindi Typing Exam Practice', to: '/exam/hindi-typing/' },
      { label: 'Court & Steno Typing Practice', to: '/exam/court-typing/' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'All Tools', to: '/tools/' },
      { label: 'Keyboard Tester', to: '/keyboard-tester/' },
      { label: 'CPS Test', to: '/cps-test/' },
      { label: 'Spacebar Counter', to: '/spacebar-counter/' },
      { label: 'Word Counter', to: '/word-counter/' },
      { label: 'Case Converter', to: '/case-converter/' },
      { label: 'Coding Typing', to: '/coding-typing/' },
      { label: 'WPM Calculator', to: '/wpm-calculator/' },
      { label: 'Typing Statistics', to: '/typing-statistics/' },
      { label: 'Kruti Dev ↔ Unicode Converter', to: '/kruti-dev-to-unicode/' },
      { label: 'Hindi Font Converter', to: '/font-converter/' },
      { label: 'Embeddable Typing Widget', to: '/embed/' },
      { label: 'Download Windows App', to: '/download/' },
    ],
  },
  {
    title: 'Games',
    links: [
      { label: 'All Games', to: '/games/' },
      { label: 'Word Rain', to: '/games/word-rain/' },
      { label: 'Zombie Typing', to: '/games/zombie/' },
      { label: 'Speed Racer', to: '/games/speed-racer/' },
      { label: 'Ninja Slash', to: '/games/ninja-slash/' },
      { label: 'Space Shooter', to: '/games/space-shooter/' },
      { label: 'Castle Defense', to: '/games/castle-defense/' },
      { label: 'Cyber Hacker', to: '/games/cyber-hacker/' },
      { label: 'Multiplayer Race', to: '/race/' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about/' },
      { label: 'Contact', to: '/contact/' },
      { label: 'Refer a Friend', to: '/refer/' },
      { label: 'Privacy Policy', to: '/privacy/' },
      { label: 'Terms of Service', to: '/terms/' },
      { label: 'Disclaimer', to: '/disclaimer/' },
      { label: 'Cookie Policy', to: '/cookie-policy/' },
    ],
  },
];

export default function SiteMapPage() {
  useEffect(() => { document.title = 'Site Map — All Pages | FastTypingLab'; }, []);

  return (
    <div className="bg-brand-bg text-brand-text py-4 sm:py-6 px-4 sm:px-6">
      <Seo
        title="Site Map — All Pages | FastTypingLab"
        description="Browse every page on FastTypingLab: typing tests, Hindi typing, exam practice, learning courses, tools, games and blog articles."
      />
      <div className="max-w-[1000px] mx-auto">
        <PageHeader icon={Map} eyebrow="Site Map" title="All Pages" subtitle="Every page on FastTypingLab in one place." />

        <div className="grid sm:grid-cols-2 gap-6">
          {SECTIONS.map(sec => (
            <section key={sec.title} className="bg-brand-surface border border-brand-border rounded-2xl p-4">
              <h2 className="font-black text-brand-text mb-3">{sec.title}</h2>
              <ul className="space-y-1.5">
                {sec.links.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-brand-primary hover:underline">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Blog — full list */}
          <section className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:col-span-2">
            <h2 className="font-black text-brand-text mb-3">Blog Articles</h2>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
              <li><Link to="/blog/" className="text-sm text-brand-primary hover:underline font-semibold">All Blog Posts</Link></li>
              {BLOG_POSTS.map(p => (
                <li key={p.slug}>
                  <Link to={`/blog/${p.slug}`} className="text-sm text-brand-primary hover:underline">{p.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

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
      { label: 'Typing Speed Tests', to: '/tests' },
      { label: 'Typing Test', to: '/typing-test' },
      { label: '1 Minute Typing Test', to: '/typing-test/1' },
      { label: '5 Minute Typing Test', to: '/typing-test/5' },
      { label: 'Hindi Typing Test', to: '/hindi-typing-test' },
      { label: 'Kruti Dev Typing Test', to: '/kruti-dev-typing' },
      { label: 'Typing Certificates', to: '/typing-certificates' },
      { label: 'Leaderboard', to: '/leaderboard' },
    ],
  },
  {
    title: 'Learn Typing',
    links: [
      { label: 'Learn English Typing', to: '/learn' },
      { label: 'Learn Hindi Typing', to: '/learn-hindi-typing' },
      { label: 'Learn Hindi (Mangal/Unicode)', to: '/learn-hindi-typing/unicode' },
      { label: 'Learn Kruti Dev', to: '/learn-hindi-typing/kruti-dev' },
      { label: 'AI Typing Tutor', to: '/ai-tutor' },
    ],
  },
  {
    title: 'Exam Typing Tests',
    links: [
      { label: 'All Competitive Exam Typing', to: '/competitive-exam-typing' },
      ...Object.values(EXAM_LANDINGS).map(e => ({ label: `${e.examName} Typing Test`, to: `/${e.slug}-typing-test` })),
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'All Tools', to: '/tools' },
      { label: 'Keyboard Tester', to: '/keyboard-tester' },
      { label: 'CPS Test', to: '/cps-test' },
      { label: 'Spacebar Counter', to: '/spacebar-counter' },
      { label: 'Word Counter', to: '/word-counter' },
      { label: 'Case Converter', to: '/case-converter' },
      { label: 'Coding Typing', to: '/coding-typing' },
    ],
  },
  {
    title: 'Games',
    links: [
      { label: 'All Games', to: '/games' },
      { label: 'Word Rain', to: '/games/word-rain' },
      { label: 'Zombie Typing', to: '/games/zombie' },
      { label: 'Speed Racer', to: '/games/speed-racer' },
      { label: 'Multiplayer Race', to: '/race' },
    ],
  },
];

export default function SiteMapPage() {
  useEffect(() => { document.title = 'Site Map — All Pages | FastTypingLab'; }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="Site Map — All Pages | FastTypingLab"
        description="Browse every page on FastTypingLab: typing tests, Hindi typing, exam practice, learning courses, tools, games and blog articles."
      />
      <div className="max-w-[1000px] mx-auto">
        <PageHeader icon={Map} eyebrow="Site Map" title="All Pages" subtitle="Every page on FastTypingLab in one place." />

        <div className="grid sm:grid-cols-2 gap-6">
          {SECTIONS.map(sec => (
            <section key={sec.title} className="bg-brand-surface border border-brand-border rounded-2xl p-5">
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
          <section className="bg-brand-surface border border-brand-border rounded-2xl p-5 sm:col-span-2">
            <h2 className="font-black text-brand-text mb-3">Blog Articles</h2>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
              <li><Link to="/blog" className="text-sm text-brand-primary hover:underline font-semibold">All Blog Posts</Link></li>
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

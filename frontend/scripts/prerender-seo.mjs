// Post-build SEO prerender.
//
// The app is a client-rendered SPA, so the raw HTML of every route is identical
// (the homepage shell) until JavaScript runs. Search engines — Bing especially —
// rank on what's in the RAW HTML. This script reads the built dist/index.html and
// writes a per-route index.html with that route's real <title>, description,
// canonical, OG/Twitter tags and JSON-LD baked in statically.
//
// GitHub Pages then serves e.g. /tests/index.html for /tests with correct meta,
// while the SPA still boots and takes over for interactivity.
//
// Safe by design: pure string templating, no headless browser. If anything throws,
// the build fails and the previous (good) deploy stays live.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const SITE = 'https://fasttypinglab.com';
const TEMPLATE = readFileSync(join(DIST, 'index.html'), 'utf8');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const org = {
  '@type': 'Organization',
  name: 'FastTypingLab',
  url: SITE,
  logo: { '@type': 'ImageObject', url: `${SITE}/favicon-512x512.png` },
};

const article = (p) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: p.headline,
  description: p.description,
  datePublished: p.date,
  image: `${SITE}/og-image.png`,
  author: { '@type': 'Organization', name: 'FastTypingLab' },
  publisher: org,
  mainEntityOfPage: `${SITE}${p.path}`,
});

const examFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    ['What WPM is needed for SSC CHSL typing test?', 'SSC CHSL requires a minimum of 35 WPM in English (10 minutes) or 30 WPM in Hindi (15 minutes). Aim for 40+ WPM to have a comfortable buffer.'],
    ['Is Kruti Dev or Unicode Hindi required for government exams?', 'It depends on the exam. CPCT and most central government exams now require Unicode/INSCRIPT. State exams like UP Police and Bihar SSC still use Kruti Dev. Always check your specific exam notification.'],
    ['How many months does it take to prepare for typing tests?', 'With 30 minutes of daily practice, most beginners can reach exam-level speed in 2–3 months. Existing typists may reach target speed in 3–4 weeks.'],
    ['Are backspaces counted as errors in SSC typing tests?', 'In SSC exams, backspace is allowed but every corrected word still adds to your error count. The net WPM formula penalises excessive errors. Practice minimising backspace use.'],
    ['Can I practice on mobile for government typing exams?', 'No — government typing tests are always conducted on desktop computers. Practice only on a physical keyboard for accurate preparation.'],
  ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

const ROUTES = [
  { path: '/', title: 'FastTypingLab — Free Typing Speed Test, Hindi Typing & Exam Practice', description: 'Free online typing speed test (WPM) in English, Hindi Unicode & Kruti Dev. Practice for SSC, CPCT & UP Police exams, get AI coaching, and play typing games — no signup.' },
  { path: '/tests', title: 'Typing Speed Tests — 1, 3, 5 & 10 Minute WPM Tests | FastTypingLab', description: 'Take free typing speed tests in English, Hindi Mangal (Unicode) and Kruti Dev. 1, 3, 5 and 10-minute WPM tests with real-time accuracy and net speed.' },
  { path: '/learn', title: 'Learn Touch Typing Free — Step-by-Step Lessons | FastTypingLab', description: 'Learn to type without looking. A free structured touch-typing course from home row to full speed — 50 progressive lessons with live WPM and accuracy tracking.' },
  { path: '/learn-hindi-typing', title: 'Learn Hindi Typing Online Free — INSCRIPT & Kruti Dev | FastTypingLab', description: 'Learn Hindi typing free with 200 gamified lessons for SSC, CPCT, UP Police and court exams. Choose INSCRIPT (Mangal/Unicode) or Kruti Dev and start from home row.' },
  { path: '/learn-hindi-typing/unicode', title: 'Learn Hindi Unicode (Mangal/INSCRIPT) Typing Free | FastTypingLab', description: 'Free step-by-step course to learn Hindi Unicode (Mangal/INSCRIPT) typing — the standard layout for most current government exams. Start from home row.' },
  { path: '/learn-hindi-typing/kruti-dev', title: 'Learn Kruti Dev Hindi Typing Free | FastTypingLab', description: 'Free Kruti Dev Hindi typing course for UP Police, Bihar SSC and court exams. Progressive lessons with live WPM and accuracy.' },
  { path: '/competitive-exam-typing', title: 'Competitive Exam Typing Practice — SSC, CPCT, UP Police | FastTypingLab', description: 'Free typing practice for SSC CHSL, SSC CGL, CPCT, UP Police, court clerk and railway exams. Real exam duration, WPM and accuracy — in English and Hindi.', jsonLd: examFaq },
  { path: '/games', title: 'Typing Games — Word Rain, Zombie & Speed Racer | FastTypingLab', description: 'Free typing games to boost your speed while having fun — Word Rain, Zombie Typing and Speed Racer. Improve WPM and accuracy through play.' },
  { path: '/tools', title: 'Keyboard Tools & Typing Utilities | FastTypingLab', description: 'Free typing and keyboard tools — keyboard tester, CPS test, spacebar counter, word counter, case converter and coding typing practice.' },
  { path: '/blog', title: 'Typing Blog — Tips, Guides & Exam Prep | FastTypingLab', description: 'Typing tips, speed-improvement guides, government exam typing preparation, and Hindi typing tutorials from the FastTypingLab team.' },
  { path: '/hindi-typing-test', title: 'Hindi Typing Test — Unicode (Mangal/INSCRIPT) | FastTypingLab', description: 'Free Hindi typing test in Unicode (Mangal/INSCRIPT). Practice Devanagari typing with real-time WPM and accuracy — ideal for SSC, CPCT and government exam prep.' },
  { path: '/kruti-dev-typing', title: 'Kruti Dev Typing Test & Guide | FastTypingLab', description: 'Free Kruti Dev Hindi typing test and guide. Practice the legacy Kruti Dev layout used by UP Police, Bihar SSC and court typing exams, with live WPM and accuracy.' },
  { path: '/typing-certificates', title: 'Free Typing Certificate — Verifiable WPM Certificate | FastTypingLab', description: 'Earn a free, verifiable typing certificate. Take a timed WPM test and download a shareable certificate of your typing speed and accuracy.' },
  { path: '/ai-tutor', title: 'AI Typing Tutor — Personalized Improvement Plan | FastTypingLab', description: 'Get a free, personalized typing improvement plan from our AI tutor. It analyzes your WPM, accuracy and trend, then builds a step-by-step plan and a custom practice passage.' },
  { path: '/leaderboard', title: 'Global Typing Leaderboard | FastTypingLab', description: 'See the fastest typists on FastTypingLab. Global typing speed leaderboard ranked by net WPM and accuracy.' },

  { path: '/keyboard-tester', title: 'Online Keyboard Tester — Test Every Key | FastTypingLab', description: 'Free online keyboard tester. Press any key to check it registers correctly — test your full keyboard, function keys and modifiers in the browser.' },
  { path: '/cps-test', title: 'CPS Test — Clicks Per Second Test | FastTypingLab', description: 'Free CPS (clicks per second) test. Measure your click speed over 1, 5 or 10 seconds and improve your clicking rate.' },
  { path: '/spacebar-counter', title: 'Spacebar Counter — Spacebar Clicks Per Second | FastTypingLab', description: 'Free spacebar counter and spacebar speed test. Count your spacebar presses and measure spacebar clicks per second.' },
  { path: '/word-counter', title: 'Word Counter — Words, Characters & Reading Time | FastTypingLab', description: 'Free online word counter. Count words, characters, sentences and paragraphs, with estimated reading and speaking time.' },
  { path: '/case-converter', title: 'Case Converter — UPPERCASE, lowercase, Title Case | FastTypingLab', description: 'Free online case converter. Convert text to UPPERCASE, lowercase, Title Case, Sentence case and more instantly.' },
  { path: '/coding-typing', title: 'Code Typing Practice — Practice Typing Real Code | FastTypingLab', description: 'Free code typing practice for programmers. Improve your coding speed by typing real JavaScript, Python and other code snippets.' },

  { path: '/typing-test', title: 'Typing Test — Free Online WPM Test | FastTypingLab', description: 'Free online typing test. Measure your typing speed (WPM) and accuracy with 1, 2, 5 and 10-minute tests.' },
  { path: '/typing-test/1', title: '1 Minute Typing Test — Free WPM Test | FastTypingLab', description: 'Free 1-minute typing test. Quickly measure your words-per-minute (WPM) and accuracy in 60 seconds.' },
  { path: '/typing-test/2', title: '2 Minute Typing Test — Free WPM Test | FastTypingLab', description: 'Free 2-minute typing test. Measure your typing speed and accuracy over two minutes.' },
  { path: '/typing-test/5', title: '5 Minute Typing Test — Free WPM Test | FastTypingLab', description: 'Free 5-minute typing test for endurance and exam practice. Measure sustained WPM and accuracy.' },
  { path: '/typing-test-for/students', title: 'Typing Test for Students — Free WPM Practice | FastTypingLab', description: 'Free typing test for students. Build typing speed and accuracy for school, college and exams.' },
  { path: '/typing-test-for/professionals', title: 'Typing Test for Professionals — Free WPM Test | FastTypingLab', description: 'Free typing test for working professionals. Improve your speed and accuracy for everyday office work.' },
  { path: '/typing-test-for/government-employees', title: 'Typing Test for Government Employees | FastTypingLab', description: 'Free typing test for government employees and aspirants. Practice exam-style passages in English and Hindi.' },

  { path: '/games/word-rain', title: 'Word Rain — Typing Game | FastTypingLab', description: 'Play Word Rain, a free typing game. Type falling words before they hit the ground to boost your speed and accuracy.' },
  { path: '/games/zombie', title: 'Zombie Typing — Typing Game | FastTypingLab', description: 'Play Zombie Typing, a free typing game. Type words to defeat zombies and improve your typing speed.' },
  { path: '/games/speed-racer', title: 'Speed Racer — Typing Game | FastTypingLab', description: 'Play Speed Racer, a free typing game. Type fast to win the race and level up your WPM.' },
  { path: '/race', title: 'Multiplayer Typing Race | FastTypingLab', description: 'Race friends in a real-time multiplayer typing race. Test your speed against others, live.' },

  { path: '/exam/ssc-chsl', title: 'SSC CHSL Typing Test Practice | FastTypingLab', description: 'Free SSC CHSL typing test practice in exact exam conditions — 10 minutes, English, with real WPM and accuracy scoring.' },
  { path: '/exam/ssc-cgl', title: 'SSC CGL Typing Test Practice | FastTypingLab', description: 'Free SSC CGL skill-test typing practice with real exam duration, WPM and accuracy calculation.' },
  { path: '/exam/hindi-typing', title: 'Hindi Typing Exam Practice — UP Police & CPCT | FastTypingLab', description: 'Free Hindi typing exam practice for UP Police, CPCT and court typing tests, with real WPM and accuracy.' },
  { path: '/exam/court-typing', title: 'Court Clerk & Steno Typing Test Practice | FastTypingLab', description: 'Free court clerk and stenographer typing test practice in Hindi and English exam formats.' },

  { path: '/blog/how-to-type-faster-in-30-days', title: 'How to Type Faster in 30 Days | FastTypingLab', description: 'Learn how to increase your typing speed from 30 WPM to 70+ WPM in just 30 days with this step-by-step daily practice guide.', type: 'article', jsonLd: article({ headline: 'How to Type Faster in 30 Days: A Complete Guide', description: 'Learn how to increase your typing speed from 30 WPM to 70+ WPM in just 30 days with this step-by-step daily practice guide.', date: '2026-05-20', path: '/blog/how-to-type-faster-in-30-days' }) },
  { path: '/blog/best-typing-test-for-ssc-exam', title: 'Best Typing Test for SSC Exam 2026 | FastTypingLab', description: 'Complete guide to SSC CHSL and CGL typing test preparation. Know the speed requirements, practice strategy, and best free tools.', type: 'article', jsonLd: article({ headline: 'Best Typing Test for SSC Exam Preparation in 2026', description: 'Complete guide to SSC CHSL and CGL typing test preparation. Know the speed requirements, practice strategy, and best free tools.', date: '2026-05-25', path: '/blog/best-typing-test-for-ssc-exam' }) },
  { path: '/blog/hindi-typing-tips-for-govt-exams', title: 'Hindi Typing Tips for Govt Exams | FastTypingLab', description: 'Master Hindi typing for SSC, CPCT, Court, and railway exams. Tips for Remington Gail layout, matra typing, and speed improvement.', type: 'article', jsonLd: article({ headline: 'Hindi Typing Tips for Government Exams 2026', description: 'Master Hindi typing for SSC, CPCT, Court, and railway exams. Tips for Remington Gail layout, matra typing, and speed improvement.', date: '2026-05-28', path: '/blog/hindi-typing-tips-for-govt-exams' }) },
  { path: '/blog/touch-typing-vs-hunt-and-peck', title: 'Touch Typing vs Hunt and Peck | FastTypingLab', description: 'Understand the difference between touch typing and hunt-and-peck. Learn why touch typing is 3x faster and how to make the switch.', type: 'article', jsonLd: article({ headline: 'Touch Typing vs Hunt-and-Peck: Which Is Better?', description: 'Understand the difference between touch typing and hunt-and-peck. Learn why touch typing is 3x faster and how to make the switch.', date: '2026-05-15', path: '/blog/touch-typing-vs-hunt-and-peck' }) },
  { path: '/blog/keyboard-shortcuts-every-professional-should-know', title: '20 Must-Know Keyboard Shortcuts | FastTypingLab', description: 'Save hours every week with these 20 essential keyboard shortcuts for Windows, Chrome, MS Word, and Excel used by professionals.', type: 'article', jsonLd: article({ headline: '20 Keyboard Shortcuts Every Professional Should Know', description: 'Save hours every week with these 20 essential keyboard shortcuts for Windows, Chrome, MS Word, and Excel used by professionals.', date: '2026-05-10', path: '/blog/keyboard-shortcuts-every-professional-should-know' }) },
];

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
}
function replaceOrInsert(html, regex, tag) {
  return regex.test(html) ? html.replace(regex, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}
function setNamedMeta(html, name, content) {
  return replaceOrInsert(html, new RegExp(`<meta[^>]*name=["']${name}["'][^>]*>`, 'i'), `<meta name="${name}" content="${esc(content)}">`);
}
function setPropMeta(html, prop, content) {
  return replaceOrInsert(html, new RegExp(`<meta[^>]*property=["']${prop.replace(':', '\\:')}["'][^>]*>`, 'i'), `<meta property="${prop}" content="${esc(content)}">`);
}
function setCanonical(html, url) {
  return replaceOrInsert(html, /<link[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}">`);
}
function injectJsonLd(html, blocks) {
  if (!blocks.length) return html;
  const scripts = blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n    ');
  return html.replace('</head>', `    ${scripts}\n  </head>`);
}

let written = 0;
for (const r of ROUTES) {
  // GitHub Pages serves dist/<path>/index.html and 301-redirects /path -> /path/,
  // so the canonical must use the trailing-slash form it actually serves.
  const url = `${SITE}${r.path === '/' ? '/' : r.path + '/'}`;
  const type = r.type || 'website';
  let html = TEMPLATE;
  html = setTitle(html, r.title);
  html = setNamedMeta(html, 'description', r.description);
  html = setCanonical(html, url);
  html = setPropMeta(html, 'og:title', r.title);
  html = setPropMeta(html, 'og:description', r.description);
  html = setPropMeta(html, 'og:url', url);
  html = setPropMeta(html, 'og:type', type);
  html = setNamedMeta(html, 'twitter:title', r.title);
  html = setNamedMeta(html, 'twitter:description', r.description);
  html = injectJsonLd(html, r.jsonLd ? [r.jsonLd] : []);

  const outDir = r.path === '/' ? DIST : join(DIST, r.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
  written++;
}

console.log(`✓ prerendered SEO for ${written} routes`);

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

const faqLd = (pairs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pairs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

// Breadcrumb trail per page → BreadcrumbList rich result + clearer site structure.
function breadcrumbLd(r) {
  if (r.path === '/') return null;
  const name = String(r.title).split('|')[0].trim();
  const items = [{ name: 'Home', url: `${SITE}/` }];
  if (r.path.startsWith('/blog/')) items.push({ name: 'Blog', url: `${SITE}/blog/` });
  else if (r.path.endsWith('-typing-test') && r.path !== '/typing-test') items.push({ name: 'Exam Typing', url: `${SITE}/competitive-exam-typing/` });
  items.push({ name, url: `${SITE}${r.path}/` });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

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
  { path: '/all-pages', title: 'Site Map — All Pages | FastTypingLab', description: 'Browse every page on FastTypingLab: typing tests, Hindi typing, exam practice, learning courses, tools, games and blog articles.' },

  // Exam typing landing pages (high-intent, with FAQ schema)
  { path: '/ssc-chsl-typing-test', title: 'SSC CHSL Typing Test Online — Free Practice & Speed | FastTypingLab', description: 'Free SSC CHSL typing test practice online. 35 WPM English / 30 WPM Hindi in 10 minutes, with live WPM and accuracy. Prepare for the LDC & DEO skill test.', jsonLd: faqLd([
    ['What is the typing speed required for SSC CHSL?', 'You need 35 WPM in English or 30 WPM in Hindi over 10 minutes. Aim for 40+ WPM in practice to keep a safe margin.'],
    ['Is the SSC CHSL typing test qualifying or scored?', 'It is qualifying only — it does not add to your merit, but you must pass it to be selected for LDC/DEO posts.'],
    ['Can I practice the SSC CHSL typing test for free?', 'Yes. FastTypingLab offers a free 10-minute SSC CHSL-style typing test in English and Hindi with live WPM and accuracy.'],
  ]) },
  { path: '/ssc-cgl-typing-test', title: 'SSC CGL DEST Typing Test Online — Free Practice | FastTypingLab', description: 'Free SSC CGL DEST (Data Entry Skill Test) practice. Type 2,000 key depressions in 15 minutes (~8,000 KDPH) with live speed and accuracy tracking.', jsonLd: faqLd([
    ['What is the SSC CGL DEST requirement?', 'You must type 2,000 key depressions in 15 minutes (about 8,000 per hour), roughly 27–35 WPM sustained, for the Tax Assistant post.'],
    ['Is DEST the same as the CHSL typing test?', 'No. CHSL measures WPM over 10 minutes; CGL DEST measures key depressions over 15 minutes. Practice the correct format.'],
    ['How can I practice SSC CGL DEST online free?', 'Use the free SSC CGL practice test on FastTypingLab, which replicates the 15-minute format with live speed and accuracy.'],
  ]) },
  { path: '/cpct-typing-test', title: 'CPCT Typing Test Online — Free Hindi & English Practice | FastTypingLab', description: 'Free MP CPCT typing test practice in Hindi (Mangal/Unicode) and English. Build the speed and accuracy needed for the CPCT score card, with live tracking.', jsonLd: faqLd([
    ['Which Hindi layout does CPCT use — Kruti Dev or Mangal?', 'CPCT uses the Unicode Mangal (INSCRIPT) layout, not Kruti Dev. Practice on Mangal/INSCRIPT for accurate preparation.'],
    ['What typing speed is needed for CPCT?', 'Around 30 WPM in English and 20–30 WPM in Hindi, with net speed calculated after errors.'],
    ['Where can I practice CPCT typing free?', 'FastTypingLab offers free Hindi Unicode (Mangal) and English typing tests plus a step-by-step Learn Hindi Typing course.'],
  ]) },
  { path: '/up-police-typing-test', title: 'UP Police Typing Test Online — Free Hindi Practice | FastTypingLab', description: 'Free UP Police typing test practice for Computer Operator & Clerk posts. Hindi (Kruti Dev / Mangal) and English, with live WPM and accuracy tracking.', jsonLd: faqLd([
    ['What typing speed is required for UP Police?', 'Most UP Police Computer Operator/Clerk posts require around 25–30 WPM in Hindi. Aim for 30+ WPM to clear it comfortably.'],
    ['Does UP Police typing use Kruti Dev or Mangal?', 'Many UP state exams still use Kruti Dev, while some use Mangal/Unicode. Always check your specific exam notification.'],
    ['How do I practice UP Police typing test free?', 'FastTypingLab offers free Kruti Dev and Hindi Unicode typing practice with live WPM and accuracy.'],
  ]) },
  { path: '/railway-ntpc-typing-test', title: 'Railway NTPC Typing Test Online — Free Practice | FastTypingLab', description: 'Free RRB Railway NTPC typing skill test practice. English (30 WPM) and Hindi (25 WPM) typing with live WPM and accuracy for the Typing Skill Test (TST).', jsonLd: faqLd([
    ['What is the typing speed required for Railway NTPC?', 'The RRB NTPC typing skill test requires about 30 WPM in English or 25 WPM in Hindi on a computer.'],
    ['Is the Railway NTPC typing test qualifying?', 'Yes, the Typing Skill Test (TST) is qualifying — you must meet the speed to be selected, but it is not added to your merit score.'],
    ['Can I practice Railway NTPC typing free?', 'Yes. FastTypingLab offers free English and Hindi typing tests with live WPM and accuracy to prepare for the NTPC skill test.'],
  ]) },
  { path: '/court-typing-test', title: 'Court & Stenographer Typing Test Online — Free Practice | FastTypingLab', description: 'Free court clerk and stenographer typing test practice in Hindi and English. Practice legal-format passages with live WPM and accuracy for high court & district court exams.', jsonLd: faqLd([
    ['What typing speed is required for court clerk / typist posts?', 'Most district/high court clerk and typist posts require around 25–30 WPM in Hindi or English. Stenographer posts require higher speeds.'],
    ['Which layout do court typing tests use?', 'It depends on the state court — some use Kruti Dev, others Mangal/Unicode. Always check your exam notification and practice that layout.'],
    ['How can I practice court typing test free?', 'FastTypingLab offers free Hindi (Kruti Dev and Mangal) and English typing practice with live WPM and accuracy.'],
  ]) },
  { path: '/bihar-ssc-typing-test', title: 'Bihar SSC (BSSC) Typing Test Online — Free Practice | FastTypingLab', description: 'Free Bihar SSC (BSSC) typing test practice in Hindi (Kruti Dev) and English. Build the ~30 WPM speed needed for the skill test, with live WPM and accuracy.', jsonLd: faqLd([
    ['What typing speed is required for Bihar SSC?', 'Bihar SSC skill tests typically require around 30 WPM in Hindi or English. Aim for 35+ WPM to clear it comfortably.'],
    ['Does Bihar SSC use Kruti Dev or Mangal?', 'Bihar SSC commonly uses the Kruti Dev layout for Hindi, but always confirm from your specific exam notification.'],
    ['How can I practice Bihar SSC typing free?', 'FastTypingLab offers free Kruti Dev and Hindi Unicode typing practice with live WPM and accuracy.'],
  ]) },
  { path: '/deo-typing-test', title: 'DEO Typing Test Online — Data Entry Operator Practice | FastTypingLab', description: 'Free Data Entry Operator (DEO) typing test practice. Build 8,000+ key depressions per hour (~27–35 WPM) with live speed and accuracy tracking.', jsonLd: faqLd([
    ['What is the typing speed for DEO?', 'Most Data Entry Operator posts require about 8,000 key depressions per hour (roughly 27–35 WPM sustained). Some posts require higher.'],
    ['Is DEO speed measured in WPM or KDPH?', 'DEO speed is usually measured in key depressions per hour (KDPH). 8,000 KDPH is about 27–35 WPM.'],
    ['How can I practice DEO typing free?', 'Use the free typing tests on FastTypingLab with live WPM and accuracy to build sustained data-entry speed.'],
  ]) },
  { path: '/rsmssb-typing-test', title: 'RSMSSB Typing Test Online — Rajasthan LDC Practice | FastTypingLab', description: 'Free RSMSSB typing test practice for Rajasthan LDC, Junior Assistant and Informatics Assistant posts — Hindi and English, with live WPM and accuracy.', jsonLd: faqLd([
    ['What typing speed is required for RSMSSB LDC?', 'RSMSSB skill tests typically require around 20–25 WPM in Hindi and English, but always confirm the exact figure from your post notification.'],
    ['Which layout does RSMSSB use for Hindi?', 'It varies by post — commonly Kruti Dev or Mangal. Check your specific notification and practice that layout.'],
    ['How can I practice RSMSSB typing free?', 'FastTypingLab offers free Hindi (Kruti Dev and Mangal) and English typing practice with live WPM and accuracy.'],
  ]) },
  { path: '/ldc-typing-test', title: 'LDC Typing Test Online — Free Practice & Speed | FastTypingLab', description: 'Free LDC (Lower Division Clerk) typing test practice in English and Hindi. Build the speed needed for SSC and state LDC skill tests, with live WPM and accuracy.', jsonLd: faqLd([
    ['What typing speed is required for LDC?', 'SSC LDC requires 35 WPM in English or 30 WPM in Hindi. State LDC posts often require 20–30 WPM — always check your notification.'],
    ['Is the LDC typing test in Hindi or English?', 'It depends on the post — many allow either Hindi or English. Confirm the languages and layout in your exam notification.'],
    ['How can I practice the LDC typing test free?', 'FastTypingLab offers free English and Hindi (Kruti Dev and Mangal) typing tests with live WPM and accuracy.'],
  ]) },
  { path: '/ssc-steno-typing-test', title: 'SSC Stenographer Typing Test — Skill Test & Practice | FastTypingLab', description: 'SSC Stenographer skill test guide: shorthand speed for Grade C & D, computer transcription, and free typing practice to build transcription speed and accuracy.', jsonLd: faqLd([
    ['What is the speed required for SSC Stenographer?', 'SSC Steno Grade C requires 100 WPM shorthand and Grade D requires 80 WPM shorthand, followed by transcription on a computer within a set time.'],
    ['Is SSC Stenographer a typing test?', 'Not exactly — it is a shorthand dictation plus computer transcription, but fast, accurate typing is essential to complete the transcription in time.'],
    ['How can I practice for the SSC Steno transcription?', 'Build typing speed and accuracy with free English and Hindi typing tests on FastTypingLab so transcription is quick and error-free.'],
  ]) },
  { path: '/dsssb-typing-test', title: 'DSSSB Typing Test Online — Free Practice & Speed | FastTypingLab', description: 'Free DSSSB typing test practice for Delhi LDC, Junior Assistant and Typist posts — 35 WPM English / 30 WPM Hindi, with live WPM and accuracy.', jsonLd: faqLd([
    ['What typing speed is required for DSSSB?', 'DSSSB typing tests typically require 35 WPM in English or 30 WPM in Hindi, though it can vary by post — always check your notification.'],
    ['Is the DSSSB typing test qualifying?', 'Yes, it is a qualifying skill test — you must meet the required speed to be selected, but it is not added to your merit score.'],
    ['How can I practice the DSSSB typing test free?', 'FastTypingLab offers free English and Hindi (Mangal and Kruti Dev) typing tests with live WPM and accuracy.'],
  ]) },
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
  { path: '/games/ninja-slash', title: 'Ninja Slash — Typing Game | FastTypingLab', description: 'Slice flying words with lightning-fast typing. Combos, crits, slow-mo, bombs and XP — a modern typing game that makes you faster while you play.' },
  { path: '/games/space-shooter', title: 'Space Shooter — Typing Game | FastTypingLab', description: 'Blast the alien fleet by typing enemy words to fire your laser. Waves, combos, crits and XP — a modern free typing game.' },
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
  { path: '/blog/ssc-chsl-typing-test-speed-and-tips', title: 'SSC CHSL Typing Test 2026 — Speed, Rules & Practice | FastTypingLab', description: 'SSC CHSL typing test 2026: required speed (35 WPM English / 30 WPM Hindi), error rules, exam format, and a free 4-week practice plan to clear it with confidence.', type: 'article', jsonLd: article({ headline: 'SSC CHSL Typing Test 2026: Speed Required, Rules & How to Pass', description: 'SSC CHSL typing test 2026: required speed, rules, format and a free 4-week practice plan.', date: '2026-06-27', path: '/blog/ssc-chsl-typing-test-speed-and-tips' }) },
  { path: '/blog/how-many-wpm-is-good-typing-speed-benchmarks', title: 'How Many WPM Is Good? Average Typing Speed Explained | FastTypingLab', description: 'What is a good typing speed? See average WPM by level and profession, what counts as fast, and exactly how to reach 40, 60, and 80+ WPM.', type: 'article', jsonLd: article({ headline: 'How Many WPM Is Good? Typing Speed Benchmarks (2026)', description: 'Average typing speed by level and profession, and how to reach 40, 60 and 80+ WPM.', date: '2026-06-26', path: '/blog/how-many-wpm-is-good-typing-speed-benchmarks' }) },
  { path: '/blog/cpct-typing-test-hindi-english-guide', title: 'CPCT Typing Test 2026 — Hindi & English Practice | FastTypingLab', description: 'CPCT typing test guide: Hindi (Mangal/Unicode) and English speed requirements, scoring, common mistakes, and a free daily plan to clear MP CPCT.', type: 'article', jsonLd: article({ headline: 'CPCT Typing Test: Hindi & English Practice Guide (2026)', description: 'CPCT typing test guide for Hindi (Mangal/Unicode) and English — requirements, scoring and a free practice plan.', date: '2026-06-25', path: '/blog/cpct-typing-test-hindi-english-guide' }) },
  { path: '/blog/up-police-typing-test-speed-and-layout', title: 'UP Police Typing Test 2026 — Speed, Kruti Dev & Practice | FastTypingLab', description: 'UP Police typing test guide: required Hindi speed (~25 WPM), Kruti Dev vs Mangal layout, exam format, common mistakes, and a free practice plan.', type: 'article', jsonLd: article({ headline: 'UP Police Typing Test: Speed, Kruti Dev Layout & Practice (2026)', description: 'UP Police typing test guide — Hindi speed, Kruti Dev vs Mangal layout, format and a free practice plan.', date: '2026-06-28', path: '/blog/up-police-typing-test-speed-and-layout' }) },
  { path: '/blog/how-to-type-in-hindi-on-laptop-word-whatsapp', title: 'How to Type in Hindi on Laptop, Word & WhatsApp | FastTypingLab', description: 'Learn how to type in Hindi on a laptop, MS Word, and WhatsApp — using Mangal (INSCRIPT), Google Input Tools, and phonetic typing. Step-by-step and free.', type: 'article', jsonLd: article({ headline: 'How to Type in Hindi on Laptop, MS Word & WhatsApp (2026)', description: 'Type Hindi on laptop, MS Word and WhatsApp using Mangal/INSCRIPT, Google Input Tools and phonetic typing.', date: '2026-06-28', path: '/blog/how-to-type-in-hindi-on-laptop-word-whatsapp' }) },
  { path: '/blog/kruti-dev-typing-chart-keyboard-guide', title: 'Kruti Dev Typing Chart & Keyboard Layout Guide | FastTypingLab', description: 'Complete Kruti Dev typing chart and keyboard layout guide. Understand key positions, matras and half-letters, with free Kruti Dev typing practice.', type: 'article', jsonLd: article({ headline: 'Kruti Dev Typing Chart & Keyboard Layout Guide (2026)', description: 'Kruti Dev typing chart and keyboard layout guide — key positions, matras, half-letters and free practice.', date: '2026-06-27', path: '/blog/kruti-dev-typing-chart-keyboard-guide' }) },
  { path: '/blog/ahc-ro-aro-typing-test-guide', title: 'Allahabad High Court RO/ARO Typing Test — Speed & Practice | FastTypingLab', description: 'Allahabad High Court (AHC) RO/ARO typing test guide: Hindi & English speed, rules, exam format, common mistakes, and free practice to prepare.', type: 'article', jsonLd: article({ headline: 'AHC RO/ARO Typing Test: Speed, Rules & Practice (2026)', description: 'AHC RO/ARO typing test guide — Hindi and English speed, rules, format and free practice.', date: '2026-06-26', path: '/blog/ahc-ro-aro-typing-test-guide' }) },
  { path: '/blog/kruti-dev-vs-mangal-which-to-learn', title: 'Kruti Dev vs Mangal — Which Hindi Layout to Learn | FastTypingLab', description: 'Kruti Dev vs Mangal (Unicode/INSCRIPT): the key differences, which government exams use each, and how to choose the right Hindi typing layout to learn.', type: 'article', jsonLd: article({ headline: 'Kruti Dev vs Mangal: Which Hindi Typing Layout Should You Learn?', description: 'Kruti Dev vs Mangal — differences, which exams use each, and how to choose.', date: '2026-06-28', path: '/blog/kruti-dev-vs-mangal-which-to-learn' }) },
  { path: '/blog/how-to-type-hindi-matras-half-letters-faster', title: 'How to Type Hindi Matras & Half-Letters Faster | FastTypingLab', description: 'Struggling with Hindi matras and half-letters? Learn the technique to type conjuncts, matras and half-letters faster and more accurately for typing exams.', type: 'article', jsonLd: article({ headline: 'How to Type Hindi Matras and Half-Letters Faster', description: 'Technique to type Hindi matras, half-letters and conjuncts faster and more accurately.', date: '2026-06-27', path: '/blog/how-to-type-hindi-matras-half-letters-faster' }) },
  { path: '/blog/best-free-typing-software-for-government-exams', title: 'Best Free Typing Software for Government Exams | FastTypingLab', description: 'The best free typing software and websites for government exam preparation in India — SSC, CPCT, UP Police and more, in Hindi and English.', type: 'article', jsonLd: article({ headline: 'Best Free Typing Software for Government Exams in India (2026)', description: 'Best free typing software and websites for Indian government exam prep in Hindi and English.', date: '2026-06-26', path: '/blog/best-free-typing-software-for-government-exams' }) },
  { path: '/blog/how-to-type-without-looking-touch-typing-guide', title: 'How to Type Without Looking — Touch Typing Guide | FastTypingLab', description: 'Learn how to type without looking at the keyboard. The touch typing method, home row technique, finger placement, and drills to build muscle memory.', type: 'article', jsonLd: article({ headline: 'How to Type Without Looking: The Touch Typing Method', description: 'The touch typing method, home row technique, finger placement and drills to type without looking.', date: '2026-06-28', path: '/blog/how-to-type-without-looking-touch-typing-guide' }) },
  { path: '/blog/5-minute-typing-test-build-stamina', title: '5 Minute Typing Test — Build Stamina for Exams | FastTypingLab', description: 'Why the 5-minute typing test matters for exams, and how to build the stamina and consistency to hold your speed for the full duration.', type: 'article', jsonLd: article({ headline: '5-Minute Typing Test: How to Build Typing Stamina', description: 'Why the 5-minute typing test matters and how to build stamina to hold your speed.', date: '2026-06-27', path: '/blog/5-minute-typing-test-build-stamina' }) },
  { path: '/blog/remington-gail-vs-inscript-hindi-typing', title: 'Remington Gail vs INSCRIPT — Hindi Typing Layouts | FastTypingLab', description: 'Remington Gail vs INSCRIPT (Mangal): the difference between these Hindi typing layouts, which exams use each, and how to choose the right one.', type: 'article', jsonLd: article({ headline: 'Remington (Gail) vs INSCRIPT: Hindi Typing Layouts Explained', description: 'Remington Gail vs INSCRIPT (Mangal) — differences, which exams use each, and how to choose.', date: '2026-06-26', path: '/blog/remington-gail-vs-inscript-hindi-typing' }) },
  { path: '/blog/average-typing-speed-by-age-and-profession', title: 'Average Typing Speed — By Age, Profession & Country | FastTypingLab', description: 'What is the average typing speed? See average WPM by age, profession and in India, what counts as fast, and how to type above average.', type: 'article', jsonLd: article({ headline: 'What Is the Average Typing Speed? (By Age & Profession)', description: 'Average typing speed by age, profession and in India, and how to type above average.', date: '2026-07-05', path: '/blog/average-typing-speed-by-age-and-profession' }) },
  { path: '/blog/how-to-improve-typing-speed-and-accuracy', title: 'How to Improve Typing Speed and Accuracy Fast | FastTypingLab', description: 'Proven ways to improve typing speed and accuracy — touch typing, home row, daily drills, and the accuracy-first method to type faster without more errors.', type: 'article', jsonLd: article({ headline: 'How to Improve Typing Speed and Accuracy (Fast)', description: 'Proven ways to improve typing speed and accuracy with the accuracy-first method.', date: '2026-07-04', path: '/blog/how-to-improve-typing-speed-and-accuracy' }) },
  { path: '/blog/typing-posture-and-ergonomics-guide', title: 'Typing Posture & Ergonomics — Avoid Wrist Pain | FastTypingLab', description: 'Correct typing posture and ergonomics: hand and wrist position, desk setup, and habits to type faster, longer, and avoid carpal tunnel and wrist pain.', type: 'article', jsonLd: article({ headline: 'Typing Posture & Ergonomics: Type Faster Without Wrist Pain', description: 'Correct typing posture, hand and wrist position, and desk setup to type faster and avoid pain.', date: '2026-07-03', path: '/blog/typing-posture-and-ergonomics-guide' }) },
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

// Internal links surfaced in the static body so crawlers (and Bingbot, which
// barely runs JS) can discover the rest of the site.
const NAV = [
  ['/', 'Home'], ['/tests/', 'Typing Tests'], ['/learn/', 'Learn Typing'],
  ['/learn-hindi-typing/', 'Learn Hindi Typing'], ['/hindi-typing-test/', 'Hindi Typing Test'],
  ['/competitive-exam-typing/', 'Exam Typing'], ['/games/', 'Typing Games'],
  ['/tools/', 'Tools'], ['/ai-tutor/', 'AI Tutor'], ['/blog/', 'Blog'],
];

// Bake a real <h1>, intro and nav into the otherwise-empty <body>. The SPA uses
// createRoot(), which replaces #root on mount, so users still get the full app —
// but crawlers without JS now see a proper headline and body content.
function injectBody(html, r) {
  const h1 = String(r.title).split('|')[0].trim();
  const links = NAV.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join(' &middot; ');
  const body =
    '<div id="root"><div data-prerender="seo" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a">' +
    `<h1 style="font-size:1.9rem;font-weight:800;margin:0 0 12px">${esc(h1)}</h1>` +
    `<p style="color:#475569;margin:0 0 22px;max-width:700px">${esc(r.description)}</p>` +
    `<nav style="font-size:.95rem;color:#2A6A78">${links}</nav>` +
    '</div></div>';
  return html.replace('<div id="root"></div>', body);
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
  const blocks = [];
  if (r.jsonLd) blocks.push(r.jsonLd);
  const crumb = breadcrumbLd(r);
  if (crumb) blocks.push(crumb);
  html = injectJsonLd(html, blocks);
  html = injectBody(html, r);

  const outDir = r.path === '/' ? DIST : join(DIST, r.path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
  written++;
}

console.log(`✓ prerendered SEO for ${written} routes`);

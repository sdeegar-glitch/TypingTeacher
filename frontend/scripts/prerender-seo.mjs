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
import { EXAM_LANDINGS } from '../src/data/examLandingData.ts';
import { BLOG_POSTS } from '../src/data/blogPosts.ts';

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
  sameAs: ['https://www.youtube.com/@fasttypinglab', 'https://x.com/fasttypinglab'],
};
// Standalone Organization entity (with @context) for the homepage -- `org`
// above is otherwise only ever nested as `publisher` inside article jsonLd,
// so without this, sameAs (YouTube/X) would never appear as its own
// schema.org entity anywhere on the site.
const orgLd = { '@context': 'https://schema.org', ...org };

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

// Exam-landing and blog routes are generated from the actual content data
// (examLandingData.ts, blogPosts.ts) rather than duplicated by hand here --
// a prior hand-maintained copy drifted out of sync with real content edits,
// so crawlers/social previews kept seeing stale or even since-corrected-wrong
// text. Single source of truth now; no second copy to forget to update.
const examRoutes = Object.values(EXAM_LANDINGS).map((e) => ({
  path: `/${e.slug}-typing-test`,
  title: e.seoTitle,
  description: e.metaDesc,
  intro: e.deepDive,
  jsonLd: faqLd(e.faqs.map((f) => [f.q, f.a])),
}));

const blogRoutes = BLOG_POSTS.map((p) => ({
  path: `/blog/${p.slug}`,
  title: p.seoTitle,
  description: p.metaDesc,
  type: 'article',
  jsonLd: article({ headline: p.title, description: p.metaDesc, date: p.date, path: `/blog/${p.slug}` }),
}));

const ROUTES = [
  { path: '/', title: 'FastTypingLab — Free Typing Test, Hindi Typing & Exam Prep', h1: 'Type Faster. Score Higher.', description: 'Free online typing speed test (WPM) in English & Hindi. Practice for SSC, CPCT & UP Police exams with AI coaching and typing games — no signup.', jsonLd: orgLd, intro: "FastTypingLab is a free online typing platform built for both everyday practice and serious exam preparation. A typing test measures two things at once — words per minute (WPM), your raw speed, and accuracy, the percentage of characters you get right; net WPM combines both by subtracting your mistakes from your gross speed, since a fast test full of errors isn't actually useful. Regular short sessions build the muscle memory touch typing depends on far better than occasional long ones, which is why the site is organized around bite-sized daily practice: a structured 50-lesson course for English, dedicated INSCRIPT and Kruti Dev courses for Hindi, and real exam-format tests for SSC, CPCT, UP Police and other government typing exams. Typing games turn the same drilling into something closer to play, an AI tutor reviews your stats and builds a personalized plan, and every test result can become a shareable certificate. Everything on FastTypingLab is free, runs entirely in your browser, and needs no signup to try." },
  { path: '/tests', title: 'Typing Speed Tests — 1, 3, 5 & 10 Minute WPM Tests | FastTypingLab', description: 'Take free typing speed tests in English, Hindi Mangal (Unicode) and Kruti Dev. 1, 3, 5 and 10-minute WPM tests with real-time accuracy and net speed.', intro: "The Typing Tests Library covers three separate tracks: English, Hindi typed in Unicode Mangal (the INSCRIPT layout most current government exams require), and Hindi typed in the older Kruti Dev font layout still used by some state exams like UP Police and Bihar SSC. Each track offers test durations of 1, 3, 5 and 10 minutes, matching the timings used in real skill tests — SSC CHSL's 10-minute format, for example, or CPCT's shorter timed sections. While you type, the test tracks your gross WPM (characters typed, divided by five, per minute), your net WPM (the same figure after subtracting mistakes, the number most exams and employers actually care about), and your accuracy percentage in real time, so you can see exactly where you're losing speed. Passages are refreshed regularly rather than reused, and results are stored to your profile if you're signed in, so you can track whether your speed is actually improving week over week rather than just guessing." },
  { path: '/learn', title: 'Learn Touch Typing Free — Step-by-Step Lessons | FastTypingLab', description: 'Learn to type without looking. A free structured touch-typing course from home row to full speed — 50 progressive lessons with live WPM and accuracy tracking.', intro: "This is a structured, 50-lesson touch-typing course that starts from the home row — the ASDF and JKL; keys your fingers rest on between keystrokes — and works outward to the full keyboard, one small group of keys at a time. Each lesson is short by design: a few minutes of focused drilling on a specific set of keys, with live WPM and accuracy shown as you go, rather than long unfocused sessions that are easy to lose motivation partway through. Lessons unlock progressively, so you always know exactly what to practice next instead of guessing, and the course tracks completed lessons so you can pick up again later exactly where you left off. This method — building finger memory for a small set of keys before adding more — is the same approach professional typing instructors use, and it's specifically what lets you eventually type without looking at the keyboard at all, the real difference between touch typing and hunt-and-peck." },
  { path: '/learn-hindi-typing', title: 'Learn Hindi Typing Online Free — INSCRIPT & Kruti Dev | FastTypingLab', description: 'Learn Hindi typing free with 200 gamified lessons for SSC, CPCT, UP Police and court exams. Choose INSCRIPT or Kruti Dev and start from home row.', intro: "Hindi typing on a computer uses one of two very different layouts, and government exams don't treat them as interchangeable. INSCRIPT — typed in Unicode using the Mangal font — is the layout most central government exams and CPCT now require, mapping keys phonetically to Devanagari characters. Kruti Dev is an older, non-Unicode font layout still specified by several state exams, including UP Police and Bihar SSC, where the same physical keys produce different-looking Devanagari output. This course offers 200 gamified lessons split across both layouts, starting from the Hindi home row and building up through matras (vowel signs) and half-letters, which are usually where learners struggle most. Each lesson tracks live WPM and accuracy the same way the English course does, and because the right layout depends entirely on which exam you're preparing for, it's worth checking your specific exam notification before choosing which course to start — practicing the wrong layout is a common and avoidable mistake." },
  { path: '/learn-hindi-typing/unicode', title: 'Learn Hindi Unicode (Mangal/INSCRIPT) Typing Free | FastTypingLab', description: 'Free step-by-step course to learn Hindi Unicode (Mangal/INSCRIPT) typing — the standard layout for most current government exams. Start from home row.' },
  { path: '/learn-hindi-typing/kruti-dev', title: 'Learn Kruti Dev Hindi Typing Free | FastTypingLab', description: 'Free Kruti Dev Hindi typing course for UP Police, Bihar SSC and court exams. Progressive lessons with live WPM and accuracy.' },
  { path: '/hindi-lessons', title: 'Learn Hindi Typing — INSCRIPT Course | FastTypingLab', description: 'Free 30-lesson Hindi typing course in the INSCRIPT layout. Learn key by key, earn stars, and track your progress from beginner to expert.' },
  { path: '/hindi-typing-jungle', title: 'Hindi Typing Jungle — Practice Hindi Typing | FastTypingLab', description: 'Practice Hindi typing with real articles, words and quotes in Kruti Dev or Unicode Mangal layout. Free timed Hindi typing test with live WPM and accuracy.' },
  { path: '/competitive-exam-typing', title: 'Competitive Exam Typing Practice — SSC, CPCT & More | FastTypingLab', description: 'Free typing practice for SSC CHSL, SSC CGL, CPCT, UP Police, court clerk and railway exams. Real exam duration, WPM and accuracy — in English and Hindi.', jsonLd: examFaq, intro: "Government typing exams in India each have their own speed requirement, duration and language rules, and mixing them up is one of the most common preparation mistakes. This page covers real practice formats for SSC CHSL (35 WPM English / 30 WPM Hindi, 10 minutes), SSC CGL's DEST (2,000 key depressions in 15 minutes), CPCT (Hindi Unicode Mangal, not Kruti Dev), UP Police (commonly Kruti Dev), Railway NTPC's Typing Skill Test, and court clerk and stenographer exams, among others. Each test here reproduces the exact duration and scoring method of its real exam rather than a generic timer, because a 10-minute CHSL-style test and a 15-minute CGL DEST test measure genuinely different things — one is words per minute, the other is key depressions per hour. Since exam requirements do change between notification cycles, always confirm the current speed, duration and Hindi layout (Mangal vs Kruti Dev) from your own exam's official notification before you start preparing, and use these practice tests to build toward that specific number rather than a generic target." },
  { path: '/games', title: 'Typing Games — Word Rain, Zombie & Speed Racer | FastTypingLab', description: 'Free typing games to boost your speed while having fun — Word Rain, Zombie Typing and Speed Racer. Improve WPM and accuracy through play.', intro: "Straight timed tests are the most accurate way to measure typing speed, but they're not the only useful way to build it — repetition under light game pressure trains the same finger-to-key reflexes without the mental fatigue of a formal test. FastTypingLab's eight typing games each apply that pressure differently: Word Rain has falling words you have to clear before they land, Zombie Typing and Speed Racer turn speed into survival or racing progress, and games like Ninja Slash, Space Shooter, Castle Defense and Cyber Hacker add combos, critical hits and short bursts of intensity that reward quick, accurate bursts rather than sustained typing. Every game awards XP as you play, which accumulates on your profile alongside your regular test results, so games double as a lower-pressure way to log practice time on days when a formal timed test feels like too much. They're a supplement to, not a replacement for, the timed tests and lessons elsewhere on the site — genuinely useful for building reflexes, but exam-format practice is still what best predicts real exam performance." },
  { path: '/tools', title: 'Keyboard Tools & Typing Utilities | FastTypingLab', description: 'Free typing and keyboard tools — keyboard tester, CPS test, spacebar counter, word counter, case converter and coding typing practice.', intro: "Alongside the typing tests themselves, FastTypingLab includes a set of small, focused utilities that typing practice — and exam preparation specifically — tends to need. A keyboard tester lets you check that every key on a physical or new keyboard actually registers correctly, useful before an important test session or exam. A CPS (clicks-per-second) test and spacebar counter measure click and key-press speed for a different kind of hand-speed practice. For Hindi typists, a Kruti Dev-to-Unicode converter (and the reverse) handles the common problem of text typed in one font layout needing to be readable or usable in the other — paste text in and get an instant, browser-only conversion with nothing uploaded anywhere. A word counter, case converter and code-typing practice mode round out the set for students, data-entry workers, programmers and anyone preparing for a government exam that specifies an exact character or key-depression count. Every tool runs entirely in your browser — nothing is uploaded to a server, and none of them require an account to use." },
  { path: '/blog', title: 'Typing Blog — Tips, Guides & Exam Prep | FastTypingLab', description: 'Typing tips, speed-improvement guides, government exam typing preparation, and Hindi typing tutorials from the FastTypingLab team.', intro: "The FastTypingLab blog covers the practical side of typing that a test score alone doesn't explain — how touch typing actually works and why it's faster than hunt-and-peck, correct home-row finger placement, and technique-focused guides on building speed and accuracy without just typing more and hoping it helps. A large share of the articles are exam-specific: SSC CHSL and CGL preparation, CPCT's Hindi Unicode requirements, UP Police and Kruti Dev typing, stenography and Pitman shorthand basics, and what typing speed different government exams actually require, since that number varies more than most people expect. Other articles cover typing for particular audiences — students, programmers, nurses and healthcare workers, kids just learning — plus practical reference pieces like what WPM actually means, average typing speeds by age and profession, and keyboard ergonomics to avoid wrist strain during long practice sessions. New articles are added regularly, and every one links back to the relevant free test or course on the site so you can put what you just read into practice immediately." },
  { path: '/hindi-typing-test', title: 'Hindi Typing Test — Unicode (Mangal/INSCRIPT) | FastTypingLab', description: 'Free Hindi typing test in Unicode (Mangal/INSCRIPT). Practice Devanagari typing with real-time WPM and accuracy — ideal for SSC, CPCT and government exam prep.', intro: "This is a timed Hindi typing test in Unicode Mangal (INSCRIPT) — the standard layout used by CPCT and most current central government exams, as opposed to the older Kruti Dev font layout still required by some state exams. You can choose from several real Devanagari passages and multiple test durations, and the test tracks live words-per-minute and accuracy exactly the way a real exam skill test would, so what you see here is representative of what you'll face in the actual exam. Accuracy matters more in Hindi typing than it might seem: matras (vowel signs) and conjunct half-letters are easy to mistype under time pressure, and government exams typically calculate net speed by subtracting errors from your raw WPM, so clean typing beats fast-but-sloppy typing on the scorecard. If you're not sure whether your target exam uses Mangal or Kruti Dev, check your official exam notification first — the two layouts are not interchangeable, and practicing the wrong one wastes preparation time. Use this page for regular hindi typing test practice — real hindi matter for typing test drills at increasing difficulty, similar to an advance hindi typing test, so you're not stuck retyping the same hindi typing test sample paper every time. New to the script entirely? Start with the Hindi alphabet page first." },
  { path: '/marathi-typing-test', title: 'Marathi Typing Test — Unicode (Mangal/INSCRIPT) | FastTypingLab', description: 'Free Marathi typing test in Unicode Mangal/INSCRIPT, the GCC-TBC layout. Live WPM and accuracy, plus the real MPSC Clerk-Typist speed rules.', intro: "This is a timed Marathi typing test in Unicode Mangal (INSCRIPT) — the same Devanagari keyboard layout used for Hindi, and the layout used by GCC-TBC (Government Certificate in Computer Typing Basic Course, MSCE Pune), which grades typing at 30 and 40 WPM. It's also useful for MPSC Clerk-Typist preparation, where Marathi is typically tested at around 30 WPM net (roughly 1,500 keystrokes in 10 minutes) with a 7% error limit and no backspace allowed — see the MPSC Clerk-Typist typing test guide for the full requirements. Some MPSC-track posts have historically required the legacy Remington (typewriter-style) layout instead of Unicode, so always confirm the layout your specific notification requires before you commit to practicing one over the other. Accuracy matters more in Devanagari typing than it might seem: matras (vowel signs) and conjunct half-letters are easy to mistype under time pressure, so clean typing beats fast-but-sloppy typing." },
  { path: '/kruti-dev-typing', title: 'Kruti Dev Typing Test & Guide | FastTypingLab', description: 'Free Kruti Dev Hindi typing test and guide. Practice the legacy layout used by UP Police, Bihar SSC and court exams, with live WPM and accuracy.' },
  { path: '/hindi-alphabet', title: 'Hindi Alphabet — Vowels, Consonants & Matras | FastTypingLab', description: 'The complete Hindi alphabet — 13 vowels, 33 consonants and matras, each with English transliteration. Learn the letters before Hindi typing practice.', intro: "The Hindi alphabet (हिंदी वर्णमाला) has three parts: स्वर (vowels), which can be pronounced on their own; व्यंजन (consonants), which need a vowel attached to be pronounced; and मात्रा (matras), the shortened vowel signs joined to a consonant, such as आ becoming ा in का. This page lists all 13 vowels, all 33 consonants grouped the way Hindi textbooks group them (कवर्ग, चवर्ग, टवर्ग, तवर्ग, पवर्ग and beyond), and every matra, each with its English transliteration and a short example word. It's meant as a reference for anyone learning Hindi from scratch, and it's also the natural starting point before Hindi typing practice — every key on the Mangal/INSCRIPT or Kruti Dev keyboard layout maps to one of the letters or signs listed here, so knowing the alphabet first makes the keyboard layout click much faster." },
  { path: '/typing-certificates', title: 'Free Typing Certificate — Verifiable WPM Certificate | FastTypingLab', description: 'Earn a free, verifiable typing certificate. Take a timed WPM test and download a shareable certificate of your typing speed and accuracy.' },
  { path: '/ai-tutor', title: 'AI Typing Tutor — Personalized Improvement Plan | FastTypingLab', description: 'Get a free, personalized typing plan from our AI tutor. It analyzes your WPM, accuracy and trend, then builds a plan and custom practice passage.', intro: "The AI tutor looks at your actual typing history — your average and best WPM, your accuracy, how many sessions you've logged, and whether your speed is trending up or down — rather than giving generic advice that applies to everyone equally. After you've completed at least one typing test, it analyzes that data and builds a step-by-step improvement plan: which weak areas to focus on first and a suggested daily practice routine sized to realistic time commitments. If you haven't taken a test yet, there's also a beginner starter plan available, since the personalized analysis needs at least some real typing data to work from. The goal is to replace guesswork — practicing whatever feels convenient — with a plan that's actually built around your own measured stats, updated as they change, so the plan you get this month should look different from the one you'd get after a few more weeks of practice have shifted your numbers." },
  { path: '/all-pages', title: 'Site Map — All Pages | FastTypingLab', description: 'Browse every page on FastTypingLab: typing tests, Hindi typing, exam practice, learning courses, tools, games and blog articles.' },
  { path: '/about', title: 'About FastTypingLab — Free Typing & Govt Exam Practice for India', h1: 'About FastTypingLab', description: 'FastTypingLab is a free typing platform built for India — English & Hindi tests, SSC/CPCT/UPSSSC exam practice, stenography, AI tutor and games.' },
  { path: '/download', title: 'Download Free Typing Software for Windows | FastTypingLab', description: 'Download the free FastTypingLab typing app for Windows. Practise English and Hindi typing offline, with live WPM and accuracy — great for exam prep.', jsonLd: faqLd([
    ['Is the FastTypingLab Windows app free?', 'Yes. The app is completely free, just like the website. There are no charges to download or practice.'],
    ['Does it work without internet?', 'Yes. The app ships with English and Hindi typing tests built in, so you can practise fully offline. Account features, the AI tutor and certificates need internet.'],
    ['What are the system requirements?', 'Windows 10 or 11 (64-bit). The app is lightweight — only a few megabytes — and installs in seconds.'],
  ]) },
  { path: '/kruti-dev-to-unicode', title: 'Kruti Dev to Unicode Converter — Both Ways, Free | FastTypingLab', description: 'Free Kruti Dev to Unicode and Unicode to Kruti Dev converter. Paste text, convert instantly, copy or download — runs in your browser, no signup.', jsonLd: faqLd([
    ['How do I convert Kruti Dev to Unicode?', 'Paste your Kruti Dev text, choose the Kruti Dev to Unicode direction, and the Unicode (Mangal) version appears instantly. Copy it or download it as a text file. Conversion runs in your browser, so nothing is uploaded.'],
    ['Why does Kruti Dev text look like random English letters?', 'Kruti Dev is a legacy non-Unicode font. The file stores ordinary Latin characters and the Kruti Dev font draws Devanagari shapes over them, so without that font installed the text looks like gibberish.'],
    ['Is this Kruti Dev converter free?', 'Yes, completely free with no signup and no limit, and your text never leaves your device.'],
  ]) },
  // Byte-identical duplicate of /kruti-dev-to-unicode (same FontConverterPage
  // component, no path-based branching) -- canonicalized to it rather than
  // removed, since it's live in the sitemap and may already have backlinks.
  { path: '/font-converter', title: 'Hindi Font Converter — Kruti Dev ↔ Unicode (Mangal) | FastTypingLab', description: 'Convert Hindi text between Kruti Dev and Unicode (Mangal) instantly. Free browser-based Hindi font converter — copy or download the result, no signup needed.', canonical: '/kruti-dev-to-unicode' },
  { path: '/live-test', title: 'Weekly Live Typing Test — Compete Every Sunday | FastTypingLab', description: 'Join the free weekly Live Typing Test every Sunday at 7 PM IST. Everyone types the same passage, then compares WPM on the leaderboard.', jsonLd: faqLd([
    ['When is the weekly Live Typing Test?', 'Every Sunday at 7:00 PM IST. The event window stays open for one hour, and the test itself is one minute long.'],
    ['Do I need an account to join the Live Test?', 'No. You can take the Live Test without signing up. Creating a free account means your result is saved to your profile and can appear on the leaderboard with your name.'],
    ['Does everyone type the same passage?', 'Yes — one passage per track (English, Hindi Mangal, Hindi Kruti Dev) is selected for the week, so every participant in a track types identical text and the ranking is fair.'],
  ]) },
  { path: '/typing-drills', title: 'Typing Drills — Number, Punctuation & Custom Practice | FastTypingLab', description: 'Free typing drills: number typing for 10-key & data entry (KDPH), punctuation practice, top-200 common words, and custom text mode. Live WPM.', jsonLd: faqLd([
    ['What is a 10-key or number typing drill?', 'It is focused practice on digits and numeric groups, building the speed data-entry roles and DEO exams measure in keystrokes per hour (KDPH).'],
    ['Can I practice my own text?', 'Yes — the custom text mode lets you paste any passage (exam material, legal text, transcription practice) and drill it with live WPM and accuracy.'],
  ]) },
  { path: '/refer', title: 'Invite Friends & Earn Badges | FastTypingLab Referral', description: 'Share FastTypingLab with friends preparing for SSC, CPCT and other govt typing exams. Earn Supporter, Advocate, Ambassador and Legend badges.', jsonLd: faqLd([
    ['How does the FastTypingLab referral programme work?', 'Every free account gets a personal invite link. Share it with friends, and when someone signs up through your link and completes a typing test, it counts towards your referral tier.'],
    ['What do I get for referring friends?', 'Recognition badges — Supporter at 1 referral, Advocate at 3, Ambassador at 5 and Legend at 10 — shown on your profile and dashboard, plus a mention in the monthly Telegram shout-out. There is no cash payout; FastTypingLab is completely free.'],
    ['When does a referral count?', 'A referral counts once the invited person creates a free account and finishes their first typing test. Signups on their own do not count, and an account can only ever be referred once.'],
  ]) },
  { path: '/contact', title: 'Contact FastTypingLab — Support, Feedback & Enquiries', h1: 'Get in Touch', description: 'Get in touch with the FastTypingLab team. Email us for support, feedback, bug reports, content suggestions or partnership enquiries.' },
  { path: '/privacy', title: 'Privacy Policy | FastTypingLab', description: 'How FastTypingLab collects, uses, and protects your data — account information, typing statistics, cookies, analytics and advertising.' },
  { path: '/terms', title: 'Terms of Service | FastTypingLab', description: 'The terms and conditions for using FastTypingLab — a free online typing and government-exam practice platform.' },
  { path: '/disclaimer', title: 'Disclaimer | FastTypingLab', description: 'Important disclaimers for FastTypingLab — exam information, typing results and certificates, educational content, and advertising.' },
  { path: '/cookie-policy', title: 'Cookie Policy | FastTypingLab', description: 'How FastTypingLab uses cookies and browser local storage — for sign-in, preferences, analytics and advertising — and how to control them.' },

  ...examRoutes,
  { path: '/leaderboard', title: 'Global Typing Leaderboard | FastTypingLab', description: 'See the fastest typists on FastTypingLab. Global typing speed leaderboard ranked by net WPM and accuracy.' },

  { path: '/keyboard-tester', title: 'Online Keyboard Tester — Test Every Key | FastTypingLab', description: 'Free online keyboard tester. Press any key to check it registers correctly — test your full keyboard, function keys and modifiers in the browser.' },
  { path: '/dictation-typing-test', title: 'Dictation Typing Test — Steno Transcription Practice | FastTypingLab', description: 'Free dictation typing test for stenography. Listen to a passage read at 60, 80 or 100 WPM and transcribe it — build the speed steno exams need.' },
  { path: '/embed', title: 'Free Embeddable Typing Speed Test Widget | FastTypingLab', description: 'Add a free typing speed test to your website, blog or school page — copy one line of code. Free embeddable WPM typing widget by FastTypingLab.' },
  { path: '/wpm-calculator', title: 'WPM Calculator — Free Typing Speed Calculator | FastTypingLab', description: 'Free WPM calculator. Enter characters typed, time and errors to get your gross and net typing speed and accuracy, with the formula explained.', jsonLd: faqLd([
    ['How is WPM calculated?', 'Gross WPM = (characters typed / 5) / minutes. Net WPM subtracts errors: ((characters / 5) - errors) / minutes. Typing tests count every 5 characters as one word.'],
    ['What is a good typing speed?', 'The average is about 40 WPM; 50-65 is a solid touch-typing speed, 70-90 is professional, and 100+ is top 1%. Indian govt exams usually require 30-40 WPM.'],
    ['What is the difference between gross and net WPM?', 'Gross WPM is raw speed; net WPM subtracts mistakes, so it reflects usable speed — the number that matters for exams and real work.'],
  ]) },
  { path: '/typing-statistics', title: 'Average Typing Speed in India & Worldwide | FastTypingLab', description: 'The average typing speed in India is about 35-40 WPM. See typing statistics by skill level, age, profession and country, plus Indian exam speeds.', jsonLd: faqLd([
    ['What is the average typing speed in India?', 'The average typing speed in India is around 35-40 WPM, close to the global average of about 40 WPM. Government-exam typists usually train to 30-40 WPM in English and 25-30 WPM in Hindi.'],
    ['What is the average typing speed?', 'About 40 WPM for adults on a computer keyboard. Skilled touch typists reach 55-65 WPM and professionals often type 70-90 WPM.'],
    ['What is the average typing speed by age?', 'Typing speed usually peaks between ages 20 and 35 (around 40-45 WPM) and declines gradually after that.'],
    ['What typing speed is required for Indian government exams?', 'Most Indian government typing tests require 25-40 WPM, commonly 35 WPM in English and 25-30 WPM in Hindi.'],
    ['What is a good typing accuracy?', 'Aim for 95%+ accuracy. Skilled typists usually stay between 92% and 98%.'],
  ]) },
  { path: '/cps-test', title: 'CPS Test — Clicks Per Second Test | FastTypingLab', description: 'Free CPS (clicks per second) test. Measure your click speed over 1, 5 or 10 seconds and improve your clicking rate.' },
  { path: '/spacebar-counter', title: 'Spacebar Counter — Spacebar Clicks Per Second | FastTypingLab', description: 'Free spacebar counter and spacebar speed test. Count your spacebar presses and measure spacebar clicks per second.' },
  { path: '/word-counter', title: 'Word Counter — Words, Characters & Reading Time | FastTypingLab', description: 'Free online word counter. Count words, characters, sentences and paragraphs, with estimated reading and speaking time.' },
  { path: '/case-converter', title: 'Case Converter — UPPERCASE, lowercase, Title Case | FastTypingLab', description: 'Free online case converter. Convert text to UPPERCASE, lowercase, Title Case, Sentence case and more instantly.' },
  { path: '/coding-typing', title: 'Code Typing Practice — Practice Typing Real Code | FastTypingLab', description: 'Free code typing practice for programmers. Improve your coding speed by typing real JavaScript, Python and other code snippets.' },

  { path: '/typing-test', title: 'Typing Test — Free Online WPM Test | FastTypingLab', description: 'Free online typing test. Measure your typing speed (WPM) and accuracy with 1, 2, 5 and 10-minute tests.' },
  { path: '/typing-test/1', title: '1 Minute Typing Test — Free WPM Test | FastTypingLab', description: 'Free 1-minute typing test. Quickly measure your words-per-minute (WPM) and accuracy in 60 seconds.' },
  { path: '/typing-test/2', title: '2 Minute Typing Test — Free WPM Test | FastTypingLab', description: 'Free 2-minute typing test. Measure your typing speed and accuracy over two minutes.' },
  { path: '/typing-test/3', title: '3 Minute Typing Test — Free WPM Test | FastTypingLab', description: 'Free 3-minute typing test. Measure your typing speed and accuracy with a slightly longer passage.' },
  { path: '/typing-test/5', title: '5 Minute Typing Test — Free WPM Test | FastTypingLab', description: 'Free 5-minute typing test for endurance and exam practice. Measure sustained WPM and accuracy.' },
  { path: '/typing-test/10', title: '10 Minute Typing Test — Free WPM Test | FastTypingLab', description: 'Free 10-minute typing test — the standard duration for most government exam typing tests. Measure sustained WPM and accuracy.' },
  { path: '/typing-test-for/students', title: 'Typing Test for Students — Free WPM Practice | FastTypingLab', description: 'Free typing test for students. Build typing speed and accuracy for school, college and exams.' },
  { path: '/typing-test-for/professionals', title: 'Typing Test for Professionals — Free WPM Test | FastTypingLab', description: 'Free typing test for working professionals. Improve your speed and accuracy for everyday office work.' },
  { path: '/typing-test-for/government-employees', title: 'Typing Test for Government Employees | FastTypingLab', description: 'Free typing test for government employees and aspirants. Practice exam-style passages in English and Hindi.' },
  { path: '/typing-test-for/data-entry', title: 'Data Entry Typing Test — 8000 KDPH Practice | FastTypingLab', description: 'Typing speed test for data entry jobs. Practice to achieve 40+ WPM with 95%+ accuracy required for government and private data entry posts.' },
  { path: '/typing-test-for/beginners', title: 'Typing Test for Beginners — Learn from Scratch | FastTypingLab', description: 'Start your typing journey with our beginner-friendly typing test. Learn touch typing from scratch, build finger memory, and improve your WPM.' },
  { path: '/typing-test-for/programmers', title: 'Typing Test for Programmers — Code Speed Practice | FastTypingLab', description: 'Coding-focused typing test for software developers. Practice typing code snippets, special characters, and improve your programming speed.' },

  { path: '/games/word-rain', title: 'Word Rain — Typing Game | FastTypingLab', description: 'Play Word Rain, a free typing game. Type falling words before they hit the ground to boost your speed and accuracy.' },
  { path: '/games/zombie', title: 'Zombie Typing — Typing Game | FastTypingLab', description: 'Play Zombie Typing, a free typing game. Type words to defeat zombies and improve your typing speed.' },
  { path: '/games/speed-racer', title: 'Speed Racer — Typing Game | FastTypingLab', description: 'Play Speed Racer, a free typing game. Type fast to win the race and level up your WPM.' },
  { path: '/games/ninja-slash', title: 'Ninja Slash — Typing Game | FastTypingLab', description: 'Slice flying words with lightning-fast typing. Combos, crits, slow-mo, bombs and XP — a modern typing game that makes you faster while you play.' },
  { path: '/games/space-shooter', title: 'Space Shooter — Typing Game | FastTypingLab', description: 'Blast the alien fleet by typing enemy words to fire your laser. Waves, combos, crits and XP — a modern free typing game.' },
  { path: '/games/castle-defense', title: 'Castle Defense — Typing Game | FastTypingLab', description: 'Defend your castle by typing words on approaching enemies to fire arrows. Combos, crits and XP — a free typing game.' },
  { path: '/games/cyber-hacker', title: 'Cyber Hacker — Typing Game | FastTypingLab', description: 'Breach the firewall by typing code fast in this matrix-style hacking typing game with combos, crits and XP.' },
  { path: '/race', title: 'Multiplayer Typing Race | FastTypingLab', description: 'Race friends in a real-time multiplayer typing race. Test your speed against others, live.' },

  { path: '/exam/ssc-chsl', title: 'SSC CHSL Typing Test Practice | FastTypingLab', description: 'Free SSC CHSL typing test practice in exact exam conditions — 10 minutes, English, with real WPM and accuracy scoring.' },
  { path: '/exam/ssc-cgl', title: 'SSC CGL Typing Test Practice | FastTypingLab', description: 'Free SSC CGL skill-test typing practice with real exam duration, WPM and accuracy calculation.' },
  { path: '/exam/hindi-typing', title: 'Hindi Typing Exam Practice — UP Police & CPCT | FastTypingLab', description: 'Free Hindi typing exam practice for UP Police, CPCT and court typing tests, with real WPM and accuracy.' },
  { path: '/exam/court-typing', title: 'Court Clerk & Steno Typing Test Practice | FastTypingLab', description: 'Free court clerk and stenographer typing test practice in Hindi and English exam formats.' },

  ...blogRoutes,
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
// Every prerendered page links to /all-pages/ -- a full static directory of
// every route (built below from ROUTES itself, see siteMapNav()) -- so a
// crawler that never runs JS can still reach all 114 pages by following two
// hops (this page -> /all-pages/ -> anywhere) instead of only the 10 hub
// pages below. Before this, only these 10 fixed links existed in the raw
// HTML of every single page, which is why Semrush found ~97 pages in
// sitemap.xml with zero discoverable inbound links (site audit, Sep 2026).
const NAV = [
  ['/', 'Home'], ['/tests/', 'Typing Tests'], ['/learn/', 'Learn Typing'],
  ['/learn-hindi-typing/', 'Learn Hindi Typing'], ['/hindi-typing-test/', 'Hindi Typing Test'],
  ['/competitive-exam-typing/', 'Exam Typing'], ['/games/', 'Typing Games'],
  ['/tools/', 'Tools'], ['/ai-tutor/', 'AI Tutor'], ['/blog/', 'Blog'],
  ['/all-pages/', 'All Pages'],
];

// Buckets every ROUTES path into a simple category for the /all-pages/
// directory, so it reads as a real site map rather than a flat dump. Driven
// entirely by ROUTES itself (the same list index/canonical/etc. use), so it
// can never drift out of sync with the real site the way a hand-maintained
// list (like the old SiteMapPage.tsx SECTIONS) can.
function classify(path) {
  if (path === '/') return 'Home';
  if (path.startsWith('/blog/')) return 'Blog Articles';
  if (path.startsWith('/exam/') || path.endsWith('-typing-test')) return 'Government Exam Typing Tests';
  if (path === '/games' || path.startsWith('/games/') || path === '/race') return 'Typing Games';
  if (path.startsWith('/learn') || path.startsWith('/hindi-lessons') || path.startsWith('/hindi-typing-jungle') || path === '/hindi-alphabet') return 'Learn Typing';
  if (path.startsWith('/typing-test')) return 'Typing Tests';
  if (['/tools', '/keyboard-tester', '/cps-test', '/spacebar-counter', '/word-counter', '/case-converter', '/coding-typing', '/wpm-calculator', '/kruti-dev-to-unicode', '/font-converter', '/typing-statistics', '/dictation-typing-test', '/typing-drills'].includes(path)) return 'Tools & Utilities';
  if (['/about', '/contact', '/privacy', '/terms', '/disclaimer', '/cookie-policy'].includes(path)) return 'Company';
  return 'More Pages';
}

// Full static site directory for /all-pages/ -- every ROUTES entry, grouped,
// as real <a href> tags in the raw HTML (not just the 10-link NAV every
// other page gets). This is what actually resolves the orphaned-pages
// finding: any of the 97 is now two static hops from any page on the site.
function siteMapSections() {
  const groups = new Map();
  for (const rt of ROUTES) {
    if (rt.path === '/all-pages') continue;
    const cat = classify(rt.path);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push({ href: rt.path === '/' ? '/' : `${rt.path}/`, label: String(rt.title).split('|')[0].trim() });
  }
  const ORDER = ['Home', 'Typing Tests', 'Learn Typing', 'Government Exam Typing Tests', 'Typing Games', 'Tools & Utilities', 'Blog Articles', 'Company', 'More Pages'];
  return ORDER.filter((cat) => groups.has(cat)).map((cat) => ({ title: cat, links: groups.get(cat) }));
}

// Bake a real <h1>, intro and nav into the otherwise-empty <body>. The SPA uses
// createRoot(), which replaces #root on mount, so users still get the full app —
// but crawlers without JS now see a proper headline and body content.
function injectBody(html, r) {
  const h1 = r.h1 || String(r.title).split('|')[0].trim();
  if (h1 === r.title) console.warn(`prerender-seo: h1 equals full title for ${r.path} -- add an explicit "h1" field to avoid a duplicate H1/title tag.`);
  const links = NAV.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join(' &middot; ');
  const intro = r.intro
    ? r.intro.split('\n\n').map((para) => `<p style="color:#334155;margin:0 0 22px;max-width:760px">${esc(para)}</p>`).join('')
    : '';
  const directory = r.path === '/all-pages'
    ? siteMapSections().map((sec) =>
        `<h2 style="font-size:1.1rem;font-weight:700;margin:20px 0 8px">${esc(sec.title)}</h2>` +
        `<ul style="margin:0 0 4px;padding-left:0;list-style:none">${sec.links.map((l) => `<li style="margin:2px 0"><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>`
      ).join('')
    : '';
  const body =
    '<div id="root"><div data-prerender="seo" style="max-width:1100px;margin:0 auto;padding:40px 20px;font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#0f172a">' +
    `<h1 style="font-size:1.9rem;font-weight:800;margin:0 0 12px">${esc(h1)}</h1>` +
    `<p style="color:#475569;margin:0 0 22px;max-width:700px">${esc(r.description)}</p>` +
    intro +
    directory +
    `<nav style="font-size:.95rem;color:#2A6A78">${links}</nav>` +
    '</div></div>';
  return html.replace('<div id="root"></div>', body);
}

let written = 0;
for (const r of ROUTES) {
  // GitHub Pages serves dist/<path>/index.html and 301-redirects /path -> /path/,
  // so the canonical must use the trailing-slash form it actually serves.
  const url = `${SITE}${r.path === '/' ? '/' : r.path + '/'}`;
  // r.canonical lets a duplicate page point its canonical tag at the
  // preferred URL instead of itself (e.g. /font-converter -> /kruti-dev-to-unicode),
  // telling Google which one to index without 404ing or losing any backlinks.
  const canonicalUrl = r.canonical ? `${SITE}${r.canonical}/` : url;
  const type = r.type || 'website';
  let html = TEMPLATE;
  html = setTitle(html, r.title);
  html = setNamedMeta(html, 'description', r.description);
  html = setCanonical(html, canonicalUrl);
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

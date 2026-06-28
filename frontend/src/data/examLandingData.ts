// Dedicated SEO landing pages for high-intent exam-typing searches
// (e.g. "ssc chsl typing test online"). Each has unique content + a CTA into
// the real practice test, and is prerendered with its own meta + FAQ schema.

export interface ExamLanding {
  slug: string;            // route slug, e.g. 'ssc-chsl' -> /ssc-chsl-typing-test
  examName: string;
  h1: string;
  seoTitle: string;
  metaDesc: string;
  eyebrow: string;
  intro: string;
  requirements: { language: string; layout: string; speed: string; duration: string }[];
  format: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
  practiceHref: string;
  practiceLabel: string;
  related: { label: string; href: string }[];
}

export const EXAM_LANDINGS: Record<string, ExamLanding> = {
  'ssc-chsl': {
    slug: 'ssc-chsl',
    examName: 'SSC CHSL',
    h1: 'SSC CHSL Typing Test — Free Online Practice',
    seoTitle: 'SSC CHSL Typing Test Online — Free Practice & Speed | FastTypingLab',
    metaDesc: 'Free SSC CHSL typing test practice online. 35 WPM English / 30 WPM Hindi in 10 minutes, with live WPM and accuracy. Prepare for the LDC & DEO skill test.',
    eyebrow: 'SSC CHSL Skill Test',
    intro: 'The SSC CHSL typing test is the qualifying skill test for Lower Division Clerk (LDC) and Data Entry Operator posts. It is qualifying in nature — it does not add to your merit score, but you must clear it to be selected. The best preparation is practicing on a real keyboard in the exact 10-minute exam format.',
    requirements: [
      { language: 'English', layout: 'QWERTY', speed: '35 WPM (~10,500 KDPH)', duration: '10 minutes' },
      { language: 'Hindi', layout: 'Kruti Dev / Mangal', speed: '30 WPM (~9,000 KDPH)', duration: '10 minutes' },
    ],
    format: [
      'A printed English or Hindi passage is shown and you type it on the computer.',
      'Duration is 10 minutes; speed is measured in words per minute (1 word = 5 key depressions).',
      'Errors reduce your effective speed, so accuracy is as important as raw speed.',
      'No part of the test rewards reckless speed — clean typing wins.',
    ],
    tips: [
      'Practice the full 10-minute format, not just 1-minute tests — stamina matters.',
      'Aim for 40+ WPM in practice so exam nerves never pull you below the 35 cut-off.',
      'Use formal, government-style passages; the vocabulary differs from casual text.',
      'Never look at the keyboard — touch typing is the only way past ~35 WPM.',
    ],
    faqs: [
      { q: 'What is the typing speed required for SSC CHSL?', a: 'You need 35 WPM in English or 30 WPM in Hindi, typed over a 10-minute period. Aim for 40+ WPM in practice to keep a safe margin.' },
      { q: 'Is the SSC CHSL typing test qualifying or scored?', a: 'It is qualifying only — it does not add to your merit, but you must pass it to be selected for LDC/DEO posts.' },
      { q: 'Can I practice the SSC CHSL typing test for free?', a: 'Yes. FastTypingLab offers a free 10-minute SSC CHSL-style typing test in English and Hindi with live WPM and accuracy.' },
    ],
    practiceHref: '/exam/ssc-chsl',
    practiceLabel: 'Start SSC CHSL Practice Test',
    related: [
      { label: 'SSC CGL DEST Test', href: '/ssc-cgl-typing-test' },
      { label: 'Learn Hindi Typing', href: '/learn-hindi-typing' },
      { label: 'All Exam Typing', href: '/competitive-exam-typing' },
    ],
  },

  'ssc-cgl': {
    slug: 'ssc-cgl',
    examName: 'SSC CGL DEST',
    h1: 'SSC CGL DEST Typing Test — Free Practice',
    seoTitle: 'SSC CGL DEST Typing Test Online — Free Practice | FastTypingLab',
    metaDesc: 'Free SSC CGL DEST (Data Entry Skill Test) practice. Type 2,000 key depressions in 15 minutes (~8,000 KDPH) with live speed and accuracy tracking.',
    eyebrow: 'SSC CGL DEST',
    intro: 'The SSC CGL Data Entry Skill Test (DEST) is required for the post of Tax Assistant. Unlike CHSL, it measures key depressions over 15 minutes rather than WPM directly. Practicing the exact format builds the sustained accuracy this test rewards.',
    requirements: [
      { language: 'English', layout: 'QWERTY', speed: '2,000 key depressions (~8,000 KDPH)', duration: '15 minutes' },
    ],
    format: [
      'You type a given English passage on the computer for 15 minutes.',
      'The benchmark is 2,000 key depressions in 15 minutes (about 8,000 per hour).',
      'That works out to roughly 27–35 WPM sustained for the full duration.',
      'Consistency over 15 minutes matters more than short bursts of speed.',
    ],
    tips: [
      'Build endurance — 15 minutes of focused typing is longer than it feels.',
      'Target 35+ WPM so you clear 2,000 depressions comfortably.',
      'Keep accuracy high; corrections eat into your key-depression count.',
      'Practice on the same kind of formal English passages used in the exam.',
    ],
    faqs: [
      { q: 'What is the SSC CGL DEST requirement?', a: 'You must type 2,000 key depressions in 15 minutes (about 8,000 per hour), roughly 27–35 WPM sustained, for the Tax Assistant post.' },
      { q: 'Is DEST the same as the CHSL typing test?', a: 'No. CHSL measures WPM over 10 minutes; CGL DEST measures key depressions over 15 minutes. The skills overlap, but practice the correct format.' },
      { q: 'How can I practice SSC CGL DEST online free?', a: 'Use the free SSC CGL practice test on FastTypingLab, which replicates the 15-minute format with live speed and accuracy.' },
    ],
    practiceHref: '/exam/ssc-cgl',
    practiceLabel: 'Start SSC CGL DEST Practice',
    related: [
      { label: 'SSC CHSL Typing Test', href: '/ssc-chsl-typing-test' },
      { label: 'Typing Speed Test', href: '/tests' },
      { label: 'All Exam Typing', href: '/competitive-exam-typing' },
    ],
  },

  'cpct': {
    slug: 'cpct',
    examName: 'MP CPCT',
    h1: 'CPCT Typing Test — Free Hindi & English Practice',
    seoTitle: 'CPCT Typing Test Online — Free Hindi & English Practice | FastTypingLab',
    metaDesc: 'Free MP CPCT typing test practice in Hindi (Mangal/Unicode) and English. Build the speed and accuracy needed for the CPCT score card, with live tracking.',
    eyebrow: 'MP CPCT',
    intro: 'The MP CPCT (Computer Proficiency Certification Test) includes a typing skill section in both English and Hindi, and a valid score card is required for many Madhya Pradesh government posts. Importantly, CPCT uses the Unicode Mangal (INSCRIPT) layout for Hindi — not Kruti Dev — so practice on the layout the exam actually uses.',
    requirements: [
      { language: 'English', layout: 'QWERTY', speed: '30 WPM', duration: 'Timed section' },
      { language: 'Hindi', layout: 'Mangal (Unicode / INSCRIPT)', speed: '20–30 WPM', duration: 'Timed section' },
    ],
    format: [
      'Separate typing passages for English and Hindi.',
      'Hindi uses the Unicode Mangal / INSCRIPT layout (built into Windows).',
      'Net speed is calculated after subtracting errors, so accuracy raises your score.',
      'Your CPCT score card reflects the speed you achieve in each language.',
    ],
    tips: [
      'Practice Mangal / INSCRIPT, not Kruti Dev — CPCT uses Unicode.',
      'Master Hindi matras and half-letters; they slow most candidates down.',
      'Do one English and one Hindi timed test every day.',
      'Use all ten fingers and avoid looking at the keyboard.',
    ],
    faqs: [
      { q: 'Which Hindi layout does CPCT use — Kruti Dev or Mangal?', a: 'CPCT uses the Unicode Mangal (INSCRIPT) layout, not Kruti Dev. Practice on Mangal/INSCRIPT for accurate preparation.' },
      { q: 'What typing speed is needed for CPCT?', a: 'Around 30 WPM in English and 20–30 WPM in Hindi, with net speed calculated after errors.' },
      { q: 'Where can I practice CPCT typing free?', a: 'FastTypingLab offers free Hindi Unicode (Mangal) and English typing tests plus a step-by-step Learn Hindi Typing course.' },
    ],
    practiceHref: '/hindi-typing-test',
    practiceLabel: 'Start Hindi (Mangal) Practice',
    related: [
      { label: 'Learn Hindi Typing', href: '/learn-hindi-typing' },
      { label: 'Hindi Typing Test', href: '/hindi-typing-test' },
      { label: 'All Exam Typing', href: '/competitive-exam-typing' },
    ],
  },

  'up-police': {
    slug: 'up-police',
    examName: 'UP Police',
    h1: 'UP Police Typing Test — Free Hindi Practice',
    seoTitle: 'UP Police Typing Test Online — Free Hindi Practice | FastTypingLab',
    metaDesc: 'Free UP Police typing test practice for Computer Operator & Clerk posts. Hindi (Kruti Dev / Mangal) and English, with live WPM and accuracy tracking.',
    eyebrow: 'UP Police',
    intro: 'The UP Police typing test is part of the selection for Computer Operator, Clerk and Steno posts. It typically requires Hindi typing, and many UP state exams still use the Kruti Dev layout, so confirm your notification and practice the right one. Daily timed practice on a physical keyboard is the fastest route to the required speed.',
    requirements: [
      { language: 'Hindi', layout: 'Kruti Dev / Mangal', speed: '25–30 WPM', duration: 'Timed section' },
      { language: 'English', layout: 'QWERTY', speed: '~30 WPM', duration: 'Timed section' },
    ],
    format: [
      'A Hindi (and sometimes English) passage is typed on the computer.',
      'Many UP state posts still use the Kruti Dev font layout — check your notification.',
      'Speed and accuracy are both assessed; corrections cost you time.',
      'Exact speed requirements vary by post, so prepare comfortably above the minimum.',
    ],
    tips: [
      'Confirm whether your post needs Kruti Dev or Mangal, then practice that layout.',
      'Aim for 30+ WPM in Hindi to clear the typical 25 WPM bar with margin.',
      'Drill the Hindi characters and matras that slow you down.',
      'Practice daily in the exact timed format to build exam stamina.',
    ],
    faqs: [
      { q: 'What typing speed is required for UP Police?', a: 'Most UP Police Computer Operator/Clerk posts require around 25–30 WPM in Hindi. Aim for 30+ WPM to clear it comfortably.' },
      { q: 'Does UP Police typing use Kruti Dev or Mangal?', a: 'Many UP state exams still use Kruti Dev, while some use Mangal/Unicode. Always check your specific exam notification and practice that layout.' },
      { q: 'How do I practice UP Police typing test free?', a: 'FastTypingLab offers free Kruti Dev and Hindi Unicode typing practice with live WPM and accuracy.' },
    ],
    practiceHref: '/kruti-dev-typing',
    practiceLabel: 'Start Kruti Dev Practice',
    related: [
      { label: 'Kruti Dev Typing', href: '/kruti-dev-typing' },
      { label: 'Learn Hindi Typing', href: '/learn-hindi-typing' },
      { label: 'All Exam Typing', href: '/competitive-exam-typing' },
    ],
  },

  'railway-ntpc': {
    slug: 'railway-ntpc',
    examName: 'Railway NTPC',
    h1: 'Railway NTPC Typing Test — Free Practice',
    seoTitle: 'Railway NTPC Typing Test Online — Free Practice | FastTypingLab',
    metaDesc: 'Free RRB Railway NTPC typing skill test practice. English (30 WPM) and Hindi (25 WPM) typing with live WPM and accuracy for the Typing Skill Test (TST).',
    eyebrow: 'RRB NTPC',
    intro: 'The RRB Railway NTPC Typing Skill Test (TST) is a qualifying stage for posts such as Junior Clerk, Accounts Clerk and Typist. Candidates must type at the required speed in English or Hindi on a computer. As a qualifying test, clearing it reliably matters more than raw top speed — practice the exact format until it feels comfortable.',
    requirements: [
      { language: 'English', layout: 'QWERTY', speed: '30 WPM', duration: 'Skill test' },
      { language: 'Hindi', layout: 'Mangal / Kruti Dev', speed: '25 WPM', duration: 'Skill test' },
    ],
    format: [
      'You type a given passage on the computer at the required speed.',
      'English requires about 30 WPM; Hindi about 25 WPM.',
      'The test is qualifying — you must meet the speed to be selected.',
      'Accuracy counts; corrections reduce your effective speed.',
    ],
    tips: [
      'Pick your language early and practice only that one to build muscle memory.',
      'Target 35+ WPM English or 30+ WPM Hindi so you clear the bar comfortably.',
      'Practice formal passages similar to railway/clerical documents.',
      'Type daily in the full skill-test format to build stamina and consistency.',
    ],
    faqs: [
      { q: 'What is the typing speed required for Railway NTPC?', a: 'The RRB NTPC typing skill test requires about 30 WPM in English or 25 WPM in Hindi on a computer.' },
      { q: 'Is the Railway NTPC typing test qualifying?', a: 'Yes, the Typing Skill Test (TST) is qualifying in nature — you must meet the speed to be selected, but it is not added to your merit score.' },
      { q: 'Can I practice Railway NTPC typing free?', a: 'Yes. FastTypingLab offers free English and Hindi typing tests with live WPM and accuracy to prepare for the NTPC skill test.' },
    ],
    practiceHref: '/tests',
    practiceLabel: 'Start Typing Practice Test',
    related: [
      { label: 'Typing Speed Test', href: '/tests' },
      { label: 'SSC CHSL Typing Test', href: '/ssc-chsl-typing-test' },
      { label: 'All Exam Typing', href: '/competitive-exam-typing' },
    ],
  },

  'court': {
    slug: 'court',
    examName: 'Court / Steno',
    h1: 'Court & Steno Typing Test — Free Practice',
    seoTitle: 'Court & Stenographer Typing Test Online — Free Practice | FastTypingLab',
    metaDesc: 'Free court clerk and stenographer typing test practice in Hindi and English. Practice legal-format passages with live WPM and accuracy for high court & district court exams.',
    eyebrow: 'Court / Stenographer',
    intro: 'District and High Court clerk, typist and stenographer posts include a typing test, usually in Hindi and sometimes English. Court passages use formal, legal-style language — petitions, affidavits and orders — so practicing real exam-style text matters as much as raw speed. Stenographer posts require higher speeds than clerical posts.',
    requirements: [
      { language: 'Hindi', layout: 'Kruti Dev / Mangal', speed: '25–30 WPM (clerk)', duration: 'Skill test' },
      { language: 'English', layout: 'QWERTY', speed: '30–40 WPM', duration: 'Skill test' },
    ],
    format: [
      'A formal Hindi or English passage is typed on the computer.',
      'Court vocabulary is legal and formal — practice that style, not casual text.',
      'Clerk/typist posts need ~25–30 WPM; stenographer posts need higher speeds.',
      'Layout varies by state court — confirm Kruti Dev vs Mangal from the notification.',
    ],
    tips: [
      'Practice legal-format passages so the formal vocabulary feels natural.',
      'Confirm your court uses Kruti Dev or Mangal, then drill that layout.',
      'For steno posts, build speed well above the clerk minimum.',
      'Keep accuracy high — legal text leaves little room for typos.',
    ],
    faqs: [
      { q: 'What typing speed is required for court clerk / typist posts?', a: 'Most district/high court clerk and typist posts require around 25–30 WPM in Hindi or English. Stenographer posts require higher speeds.' },
      { q: 'Which layout do court typing tests use?', a: 'It depends on the state court — some use Kruti Dev, others Mangal/Unicode. Always check your exam notification and practice that layout.' },
      { q: 'How can I practice court typing test free?', a: 'FastTypingLab offers free Hindi (Kruti Dev and Mangal) and English typing practice with live WPM and accuracy.' },
    ],
    practiceHref: '/exam/hindi-typing',
    practiceLabel: 'Start Hindi Typing Practice',
    related: [
      { label: 'Learn Hindi Typing', href: '/learn-hindi-typing' },
      { label: 'Kruti Dev Typing', href: '/kruti-dev-typing' },
      { label: 'All Exam Typing', href: '/competitive-exam-typing' },
    ],
  },
};

export const EXAM_LANDING_ROUTES = Object.values(EXAM_LANDINGS).map(e => ({
  path: `/${e.slug}-typing-test`,
  slug: e.slug,
}));

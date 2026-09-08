// Category-tagged topic pool for automatic test generation.
// Extends the original flat TOPICS array (kept verbatim below, category-tagged)
// with the remaining categories from the spec (Space, Sports, Geography,
// Current Affairs, Cyber Security, Agriculture, Education, Government Schemes,
// Business, Travel). Recent-topic dedup is now tracked PER LANGUAGE so English
// and Hindi generation don't compete for the same recent-topic window.

export const TOPICS = [
  // Technology
  { topic: 'artificial intelligence in healthcare', category: 'Technology' },
  { topic: 'quantum computing breakthroughs', category: 'Technology' },
  { topic: 'cybersecurity threats 2025', category: 'Cyber Security' },
  { topic: 'electric vehicles future', category: 'Technology' },
  { topic: 'blockchain real-world uses', category: 'Technology' },
  { topic: 'robotics in manufacturing', category: 'Technology' },
  { topic: '5G technology impact', category: 'Technology' },
  { topic: 'augmented reality education', category: 'Education' },
  { topic: 'self-driving cars progress', category: 'Technology' },
  { topic: 'open source AI models', category: 'Artificial Intelligence' },
  { topic: 'cloud computing trends', category: 'Technology' },
  { topic: 'internet of things smart cities', category: 'Technology' },
  { topic: 'machine learning drug discovery', category: 'Artificial Intelligence' },

  // Science & Environment
  { topic: 'climate change solutions', category: 'Environment' },
  { topic: 'renewable energy innovations', category: 'Environment' },
  { topic: 'ocean plastic pollution', category: 'Environment' },
  { topic: 'space exploration Mars mission', category: 'Space' },
  { topic: 'gene editing CRISPR therapy', category: 'Science' },
  { topic: 'biodiversity loss crisis', category: 'Environment' },
  { topic: 'deep sea discoveries', category: 'Science' },
  { topic: 'solar energy record efficiency', category: 'Environment' },
  { topic: 'nuclear fusion energy breakthrough', category: 'Science' },
  { topic: 'microplastics human body effects', category: 'Health' },
  { topic: 'reforestation carbon capture', category: 'Environment' },

  // Health & Lifestyle
  { topic: 'mental health awareness teens', category: 'Health' },
  { topic: 'benefits of daily exercise', category: 'Health' },
  { topic: 'sleep science research', category: 'Health' },
  { topic: 'plant-based diet health', category: 'Health' },
  { topic: 'meditation and brain health', category: 'Health' },
  { topic: 'microbiome gut health', category: 'Health' },
  { topic: 'longevity research aging', category: 'Health' },
  { topic: 'vaccine technology advances', category: 'Health' },
  { topic: 'wearable health technology', category: 'Health' },
  { topic: 'air quality health effects', category: 'Health' },
  { topic: 'childhood obesity prevention', category: 'Health' },

  // Society & Education
  { topic: 'online learning future education', category: 'Education' },
  { topic: 'financial literacy youth', category: 'Education' },
  { topic: 'urban farming cities', category: 'Agriculture' },
  { topic: 'women in STEM fields', category: 'Education' },
  { topic: 'gig economy workers rights', category: 'Business' },
  { topic: 'homeschooling trends', category: 'Education' },
  { topic: 'social media mental health teens', category: 'Health' },
  { topic: 'volunteering community benefits', category: 'Education' },
  { topic: 'public transportation future cities', category: 'Geography' },
  { topic: 'universal basic income debate', category: 'Finance' },

  // History & Culture
  { topic: 'ancient civilizations discoveries', category: 'History' },
  { topic: 'cultural heritage preservation', category: 'History' },
  { topic: 'history of printing press impact', category: 'History' },
  { topic: 'evolution of human language', category: 'History' },
  { topic: 'forgotten women in history', category: 'History' },
  { topic: 'sport as cultural diplomacy', category: 'Sports' },
  { topic: 'music influence on society', category: 'History' },
  { topic: 'street art urban culture', category: 'History' },

  // Economy & Business
  { topic: 'startup ecosystem emerging markets', category: 'Business' },
  { topic: 'remote work productivity research', category: 'Business' },
  { topic: 'sustainable business practices', category: 'Business' },
  { topic: 'supply chain resilience', category: 'Business' },
  { topic: 'circular economy examples', category: 'Environment' },
  { topic: 'green hydrogen economy', category: 'Environment' },
  { topic: 'future of retail shopping', category: 'Business' },
  { topic: 'AI replacing jobs debate', category: 'Artificial Intelligence' },
  { topic: 'women in leadership business', category: 'Business' },
  { topic: 'small business recovery pandemic', category: 'Business' },

  // Nature & Animals
  { topic: 'endangered species conservation', category: 'Wildlife' },
  { topic: 'coral reef restoration', category: 'Wildlife' },
  { topic: 'wolf reintroduction ecology', category: 'Wildlife' },
  { topic: 'urban wildlife coexistence', category: 'Wildlife' },
  { topic: 'insect population decline', category: 'Wildlife' },
  { topic: 'reforestation success stories', category: 'Environment' },
  { topic: 'animal intelligence research', category: 'Wildlife' },
  { topic: 'rewilding projects Europe', category: 'Wildlife' },
  { topic: 'marine protected areas', category: 'Wildlife' },
  { topic: 'elephant conservation Africa', category: 'Wildlife' },

  // Space
  { topic: 'James Webb telescope discoveries', category: 'Space' },
  { topic: 'private space tourism industry', category: 'Space' },
  { topic: 'search for exoplanets', category: 'Space' },
  { topic: 'India ISRO Chandrayaan missions', category: 'Space' },

  // Sports
  { topic: 'Olympic Games host city impact', category: 'Sports' },
  { topic: 'sports analytics data science', category: 'Sports' },
  { topic: 'women cricket growth India', category: 'Sports' },
  { topic: 'esports rise as a profession', category: 'Sports' },

  // Geography
  { topic: 'river systems of India', category: 'Geography' },
  { topic: 'monsoon patterns south asia', category: 'Geography' },
  { topic: 'urbanization and city planning', category: 'Geography' },
  { topic: 'desertification and land use', category: 'Geography' },

  // Current Affairs
  { topic: 'global trade agreements impact', category: 'Current Affairs' },
  { topic: 'renewable energy policy shifts', category: 'Current Affairs' },
  { topic: 'digital privacy regulations worldwide', category: 'Current Affairs' },
  { topic: 'global food security challenges', category: 'Current Affairs' },

  // Finance
  { topic: 'digital payments growth India', category: 'Finance' },
  { topic: 'inflation and household budgets', category: 'Finance' },
  { topic: 'cryptocurrency regulation debate', category: 'Finance' },
  { topic: 'financial inclusion rural India', category: 'Finance' },

  // Cyber Security
  { topic: 'ransomware attacks on businesses', category: 'Cyber Security' },
  { topic: 'data breach prevention strategies', category: 'Cyber Security' },
  { topic: 'phishing awareness training', category: 'Cyber Security' },

  // Agriculture
  { topic: 'precision farming technology', category: 'Agriculture' },
  { topic: 'organic farming growth India', category: 'Agriculture' },
  { topic: 'crop resilience climate change', category: 'Agriculture' },

  // Government Schemes
  { topic: 'digital India initiative progress', category: 'Government Schemes' },
  { topic: 'skill development schemes youth', category: 'Government Schemes' },
  { topic: 'rural employment guarantee programs', category: 'Government Schemes' },

  // Travel
  { topic: 'sustainable tourism growth', category: 'Travel' },
  { topic: 'heritage site conservation tourism', category: 'Travel' },
  { topic: 'rise of remote-work travel', category: 'Travel' },
];

/**
 * Exam-syllabus topics — passages drawn from the General Awareness syllabus
 * that SSC / CPCT / UPSSSC / state-clerk exams actually test. The point is
 * that a candidate practising typing on these is simultaneously revising GK
 * they need anyway: typing practice and exam prep in the same sitting.
 * Kept as a separate, tagged pool so generation can deliberately bias toward
 * it (see getRandomTopic) and so the frontend can surface these as a track.
 */
export const EXAM_GK_TOPICS = [
  // Indian Polity & Constitution
  { topic: 'the Preamble of the Indian Constitution and its values', category: 'GK — Polity' },
  { topic: 'Fundamental Rights guaranteed by the Indian Constitution', category: 'GK — Polity' },
  { topic: 'Directive Principles of State Policy explained', category: 'GK — Polity' },
  { topic: 'powers and functions of the President of India', category: 'GK — Polity' },
  { topic: 'how Parliament of India makes laws', category: 'GK — Polity' },
  { topic: 'the Supreme Court of India and judicial review', category: 'GK — Polity' },
  { topic: 'Panchayati Raj and local self government in India', category: 'GK — Polity' },
  { topic: 'the Election Commission of India and its functions', category: 'GK — Polity' },
  { topic: 'centre state relations in the Indian federal system', category: 'GK — Polity' },

  // Modern Indian History & Freedom Movement
  { topic: 'the Revolt of 1857 and its causes', category: 'GK — History' },
  { topic: 'Mahatma Gandhi and the Non Cooperation Movement', category: 'GK — History' },
  { topic: 'the Quit India Movement of 1942', category: 'GK — History' },
  { topic: 'the Indian National Congress early years', category: 'GK — History' },
  { topic: 'Subhas Chandra Bose and the Indian National Army', category: 'GK — History' },
  { topic: 'social reform movements in nineteenth century India', category: 'GK — History' },
  { topic: 'the partition of Bengal and the Swadeshi movement', category: 'GK — History' },
  { topic: 'Maurya empire and the reign of Ashoka', category: 'GK — History' },
  { topic: 'the Indus Valley Civilisation and its town planning', category: 'GK — History' },

  // Geography of India
  { topic: 'major rivers of India and their tributaries', category: 'GK — Geography' },
  { topic: 'the Himalayan mountain ranges and their divisions', category: 'GK — Geography' },
  { topic: 'monsoon system and rainfall distribution in India', category: 'GK — Geography' },
  { topic: 'soil types found across India', category: 'GK — Geography' },
  { topic: 'national parks and wildlife sanctuaries of India', category: 'GK — Geography' },
  { topic: 'mineral resources and mining regions of India', category: 'GK — Geography' },
  { topic: 'states union territories and their capitals', category: 'GK — Geography' },

  // Indian Economy
  { topic: 'the Reserve Bank of India and monetary policy', category: 'GK — Economy' },
  { topic: 'Goods and Services Tax structure in India', category: 'GK — Economy' },
  { topic: 'five year plans and NITI Aayog', category: 'GK — Economy' },
  { topic: 'banking sector reforms and financial inclusion', category: 'GK — Economy' },
  { topic: 'agriculture subsidies and minimum support price', category: 'GK — Economy' },
  { topic: 'inflation types and how it is measured in India', category: 'GK — Economy' },

  // General Science for exams
  { topic: 'human digestive system and its organs', category: 'GK — Science' },
  { topic: 'Newton laws of motion with everyday examples', category: 'GK — Science' },
  { topic: 'photosynthesis and its importance', category: 'GK — Science' },
  { topic: 'the periodic table and classification of elements', category: 'GK — Science' },
  { topic: 'human circulatory system and the heart', category: 'GK — Science' },
  { topic: 'sources of energy renewable and non renewable', category: 'GK — Science' },
  { topic: 'vitamins deficiency diseases and nutrition', category: 'GK — Science' },

  // Static GK & Awareness
  { topic: 'important national symbols of India', category: 'GK — Static' },
  { topic: 'major dance forms and festivals of India', category: 'GK — Static' },
  { topic: 'famous historical monuments of India', category: 'GK — Static' },
  { topic: 'important days and their significance', category: 'GK — Static' },
  { topic: 'major awards and honours in India', category: 'GK — Static' },
  { topic: 'United Nations and its principal organs', category: 'GK — Static' },
  { topic: 'major government welfare schemes and beneficiaries', category: 'GK — Static' },
];

// Share of generated tests that should come from the exam-syllabus pool.
// Hindi tracks lean harder into it because that audience is almost entirely
// government-exam aspirants; English keeps a wider general-interest mix.
const EXAM_BIAS = { hi: 0.55, en: 0.3 };

// recentTopics tracked per language so English/Hindi generation never starve
// each other's pool within the same day.
const recentByLang = { en: new Set(), hi: new Set() };

export function getRandomTopic(lang = 'en') {
  const recent = recentByLang[lang] || (recentByLang[lang] = new Set());

  // Bias a share of generations toward the exam-syllabus pool so daily content
  // doubles as General Awareness revision. Falls back to the general pool if
  // every exam topic is already in the recent window.
  const bias = EXAM_BIAS[lang] ?? EXAM_BIAS.en;
  const useExamPool = Math.random() < bias;
  const sourcePool = useExamPool ? EXAM_GK_TOPICS : TOPICS;

  const available = sourcePool.filter(t => !recent.has(t.topic));
  const fallback = TOPICS.filter(t => !recent.has(t.topic));
  const pool = available.length > 0 ? available : (fallback.length > 0 ? fallback : TOPICS);
  const choice = pool[Math.floor(Math.random() * pool.length)];
  recent.add(choice.topic);
  if (recent.size > 30) {
    const first = recent.values().next().value;
    recent.delete(first);
  }
  return choice; // { topic, category }
}

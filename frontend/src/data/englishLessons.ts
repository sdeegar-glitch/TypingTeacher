// Single source of truth for the English touch-typing course.
// Both the course map (LearningCoursePage) and the typing interface
// (LearningInterfacePage) read from here, so titles and content never diverge.

export interface EnglishLesson {
  id: number;
  title: string;
  content: string;
  minWpm: number;
}

// Home row -> top row -> bottom row -> bigrams -> words -> sentences -> paragraphs.
const CURRICULUM: [title: string, content: string][] = [
  // ── Home row (1–5) ──
  ['The f and j keys', 'fff jjj ff jj fj jf ffjj ffjj fjfj fff jjj fjf jfj f j f j ff jj ff jj fjf jfj'],
  ['The d and k keys', 'ddd kkk dd kk dk kd ddd kkk dkd kdk d k d k dd kk dd kk ddd kkk dkd kdk d k d k dd kk'],
  ['The s and l keys', 'sss lll ss ll sl ls sss lll sls lsl s l s l ss ll ss ll sss lll sls lsl s l s l ss ll'],
  ['The a and ; keys', 'aaa ;;; aa ;; a; ;a aaa ;;; a;a ;a; a ; a ; aa ;; aa ;; aaa ;;; a;a ;a; a ; a ; aa ;;'],
  ['Home Row Basics', 'asdf jkl; asdf jkl; a s d f j k l ; sad lad ask fall lass flask salad; alfalfa dad; all'],
  // ── Top row (6–11) ──
  ['The e and i keys', 'die lie kid fee keel deal leaf jail sled idea field skied liked glide kiss aisle eel'],
  ['The r and u keys', 'run fur rug sure jury user under trust ruler fruit lured surf rise dial radius drier'],
  ['The t and y keys', 'try tidy stay duty city tray tasty daily yield style eatery dirty jetty artery satiety'],
  ['The w and o keys', 'wow low owl how tow word slow flow world follow willow yellow sorrow arrow widow owl'],
  ['The q and p keys', 'apt prop pipe quip pique quill people proper apply pupil papers quiet quote prior quail'],
  ['Top row review', 'quiet power write equip typist poetry uproot outlook portrait property require twirl utility'],
  // ── Bottom row (12–17) ──
  ['The v and n keys', 'van vine nine oven even never given seven vanity invent nation vivid navy vein vernal'],
  ['The c and m keys', 'cam come make calm music comic climb cinema comment maximum machine campaign command mimic'],
  ['The b and comma', 'bob bit bud bear black brief bubble number before maybe, robber, bamboo, nimble, bramble,'],
  ['The x and period', 'fox box exit taxi extra sixty oxen index. exact. relax. maxim. excel. mixture. examine.'],
  ['The z and slash', 'zap zip zoo buzz zero size zebra dozen puzzle frozen jazz crazy hazy prize amaze blaze'],
  ['Bottom row review', 'brave zinc combo vexing maze mixing zombie convex numbness vibrant becomes examines carbon'],
  // ── Shift & capitals (18–22) ── (hold Shift with the opposite hand)
  ['Left Shift for capitals', 'Nora Kim Yash Uma Iris Puja Hari Nita Lata Mina Luna Jaya Neel Kiran Yug Om Hana Poo'],
  ['Right Shift for capitals', 'Amit Sam Dev Ravi Tara Bina Cara Gita Ekta Zara Vish Fern Asha Ganga Rex Waqar Ford'],
  ['Capital cities', 'India China Japan Delhi Mumbai London Paris Rome Cairo Tokyo Berlin Ottawa Seoul Dubai'],
  ['Names and places', 'Ram Sita Arjun Priya Kanpur Jaipur Bhopal Patna Ranchi Nagpur Indore Surat Rajkot Thane'],
  ['Sentences with capitals', 'My name is Ravi. I live in Delhi. We visit the Taj Mahal in Agra every March with Priya.'],
  // ── Number row (23–28) ──
  ['Numbers 1 and 2', '111 222 12 21 1122 1212 11 22 1 2 121 212 11 22 1122 2211 12 21 1 2 12 21 11 22 121 212'],
  ['Numbers 3 and 4', '333 444 34 43 3344 3434 33 44 3 4 343 434 33 44 3344 4433 34 43 3 4 34 43 33 44 343 434'],
  ['Numbers 5 and 6', '555 666 56 65 5566 5656 55 66 5 6 565 656 55 66 5566 6655 56 65 5 6 56 65 55 66 565 656'],
  ['Numbers 7 and 8', '777 888 78 87 7788 7878 77 88 7 8 787 878 77 88 7788 8877 78 87 7 8 78 87 77 88 787 878'],
  ['Numbers 9 and 0', '999 000 90 09 9900 9090 99 00 9 0 909 090 99 00 9900 0099 90 09 9 0 90 09 99 00 909 090'],
  ['Number practice', 'Call 555 1234. Room 402. Year 2026. Total 750 rupees. Page 18. Bus 27. Score 96 of 100.'],
  // ── Bigrams & full keyboard ──
  ['Common letter pairs', 'th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io'],
  ['Common trigrams', 'the and ing her ent tha was eth for hat ion int his ter est ers ati hat ate all tio nce'],
  ['Full keyboard warmup', 'the quick brown fox jumps over a lazy dog; pack my box with five dozen liquor jugs today'],
  // ── Common words (21–30) ──
  ['Most common words 1', 'the be to of and a in that have it for not on with he as you do at this but his by from'],
  ['Most common words 2', 'they we say her she or an will my one all would there their what so up out if about who'],
  ['Most common words 3', 'get which go me when make can like time no just him know take people into year your good'],
  ['Everyday nouns', 'time year people way day man thing woman life child world school state family student group'],
  ['Everyday verbs', 'make go take come see know get give find think tell become show leave feel put mean keep let'],
  ['Common adjectives', 'good new first last long great little own other old right big high small large next early'],
  ['Numbers as words', 'one two three four five six seven eight nine ten eleven twelve hundred thousand million first'],
  ['Short phrases', 'in the morning, on the table, over the hill, under the tree, by the river, at home again'],
  ['Question words', 'who what when where why how which whose whom how many how much what for what if how often'],
  ['Tricky words', 'people because through thought enough government important different available together business'],
  // ── Sentences (31–40) ──
  ['Simple sentences', 'She sells sea shells by the sea shore. The cat sat on the warm mat near the open door.'],
  ['Pangram practice', 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.'],
  ['Daily routine', 'I wake up early and drink a cup of tea. Then I read the news and start my work for the day.'],
  ['At work', 'Please find the report attached to this email. Let me know if you need any changes soon.'],
  ['Describing nature', 'The sun rose slowly over the green hills as birds began to sing in the tall shady trees.'],
  ['Facts', 'Water boils at one hundred degrees. The earth moves around the sun once every single year.'],
  ['A short story', 'Once upon a time a young girl found a golden key hidden under an old wooden bridge nearby.'],
  ['In the news', 'The government announced a new plan to build more schools in rural areas across the state.'],
  ['Typing wisdom', 'Practice makes perfect. Slow is smooth and smooth is fast. Accuracy comes before raw speed.'],
  ['Sentence review', 'Typing well is a skill that grows with daily practice, patience, and steady quiet focus.'],
  // ── Paragraphs, numbers & symbols (41–50) ──
  ['Short paragraph', 'Learning to type without looking is a valuable skill. Keep your fingers on the home row and let each finger reach for its own keys and return again.'],
  ['Accuracy first', 'Speed comes with time, so focus on accuracy first. Every mistake you fix costs time, and clean typing is faster than quick typing that is full of errors.'],
  ['Typing with numbers', 'In 2026, about 40 percent of office workers typed over 60 words per minute. The fastest 1 percent reached 100 or more, proving that daily practice truly pays off.'],
  ['Using punctuation', 'The teacher asked a simple question, and the class went quiet. After a pause, a student replied slowly: yes, we finished the reading; it was long, but clear.'],
  ['Symbols and signs', 'Email me at user@site.com or call 555-123-4567. The total was 45 dollars and 90 cents, a 10% discount on the number 1 best-seller. Use the code SAVE10 and save more.'],
  ['Posture matters', 'Good posture matters as much as finger placement. Sit upright, keep your wrists relaxed, and place the screen at eye level so you can type for long periods without any strain.'],
  ['Exam stamina', 'Government typing tests measure both speed and accuracy over several minutes. Candidates should practise the exact format daily to build the stamina needed to hold their speed.'],
  ['Longer paragraph', 'The ability to type quickly and accurately is one of the most useful skills in the digital age. Whether you are a student, a professional, or preparing for an exam, steady daily practice on a physical keyboard will raise your words per minute.'],
  ['Mixed challenge', 'By 2030, most jobs will require basic computer skills. Type smart, not just fast, the experts say. Practise 15 to 20 minutes a day, track your WPM, and review your 3 slowest keys.'],
  ['Final challenge', 'Congratulations on reaching the final lesson. You have built the muscle memory to type without looking, moved across all three rows, and handled words, sentences, numbers, and symbols. Keep practising every day and your speed will keep climbing.'],
];

export const ENGLISH_LESSONS: EnglishLesson[] = CURRICULUM.map(([title, content], idx) => ({
  id: idx + 1,
  title,
  content,
  minWpm: Math.min(35, 10 + Math.floor(idx * 0.5)),
}));

export const ENGLISH_LESSON_MAP: Record<string, EnglishLesson> = Object.fromEntries(
  ENGLISH_LESSONS.map(l => [String(l.id), l]),
);

// Curriculum groups for the course map — ranges match the lessons above.
export const ENGLISH_LESSON_GROUPS: { name: string; icon: string; range: [number, number] }[] = [
  { name: 'Home Row', icon: '🏠', range: [1, 5] },
  { name: 'Top Row', icon: '⬆️', range: [6, 11] },
  { name: 'Bottom Row', icon: '⬇️', range: [12, 17] },
  { name: 'Shift & Capitals', icon: '⇧', range: [18, 22] },
  { name: 'Number Row', icon: '🔢', range: [23, 28] },
  { name: 'Words & Patterns', icon: '🔤', range: [29, 41] },
  { name: 'Sentences', icon: '✍️', range: [42, 51] },
  { name: 'Paragraphs & Speed', icon: '🚀', range: [52, 61] },
];

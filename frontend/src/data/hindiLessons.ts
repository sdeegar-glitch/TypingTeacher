/**
 * Hindi Typing Lessons — INSCRIPT Keyboard Layout (Mangal / Unicode)
 *
 * INSCRIPT Key Map (key → Hindi character):
 * Home Row:  a=ो  s=े  d=्  f=ि  g=ु  h=प  j=र  k=क  l=त  ;=च  '=ट
 * Top Row:   q=ौ  w=ै  e=ा  r=ी  t=ू  y=ब  u=ह  i=ग  o=द  p=ज
 * Bottom:    z=  x=ं  c=म  v=न  b=व  n=ल  m=स
 * Shift HR:  A=ओ  S=ए  D=अ  F=इ  G=उ  H=फ  J=ड़  K=ख  L=थ  :=छ  "=ठ
 * Shift TR:  Q=औ  W=ऐ  E=आ  R=ई  T=ऊ  Y=भ  U=ङ  I=घ  O=ध  P=झ
 * Shift BR:  C=ण  M=श  N=ळ  V=ञ  B=ऋ  X=:
 */

export interface HindiLesson {
  id: number;
  title: string;
  titleHindi: string;
  description: string;
  newKeys: string[];           // new Devanagari chars introduced
  keymapHint: Record<string, string>; // qwerty → hindi char
  content: string;             // drill text (only uses chars available so far)
  minWpm: number;
  group: string;
}

export const HINDI_LESSONS: HindiLesson[] = [
  // ════════════════════════════════
  // GROUP 1: HOME ROW — MATRAS (L1-5)
  // ════════════════════════════════
  {
    id: 1,
    title: 'Keys: f and j (ि and र)',
    titleHindi: 'कुंजी: f और j',
    description: 'Index fingers home position. f=ि (i-matra) and j=र (ra). These are the most common Hindi characters.',
    newKeys: ['ि', 'र'],
    keymapHint: { f: 'ि', j: 'र' },
    content: 'रि रि रि रि र र र ि ि ि रि रि र ि रि र ि र ि रि रि रि र ि र ि रि रि र ि',
    minWpm: 8,
    group: 'होम रो — मात्राएँ',
  },
  {
    id: 2,
    title: 'Keys: d and k (् and क)',
    titleHindi: 'कुंजी: d और k',
    description: 'd=् (halant/virama) connects consonants. k=क (ka). Middle fingers on home row.',
    newKeys: ['्', 'क'],
    keymapHint: { d: '्', k: 'क', f: 'ि', j: 'र' },
    content: 'क क क रि क् क् कि कि रि क कि कि र् किर रि क् कि र कि रि क कि क् रि',
    minWpm: 9,
    group: 'होम रो — मात्राएँ',
  },
  {
    id: 3,
    title: 'Keys: s and l (े and त)',
    titleHindi: 'कुंजी: s और l',
    description: 's=े (e-matra) and l=त (ta). Ring fingers. First real Hindi words appear!',
    newKeys: ['े', 'त'],
    keymapHint: { s: 'े', l: 'त', d: '्', k: 'क', f: 'ि', j: 'र' },
    content: 'रेत तेर तेरे रेत तेर रेते रित तेरि रेत तेर तेरे रेत तेर तेरि रेत तेर',
    minWpm: 10,
    group: 'होम रो — मात्राएँ',
  },
  {
    id: 4,
    title: 'Keys: a and ; (ो and च)',
    titleHindi: 'कुंजी: a और ;',
    description: 'a=ो (o-matra) and ;=च (cha). Pinky fingers. More vowel sounds now.',
    newKeys: ['ो', 'च'],
    keymapHint: { a: 'ो', ';': 'च', s: 'े', l: 'त', d: '्', k: 'क', f: 'ि', j: 'र' },
    content: 'चो रोत तोर चेत रोत चेत तोर रोते चो कि रेत चेत तोर रेत तेर चो रोते',
    minWpm: 10,
    group: 'होम रो — मात्राएँ',
  },
  {
    id: 5,
    title: 'Home Row Review',
    titleHindi: 'होम रो समीक्षा',
    description: 'Review all home row characters: ि ् े ो + र क त च. Build speed and accuracy together.',
    newKeys: [],
    keymapHint: { a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'रेत तेर चेत रोत कि तेरे चो रोते कि रेत चेत तोर रोत तेर चो रेत तेरे चेत रोत',
    minWpm: 12,
    group: 'होम रो — मात्राएँ',
  },

  // ════════════════════════════════
  // GROUP 2: TOP ROW MATRAS (L6-7)
  // ════════════════════════════════
  {
    id: 6,
    title: 'Keys: e and r (ा and ी)',
    titleHindi: 'कुंजी: e और r',
    description: 'e=ा (aa-matra, most common!) and r=ी (ii-matra). Top row ring fingers. Many real words now!',
    newKeys: ['ा', 'ी'],
    keymapHint: { e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'कार रात तारा कारी तार राकी तेरी कार रात तार कारी तारा राकी रात कार तेरी',
    minWpm: 13,
    group: 'ऊपरी पंक्ति — मात्राएँ',
  },
  {
    id: 7,
    title: 'Keys: g and t (ु and ू)',
    titleHindi: 'कुंजी: g और t',
    description: 'g=ु (u-matra short) and t=ू (uu-matra long). Index and pinky on top row.',
    newKeys: ['ु', 'ू'],
    keymapHint: { g: 'ु', t: 'ू', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'तुम गुम कूल रूत जुड़ तूरी कुरी तुकी गुरु कूट तुम गुम तूर कुल तुकी',
    minWpm: 13,
    group: 'ऊपरी पंक्ति — मात्राएँ',
  },

  // ════════════════════════════════
  // GROUP 3: MORE CONSONANTS (L8-12)
  // ════════════════════════════════
  {
    id: 8,
    title: 'Keys: h and u (प and ह)',
    titleHindi: 'कुंजी: h और u',
    description: 'h=प (pa) and u=ह (ha). Index finger right hand plus upper row. Key words: हर, पर, हाल.',
    newKeys: ['प', 'ह'],
    keymapHint: { h: 'प', u: 'ह', g: 'ु', t: 'ू', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'हर पर पाहर हाल राह हरे पारे हाकर पहर रात हाल पार राह हरे',
    minWpm: 14,
    group: 'व्यंजन — मुख्य',
  },
  {
    id: 9,
    title: 'Keys: i and y (ग and ब)',
    titleHindi: 'कुंजी: i और y',
    description: 'i=ग (ga) and y=ब (ba). Top row middle area. Words: बाग, राग, गर, बात.',
    newKeys: ['ग', 'ब'],
    keymapHint: { i: 'ग', y: 'ब', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'बाग राग बात गर हरा बाप बागी गहरे राग बाग बात हरा गर बाप',
    minWpm: 14,
    group: 'व्यंजन — मुख्य',
  },
  {
    id: 10,
    title: 'Keys: o and p (द and ज)',
    titleHindi: 'कुंजी: o और p',
    description: 'o=द (da) and p=ज (ja). Top row pinkies. Key words: राजा, दर, जात, दाग.',
    newKeys: ['द', 'ज'],
    keymapHint: { o: 'द', p: 'ज', i: 'ग', y: 'ब', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'राजा दर दाग जाकर बाजार जात पाजी बाज दार राजा जात दाग बाजार जाकर',
    minWpm: 15,
    group: 'व्यंजन — मुख्य',
  },
  {
    id: 11,
    title: 'Keys: c and v (म and न)',
    titleHindi: 'कुंजी: c और v',
    description: 'c=म (ma) and v=न (na). Bottom row. Essential consonants — मन, नाम, राम.',
    newKeys: ['म', 'न'],
    keymapHint: { c: 'म', v: 'न', o: 'द', p: 'ज', i: 'ग', y: 'ब', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'नाम मन राम जमात नरम मार मान नमन मनोज नाम मन मार मान राम जमात',
    minWpm: 15,
    group: 'व्यंजन — मुख्य',
  },
  {
    id: 12,
    title: 'Keys: b and n (व and ल)',
    titleHindi: 'कुंजी: b और n',
    description: 'b=व (va) and n=ल (la). Bottom row. Words: वन, लाल, वाला, मिला, लगन.',
    newKeys: ['व', 'ल'],
    keymapHint: { b: 'व', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', i: 'ग', y: 'ब', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'वन लाल लगन वाला मिला वर लाज लाल वन मिलना लगन वाला मिला लाज',
    minWpm: 16,
    group: 'व्यंजन — मुख्य',
  },
  {
    id: 13,
    title: 'Key: m (स)',
    titleHindi: 'कुंजी: m',
    description: 'm=स (sa). Bottom row right pinky. Words: सात, साल, सब, नमस्ते, जवाब.',
    newKeys: ['स'],
    keymapHint: { m: 'स', b: 'व', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'सात साल सब नमस्ते जवाब सात नाम सब साल राजसी सात साल सब',
    minWpm: 16,
    group: 'व्यंजन — मुख्य',
  },
  {
    id: 14,
    title: 'Full Home + Row Review',
    titleHindi: 'पूर्ण समीक्षा',
    description: 'Review all characters learned so far. Build fluency with common Hindi words and phrases.',
    newKeys: [],
    keymapHint: { m: 'स', b: 'व', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', i: 'ग', y: 'ब', h: 'प', u: 'ह', e: 'ा', r: 'ी', g: 'ु', t: 'ू', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'राजा नाम मिला वाला सात लाल लगन नमस्ते जवाब बाजार हरा मन वन',
    minWpm: 18,
    group: 'व्यंजन — मुख्य',
  },

  // ════════════════════════════════
  // GROUP 4: SHIFT KEYS — HARDER CONSONANTS (L15-20)
  // ════════════════════════════════
  {
    id: 15,
    title: 'Shift: K and L (ख and थ)',
    titleHindi: 'शिफ्ट: K और L',
    description: 'Shift+K=ख (kha), Shift+L=थ (tha). Aspirated versions of क and त.',
    newKeys: ['ख', 'थ'],
    keymapHint: { 'K': 'ख', 'L': 'थ', m: 'स', b: 'व', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'खाना थाना राखी मखमल नाखून खाकर थाना खात खानदान थकना राखी',
    minWpm: 17,
    group: 'शिफ्ट — व्यंजन',
  },
  {
    id: 16,
    title: 'Shift: : and \' (छ and ट)',
    titleHindi: 'शिफ्ट: : और \'',
    description: 'Shift+;=छ (chha), Shift+\'=ट (tta retroflex). Aspirated and retroflex sounds.',
    newKeys: ['छ', 'ट'],
    keymapHint: { ':': 'छ', '"': 'ट', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'छात्र चाट टीका टाट छाता टकसाल छात्रों चाटना टीका छात्र',
    minWpm: 17,
    group: 'शिफ्ट — व्यंजन',
  },
  {
    id: 17,
    title: 'Key: x (ं — Anusvara)',
    titleHindi: 'कुंजी: x (ं)',
    description: 'x=ं (anusvara/chandrabindu). Used for nasal sounds in: बंद, मंदिर, जंगल, संगम.',
    newKeys: ['ं'],
    keymapHint: { x: 'ं', ':': 'छ', '"': 'ट', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'बंद जंगल मंदिर संगम बंधन संस्कृत जंग बंद जंगल मंदिर',
    minWpm: 17,
    group: 'शिफ्ट — व्यंजन',
  },
  {
    id: 18,
    title: 'Shift: Y and O (भ and ध)',
    titleHindi: 'शिफ्ट: Y और O',
    description: 'Shift+Y=भ (bha), Shift+O=ध (dha). Key words: भारत, धर्म, भाव, धन.',
    newKeys: ['भ', 'ध'],
    keymapHint: { 'Y': 'भ', 'O': 'ध', x: 'ं', ':': 'छ', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'भारत धर्म भाव धन भजन धरती भारतीय धनी भारत धर्म',
    minWpm: 18,
    group: 'शिफ्ट — व्यंजन',
  },
  {
    id: 19,
    title: 'Shift: C and M (ण and श)',
    titleHindi: 'शिफ्ट: C और M',
    description: 'Shift+C=ण (na-retroflex), Shift+M=श (sha). Words: शहर, शाम, मणि, शक्ति.',
    newKeys: ['ण', 'श'],
    keymapHint: { 'C': 'ण', 'M': 'श', 'Y': 'भ', 'O': 'ध', x: 'ं', ':': 'छ', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'शहर शाम शादी मणि शक्ति शांति शहरी मण्डल शाम शादी शहर',
    minWpm: 18,
    group: 'शिफ्ट — व्यंजन',
  },
  {
    id: 20,
    title: 'Shift: I and H (घ and फ)',
    titleHindi: 'शिफ्ट: I और H',
    description: 'Shift+I=घ (gha), Shift+H=फ (pha). Words: फल, घर, फसल, घाटी.',
    newKeys: ['घ', 'फ'],
    keymapHint: { 'I': 'घ', 'H': 'फ', 'C': 'ण', 'M': 'श', 'Y': 'भ', 'O': 'ध', x: 'ं', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'फल घर फसल घाटी फूल घना फलना घड़ी फल घर फसल',
    minWpm: 18,
    group: 'शिफ्ट — व्यंजन',
  },

  // ════════════════════════════════
  // GROUP 5: FULL VOWELS (L21-25)
  // ════════════════════════════════
  {
    id: 21,
    title: 'Shift: D and E (अ and आ)',
    titleHindi: 'शिफ्ट: D और E',
    description: 'Shift+D=अ, Shift+E=आ. Independent vowels (not matras). Words: अब, आज, आम, आना.',
    newKeys: ['अ', 'आ'],
    keymapHint: { 'D': 'अ', 'E': 'आ', 'I': 'घ', 'H': 'फ', 'C': 'ण', 'M': 'श', 'Y': 'भ', x: 'ं', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'आम आज अब आना अकल आकर अब आज आम आकाश',
    minWpm: 19,
    group: 'स्वर — पूर्ण',
  },
  {
    id: 22,
    title: 'Shift: F and R (इ and ई)',
    titleHindi: 'शिफ्ट: F और R',
    description: 'Shift+F=इ, Shift+R=ई. Independent vowel forms. Words: इनाम, इस, ईद, इधर.',
    newKeys: ['इ', 'ई'],
    keymapHint: { 'F': 'इ', 'R': 'ई', 'D': 'अ', 'E': 'आ', 'C': 'ण', 'M': 'श', 'Y': 'भ', x: 'ं', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', a: 'ो', s: 'े', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त', ';': 'च' },
    content: 'इनाम इस ईद इधर इनाम इशारा ईमान इलाज इनाम इस',
    minWpm: 19,
    group: 'स्वर — पूर्ण',
  },
  {
    id: 23,
    title: 'Shift: G and T (उ and ऊ)',
    titleHindi: 'शिफ्ट: G और T',
    description: 'Shift+G=उ, Shift+T=ऊ. Independent u-vowels. Words: उन, उस, ऊपर, उनका.',
    newKeys: ['उ', 'ऊ'],
    keymapHint: { 'G': 'उ', 'T': 'ऊ', 'F': 'इ', 'R': 'ई', 'D': 'अ', 'E': 'आ', 'M': 'श', 'Y': 'भ', x: 'ं', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त' },
    content: 'उन उस ऊपर उनका उठना ऊँचा उड़ना उन उस ऊपर उनका',
    minWpm: 19,
    group: 'स्वर — पूर्ण',
  },
  {
    id: 24,
    title: 'Shift: S and A (ए and ओ)',
    titleHindi: 'शिफ्ट: S और A',
    description: 'Shift+S=ए, Shift+A=ओ. Independent vowels. Words: एक, ओर, एकता, ओला.',
    newKeys: ['ए', 'ओ'],
    keymapHint: { 'S': 'ए', 'A': 'ओ', 'G': 'उ', 'T': 'ऊ', 'F': 'इ', 'R': 'ई', 'D': 'अ', 'E': 'आ', 'M': 'श', 'Y': 'भ', x: 'ं', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त' },
    content: 'एक ओर एकता ओला एकत्र ओस एकाग्र ओजस्वी एक ओर एकता',
    minWpm: 20,
    group: 'स्वर — पूर्ण',
  },
  {
    id: 25,
    title: 'Shift: W and Q (ऐ and औ)',
    titleHindi: 'शिफ्ट: W और Q',
    description: 'Shift+W=ऐ, Shift+Q=औ. Words: और, औरत, ऐसा, ऐतिहासिक.',
    newKeys: ['ऐ', 'औ'],
    keymapHint: { 'W': 'ऐ', 'Q': 'औ', 'S': 'ए', 'A': 'ओ', 'G': 'उ', 'T': 'ऊ', 'F': 'इ', 'R': 'ई', 'D': 'अ', 'E': 'आ', 'M': 'श', 'Y': 'भ', x: 'ं', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त' },
    content: 'और औरत ऐसा औजार ऐतिहासिक और औरत ऐसे औसत ऐनक',
    minWpm: 20,
    group: 'स्वर — पूर्ण',
  },

  // ════════════════════════════════
  // GROUP 6: REMAINING CONSONANTS (L26-27)
  // ════════════════════════════════
  {
    id: 26,
    title: 'Shift: P and U (झ and ड)',
    titleHindi: 'शिफ्ट: P और [',
    description: 'Shift+P=झ, [=ड (retroflex da). Words: झंडा, झरना, डर, डाक.',
    newKeys: ['झ', 'ड'],
    keymapHint: { 'P': 'झ', '[': 'ड', 'W': 'ऐ', 'Q': 'औ', 'S': 'ए', 'A': 'ओ', 'G': 'उ', 'T': 'ऊ', 'F': 'इ', 'R': 'ई', 'D': 'अ', 'E': 'आ', 'M': 'श', 'Y': 'भ', x: 'ं', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', h: 'प', u: 'ह', e: 'ा', r: 'ी', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त' },
    content: 'झंडा झरना डर डाक झाड़ डाकिया झालर डरना झंडा झरना',
    minWpm: 20,
    group: 'व्यंजन — अतिरिक्त',
  },
  {
    id: 27,
    title: 'Words Drill — Common Vocabulary',
    titleHindi: 'शब्द अभ्यास',
    description: 'Practice the most common Hindi words used in government exams and daily life.',
    newKeys: [],
    keymapHint: { 'M': 'श', 'Y': 'भ', x: 'ं', 'K': 'ख', 'L': 'थ', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', u: 'ह', e: 'ा', r: 'ी', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त' },
    content: 'सरकार विकास योजना शिक्षा स्वास्थ्य न्याय राष्ट्र समाज भारत',
    minWpm: 21,
    group: 'शब्द अभ्यास',
  },
  {
    id: 28,
    title: 'Sentences Drill',
    titleHindi: 'वाक्य अभ्यास',
    description: 'Full sentence practice combining all characters learned. Focus on rhythm and accuracy.',
    newKeys: [],
    keymapHint: { 'M': 'श', 'Y': 'भ', 'D': 'अ', 'E': 'आ', x: 'ं', 'K': 'ख', m: 'स', n: 'ल', c: 'म', v: 'न', o: 'द', p: 'ज', u: 'ह', e: 'ा', r: 'ी', d: '्', f: 'ि', j: 'र', k: 'क', l: 'त' },
    content: 'भारत एक महान देश है। शहर और गांव सभी जगह विकास हो रहा है। शिक्षा और स्वास्थ्य सबका अधिकार है।',
    minWpm: 22,
    group: 'वाक्य अभ्यास',
  },

  // ════════════════════════════════
  // GROUP 7: PARAGRAPH PRACTICE (L29-30)
  // ════════════════════════════════
  {
    id: 29,
    title: 'Paragraph 1 — Government Schemes',
    titleHindi: 'अनुच्छेद १ — सरकारी योजनाएँ',
    description: 'SSC-style paragraph about government schemes. Full keyboard practice.',
    newKeys: [],
    keymapHint: {},
    content: 'भारत सरकार ने ग्रामीण क्षेत्रों में डिजिटल साक्षरता को बढ़ावा देने के लिए एक नई योजना की घोषणा की है। इस पहल के तहत निःशुल्क कंप्यूटर प्रशिक्षण केंद्र स्थापित किए जाएंगे। युवाओं को तकनीकी शिक्षा देकर उन्हें रोजगार के लिए तैयार किया जाएगा।',
    minWpm: 25,
    group: 'अनुच्छेद अभ्यास',
  },
  {
    id: 30,
    title: 'Paragraph 2 — National Development',
    titleHindi: 'अनुच्छेद २ — राष्ट्रीय विकास',
    description: 'Final lesson — SSC/CPCT exam-style full paragraph. Demonstrate your mastery!',
    newKeys: [],
    keymapHint: {},
    content: 'भारत एक महान देश है जहाँ विविध संस्कृतियाँ और भाषाएँ एक साथ फलती-फूलती हैं। हमारे देश में लोकतंत्र की जड़ें बहुत गहरी हैं। सरकार की विभिन्न योजनाओं के माध्यम से शिक्षा, स्वास्थ्य और रोजगार के क्षेत्र में निरंतर प्रगति हो रही है। डिजिटल भारत के तहत तकनीक का लाभ हर नागरिक तक पहुँचाने का लक्ष्य निर्धारित किया गया है।',
    minWpm: 28,
    group: 'अनुच्छेद अभ्यास',
  },
];

export const HINDI_LESSON_GROUPS = [
  { name: 'होम रो — मात्राएँ', icon: '🏠', range: [1, 5] },
  { name: 'ऊपरी पंक्ति — मात्राएँ', icon: '⬆️', range: [6, 7] },
  { name: 'व्यंजन — मुख्य', icon: '⌨️', range: [8, 14] },
  { name: 'शिफ्ट — व्यंजन', icon: '🔺', range: [15, 20] },
  { name: 'स्वर — पूर्ण', icon: '🔡', range: [21, 25] },
  { name: 'व्यंजन — अतिरिक्त', icon: '➕', range: [26, 27] },
  { name: 'शब्द व वाक्य', icon: '📝', range: [28, 28] },
  { name: 'अनुच्छेद अभ्यास', icon: '📄', range: [29, 30] },
];

/** Progress stored separately from English lessons */
export const HINDI_PROGRESS_KEY = 'hindi_lesson_progress';

export interface HindiLessonProgress {
  lessonId: number;
  stars: number;
  bestWpm: number;
  bestAccuracy: number;
  completed: boolean;
}

export function loadHindiProgress(): Record<number, HindiLessonProgress> {
  try {
    const raw = localStorage.getItem(HINDI_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveHindiProgress(p: HindiLessonProgress): void {
  const all = loadHindiProgress();
  const ex = all[p.lessonId];
  all[p.lessonId] = {
    ...p,
    stars: Math.max(p.stars, ex?.stars || 0),
    bestWpm: Math.max(p.bestWpm, ex?.bestWpm || 0),
    bestAccuracy: Math.max(p.bestAccuracy, ex?.bestAccuracy || 0),
    completed: true,
  };
  localStorage.setItem(HINDI_PROGRESS_KEY, JSON.stringify(all));
}

export function isHindiLessonUnlocked(id: number): boolean {
  if (id === 1) return true;
  const progress = loadHindiProgress();
  return !!progress[id - 1]?.completed;
}

# Pending Work — Hindi Typing Learning System

## What needs to be built (in order):

### 1. `frontend/src/data/hindiCourseData.ts` ← START HERE
- Create 200 Hindi typing lessons for INSCRIPT/Unicode keyboard
- Each lesson has: title, Hindi text to type, keyboard hints, XP reward, difficulty level
- 12 stages: Home Row → Basic Chars → Matras → Words → Sentences → Paragraphs → Official Hindi → Government Formats → Court Docs → Speed Building → Accuracy → Exam Prep
- Includes gamification: XP points, badges, streaks, levels (Beginner → Master)
- Progress saved in localStorage key: `hindi_course_unicode_progress`

### 2. `frontend/src/data/krutiDevCourseData.ts`
- Same 200-lesson structure but for Kruti Dev keyboard layout
- Same Hindi practice text, different keyboard mapping guide
- Uses Remington Gail layout (standard for UP Police, SSC exams)
- Progress saved in localStorage key: `hindi_course_krutidev_progress`

### 3. `frontend/src/pages/LearnHindiTypingPage.tsx` ← REPLACE EXISTING FILE
- Full redesign of the landing page at `/learn-hindi-typing`
- Hero section: "Learn Hindi Typing Online Free"
- Two big buttons: "Learn Kruti Dev" and "Learn Unicode (Mangal)"
- Benefits grid: SSC prep, UP Police, Court typing, government exams
- Stats section, exam list, features

### 4. `frontend/src/pages/HindiCourseSelectPage.tsx` ← NEW FILE
- Card grid showing all 200 lessons
- Works for both Unicode and Kruti Dev paths
- Locked/unlocked cards (only first lesson open by default)
- Shows: lesson number, title, stars earned, WPM, difficulty, lock status
- Top dashboard: total XP, streak, badges, progress %
- Route: `/learn-hindi-typing/unicode` and `/learn-hindi-typing/kruti-dev`

### 5. `frontend/src/pages/HindiCourseLessonPage.tsx` ← NEW FILE
- The actual typing lesson interface
- Shows Hindi text to type, highlights current character
- Virtual keyboard with Hindi key labels (different for INSCRIPT vs Kruti Dev)
- Completion modal with stars (1-5), XP earned, accuracy, WPM
- Auto-unlocks next lesson on pass
- Route: `/learn-hindi-typing/unicode/lesson-:id` and `/learn-hindi-typing/kruti-dev/lesson-:id`

### 6. `frontend/src/App.tsx` ← SMALL UPDATE
- Add "Learn Hindi Typing" to the top navigation bar (NAV_LINKS array)
- Add 4 new routes:
  - `/learn-hindi-typing/unicode` → HindiCourseSelectPage
  - `/learn-hindi-typing/kruti-dev` → HindiCourseSelectPage
  - `/learn-hindi-typing/unicode/lesson-:id` → HindiCourseLessonPage
  - `/learn-hindi-typing/kruti-dev/lesson-:id` → HindiCourseLessonPage
- Keep existing routes unchanged (backward compatible)

---

## Key Design Decisions Already Made:
- Tech stack: React + TypeScript + Tailwind v4 + Framer Motion (already in project)
- Colors: teal (#304C53), terracotta (#BC6C50), aqua (#2A9DAE) — matches existing brand
- Fonts: Noto Sans Devanagari for Hindi text (already loaded in project)
- Progress stored in localStorage (no backend needed, same as existing 30-lesson course)
- Existing `/hindi-lessons` route stays unchanged (30-lesson course remains)
- New system is SEPARATE at `/learn-hindi-typing/*` routes

## INSCRIPT Keyboard Map (for reference):
```
Normal: a=ो s=े d=् f=ि g=ु h=प j=र k=क l=त ;=च
        q=ौ w=ै e=ा r=ी t=ू y=ब u=ह i=ग o=द p=ज
        x=ं c=म v=न b=व n=ल m=स

Shift:  D=अ E=आ F=इ R=ई G=उ T=ऊ S=ए A=ओ W=ऐ Q=औ
        K=ख L=थ :=छ "=ठ Y=भ O=ध C=ण M=श I=घ H=फ P=झ
```

## Kruti Dev (Remington Gail) Map:
```
Normal: a=ा s=स d=द f=ि g=ग h=ह j=ब k=क l=ल
        q=ं w=ो e=ी t=ट u=ु i=् o=े p=।
        z=त x=ज c=च v=व b=न n=ण m=म

Shift:  A=आ S=श D=ध F=इ G=घ H=ख J=भ K=ष
        Q=औ E=ई T=ठ Y=य U=ऊ I=इ O=ओ P=फ
        Z=त्र C=ज्ञ V=अ B=ण
```

## 12 Stage Breakdown (200 lessons total):
| Stage | Name | Lessons | Focus |
|-------|------|---------|-------|
| 1 | Home Row Practice | L1–15 | Basic key positions |
| 2 | Basic Characters | L16–30 | All consonants + vowels |
| 3 | Matras | L31–45 | All matra forms |
| 4 | Words | L46–80 | Common Hindi words |
| 5 | Sentence Practice | L81–110 | Simple to complex sentences |
| 6 | Paragraph Practice | L111–130 | Short paragraphs |
| 7 | Official Hindi Drafting | L131–145 | Formal writing style |
| 8 | Government Office Formats | L146–160 | Memos, letters, orders |
| 9 | Court Documents | L161–172 | Legal/FIR/petition format |
| 10 | Advanced Speed Building | L173–182 | Speed drills |
| 11 | Typing Accuracy Improvement | L183–191 | Precision practice |
| 12 | Exam Oriented Typing | L192–200 | SSC/UP Police/Court exam passages |

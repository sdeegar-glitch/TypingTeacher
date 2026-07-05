# FastTypingLab — SEO Knowledge Base & Master Plan

A synthesis of modern SEO best practice (Google Search Central, Backlinko,
Ahrefs, Semrush, Moz principles) **applied specifically to fasttypinglab.com**.
This is your single source of truth. Work the plan; measure; iterate.

> **Honest expectation-setting:** No plan guarantees #1 — ranking depends on
> competition, domain authority, backlinks and time. This plan maximizes your
> odds by making the site technically excellent, topically authoritative, and
> genuinely useful. Realistic path: first rankings for long-tail exam terms in
> **4–10 weeks**, meaningful traffic in **3–6 months**, competitive head terms
> ("typing test") in **12+ months** with sustained content + links.

---

## 0. How Google actually ranks (the mental model)

Everything below serves three things Google rewards:
1. **Relevance** — does the page match the searcher's intent? (keywords, content)
2. **Authority** — is this site/page trusted? (backlinks, EEAT, brand)
3. **Experience** — is it fast, mobile, safe, easy to use? (Core Web Vitals, UX)

Plus the 2024–2026 shift: **Helpful, people-first content** and **topical
authority** (covering a topic comprehensively) beat thin keyword-stuffed pages.
AI Overviews / answer engines reward **clear structure, entities, and schema**.

---

## 1. Technical SEO — status on THIS site

Google's crawl → index → rank pipeline. A page can't rank if it can't be
crawled and indexed. Current state:

| Item | Status |
|---|---|
| HTTPS, custom domain | ✅ |
| `robots.txt` (allow + sitemap) | ✅ |
| `sitemap.xml` (51 URLs, trailing-slash, lastmod) | ✅ |
| Interior pages return **HTTP 200** (was 404) | ✅ fixed |
| Prerendered HTML (Bing/Google read content w/o JS) | ✅ |
| Per-page unique `<title>` + meta description | ✅ |
| Self-referencing **canonical** per page | ✅ |
| Single `<h1>` per page in raw HTML | ✅ |
| Structured data: WebSite, Organization, FAQ, Article | ✅ |
| **BreadcrumbList** schema | ✅ (just added) |
| `noindex` on private pages (login/dashboard/admin) | ✅ |
| Mobile viewport / responsive | ✅ |
| GA4 analytics | ✅ |
| **Core Web Vitals audited** | ⬜ do at pagespeed.web.dev |
| **hreflang** (if you split Hindi/English URLs later) | ⬜ future |
| **Image formats** (WebP/AVIF, lazy-load, width/height) | ⬜ review |

**Action:** Run https://pagespeed.web.dev/ on the homepage + `/tests/` +
one blog post (mobile). Target: LCP < 2.5s, CLS < 0.1, INP < 200ms. If LCP is
slow, the main JS bundle or hero is the usual culprit — tell me the scores and
I'll optimize.

---

## 2. Keyword research (the foundation of everything)

**Tools (free):** Google Search Console (your own query data — best source once
traffic starts), Google Keyword Planner, Google Trends, Ahrefs Free Keyword
Generator, "People Also Ask" boxes, Google autocomplete.

**Intent types — target all three:**
- **Informational**: "how many wpm is good", "how to type faster" → blog posts.
- **Commercial/comparison**: "best typing test for ssc", "kruti dev vs mangal".
- **Transactional/tool**: "ssc chsl typing test online", "hindi typing test" →
  landing pages + tools (these convert best; you already have them).

**Your keyword goldmine (low competition, high intent):**
- `<exam> typing test` — ssc chsl, ssc cgl, cpct, up police, railway ntpc,
  court, bihar ssc, deo, high court steno. ✅ 6 built, more below.
- `<exam> typing speed` / `wpm required for <exam>`.
- `hindi typing test` (mangal / unicode / kruti dev / 5 minute / 10 minute).
- `typing test 1 minute / 5 minute / 10 minute`.
- `<layout>` — "inscript typing", "remington gail", "kruti dev typing".

**Rule:** one primary keyword per page. Put it in the URL, `<title>`, `<h1>`,
first 100 words, and one `<h2>`. Don't repeat the same target across two pages
(keyword cannibalization).

---

## 3. Topical authority — the content cluster map

Google ranks sites that own a topic. Build **hub + spoke** clusters: a pillar
page links to many focused articles, which link back. Your clusters:

**Cluster A — Government Exam Typing** (pillar: `/competitive-exam-typing/`)
- Spokes: each `/<exam>-typing-test/` page + each exam blog post.
- ✅ SSC CHSL, SSC CGL, CPCT, UP Police, Railway NTPC, Court/Steno.
- ⬜ To add: Bihar SSC, High Court Steno, DEO, RSMSSB, MP Patwari typing.

**Cluster B — Hindi Typing** (pillar: `/learn-hindi-typing/`)
- Spokes: `/hindi-typing-test/`, `/kruti-dev-typing/`, blog posts:
  "Kruti Dev vs Mangal", "How to type Hindi matras", "INSCRIPT layout guide".

**Cluster C — Typing Speed & Skill** (pillar: `/tests/` or `/learn/`)
- Spokes: "how many wpm is good" ✅, "how to type faster" ✅, "touch typing vs
  hunt & peck" ✅, "average typing speed by age", "typing test 5 minute".

**Cluster D — Tools** (pillar: `/tools/`)
- Spokes: keyboard tester, CPS test, word counter, etc. (already exist).

**Internal linking rule:** every new post links UP to its pillar and SIDEWAYS
to 2–3 sibling pages, using descriptive anchor text (not "click here").

---

## 4. On-page SEO formula (apply to every page)

- **URL**: short, keyword-rich, hyphenated → `/ssc-chsl-typing-test/`. ✅
- **Title (<60 chars)**: `Primary Keyword — Modifier | FastTypingLab`.
- **Meta description (~150 chars)**: benefit + keyword + soft CTA. Not a ranking
  factor directly, but drives click-through (which *is*).
- **One H1** = the page's promise, containing the primary keyword. ✅
- **H2/H3** for structure; include secondary keywords + "People Also Ask" Qs.
- **First 100 words**: state what the page is and include the keyword.
- **Content depth**: cover the topic fully. For competitive terms, match or beat
  the depth of whoever ranks #1–3 now.
- **Internal links**: 3–5 relevant ones per page.
- **Structured data**: FAQ on Q&A pages ✅, Article on posts ✅, Breadcrumb ✅.
- **Media**: descriptive `alt` text; compress images; set width/height.

---

## 5. Content plan — publish cadence

**Target: 3–5 quality articles/week** (Google rewards freshness + depth). Each
must be genuinely useful (helpful-content system), original, and answer the
query better than what ranks now. Never publish thin or AI-spun filler — it can
trigger a helpful-content demotion.

**Next 20 articles (ordered by ROI):**
1. Kruti Dev vs Mangal: which to learn
2. How to type Hindi matras & half-letters faster
3. Best free typing software for govt exams
4. Bihar SSC (BSSC) typing test guide
5. High Court / District Court steno typing
6. RSMSSB / Rajasthan typing test
7. MP Patwari typing requirements
8. DEO typing speed requirements
9. 5-minute typing test: build stamina
10. 10-minute typing test for SSC
11. Average typing speed by age
12. Touch typing finger placement guide
13. How to reduce typing errors / improve accuracy
14. Best keyboard for typing speed (India)
15. INSCRIPT keyboard layout complete guide
16. Remington vs Inscript Hindi typing
17. Typing test for banking exams (IBPS)
18. How to type without looking (touch typing)
19. Daily typing practice routine that works
20. Typing ergonomics: posture & hand position

Each: 800–1500 words, comparison table, FAQ (→ FAQ schema), CTA to the matching
free test. Add to `frontend/src/data/blogPosts.ts` → auto-prerenders + sitemap.

---

## 6. Off-page SEO — authority & EEAT (you execute, I draft)

Backlinks remain a top ranking factor. **Quality > quantity.** Also build EEAT
(Experience, Expertise, Authoritativeness, Trust) signals.

**Backlinks (start with 5–10 easy, relevant):**
- Free-tool directories: AlternativeTo, SaaSHub, Product Hunt, Toolify,
  "there's an AI for that" (for the AI Tutor).
- Indian exam blogs/resource lists — email, offer your free tool.
- HARO / journalist requests (data on typing speed).
- Guest posts on exam-prep blogs.

**EEAT signals to add:**
- **About page** (who runs it, why it's trustworthy).
- **Author bylines** on blog posts + an author bio.
- **Contact page**, privacy policy, terms (trust signals Google checks).
- Real "Experience" — the site *is* a tool people use (strong signal).

**Brand signals:** consistent NAP; social profiles (X, LinkedIn, YouTube,
Instagram) all linking to the site; encourage branded searches ("FastTypingLab").

**Communities (fastest early traffic + links):** Quora, Reddit (r/typing, exam
subs), Telegram/WhatsApp exam groups, YouTube tutorials. See `GROWTH.md`.

---

## 7. AI SEO (critical for 2026 — AI Overviews & answer engines)

Search now surfaces AI answers. To be cited/ranked in them:
- **Semantic SEO**: write about the *topic and its entities*, not just a keyword.
  Mention related entities (SSC, CHSL, KDPH, WPM, INSCRIPT, Kruti Dev, Mangal).
- **Entity clarity**: define terms; use clear, quotable sentences (AI engines
  extract concise factual statements).
- **Structured data**: FAQ, HowTo, Article, Breadcrumb — machine-readable meaning.
- **Programmatic SEO**: template + data → many genuinely useful pages (your exam
  landing pages are exactly this). Keep them unique and valuable, never thin.
- **Direct answers**: put the answer to the query in the first paragraph, then
  elaborate — this wins featured snippets *and* AI citations.
- **Freshness + originality**: unique data/perspective AI can't get elsewhere
  (e.g., "average WPM of our users", real exam-pattern passages).

---

## 8. Core Web Vitals & mobile

- **LCP < 2.5s**: your prerendered HTML paints fast; keep the hero light; the
  large recharts bundle only loads on the dashboard (fine).
- **CLS < 0.1**: set explicit width/height on images; avoid layout shifts.
- **INP < 200ms**: keep main-thread work light.
- **Mobile-first**: Google indexes the mobile version — it's responsive ✅.
- Audit quarterly at pagespeed.web.dev and in GSC → Core Web Vitals report.

---

## 9. Measurement & iteration (the flywheel)

Weekly, in **Google Search Console → Performance**:
1. Find queries where you rank **position 5–20 with high impressions** → these
   are "almost there." Improve that page (depth, internal links) to break top 5.
2. Find queries you get impressions for but have **no dedicated page** → create
   one.
3. Watch **Pages (Indexing)** report → fix "Discovered/Crawled – not indexed"
   (usually needs more internal links or authority).
4. In **GA4** → see which pages/sources convert → double down.

Iterate: this loop is how sites compound from 0 → thousands of visits.

---

## 10. 90-Day execution calendar

**Weeks 1–2 (foundation):**
- [ ] GSC + Bing: submit sitemap, Request Indexing on all key pages.
- [ ] Run PageSpeed audit; fix any red CWV.
- [ ] Add About / Author / Contact / Privacy pages (EEAT).
- [ ] Get first 3–5 backlinks (directories + profiles).

**Weeks 3–8 (content + authority):**
- [ ] Publish 3–4 articles/week from the list in §5.
- [ ] Answer 2 Quora questions/week with a helpful link.
- [ ] 1 community share/week (Reddit/Telegram).
- [ ] Add 2–3 more exam landing pages (Bihar SSC, DEO, IBPS).

**Weeks 9–12 (optimize + scale):**
- [ ] GSC review: improve every page ranking 5–20.
- [ ] Build content clusters' internal linking.
- [ ] Pursue 5 more quality backlinks (guest posts, HARO).
- [ ] Consider a YouTube channel (evergreen exam-typing tutorials).

---

## 11. Tools (free tier is enough to start)

- **Google Search Console** — indexing + query data (essential, free).
- **Bing Webmaster Tools** — Bing + built-in keyword/SEO reports (free).
- **Google Analytics 4** — traffic behavior (installed ✅).
- **pagespeed.web.dev** — Core Web Vitals (free).
- **Rich Results Test** (search.google.com/test/rich-results) — validate schema.
- **Google Trends / Keyword Planner** — demand (free).
- **Ahrefs Free tools / Webmaster Tools** — backlinks + keyword ideas (free tier).

---

## 12. The 20% that drives 80% of results

If you do nothing else, do these:
1. **Publish useful content weekly** targeting exam + Hindi typing queries.
2. **Get 10 quality backlinks** in 90 days.
3. **Fix every "position 5–20" page** using GSC data.
4. **Keep the site fast and technically clean** (mostly done).
5. **Be genuinely the best free tool** for your niche — the product *is* the moat.

Consistency beats intensity. A site that ships 1 great page + 1 link every week
for a year will outrank one that does a burst and stops.

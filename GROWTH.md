# FastTypingLab — Traffic & Growth Playbook

A concrete, do-this-now checklist for getting visitors. On-site SEO is already
built (prerendered pages, per-route meta, schema, sitemap). This file covers the
**off-site** work that only a human can do, plus the content cadence to keep
compounding.

Niche focus: **Indian government-exam typing (SSC, CPCT, UP Police, court) and
Hindi typing (Mangal/INSCRIPT + Kruti Dev).** This is far less competitive than
generic "typing test" and is where you can realistically rank first.

---

## 1. Week 1 — Indexing foundation (30 min, do once)

- [ ] **Google Search Console** (search.google.com/search-console)
  - Add property `https://fasttypinglab.com` (verification tag already in the site).
  - Sitemaps → submit `sitemap.xml`. Confirm "Success".
  - URL Inspection → "Request Indexing" for your top ~10 pages (home, /tests/,
    /learn-hindi-typing/, /competitive-exam-typing/, /hindi-typing-test/, and the
    new blog posts).
- [ ] **Bing Webmaster Tools** (bing.com/webmasters)
  - Add the site (verification tag already present), submit the sitemap.
  - Bing also feeds DuckDuckGo + ChatGPT search — worth it.
- [ ] **Google Analytics 4** — paste your Measurement ID into
  `frontend/src/lib/analytics.ts` so you can see what's working.

---

## 2. Backlinks — even 5 tells Google "crawl this site"

A new domain with zero backlinks barely gets crawled. Target easy, legitimate ones:

- [ ] **Free-tool directories**: AlternativeTo, SaaSHub, Product Hunt (launch),
      Toolify, there's-an-ai-for-that (for the AI Tutor), free-tools listicles.
- [ ] **Indian exam resource pages**: blogs/sites listing free typing tools for
      SSC/CPCT — email them; offer your free tool as a resource.
- [ ] **Your own profiles**: add the URL to Twitter/X bio, LinkedIn, Instagram,
      YouTube about, GitHub profile, any forum signatures.
- [ ] **Q&A links** (see below) — contextual links from Quora/Reddit.

> Quality > quantity. 5 relevant links beat 50 spammy ones (which can hurt you).

---

## 3. Communities — fastest early traffic

### Quora (highest ROI for India)
Search these and write genuinely helpful answers, linking your relevant page at the end:
- "How can I increase typing speed for SSC CHSL?"
- "Which is the best free Hindi typing test for CPCT / UP Police?"
- "How many WPM is required for SSC typing test?"
- "How to practice Kruti Dev / Mangal typing online free?"

Pattern: give a real, useful answer first → then "I built a free tool for this,
practice here: [link]". Don't drop bare links.

### Reddit
- r/typing, r/India, r/IndianAcademia, r/SSC, exam-specific subs.
- Share the **free tools/games** (not salesy): "I made a free Hindi typing test
  for govt-exam prep — feedback welcome." Read each sub's self-promo rules first.

### Telegram / WhatsApp
- SSC / CPCT / UP Police prep groups are huge in India. Share your free mock
  tests where it's allowed. One useful share can send hundreds of visitors.

### YouTube (medium-term)
- Short screen-recordings: "Free SSC CHSL typing test practice" / "How to type
  Hindi in Mangal for CPCT". Link the site in the description. Evergreen traffic.

---

## 4. Content cadence — the compounding engine

Publish **1 post/week** targeting one real search query each. Add to
`frontend/src/data/blogPosts.ts` (then it auto-prerenders + enters the sitemap).
High-intent ideas not yet written:

- "UP Police Typing Test: Speed, Kruti Dev Layout & Practice"
- "Best Free Typing Software for Government Exams in India"
- "Kruti Dev vs Mangal: Which Hindi Typing Layout Should You Learn?"
- "Court / High Court Steno Typing Test: Requirements & Practice"
- "Railway NTPC Typing Test: What to Expect"
- "10-Minute Typing Test: How to Build Stamina for SSC"
- "How to Type Hindi Matras and Half-Letters Faster"
- "Data Entry Operator (DEO) Typing Speed Requirements"

Each post should: answer the query directly, include a comparison table, list
common mistakes, and end with a CTA to the matching free test/course.

---

## 5. On-site conversion (keep visitors + bring them back)

- Encourage saving progress / streaks (already built) — repeat visits signal quality.
- Add share buttons on certificates (people share scores → referral traffic).
- The AI Tutor is a differentiator — mention it in Quora/Reddit answers.

---

## 6. What to measure (after GA4 is live)

- **Top landing pages** → write more like the winners.
- **Search queries** (Search Console → Performance) → turn high-impression,
  low-position queries into dedicated pages/posts.
- **Traffic sources** → double down on whatever community actually converts.

---

## 7. Do NOT (yet)

- Don't buy backlinks or use link farms (Google penalty).
- Don't run paid ads until organic + analytics are working — you'll waste money
  without knowing what converts.
- Don't mass-produce thin/duplicate pages — quality pages only.

---

### Realistic timeline
- Indexing: days–2 weeks. First organic clicks: 2–6 weeks. Meaningful organic
  traffic: 2–4 months of consistent content + a handful of backlinks. Community
  shares can bring visitors **this week**.

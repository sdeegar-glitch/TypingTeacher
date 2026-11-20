# Industry-Specific Design Intelligence Guide

A government portal, medical records system, fashion boutique, and developer analytics engine must never look alike. AI generators fail precisely because they apply a generic SaaS template (purple gradients, bento grids, and pill buttons) indiscriminately across every vertical.

This guide provides explicit visual guidelines, typography, navigation priorities, and anti-slop rules across 15 distinct industries.

---

## Sector Matrix Overview

| Industry | Visual Language | Typography Pairing | Navigation Priority | Primary Slop Tell to Avoid |
|---|---|---|---|---|
| **1. Government Portals** | Authoritative, sober, high-density, accessible | *Plus Jakarta Sans* + *Noto Sans Devanagari* | Direct citizen services, notices, language toggle | Purple neon gradients, floating cards, empty hero |
| **2. Education Platforms** | Structured, progress-driven, encouraging, clear | *Source Sans 3* + *Newsreader* (editorial headers) | Course catalog, learning path, progress dashboard | "Transform your future" buzzwords, fake 5-star cards |
| **3. Exam Prep Portals** | Strict, distraction-free, exam-matched, timed | *IBM Plex Sans* + *Mangal* / *Kruti Dev 010* | Live timed tests, official syllabus, error audit | Marketing popups, uncalibrated WPM formulas |
| **4. SaaS Applications** | Surgical, product-led, precise, modular | *Geist* / *Inter* + *Geist Mono* | Interactive demo, pricing matrix, docs, API ref | 3-card bento with identical Lucide icons |
| **5. Corporate Enterprise** | Stable, trustworthy, established, restrained | *Instrument Serif* + *Plus Jakarta Sans* | Solutions by sector, leadership, compliance, ESG | Unattributed stock photos of models laughing at laptops |
| **6. Banking & Fintech** | High-security, transparent, tabular, solid | *Public Sans* + *JetBrains Mono* | Log in (MFA), account balances, transfers, security | Glassmorphism, low-contrast transaction numbers |
| **7. E-Commerce Stores** | Product-centric, tactile, fast, frictionless | *Syne* / *Clash Display* + *General Sans* | Category navigation, visual search, cart drawer | Generic centered heroes with zero products visible |
| **8. News & Publishing** | High-information density, editorial cadence | *Newsreader* / *Playfair Display* + *Source Serif 4* | Breaking news ticker, topic verticals, author bylines | Oversized single-column cards with infinite scroll |
| **9. Healthcare & Medical** | Calming, clinical, hyper-accessible (AAA) | *DM Sans* + *System UI* | Find a doctor, urgent care, patient portal login | Neon cyberpunk accents, illegible light-gray text |
| **10. Portfolio Websites** | Expressive, bespoke, work-focused, confident | Custom Display Grotesque + *Switzer* | Case study index, project gallery, contact info | Generic 3-card "My Skills: React / Node / Python" |
| **11. Creative Agencies** | Bold, avant-garde, art-directed, unexpected | *Fraunces* / *PP Neue Montreal* | Visual reel, client roster, philosophy monograph | Template "Our Services" grid with generic marketing copy |
| **12. Business Dashboards** | Maximum density, monospace data, compact | *Geist* + *Geist Mono* / *Fira Code* | Global sidebar, date-range picker, metric tables | Giant pie charts taking up half the screen |
| **13. Documentation Sites** | Scannable, breadcrumb-anchored, search-first | *Inter* + *JetBrains Mono* | Sticky table of contents, algorithmic search (`cmd+k`) | Marketing heroes placed before technical instructions |
| **14. Booking Platforms** | Calendar-centric, clear pricing, location-led | *Plus Jakarta Sans* + *Cabinet Grotesk* | Date/guest picker, interactive map, cancellation terms | Abstract 3D illustration where photos of venues belong |
| **15. Community Platforms** | Member-centric, conversational, chronologic | *Outfit* + *Source Sans 3* | Active discussions, thread filters, member directory | Fake "100k+ active users" with zero visible activity |

---

## Deep Industry Specifications

### 1. Government & Institutional Websites
- **Visual Personality**: High institutional integrity. Uses deep navy (`#0F172A`), official emerald (`#14532D`), or state-seal burgundy (`#7F1D1D`) with neutral crisp parchment (`#F8FAFC`).
- **Layout Architecture**: Header prominently features national/state emblem, official language switcher (English / Hindi / Regional), and high-contrast toggle.
- **Content Hierarchy**: 
  1. Active recruitment notifications / circulars with PDF download links and file sizes (`[PDF, 240 KB]`).
  2. Direct citizen login / candidate roll-number lookup.
  3. Verifiable helpline / grievance officer contact information.
- **Accessibility**: Strict **WCAG 2.2 AA (and Section 508 / GIGW compliance)**. High text contrast ($\ge 7:1$), full keyboard accessibility for tables, no auto-playing banners.

---

### 2. Exam Preparation & Typing Portals (e.g. FastTypingLab)
- **Visual Personality**: Distraction-free, high-focus environment. The test screen must be visually calm with zero intrusive ads, floating badges, or animated backgrounds.
- **Layout Architecture**: 
  1. The actual typing canvas or test configuration picker must be front and center.
  2. Language layout indicator (`Mangal INSCRIPT` vs `Kruti Dev 010`) clearly displayed in the status bar.
  3. Exam-specific parameter indicators: Timer mode (5-min / 10-min / 15-min), Backspace mode (Full / Word-only / Disabled), Error penalty rules (SSC / CPCT / Court).
- **Anti-Slop Check**: Never link an exam landing card to an unrelated test engine. If a candidate clicks "CPCT Hindi Test", route directly to a Remington Gail/Inscript engine with a 15-minute countdown, not a generic English test.

---

### 3. Developer Tools & SaaS Platforms
- **Visual Personality**: Architectural precision, dark/light mode parity, high-contrast monospace tokens.
- **Layout Architecture**: 
  1. Hero section immediately displays real code, CLI commands, or live architectural schematics.
  2. Pricing table clearly states concurrency limits, API rate limits, and seat models without hidden asterisk traps.
  3. Feature explanations show interactive micro-previews rather than generic icons.
- **Anti-Slop Check**: Never use adjectives like "seamless", "magical", or "revolutionary". Explain the exact technical mechanism: *"Distributed cache replication under 5ms via Redis clusters."*

---

### 4. Healthcare & Medical Systems
- **Visual Personality**: Calm, clinical, comforting, authoritative. Soft sage green (`#2D5A43`), warm slate (`#334155`), and clean ivory canvas (`#FAFAF9`).
- **Layout Architecture**: 
  1. Urgent Care / Emergency hotline prominently pinned at the top.
  2. Single-click appointment booking and patient portal login.
  3. Clear clinician credentials and hospital accreditations.
- **Anti-Slop Check**: Avoid trendy dark-mode defaults. Medical websites must be luminous, highly legible in daylight, and usable by seniors on low-cost Android phones.


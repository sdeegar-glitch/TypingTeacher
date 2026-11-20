# Research, Citations and Design Intelligence Bibliography

This reference documents the empirical research, agency analyses, open-source audit tools, and technical studies that underpin the `ai-slop-remover` skill. Material focuses on publications from January 2025 through 2026 addressing design homogenization, model collapse, and human-crafted digital design.

---

## 1. Empirical Studies on AI Design Homogenization

### The Adrian Krebs "Show HN" Audit & `design-slop-cop` (2025–2026)
- **Source**: Krebs, A., *Design Slop Cop: Automated Detection of 14 Deterministic AI Design Patterns*, open-source utility (`github.com/AdrianKrebs/design-slop-cop`).
- **Key Finding**: An automated audit of over 2,400 landing pages deployed via AI code generators revealed that 76.4% contained at least four identical visual signatures:
  1. `from-indigo-500 to-purple-600` linear gradients.
  2. Pill-shaped badge chips placed immediately above a centered H1.
  3. Indiscriminate `rounded-2xl` / `rounded-3xl` corner radii.
  4. Three-card bento grids with small Lucide icons and two-line descriptions.
- **Relevance**: Demonstrates that AI-generated websites are not randomly diverse; they are statistically clustered around a tight, predictable set of defaults.

### Model Collapse & The Synthetic Design Feedback Loop (2025)
- **Source**: Shumailov, I. et al., *The Curse of Recursion: Training on Generated Data Makes Models Forget*, Nature / ArXiv.
- **Application to Web Design**: As millions of AI-generated websites are deployed and indexed, web scrapers ingest this synthetic code into future LLM training corpora. This shrinks the distribution tails of design possibilities, forcing subsequent model generations to converge even more heavily on the "median" design: Tailwind defaults, Inter typography, and shadcn/ui components.

### Dixi Agency: The Consumer Trust Deficit in AI Web Design (2025)
- **Source**: Dixi Digital Studio, *Why Consumers Trust "Vibe-Coded" Sites 42% Less*, Agency Whitepaper (`dixi.agency`).
- **Key Finding**: Independent consumer testing revealed that when visitors detect standard AI template markers (specifically floating gradient blobs, generic 3D illustrations, and buzzword headlines like "Transform your workflow"), perceived institutional credibility drops by 42%. Users subconsciously associate these patterns with fleeting dropshipping projects, crypto scams, or unmaintained side projects.

---

## 2. Premier Design Studio Practices & Trend Analysis (2025–2026)

### Awwwards & Godly: The Pushback Against Flat Perfection
- **Sources**: Awwwards Annual Jury Review (2025/2026); Godly Web Curations (`godly.website`).
- **Key Finding**: The defining characteristic of contemporary award-winning web design is the deliberate projection of **human authorship, tactile friction, and print heritage**:
  - *Tactile Brutalism & Physicality*: Crisp 1px solid boundaries, simulated paper grain, and industrial metadata grids replacing soft blurred shadows.
  - *Maximalist & Kinetic Typography*: Editorial serifs (*Newsreader*, *Fraunces*, *PP Editorial New*) taking over as primary hero visual assets, breaking rigid column grids.
  - *Restrained Purposeful Motion*: High-speed micro-interactions (100–180ms) replacing floating particle effects and slow hover animations.

### Tenex Studio & Developer's Digest: The Em Dash and Copywriting Slop
- **Sources**: Tenex Studio, *The Anatomy of AI Slop in Web Copywriting* (`tenex.studio`); Developer's Digest Tech Reports (`developersdigest.tech`).
- **Key Finding**: LLMs heavily overuse abstract corporate buzzwords ("seamless", "elevate", "supercharge", "unprecedented", "in today's fast-paced digital landscape") and lean excessively on em dashes (`—`) in buttons and subheads. Replacing these with domain-specific facts immediately restores a natural human tone.

---

## 3. Open-Source Tooling & Anti-Slop Repositories

1. **`css-slop-detector`**: Python-based static analysis scanner detecting glassmorphism overuse, missing light-mode tokens, and bloated CSS utility sprawl (`github.com/css-slop-detector`).
2. **`impeccable.style`**: Modern frontend design linter enforcing strict token constraints and preventing unconstrained utility injection (`impeccable.style`).
3. **`scanaislop.com`**: Web-based heuristic analyzer inspecting DOM trees for repetitive structural bento grids and centered hero clichés.

---

## 4. Web Accessibility & Technical References

- **W3C Web Content Accessibility Guidelines (WCAG) 2.2**: Recommendation published October 2023 / current through 2026. Specific criteria enforced:
  - *SC 1.4.3 Contrast (Minimum)*: 4.5:1 text contrast.
  - *SC 1.4.11 Non-text Contrast*: 3.0:1 UI component boundaries.
  - *SC 2.4.7 Focus Visible* & *SC 2.4.13 Focus Appearance*.
  - *SC 2.5.8 Target Size (Minimum)*: $24 \times 24\text{px}$ minimum, $48 \times 48\text{px}$ recommended.
- **Indian Government Guidelines for Indian Websites (GIGW 3.0)**: National Informatics Centre (NIC) standards for bilingual typography, accessibility, and high-density citizen service delivery.


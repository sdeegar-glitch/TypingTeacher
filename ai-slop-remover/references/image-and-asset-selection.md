# Image and Asset Selection Guide — Authenticity Over AI Stock

One of the most obvious tells of an AI-generated website is its imagery:
1. **3D Pastel Clay Figurines**: Isometric cartoon figures holding oversized smartphones or typing on floating keyboards.
2. **AI-Generated Synthetic Portraits**: People with glassy stares, unnatural skin gradients, and deformed fingers presented as "Our Team" or "Satisfied Customers".
3. **Disconnected Abstract Visuals**: Neon wireframe spheres, purple glowing cubes, and generic cybernetic grids that have zero correlation with what the product actually does.

This guide provides guidelines for selecting, creating, and optimizing authentic assets.

---

## 1. What to Replace and What to Put in Its Place

| AI Stock Cliché | Why It Fails | Authentic Human Alternative |
|---|---|---|
| 3D floating pastel clay character typing on laptop | Signals cheap toy software, breaks institutional trust | High-resolution crisp screenshot of the actual typing interface with active cursor and score telemetry |
| Synthetic AI portrait for "Founder" or "Testimonials" | Immediate trust destruction if an observant visitor notices AI artifacts | Real student test score cards, verifiable exam roll numbers, or remove avatars entirely in favor of editorial quotes |
| Neon isometric cube floating in a dark void | Pure visual filler with zero storytelling value | Architectural schematic, keyboard layout diagram, or an authentic data visualization |
| Generic multi-color Lucide/Feather icon in a colored circle | Appears in thousands of AI templates identically | Bespoke hairline monochrome SVG icons or typography-only labels |

---

## 2. Technical Diagramming as a Trust Asset

Instead of abstract stock graphics, premier websites use **schematics and domain-authentic diagrams**.

For example, on a typing tutor or educational exam website:
- An accurate SVG mechanical keyboard layout showing home-row resting points (`ASDF` / `JKL;`) and finger assignment zones.
- An annotated visual comparison of **Mangal (INSCRIPT)** vs **Kruti Dev 010** key mappings.
- A workflow diagram showing how a keystroke moves through the scoring engine (Key Depression $\rightarrow$ Grapheme Cluster Alignment $\rightarrow$ Word Alignment $\rightarrow$ Soukoreff Error Classification).

These diagrams demonstrate deep domain competence rather than superficial decoration.

---

## 3. Image Performance & Modern Formats

Never ship uncompressed PNGs or massive 4MB JPEG banners. Every image asset must adhere to performance standards:

1. **Modern Formats**: Convert all photography and raster mockups to **WebP** or **AVIF** (typically 60–80% smaller than legacy JPEG/PNG with superior sharpness).
2. **Explicit Dimensions to Prevent Layout Shift**:
   Always declare explicit `width` and `height` attributes (or `aspect-ratio` in CSS) on `<img>` tags to eliminate Cumulative Layout Shift (CLS):
   ```html
   <img 
     src="/images/exam-interface.webp" 
     alt="FastTypingLab Hindi typing interface displaying 10-minute timer and live WPM score"
     width="1200" 
     height="750" 
     loading="lazy" 
     decoding="async"
     class="w-full h-auto rounded-lg border border-brand-border"
   />
   ```
3. **Responsive Images with `srcset`**:
   Serve scaled images according to device resolution:
   ```html
   <img 
     src="/images/hero-desktop.webp" 
     srcset="/images/hero-mobile.webp 480w, /images/hero-tablet.webp 800w, /images/hero-desktop.webp 1200w" 
     sizes="(max-width: 600px) 480px, (max-width: 1024px) 800px, 1200px" 
     alt="Authentic exam interface demonstration" 
   />
   ```
4. **SVG Icon Hygiene**: Strip unnecessary metadata, editor tags (Inkscape/Adobe Illustrator wrappers), and inline hardcoded colors (`fill="#000000"`) from SVG icons. Replace with `currentColor` so icons inherit text color gracefully:
   ```svg
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
     <!-- Path data -->
   </svg>
   ```


# KRISHIBONDHU DESIGN SYSTEM (MASTER.md)
**Visual Archetype:** Modern Organic Editorial + Bento Utility  
**Platform Domain:** Agricultural Intelligence & Agronomy Platform  
**Target Audience:** Indian & Bengali Farmers, Agronomists, Rural Communities  
**Version:** 3.0.0 (Production Master)

---

## 1. Philosophical Manifesto & Anti-AI Slop Rules
Krishibondhu is an essential utility for rural livelihood, food security, and agricultural prosperity. It is **not** a Silicon Valley tech gadget, nor an AI art project.

### Zero-Tolerance Anti-Patterns (BANNED):
- ❌ **No Neon Gradients or Lime Green (`#00FF00`, `#00FFFF`):** Unnatural, visually vibrating, and illegible in outdoor Indian sunlight.
- ❌ **No 3D Cartoon Avatars or Fake AI Robots:** Condescending to farmers; replaced with real editorial photography, authentic crop imagery, and tactile data displays.
- ❌ **No Empty "Card Trios" with Generic Buzzwords:** Every container must display actionable data, real crop diagnostics, live prices, or tangible guidance.
- ❌ **No Gray-on-Gray Low Contrast Text:** All interface typography strictly complies with WCAG AA (4.5:1 minimum) and AAA (7:1 for core text) for outdoor field visibility.
- ❌ **No Glowing Purple/Violet Floating Boxes:** Grounded earth, deep pine forest, and warm seed-husk paper tones only.

---

## 2. Color Palette & Semantic Tokens

### Canvas & Surfaces (Warm Earth & Seed Husk)
- **`--canvas-paper` (`#F9F7F2`):** Primary background canvas. Warm, organic, tactile seed-husk off-white. Replaces harsh sterile `#FFFFFF`.
- **`--canvas-dark` (`#0E1A14`):** Dark mode canvas; deep fertile nocturnal earth.
- **`--surface-card` (`rgba(255, 255, 255, 0.85)`): Clean, frosted utility card surface.
- **`--surface-card-border` (`rgba(20, 50, 36, 0.10)`): Crisp 1px structural delineation. Zero muddy dropshadows.

### Primary Brand (Heritage Flora)
- **`--pine-deep` (`#143224`):** The foundational anchor color. Deep, majestic pine and Sundarban mangrove forest.
- **`--pine-medium` (`#1E4733`):** Active interactive states, focused headers, and primary buttons.
- **`--pine-light` (`#EAF2EC`):** Soft organic tint for badges, affirmative states, and card chips.

### Secondary Accents (Harvest & Soil)
- **`--harvest-ochre` (`#D9822B`):** Golden ripe mustard, wheat ears, and harvest amber. Used for high-priority alerts, market rates, and action cues.
- **`--harvest-ochre-light` (`#FDF5EC`):** Soft ochre backdrop for mandi prices and financial guidance.
- **`--rich-loam` (`#2D2319`):** Deep, fertile alluvial Gangetic silt and soil. Grounded text and solid anchors.

### Typography & Readability Tokens
- **`--text-primary` (`#10241A`):** Ultra-high contrast deep forest text. Contrast ratio on `#F9F7F2` is **12.4:1** (exceeds WCAG AAA).
- **`--text-secondary` (`#384D41`):** Subtext and secondary labels. Contrast ratio is **6.8:1** (exceeds WCAG AA).
- **`--text-muted` (`#5E7367`):** Metadata, dates, and non-critical cues. Minimum **4.6:1** contrast.

---

## 3. Typography Architecture

### Typefaces:
1. **Display & Headings:** `Plus Jakarta Sans` / High-Contrast Structured Grotesque with optical tracking (`-0.03em`) and heavy weight (700-900) for monumental authority.
2. **Body & Interface:** Clean sans-serif with `line-height: 1.6` and generous word-spacing for effortless reading in Bengali, Hindi, and English.
3. **Indic Scripts:** `Noto Sans Bengali` & `Noto Sans Devanagari` as native system fallbacks for absolute script purity.

### Scale:
- **Display 1:** `clamp(2.25rem, 5vw, 3.75rem)` / line-height: 1.15 / font-weight: 800
- **Heading 2:** `clamp(1.75rem, 3.5vw, 2.5rem)` / line-height: 1.25 / font-weight: 700
- **Heading 3:** `1.25rem` (20px) / line-height: 1.4 / font-weight: 700
- **Body Large:** `1.125rem` (18px) / line-height: 1.6 / font-weight: 400
- **Body Regular:** `0.9375rem` (15px) / line-height: 1.6 / font-weight: 500
- **Caption / Meta:** `0.8125rem` (13px) / line-height: 1.4 / font-weight: 600

---

## 4. Bento Grid Spatial Rhythm
- **Rhythm Unit:** 8px base grid.
- **Card Radius:** `rounded-3xl` (24px) for organic, fluid borders.
- **Inner Padding:** Minimum `p-6` (24px) up to `p-8` (32px) for expansive breathing room.
- **Elevation:** 1px subtle crisp border (`border border-emerald-950/10`) paired with a micro-lift shadow `shadow-[0_2px_12px_rgba(20,50,36,0.04)]`.
- **Hover Micro-interaction:** `translate-y-[-2px]` with border color transition to `border-emerald-900/25`.

---

## 5. Touch & Ergonomics Checklist
1. **Touch Targets:** Minimum `48px x 48px` for all interactive buttons, pills, and toggles (vital for field use with rough or wet fingers).
2. **No Hover Dependency:** Every interaction is 100% accessible via tap/click with instant visual feedback.
3. **Multilingual Purity:** Zero mixed-language leaks between English, Bengali, and Hindi.

# Editorial Ledger Design System

### 1. Overview & Creative North Star
**Creative North Star: The Financial Curator**
The Editorial Ledger is a design system that treats financial data with the same reverence and aesthetic precision as a high-end broadsheet or art magazine. It rejects the cluttered, "dashboard-first" mentality of traditional fintech in favor of intentional whitespace, dramatic typographic shifts, and a layout that feels curated rather than generated.

The system breaks the rigid template look through:
*   **Intentional Asymmetry:** Hero sections use unbalanced proportions (60/40 splits) to guide the eye.
*   **Atmospheric Depth:** Relying on blurs and gradients rather than lines to define significance.
*   **Editorial Scaling:** Using extreme font size contrasts (e.g., 6rem vs 10px) to establish a clear narrative hierarchy.

### 2. Colors
The palette is rooted in a professional "Fidelity" blue, supported by an organic "Success" emerald and a "Cautionary" orange.

*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for major sectioning. Layout boundaries are created via shifts from `surface-container-low` to `surface-container-high`.
*   **Surface Hierarchy:** Use the 5 tiers of surface containers to "nest" information. Data tables sit on `surface`, while search bars and interactive elements sit on `surface-container`.
*   **The "Glass & Gradient" Rule:** The navigation bar must utilize `glass-nav` properties (90% opacity white with 16px backdrop blur). Hero elements should use the `income-card-gradient` (Linear 135deg: #1978e5 to #1d4ed8).
*   **Signature Textures:** Use `primary-container` at low opacity (20-30%) for hover states and subtle card backgrounds to provide a soft, airy feel.

### 3. Typography
The system uses a pairing of **Manrope** (Headlines) and **Inter** (Body/Labels) to balance character with utility.

**Real-World Typography Scale:**
*   **Display (Hero Stats):** 6rem (96px), Extrabold, Tracking-tight.
*   **Headline 1:** 3rem (48px), Extrabold, used for page titles.
*   **Headline 2:** 1.875rem (30px), Extrabold, for section headers.
*   **Body (Primary):** 1.125rem (18px), Medium, for lead paragraphs.
*   **Body (Secondary/Table):** 1rem (16px) or 0.875rem (14px), Regular/Semi-bold.
*   **Micro-Labels:** 10px or 11px, Black (900 weight), All-caps, with 0.15em–0.2em letter spacing for metadata and table headers.

The hierarchy is built on "The Editorial Leap"—jumping directly from massive display text to tiny, high-contrast metadata to create a sophisticated, high-end feel.

### 4. Elevation & Depth
Elevation is expressed through **Tonal Layering** and **Ambient Diffusion** rather than harsh shadows.

*   **The Layering Principle:** Stack `surface-container-lowest` elements (like white cards) on top of `surface` (pale blue-grey) to create natural separation.
*   **Ambient Shadows:** Use the "Soft Shadow" definition: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`. These shadows are barely perceptible but essential for grounding floating modules.
*   **Glassmorphism:** Navigation and context-specific overlays must use backdrop-filter (blur) to maintain context of the underlying data.
*   **Shadow Grounds:** For high-action elements like FABs, use `shadow-2xl` for maximum separation.

### 5. Components
*   **Buttons:** Primary buttons are large, rounded-2xl, using 100% saturation `primary` and high-contrast `on-primary` text. Weight should be "Black" (900) for a bold brand voice.
*   **Data Tables:** Rows must feature `group-hover` transitions. Actions (edit/delete) should remain hidden (`opacity-0`) until the row is hovered, then slide into view (`translateX(0)`).
*   **Input Fields:** Inputs use `surface-container` backgrounds with no borders. Focus states use a subtle 2px ring of `primary/20`.
*   **Curated Cards:** Information blocks (like "Upcoming") should use a mix of `surface-container-lowest` and thin `outline-variant/40` borders for a paper-like quality.

### 6. Do's and Don'ts
*   **Do:** Use italics for emphasis in headlines (e.g., "Portfolio *Ledger*") to lean into the editorial aesthetic.
*   **Do:** Use pill-shaped badges (e.g., "Monthly") for status indicators to contrast against the more structured grid.
*   **Don't:** Use standard 400-weight text for labels; use 700 or 900 weight at smaller sizes for better legibility and "premium" feel.
*   **Don't:** Over-populate the sidebar. Keep sidebar navigation minimal and focused on "Curated Lists."
*   **Do:** Ensure a minimum of 2rem (32px) padding within main content cards to preserve the "Spacious" density setting.
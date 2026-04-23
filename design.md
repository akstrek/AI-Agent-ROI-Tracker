# Ergon Design System: The Obsidian Chrome Archetype

This document provides a comprehensive log of the **Ergon** design evolution, covering the visual language, animation principles, and architectural refinements used to achieve a high-performance, cinematic tech aesthetic.

---

## 1. Visual Language & Brand Framework

Ergon is defined by high-contrast minimalism, technical precision, and celestial depth.

### Color Palette
- **Charcoal Base (`#0a0a0a`)**: The void. Used for the primary background.
- **Charcoal Light (`#050505`)**: Used for the cinematic preloader background for absolute depth.
- **Neon White (`#ffffff`)**: The primary light source. Used for active text, glows, and key UI markers.
- **Metallic Grey (`#7f8c8d`)**: Structural elements. Used for secondary text, tile borders, and dim states.
- **Technical Light Red (`#FF3131`)**: The functional accent for the Tool Ecosystem. Used for progress indicators, success states, and critical data nodes in dashboards.
- **Glassmorphic Glow**: High-translucency white with variable bloom for depth.

### Typography
- **Primary Interface**: `Inter` (Sans). Chosen for superior legibility in technical, data-heavy environments.
- **Branding/Display**: `Space Grotesk`. Geometric and tech-forward.
- **Technical/Data**: `JetBrains Mono`. Monospaced for a "system terminal" feel.

### UI Primitives
- **Glassmorphism**: 
  - `backdrop-blur: 20px`
  - `background: rgba(255, 255, 255, 0.03)`
  - `border: 1px solid rgba(255, 255, 255, 0.1)` (Precision hardened)
- **Bento Tiles**:
  - `background: rgba(255, 255, 255, 0.02)`
  - `border: 1px solid rgba(127, 140, 141, 0.2)`
  - `border-radius: 12px`
- **Neon Bloom**: 
  - Implementation: Layered `drop-shadow` filters creating a natural light dissipation effect.

---

## 2. Component Architecture

### A. The Cinematic Preloader
Represents "protocol initialization."
- **Markup**: Full-screen div with `#050505` background.
- **Centric Logo**: Sharp angular "E" SVG path within a reactive 3D shadow container.
- **Stroke Animation**: Animate `pathLength` from 0 to 1 with custom easing for a "scanning" effect.
- **Counter**: Monospace percentage counter at the bottom-right, synced with calibration protocols.

### B. The Sticky Header (100px - 120px)
- **Navigation**:
  - **Magnetic Interaction**: Uses spring physics to pull nav labels toward the cursor.
  - **Powered Down**: 50% opacity metallic grey.
  - **Ignited**: 100% white with a blooming shadow and layout-persistent nav line.
- **Desktop Authentication Stacking**:
  - **Layout**: "Log In" and "Sign Up" are vertically stacked on the right, shifted below the main nav bar line.
  - **Interaction**: 
    - **Log In**: Glassmorphic, emitting a soft white glow on hover.
    - **Sign Up**: Solid neon-white with black text, dimming slightly on hover for tactile feedback.

### C. The Eternal Void (Background)
- **3D Symbol**: An extruded, high-gloss "E" symbol with reactive tilt logic (max 30deg) powered by `motion/react`.
- **Liquid Ribbons**: 12 depth-mapped SVG threads that pulse and flow using `strokeDashoffset` animations.

---

## 3. The Tool Dashboard (Active State)

When a tool is activated, the bento grid slides out to reveal a dedicated functional terminal.
- **Thematic Transition**: The UI accents shift from neutral/blue to **Technical Light Red (#FF3131)**, signaling an active "Functional Mode."
- **Background Bloom**: A fixed `-z-10` glow using `bg-[#FF3131]/5` with a `120px` blur is anchored to the dashboard to provide subtle environmental immersion.
- **Header Section**: Contains the Protocol Title and a reactive **Export Data** button.
- **Export Action**: Features a "Neon Inversion" effect—background turns solid white, and text turns sharp black on hover.

---

## 4. Interaction & UX Principles

### Transition Sequences
1. **Initial Load**: Preloader fades -> Zoom into the "Void".
2. **Dashboard Entrance**: Landing copy and tiles stagger in from the bottom.
3. **Sub-page Transition**: Horizontal slide transitions between tool views.

### Mobile Navigation Refinements
- **Scrollable Overlay**: The mobile menu supports vertical overflow to accommodate tool expansion.
- **Z-Index Layering**: Overlay sits at `z-[10000]` to cover high-priority UI badges.
- **Dedicated Exit**: A neon-bordered "X" button inside the overlay provides a clear escape path.
- **Header Sync**: The main burger menu trigger fades out/scales down when the overlay is active to reduce visual noise.

### Starfield Dynamics
- In tool pages, background stars react to cursor proximity by increasing their radius and luminosity (`0.5px` to `2.5px`).

---

## 5. Implementation Stack & System Resilience

- **Engine**: React 19 + Vite 6.
- **Motion**: Motion (`motion/react`) for spring-based physics.
- **Resilient Patterns**:
  - **Supabase Proxying**: Uses a JS `Proxy` for lazy initialization of backend services.
  - **Mock Fallback**: Automatic activation of "Mock Mode" if environment variables are missing, ensuring the application remains interactable for demonstration.
- **Normalization**: Centralized structure in `/src` with `@/` path aliasing for robust modules.

---

## 6. Critical Constraint: "The Glow"
Glows must never be flat. Always layer transparent shadows to simulate realistic light dissipation in a vacuum.

# Design System Specification: The Obsidian Observatory

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Obsidian Observatory."** 

This is not a generic dashboard; it is a high-precision instrument. We move away from the "flat SaaS" aesthetic by treating the interface as a physical environment of layered obsidian glass and controlled light. The system rejects the rigid, boxy constraints of traditional grids in favor of **Intentional Asymmetry** and **Tonal Depth**. By utilizing extreme typographic scales and overlapping translucent surfaces, we create an experience that feels like a high-end laboratory interface—sophisticated, immersive, and authoritative.

## 2. Colors & Atmospheric Depth
Our palette is rooted in the void. We use the deep neutral tones to establish a hierarchy of "nearness" to the user, while purple and cyan act as functional luminescence.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established solely through:
1.  **Background Color Shifts:** Placing a `surface_container_low` element against a `surface` background.
2.  **Tonal Transitions:** Using subtle value changes to imply a break in content.
3.  **Negative Space:** Utilizing the Spacing Scale (specifically `12` (4rem) and `16` (5.5rem)) to create breathing room that acts as a structural divider.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material surface tokens to define "Z-space":
*   **Base Layer:** `surface` (#131313) or `surface_container_lowest` (#0e0e0e) for the deepest background.
*   **Mid Layer:** `surface_container` (#201f1f) for primary content areas.
*   **High Layer:** `surface_container_high` (#2a2a2a) for interactive elements and active cards.
*   **Nesting:** To define importance, nest a `surface_container_lowest` card inside a `surface_container_high` section. This "inverted depth" creates a sophisticated, recessed look that feels machined and intentional.

### The "Glass & Gradient" Rule
To achieve a "Technical Laboratory" feel, floating elements (modals, popovers, navigation) must use **Glassmorphism**.
*   **Formula:** `surface_variant` at 40% opacity + `backdrop-filter: blur(20px)`.
*   **Signature Textures:** Main CTAs and Hero accents should utilize a linear gradient from `primary` (#d0bcff) to `primary_container` (#a078ff) at a 135-degree angle. This prevents the "flat" look and adds a sense of energy and soul.

## 3. Typography
The typography system balances the editorial elegance of **Space Grotesk** with the functional clarity of **Inter**.

*   **Display & Headlines (Space Grotesk):** These are our "Technical Accents." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments. The geometric nature of Space Grotesk provides the "futuristic" edge without looking "sci-fi."
*   **Body & Titles (Inter):** All UI-critical information uses Inter. It is the "Workhorse."
*   **Technical Readouts:** Use the Monospace scale for any formulas, timestamps, or data coordinates. This reinforces the laboratory vibe.
*   **The Contrast Rule:** Pair a very large `headline-lg` with a very small `label-sm` (0.6875rem) in uppercase with 0.1em letter-spacing to create a "High-End Editorial" hierarchy.

## 4. Elevation & Depth
In a premium dark mode, we don't use shadows to create "lift"; we use **Tonal Layering** and **Ambient Glows**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface_container_highest` element naturally feels "closer" to the user than `surface_dim`.
*   **Ambient Shadows:** For floating glass components, use extra-diffused shadows.
    *   *Shadow Color:* A tinted version of `primary` or `secondary` at 5% opacity.
    *   *Values:* `0px 24px 48px rgba(208, 188, 255, 0.08)`.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, it must be a **Ghost Border**. Use the `outline_variant` token (#494454) at 15% opacity. Never use 100% opaque borders.
*   **Light Beams:** Use 1px-height gradients of `secondary` (#4cd7f6) that fade to 0% opacity to "underline" section headers, mimicking a laser-etched line.

## 5. Components

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. Roundedness: `md` (0.75rem). No border.
*   **Secondary (Glass):** `surface_variant` (20% opacity) with a `backdrop-filter`. A Ghost Border using `outline` at 20%.
*   **Micro-interaction:** On hover, the primary button should emit a soft `primary` outer glow (`box-shadow: 0 0 20px #d0bcff33`).

### Input Fields
*   **Visual Style:** Do not use four-sided boxes. Use a `surface_container_low` background with a `md` (0.75rem) corner radius. 
*   **Active State:** The bottom edge receives a 2px glow of `secondary` (#4cd7f6). Helper text must use `label-sm` in `secondary`.

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Execution:** Separate list items using `spacing-2` (0.7rem) and alternating `surface_container_low` and `surface_container` backgrounds. 
*   **Cards:** Use `lg` roundedness (1rem). Ensure a 40px internal padding (`spacing-10`) to maintain the "Minimal & Sophisticated" look.

### The "Data Perimeter" (Signature Component)
A custom container for technical data. It features a semi-transparent `surface_container_highest` background, `xl` roundedness (1.5rem), and small "crosshair" icons in the four corners using `outline_variant` to mimic a laboratory viewport.

## 6. Do's and Don'ts

### Do
*   **Use Asymmetry:** Place technical labels (`label-sm`) off-center or rotated 90 degrees to break the "template" feel.
*   **Embrace the Void:** Use the `spacing-24` (8.5rem) token between major sections to let the technical elements "breathe."
*   **Subtle Animation:** Ensure all hover states have a 300ms cubic-bezier transition. Soft blurs should "freshen" rather than "pop."

### Don't
*   **Don't use pure white:** All "on-surface" text should use `on_surface` (#e5e2e1) to reduce eye strain and maintain the dark-room atmosphere.
*   **Don't use "Childish" Icons:** Avoid thick, rounded, "bubbly" icons. Use thin-stroke (1px or 1.5px) technical icons.
*   **Don't Grid-Lock:** Avoid forcing every element into a perfectly symmetrical column. Offset elements by `spacing-4` to create visual interest.
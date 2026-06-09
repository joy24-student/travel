---
name: Midnight & Champagne
colors:
  surface: "#f8f9fa"
  surface-dim: "#d9dadb"
  surface-bright: "#f8f9fa"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f3f4f5"
  surface-container: "#edeeef"
  surface-container-high: "#e7e8e9"
  surface-container-highest: "#e1e3e4"
  on-surface: "#191c1d"
  on-surface-variant: "#454652"
  inverse-surface: "#2e3132"
  inverse-on-surface: "#f0f1f2"
  outline: "#767683"
  outline-variant: "#c6c5d4"
  surface-tint: "#4c56af"
  primary: "#000666"
  on-primary: "#ffffff"
  primary-container: "#1a237e"
  on-primary-container: "#8690ee"
  inverse-primary: "#bdc2ff"
  secondary: "#735c00"
  on-secondary: "#ffffff"
  secondary-container: "#fed65b"
  on-secondary-container: "#745c00"
  tertiary: "#675f32"
  on-tertiary: "#ffffff"
  tertiary-container: "#b6ac77"
  on-tertiary-container: "#474016"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#e0e0ff"
  primary-fixed-dim: "#bdc2ff"
  on-primary-fixed: "#000767"
  on-primary-fixed-variant: "#343d96"
  secondary-fixed: "#ffe088"
  secondary-fixed-dim: "#e9c349"
  on-secondary-fixed: "#241a00"
  on-secondary-fixed-variant: "#574500"
  tertiary-fixed: "#efe3aa"
  tertiary-fixed-dim: "#d2c790"
  on-tertiary-fixed: "#201c00"
  on-tertiary-fixed-variant: "#4e471c"
  background: "#f8f9fa"
  on-background: "#191c1d"
  surface-variant: "#e1e3e4"
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: "700"
    lineHeight: 48px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-lg:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: "700"
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style

This design system is engineered for a premium "Hotels & Homes" mobile experience, positioning the product as a digital concierge rather than a mere booking engine. The brand personality is **sophisticated, discerning, and effortless**. It targets high-end travelers who value curation over quantity and seek a sanctuary within the UI itself.

The visual style is a fusion of **Modern Minimalism** and **Soft Glassmorphism**. We move away from flat, utilitarian patterns toward a bespoke, editorial aesthetic. By leveraging generous whitespace, high-contrast typography, and tactile depth, the design system evokes the feeling of flipping through a luxury travel magazine. The emotional response should be one of "quiet luxury"—calm, confident, and meticulously organized.

## Colors

The palette is anchored by **Midnight Blue**, a deep, authoritative primary that replaces the standard "app blue" with something more regal and grounded.

- **Primary (Midnight Blue):** Used for key actions, brand moments, and structural hierarchy.
- **Accent (Champagne/Gold):** Reserved for "Premium" or "Elite" indicators, loyalty badges, and subtle highlights. It should be used sparingly to maintain its value.
- **Backgrounds:** We avoid pure white in favor of a curated **Off-White (#F8F9FA)**. This reduces eye strain and provides a softer canvas for the high-contrast typography.
- **Overlays:** Use semi-transparent variants of Midnight Blue for scrims and image overlays to maintain brand consistency even over diverse photography.

## Typography

The typography system relies on a high-contrast pairing: **Plus Jakarta Sans** for headlines and **Work Sans** for utility and body text.

- **Headlines:** Set in Plus Jakarta Sans with tight tracking (-2% to -4%). This creates a "heavy" editorial feel that commands attention and feels custom-designed.
- **Body:** Work Sans provides a grounded, professional readability. Line heights are kept generous (1.5x minimum) to ensure a breezy, premium reading experience.
- **Labels:** Small caps or uppercase labels with increased letter spacing should be used for metadata like "Price per Night" or "Availability" to differentiate from the descriptive body text.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model specifically optimized for high-end mobile viewports.

- **The 8px Grid:** All spacing and component heights must be multiples of 8px to ensure a consistent visual rhythm.
- **Safe Zones:** A generous **20px horizontal margin** is applied to the main container to prevent content from feeling "cramped" against the device edges.
- **Vertical Rhythm:** Use larger gaps (stack-lg) between distinct sections (e.g., between "Amenities" and "Reviews") to emphasize the editorial structure.
- **Mobile Reflow:** For cards in a list, utilize a single-column layout to let high-resolution photography shine. Use a "peek" behavior for horizontal carousels to indicate more content without cluttering the screen.

## Elevation & Depth

To achieve a "bespoke" feel, we avoid standard material shadows. Instead, we use **Ambient Multi-layered Shadows** and **Glassmorphism**.

1.  **The Base:** Most surfaces reside on the background level (#F8F9FA).
2.  **Elevated Cards:** Use two shadow layers—one tight and dark (10% opacity) for definition, and one wide and soft (5% opacity, 30px+ blur) to create a "floating" effect.
3.  **Glassmorphism:** Navigation bars and sticky CTA containers should use a backdrop filter (Blur: 20px) with a semi-transparent white tint (80%). This maintains context of the imagery behind the UI.
4.  **Interaction:** Upon press, elements should visually "sink" by reducing shadow spread, providing tactile feedback that feels more physical than digital.

## Shapes

The shape language is defined by **Soft Geometricism**.

- **Standard Elements:** Buttons and input fields use a **0.5rem (8px)** radius to maintain a modern, professional edge.
- **Featured Cards:** Large property cards use **rounded-lg (16px)** or **rounded-xl (24px)** to create a friendly, approachable frame for photography.
- **Icons:** Use a 1.5pt or 2pt stroke weight with rounded terminals. Sharp corners should be avoided in iconography to maintain the "premium soft" aesthetic.

## Components

- **Buttons:** Primary buttons use a subtle vertical gradient from #283593 to #1A237E. They should feature a "Champagne" colored loading state or focus ring.
- **Cards:** Property cards are the hero component. They must feature a full-bleed image at the top, a "Champagne" badge for rating/status, and minimal metadata. No borders; use the multi-layered shadow defined in "Elevation."
- **Inputs:** Minimalist fields with a subtle bottom border and a glass-like background when focused. Icons should be placed on the left, rendered in a 60% opacity Midnight Blue.
- **Chips:** For amenities (e.g., "WiFi", "Pool"), use a light-gray stroke-only chip with a small icon. These should feel lightweight and secondary.
- **Sticky CTA:** In the mobile view, the "Book Now" button should be housed in a fixed bottom container with a strong backdrop blur effect, allowing the property photography to scroll beautifully behind it.
- **Imagery:** All photos must have a 2px inner-glow/border in a semi-transparent white to "lift" them off the page and give them a professional, finished look.

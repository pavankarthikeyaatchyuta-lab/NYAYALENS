# Accessibility (a11y) & Inclusive Design Statement

## 1. Commitment to Accessibility
NyayaLens is built on the belief that **legal access must be accessible to all**. We aim to conform with WCAG 2.1 Level AA accessibility standards to ensure users of diverse abilities, screen readers, and cognitive needs can navigate and comprehend legal documents seamlessly.

## 2. Implemented Accessibility Features
- **Semantic Structure**: Semantic HTML5 landmark elements (`<header>`, `<main>`, `<aside>`, `<nav>`, `<footer>`, `<section>`).
- **Accessible Colors & High Contrast**:
  - Color palettes tested for minimum 4.5:1 contrast ratio for normal text.
  - Risk indicators utilize redundant visual cues (icons + text badges + distinct colors) so color is never the sole carrier of information.
- **Screen Reader Support**:
  - ARIA labels (`aria-label`, `aria-expanded`, `aria-controls`, `aria-hidden`) on all interactive buttons, sheets, and disclosure accordions.
  - Form controls mapped with explicit labels.
- **Keyboard Navigation**:
  - Full tab stop navigation with visible focus rings (`focus-visible:ring-2`).
  - Escape key handling to dismiss sheets and modals.
- **Cognitive Accessibility**:
  - Dense clauses translated into simplified, plain-English executive summaries.
  - Jargon explanations and "Why It Matters" callouts reduce cognitive strain.
- **Responsive & Zoom**:
  - Full support for browser zoom up to 200% without loss of content.
  - Fluid mobile-first layouts with accessible drawer navigation.

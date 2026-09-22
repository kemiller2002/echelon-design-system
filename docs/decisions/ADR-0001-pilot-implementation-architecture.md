---
id: ADR-0001
title: Pilot implementation architecture
status: accepted
date: 2026-09-22
---

# Decision

Implement the first Echelon Design System pilot with:

- DTCG 2025.10 JSON as the canonical token source;
- a small F#/.NET token compiler that emits CSS custom properties;
- F# compiled to browser-native ES modules with Fable;
- a minimal custom-element lifecycle bridge rather than Lit or another UI runtime;
- open Shadow DOM for switch and slider;
- native `input[type=checkbox]` and `input[type=range]` inside those components;
- ElementInternals for form participation;
- cancelable intent events before consequential local commits;
- Playwright browser verification across Chromium, Firefox, and WebKit.

# Context

The design-system requirements call for framework-independent Web Components, strong accessibility, minimal runtime dependencies, and F#/Ordo compatibility.

Fable.Lit is a viable F# Web Component implementation and is officially documented, but it introduces Lit as a JavaScript runtime dependency. That is unnecessary for the first two controls and conflicts with the repository's minimal-runtime goal.

A completely custom ARIA slider would create additional touch-assistive-technology risk. WAI-ARIA APG continues to warn that some touch assistive technologies may not reliably operate custom slider widgets, while W3C provides a working technique that keeps a native range input as the accessible control.

# Consequences

## Positive

- no UI-framework runtime dependency;
- native keyboard/touch/AT behavior remains the behavioral substrate;
- F# owns reusable logic and component coordination;
- DOM output remains ordinary standards-based Custom Elements;
- token data is portable beyond CSS;
- component behavior can be tested independently of any Echelon application.

## Negative

- the repository owns a small lifecycle bridge that a framework would otherwise provide;
- form-associated custom elements require explicit browser integration and tests;
- Fable output must be bundled and inspected to prevent accidental runtime growth;
- rich templating is more manual than Lit.

# Rejected alternatives

## Lit / Fable.Lit as the default runtime

Rejected for the pilot because the initial controls do not justify a UI runtime dependency. Keep it as a fallback if later complex components demonstrate enough lifecycle/template complexity to outweigh the dependency cost.

## Customized built-in elements

Rejected because Safari still does not plan to support them.

## ARIA-only custom slider

Rejected because native range input provides stronger built-in touch/assistive-technology behavior and WAI warns about custom slider support gaps.

## CSS variables as canonical tokens

Rejected because the stable DTCG format now provides a portable token interchange representation and better separates canonical design decisions from generated platform output.

# Validation plan

This decision is considered validated for the pilot only if:

1. Fable compiles the custom-element bridge without Lit.
2. Bundled components have no runtime npm dependencies.
3. switch and slider work in Chromium, Firefox, and WebKit.
4. native role/name/value behavior is observable in browser tests.
5. form submission works through ElementInternals.
6. cancelable intent events can prevent a state commit.
7. reduced-motion and forced-colors styles remain usable.
8. bundle-size measurements remain small enough to justify the custom bridge.

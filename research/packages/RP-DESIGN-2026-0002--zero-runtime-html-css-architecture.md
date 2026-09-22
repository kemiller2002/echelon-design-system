---
id: RP-DESIGN-2026-0002
title: Zero-runtime HTML and CSS design-system architecture
research_area: design-system
discipline:
  - software-engineering
  - accessibility
  - interaction-design
author_agent: chatgpt
version: 1.0.0
confidence: high
completion: active
priority: high
created: 2026-09-22
updated: 2026-09-22
related_projects:
  - echelon-design-system
related_documents:
  - docs/decisions/ADR-0002-zero-runtime-html-css-components.md
  - requirements/DECLARATIVE-CAPABILITY-MATRIX.md
  - requirements/PILOT-PLAN.md
supersedes: []
superseded_by: []
tags: [design-system, html, css, zero-runtime, limen]
keywords: [html, css, declarative, popover, dialog, slider, limen]
---

# Executive Summary

The design-system architecture can remove component JavaScript entirely without losing the first tier of polished controls.

Semantic HTML plus CSS is sufficient for:

- switch using a native checkbox;
- range slider using native range interaction;
- segmented control using radios;
- disclosure using details/summary;
- non-modal popover using Popover HTML;
- modal dialog on the Invoker Commands browser baseline.

This does not mean all advanced UI can be implemented without behavior. Instead it produces a cleaner boundary: this repository owns semantic markup and CSS; Limen/application F# owns behavior that the browser does not natively provide; Ordo owns domain legality.

# Research question

How far can a professional design system go using only HTML and CSS before behavior legitimately requires Limen?

# Evidence

- EV-DESIGN-2026-0001: WCAG 2.2 interaction baseline.
- EV-DESIGN-2026-0002: WAI-ARIA APG interaction patterns.
- EV-DESIGN-2026-0006: stable DTCG token format.
- EV-DESIGN-2026-0007: native range input is safer slider substrate.
- EV-DESIGN-2026-0010: Foundry palette contrast audit.
- EV-DESIGN-2026-0011: declarative Popover.
- EV-DESIGN-2026-0012: declarative modal dialog commands.
- EV-DESIGN-2026-0013: native details/summary disclosure.

# Conclusions

## Accepted

1. Production design-system artifacts should be HTML and CSS only.
2. Custom Elements are unnecessary for the canonical API.
3. Native HTML state should remain the state substrate when it exists.
4. CSS owns appearance and motion but not semantic/domain state.
5. Limen owns behavior beyond native HTML.
6. Ordo remains above Limen as domain-state authority.
7. Build-time F# is compatible with the zero-runtime rule when it emits static artifacts.
8. The browser runtime budget for the design-system package should be exactly zero bytes.

## Slider-specific conclusion

The CSS-only requirement changes the visual ambition of the slider.

A custom track fill and live value bubble cannot be reliably synchronized to an arbitrary changing native range value across browsers using CSS alone. The canonical slider therefore favors native range presentation with Echelon accent/focus/context styling.

If a product requires live value visualization, that is a Limen/application enhancement.

## Advanced-pattern boundary

Fully declarative:
- switch;
- slider;
- checkbox/radio;
- segmented radio;
- disclosure;
- popover;
- dialog on baseline;
- static tables/layout/content.

Behavior-required:
- tabs with complete APG keyboard coordination;
- autocomplete/combobox;
- multi-range slider;
- date-range picker;
- command palette;
- interactive/virtualized grid;
- tree/treegrid;
- drag/reorder;
- split panes;
- query builders;
- branching wizard;
- upload lifecycle;
- notification lifecycle.

# Validation plan

The architecture is not accepted solely from standards review.

The executable pilot must prove:

- no JS/WASM in dist;
- no script in canonical patterns;
- no production runtime dependencies;
- token compiler invariants;
- native switch/range form and keyboard behavior;
- segmented/disclosure/popover/dialog behavior;
- reduced motion;
- light/dark tokens;
- axe A/AA scan;
- Chromium/Firefox/WebKit compatibility;
- ROS attribution and validation.

# Risks

- applications may duplicate Limen adapters if behavior contracts are not centralized;
- CSS selectors become a public API and require version discipline;
- declarative platform features can have uneven browser rollout;
- visual uniformity may be lower for native controls such as range inputs;
- teams may be tempted to smuggle behavior into inline handlers.

# Mitigations

- publish canonical behavioral contracts for Limen-required patterns;
- enforce zero-runtime artifact scanning in CI;
- cross-browser-test declarative features;
- prioritize accessibility and platform correctness over pixel-identical native widgets;
- version markup/class structures as public API.

# Current validation status

Implementation exists on the pilot branch. ROS attribution is complete as WI-0003. Zero-runtime build, artifact scanning, and token compiler gates have passed; final cross-browser/axe validation is in progress.

# Next step

Complete the pilot validation. If successful, begin a Limen behavior-contract experiment for tabs or combobox without adding JavaScript to the design-system package.

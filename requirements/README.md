# Echelon Design System Requirements

Status: proposed baseline for implementation pilot.

This directory is the canonical requirements set for the Echelon Design System.

The system exists to make Echelon applications look, communicate, and behave consistently without making the design-system package an application runtime.

## Governing principles

1. **HTML and CSS only.** Production design-system components and patterns contain semantic HTML and CSS, never component JavaScript.
2. **Native first.** Browser-native semantics and behavior are preferred over recreated widgets.
3. **Limen owns non-native behavior.** Search, async workflows, grids, command palettes, drag/reorder, and similar behavior belongs outside the design-system package.
4. **Accessibility is a contract.** Accessibility is part of pattern correctness, not a later review step.
5. **Motion communicates state.** CSS animation may explain change, continuity, or feedback but never owns semantic state.
6. **Ordo owns meaningful application state.** Domain legality, capabilities, obligations, external effects, and consequential transitions remain outside visual patterns.
7. **Visual Engineering governs visual decisions.**
8. **Communication Engineering governs interface language.**
9. **Progressive enhancement.** Prefer declarative browser capabilities such as popover, details/summary, dialog commands, modern selectors, and CSS transitions.
10. **Zero browser runtime.** Published design-system artifacts shall contain no JavaScript or WebAssembly runtime.
11. **Mobile is part of correctness.** Every implemented pattern must define and verify a 320px recomposition without changing semantic meaning or domain authority.

## Requirement documents

- DESIGN-SYSTEM-REQUIREMENTS.md
- COMPONENT-CATALOG.md
- MOTION-AND-INTERACTION.md
- ACCESSIBILITY-AND-INCLUSIVE-DESIGN.md
- ORDO-LIMEN-INTEGRATION.md
- QUALITY-AND-DISTRIBUTION.md
- PILOT-PLAN.md
- DECLARATIVE-CAPABILITY-MATRIX.md
- SIGNAL-COMPONENT-MAP.md
- SELECTOR-COMPLETENESS.md
- CROSS-APPLICATION-COMPONENT-WAVE.md
- MOBILE-COMPONENT-CONTRACT.md

## External standards baseline

The requirements are informed by:

- W3C Web Content Accessibility Guidelines 2.2
- WAI-ARIA Authoring Practices Guide
- semantic HTML forms and controls
- HTML Popover
- dialog and Invoker Commands
- details/summary
- CSS selectors, transitions, media features, anchor positioning, and related platform standards
- established design-system patterns from mature systems including Carbon and Spectrum

External systems are references, not dependencies and not visual templates to copy.

# Feature Manifest — physics-derived surface motion

## Purpose

Provide one deterministic CSS-only motion grammar for controls and transient surfaces so perceived mass, entry, settling, and dismissal remain coherent across Forma.

## Ownership

- Semantic open/closed/selected state: native HTML or consuming application
- Motion variables, perceived-weight presets, visual entry/exit response: Forma CSS
- Domain legality, permissions, destructive meaning, obligations, and authorization: application/Ordo
- Non-native interaction models such as full ARIA menu behavior, async command palettes, nonmodal drawers, gesture handling, and tab coordination: Limen/application

## Surface defaults

- light: disclosure, popover, ordinary action menu, tab indicator
- standard: alert and toast notification
- heavy: modal dialog, flyout / modal drawer baseline, command palette

These defaults describe visual inertia only.

## Derived behavior

- inertial entry: `sqrt(mass / stiffness) / damping`
- gravity cue: `sqrt(2 * distance / gravity)`
- exit: `0.68 * inertial entry`, clamped to the supported UI range
- reduced motion: effectively immediate spatial change with final visual state preserved

## Native authority

- `details[open]` owns disclosure state
- `:popover-open` owns Popover state
- `dialog[open]` owns modal/flyout state
- `aria-selected` supplied by the application owns tab semantics

CSS must never create a parallel semantic state machine.

## Tests and verification

- `tests/browser/surface-physics.spec.mjs`
- `tests/browser/overlay-motion.spec.mjs`
- repository-wide mobile, accessibility, zero-runtime, package and cross-browser checks

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-23

# Feature Manifest — checkbox pattern

## Purpose

Provide a reusable native checkbox presentation with a visible non-color checked cue, large delegated label target, and CSS-only physics-derived state motion.

## Ownership

- State: native checkbox checked/disabled/required/focus states in `patterns/checkbox.html`
- Transitions / commands / messages: browser-native `input` and `change`
- Invariants and guards: the native checkbox remains the form and accessibility authority
- Capabilities / authority: none
- Effects: native form submission/reset and DOM events

## Interfaces

- Inbound: native checkbox attributes, Forma class structure, optional `data-ef-motion-weight="light|standard|heavy"`
- Outbound: native checkbox value and events

## Motion

- The visible check glyph uses the shared inertia/settling model.
- Press feedback changes only presentation; it never delays checked state.
- Reduced motion removes perceptible travel/overshoot while preserving the check glyph.

## Tests and verification

- `tests/browser/physics-motion.spec.mjs`
- Repository-wide accessibility, mobile, zero-runtime, package and browser checks

## Modification boundaries

- Keep the native input.
- Assessment choice cards remain `.ef-choice`; this primitive does not replace assessment semantics.
- Application/Ordo owns domain legality.

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-23

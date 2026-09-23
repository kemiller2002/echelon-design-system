# Feature Manifest — flyout pattern

## Purpose

Provide left- and right-edge modal surfaces for contextual navigation, filters, inspection, and bounded tasks while preserving native dialog semantics and Forma's zero-runtime boundary.

## Ownership

- State: native `dialog.open` / top-layer state
- Transitions / commands / messages: browser-native dialog commands and Escape behavior
- Invariants and guards: native modal focus, document inertness, accessible labeling, side-specific presentation
- Capabilities / authority: none
- Effects: native focus placement/restoration and dialog close events

## Interfaces

- Inbound: semantic dialog content, `data-ef-side="left|right"`, optional `data-ef-motion-weight="light|standard|heavy"`
- Outbound: native dialog open/close state and events

## Motion

- Entry travels from the occupied edge using Forma's shared physics-derived inertia model.
- Exit is shorter and uses the damped response rather than spring overshoot.
- The backdrop coordinates with the temporary surface without becoming semantic authority.
- Reduced motion removes the large edge translation and scale while preserving an immediate, clear state change.
- Direct swipe/drag manipulation is not implemented by Forma; if required, Limen/application behavior owns it.

## Tests and verification

- `tests/browser/overlay-motion.spec.mjs`
- `tests/browser/accessibility.spec.mjs`
- Repository-wide mobile, zero-runtime, package, browser, and site checks

## Modification boundaries

- Keep modal flyouts on native `dialog` unless a documented application requirement cannot be met.
- Nonmodal persistent drawers, resize/drag behavior, and swipe-to-close belong to Limen/application code.
- Application/Ordo owns domain legality and the actions presented in the flyout.

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-23

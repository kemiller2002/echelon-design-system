# Feature Manifest — switch pattern

## Purpose

Provide a polished binary on/off control using semantic HTML and CSS only while preserving native checkbox form, keyboard, touch, and accessibility behavior.

## Ownership

- State, including presentation state: native checkbox checked/disabled/required/focus states in `patterns/switch.html`
- Transitions / commands / messages: browser-native `input` and `change`
- Invariants and guards: input remains native and labelled; visual state derives from native checked state
- Capabilities / authority: none — application/Ordo owns domain legality
- Important effects and effect contracts: native form submission/reset and DOM events

## Interfaces

- Inbound: standard checkbox attributes plus required Echelon class structure
- Motion input: optional `data-ef-motion-weight="light|standard|heavy"`; standard is the canonical default
- Outbound: native input/change events and native form value

## Motion

- Thumb travel uses Forma's shared physics-derived inertia duration and spring-settling curve.
- Weight changes mass/stiffness/damping parameters, never the semantic state or activation timing.
- The model is a deterministic CSS approximation, not a continuous physics simulation.
- Reduced motion collapses thumb travel to an effectively immediate visual state change.

## Tests and verification

- Local behavior tests: `tests/browser/switch.spec.mjs`, `tests/browser/physics-motion.spec.mjs`
- Boundary/contract tests: form submission/reset, keyboard, role/name, zero-runtime scan
- Integration/live verification: Playwright Chromium/Firefox/WebKit matrix

## Dependencies

- Allowed direct dependencies: semantic tokens, `src/styles/components.css`
- Required composition context: Limen/application code only when domain behavior exceeds native checkbox semantics

## Modification boundaries

- Normal: `patterns/switch.html`, switch CSS, switch tests
- Escalation required: replacing the native checkbox or introducing component script

## Local agent instructions

- Do not assign a motion weight to imply business importance, risk, permission, or state legality.
- Prefer the standard preset unless a deliberate visual-density or perceived-mass reason is documented.

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-23
- Known gaps: pre-commit domain authorization is an application/Limen concern, not a design-system feature

# Feature Manifest — slider pattern

## Purpose

Provide a polished numeric range control using semantic HTML and CSS only while preserving native range behavior for keyboard, touch, and assistive technology.

## Ownership

- State, including presentation state: native range value/disabled/focus states in `patterns/slider.html`
- Transitions / commands / messages: browser-native `input` and `change`
- Invariants and guards: min/max/step/value remain native HTML contracts
- Capabilities / authority: none — application/Ordo owns domain legality
- Important effects and effect contracts: native form value and DOM events

## Interfaces

- Inbound: standard range attributes plus required Echelon class structure
- Outbound: native input/change events and native form value

## Tests and verification

- Local behavior tests: `tests/browser/slider.spec.mjs`
- Boundary/contract tests: form value, keyboard, accessible name, zero-runtime scan
- Integration/live verification: Playwright Chromium/Firefox/WebKit matrix

## Dependencies

- Allowed direct dependencies: semantic tokens, `src/styles/components.css`
- Required composition context: Limen/application code only for value displays, business validation, persistence, or richer domain behavior

## Modification boundaries

- Normal: `patterns/slider.html`, slider CSS, slider tests
- Escalation required: replacing native range interaction, multi-thumb behavior, live value synchronization inside the design-system package

## Local agent instructions

- none

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-22
- Known gaps: cross-browser CSS cannot reliably synchronize an arbitrary live value bubble or filled custom track without behavior; native range presentation is intentionally retained

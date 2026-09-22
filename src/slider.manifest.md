# Feature Manifest — ef-slider

## Purpose

Provide a polished numeric range input while preserving native range interaction for keyboard, touch, and assistive technology.

## Ownership

- State, including presentation state: `src/Slider.fs`
- Transitions / commands / messages: native range input updates normalized value; continuous input and committed change are distinct
- Invariants and guards: min <= max; value clamped to range; step delegated to native range semantics
- Capabilities / authority: caller receives intent/value events; component does not infer domain legality
- Important effects and effect contracts: ElementInternals form value; DOM events

## Interfaces

- Inbound: min, max, step, value, disabled, label, description
- Outbound: ef-input, ef-change, input, change

## Tests and verification

- Local behavior tests: `tests/browser/slider.spec.mjs`
- Boundary/contract tests: form value, keyboard, role/name, reduced motion
- Integration/live verification: Playwright Chromium/Firefox/WebKit matrix

## Dependencies

- Allowed direct dependencies: Component runtime, semantic tokens
- Required composition context: generated tokens CSS

## Modification boundaries

- Normal: `src/Slider.fs`, slider tests, slider documentation
- Escalation required: replacing native range interaction, multi-thumb extension, event contract change

## Local agent instructions

- none

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-22
- Known gaps: vertical and multi-thumb variants follow only after single-slider evidence

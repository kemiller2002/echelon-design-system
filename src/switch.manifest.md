# Feature Manifest — ef-switch

## Purpose

Provide a polished binary on/off input while preserving native checkbox interaction and form behavior.

## Ownership

- State, including presentation state: `src/Switch.fs`
- Transitions / commands / messages: user request -> cancelable `ef-change-requested` -> accepted local commit -> `input`/`change`
- Invariants and guards: checked is binary; disabled blocks user transition; form value exists only when checked
- Capabilities / authority: caller may cancel requested transition before commit
- Important effects and effect contracts: ElementInternals form value; DOM events

## Interfaces

- Inbound: checked, disabled, required, value, label, description attributes/properties
- Outbound: ef-change-requested, input, change

## Tests and verification

- Local behavior tests: `tests/browser/switch.spec.mjs`
- Boundary/contract tests: form submission, cancellation, keyboard, role/name
- Integration/live verification: Playwright Chromium/Firefox/WebKit matrix

## Dependencies

- Allowed direct dependencies: Component runtime, semantic tokens
- Required composition context: generated tokens CSS

## Modification boundaries

- Normal: `src/Switch.fs`, switch tests, switch documentation
- Escalation required: event semantics, role change, form contract change

## Local agent instructions

- none

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-22
- Known gaps: richer slotted label content deferred until pilot semantics are proven

# Feature Manifest — Foundations

## Purpose

Provide consistent native HTML, layout, focus, surfaces, typography, and form styling below behavior-rich components.

## Ownership

- State, including presentation state: CSS pseudo-classes/media features in `src/styles/foundations.css`
- Transitions / commands / messages: none
- Invariants and guards: semantic token use; visible focus; reduced motion; forced-colors safety
- Capabilities / authority: styling only
- Important effects and effect contracts: none

## Interfaces

- Inbound: semantic design tokens
- Outbound: CSS classes and native-element styling

## Tests and verification

- Local behavior tests: browser fixture visual/computed-style checks
- Boundary/contract tests: no component-domain state
- Integration/live verification: browser tests and documentation fixture

## Dependencies

- Allowed direct dependencies: semantic tokens
- Required composition context: none

## Modification boundaries

- Normal: `src/styles/**`
- Escalation required: global element behavior changes that could alter application semantics

## Local agent instructions

- none

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-22
- Known gaps: typography font files are not yet self-hosted by the package

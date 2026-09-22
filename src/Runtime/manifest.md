# Feature Manifest — Component runtime

## Purpose

Provide the smallest Fable/browser bridge needed to register autonomous Custom Elements without adopting a UI framework runtime.

## Ownership

- State, including presentation state: lifecycle bridge only; component state remains component-owned
- Transitions / commands / messages: custom element lifecycle forwarding and DOM event helpers
- Invariants and guards: one registration per tag; open Shadow DOM; no domain logic
- Capabilities / authority: registration, property reflection, custom event dispatch
- Important effects and effect contracts: browser CustomElementRegistry, Shadow DOM, ElementInternals

## Interfaces

- Inbound: F# lifecycle callbacks
- Outbound: standards-based Custom Elements

## Tests and verification

- Local behavior tests: browser tests through switch and slider
- Boundary/contract tests: no runtime UI-framework dependency in package metadata
- Integration/live verification: clean consumer fixture

## Dependencies

- Allowed direct dependencies: Fable.Core/browser platform
- Required composition context: component modules

## Modification boundaries

- Normal: `src/Runtime/**`
- Escalation required: public lifecycle/event semantics, closed Shadow DOM, new runtime dependency

## Local agent instructions

- none

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-22
- Known gaps: scoped custom-element registries are deferred until a consumer proves need

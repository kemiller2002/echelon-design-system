# Feature Manifest — HTML patterns

## Purpose

Own the canonical semantic HTML structures consumed by Echelon applications. Patterns contain no JavaScript and no hidden behavior.

## Ownership

- State, including presentation state: native HTML states such as checked, open, disabled, required, invalid, and popover-open
- Transitions / commands / messages: browser-native behavior only; application behavior belongs to Limen/application code
- Invariants and guards: semantic markup, labels, form association, accessible names, documented class structure
- Capabilities / authority: none — patterns cannot decide domain legality
- Important effects and effect contracts: native DOM events and native browser state

## Interfaces

- Inbound: semantic HTML attributes, application-rendered state, design tokens
- Outbound: native DOM events, form values, focus behavior, CSS-selectable native state

## Tests and verification

- Local behavior tests: `tests/browser/**`
- Boundary/contract tests: `tests/zero-runtime.test.mjs`
- Integration/live verification: Chromium, Firefox, and WebKit

## Dependencies

- Allowed direct dependencies: semantic HTML, generated tokens CSS, Echelon CSS
- Required composition context: consuming application supplies behavior beyond native HTML

## Modification boundaries

- Normal: `patterns/**`, `src/styles/components.css`, associated tests
- Escalation required: adding script, custom-element registration, hidden runtime behavior, or changing required markup structure

## Local agent instructions

- Documentation and consumer examples wrap the canonical pattern in `<ef-{slug} class="ef-component-tag">`.
- The `ef-*` wrapper is inert and must never replace the native semantic element inside it or be registered with `customElements.define()`.
- Modal flyouts stay on native `dialog`; gesture-driven or persistent drawer behavior belongs to Limen/application code.

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-23
- Known gaps: advanced behavioral patterns require separate Limen contracts

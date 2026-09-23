# Feature Manifest — select pattern

## Purpose

Style an ordinary single-value native `select` while preserving platform picker behavior and adding CSS-only physics-derived affordance motion.

## Ownership

- State: browser-native select value, disabled, focus and open state
- Transitions / commands / messages: native `input` and `change`
- Invariants and guards: Forma does not replace the native picker for ordinary selection
- Capabilities / authority: none
- Effects: native form submission/reset and platform picker behavior

## Interfaces

- Inbound: native select/options, Forma class structure, optional `data-ef-motion-weight="light|standard|heavy"`
- Outbound: native select value and events

## Motion

- Indicator rotation uses the shared inertia/settling model.
- Its small vertical cue uses the shared gravity-derived timing, which is independent of mass.
- If a browser does not expose `:open` for the platform select, the control remains fully usable and simply omits the open-state indicator motion.
- Reduced motion removes spatial travel.

## Tests and verification

- `tests/browser/physics-motion.spec.mjs`
- Repository-wide accessibility, mobile, zero-runtime, package and browser checks

## Modification boundaries

- Searchable, rich-option, listbox, multi-select, or async behavior belongs to Limen/application code.
- Do not introduce script to reproduce the native picker.

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-23

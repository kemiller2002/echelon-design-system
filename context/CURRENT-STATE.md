# Echelon Design System current state

## Repository status

Repository initialized with:

- SDE / Ordo 1.3.0
- Repository Operating System 3.1.4
- Visual Engineering 1.0.0
- Communication Engineering 1.0.0

A comprehensive first-pass design-system requirement set now exists on the active requirements branch.

## Accepted direction

- Standards-based Web Components are the reusable behavior layer.
- Native HTML remains preferred where native behavior is sufficient.
- CSS/design tokens form the visual foundation below components.
- Advanced components are in scope where they centralize difficult reusable interaction.
- Motion and microinteraction are explicit component requirements.
- Accessibility targets WCAG 2.2 AA for stable components.
- Ordo/application code retains domain-state authority.
- Limen integrates through standard DOM contracts rather than a custom fork.

## Requirements created

See requirements/ for:

- core architecture and token requirements;
- advanced component catalog;
- motion and interaction contract;
- accessibility and inclusive-design contract;
- Ordo/Limen integration contract;
- packaging, testing, and release gates;
- first implementation pilot.

## First bounded pilot

The recommended first slice is:

- tokens/themes;
- native foundations;
- ef-switch;
- ef-slider;
- ef-popover;
- ef-tabs;
- async-action feedback pattern.

This combination deliberately exercises simple and advanced interaction, form behavior, motion, focus management, modern browser APIs, accessibility, and application-state integration.

## Largest decision-relevant unknown

Whether explicit Ordo-style state modeling provides enough benefit inside complex reusable UI components to justify its cost compared with simpler local component state.

The pilot includes an experiment rather than assuming the answer.

## Next action

Review and accept the requirements set, then create the initial semantic map/feature manifests and implement the pilot vertically.

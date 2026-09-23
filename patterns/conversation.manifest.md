# Feature Manifest — conversation pattern

## Purpose

Render inspectable user/application turns without assuming consumer-chat bubble semantics or granting generated text special authority.

## Ownership

- State and turn contents: application.
- Behavior: application/Limen.
- Semantics: ordered conversation history, explicit speaker labels, optional actions.
- Capabilities / authority: none.

## Modification boundaries

Do not encode model confidence, truth, clinical authority, or transition legality from speaker position, color, or visual treatment.

## Maintenance

- Owner: Echelon Foundry design system
- Introduced: 2026-09-23

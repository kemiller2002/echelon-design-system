# Feature Manifest — composer pattern

## Purpose

Provide a calm, application-neutral natural-language composition surface for typing, dictation, paste, and attachment affordances without embedding AI, parsing, or domain transition behavior in Forma.

## Ownership

- State: application/Limen; native textarea validity remains browser-owned.
- Transitions / commands / messages: application/Limen.
- Invariants and guards: semantic field labeling, visible context, reachable input methods, status region, responsive actions.
- Capabilities / authority: none. The composer never decides what may be committed.
- Effects: application-owned.

## Interfaces

- Inbound: context title/help, text value, available input actions, submit label, status.
- Outbound: native textarea/input/button events.

## Modification boundaries

Keep interpretation, agent behavior, recording, upload, persistence, permissions, and legal transitions outside Forma.

## Maintenance

- Owner: Echelon Foundry design system
- Introduced for cross-application agent/capture workflows: 2026-09-23

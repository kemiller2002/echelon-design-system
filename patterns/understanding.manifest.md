# Feature Manifest — understanding review pattern

## Purpose

Present an application's proposed understanding of user input before a consequential operation, including accepted, unknown, conflicting, or unresolved items.

## Ownership

- Item meaning/state: application/Ordo.
- Presentation and responsive layout: Forma.
- Actions: application/Limen.
- Capabilities / authority: none. Forma never decides that an item is accepted, blocking, or resolved.

## Interfaces

- Inbound: item label, summary, explicit textual state, optional source/review actions.
- Outbound: native button/link events.

## Modification boundaries

Every state must remain textual and non-color dependent. Source and correction paths must remain reachable on mobile.

## Maintenance

- Owner: Echelon Foundry design system
- Introduced: 2026-09-23

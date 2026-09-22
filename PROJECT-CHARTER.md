---
id: PROJECT-CHARTER-echelon-design-system
title: Echelon Design System Project Charter
status: active
version: 0.3.0
created: 2026-09-22
updated: 2026-09-22
---

# Echelon Design System project charter

## Purpose

Create the reusable visual, semantic, accessibility, motion, and communication foundation for Echelon Foundry applications.

The canonical production package is **HTML and CSS only**.

Consistency includes:

- design tokens;
- typography/layout foundations;
- native HTML styling;
- canonical HTML component patterns;
- advanced visual contracts;
- CSS motion and microinteraction;
- accessibility contracts;
- communication patterns;
- theming;
- Ordo/Limen integration boundaries;
- packaging, documentation, and verification.

## Intended users

Primary:

- Echelon application developers and agents;
- product/application designers;
- accessibility reviewers.

Secondary:

- external developers consuming future public Echelon packages.

## First bounded outcome

Build and validate a zero-runtime slice containing:

- tokens/themes;
- foundations;
- switch;
- slider;
- segmented control;
- disclosure;
- popover;
- dialog;
- cross-browser/accessibility tests;
- explicit Limen boundary documentation.

## Included

- HTML patterns;
- CSS foundations/components;
- DTCG design tokens;
- light/dark/forced-colors/reduced-motion behavior;
- responsive/mobile behavior;
- native keyboard/pointer/form behavior;
- advanced visual contracts where Limen supplies behavior;
- native DOM event/attribute integration;
- npm distribution of static artifacts.

## Excluded from the design-system runtime

- JavaScript;
- WebAssembly;
- Custom Elements;
- Shadow DOM;
- ElementInternals;
- Lit or other UI runtimes;
- application-domain logic;
- persistence/network effects.

Build/test tooling may use executable code because it is not shipped component behavior.

## Success criteria

- applications share a recognizable polished visual language;
- common native interactions are not reimplemented;
- accessibility-critical behavior is centralized through semantic markup/CSS contracts and tests;
- CSS motion is consistent and reduced-motion safe;
- published browser runtime cost is 0 bytes;
- Limen consumes native DOM/events without a design-system adapter runtime;
- application/Ordo domain authority remains outside visual patterns;
- the first pilot passes requirements/PILOT-PLAN.md;
- a successor can continue from repository records without conversation history.

## Constraints and assumptions

- Prefer browser standards to custom behavior.
- Preserve semantic HTML.
- Accessibility targets WCAG 2.2 AA for stable production patterns.
- Mobile/touch is first-class.
- Motion is presentation, never semantic authority.
- Advanced behavior is allowed, but it belongs to Limen/application code.
- Complexity must be justified by demonstrated application need.

## Owners and decision authority

Repository architecture and contracts are governed through ROS/SDE.

Visual decisions are constrained by Visual Engineering.

Interface language and communication patterns are constrained by Communication Engineering.

Application-domain transition authority remains with the consuming application and Ordo where used.

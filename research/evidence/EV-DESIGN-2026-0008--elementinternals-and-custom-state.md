---
id: EV-DESIGN-2026-0008
title: ElementInternals supports form-associated custom elements
research_area: design-system
evidence_type: secondary
source_title: ElementInternals documentation
source_author: MDN contributors
source_uri: https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
source_date:
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [web-components, forms, elementinternals, custom-state]
---

# Evidence Record

## Evidence summary

ElementInternals is broadly available across modern browsers and provides custom elements with form association, submitted values, validity, label access, accessibility defaults, and custom states. CustomStateSet/:state() became broadly available in modern browsers in 2024.

## Exact claim supported or contradicted

Autonomous Echelon controls can preserve ordinary form participation without customized built-in elements.

## Interpretation

Switch and slider can keep native inputs internally for interaction while the host element participates in the outer form through ElementInternals.

## Limitations

Some newer ElementInternals features have narrower support than the core form APIs. The pilot does not require CustomStateSet for correctness.

## Counterevidence

Keeping native inputs in light DOM would avoid ElementInternals, but would weaken encapsulation and public API control.

## Reproduction or verification notes

Verify FormData behavior and form reset in all three browser engines.

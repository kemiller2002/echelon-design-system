---
id: EV-DESIGN-2026-0013
title: details and summary provide native disclosure behavior
research_area: design-system
evidence_type: secondary
source_title: details HTML disclosure element documentation
source_author: MDN contributors
source_uri: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details
source_date:
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [html, disclosure, details, summary]
---

# Evidence Record

## Evidence summary

The `details` element with a `summary` creates a browser-native disclosure widget with an open state and native interaction behavior.

## Exact claim supported

Ordinary disclosure/accordion interaction should remain HTML-native and be styled by CSS rather than recreated in component JavaScript.

## Limitations

Coordinating multiple disclosure groups, persistence, or domain state may require application behavior.

## Reproduction or verification notes

The pilot verifies keyboard/click opening through browser tests and styles the native `open` state.

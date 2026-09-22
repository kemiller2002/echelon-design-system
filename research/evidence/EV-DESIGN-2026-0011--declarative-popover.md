---
id: EV-DESIGN-2026-0011
title: Popover supports accessible declarative invocation without JavaScript
research_area: design-system
evidence_type: secondary
source_title: Popover API and popover HTML attribute documentation
source_author: MDN contributors
source_uri: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover
source_date:
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [html, popover, declarative, accessibility]
---

# Evidence Record

## Evidence summary

HTML popovers can be opened and closed by a button/input through the `popovertarget` and `popovertargetaction` attributes without JavaScript. Auto popovers receive top-layer behavior, light dismissal, Escape handling, and browser-managed accessibility relationships.

## Exact claim supported

Non-modal popover interaction belongs in the HTML/CSS design-system tier on the supported browser baseline rather than requiring a component runtime.

## Limitations

Dynamic content, application commands, async data, and product-specific focus workflows may still require Limen/application behavior.

## Reproduction or verification notes

The pilot cross-browser suite opens and closes the canonical popover pattern in Chromium, Firefox, and WebKit.

---
id: EV-DESIGN-2026-0007
title: Native range input is safer substrate for pilot slider
research_area: design-system
evidence_type: primary
source_title: Slider Pattern and accessible faked slider working example
source_author: W3C Web Accessibility Initiative
source_uri: https://www.w3.org/WAI/ARIA/apg/patterns/slider/
source_date:
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [slider, accessibility, touch, native-html]
---

# Evidence Record

## Evidence summary

WAI-ARIA APG warns that some touch-based assistive technologies may not fully operate custom slider widgets because expected gestures may not synthesize the keyboard events custom widgets need. W3C's working example for a custom visual slider keeps a real `input[type=range]` as the underlying accessible control.

## Exact claim supported or contradicted

The pilot slider should preserve a native range input rather than reimplement slider semantics on a generic element.

## Source provenance

Primary W3C/WAI guidance and working accessibility example.

## Interpretation

Native behavior is not merely simpler; it reduces a known accessibility risk while still allowing Echelon visual treatment and motion.

## Limitations

Native range styling has browser-specific pseudo-elements and still requires cross-browser testing.

## Counterevidence

A fully custom slider offers more visual freedom, but that benefit does not outweigh the pilot accessibility risk.

## Reproduction or verification notes

Run keyboard and touch-oriented tests in Chromium, Firefox, and WebKit and retain direct value entry in future precision-heavy variants.

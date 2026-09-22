---
id: EV-DESIGN-2026-0010
title: Echelon Foundry palette semantic contrast audit
research_area: design-system
evidence_type: primary
source_title: consulting-company canonical CSS palette
source_author: Echelon Foundry
source_uri: repository:kemiller2002/consulting-company/assets/css/style.css
source_date: 2026-09-22
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [color, contrast, brand, accessibility]
---

# Evidence Record

## Evidence summary

The current Foundry palette was evaluated using the WCAG relative-luminance contrast formula.

Representative ratios:

- carbon on parchment: 15.26:1
- graphite on parchment: 4.60:1
- oxide bronze on parchment: 5.04:1
- verdigris on parchment: 4.54:1
- parchment on foundry charcoal: 13.68:1
- forged iron on parchment: 9.24:1
- graphite on stone: 4.00:1
- forged iron on stone: 8.04:1

The existing palette is strong overall, but graphite on stone is below the 4.5:1 AA threshold for ordinary text.

For dark surfaces, the original oxide bronze and verdigris are too dark for ordinary text on carbon. Derived light variants preserve hue while meeting AA:

- oxide bronze light: #a87e5e, approximately 4.85:1 on carbon
- verdigris light: #698d84, approximately 4.80:1 on carbon

## Exact claim supported or contradicted

The Foundry palette can be retained, but semantic tokens must constrain which primitive colors are paired and add accessible dark-theme accent variants.

## Source provenance

Palette values are from the current Echelon Foundry consulting-company repository. Ratios were calculated directly from those values.

## Interpretation

A design system adds value by preventing unsafe combinations that raw palette variables currently allow.

## Limitations

Contrast ratio alone does not establish complete visual accessibility or aesthetic suitability.

## Counterevidence

Disabled controls are exempt from some WCAG contrast requirements, but normal secondary text is not.

## Reproduction or verification notes

Token compiler tests should pin these critical semantic pairings and dark accent values.

---
id: EV-DESIGN-2026-0006
title: DTCG 2025.10 stable design-token interchange format
research_area: design-system
evidence_type: primary
source_title: Design Tokens Format Module 2025.10
source_author: Design Tokens Community Group
source_uri: https://www.designtokens.org/TR/2025.10/format/
source_date: 2025-10-28
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [tokens, dtcg, interoperability]
---

# Evidence Record

## Evidence summary

The Design Tokens Community Group published 2025.10 as its first stable technical report. The format defines JSON token files, explicit token types, aliases/references, groups, dimensions, colors, durations, cubic Bézier values, and composite types.

## Exact claim supported or contradicted

Canonical design decisions should be stored in DTCG-compatible token JSON and translated into CSS rather than treating CSS variables as the only source of truth.

## Source provenance

Final Community Group Report from the Design Tokens Community Group.

## Relevant excerpt or data

The report identifies 2025.10 as stable and describes design tokens as platform-agnostic design decisions intended to move between design and development tools.

## Interpretation

The Echelon token source can remain portable while a small compiler emits browser-specific CSS.

## Limitations

The DTCG report is a Community Group specification, not a W3C Recommendation. The Echelon compiler intentionally implements only the subset used by this repository.

## Counterevidence

A CSS-only token source would be simpler in the very short term, but would couple canonical design decisions to one output platform.

## Reproduction or verification notes

Validate the repository token file using the local compiler and preserve DTCG property/type names.

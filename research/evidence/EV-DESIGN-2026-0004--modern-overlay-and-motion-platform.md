---
id: EV-DESIGN-2026-0004
title: Modern browser overlay and view-transition capabilities
research_area: design-system
evidence_type: secondary
source_title: Popover API and View Transition API documentation
source_author: MDN contributors
source_uri: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
source_date:
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [popover, view-transitions, motion, progressive-enhancement]
---

# Evidence Record

## Evidence summary

Modern browser APIs provide standardized top-layer popover behavior, invoker relationships, focus behavior, anchor positioning integration, and view transitions.

## Exact claim supported or contradicted

The design system can prefer modern browser primitives for overlays and transitions while treating them as progressive enhancements rather than inventing all behavior in application JavaScript.

## Source provenance

MDN documentation of standardized or standards-track browser capabilities.

## Relevant excerpt or data

Popover can establish invoker relationships and light-dismiss behavior. View Transitions support animated transitions between DOM or document states.

## Interpretation

A standards-first design can reduce custom overlay and animation infrastructure.

## Limitations

Newer APIs may not exist in older supported browsers and require explicit fallback behavior.

## Counterevidence

Support variance reinforces the requirement for feature detection and fallbacks.

## Reproduction or verification notes

Validate support against the declared browser baseline before each stable release.

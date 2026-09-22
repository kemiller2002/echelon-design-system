---
id: EV-DESIGN-2026-0012
title: Native dialog supports declarative modal invocation through commands
research_area: design-system
evidence_type: secondary
source_title: dialog HTML element and Invoker Commands API documentation
source_author: MDN contributors
source_uri: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
source_date:
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: high
supports: []
contradicts: []
related_theories: []
tags: [html, dialog, commandfor, declarative]
---

# Evidence Record

## Evidence summary

Buttons using `commandfor` and `command="show-modal"` can declaratively open a target `dialog`; `command="close"` can close it. Native modal dialog behavior supplies top-layer modal behavior and browser-managed focus/inertness semantics.

## Exact claim supported

A modal dialog can be represented as an HTML/CSS-only pattern on a browser baseline that supports Invoker Commands.

## Limitations

The requirement is browser-baseline dependent. Application-specific confirmation logic remains outside the design-system package.

## Reproduction or verification notes

Cross-browser tests must pass before the dialog pattern is marked stable.

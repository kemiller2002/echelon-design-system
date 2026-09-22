---
id: EV-DESIGN-2026-0009
title: Fable can target browser-native JavaScript and Web Components
research_area: design-system
evidence_type: secondary
source_title: Fable and Fable.Lit documentation
source_author: Fable project contributors
source_uri: https://fable.io/docs/getting-started/javascript.html
source_date:
retrieved: 2026-09-22
created_by_agent: chatgpt
confidence: medium
supports: []
contradicts: []
related_theories: []
tags: [fsharp, fable, web-components, runtime]
---

# Evidence Record

## Evidence summary

Fable compiles F# to JavaScript and provides browser API bindings. Fable.Lit demonstrates that F#-authored standards-based Web Components are viable, including properties, events, Shadow DOM, and optional light DOM.

## Exact claim supported or contradicted

F# can remain the primary implementation language for the design system while published artifacts remain ordinary browser JavaScript.

## Interpretation

The pilot can use Fable without adopting Lit by binding directly to Custom Elements and browser lifecycle APIs. Fable.Lit remains evidence that the language/runtime boundary is viable and a fallback implementation path.

## Limitations

The no-Lit lifecycle bridge is an Echelon implementation choice and must be proven by compilation and browser tests; Fable's documentation does not itself validate that specific bridge.

## Counterevidence

Fable.Lit offers more mature templating/lifecycle ergonomics. If component complexity grows enough, the project should re-evaluate rather than defend a custom bridge for ideological reasons.

## Reproduction or verification notes

Compile with the pinned Fable tool and inspect bundled output/runtime dependencies.

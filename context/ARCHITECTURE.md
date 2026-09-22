# Echelon Design System architecture

## Current architecture

The system is standards-first and zero-runtime.

```text
Ordo / application state
        |
        v
F# / Limen behavior when required
        |
        v
semantic HTML attributes, values, content
        |
        v
Echelon HTML patterns + CSS
        |
        v
browser-native behavior
        |
        v
semantic design tokens
```

The design-system package itself contains no JavaScript or WebAssembly.

## Layers

### 1. Tokens
Primitive and semantic design decisions live in DTCG JSON. A build-time F# compiler emits CSS variables.

### 2. Foundations
Typography, forms, focus, surfaces, layout primitives, responsive behavior, and utilities are CSS over native HTML.

### 3. Declarative patterns
Canonical HTML + CSS patterns such as switch, native range slider, segmented radio control, disclosure, popover, and dialog.

### 4. Behavioral visual contracts
Complex patterns such as tabs, comboboxes, grids, command palettes, reorder, and split panes have markup/state/style contracts here, but their behavior lives in Limen/application code.

### 5. Application integration
Limen observes normal DOM/native events and renders application/Ordo state back into semantic HTML.

## Zero-runtime boundary

The following are prohibited from the canonical design-system runtime:

- Custom Element registration;
- component JavaScript;
- component WebAssembly;
- Shadow DOM;
- ElementInternals;
- framework runtimes;
- hidden persistence/network/effects.

Build and test tooling may use executable code because it is not shipped browser behavior.

## HTML structure as API

Canonical semantic elements, required class names, attributes, relationships, and nesting are public versioned contracts.

Applications may render these structures using F#, server templates, React, Vue, static HTML, or another system, but the resulting contract is the same.

## State

State has two owners:

1. **Browser-native UI state**, such as checked, selected, open, invalid, disabled, focus, and popover-open.
2. **Application/Ordo state**, such as permissions, pending domain operations, obligations, failure/unknown states, editing workflows, and business transitions.

CSS renders those states. It does not create a third semantic state authority.

## Browser platform strategy

Prefer declarative platform facilities including:

- native form controls;
- details/summary;
- Popover + popovertarget;
- dialog + commandfor/command on the declared baseline;
- CSS :has();
- @starting-style;
- discrete transitions;
- anchor positioning where supported;
- container queries;
- logical properties;
- media queries for reduced motion, forced colors, contrast, and input characteristics.

## Distribution

Publish CSS and canonical HTML patterns. The browser runtime payload from the design system is zero bytes.

## Documentation

Documentation must expose:

- canonical markup;
- native states;
- Limen-required behavior boundaries;
- accessibility;
- motion/reduced-motion;
- tokens;
- anti-patterns;
- browser support;
- stability status.

## Architectural constraints

- Components/patterns are HTML and CSS only.
- Application-domain rules never move into CSS.
- Advanced UI that needs behavior uses Limen/application code.
- Native semantics are preserved whenever possible.
- Accessibility-critical behavior is not recreated when the browser already supplies it.
- No pointer-only workflow is considered complete.
- Generated views do not replace canonical source records.

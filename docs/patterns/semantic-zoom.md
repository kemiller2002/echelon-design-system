# Semantic zoom composition contract

Semantic zoom changes representation as scale or scope changes. Forma provides presentation contracts only. The application owns zoom state, object identity, selection, routing, and the rule that chooses a representation.

## Invariants

- The same domain object keeps the same stable identity across representations.
- Current scope and scale are explicitly communicated in text, not inferred only from size or position.
- Parent context remains available through a scope trail or equivalent landmark.
- A representation change must not silently change authority, state, or available consequential actions.
- Detail hidden at an overview level remains discoverable.
- Selection survives a representation change when the application can preserve it safely.
- Focus must move predictably when the active representation changes.
- A non-spatial representation is required when spatial navigation is not sufficient for access or verification.
- Reduced motion must not impair comprehension of a scale transition.
- No application may treat visual scale as domain state.

## Suggested composition

Use `.ef-spatial-canvas` for bounded spatial exploration, `.ef-scope-trail` for explicit ancestry/scope, `.ef-relationship-index` for non-spatial relationships, and ordinary landmarks/headings for the current representation.

The application may expose level controls such as Overview, Region, Entity, and Detail. Forma does not prescribe those levels.

## Validation

Test identity continuity, scope continuity, keyboard focus, screen-reader access, reduced motion, 320px containment, 200% text scaling, direct navigation to a selected object, and switching representations while an object is selected.

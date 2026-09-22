# Forma Mobile Component Contract

Status: canonical requirement for all implemented and future Forma patterns

## Principle

Forma has one semantic component contract that recomposes across viewport sizes. Separate mobile-only component families must not be created when the same meaning can be preserved responsively.

Every component must define:

1. desktop presentation;
2. tablet/intermediate recomposition where relevant;
3. phone presentation at 320 CSS px usable width;
4. keyboard and assistive-technology behavior;
5. Limen/application behavior boundary.

## Required mobile invariants

1. Every component must remain usable at 320 CSS px width.
2. Essential content and actions must not require horizontal page scrolling.
3. Data that genuinely requires horizontal comparison may use a bounded internal scroll region only when an equivalent labeled/narrow representation is not practical.
4. Hover must never be the sole path to information or action.
5. Drag must never be the sole path to an operation.
6. Pointer input must never be the sole path to an operation.
7. Interactive targets should provide approximately 44 by 44 CSS px of usable target area where practical.
8. Text zoom and browser zoom must not destroy semantic order or hide actions.
9. Mobile recomposition must not change domain meaning, legal actions, scoring, permissions, obligations, or state.
10. Important actions may move into a menu, drawer, disclosure or sticky mobile action region, but must not disappear solely because the viewport is small.
11. Deep-link, route, filter, tab and other URL-backed state must retain its meaning when the visual control changes form.
12. Reduced-motion behavior must remain valid after responsive recomposition.
13. Forced-colors/high-contrast behavior must remain valid after responsive recomposition.
14. State must never be communicated by color alone.
15. Content order must remain logical when grids/panes collapse to one column.
16. Mobile rendering must avoid fixed heights that clip translated, zoomed or user-scaled text.
17. Safe-area insets should be respected by sticky/bottom mobile action surfaces where supported.

## Pattern-specific expectations

### Data grid

Desktop may use a table/grid. Narrow layouts should favor one of:

- essential columns plus bounded internal overflow;
- a labeled record/card projection;
- disclosure of secondary fields.

The application owns which fields are essential. Forma owns both presentation contracts.

### Collection toolbar

Search remains prominent. Secondary filter/sort/view controls may collapse into a disclosure, drawer or sheet. Active-filter state and result count remain visible.

### Tabs

Tabs may use horizontal overflow for a small, readable set. Larger sets should allow an application-supplied compact selector or menu. Labels must not shrink below usable size.

### Timeline and diff

Timelines become single-column. Side-by-side diffs must stack into explicit Before/After or Previous/Current sections on narrow screens.

### Dashboard

Multi-column layouts collapse without changing semantic reading order. Priority/attention content should be allowed to appear first when the application's semantic order already declares it first.

### Wizard

A wide step rail may reduce to current-step text plus progress. No step may become inaccessible because the full rail is hidden.

### Command palette

A desktop overlay may become a full-screen mobile surface.

### File upload

The native file picker remains available. Drop zones are enhancement only.

### Master/detail

Multi-pane layouts become list-then-detail or stacked navigation while preserving browser history and focus restoration.

### Mobile actions

Critical actions may use `.ef-mobile-action-bar`. The bar must not cover focused controls or page content and must respect safe-area insets.

## Documentation requirement

The Forma example site must include an explicit **Mobile · 320px** example on every component page.

The site build must fail when:

- a pattern lacks its component page;
- the page has fewer than three examples;
- the explicit mobile example is missing;
- runtime `<script>` is introduced into the published site.

## Testing requirement

Automated browser validation should exercise representative components at 320 px width, including at minimum:

- no page-level horizontal overflow;
- visible focus;
- essential actions remain reachable;
- forced-colors support where testable;
- reduced-motion mode where interaction/motion exists.

A component may document a bounded internal overflow region when required by the information model, but that exception must not create page-level horizontal scrolling.

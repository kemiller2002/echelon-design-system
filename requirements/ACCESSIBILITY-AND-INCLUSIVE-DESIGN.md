# Accessibility and Inclusive Design Requirements

## 1. Baseline

### A11Y-001 WCAG target
The design system shall target WCAG 2.2 AA for all production components.

Component conformance does not prove an application conforms, but the component shall not introduce a known barrier when used according to its documented contract.

### A11Y-002 Native semantics
Use native semantic HTML before ARIA.

ARIA is used when native semantics cannot represent the component. ARIA roles, states, and properties shall follow WAI-ARIA Authoring Practices patterns where applicable.

### A11Y-003 Name, role, value
Every interactive element shall expose correct accessible name, role, value/state, and disabled/readonly state.

### A11Y-004 Keyboard
Every interactive component shall have a documented keyboard model.

Composite controls shall not rely on Tab for every internal item when the corresponding APG pattern uses roving focus or aria-activedescendant.

### A11Y-005 Focus visible
Keyboard focus must be visually obvious, sufficiently contrasted, not clipped, and not hidden by sticky content or overlays.

Focus style is a system token, not an application preference.

### A11Y-006 Focus order
DOM order shall normally match visual and interaction order.

CSS visual reordering shall not create a contradictory keyboard sequence.

## 2. Pointer and motor accessibility

### A11Y-010 Target size
WCAG 2.2 minimum target-size requirements shall be met.

The Echelon default should aim higher than the minimum for primary touch interactions, generally around a 40 to 44 CSS pixel usable hit region where layout allows.

Compact visual controls may use invisible hit-area expansion when this does not create overlap.

### A11Y-011 Drag alternatives
Any drag operation that performs a meaningful task shall provide a single-pointer or discrete-control alternative as required by WCAG 2.2.

Examples:

- reorder: move up/down or move-to-position;
- splitter: keyboard arrows;
- slider: keyboard and direct value entry when precision warrants it;
- range selection: text entry or step controls;
- transfer: explicit add/remove controls.

### A11Y-012 Pointer cancellation
Actions should normally commit on release rather than initial pointer down, allowing cancellation by moving away where the platform pattern supports it.

## 3. Vision

### A11Y-020 Color independence
Color shall not be the sole indication of:

- error;
- success;
- selection;
- required status;
- enabled/disabled state;
- changed data;
- chart series;
- switch state.

Use text, icon, shape, position, pattern, or another independent cue.

### A11Y-021 Contrast
Text, controls, focus indicators, boundaries required to understand controls, and state indicators shall meet applicable WCAG contrast requirements.

### A11Y-022 Forced colors
Interactive controls shall remain operable and understandable in forced-colors/high-contrast modes.

Do not suppress system colors merely to preserve brand appearance.

### A11Y-023 Zoom and reflow
Components shall support browser zoom and text scaling without clipping essential content or forcing two-dimensional scrolling except where the content itself inherently requires it, such as a wide data grid.

### A11Y-024 Icon use
Icons that perform actions require accessible names.

Decorative icons are hidden from the accessibility tree.

Icon-only actions require tooltips or equivalent supplemental visible discovery where appropriate, but the tooltip is not the accessible name itself.

## 4. Motion and vestibular accessibility

### A11Y-030 Reduced motion
Respect prefers-reduced-motion.

Large movement, zoom, spinning backgrounds, parallax, and repeated non-essential movement shall be removed or replaced.

### A11Y-031 User-controlled motion
Auto-advancing carousels, animated feeds, and repeated motion require pause/stop behavior where applicable.

The design system should avoid auto-advancing content by default.

### A11Y-032 No motion-only meaning
Meaningful state changes shall not be communicated only through animation.

## 5. Cognitive and reading accessibility

### A11Y-040 Stable interaction
Controls with the same function shall use consistent visual identity, terminology, and interaction across applications.

### A11Y-041 Error clarity
Validation shall identify the field/problem and provide a recoverable next action when one is known.

Do not rely on red borders alone.

### A11Y-042 Time pressure
Components shall not introduce artificial time limits.

Toast dismissal, undo windows, session warnings, and countdowns require deliberate policies appropriate to consequence.

### A11Y-043 Typography
Default typography shall prioritize readability:

- sufficient font size and line height;
- restrained line length for long-form text;
- no forced full justification for prose;
- user zoom remains functional;
- app CSS must not prevent user font substitution.

The system shall not claim a single "dyslexia font" solves dyslexia. Readability should be supported through structure, spacing, typography, and user control.

### A11Y-044 Cognitive load
Complex components shall progressively reveal advanced actions rather than presenting every option at once when that would materially increase error risk.

### A11Y-045 State persistence
User-configured density, theme, panel size, or column preference may be persisted by the application. Components shall not independently create hidden persistence that surprises users.

## 6. Screen readers and status

### A11Y-050 Live regions
Live regions shall be used deliberately.

Repeated renders must not cause duplicate announcements.

### A11Y-051 Async state
Loading, completion, validation errors, and relevant background updates shall be announced in proportion to importance.

### A11Y-052 Tables and grids
Static data uses semantic table markup.

Interactive grids use the grid model only when arrow-key cell navigation or similar interaction is genuinely required.

### A11Y-053 Virtualization
Virtualized content must not misrepresent item count, position, current selection, or focus.

If reliable assistive-technology behavior cannot be demonstrated, use pagination or incremental rendering instead.

## 7. Forms

### A11Y-060 Labels
Every input has a programmatically associated label or an explicitly documented exception where an accessible name is supplied by context.

### A11Y-061 Description
Help and error text shall be programmatically associated with its field.

### A11Y-062 Required and invalid
Required, invalid, readonly, and disabled state shall be represented semantically and visually.

### A11Y-063 Custom controls
Form-associated custom elements shall integrate with form submission, validation, reset, and disabled semantics.

### A11Y-064 Autocomplete and purpose
Where relevant, inputs shall allow applications to expose appropriate HTML autocomplete and input-purpose metadata rather than hiding native capability.

## 8. Localization and language

### A11Y-070 No hard-coded English
Reusable behavior text shall be localizable.

### A11Y-071 Text expansion
Components shall tolerate substantial label and message expansion without clipping.

### A11Y-072 RTL
Interactive geometry, arrow meaning, placement, and keyboard behavior shall be validated for RTL where the pattern changes.

### A11Y-073 Locale values
Dates, numbers, currency, and measurement presentation shall be localizable and must not confuse display formatting with semantic values.

## 9. Accessibility test matrix

Production-ready interactive components require:

- keyboard-only test;
- screen-reader-oriented semantic inspection;
- automated accessibility scan;
- forced-colors test;
- 200% and 400% zoom/reflow test where applicable;
- reduced-motion test;
- touch/pointer target test;
- disabled/readonly test;
- error-state test;
- dark/light theme contrast test;
- RTL test when directional behavior exists.

Advanced components such as combobox, slider, range slider, data grid, tree, tree grid, dialogs, menus, and date pickers require explicit comparison against the corresponding WAI-ARIA APG interaction pattern.

## 10. Accessibility release gate

A component may be experimental while accessibility work remains open.

It may not be marked stable if a known keyboard, name/role/value, focus-management, or critical contrast defect remains unresolved.

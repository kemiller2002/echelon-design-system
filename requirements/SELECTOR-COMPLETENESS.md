# Selector Completeness Requirements

Status: implemented baseline derived from Echelon Signal SCS-009 through SCS-018.

## Architectural rule

Selector presentation is not answer semantics and is not scoring.

The design system owns reusable HTML/CSS structures. Signal/Limen/Ordo owns:

- answer primitive semantics;
- authoritative answer state;
- scoring;
- applicability;
- completion;
- cross-control validation;
- legal navigation;
- URL encoding;
- cardinality policy.

## Required shared families

### Binary choice

Use `.ef-binary-choice` for Yes/No, True/False, Agree/Disagree, and bounded three-way variants.

It uses radios, not a checkbox switch, when Unanswered must remain representable.

### Ordinal scales

`.ef-ordinal-scale` supports 3, 4, 5, 6, 7, 10, and 11 positions.

Semantic names such as Likert, Agreement, Frequency, Importance, Satisfaction, Confidence, Quality, Difficulty, Effort, Likelihood, Maturity, Severity, Priority, Probability, and Familiarity are application presets over the same structure.

Even-point scales do not imply a midpoint.

### Semantic differential

`.ef-semantic-differential` provides textual bipolar endpoints and a finite ordered radio scale.

Endpoint meaning must be available to assistive technology and cannot depend on visual position alone.

### Symbol rating

`.ef-symbol-rating` covers star and icon rating.

Icons are decorative reinforcement. Each input must have textual ordinal/semantic meaning.

### Numeric selectors

- native number input / `.ef-numeric-stepper` for bounded integer/decimal;
- existing native `.ef-slider` for one bounded discrete value;
- `.ef-range-entry` as the required direct-entry baseline for bounded lower/upper ranges.

A dual-thumb graphical range slider requires Limen behavior and must not remove direct numeric endpoint entry.

### Choice variants

The existing choice group is extended rather than duplicated.

Variants include:

- radios;
- checkboxes;
- cards;
- buttons/segmented presentation;
- image/media choices through `.ef-choice--media`;
- searchable/custom selection as Limen contracts.

Images never replace visible/accessibility text.

### Multi-choice constraints

`.ef-selection-guidance` and `.ef-selection-status` communicate exact/min/max/between selection rules.

`.ef-choice--exclusive` marks an exclusive None/N/A-style option.

Limen/application code enforces cardinality and deterministic clear/reject behavior.

### Matrix/repeated scale

`.ef-matrix` composes repeated primitive controls by row.

Requirements:

- each row retains its own answer semantics;
- row prompt and choice labels remain programmatically available;
- narrow layouts decompose to ordinary per-row controls;
- horizontal scrolling cannot be the only usable mobile interaction;
- dropdown, multi-choice, Likert, semantic-differential, numeric, and side-by-side variants reuse the same matrix family.

### Pairwise

`.ef-pairwise` is a two-option comparison presentation using native radio semantics.

### Best-Worst

`.ef-best-worst` exposes Best and Worst choices with explicit text labels.

Limen enforces that the same option cannot occupy both roles when the application requires distinct selection.

### Hierarchical choice

`.ef-hierarchy` supplies a native disclosure/tree-like baseline for single or multi choice.

The application owns:

- whether parent nodes are selectable;
- whether selecting a parent implies descendants;
- whether descendants are independent;
- cascading behavior;
- immutable option identity.

## Accessibility

Every family must preserve:

- accessible name;
- visible focus;
- keyboard operation;
- programmatic selected/value state;
- required/invalid association;
- associated help/error text;
- touch target usability;
- zoom/reflow;
- reduced motion;
- forced colors;
- non-color semantics.

Drag, hover, icons, animation, grid position, or image appearance may not be the sole interaction or meaning channel.

## Presets that are not components

Do not create separate components for:

- Likert3/4/5/6/7/10/11;
- NPS0To10;
- Agreement;
- Frequency;
- Satisfaction;
- Confidence;
- Maturity;
- StarRating;
- IconRating.

These are configurations/presentations over generic families.

## Browser-runtime rule

All canonical patterns remain HTML/CSS only.

Where behavior is required, the design system documents the DOM/state contract and Limen supplies behavior outside the package.

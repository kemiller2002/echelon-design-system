# Echelon Design System Core Requirements

## 1. Purpose

The Echelon Design System shall provide a common visual, interaction, accessibility, and communication foundation across Echelon applications while preserving application-specific domain behavior.

The production design-system package shall contain HTML and CSS only. It shall not contain component JavaScript, WebAssembly, Custom Element registration, or another browser runtime.

## 2. Architecture

### DS-ARCH-001 HTML and CSS only
Canonical component artifacts shall be semantic HTML patterns and CSS.

Build-time tooling may use F#, Node, or other approved tools, but generated production design-system artifacts shall contain no executable browser runtime.

### DS-ARCH-002 Native behavior first
When semantic HTML already provides the required interaction, the design system shall preserve that native behavior.

Examples include buttons, links, checkboxes, radios, range inputs, details/summary, popovers, dialogs on the declared baseline, forms, validation, progress, and meter elements.

### DS-ARCH-003 No Custom Elements
The design system shall not require Custom Elements, Shadow DOM, ElementInternals, Lit, Fable browser output, or framework-specific wrappers.

Consumers may wrap Echelon patterns in application-local abstractions if they choose, but those wrappers are not the canonical design-system API.

### DS-ARCH-004 Zero runtime dependency
Consumers shall not be required to install or execute a design-system JavaScript runtime.

The package shall publish CSS plus canonical HTML patterns and documentation.

### DS-ARCH-005 F# is build-time or application behavior
F# may be used for build tooling such as token compilation.

F#/WASM through Limen may own application behavior, but that behavior is outside the design-system package.

### DS-ARCH-006 Semantic authority
Visual patterns shall not decide application-domain legality.

HTML may represent checked, selected, open, disabled, required, invalid, pending, or other supplied states. Application-specific decisions such as whether an invoice may be posted or a workflow may advance remain application/Ordo authority.

### DS-ARCH-007 Native state is the component state substrate
Where possible, CSS shall derive presentation from native states and selectors such as:

- :checked;
- :disabled;
- :required;
- :invalid;
- :focus-visible;
- :hover;
- :active;
- details[open];
- :popover-open;
- dialog[open];
- :has(...).

Do not mirror native state into parallel data attributes unless application-rendered state genuinely has no native representation.

### DS-ARCH-008 Declarative progressive enhancement
Prefer declarative platform capabilities such as:

- Popover and popovertarget;
- dialog with commandfor/command on the supported baseline;
- details/summary;
- CSS anchor positioning;
- container queries;
- logical properties;
- :has();
- @starting-style;
- discrete transitions.

Every capability with browser-baseline risk shall be cross-browser tested.

### DS-ARCH-009 Limen behavior boundary
When a pattern requires state coordination, asynchronous data, domain legality, computed synchronization, drag geometry, virtualization, complex focus orchestration, or behavior not provided by HTML, Limen/application code owns that behavior.

The design system may still define the markup, state attributes, visual states, and accessibility contract for that behavior.

### DS-ARCH-010 HTML structure is public API
Required class names, semantic elements, relationships, attributes, and nesting in canonical patterns are versioned public contracts because CSS depends on them.

Breaking structural changes require migration guidance.

### DS-ARCH-011 Server rendering is the default
Canonical patterns shall be valid useful HTML before any application behavior initializes.

Core content and native interactions shall not depend on hydration or component upgrade.

### DS-ARCH-012 No hidden persistence or effects
HTML/CSS patterns shall not persist values, perform network activity, generate application events beyond native browser events, or execute side effects.

## 3. Design tokens

### DS-TOKEN-001 Token hierarchy
The system shall define at least:

- primitive tokens;
- semantic tokens;
- component tokens;
- state tokens.

Applications shall generally consume semantic or component tokens rather than raw palette values.

### DS-TOKEN-002 Color
Tokens shall cover:

- surface levels;
- text hierarchy;
- borders;
- focus;
- actions;
- selection;
- success;
- warning;
- danger;
- information;
- disabled states;
- overlay scrims;
- data visualization series;
- high-contrast mappings.

### DS-TOKEN-003 Typography
Tokens shall cover:

- font families;
- body sizes;
- heading scale;
- line heights;
- weights;
- letter spacing;
- numeric/tabular settings;
- code and monospaced text;
- labels and captions.

### DS-TOKEN-004 Spatial system
Tokens shall cover spacing, sizing, layout gaps, content width, control heights, touch targets, corner radii, borders, elevation, and z/top-layer intent.

### DS-TOKEN-005 Motion
Motion tokens shall include duration families, easing families, distance, scale, opacity, and reduced-motion substitutions.

### DS-TOKEN-006 Theming
At minimum the system shall support:

- light;
- dark;
- operating-system preference;
- forced-colors/high-contrast behavior;
- density modes where appropriate.

Theme selection shall not require rebuilding components.

### DS-TOKEN-007 Application customization
Applications may change brand-level semantic tokens but may not override accessibility-critical states in ways that violate contrast, focus, target size, or state distinguishability requirements.

## 4. Styling foundations

### DS-FOUND-001 Reset and normalization
Provide a minimal, documented foundation that normalizes box sizing, text rendering assumptions, form typography inheritance, focus defaults, and media sizing without aggressively erasing browser behavior.

### DS-FOUND-002 Native element classes
Provide stable classes or attribute patterns for native elements that need Echelon styling without custom behavior.

### DS-FOUND-003 Layout primitives
Provide composable primitives for:

- stack;
- cluster;
- inline;
- grid;
- flow;
- sidebar;
- center;
- switcher;
- frame;
- scroll region;
- page;
- section;
- divider;
- sticky region.

These shall be CSS-first unless behavior requires a component.

### DS-FOUND-004 Responsive behavior
Components shall use intrinsic sizing, container queries, logical properties, and responsive tokens where practical.

Components shall not assume a single desktop viewport.

### DS-FOUND-005 RTL and writing modes
Spacing and placement shall use logical properties where practical.

Interactive components shall define RTL keyboard and visual behavior explicitly where direction affects meaning.

## 5. Interaction contract

### DS-INT-001 Full state model
Every interactive component shall define applicable states from:

- resting;
- hover;
- focus visible;
- pressed;
- selected;
- checked;
- expanded;
- dragging;
- resizing;
- loading;
- pending;
- success;
- warning;
- error;
- disabled;
- readonly.

Unsupported state combinations shall be documented and, where meaningful, made impossible.

### DS-INT-002 Keyboard parity
All functionality available by pointer shall have keyboard access unless the operation is inherently pointer-specific and a complete alternative is provided.

### DS-INT-003 Pointer parity
Controls shall support mouse, touch, stylus, and other pointer input without requiring hover.

### DS-INT-004 No drag-only workflows
Reorder, resize, range selection, and similar direct-manipulation features shall provide a non-drag alternative where required for accessibility.

### DS-INT-005 Focus restoration
Dialogs, popovers, menus, command palettes, drawers, and temporary workflows shall define where focus moves on open and where it returns on close.

### DS-INT-006 Escape behavior
Dismissible transient surfaces shall consistently support Escape unless doing so would cause unsafe loss of required work. Exceptions must be explicit.

### DS-INT-007 Loading and async action
Components that start asynchronous operations shall support pending state without creating duplicate invocation.

The component shall distinguish pending, completed, failed, and retryable presentation when the calling application supplies those states.

### DS-INT-008 Destructive action
The system shall provide patterns for destructive and irreversible actions including warning hierarchy, confirmation, recoverable undo where appropriate, and clear finality.

## 6. Communication requirements

### DS-COMM-001 Labels
Interactive controls shall have stable, concise labels that describe the action or controlled state.

### DS-COMM-002 Status
Status messages shall distinguish information, success, warning, validation error, system failure, and unknown outcome.

### DS-COMM-003 Error recovery
Error components shall support:

- what happened;
- which field or operation is affected;
- what the user can do next;
- whether retry is safe;
- whether the outcome is unknown.

### DS-COMM-004 Empty states
Empty states shall distinguish:

- no data exists;
- filtering produced no match;
- access is restricted;
- data is still loading;
- data failed to load.

### DS-COMM-005 Uncertainty
A component shall not visually collapse "unknown" into "failed" or "off" when the application explicitly provides an unknown state.

## 7. Security

### DS-SEC-001 Content handling
Components shall treat untrusted strings as text by default.

Raw HTML insertion requires an explicit, documented API and must not be the default content path.

### DS-SEC-002 CSP
The distributed package shall be compatible with restrictive Content Security Policy configurations and shall not require unsafe-eval.

### DS-SEC-003 URLs
Components that accept links, images, downloads, or external resource URLs shall not silently weaken application URL validation.

### DS-SEC-004 Secrets
No component shall persist tokens, credentials, or application secrets.

## 8. Performance

### DS-PERF-001 Load only what is used
Consumers shall be able to load token, foundation, and component CSS independently or use the combined stylesheet.

### DS-PERF-002 Zero design-system runtime
The production package shall contain no JavaScript or WebAssembly runtime. Runtime byte cost for the design system is therefore zero; CSS and HTML size remain measured release budgets.

### DS-PERF-003 Interaction latency
Direct manipulation such as sliders, dragging, resizing, menu opening, and toggles shall update visually within the current interaction frame when possible.

Decorative animation shall never make controls feel delayed.

### DS-PERF-004 Virtualized data
Large list and grid patterns may provide virtualization, but accessibility, findability, focus movement, and screen-reader behavior must be explicitly validated before it is considered production-ready.

## 9. Documentation

Every public pattern shall document:

- purpose;
- when to use;
- when not to use;
- canonical HTML anatomy;
- required elements, classes, and attributes;
- native events exposed to application code;
- CSS tokens and classes;
- native and application-rendered states;
- keyboard behavior;
- accessibility behavior;
- motion behavior;
- responsive behavior;
- examples;
- anti-patterns;
- Ordo/Limen boundary guidance where relevant;
- whether the pattern is fully declarative or requires application behavior;
- browser support and fallback;
- test coverage status.

The documentation site shall dogfood the design system itself.

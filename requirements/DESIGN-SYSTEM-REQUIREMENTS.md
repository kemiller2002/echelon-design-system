# Echelon Design System Core Requirements

## 1. Purpose

The Echelon Design System shall provide a common visual, interaction, accessibility, and communication foundation across Echelon applications while preserving application-specific domain behavior.

It shall support simple applications without forcing framework overhead and complex applications without forcing them to rebuild difficult interaction patterns.

## 2. Architecture

### DS-ARCH-001 Native HTML first
The system shall style native semantic HTML directly when native behavior is sufficient.

Examples include headings, paragraphs, links, ordinary buttons, lists, basic tables, labels, fieldsets, checkboxes, radios, and simple form controls.

### DS-ARCH-002 Web Components for composition and behavior
Custom Elements shall be used when one or more of the following are true:

- the control requires coordinated internal elements;
- the control has a meaningful reusable interaction model;
- focus management is non-trivial;
- overlays or top-layer behavior are required;
- several native elements must behave as one logical control;
- a reusable accessibility implementation materially reduces risk;
- encapsulation protects the component from application CSS;
- the component exposes a stable cross-application browser contract.

### DS-ARCH-003 No framework dependency
Consumers shall not be required to install React, Vue, Angular, Lit, or another UI framework.

Published components shall be standards-based ES modules plus CSS and assets.

An implementation tool may be used internally only if it does not become a mandatory runtime dependency without an explicit architecture decision.

### DS-ARCH-004 F# compatible implementation
The source implementation may use F# tooling where useful, but published browser artifacts must remain consumable as ordinary Web Components.

If F# is used to author component state or build tooling, generated JavaScript or WebAssembly shall not require consumer applications to adopt the same build chain.

### DS-ARCH-005 Semantic authority
Visual components shall not decide application-domain legality.

A component may represent disabled, unavailable, loading, pending, selected, expanded, invalid, or similar UI state. Application-specific decisions such as whether an invoice may be posted, a workflow may advance, or a destructive action is allowed remain application or Ordo authority.

### DS-ARCH-006 Ephemeral state boundary
Components may directly own ephemeral interaction state including:

- pointer hover;
- keyboard focus visibility;
- pressed visual state;
- open or closed tooltip state;
- drag preview;
- local typeahead buffer;
- local animation phase;
- resize gesture state.

Components shall not silently promote ephemeral state into domain state.

### DS-ARCH-007 Progressive enhancement
Use newer platform capabilities such as Popover, CSS anchor positioning, View Transitions, Invoker Commands, container queries, and advanced selectors where they reduce custom code.

Every such use shall document:

- minimum supported browser baseline;
- fallback behavior;
- whether lack of support changes appearance only or functionality;
- automated coverage for the fallback.

### DS-ARCH-008 Shadow DOM policy
Shadow DOM shall be opt-in by component class, not automatic.

Use Shadow DOM when internal structure or styling needs meaningful encapsulation.

Prefer light DOM for layout primitives, content containers, typography, print-related structures, and components where document-level styling, content semantics, or integration tooling benefits from direct DOM visibility.

Every Shadow DOM component shall expose deliberate customization through design tokens, slots, attributes, properties, and where necessary CSS parts.

Closed shadow roots are prohibited unless a documented security or platform reason exists.

### DS-ARCH-009 Form-associated custom elements
Custom form controls shall use native controls internally where practical.

When a true custom form control is required, it shall participate in form value, validity, reset, disabled, and form association behavior through browser standards such as ElementInternals.

### DS-ARCH-010 SSR and pre-upgrade behavior
Custom elements shall not make server-rendered or initially parsed content unusable before component registration.

Critical content shall remain readable before upgrade where feasible.

The package shall document handling of :defined, declarative shadow DOM where used, hydration-free enhancement, and flash-of-unstyled-content prevention.

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
Consumers shall be able to import components through subpath exports so unused components do not become mandatory startup cost.

### DS-PERF-002 Shared runtime
If a shared runtime exists, it shall remain small, versioned, dependency-light, and free of application-domain logic.

### DS-PERF-003 Interaction latency
Direct manipulation such as sliders, dragging, resizing, menu opening, and toggles shall update visually within the current interaction frame when possible.

Decorative animation shall never make controls feel delayed.

### DS-PERF-004 Virtualized data
Large list and grid patterns may provide virtualization, but accessibility, findability, focus movement, and screen-reader behavior must be explicitly validated before it is considered production-ready.

## 9. Documentation

Every public component shall document:

- purpose;
- when to use;
- when not to use;
- anatomy;
- properties and attributes;
- events;
- slots;
- CSS tokens/parts;
- states;
- keyboard behavior;
- accessibility behavior;
- motion behavior;
- responsive behavior;
- examples;
- anti-patterns;
- Ordo/Limen boundary guidance where relevant;
- browser support and fallback;
- test coverage status.

The documentation site shall dogfood the design system itself.

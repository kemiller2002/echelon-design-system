# Quality, Packaging, and Distribution Requirements

## 1. Package model

### QD-001 Package
Publish a primary package under the Echelon Foundry npm scope.

The public package name should be determined before the first external release and then treated as stable.

### QD-002 Subpath exports
Consumers shall be able to import:

- design tokens;
- foundations;
- individual components;
- component groups;
- icons if shipped;
- optional adapters.

Do not require importing the entire component catalog for one component.

### QD-003 No hidden install mutation
Package installation shall not mutate a consuming repository through install scripts.

### QD-004 Versioning
Use semantic versioning for public component contracts.

Breaking changes include:

- removed attributes/properties;
- changed event meaning;
- removed slots or parts;
- changed keyboard contract;
- changed semantic role;
- incompatible token changes.

## 2. Browser support

### QD-BROWSER-001 Declared baseline
Maintain a documented browser support matrix.

At minimum test current supported versions of:

- Chromium-based browsers;
- Firefox;
- Safari/WebKit.

Mobile Safari and mobile Chromium behavior shall be tested for touch-heavy components.

### QD-BROWSER-002 Feature detection
Use feature detection for optional platform enhancements.

Do not use user-agent sniffing as the primary compatibility strategy.

## 3. Test layers

### QD-TEST-001 Unit behavior
Pure state, parsing, geometry, and value conversion logic shall have deterministic unit tests.

### QD-TEST-002 DOM interaction
Every interactive component shall have browser interaction tests covering keyboard, pointer, focus, properties, attributes, events, slots, and lifecycle.

### QD-TEST-003 Accessibility
Stable components require automated and manual accessibility verification as specified by the accessibility requirements.

### QD-TEST-004 Visual regression
Use visual regression for states where CSS regressions are difficult to catch semantically.

At minimum capture representative:

- rest;
- hover where meaningful;
- focus;
- pressed;
- disabled;
- error;
- loading;
- light;
- dark;
- high contrast/forced colors where tooling permits;
- responsive sizes.

### QD-TEST-005 Motion
Animated components require deterministic verification of final state, reduced motion, and interruption.

### QD-TEST-006 Cross-component composition
Test common combinations such as:

- menu inside toolbar;
- combobox inside dialog;
- tooltip on icon button;
- data grid inside resizable pane;
- nested popover/menu;
- form control inside field layout;
- drawer containing navigation;
- alert/toast while dialog is open.

## 4. Quality gates

A component cannot be marked stable until:

- public API is documented;
- state model is documented;
- keyboard model is documented;
- accessibility gate passes;
- browser matrix passes;
- motion/reduced-motion behavior passes if applicable;
- high-contrast behavior is acceptable;
- RTL behavior passes if directional;
- examples exist;
- anti-patterns exist;
- package import works from a clean consumer fixture;
- no known critical security issue remains.

## 5. Performance budgets

Budgets shall be measured before first stable release and tracked thereafter.

Track at least:

- module size;
- CSS size;
- shared runtime size;
- initialization time;
- time to first usable interaction;
- direct-manipulation frame behavior;
- large-list/grid scaling;
- memory retained after component removal.

Performance budgets should be component-class specific rather than one arbitrary number for all components.

## 6. Dependency policy

Runtime dependencies require explicit justification.

Prefer browser APIs and small internal utilities.

Development-only testing/build dependencies are acceptable when they materially improve confidence and do not leak into runtime.

## 7. Documentation site

The documentation site shall:

- be built from the same repository;
- use the design system itself;
- show every component and state;
- show live keyboard instructions;
- show accessibility notes;
- show motion and reduced-motion behavior;
- show copyable usage examples;
- show token values and inheritance;
- show browser support;
- expose experimental/stable/deprecated status;
- work on mobile;
- avoid requiring a heavy documentation framework unless justified.

## 8. Playground

Provide a component playground capable of changing supported public properties and states.

The playground must not expose impossible internal states as if they were valid public API.

## 9. Consumer fixtures

Maintain minimal integration fixtures proving consumption from:

- plain HTML/ES modules;
- a Limen application;
- a representative F# application build;
- at least one mainstream framework only as an interoperability test, not as the canonical implementation.

## 10. Release artifacts

Release should include:

- package;
- source maps where appropriate;
- type definitions for JavaScript/TypeScript consumers;
- CSS/tokens;
- changelog;
- migration notes for breaking changes;
- integrity/provenance metadata supported by the package pipeline.

## 11. Deprecation

Deprecated APIs remain functional for a defined compatibility window unless maintaining them creates a security or accessibility defect.

Deprecation warnings must not spam production console output indefinitely. Prefer development-time diagnostics and documented migration.

# Quality, Packaging, and Distribution Requirements

## 1. Package model

### QD-001 Package
Publish a primary package under the Echelon Foundry npm scope.

The public package name should be determined before the first external release and then treated as stable.

### QD-002 Artifact exports
Consumers shall be able to consume:

- generated design-token CSS;
- foundations CSS;
- component/pattern CSS;
- a combined CSS bundle;
- canonical HTML pattern files;
- documentation.

The production package shall not export JavaScript or WebAssembly component code.

### QD-003 No hidden install mutation
Package installation shall not mutate a consuming repository through install scripts.

### QD-004 Versioning
Use semantic versioning for public pattern contracts.

Breaking changes include:

- required HTML element changes;
- required class-name changes;
- changed native semantics/roles;
- changed required attribute relationships;
- changed keyboard expectations;
- incompatible token names/meaning;
- removal of documented visual states.

## 2. Browser support

### QD-BROWSER-001 Declared baseline
Maintain a documented browser support matrix.

At minimum test current supported versions of:

- Chromium-based browsers;
- Firefox;
- Safari/WebKit.

Mobile Safari and mobile Chromium behavior shall be tested for touch-heavy patterns.

### QD-BROWSER-002 Declarative capability baseline
New declarative capabilities such as Popover, Invoker Commands, anchor positioning, @starting-style, and discrete transitions may be used only when the declared browser baseline and tests support them.

If a required behavior is not supported declaratively by the baseline, it belongs to Limen/application code rather than component JavaScript.

## 3. Test layers

### QD-TEST-001 Build-time logic
Token parsing, alias resolution, contrast validation, and other build-time logic shall have deterministic tests.

### QD-TEST-002 Native DOM interaction
Every interactive pattern shall have browser tests covering its applicable native keyboard, pointer, focus, form, state, and declarative behavior.

### QD-TEST-003 Zero-runtime boundary
CI shall fail if production artifacts include:

- .js/.mjs/.cjs component files;
- .wasm;
- inline script in canonical patterns;
- javascript: URLs;
- inline DOM event handlers;
- production npm runtime dependencies.

### QD-TEST-004 Accessibility
Stable patterns require automated and manual accessibility verification as specified by the accessibility requirements.

### QD-TEST-005 Visual regression
Use visual regression for states where CSS regressions are difficult to catch semantically.

At minimum capture representative rest, hover, focus, pressed, disabled, error, loading, light, dark, high-contrast/forced-colors, and responsive states where applicable.

### QD-TEST-006 Motion
Animated CSS patterns require deterministic verification of final/native state and reduced-motion behavior.

### QD-TEST-007 Composition
Test common combinations including popovers/dialogs around forms, nested disclosures, segmented controls in field layouts, static data tables, navigation structures, and application-rendered state classes.

## 4. Quality gates

A pattern cannot be marked stable until:

- canonical HTML is documented;
- required classes/attributes are documented;
- fully declarative vs Limen-required status is documented;
- native keyboard model is documented where applicable;
- accessibility gate passes;
- browser matrix passes;
- motion/reduced-motion behavior passes if applicable;
- high-contrast behavior is acceptable;
- RTL behavior passes if directional;
- examples and anti-patterns exist;
- clean consumer HTML can use the distributed CSS/pattern;
- zero-runtime gate passes;
- no known critical security issue remains.

## 5. Performance budgets

Track at least:

- tokens CSS size;
- foundations CSS size;
- component CSS size;
- combined CSS size;
- canonical pattern markup size;
- style/recalc behavior for heavy pages.

The design-system JavaScript/WASM runtime budget is exactly **0 bytes**.

## 6. Dependency policy

Production runtime dependencies are prohibited.

Development-only testing/build dependencies are acceptable when they materially improve confidence and do not leak into distribution.

The build-time F# token compiler is allowed because it produces static CSS and is not shipped as browser behavior.

## 7. Documentation site

The documentation site shall dogfood the design system and show:

- canonical HTML for every pattern;
- visual/native states;
- keyboard behavior;
- accessibility notes;
- motion and reduced-motion behavior;
- copyable usage examples;
- token values/inheritance;
- browser support;
- whether Limen behavior is required;
- experimental/stable/deprecated status;
- mobile presentation.

The documentation site's own application behavior may use Limen/F#; that does not change the design-system package's zero-runtime rule.

## 8. Playground

A documentation playground may use application behavior to vary markup/state for demonstration.

Generated/copyable pattern output must remain HTML + CSS and must not imply that playground JavaScript is part of the component.

## 9. Consumer fixtures

Maintain fixtures proving consumption from:

- plain static HTML with CSS only;
- a Limen application;
- a representative F# application;
- at least one mainstream framework as interoperability evidence.

All consumers use the same canonical HTML/CSS contracts.

## 10. Release artifacts

Release should include:

- npm package;
- generated tokens CSS;
- foundation/component/combined CSS;
- canonical HTML patterns;
- build metrics;
- changelog;
- migration notes for breaking markup/token changes;
- integrity/provenance metadata supported by the package pipeline.

No component JavaScript type definitions or source maps are necessary because there is no component JavaScript API.

## 11. Deprecation

Deprecated markup/classes remain supported for a defined compatibility window unless maintaining them creates a security or accessibility defect.

Migration is documented through markup/token changes rather than console warnings.

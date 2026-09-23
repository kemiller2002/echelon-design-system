# Figma Integration Requirements

## 1. Purpose

Forma shall support a Figma-centered design and developer workflow without making
Figma a second source of truth and without adding browser runtime to the design
system.

Figma represents Forma's visual contracts. Canonical application markup remains
in `patterns/*.html`; canonical design tokens remain in
`tokens/echelon.tokens.json`.

## 2. Authority and synchronization

### FIGMA-AUTH-001 Canonical sources

The repository owns the canonical component anatomy and token values.

- Component anatomy: `patterns/*.html`
- Token values and aliases: `tokens/echelon.tokens.json`
- Figma mapping inventory: `figma/component-contracts.json`

A Figma file may not become an independent authority for token values, semantic
state, accessibility relationships, or markup structure.

### FIGMA-AUTH-002 No duplicated token authority

Figma Variables shall mirror the canonical DTCG token document. A change that
originates in Figma must be reconciled into the canonical token document before
it is treated as a Forma change.

### FIGMA-AUTH-003 Versioned mapping

Figma component mappings are part of the public design/development contract.
Renaming a Figma component/property or changing a mapped Forma pattern requires
the same compatibility consideration as changing a public class or pattern.

## 3. Tokens and variables

### FIGMA-TOKEN-001 Token availability

The published Forma package shall expose the canonical DTCG token JSON in
addition to compiled CSS tokens.

### FIGMA-TOKEN-002 Variable modes

Figma shall model at least Light and Dark modes from Forma semantic tokens.
Primitive values remain primitives; semantic aliases remain aliases where Figma
supports the relationship.

### FIGMA-TOKEN-003 Naming

Figma variable names shall preserve the repository token hierarchy using slash
separators, for example `semantic/light/color/text/primary`.

### FIGMA-TOKEN-004 Accessibility

Designers shall not detach or locally replace accessibility-critical semantic
variables merely to make an isolated mockup look correct. Contrast, focus,
forced-colors intent, and distinguishable states remain Forma requirements.

## 4. Figma component library

### FIGMA-COMP-001 Complete catalog coverage

Every implemented canonical `patterns/*.html` file shall have exactly one
entry in `figma/component-contracts.json`. CI shall fail when the inventory
drifts.

### FIGMA-COMP-002 Naming

Root Figma components shall use the `Forma / <Pattern Name>` naming convention
unless an accepted migration records another convention.

### FIGMA-COMP-003 Component properties

Use a small shared property vocabulary when applicable:

- `State`
- `Size`
- `Tone`
- `Density`
- `Disabled`
- `Read only`
- `Selected`
- `Checked`
- `Expanded`
- `Loading`
- `Label`
- `Supporting text`
- `Leading icon`
- `Trailing icon`

Do not expose a property merely because it exists in this vocabulary. Properties
must correspond to real Forma/native states or documented visual variations.

### FIGMA-COMP-004 Native semantics

A Figma representation may visually model a checkbox, radio, dialog, details
element, range input, or other native control, but the developer mapping shall
continue to point to Forma's semantic HTML rather than implying a replacement
runtime component.

### FIGMA-COMP-005 State authority

Figma may depict supplied presentation states. It shall not calculate domain
legality, scoring, permissions, obligations, readiness, or other application
state. Those remain owned by application/Ordo state, with non-native behavior
owned by the consuming application/Limen.

### FIGMA-COMP-006 Mobile and responsive representations

Components shall be designed with resizing/auto-layout behavior that reflects
Forma's intrinsic/reflow contract. A component whose canonical implementation is
required to work at 320 CSS pixels shall not be represented in Figma as a
desktop-fixed artifact.

### FIGMA-COMP-007 Accessibility annotations

Where semantics cannot be expressed visually, the component/library
documentation shall identify the required semantic element, accessible-name
relationship, keyboard behavior, and any application responsibility.

## 5. Code Connect

### FIGMA-CODE-001 Template files

New Code Connect mappings shall use Figma's actively maintained template-file
format. Do not add new legacy framework-parser mappings.

### FIGMA-CODE-002 Real node identifiers only

A Code Connect template may be committed only when it refers to an actual
published Figma library component. Never invent or placeholder-publish a Figma
node URL.

### FIGMA-CODE-003 Canonical output

The code shown in Figma Dev Mode shall use the canonical Forma HTML pattern and
classes. It shall not suggest Custom Elements unless the consuming application
actually owns such a wrapper and the mapping is explicitly application-local.

### FIGMA-CODE-004 Property mapping

Figma properties shall map to native attributes, canonical classes, text
content, and documented application-rendered states. Mapping must preserve
semantic HTML and accessible relationships.

### FIGMA-CODE-005 Review and preview

Before publication, mappings shall be previewed and inspected for representative
property combinations. Published snippets are a developer-facing API and require
review.

## 6. Tooling boundaries

Build/test tooling for Figma integration may use JavaScript/TypeScript, F#, the
Figma API, plugins, or Code Connect. None of that tooling may become a required
browser runtime dependency of Forma.

The Figma REST Variables API may be used where the organization's Figma plan and
permissions support it. A Figma plugin/import workflow may be used instead when
appropriate. Both paths must consume the canonical repository token source.

## 7. Completion criteria

Figma support is complete for a release only when:

1. every canonical HTML pattern appears in the machine-readable Figma contract;
2. token JSON is available from the published package;
3. the Figma library uses the canonical token hierarchy and Light/Dark modes;
4. all published Figma components have reviewed node mappings;
5. Code Connect coverage is reported separately from component inventory so an
   unmapped node cannot masquerade as complete integration;
6. mobile, accessibility, and state-ownership rules remain intact; and
7. repository validation passes.


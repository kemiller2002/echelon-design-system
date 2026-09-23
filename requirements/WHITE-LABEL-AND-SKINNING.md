# Forma White-Label and Skinning Requirements

Status: canonical requirements for brand identity, themes, skins, and scoped presentation

## 1. Purpose and terms

### BRAND-001 Brand and skin are different contracts
A **brand** changes product identity and brand-level presentation. A **skin** changes presentation without changing product identity, semantics, behavior, permissions, scoring, workflow, or domain state.

### BRAND-002 Brand Manifest is authoritative
Every supported white-label identity shall be represented by a versioned Brand Manifest. Ad-hoc global CSS is not the supported white-label contract.

### BRAND-003 Manifest is data
The Brand Manifest shall be declarative data. It shall not contain executable JavaScript, WebAssembly, HTML event handlers, arbitrary CSS, or other executable presentation logic.

### BRAND-004 Zero-runtime preservation
Brand compilation may use build-time tooling. Published Forma branding artifacts consumed by the browser shall remain static CSS/data and shall not add a Forma browser runtime.

## 2. Brand Manifest contract

### BRAND-010 Stable identity
A manifest shall have a schema version, stable lowercase brand ID, product name, and optional short name.

### BRAND-011 Identity assets
A manifest may declare logo, dark-surface logo, mark, favicon, illustration, email, and print asset references. Asset references remain application/build inputs; the CSS compiler shall not inject arbitrary asset URLs into generated CSS.

### BRAND-012 Terminology
A manifest may declare application terminology such as organization, user, project, practice, member, or engagement. Terminology is application content and is not emitted as CSS.

### BRAND-013 Presentation inputs
A manifest may declare brand typography and shape values plus complete semantic light and dark color mappings.

### BRAND-014 Version validation
Unsupported manifest schema versions shall fail compilation rather than being guessed or silently coerced.

### BRAND-015 Identifier validation
Brand IDs shall be safe for deterministic file names and data-attribute selectors.

### BRAND-016 No arbitrary CSS properties
The manifest schema and compiler shall use a closed set of supported presentation fields. Unknown data must not silently become CSS custom properties.

## 3. Token architecture

### BRAND-TOKEN-001 Four-layer model
Forma shall preserve four visual layers: primitive tokens, semantic tokens, component tokens where justified, and brand/skin overrides.

### BRAND-TOKEN-002 Semantic component dependency
Components shall consume semantic or documented component tokens for identity-sensitive presentation. Components shall not depend directly on customer brand names.

### BRAND-TOKEN-003 Brand output
Brand compilation shall map supported manifest values to the existing public `--ef-*` token contract rather than creating a parallel component API.

### BRAND-TOKEN-004 Theme parity
Every compiled brand shall provide the same semantic color token surface for light and dark themes.

### BRAND-TOKEN-005 Typography
Brand typography may override documented Forma font-family primitives without requiring component markup changes.

### BRAND-TOKEN-006 Shape
Brand shape may override documented radius primitives without changing component semantics.

### BRAND-TOKEN-007 State derivation direction
Interactive component state colors should be derived from or validated against semantic brand inputs. Applications shall not hard-code brand-specific hover/focus/active colors in component markup.

## 4. Theme and scope

### BRAND-SCOPE-001 Root scope
A brand may be applied at the document root with `data-ef-brand="<id>"`.

### BRAND-SCOPE-002 Nested scope
A brand may be applied to a subtree. CSS custom-property inheritance shall allow multiple independently branded examples or embedded surfaces in the same document.

### BRAND-SCOPE-003 Theme compatibility
Brand scopes shall support explicit light and dark themes and operating-system dark preference when no explicit theme is supplied.

### BRAND-SCOPE-004 Nested theme
A scoped brand shall respect an explicit `data-ef-theme` on the same element or a containing application theme scope.

### BRAND-SCOPE-005 Cheap theme switching
Changing theme or brand shall not require replacing canonical component DOM. The presentation contract is custom-property based.

## 5. Skins

### SKIN-001 Identity independence
A skin shall not change company/product name, logo, terminology, permissions, workflow, state, or domain behavior.

### SKIN-002 Supported scope
Skins shall be opt-in through a documented data attribute and may be scoped to a subtree.

### SKIN-003 Initial presets
Forma shall provide static zero-runtime compact, comfortable, and square presentation skins as an initial baseline.

### SKIN-004 Mobile safety
Density skins shall not invalidate Forma's 320 CSS px mobile contract or create pointer-only/hover-only behavior.

### SKIN-005 Accessibility safety
A skin shall not weaken focus visibility, state distinguishability, text alternatives, native semantics, or forced-colors behavior.

## 6. Accessibility validation

### BRAND-A11Y-001 WCAG baseline
A compiled brand shall preserve Forma's WCAG 2.2 AA target.

### BRAND-A11Y-002 Text contrast
Primary text, secondary text, secondary-surface text, inverse text, and identity-sensitive accent text shall meet the required contrast thresholds against their declared surfaces.

### BRAND-A11Y-003 Focus contrast
Focus-ring colors shall maintain at least 3:1 contrast against their associated primary surface.

### BRAND-A11Y-004 Invalid brand rejection
A brand manifest that cannot satisfy required contrast invariants shall fail compilation. The compiler shall identify the failing relationship and measured ratio.

### BRAND-A11Y-005 Non-color state
Branding and skins shall not turn a state that has a non-color cue into a color-only cue.

### BRAND-A11Y-006 Forced colors
System forced-colors/high-contrast behavior remains authoritative where user-agent colors are required; a brand must not suppress those adaptations.

## 7. Security and integrity

### BRAND-SEC-001 CSS injection prevention
Values emitted into CSS shall be type/format checked. Font-family and dimensional fields shall reject characters or formats that could escape their intended CSS value grammar.

### BRAND-SEC-002 No secrets
Brand manifests shall not contain access tokens, credentials, customer secrets, or environment-specific private configuration.

### BRAND-SEC-003 Asset trust boundary
Applications remain responsible for validating, hosting, authorizing, and applying brand asset URLs.

### BRAND-SEC-004 Deterministic output
The same valid manifest shall produce byte-for-byte deterministic CSS.

## 8. Application and framework boundaries

### BRAND-BOUNDARY-001 Presentation only
Brand and skin selection may alter appearance and identity but shall not alter legal transitions, validation rules, scoring, permissions, required fields, obligations, navigation authority, or application effects.

### BRAND-BOUNDARY-002 Limen ownership
If runtime brand/theme selection requires non-native behavior, persistence, user preference synchronization, remote loading, or preview editing, that behavior belongs to the consuming application/Limen.

### BRAND-BOUNDARY-003 Ordo ownership
Domain legality and meaningful application transitions remain Ordo/application authority regardless of active brand or skin.

### BRAND-BOUNDARY-004 Stable semantic equivalence
Every canonical component shall remain functionally, semantically, and accessibly equivalent under every valid brand and skin.

## 9. Distribution

### BRAND-DIST-001 Generated brand CSS
Repository brand manifests shall compile to `dist/brands/<brand-id>.css`.

### BRAND-DIST-002 Brand index
The build shall generate a deterministic brand index describing compiled brand IDs, names, source files, and CSS artifacts.

### BRAND-DIST-003 Skin artifact
Forma shall publish a standalone skin stylesheet and include it in the combined stylesheet.

### BRAND-DIST-004 Package exports
The npm package shall expose the skin stylesheet and compiled brand CSS without adding production runtime dependencies.

### BRAND-DIST-005 Independent loading
Consumers shall be able to load Forma without any white-label brand CSS, or load one or more compiled brand files as needed.

## 10. Documentation and tooling

### BRAND-DOC-001 Consumer guide
Forma shall document how to create, validate, compile, load, scope, and switch brand/theme/skin presentation.

### BRAND-DOC-002 Agent guidance
Agent instructions shall explicitly prohibit application-local CSS forks for ordinary branding and direct agents to the Brand Manifest/token contract.

### BRAND-DOC-003 Brand laboratory
The documentation site shall include a brand laboratory showing identical semantic markup under multiple brand scopes and skin presets.

### BRAND-DOC-004 Multiple scopes
Documentation shall demonstrate at least two brands on one page to prove scoped custom-property isolation.

### BRAND-DOC-005 Print and Figma alignment
Brand Manifest is the intended shared identity source for Forma web presentation, Forma print presentation, and generated Figma variables. Format-specific adapters may add print/design-only tokens without changing identity authority.

## 11. Tests and release gates

### BRAND-TEST-001 Compiler tests
Tests shall prove deterministic compilation, multiple-brand output, scope selectors, and rejection of unsafe contrast.

### BRAND-TEST-002 Package contract
Tests shall prove brand and skin artifacts are present in the distributable npm package.

### BRAND-TEST-003 Browser scope tests
Browser tests shall prove two brand scopes can coexist without leaking semantic token values across scopes.

### BRAND-TEST-004 Theme tests
Browser tests shall prove explicit dark theme works inside a brand scope.

### BRAND-TEST-005 Zero-runtime gate
Brand and skin support shall continue to pass Forma's zero-runtime artifact checks.

### BRAND-TEST-006 Documentation build
The site build shall verify that the brand laboratory is generated, contains multiple brand scopes, and includes no runtime script.

## 12. Future extension requirements

### BRAND-FUTURE-001 Derived interaction states
A later compiler revision may accept a smaller customer palette and deterministically derive hover, active, disabled, selected, chart, and other states, but derived output must still pass accessibility validation.

### BRAND-FUTURE-002 Interactive editor
An interactive Brand Manifest editor/preview may be implemented in the documentation application through Limen/F# while keeping generated/copyable Forma output static.

### BRAND-FUTURE-003 Export adapters
The Brand Manifest should support deterministic adapters for Figma variables, Forma print tokens, email presentation, and application metadata without duplicating identity definitions.

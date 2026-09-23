# Forma + Figma

Forma supports Figma as a design and developer-consumption surface. Figma is not
the implementation source of truth.

## What maps to what

| Forma | Figma |
| --- | --- |
| `tokens/echelon.tokens.json` | Variables and modes |
| `patterns/*.html` | Library components and component properties |
| CSS semantic/component tokens | Bound fills, strokes, text, spacing, radius, and other supported properties |
| Native/application-rendered states | Figma variants/properties used for visualization |
| `figma/component-contracts.json` | Coverage and stable naming inventory |
| `figma/code-connect/*.figma.ts` | Published Dev Mode code mappings |

Names beginning with `ef-` are HTML/CSS pattern contracts. Forma does not ship
Custom Elements or a JavaScript component runtime.

## Token workflow

The canonical file is always:

`tokens/echelon.tokens.json`

The npm package exposes the same file as
`@echelon-foundry/design-system/tokens.json`. Do not maintain a separately
edited Figma-token JSON file.

The Figma library should create variables using the repository hierarchy and
preserve semantic aliases where possible. Create semantic modes named `Light`
and `Dark` that correspond to the semantic token branches.

Use this deterministic DTCG-to-Figma type mapping:

| DTCG token type | Figma variable type | Conversion |
| --- | --- | --- |
| `color` | `COLOR` | Preserve sRGB value and alpha |
| `dimension` | `FLOAT` | Store the numeric px value; canonical unit remains in DTCG |
| `duration` | `TIMING` | Convert milliseconds to seconds |
| `cubicBezier` | `EASING` | Preserve the four control-point values |
| `fontFamily` | `STRING` | Use the primary family for Figma binding; DTCG retains the fallback list |

Aliases should remain variable aliases instead of being flattened to copied
values.

Recommended variable naming examples:

- `primitive/color/foundry-charcoal`
- `primitive/spacing/4`
- `semantic/color/text/primary`
- `semantic/color/surface/primary`

The last two names are mode-backed variables: their values change between Light
and Dark rather than creating separate designer-facing variables for each mode.

## Starter-plan compatibility

The production contract still requires both `Light` and `Dark` semantic
modes. A Figma Starter file may be used as an incremental authoring surface,
but Starter limitations must not change the canonical Forma contract.

The verified Starter-compatible layout is:

- exactly three pages: `Cover`, `Foundations`, and `Components`;
- Getting Started and Utilities are sections within those pages rather than
  additional pages;
- the `Forma Semantic Color` collection uses its single available mode named
  `Light`;
- all component bindings target the same semantic variables that will later
  receive a `Dark` value;
- do not create a separate Dark semantic collection as a workaround.

This keeps a Starter-built library upgrade-safe. After moving the file to a
plan that supports multiple variable modes, add `Dark` to the existing
`Forma Semantic Color` collection and populate the dark aliases from
`tokens/echelon.tokens.json`. Existing components should not need to be
rebuilt.

The current Starter implementation was validated with:

- 7 local variable collections;
- 50 canonical variables;
- 18 semantic Light aliases resolving to primitives;
- Web code syntax present on every variable;
- no invalid semantic scopes.

Figma MCP access on Starter is also rate-limited. When that allowance is
exhausted, stop mutating the Figma file and resume from the recorded integration
work item rather than recreating state manually.

## Component workflow

1. Start with an existing `patterns/<name>.html` contract.
2. Find the corresponding entry in `figma/component-contracts.json`.
3. Create/publish the root Figma component as `Forma / <Pattern Name>`.
4. Model only applicable properties. Prefer the shared vocabulary in the
   contract rather than synonymous one-off names.
5. Use auto layout/resizing so the design representation follows the same
   narrow-screen recomposition expected by Forma.
6. Bind visual values to Forma variables rather than local literals.
7. Record the real component node URL in the contract.
8. Add the Code Connect template and preview it before publication.

Figma variants visualize legal presentation states; they do not decide whether a
business operation is legal or available.

## Code Connect

Forma uses Figma's current template-file workflow. Configuration lives at
`figma.config.json`; committed mappings live under `figma/code-connect/`.

Generate a template only after the corresponding component exists in a
published Figma library:

```bash
npx figma connect create "FIGMA_COMPONENT_URL" --outDir figma/code-connect
```

Inspect and preview the generated mapping:

```bash
npx figma connect preview figma/code-connect/Component.figma.ts --inspect
npx figma connect preview figma/code-connect/Component.figma.ts --all
```

Publish only after the template emits canonical Forma markup:

```bash
FIGMA_ACCESS_TOKEN=... npx figma connect publish --exit-on-unreadable-files
```

Do not commit an invented node URL. Until a real library node is available, the
component's contract remains
`status: "requires-published-figma-component"`.

Current Figma Code Connect documentation:

- https://developers.figma.com/docs/code-connect/quickstart-guide/
- https://developers.figma.com/docs/code-connect/template-api/
- https://developers.figma.com/docs/code-connect/html/
- https://developers.figma.com/docs/code-connect/cli-reference/

## Pattern coverage

Run:

```bash
npm run test:figma
```

The test verifies that every canonical HTML pattern has exactly one Figma
contract entry and that package exports expose the canonical token/component
metadata.

A green coverage test does **not** claim that the external Figma library is
published or Code Connect is complete. External node mappings are deliberately
tracked separately because they require the real Figma library.

## Ownership

- Forma owns visual contracts, tokens, semantic markup, accessibility contracts,
  and responsive presentation.
- The Figma library mirrors those contracts for design/prototyping and handoff.
- Limen/application code owns behavior beyond native HTML.
- Ordo/application state owns capabilities, obligations, invariants, and legal
  transitions.

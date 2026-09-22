# Forma Agent Usage Contract

## Identity

**Forma** is the Echelon Foundry application design system in this repository.
The current package identifier is `@echelon-foundry/design-system`.

Forma is not a JavaScript component framework. It is a zero-runtime collection
of semantic HTML contracts, CSS, design tokens, accessibility rules, and visual
patterns. Names beginning with `ef-` are class/pattern contracts and do not
imply Custom Elements.

## Required decision order

When an agent creates or changes UI:

1. Identify the user task and application/domain state.
2. Search `patterns/*.html` for an existing Forma contract.
3. Check `requirements/COMPONENT-CATALOG.md` if the needed pattern is not yet
   implemented.
4. Use the existing semantic HTML pattern unchanged where possible.
5. Supply application-specific labels, values, help text, and state without
   encoding domain meaning into visual position or color.
6. Put behavior beyond native HTML in the consuming application, normally at the
   Limen boundary.
7. Keep transition legality, obligations, scoring, permissions, and domain
   invariants in Ordo/application state, never in Forma.
8. Validate the result with repository and accessibility tests.

## How to consume Forma

The package is currently private/alpha. Do not invent a public npm installation
command. In this repository or a workspace checkout:

```bash
npm install
npm run build
```

Use the generated stylesheet appropriate to the application:

```html
<link rel="stylesheet" href="/path/to/forma/dist/all.css">
```

For finer-grained builds, use the generated token, foundation, component, and
assessment CSS files in `dist/`.

Copy or render the canonical markup contract from the corresponding file under
`patterns/`. Preserve labels, IDs, `for`, `aria-*`, native input types,
fieldset/legend relationships, and state attributes.

## Boundary rules

Agents must not:

- add runtime JavaScript or WebAssembly to Forma;
- add custom-element registration as a hidden behavior layer;
- replace a native element solely for styling;
- create duplicate components for presets such as Likert-5 vs Agreement-5 when
  one ordinal-scale contract already represents the structure;
- infer score, severity, legality, permission, or domain meaning from visual
  order;
- make drag, hover, color, or pointer input the only interaction path;
- hide required information solely in a tooltip or animation;
- fork a canonical pattern in an application only to change spacing or color;
- introduce an advanced behavioral control without naming the application/Limen
  behavior contract it depends on.

## State ownership

| Concern | Owner |
| --- | --- |
| Checked, open, required, disabled, native validity | Native HTML rendered by the application |
| Color, spacing, typography, responsive layout | Forma |
| Async search, ranking movement, rule editing | Consuming application / Limen |
| Legal transitions, capabilities, obligations | Ordo/application domain state |
| Survey scoring or interpretation | Signal/application domain logic |
| Accessibility contract and non-color cues | Forma plus consuming application content |

## Choosing an existing pattern

Prefer the most semantic existing primitive.

- Binary assessment answer with an unanswered state: `binary-choice`, not a switch.
- Ordered agreement/frequency/confidence choices: `ordinal-scale`.
- Ordinary on/off preference: `switch`.
- Disclosure of optional content: native `details` via `disclosure`.
- Modal confirmation: native `dialog`.
- Simple single/multi selection: `choice-group` / `multi-choice`.
- Complex ranking or rule construction: use the Forma visual contract and put
  behavior in Limen/application code.

## Mobile contract

Every Forma component must have a usable 320 CSS px presentation. Agents must:

- preserve semantic order and domain meaning across breakpoints;
- avoid page-level horizontal overflow for essential content;
- provide non-hover, non-drag, non-pointer-only alternatives;
- keep critical actions reachable when toolbars, tabs, panes, and grids collapse;
- preserve deep-link/URL state meaning when controls recompose;
- test reduced motion, focus, and forced-colors behavior after recomposition;
- use the documented Mobile · 320px example as a minimum baseline, not a device-specific fork.

Read `requirements/MOBILE-COMPONENT-CONTRACT.md` before adding or modifying a component.

## Verification

Before claiming a Forma UI change complete:

```bash
npm run check
npm run site:check
./ros registry check
./ros validate
```

The documentation build enforces that every implemented `patterns/*.html`
component has a dedicated page with at least three rendered examples and that
the published site contains no runtime `<script>` element.

## Documentation site

The site is generated, not hand-maintained page by page. Canonical component
markup remains in `patterns/`; `tools/build-site.mjs` creates the catalog and
individual pages.

When adding a pattern:

1. add the canonical `patterns/<slug>.html` file and tests;
2. add its metadata to `tools/build-site.mjs`;
3. run `npm run site:check`;
4. confirm the new component page contains at least three meaningful examples, including the explicit Mobile · 320px example;
5. update requirements/decision records through ROS when the addition changes
   the public design-system contract.

# Forma Component Showcase Site

Forma is the Echelon Foundry design system. This showcase is a static documentation site generated from Forma's canonical patterns.

## Source of truth

Do not hand-author component pages.

- canonical markup: `patterns/*.html`
- component metadata: `site/build-site.mjs`
- site shell styles: `site/assets/site.css`
- generated output: `site-dist/` (ignored)
- agent usage contract: `docs/agents/DESIGN-SYSTEM-USAGE.md`

## Build

```bash
npm run site:build
```

This first builds the package, then generates `site-dist/`.

If `dist/` is already current:

```bash
npm run site:build:only
```

## Validate

```bash
npm run site:test
```

or run the complete site sequence:

```bash
npm run site:check
```

## Preview

```bash
npm run site:serve
```

Then open the local server on port 4000.

## Adding a component

1. Add the canonical `patterns/<slug>.html`.
2. Add the component's metadata to `site/build-site.mjs`.
3. Add or update public CSS.
4. Add browser/accessibility tests.
5. Run `npm run site:check`.
6. Inspect all three generated examples.
7. Complete ROS attribution.

The generator fails if a canonical pattern has no showcase metadata.

Tracked work item: `GH-9` records the initial Forma component showcase implementation.

# Repository Semantic Map

| Semantic area / feature | Purpose | Location | Manifest | Notes |
|---|---|---|---|---|
| Design tokens | Canonical visual decisions and generated platform variables | `tokens/` | `tokens/manifest.md` | DTCG 2025.10 source |
| Token compiler | Validate/resolve tokens and generate CSS | `tools/TokenCompiler/` | `tools/TokenCompiler/manifest.md` | Build-time F#, no browser runtime |
| HTML patterns | Canonical semantic markup contracts | `patterns/` | `patterns/manifest.md` | HTML only |
| Switch | Binary on/off pattern with native semantics | `patterns/switch.html` + `src/styles/components.css` | `src/switch.manifest.md` | Native checkbox |
| Slider | Numeric range pattern preserving native slider behavior | `patterns/slider.html` + `src/styles/components.css` | `src/slider.manifest.md` | Native range input |
| Assessment patterns | Reusable question/ordinal/choice/validation/progress/workflow contracts | `patterns/` + `src/styles/assessment.css` | `patterns/assessment.manifest.md` | Signal-derived, application-independent |
| Foundations | Native HTML/layout/focus styling | `src/styles/` | `src/styles/manifest.md` | CSS only |
| Forma component showcase | Generated static documentation and examples for every canonical pattern | `site/` | `site/manifest.md` | Zero-runtime GitHub Pages artifact |
| Browser verification | Cross-browser behavior/accessibility contract tests | `tests/browser/` | not needed — test-only routing is obvious | Playwright |

## Repository-wide composition

- Composition/root entry point: consuming application's HTML
- Shared contracts: `patterns/*.html`, `src/styles/*.css`, `tokens/echelon.tokens.json`
- Behavior boundary: Limen/application code outside this package
- Architecture checks: `npm run check`
- Boundary checks: `npm run test:runtime`, `npm run test:browser`

## Areas without separate manifests

| Area | Reason a separate manifest is not needed |
|---|---|
| Package metadata | Mechanical distribution metadata with no semantic behavior |
| Browser tests | Cohesive test-only area directly named by pattern |

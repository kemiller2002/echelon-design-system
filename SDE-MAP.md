# Repository Semantic Map

| Semantic area / feature | Purpose | Location | Manifest | Notes |
|---|---|---|---|---|
| Design tokens | Canonical visual decisions and generated platform variables | `tokens/` | `tokens/manifest.md` | DTCG 2025.10 source |
| Token compiler | Validate/resolve tokens and generate CSS | `tools/TokenCompiler/` | `tools/TokenCompiler/manifest.md` | Build-time F#, no runtime dependency |
| Component runtime | Minimal browser lifecycle/event bridge | `src/Runtime/` | `src/Runtime/manifest.md` | Fable, no UI framework |
| Switch | Binary on/off input with native semantics | `src/Switch.fs` | `src/switch.manifest.md` | Native checkbox + role=switch |
| Slider | Numeric range input with native semantics and polished presentation | `src/Slider.fs` | `src/slider.manifest.md` | Native range input |
| Foundations | Native HTML/layout/focus styling | `src/styles/` | `src/styles/manifest.md` | CSS-first |
| Browser verification | Cross-browser behavior/accessibility contract tests | `tests/browser/` | not needed — test-only routing is obvious | Playwright |

## Repository-wide composition

- Composition/root entry point: `src/Index.fs`
- Shared contracts: `src/Runtime/WebComponent.fs`, `tokens/echelon.tokens.json`
- Architecture checks: `npm run check`
- Boundary checks: `npm run test:browser`

## Areas without separate manifests

| Area | Reason a separate manifest is not needed |
|---|---|
| Package metadata | Mechanical distribution metadata with no semantic behavior |
| Browser tests | Cohesive test-only area directly named by component |

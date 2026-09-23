# Echelon Design System

Shared design-system infrastructure for Echelon Foundry applications.

This repository is governed by the Echelon engineering capability stack:

- State-Directed Engineering / Ordo
- Repository Operating System (ROS)
- Visual Engineering
- Communication Engineering

The design system will provide shared visual foundations, reusable browser-native components, application patterns, accessibility contracts, behavioral state models where warranted, and integration points for Echelon applications.

Repository requirements and implementation work should be captured through ROS and shaped by Ordo rather than treating the component catalog as the source of domain truth.

Current capability baseline:

- SDE / Ordo 1.3.0
- ROS 3.1.4
- Visual Engineering 1.0.0
- Communication Engineering 1.0.0


## Forma

**Forma** is the product name for this Echelon Foundry design system. The package identifier is `@echelon-foundry/design-system`. Forma 0.1.0 is the first application-consumption baseline.

Forma is intentionally zero-runtime. Semantic HTML, CSS, design tokens,
accessibility contracts, and visual patterns live here. Behavior beyond
browser-native interaction belongs to the consuming application, normally
through Limen.

Build the component documentation site with:

```bash
npm run site:check
```

The generated GitHub Pages artifact is written to `site-dist/`.
Agent usage rules are in [docs/AGENT-USAGE.md](docs/AGENT-USAGE.md).


## Application consumption

Applications must consume a pinned Forma release rather than copying CSS or
tracking the repository branch. See
[docs/CONSUMING-FORMA.md](docs/CONSUMING-FORMA.md) for the canonical dependency,
ownership boundaries, mobile rules, and upgrade procedure.

A version tag builds and validates the exact package archive, exercises it in a
clean consumer, and attaches the tarball to the GitHub release. npm publishing
may be enabled through Trusted Publishing without changing the application
contract.

## Figma

Forma treats Figma as a design and developer-consumption surface, not as a
second source of truth. Canonical tokens remain in
`tokens/echelon.tokens.json`, canonical component anatomy remains in
`patterns/*.html`, and `figma/component-contracts.json` provides complete,
machine-readable coverage for the Figma library.

See [docs/FIGMA.md](docs/FIGMA.md) for the variable, component, and Code Connect
workflow. The public package also exposes `./tokens.json` and
`./figma/components.json` for design tooling.


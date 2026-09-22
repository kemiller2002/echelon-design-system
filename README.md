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

## Component showcase

This repository builds a static Echelon Foundry component showcase from the canonical `patterns/*.html` files.

Each canonical component receives its own page with at least three live examples and visible source markup. The published site contains no browser JavaScript.

Build and validate it with:

```bash
npm run site:check
```

Preview locally with:

```bash
npm run site:serve
```

GitHub Pages deployment is defined in `.github/workflows/deploy-pages.yml` and publishes `site-dist/` after a successful build and showcase validation.

Agents must read [docs/agents/DESIGN-SYSTEM-USAGE.md](docs/agents/DESIGN-SYSTEM-USAGE.md) before implementing Echelon UI.

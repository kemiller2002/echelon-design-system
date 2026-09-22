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

**Forma** is the product name for this Echelon Foundry design system. The
package identifier remains `@echelon-foundry/design-system` during the current
alpha/private phase.

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

# Echelon Foundry Design System

Authoritative, versioned design contracts for the Echelon Foundry ecosystem.

## Purpose

This repository defines shared brand foundations, semantic design tokens, typography, layout conventions, component specifications, accessibility requirements, and print design contracts. It is **not** a second UI component library.

- **Forma** implements interactive UI components and themes.
- **Forma Studio** documents and previews the design system.
- **Folio** maps the design contracts to reports and print output.
- **Percepta** verifies applicable experience contracts.
- **Dokimos** integrates quality and compliance evidence.
- **Conditor** installs pinned, compatible design-system releases into new projects.

Applications consume immutable, versioned artifacts, not the moving `main` branch.

## Status

**Bootstrap / brand source audit recorded, owner approval pending.** Balanced Charcoal and Bronze is the selected direction. [`brand/AUDIT.md`](brand/AUDIT.md) records the verified values from Forma, the echelonfoundry.com source repository, Folio and Forma Studio. None of the candidate brand hex values below appears in any verified source, and no approved EF logo exists. Do not publish candidate values as final brand tokens.

### Candidate palette (unverified)

| Role | Candidate |
| --- | --- |
| Charcoal | `#20252A` |
| Bronze | `#B7844B` |
| Warm white | `#F8F7F4` |
| Surface white | `#FFFFFF` |
| Slate | `#64717D` |
| Border | `#DDDAD4` |
| Dark background | `#171B1F` |
| Dark bronze | `#D4A66C` |

These are proposals, **not** frozen or accessibility-approved tokens.

## Echelon theme package (EDS-ADR-002)

This repository owns the Echelon brand for Forma: `theme/` holds the brand manifest, the marketing tokens and the theme CSS; `logos/` holds the owner-approved corporate marks; `dist/` holds the compiled CSS, `asset-manifest.json` and `checksums.txt`, packaged as `@echelon-foundry/echelon-theme` (`0.0.0-dev`, unreleased). `tools/build_theme.py` compiles it with Forma's own F# compilers from a pinned Forma checkout (`forma-pin.json`, currently v0.14.0); CI checks the committed output, validates assets and scope, runs adversarial fixtures, and proves parity with the Forma v0.14.0 release. Colors are carried from Forma 0.14.0, not a frozen v1 palette. Consumers: [`docs/CONSUMING-THE-ECHELON-THEME.md`](docs/CONSUMING-THE-ECHELON-THEME.md). Theme 1.0.0 is released only after Forma 1.0.0 exists.

## Required first implementation gates

1. Audit the website source, approved EF logo assets, existing Forma and Folio styling, and document exact values with file paths and revisions.
2. Define machine-readable primitive, semantic, light/dark, typography, spacing, component, and print contracts, with schemas and validation.
3. Verify WCAG 2.2 AA contrast and interaction requirements, including foreground/background pairs and non-color status cues.
4. Release immutable, checksummed contracts with compatibility metadata and semantic versioning.
5. Update Forma and Forma Studio; then Folio, Percepta, Dokimos, and Conditor.
6. Migrate one representative application, then plan and verify the remaining applications in waves.

## Governance

- F# first and WASM-first where applicable.
- Reuse existing Echelon tooling and APIs rather than introducing redundant infrastructure.
- No hard-coded application colors without documented, scoped exceptions.
- New application releases pin a known design-system version.
- Changes require unit tests, schema validation, contrast checks, and independent verification.
- Do not merge incomplete work or represent unexecuted tests as passing.

## Planned layout

```text
brand/          # Verified identity, logos, and audit
tokens/         # Primitive and semantic design tokens
components/     # Component behavior and state contracts
patterns/       # Application shell and page patterns
accessibility/  # Testable accessibility requirements
print/          # Folio-compatible print semantics
schemas/        # Machine-readable contract validation
tests/          # Positive and adversarial fixtures
generated/      # Reproducible, versioned artifacts
docs/           # Adoption and migration guides
```

The directories are a planned structure; create them as validated contracts and tests are implemented.

# Forma Brand-Neutral Architecture and Echelon Theme Boundary

**ID:** EDS-ARCH-THEME-001  
**Status:** Normative draft

## Architectural decision

Forma is a general-purpose, brand-neutral F# UI framework intended for use by independent organizations. The Echelon Foundry design system is an external, versioned theme and experience contract implemented using Forma's public extension points. Forma MUST NOT embed Echelon-specific colors, logos, wording, visual identity, or application behavior as its framework defaults.

## Responsibility boundaries

| Owner | Responsibilities |
| --- | --- |
| Forma | Brand-neutral theme contracts, semantic token resolution, scoped CSS generation, reusable components, accessible behavior, loading/skeleton primitives, shell/layout primitives, logo slots, and extensibility |
| Forma Studio | Preview arbitrary organization themes, variants, breakpoints, accessibility, and reduced-motion states |
| echelon-design-system | Echelon-specific palettes, typography, component style choices, application identity requirements, waiting/landing standards, and compliance fixtures |
| Application / organization | Selected theme, application logo, landing-page content, routes, and workflow behavior |
| Folio | Brand-neutral print theme consumption with organization-specific mappings |
| Dokimos / Percepta | Generic framework tests and separate Echelon-specific compliance profiles |

## Requirements

1. An organization MUST be able to supply a new theme without modifying Forma source code.
2. Theme contracts MUST support colors, typography, spacing, density, radii, elevations, component variants, focus treatments, light/dark modes, and responsive configuration through typed F# APIs and validated external token artifacts.
3. Semantic tokens MUST be preferred over hard-coded brand values. Provide documented defaults that are neutral and accessible.
4. Theme scope MUST support multiple independently themed application roots, including embedded applications, without global CSS leakage.
5. Theme changes MUST preserve component semantics, keyboard navigation, screen-reader behavior, and security boundaries.
6. Logo and branding components MUST accept application-provided assets and names; they MUST NOT include built-in EF marks.
7. The pre-WASM startup shell MUST render independently of the WASM runtime, accepting prebuilt theme variables and application identity metadata.
8. Landing-page and waiting-state components MUST be brand-neutral; Echelon-specific appearance and requirements are supplied through the external contract.
9. Third-party themes MUST NOT be required to adopt Echelon-only compliance rules. General accessibility and framework correctness remain mandatory.
10. Releases MUST be versioned and compatible; consuming applications pin approved versions with integrity verification.
11. Forma Studio MUST demonstrate at least two substantially distinct organization themes to prove that the abstraction is not Echelon-specific.
12. Tests MUST detect Echelon-specific values or assets accidentally hardcoded in Forma's generic packages.

## Migration and implementation

Audit current Forma theme APIs and actual app usage before changes. Define a backward-compatible adapter or documented migration. Implement the neutral contract first, then the Echelon adapter/theme package and Studio examples. Signal is the first Echelon consumer, but its readiness work may proceed independently. Do not assert that this architecture has been implemented merely because this document exists.

## Acceptance

A non-Echelon organization can build and deploy an app using Forma with its own logo, typography, color palette, and component style choices, with no Echelon branding in rendered output or bundles. Echelon applications can opt into the separately versioned Echelon design contract. Both variants pass relevant accessibility and regression tests.

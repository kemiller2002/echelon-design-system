# Decision: Echelon brand ownership and logo asset resolution

**ID:** EDS-ADR-002  
**Status:** Approved architectural direction; implementation pending

## Decision

Move the Echelon-specific brand definition and its corporate logo assets out of Forma and into `echelon-design-system`. Forma MUST remain brand-neutral and MUST NOT carry an Echelon-branded default theme, EF logo asset paths, or other organization-specific identity. Fixing broken paths in Forma is not the target architecture.

## Ownership

- `forma`: typed F# theme interfaces, generic logo slots/renderers, CSS/token application, accessibility behavior, and generic fallback components.
- `echelon-design-system`: verified corporate Echelon assets, Echelon theme configuration, semantic mappings, metadata and integrity manifests, and release artifacts.
- Application repositories (beginning with `signal`): unique approved application marks and application-specific identity metadata; bundle or serve those assets at actual deployed URLs.
- `forma-studio`: brand-neutral examples, with Echelon as one optional external theme and at least one unrelated organization theme.

## Migration requirements

1. Locate the current Echelon brand file and every consumer in Forma, Forma Studio, and applications; inventory all referenced logo paths.
2. Find and verify approved Echelon marks and licensing/source provenance. Never invent missing logo files or silently substitute unapproved marks.
3. Move the Echelon brand contract to the design-system repository, preserving compatible data fields where possible. Publish it as an immutable, versioned asset bundle.
4. Replace Forma's internal Echelon brand import with a generic theme provider and documented external theme-loading adapter. Use a compatibility bridge only if needed and remove it after consumers migrate.
5. Ensure each asset URI resolves in the built/deployed application, not merely in a source checkout. Prefer packaged assets and manifest-derived application URLs over raw GitHub links or moving `main` references.
6. Provide deterministic build-time checks that every manifest-referenced asset exists and that light/dark, favicon, pre-WASM, and application identity variants are valid.
7. Migrate Signal as the first consumer. Verify startup splash, app shell, landing page, favicon and dark/light variants against deployed URLs.
8. Verify Forma renders with a completely unrelated organization's theme and no Echelon branding in its framework bundle.

## Failure gates

Fail verification for missing logo assets, broken paths, unapproved placeholders represented as final marks, brand-specific paths hardcoded in Forma, or missing pre-WASM branding. Do not merge a change that only repoints broken assets while retaining Echelon brand ownership inside Forma.

## Implementation status

This decision records the required architecture. It does not assert that the existing Forma file has been moved, that logo assets have been located, or that the consumers have been migrated.

Progress: the Echelon theme package (brand manifest, marketing theme, approved corporate marks, asset manifest, validation and release workflow) now lives in this repository; see [`CONSUMING-THE-ECHELON-THEME.md`](CONSUMING-THE-ECHELON-THEME.md). It is unreleased until Forma 1.0.0 exists. Removing Echelon from Forma and migrating consumers are separate steps and are not claimed here.

# Application Identity and Logo Standard

**ID:** EDS-BRAND-APP-001  
**Status:** Normative draft, pending asset and brand audit

Every user-facing Echelon application MUST have a distinct, approved application logo. A generic EF corporate mark alone is not sufficient as the application's identity. Logos MUST share a recognizable Echelon visual language while remaining distinguishable at small sizes.

## Identity rules

- The corporate Echelon Foundry logo remains the parent brand; application logos are subordinate, distinct identities.
- Use the approved shared palette and visual grammar, with application-specific symbolism or monograms.
- Do not create an unrelated color palette or independently modify the parent brand mark.
- A logo must work on light and dark backgrounds, at small icon sizes, and in monochrome.
- Never use text-only placeholders as final logos. Provide accessible application names alongside icons where the name is needed.
- Existing approved logos must be inventoried and preserved until reviewed; do not overwrite them automatically.

## Required assets

For every application, maintain source-of-truth vector artwork (SVG preferred), light and dark variants where necessary, a monochrome variant, a square app icon, favicon sizes, and a branded loading-state asset. Generate raster derivatives reproducibly where required. Keep asset filenames and metadata stable. Validate SVG for unsafe embedded scripts, external references, and accessibility metadata.

## Placement

The app logo MUST appear in the app shell/header and the initial startup screen. Use appropriate versions for the browser favicon, installed PWA icon/manifest, mobile shortcut, error/offline screen, and application information/about surface. Do not place a large decorative logo on every content panel.

## Integration

- Design-system repository defines logo guidelines, metadata schema, and verification requirements.
- Each application owns its unique approved artwork and references the pinned design standard; a centralized catalog may index released logos.
- Forma provides reusable logo and branded loading components without hardcoding app identities.
- Forma Studio previews logo variants and small-size readability.
- Conditor scaffolds a clearly marked provisional app logo and requires approved replacement before design-compliant release.
- Percepta/Dokimos verify required assets, contrast, responsive rendering, and accessible naming using supported test runners.

## Verification

Tests MUST verify that all required asset paths resolve, no blank or broken logo appears during delayed WASM startup, light/dark variants remain visible, favicon and PWA metadata are valid where applicable, and the logo remains legible at 16, 32, and 64 pixels. Verify a meaningful fallback if an asset fails. Do not assert that a logo is approved merely because the file exists.

## Migration priority

Signal is the first application to audit and adopt this standard. Discover existing Signal logo assets before designing replacements. Then inventory Causa, Specula, Mercatus, Census, and other user-facing applications.

## Acceptance

An application is not fully design-system compliant until its unique logo is approved, its asset variants and placements are verified, and the branded waiting-state requirement EDS-UX-WAIT-001 passes.

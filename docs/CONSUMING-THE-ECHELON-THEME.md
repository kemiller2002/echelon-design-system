# Consuming the Echelon theme

**Package:** `@echelon-foundry/echelon-theme`
**Decision:** EDS-ADR-002 (Echelon branding moves out of Forma into this repository)
**Status:** not released. The repository builds `0.0.0-dev` against Forma v0.14.0 to prove parity. Theme `1.0.0` will be built and released only after Forma 1.0.0 exists. It will use `data-forma-brand` and `--forma-*`.

The colors are **carried from Forma 0.14.0, not a frozen v1 palette**. They are the verified values in [`brand/AUDIT.md`](../brand/AUDIT.md), unchanged.

## What the package contains

| Path | Contents |
| --- | --- |
| `dist/echelon.css` | Brand CSS. Forma's BrandCompiler compiles it from `theme/echelon.brand.json`. Every selector is scoped to `[data-<ns>-brand="echelon"]`. |
| `dist/echelon-marketing.css` | Marketing theme. It holds the compiled `theme/echelon-marketing.tokens.json` followed by the theme hooks. Load it after Forma's neutral `forma-marketing.css`. |
| `dist/asset-manifest.json` | One entry per asset role, with its package-relative path, media type, bytes, sha256 and approved source file. It also records the Forma ref and commit, the brand attribute, and the owner approval. |
| `dist/checksums.txt` | `sha256sum` lines for every generated file and every theme source. |
| `logos/echelon-foundry/*.svg` | The owner-approved Echelon Foundry marks, copied byte for byte from `brand/logos/`. |
| `theme/` | The sources: the brand manifest (schema 1.0), the marketing tokens, the carried primitives, the theme CSS template and the asset roles. |

### Asset roles

| Role | Packaged file | Notes |
| --- | --- | --- |
| `mark` | `logos/echelon-foundry/mark.svg` | Square mark: charcoal tile, light-bronze strokes. |
| `markDark` | `logos/echelon-foundry/mark-dark.svg` | The catalog's dark variant: parchment tile, oxide-bronze strokes. |
| `monochrome` | `logos/echelon-foundry/mark-mono.svg` | `currentColor` strokes and no tile. |
| `lockup` | `logos/echelon-foundry/lockup.svg` | Mark plus the ECHELON FOUNDRY wordmark, with charcoal text for light backgrounds. The wordmark is SVG text in Manrope; outline it before print. |
| `favicon` | `logos/echelon-foundry/mark.svg` | **Same file as `mark`.** No separate favicon artwork exists. |
| `startup` | `logos/echelon-foundry/mark.svg` | **Same file as `mark`.** No separate start-up (pre-WASM) artwork exists. |

`theme/echelon.brand.json` keeps the Forma schema 1.0 fields. In `identity.assets`, `logo`, `mark` and `favicon` point at `mark.svg`, and `logoDark` points at `mark-dark.svg`. No dark lockup has been approved, so `logo` uses the square mark rather than the lockup. Do not draw a dark lockup or any other variant yourself. New artwork needs owner approval, recorded in `brand/logos/catalog.json`.

## Adopting the theme (with Forma 1.0.0)

1. **Run Forma's codemod first.** See Forma's `docs/CONSUMING-FORMA.md`. It renames `ef-` to `forma-`.
2. **Pin a release.** Download the theme's GitHub release assets: the `.tgz`, `checksums.txt` and `asset-manifest.json`. Verify the tarball before you install it, then record the version and sha256 in your lock (Conditor pins it the same way):

   ```sh
   sha256sum -c --ignore-missing checksums.txt
   npm install ./echelon-foundry-echelon-theme-1.0.0.tgz
   ```

   Never install from this repository's `main` branch or from `raw.githubusercontent.com`.
3. **Load order.** Load Forma's CSS first, then the theme:

   ```html
   <link rel="stylesheet" href="/assets/forma/all.css">          <!-- Forma 1.x -->
   <link rel="stylesheet" href="/assets/echelon/echelon.css">     <!-- this package: dist/echelon.css -->
   ```

   For a marketing site, load Forma's `forma-marketing.css`, then `dist/echelon-marketing.css`. Together they reproduce Forma 0.14.0's single-file `forma-echelon-marketing.css`.
4. **Brand attribute.** Set `data-forma-brand="echelon"` on `<html>`. The brand CSS applies only inside that attribute. Control light and dark with Forma's `data-forma-theme`, or leave it unset to follow `prefers-color-scheme`.

   ```html
   <html lang="en" data-forma-brand="echelon">
   ```

5. **Serve logos from the packaged files at deployed URLs.** Copy the files that `dist/asset-manifest.json` lists into your build output, for example `/brand/echelon/`. Derive each URL from the manifest's `path`, and check each file's sha256 at build time. After you deploy, check that each URL returns the file. A path in a source checkout is not enough.

   ```html
   <link rel="icon" type="image/svg+xml" href="/brand/echelon/mark.svg">   <!-- role: favicon -->
   <picture>                                                               <!-- roles: mark / markDark -->
     <source srcset="/brand/echelon/mark-dark.svg" media="(prefers-color-scheme: dark)">
     <img src="/brand/echelon/mark.svg" alt="Echelon Foundry" width="32" height="32">
   </picture>
   ```

   Put the `startup` asset in the static HTML shell, which renders before any WebAssembly or script runtime loads. Either inline it or reference it at its deployed URL, so the start-up screen is never blank.
6. **Application marks belong to the application.** The Echelon Foundry mark is the parent brand. It does not identify an application. Each application (Signal first) ships its own approved mark, under EDS-BRAND-APP-001, and serves it at its own deployed URLs. This package does not include application marks.

## Verifying a package

```sh
python tools/theme_validator.py <unpacked-package-root> --brand-attribute data-forma-brand
```

The validator fails in any of these cases:

- an asset is missing or its sha256 does not match;
- a required role is missing;
- an SVG is unsafe (script, event handler or external reference);
- an asset path is a URL, an absolute path, a `raw.githubusercontent.com` link or a moving `main` reference;
- `identity.assets` names a file that is not packaged;
- a rule in `dist/echelon.css` is not scoped to the brand attribute;
- `checksums.txt` does not match the files.

## Rebuilding against another Forma pin

The build is parametric. It copies Forma's F# BrandCompiler and TokenCompiler out of a clean Forma checkout and runs them with `dotnet run`. It never writes to the checkout. The output records the Forma ref, the commit and the brand attribute.

```sh
git clone --depth 1 --branch <forma-tag> https://github.com/kemiller2002/forma /tmp/forma-<forma-tag>
python tools/build_theme.py --forma /tmp/forma-<forma-tag> --forma-ref <forma-tag> \
    --brand-attribute <data-ef-brand|data-forma-brand>
```

To move to Forma 1.0.0:

1. Update `forma-pin.json` (ref, commit, `brandAttribute: data-forma-brand`).
2. Rebuild, then commit `dist/` and `logos/`.
3. Set `package.json` to `1.0.0` and tag `v1.0.0`.

The release workflow refuses a tag unless the pin is Forma 1.0.0 or later with `data-forma-brand`, and the tag matches the version.

Requirements: .NET 10 SDK (Forma's compilers need no NuGet packages), Python 3.10 or later, and git.

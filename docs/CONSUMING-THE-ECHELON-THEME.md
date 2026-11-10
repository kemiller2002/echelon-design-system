# Consuming the Echelon theme

**Package:** `@echelon-foundry/echelon-theme`
**Decision:** EDS-ADR-002 (Echelon branding moves out of Forma into this repository)
**Status:** `1.1.0`, built against Forma v1.0.0 (`97ea220`) and render-tested on Forma v1.0.1. It uses `data-forma-brand` and `--forma-*`. CI separately proves that the same sources built against Forma v0.14.0 reproduce that release's Echelon output byte for byte. `1.1.0` adds the Echelon application layer and self-hosted fonts; `dist/echelon.css` is unchanged from `1.0.0`.

The colors are **carried from Forma 0.14.0, not a frozen v1 palette**. They are the verified values in [`brand/AUDIT.md`](../brand/AUDIT.md), unchanged.

## What the package contains

| Path | Contents |
| --- | --- |
| `dist/echelon.css` | Brand CSS. Forma's BrandCompiler compiles it from `theme/echelon.brand.json`. Every selector is scoped to `[data-<ns>-brand="echelon"]`. |
| `dist/echelon-marketing.css` | Marketing theme. It holds the compiled `theme/echelon-marketing.tokens.json` followed by the theme hooks. Load it after Forma's neutral `forma-marketing.css`. |
| `dist/echelon-fonts.css` | `@font-face` rules for the self-hosted Newsreader, Manrope and IBM Plex Mono. Relative URLs into `dist/fonts/`, `font-display: swap`. |
| `dist/echelon-app.css` | The Echelon application layer: tokens, app bar, nav tabs, panels, type roles, button emphasis, chips and loading. See [The application layer](#the-application-layer-110). |
| `dist/fonts/*.woff2` | Latin WOFF2 subsets taken unchanged from the npm packages pinned in `theme/echelon-fonts.json`. |
| `dist/fonts/licenses/*-OFL.txt` | Each font package's SIL Open Font License 1.1 text. |
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
3. **Load order.** Load Forma's CSS first, then the theme, in this order:

   ```html
   <link rel="stylesheet" href="/assets/forma/all.css">                 <!-- Forma 1.x -->
   <link rel="stylesheet" href="/assets/echelon/echelon.css">           <!-- dist/echelon.css -->
   <link rel="stylesheet" href="/assets/echelon/echelon-fonts.css">     <!-- dist/echelon-fonts.css -->
   <link rel="stylesheet" href="/assets/echelon/echelon-app.css">       <!-- dist/echelon-app.css -->
   ```

   Copy `dist/fonts/` next to `echelon-fonts.css` (it references `fonts/<file>.woff2`), so the fonts load under `font-src 'self'`. An application that uses none of the application-layer classes can skip `echelon-app.css`; skipping `echelon-fonts.css` falls back to the system fonts named after each family.

   For a marketing site, load Forma's `forma-marketing.css`, then `dist/echelon.css`, then `dist/echelon-marketing.css`, and set `data-forma-brand="echelon"` on `<html>` (step 4). The brand file is required: Forma 1.0's own primitives are neutral (system fonts, neutral tints), so without it page text outside `.forma-site`, and any nested `data-forma-theme` or `data-forma-brand` subtree, falls back to Forma's defaults.
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

## The application layer (1.1.0)

Owner decisions (2026-11-09): the "foundry ledger" visual direction is approved; the fonts are self-hosted; these capabilities are **Echelon branding and stay out of Forma**. Forma is unchanged. `dist/echelon-app.css` only *uses* Forma's existing classes, `data-forma-*` attributes and `--forma-*` tokens (listed in `tools/forma-hooks.json` and checked against Forma's release CSS); it defines its own names in the `echelon-` namespace.

Every rule sits in `@layer echelon.app` and is scoped to `[data-forma-brand="echelon"]`, the element itself or a descendant. The layer is declared after Forma's layers, so it wins over Forma's component rules without `!important`, and unlayered page CSS still wins over it. Hooks are classes and `data-echelon-*` attributes only, so a view can drive them under `style-src 'self'` with no inline styles.

### Tokens

Light values apply on the brand element; dark values apply under `data-forma-theme="dark"`, and under `prefers-color-scheme: dark` when no `data-forma-theme` is set. The selectors are the same as `dist/echelon.css`, so the Echelon tokens switch exactly where Forma's Echelon colours switch. Set `data-forma-theme` on the brand element or an ancestor of it.

| Token | Light | Dark |
| --- | --- | --- |
| `--echelon-elevation-1` | `0 1px 2px rgb(23 26 24 / 0.06), 0 6px 18px -8px rgb(23 26 24 / 0.16)` | `0 1px 2px rgb(0 0 0 / 0.4), 0 8px 24px -10px rgb(0 0 0 / 0.6)` |
| `--echelon-elevation-2` | `0 2px 4px rgb(23 26 24 / 0.06), 0 16px 32px -12px rgb(23 26 24 / 0.22)` | `0 2px 6px rgb(0 0 0 / 0.45), 0 18px 40px -12px rgb(0 0 0 / 0.7)` |
| `--echelon-surface-canvas` | `#f2efe7` | `#171a18` |
| `--echelon-surface-raised` | `#f8f6f1` | `#202421` |
| `--echelon-surface-sunken` | `#ebe7dd` | `#121412` |
| `--echelon-surface-accent` | `#efe5da` | `#2a2520` |
| `--echelon-surface-chrome` | `#202421` | `#0f110f` |
| `--echelon-text-on-chrome` | `#f2efe7` | `#f2efe7` |
| `--echelon-danger-on-chrome` | `#ef9a8b` | `#ef9a8b` |
| `--echelon-accent-rule` | `#905831` | `#a87e5e` |
| `--echelon-text-on-accent` | `#f8f6f1` | `#171a18` |
| `--echelon-action-primary` | `#905831` | `#c9a07f` |
| `--echelon-chip-settled-bg` | `#dde7e3` | `#23332f` |
| `--echelon-chip-settled-text` | `#2f544b` | `#a8c7bf` |
| `--echelon-border-subtle` | Forma's `--forma-color-border-subtle` | `#33392f` |
| `--echelon-radius-control` / `--echelon-radius-container` | `4px` / `10px` | same |
| `--echelon-weight-heading` / `--echelon-weight-label` | `500` / `650` | same |
| `--echelon-tracking-display` / `--echelon-tracking-label` | `-0.02em` / `0.08em` | same |
| `--echelon-text-secondary` | Forma's `--forma-color-text-secondary`; on sunken and accent panels, Forma's `--forma-color-text-on-secondary-surface` | same |

The brand element also gets `background: var(--echelon-surface-canvas)`. `--echelon-border-subtle` darkens Forma's subtle border in dark mode for this layer's own rules only; Forma components keep Forma's value. `--echelon-text-secondary` carries the Echelon AUDIT §6 re-pairing (no secondary text on stone-family surfaces) without redefining a Forma token. `--echelon-text-secondary` and `--echelon-danger-on-chrome` are not in the interface contract's table. The first is how the contract's re-pairing is done without touching Forma's token. The second is Echelon's dark-scheme danger colour, used for danger actions on the always-dark chrome (Forma's light danger colour is 2.36:1 there).

### Classes and attributes

> **Busy panels need a text status.** Whenever you set `aria-busy="true"` on an `.echelon-panel`, put a visible `.echelon-loading` with `role="status"` and a text label inside it, for example `<div class="echelon-loading" role="status"><span class="forma-spinner"><span class="forma-spinner__indicator" aria-hidden="true"></span></span><span>Loading groups…</span></div>`. The busy styling flattens the panel but does not announce anything. This package cannot check your markup, so test it in your application.

| Hook | What it does |
| --- | --- |
| `.echelon-app-bar`, `__context`, `__end` | Dark application chrome with a bronze bottom rule; wraps. A `.forma-app-identity` inside always shows its `data-forma-scheme="dark"` variant (the light-tile mark). `__context` is a mono, uppercase section label; `__end` holds session details and actions at the inline end. Plain links, tertiary buttons and chips of every tone in the bar take the chrome's text colour (chips lose their fill but keep their marker shapes). Danger buttons are supported in the bar: they keep the danger shape (an outline with no fill, unlike the filled primary and secondary buttons and the borderless tertiary) and their label, in `--echelon-danger-on-chrome` (7.23:1 on the light-mode chrome). |
| `.echelon-nav-tabs` | Route-link tabs: `<nav class="echelon-nav-tabs" aria-label="…"><a href="…" aria-current="page">…</a>…</nav>`. The current link gets the bronze rule, the heading colour and weight 800 (the others are 650), so it differs from the others by more than the rule, including inside sunken and accent panels. |
| `.echelon-panel`, `__header`, `__body`, `__footer` | Raised surface with `--echelon-radius-container` and `--echelon-elevation-1`. A `.forma-actions` row in the header sits at the inline end; a `.forma-data-grid` inside drops its own border. |
| `.echelon-panel[data-echelon-surface="sunken"\|"accent"]` | Sunken (flat) or accent (bronze wash) surface. Secondary text is re-paired to `--forma-color-text-on-secondary-surface` with no opt-in: this layer's own secondary text, plain `<p>`, and every element Forma 1.0.1 colours with `--forma-color-text-secondary` (its 46 selectors, from field descriptions to data-grid labels; CI checks the list against Forma's CSS). Inside such a panel, a Forma state that colours one of those elements differently (for example a wizard's current step) takes the re-paired colour too. Plain content links in every panel (raised, sunken, accent and busy) use `--echelon-action-primary`: the same colour as Forma's links in light, and bronze pale `#c9a07f` in dark, where Forma's link colour `#a87e5e` is 4.35:1 on the raised surface and 4.19:1 on the accent surface. Links that a component colours itself keep their own colours: Forma buttons, and links in or styled as Forma's pagination, validation summary, menu list, master-detail list, diagram nodes, badges, `.forma-site` and doc navigation (every class Forma 1.0.1 uses to colour a link; CI checks the list against Forma's CSS), and this layer's nav tabs. Composing Forma's `forma-surface` class on the panel still works; the panel keeps its Echelon surface and padding. |
| `.echelon-panel[data-echelon-attention="true"]` | Status-warning start border for a panel that needs action. |
| `.echelon-panel[aria-busy="true"]` | **Required: a busy panel must contain a visible `.echelon-loading` with `role="status"` and a text label** (see Loading). The style alone only flattens the panel; the text is what tells every user, including screen-reader users, that it is busy. No validator can check your markup, so check this in your own tests; this package's render test asserts it for its fixture. The panel recedes onto the canvas (no raised surface, no elevation) and its body shows a progress cursor. Text keeps full contrast. This is a visible change from the approved mock, which dimmed the body to 55% opacity (about 3.9:1 for body text in light, below AA): a busy panel is now flattened, not dimmed. |
| `.echelon-display`, `.echelon-heading` | Newsreader display and heading roles (weight 500, tracking `-0.02em`). `.echelon-display` is the page title size. |
| `.echelon-eyebrow` | Mono, uppercase label above a heading or figure, at weight 500 (IBM Plex Mono ships 400 and 500 only). |
| `.echelon-lead` | Introductory paragraph, 19px, secondary colour, 38rem measure. |
| `.echelon-figure` | Large tabular figure for a key number. |
| `.forma-button[data-echelon-emphasis="primary"\|"tertiary"\|"danger"]` | Emphasis on Forma's own buttons: bronze primary, underlined tertiary, outlined danger. Unmarked buttons are Forma's secondary button, unchanged. Every `.forma-button` under the brand gets `--echelon-radius-control`. Keyboard focus is Forma's: its focus-gap outline and focus-ring shadow; on a primary button the ring is drawn first and the elevation after it, so the elevation never hides the ring. |
| `.echelon-chip[data-echelon-tone="…"]` | Status chip. Always put the state's name in the chip as text. The marker shape is a second cue that does not depend on hue (mapping below). |
| `.echelon-loading` | `<div class="echelon-loading" role="status"><span class="forma-spinner"><span class="forma-spinner__indicator" aria-hidden="true"></span></span><span>Loading groups…</span></div>`: Forma's spinner and a visible label. |
| `.echelon-skeleton`, `.echelon-skeleton-line` | Placeholder lines. Always pair them with a text label (a visible `.echelon-loading` with `role="status"`) and `aria-busy="true"` on the region; mark the skeleton itself `aria-hidden="true"`. The lines shimmer only while the region (or the skeleton) is `aria-busy="true"`. |

Motion and output modes: under `prefers-reduced-motion: reduce` the skeleton has no shimmer and no animation (Forma also stops its spinner). Under forced colours the layer uses system colours only: panels, chips, the app bar and tabs keep `CanvasText` borders, the current tab keeps a `Highlight` rule (other tabs have none), chip markers keep their shapes, focus keeps Forma's outline, and no brand colour is painted.

### Chip tones

| Tone | Marker | Signal state |
| --- | --- | --- |
| `draft` | Hollow circle; dashed chip border | Template lifecycle: a draft (`DraftOf`) |
| `review` | Diamond; warning colour | Template lifecycle: in review (no Signal template state uses it yet). Group phase: `Reconciling` |
| `published` | Filled circle on the settled fill | Template lifecycle: a published version (`PublishedVersion`) |
| `ready` | Hollow circle | Group phase: `GroupReady` |
| `progress` | Half-filled circle; info colour | Group phase: `Importing`, `GroupPartial` |
| `complete` | Filled circle; success colour | Group phase: `GroupComplete` |
| `sealed` | Filled square on the settled fill | Group phase: `GroupFinalized`, `GroupFinalizedIncomplete`, `GroupSealed` |
| `closed` | Short bar; muted text and border | Group phase: `GroupClosedIncomplete`, `GroupSuperseded` |

The tones that share a marker family never share a shape: draft, review and published differ, and so do the six group-phase tones. Tones that map several states (for example `sealed`) rely on the label to tell those states apart, so use the state's own name as the label (`Finalized (incomplete)`, `Sealed`).

### Fonts and licences

`dist/echelon-fonts.css` declares Newsreader (variable 200–800, normal and italic), Manrope (variable 200–800) and IBM Plex Mono (400 and 500), all latin subsets, with the unicode ranges from the source packages. The files come unchanged from `@fontsource-variable/newsreader`, `@fontsource-variable/manrope` and `@fontsource/ibm-plex-mono` at the versions in `theme/echelon-fonts.json`; `dist/asset-manifest.json` records each package's version and npm integrity and each file's sha256 (`fontPackages`, `fonts`, `licenses`).

The fonts are licensed under the **SIL Open Font License 1.1**, not under this package's licence. Each package's licence text ships in `dist/fonts/licenses/` (`newsreader-OFL.txt`, `manrope-OFL.txt`, `ibm-plex-mono-OFL.txt`). If you redistribute the font files, keep those texts with them. The OFL allows bundling and self-hosting; it forbids selling the fonts on their own and using the reserved font names for modified versions. These files are unmodified.

To move to new font versions, change the versions in `theme/echelon-fonts.json`, run `python tools/fonts.py --update` (it fetches with `npm pack` and records integrity and sha256), then rebuild. The build fetches the same tarballs and fails if any byte differs from the record. `python tools/fonts.py --check` verifies without writing and also compares every file in `dist/fonts/` with the npm tarballs byte for byte. That comparison is the guarantee that a font is real: the validator's WOFF2 header and directory check catches malformed or substituted files, but it does not decompress the font.

The GitHub release also attaches `echelon-fonts.css`, the `.woff2` files and the OFL texts on their own, for inspection and checksum verification. Install from the tarball: `echelon-fonts.css` loads `fonts/<file>.woff2` relative to itself, so it needs the package's `dist/fonts/` layout beside it.

### Render and accessibility tests

`tests/visual/run.cjs` serves `tests/visual/fixture.html` with Forma 1.0.1's `forma-all.css` and the three theme stylesheets. The fixture has every class and tone above, every chip tone on the app bar, buttons of each emphasis and links on the canvas, raised, sunken, accent and chrome surfaces, plain `<p>`, `<small>`, table captions, data-grid labels and Forma secondary-text classes on sunken and accent panels (with and without `forma-surface`), and, in raised, sunken and accent panels, nav tabs, Forma pagination with a current page, a validation summary with links, a menu list and a master-detail list. In Playwright Chromium it checks:

- **contrast:** every visible text node and every pseudo-element with text, against its composited background, meets WCAG AA (4.5:1, or 3:1 for large text) at 1280px in light, dark, explicit light and explicit dark, and at 390px with 200% text in light and dark;
- **focus:** every link and button, reached with the keyboard in light and dark, matches `:focus-visible`, and a screenshot of it and its surroundings changes, with at least one CSS-pixel perimeter's worth of pixels whose focused colour has at least 3:1 contrast with their unfocused colour;
- **reflow:** no horizontal overflow at 390px with 200% text;
- **nav tabs:** the current tab differs from every inactive tab by colour (at least 1.5:1 between them) or weight (at least 100), on the canvas and in raised, sunken and accent panels;
- **busy panels:** every `.echelon-panel[aria-busy="true"]` contains a visible `.echelon-loading` with `role="status"` and text;
- **motion:** under reduced motion, no infinite animation and no shimmer in the skeleton's own computed style;
- **chips:** distinct marker shapes and non-empty labels;
- **fonts:** every font loads from `dist/fonts/`, and no text asks for an IBM Plex Mono weight other than 400 or 500;
- **forced colours:** borders and focus outlines are kept, marker shapes survive, and no brand colour is painted.

CI runs it in the `render` job and uploads the screenshots and `results.json`.

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
- `checksums.txt` does not match the files;
- a file under `dist/` is missing from the asset manifest or from `checksums.txt`;
- a file shipped under `dist/`, `theme/` or `logos/` is not listed in `checksums.txt`;
- a font has no valid WOFF2 header and table directory (signature, length equal to the file size, table count, reserved field, flavor), its sha256 does not match, its npm package and version are not recorded, or its package's OFL text is not packaged;
- a rule in `dist/echelon-app.css` or `dist/echelon-fonts.css` is not scoped to the brand attribute (a scope inside `:is()`/`:not()`/`:has()` or behind a sibling combinator does not count), or a rule in `dist/echelon-app.css` is outside `@layer echelon.app`;
- after CSS escapes are resolved (so `.\66orma-panel` reads as `.forma-panel`), either file declares a `--forma-*` property, uses a `.forma-*` class, `data-forma-*` attribute or `--forma-*` property that Forma does not have (`tools/forma-hooks.json`), declares a custom property outside `--echelon-*`, or mentions `--ef-*`;
- a font URL is not relative or leaves `dist/fonts/`, or an `@font-face` source is not `url(...) format("woff2")`;
- an infinite animation has no `prefers-reduced-motion: reduce` stop, or a forced-colors rule uses a brand colour.

Add `--forma-css <forma-all.css>` to also check `tools/forma-hooks.json` against a Forma build.

## Rebuilding against another Forma pin

The build is parametric. It copies Forma's F# BrandCompiler and TokenCompiler out of a clean Forma checkout and runs them with `dotnet run`. It never writes to the checkout. The output records the Forma ref, the commit and the brand attribute.

```sh
git clone --depth 1 --branch <forma-tag> https://github.com/kemiller2002/forma /tmp/forma-<forma-tag>
python tools/build_theme.py --forma /tmp/forma-<forma-tag> --forma-ref <forma-tag> \
    --brand-attribute <data-ef-brand|data-forma-brand>
```

To release against a newer Forma:

1. Update `forma-pin.json` (ref, commit, `brandAttribute`).
2. Rebuild, then commit `dist/` and `logos/`.
3. Set the version in `package.json` and merge to `main`.

On that merge, `release-theme.yml` creates tag `v<version>` on the main commit and publishes the GitHub release, unless a release for that version already exists. A pushed `v*` tag also works. Either way the workflow refuses a release unless the commit is on `main`, the pin is Forma 1.0.0 or later with `data-forma-brand`, and the tag matches the version. If an asset upload fails, GitHub leaves a draft release behind and re-runs skip it as already released: delete the draft, then re-run the workflow.

Requirements: .NET 10 SDK (Forma's compilers need no NuGet packages), Python 3.10 or later, git, and npm (the build fetches the pinned font packages). Building against Forma 0.x (`data-ef-brand`, the parity check) leaves out the application layer and fonts, which need Forma 1.x.

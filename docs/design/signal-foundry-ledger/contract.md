# Echelon application layer — interface contract (owner-approved direction, 2026-11-09)

Owner decisions (Kevin, 2026-11-09 20:24 local): (1) approve the "foundry ledger"
direction shown in the Signal design review; (2) self-host Newsreader, Manrope and
IBM Plex Mono (SIL OFL 1.1) in the Echelon theme; (3) keep these visual
capabilities SEPARATE FROM FORMA as Echelon branding. Forma is not changed.

Reference implementation (approved mockups, render-verified at design time):
- page sources: `pages/{landing,admin,authoring,respondent,results}.html` and
  `pages/mock-pages.css` (page-composition rules, Signal-side), in this folder
- approved renders: `screenshots/after-*.png`, in this folder
- the proposal stylesheets the mockups were built with were ported into the
  `echelon-` namespace below and shipped as `dist/echelon-app.css`; they are not
  kept here (see README.md)
Port them with every `forma-proposal` name renamed into the `echelon-` namespace
below. Do NOT define any `forma-*` class, token or attribute outside Forma.

## Package: @echelon-foundry/echelon-theme 1.1.0 (kemiller2002/echelon-design-system)
New dist files (loaded AFTER Forma's all.css and the existing dist/echelon.css):
- `dist/echelon-fonts.css` — @font-face for Newsreader (variable 200–800, normal +
  italic), Manrope (variable 200–800), IBM Plex Mono 400 + 500; latin subset WOFF2
  under `dist/fonts/`, relative URLs, `font-display: swap`. Ship each family's
  OFL.txt in `dist/fonts/licenses/`. Sources: @fontsource-variable/manrope,
  @fontsource-variable/newsreader, @fontsource/ibm-plex-mono (record versions +
  sha256 in the asset manifest).
- `dist/echelon-app.css` — application layer, every rule scoped to
  `[data-forma-brand="echelon"]` (descendant or same element), in `@layer echelon.app`.
`dist/echelon.css` (BrandCompiler output) is unchanged.

### Tokens (custom properties; light values, then dark under prefers-color-scheme
when no explicit light theme, and under [data-forma-theme="dark"])
| token | light | dark |
|---|---|---|
| --echelon-elevation-1 | 0 1px 2px rgb(23 26 24/.06), 0 6px 18px -8px rgb(23 26 24/.16) | 0 1px 2px rgb(0 0 0/.4), 0 8px 24px -10px rgb(0 0 0/.6) |
| --echelon-elevation-2 | 0 2px 4px rgb(23 26 24/.06), 0 16px 32px -12px rgb(23 26 24/.22) | 0 2px 6px rgb(0 0 0/.45), 0 18px 40px -12px rgb(0 0 0/.7) |
| --echelon-surface-canvas | #f2efe7 | #171a18 |
| --echelon-surface-raised | #f8f6f1 | #202421 |
| --echelon-surface-sunken | #ebe7dd | #121412 |
| --echelon-surface-accent | #efe5da | #2a2520 |
| --echelon-surface-chrome | #202421 | #0f110f |
| --echelon-text-on-chrome | #f2efe7 | #f2efe7 |
| --echelon-accent-rule | #905831 | #a87e5e |
| --echelon-text-on-accent | #f8f6f1 | #171a18 |
| --echelon-action-primary | #905831 | #c9a07f |
| --echelon-chip-settled-bg / -text | #dde7e3 / #2f544b | #23332f / #a8c7bf |
| --echelon-border-subtle (dark only override) | (Forma's) | #33392f |
| --echelon-radius-control / -container | 4px / 10px | same |
| --echelon-weight-heading / -label | 500 / 650 | same |
| --echelon-tracking-display / -label | -0.02em / 0.08em | same |
The brand root also sets `background: var(--echelon-surface-canvas)`.
Secondary text on sunken/accent surfaces is re-paired to Forma's
`--forma-color-text-on-secondary-surface` (Echelon AUDIT §6).

### Classes / attributes
- `.echelon-app-bar` (+ `__context`, `__end`): dark chrome, bronze bottom rule,
  wraps; always shows the mark's dark-scheme variant (`.forma-app-identity__variant[data-forma-scheme="dark"]`).
- `.echelon-nav-tabs`: route-link tabs; `a[aria-current="page"]` gets the bronze rule.
- `.echelon-panel` (+ `__header`, `__body`, `__footer`); `[data-echelon-surface="sunken"|"accent"]`;
  `[data-echelon-attention="true"]` (status-warning start border); `[aria-busy="true"]` dims the body.
- Type roles: `.echelon-display`, `.echelon-heading`, `.echelon-eyebrow`, `.echelon-lead`, `.echelon-figure`.
- Button emphasis on Forma buttons: `.forma-button[data-echelon-emphasis="primary"|"tertiary"|"danger"]`
  (unmarked = secondary, unchanged); all Forma buttons get `--echelon-radius-control`.
- `.echelon-chip[data-echelon-tone=…]` with a text label always present and a marker
  shape per tone (meaning survives loss of hue):
  - template lifecycle: `draft` (dashed, hollow), `review` (diamond), `published` (settled fill)
  - group phase (Signal GroupPhase): `ready` (hollow), `progress` = Importing/Partial (half),
    `review` = Reconciling (diamond), `complete` (filled), `sealed` = Finalized/FinalizedIncomplete/Sealed (square, settled fill),
    `closed` = ClosedIncomplete/Superseded (muted)
- Loading: `.echelon-loading` (Forma spinner + visible label, role="status"),
  `.echelon-skeleton` / `.echelon-skeleton-line` (shimmer; NONE under prefers-reduced-motion;
  always paired with a text label and aria-busy on the region).

### Acceptance (theme repo)
All 103 approved text pairs ≥ WCAG AA in light and dark; validator enforces scope
(every rule under [data-forma-brand="echelon"]) and namespace (no `forma-` class/token
defined; no `--ef-*`); assets + checksums + manifest; a render test of every class in
light/dark/forced-colors; release 1.1.0 via the existing release workflow.

## Signal adoption (kemiller2002/signal)
Load order on every page: Forma all.css → echelon.css → echelon-fonts.css → echelon-app.css.
Pages use the classes above; page-composition CSS stays in Signal's own CSS files
(CSP: style-src 'self', no inline styles; Limen binds classes/data-* only).

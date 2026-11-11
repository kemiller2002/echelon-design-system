# Signal "foundry ledger" design record

This folder is the permanent record of the visual direction approved for Signal
on 2026-11-09, and of the interface contract that turned it into the Echelon
application layer. It is documentation: nothing here is packaged, built or
loaded by any application.

## Owner decisions (2026-11-09, 20:24 local)

1. Approve the "foundry ledger" direction shown in the Signal design review.
2. Self-host Newsreader, Manrope and IBM Plex Mono (SIL OFL 1.1) in the
   Echelon theme.
3. Keep these visual capabilities separate from Forma, as Echelon branding.
   Forma stays brand-neutral and is not changed by this direction.

## Contents

| Path | What it is |
|---|---|
| `contract.md` | The interface contract: tokens, classes, chip tones, load order and acceptance criteria for theme 1.1.0 and Signal's adoption. |
| `screenshots/after-<page>-<size>-<scheme>.png` | The approved mockups, rendered at desktop (1440), tablet (834) and mobile (390), light and dark, for landing, admin, authoring, respondent and results. |
| `screenshots/after-admin-neutral-desktop-light.png` | The same admin markup without `data-forma-brand="echelon"`: Forma's neutral defaults, showing the identity comes from the theme. |
| `screenshots/check-*.png` | Design-time checks: forced colours for each page, and the admin page in greyscale (meaning survives loss of hue). |
| `pages/*.html`, `pages/mock-pages.css` | The mockup page sources and their page-composition rules. |

## Reading the page sources

The mockups were written before the port into the `echelon-` namespace, so the
page sources use the proposal's working names (`forma-panel`, `forma-chip`,
`forma-app-bar`, `forma-eyebrow`, `forma-heading` and so on), and they contain
`{{CSS}}` and `{{MARK}}` placeholders from the mockup build. They are not
meant to render from this folder: the proposal stylesheets they used defined
`forma-*` names outside Forma, which the brand separation forbids, so those
stylesheets are deliberately not kept. The screenshots are the visual record.

Every proposal name maps to the shipped `echelon-` equivalent listed in
`contract.md` (for example `forma-panel` → `echelon-panel`, `forma-chip` →
`echelon-chip`, `forma-app-bar` → `echelon-app-bar`). Classes that are real
Forma components (`forma-button`, `forma-ordinal-scale`) are used as designed.

## Where it shipped

- **Echelon theme 1.1.0:** `dist/echelon-fonts.css` and `dist/echelon-app.css`
  (`@layer echelon.app`, scoped to `[data-forma-brand="echelon"]`).
- **echelon-current 1.39.0** (echelon-registry #113), qualified by Conditor
  v0.10.25 (conditor #138; scaffold note in #139).
- **Signal**, each change independently reviewed and verified by its
  deployed-site check: admin shell #136, authoring #137, respondent #139 and
  #141, results #140 and #142. Signal's visual evidence lives on its
  `visual-evidence/*` branches.

## Deliberately deferred

- Authoring: the three-column editor, live respondent preview and per-question
  edit view (Signal WI-0131).
- Respondent: Forma's best-worst row on narrow screens at 200% text needs a
  Forma change (Signal WI-0139); it is a recorded exception meanwhile.
- Admin: nine `admin.css` rules that still set what a Forma or theme class sets
  need a visual review before they move (Signal WI-0142).

# Signal visual-design findings

Review date: 2026-11-10. Evidence source: [`kemiller2002/signal`](https://github.com/kemiller2002/signal) at [`d9790c72efb8272f65d9ef655b89f20831eed635`](https://github.com/kemiller2002/signal/tree/d9790c72efb8272f65d9ef655b89f20831eed635), [Signal PR #138](https://github.com/kemiller2002/signal/pull/138). Branding reference: this repository at `a03c5ac05d99c0bace43df35c90e74c3fe352d02`.

This is the central record of the findings from Signal's visual refinement. Statuses describe the recorded review, not a fresh inspection of the current deployment or current PR states. **Whole-application visual acceptance was not granted.** Application changes remain owned by Signal; this report does not change Forma, Folio, released theme assets, palette approval or domain semantics.

- [Before-and-after gallery](gallery.html): five screen families plus group results, scoring and report details.
- [Complete original visual audit](evidence/README.md).
- [Separate functional evidence and failure history](evidence/FUNCTIONAL.md).
- [Branding and live-asset verification](evidence/branding-verification.json).
- [Image inventory](evidence/manifest.json): 136 screenshots, dimensions and SHA-256 values.
- [Results report PDF](evidence/group-review/after-report.pdf).
- [Import provenance and all-file checksums](IMPORT-MANIFEST.json).

## Branding authority and ownership

The provisional repository name `echelon-branding` was not used as authority. The verified repositories are `echelon-design-system` (branding), `signal` (application), `forma` (shared UI), and `folio` (documents/print), all under `kemiller2002`.

The audit inspected this repository's brand audit, logo catalog, application identity standard, theme consumption contract, application theme and visual fixture. The logo catalog records Kevin's November 9 approval of the corporate and Signal waveform marks. Theme 1.1.0 records the approved foundry ledger direction, self-hosted fonts and Echelon-specific ownership outside Forma. Signal's intake separately records approval of the five screen-family direction. Original mockup image files were not found in the checkout; their absence must not be represented as a fresh approval or a conformance pass.

The consumer pins were Forma **1.0.1**, Echelon theme **1.1.0**, and Folio **0.4.1**. Newsreader, Manrope and IBM Plex Mono, the verified carried palette, scoped theme surfaces/elevation, chips, loading and action emphasis were reused. Candidate v1 palette values remain provisional. Approved marks and consumed brand/application styles matched their verified sources byte for byte. The six fetched live Forma/theme/mark files also matched the pinned consumer assets byte for byte.

Forma remains brand-neutral and zero-runtime. Echelon owns its brand theme; Signal owns composition, labels, values, permissions and transitions; Folio owns print intent. No new generic component or shared capability was needed for this bounded refinement. Shared visual contracts must not acquire Signal scoring or Echelon-only defaults.

## Findings, treatments and remaining decisions

| ID | Finding | Recorded treatment / status | Owner and evidence |
| --- | --- | --- | --- |
| SIG-EDS-001 | Branding documentation contains stale statements that no approved logo exists and that the theme is unreleased. | The dated logo catalog and theme 1.1.0 consumption contract establish the current facts. The root README summary is corrected with this report; historical audit statements retain their original context. Palette freeze remains a separate decision. | Echelon design system; `brand/logos/catalog.json`, `docs/CONSUMING-THE-ECHELON-THEME.md`, original audit |
| SIG-EDS-002 | The older landing baseline was flat; the inspected deployed landing already had hierarchy, role panels, numbered steps and a respondent callout. | Retain the approved implementation and distinct Signal mark. No sample administrative records, invented KPIs or administration demo were added to the public page. | Signal; `evidence/fixture-before/landing-*.png`, `evidence/live-before/home-*.png` |
| SIG-EDS-003 | The deployed administrator shell rendered a bordered heading and bulleted navigation despite loading the application theme. | Existing Signal PR #136 stages dark chrome, current-route tabs, overview panels and engine-derived counts. Its screenshots are preserved as historical fixture evidence; this review did not merge it. | Signal; `evidence/fixture-before/`, `evidence/fixture-after/`, their `source.json` files |
| SIG-EDS-004 | Authoring lacked section separation and action hierarchy; validation tables could collapse words. | Existing Signal PR #137 stages ordered editor panels, lifecycle chips, primary Publish and destructive confirmation emphasis. Its separate review/integration gate remains. | Signal; draft-edited comparisons and original source metadata |
| SIG-EDS-005 | Respondent pages had text-only in-app identity, weak title hierarchy and options spaced like unrelated blocks. | Signal PR #138 adds approved light/dark marks, theme typography and surfaces, closer option grouping and primary Next/Submit/Copy. Native controls, reading order, URL state, progress and review semantics remain. | Signal; `evidence/after/`, original audit |
| SIG-EDS-006 | Assessment scores competed with prose and methodology was undifferentiated. | Theme score figures, a result surface and an accent calculation panel were implemented. Existing scores, coverage, notes and methodology were retained; no overall score or favorable/unfavorable interpretation was invented. | Signal; live-before/results and after/results comparisons |
| SIG-EDS-007 | Group results/scoring lacked hierarchy and narrow comparison tables broke words into columns of letters. | Result/scoring panels, engine-value figures, a lineage panel and named keyboard-scrollable tables were implemented. Before/after chart and calculated-measure values matched. Native chart symbols, patterns and unavailable states remain. | Signal; `evidence/group-review/verification.json` and before/after images |
| SIG-EDS-008 | Report tables needed narrow-screen treatment without taking pagination or document semantics away from Folio. | Screen-only table scrolling preserves the direct `ef-print-table > table` structure and print sizing. Report values matched; report-only printing and PDF generation passed. | Signal/Folio boundary; group report screenshots, PDF and test evidence |
| SIG-EDS-009 | Branded startup and per-operation feedback existed, but a complete asynchronous-operation audit was not established. | Existing startup, survey-fetch, pending-operation and unknown-write feedback was preserved and exercised by relevant tests. Do not promote that coverage to proof that every asynchronous path was reverified. | Signal; original audit, loading observations and functional summaries |
| SIG-EDS-010 | Importing the theme does not by itself ensure correct composition. | A panel applied directly to the question shell altered its intrinsic composition. The final change wraps the unchanged Forma question shell. A `.forma-data-grid` CSS selector was replaced with an app-owned class; the ownership guard stayed intact. | Signal integration; functional failure history and final markup |
| SIG-EDS-011 | Padded result surfaces made peer actions wrap at 320px; a table minimum width clipped mobile labels inside its region. | Actions moved outside the padded surface and the assessment table minimum width was removed. Alignment passed at 320/390/768/1280; final narrow captures show readable labels. | Signal; alignment log, final screenshots |
| SIG-EDS-012 | Chromium 156 hit an enclosing label instead of a transparent 1px radio at fractional positions. | Native label activation worked. Layout selection uses focus/Space and checks each native checked state; pointer workflow coverage is retained. This is a recorded test-targeting issue, not a justification for a local fork of Forma controls. | Test harness; functional history and layout helper |
| SIG-EDS-013 | Overlapping test runners collided on trace artifacts. | A clean rerun used separate ports/output directories. The first 182-pass/4-failure run is recorded as failing; it is not counted as a pass. | Test harness; separate functional report |
| SIG-EDS-014 | Screenshots and passing functional tests alone cannot certify visual quality. | A pixel comparator rejects missing/dimension-changed/different images, with explicit tolerance. Its self-comparison is a tool smoke check only. Candidate images are not accepted regression references. | Visual review; comparator and `functional/pixel-tool-smoke.json` |
| SIG-EDS-015 | The live deployment has no configured identity exchange or data store. | Authenticated populated dashboard, authoring, group results/scoring and administrative mutation screens could not be verified live. Fixture screenshots and test-only authentication are explicitly labelled. No production authentication was bypassed or production records created. | Deployment owner; live observations and access-limit record |

## Verification boundaries

Visual evidence is recorded separately from functional evidence. Fresh public and group captures cover desktop/tablet/mobile, light/dark, narrow layouts and 320px with 200% root text. Forced-color screenshots are included. Screenshot dimensions are inventoried because initial live home/admin widths (1280/768/390) differ from later captures (1440/834/390). Viewport resizing is not physical-device testing.

| Reviewed surface | Measured text nodes per light/dark scheme | Recorded findings |
| --- | ---: | --- |
| Respondent | 49 | No measured AA text-contrast failures; visited focus indicators visible; no page overflow at 320px/200% text |
| Assessment results | 23 | Same; three visited Tab stops, correct document order |
| Group results | 44 | No measured light/dark contrast failures; visited focus indicators visible; no page overflow at 320px/200% text |
| Group scoring | 92 | Same |
| Group report | 108 | Same; Folio table structure and PDF output additionally checked |

The public respondent audit visited six Tab stops (native radio groups retain arrow-key behavior). Reduced-motion checks found no infinite animation in the reviewed states. These observations are bounded measurements, not whole-application accessibility certification or independent human review.

Functional results were: solution/WASM build passed; **692 .NET tests passed**; a clean **186-test Chromium suite passed** on respondent corrections; the subsequent group-only change passed its **one before/after review test**, **two affected existing group workflows**, **22 foundation/binding checks**, and strict Limen verification. The complete chronology, initial failures, corrections, build warnings and limits are retained in `evidence/FUNCTIONAL.md` and its logs. Signal's domain, scoring, storage, authorization and shared-package implementations were unchanged by the visual work.

Visual Engineering context **1.0.1**, source `b648cdef291d39c443ccb10215529ad69afe8b32`, was verified. Applied principles were proportional emphasis, relational spacing, native semantics, meaningful grouping, color-independent states and truthful uncertainty.

## Open acceptance gates

1. Independently review the final visual comparisons; approved direction is not a conformance verdict on the implementation.
2. Integrate and review the existing Signal administrator/authoring work with the respondent/results refinement. The source record leaves PRs #136/#137/#138 separate.
3. Configure identity/storage before claiming live authenticated verification. Signing in alone cannot supply missing deployment configuration.
4. Complete remaining accessibility/environment coverage: screen-reader testing, Safari/Firefox, physical touch devices, grayscale/CVD screening, text-spacing stress and full browser zoom. Root text enlargement is not equivalent to all zoom testing.
5. Complete comprehensive loading/failure-path coverage and accept screenshot regression references through the actual review process.

No theme release, new palette approval, merge, deployment or whole-application visual pass is implied by centralizing these findings.

## Evidence portability

`evidence/` is an unchanged copy of the complete Signal review package, including 136 PNGs, the PDF, source manifests, raw measurements, logs, reference markup and capture/comparison tools. Its original relative paths, source hashes and Signal commands are intentionally preserved. Those commands run from the pinned Signal checkout, not from this repository. `gallery.html` provides a dependency-free viewer here; every screenshot links to its original-resolution file. `IMPORT-MANIFEST.json` verifies every copied file against the source package.

# Cross-Application Operational Component Wave

Status: implementation-authorizing requirement  
Work item: GH-14  
Scope: Forma shared operational UI

## Evidence boundary

This wave is justified by repeated UI requirements across independent Echelon applications and repositories:

- Chrona/time-tracking: persistent operational state, activity/history rows, detail workspace, evidence forms, conflict comparison, loading/empty states, mobile navigation.
- Echelon Signal: administrator dashboards, query/filtering, report builders, metric cards, visualizations, drill-down, lineage, preview, semantic diff, validation and publication workflow.
- Summa: dashboard, receivables tables, filters, global search, command palette, timelines, checklists, review flows and unified work queues.
- Sales & Marketing: saved views, command/search palette, attention projections, research queues, conflict handling, relationship/history views, evidence and progressive detail.
- HelixNote: search/filter/sort, pagination, tabs, metric cards, record headers, action menus, breadcrumbs, timelines, version comparison, validation, empty states and mobile navigation.
- Research Publisher: search/filter state, project/status summaries, provenance, relationship traversal, progressive disclosure and research-health metrics.

Strata and Organization Administration do not currently add enough independent UI evidence to justify new component families beyond those above.

## Promotion rule

A component belongs in Forma when:

1. at least two independent applications demonstrate the need;
2. the presentation/accessibility contract can remain application-neutral;
3. Ordo/application state remains authority for domain legality and meaning;
4. non-native interaction can remain in Limen/application code;
5. consistent accessibility/mobile behavior is valuable across products; and
6. native HTML alone is not sufficient without a repeatable presentation contract.

## Immediate operational wave

The following patterns are implementation-authorized:

- search;
- collection toolbar;
- data grid/table;
- pagination;
- tabs;
- timeline/activity feed;
- diff viewer;
- conflict review;
- metric/stat card;
- dashboard grid;
- work/attention queue;
- status lozenge/badge;
- alert;
- empty state;
- skeleton/loading state;
- operation status;
- wizard/stepper;
- readiness checklist;
- command palette;
- combobox/autocomplete baseline;
- date range;
- file-upload queue;
- record header;
- master/detail workspace;
- provenance trail;
- preview/review surface;
- mobile action bar.

This wave intentionally does not add domain-specific controls such as invoice-aging widgets, medication cards, survey scoring components, timer engines, or research-relationship semantics.

## Priority changes

The following existing catalog entries are promoted from P2 to P1 because multiple applications now independently require them:

- Timeline / activity feed
- Diff viewer
- Step-by-step wizard shell

The existing P0/P1 entries for tabs, pagination, search, command palette, data grid, combobox, date range and file upload are implementation priorities in this wave.

## Shared compositions

### Collection toolbar

`.ef-collection-toolbar` combines:

- search;
- simple filters;
- optional advanced-filter entry point;
- sort;
- visible result count;
- saved-view selector when supplied by the application;
- optional view-mode controls.

It must collapse secondary controls on narrow screens without hiding current filter state or requiring hover.

### Work queue

`.ef-work-queue` presents application-supplied work requiring human attention.

A queue item may show:

- title;
- textual state/severity;
- why attention is required;
- age/due context;
- evidence/unknown status;
- source/context;
- legal actions supplied by the application.

Forma must never infer whether work is blocking, legally available, resolved, or discharged.

### Conflict review

`.ef-conflict-review` composes:

- expected/prior state;
- current state;
- changed facts;
- consequence/explanation;
- application-supplied recovery actions.

It may compose `.ef-diff-viewer` but cannot decide merge semantics.

### Operational status

`.ef-operation-status` supports explicit states such as:

- pending;
- saved/confirmed;
- failed;
- conflict;
- unknown;
- reconciling;
- stale;
- blocked;
- unavailable;
- insufficient-data.

The state must always be communicated with text and structure, never color alone.

## Visualization boundary

Forma may provide visualization tokens, accessible chart containers, textual summaries, tabular equivalents, metric cards, responsive dashboard layout and simple presentational primitives.

Forma must not become a charting/calculation engine. Signal's typed visualization grammar, Summa's financial meaning and other domain-specific analytical semantics remain application-owned.

## Mobile requirement

Every pattern in this wave is subject to `requirements/MOBILE-COMPONENT-CONTRACT.md`. A component is not complete if it only works at desktop width.


## Aegis fault presentation family

Aegis is a cross-application operational dependency, so its user-facing presentation is promoted into Forma rather than reimplemented by Chrona, Signal, Summa, HelixNote, Research Publisher, or other consumers.

Canonical patterns:

- `fault`
- `fault-inline`
- `fault-notification`
- `fault-banner`
- `fault-blocking`
- `fault-summary`
- `recovery-actions`
- `fault-reference`
- `diagnostic-status`
- `fault-details`

The shared contract is intentionally presentation-only. Aegis owns classification/recovery semantics, Ordo/application state owns legal transitions, and Limen maps that state to/from the DOM.

# Component and Pattern Catalog Requirements

This catalog defines capability requirements. The canonical design-system package is HTML and CSS only.

An entry may be:

- a **declarative pattern** fully implemented by semantic HTML + CSS;
- a **visual contract** whose behavior is supplied by Limen/application code;
- native HTML styled by the foundation layer.

Names beginning with `ef-` describe the Echelon pattern/class contract. They do not imply Custom Elements.

Inclusion here does not mean every entry must ship in the first release.

Priority meanings:

- **P0**: foundation required for the first usable release.
- **P1**: common application capability that should follow soon.
- **P2**: advanced capability justified by real product needs.
- **P3**: specialized capability that requires evidence before implementation.

## 1. Native styled foundations

These are primarily CSS and semantic HTML, not custom elements.

### P0
- Typography and headings
- Paragraphs and prose
- Links
- Buttons and button groups
- Native checkbox and radio
- Native text, email, password, URL, number, date, time, and textarea styling
- Fieldset and legend
- Lists
- Static tables
- Code and preformatted blocks
- Horizontal divider
- Images and figures
- Status text and visually-hidden utilities

## 2. Form and selection components

### P0: Switch / toggle
Pattern: `.ef-switch`

Requirements:

- on/off semantic state;
- visible label support;
- optional explicit state text;
- disabled and readonly states;
- native form participation;
- keyboard Space activation;
- click/touch target includes label when appropriate;
- thumb translation animation;
- track color interpolation;
- active press feedback;
- optional on-state glyph for compact contexts;
- no reliance on color alone;
- reduced-motion mode replaces travel animation with immediate state change or short opacity transition;
- controlled and uncontrolled presentation modes without inventing domain authority.

### P0: Slider
Pattern: `.ef-slider`

Requirements:

- single value;
- min, max, step;
- keyboard arrows, Page Up/Down, Home, End;
- pointer and touch direct manipulation;
- click-to-position where appropriate;
- labeled minimum/current/maximum;
- value tooltip or value label;
- tick marks and named stops;
- optional adjacent numeric input;
- orientation support;
- RTL-aware behavior;
- track fill reflecting current value;
- thumb active-state scale or emphasis;
- value bubble entry/exit;
- snap feedback for discrete stops;
- reduced-motion support;
- no drag-only requirement for setting a value;
- form participation and validity.

### P1: Multi-range slider
Visual contract: `.ef-range-slider` (Limen behavior required)

Requirements:

- two or more thumbs where justified;
- non-crossing and crossing policy must be explicit;
- keyboard navigation for each thumb;
- accessible label/value for each thumb;
- minimum interval constraints;
- optional histogram or range context behind the track;
- direct entry fields as a non-drag alternative;
- collision behavior without inaccessible tiny targets.

### P0: Segmented control
Pattern: `.ef-segmented` using native radios

Requirements:

- single and, only when semantically correct, multi-select variants;
- keyboard arrow navigation;
- equal and content-sized segment modes;
- animated selection indicator;
- selection animation preserves orientation and supports reduced motion;
- icon plus text and text-only variants;
- overflow strategy instead of shrinking targets below usable size.

### P0: Select / listbox
Native select shall remain available and preferred for ordinary selection.

A custom select is justified only where searchable, rich, or multi-select behavior is needed.

### P1: Combobox / autocomplete
Visual contract: `.ef-combobox` (Limen behavior required)

Requirements:

- editable and select-only modes where justified;
- async suggestions;
- loading, no-result, error, and stale-result handling;
- grouped options;
- optional rich option secondary text;
- keyboard behavior following the WAI-ARIA combobox pattern;
- composition/IME-safe input;
- typeahead;
- safe cancellation of obsolete async requests.

### P1: Multiselect
Visual contract: `.ef-multiselect` (Limen behavior required)

Requirements:

- selected value chips/tokens;
- keyboard removal and navigation;
- maximum-selection rule;
- "select all" only when scope is unambiguous;
- large-option-list performance;
- accessible summary of current selections.

### P1: Date picker and date-range picker
Visual contracts: `.ef-date-picker`, `.ef-date-range` (Limen behavior required)

Requirements:

- text entry must remain possible;
- locale-aware presentation without silently changing stored semantic value;
- keyboard grid navigation;
- disabled/unavailable dates;
- min/max constraints;
- range preview;
- preset ranges;
- month/year navigation;
- no drag-only range selection;
- clear errors for invalid or ambiguous input.

### P1: Time and date-time
Visual contracts: `.ef-time-picker`, `.ef-date-time` (Limen behavior required where native inputs are insufficient)

Support 12/24 hour presentation, timezone labeling where relevant, explicit ambiguity handling, and keyboard text entry.

### P1: Search
Visual contract: `.ef-search` (Limen behavior required for suggestions/async search)

Support debounce as an integration option, clear button, recent/query suggestions supplied by the application, keyboard shortcut affordance, pending state, and result count announcement.

### P1: File upload
Pattern: native file input; visual contract for upload queues requires Limen

Support:

- file picker;
- drop zone as enhancement, not sole path;
- multi-file mode;
- size/type constraints;
- progress;
- cancel;
- retry;
- duplicate detection supplied by application;
- unknown outcome;
- per-file error;
- keyboard accessibility.

### P2: Tag / token input
Visual contract: `.ef-token-input` (Limen behavior required)

Support freeform or constrained tokens, keyboard editing, paste of multiple values, duplicate policy, validation, and accessible token removal.

### P2: Color picker
Visual contract: `.ef-color-picker` (Limen behavior required unless native color input suffices)

Only if product requirements justify it.

Support text values, swatches, alpha policy, contrast preview where relevant, keyboard operation, and non-spatial value entry. Color selection may not rely solely on a 2D pointer canvas.

## 3. Assessment, decision, and state patterns

These patterns were derived from Echelon Signal requirements but are intentionally application-independent.

### P0: Question shell
Pattern: `.ef-question`

Requirements:

- stable question/prompt region;
- optional question number that is not required for the accessible name;
- help/instruction text;
- required/optional communication supplied by the application;
- selector slot/body;
- validation region;
- conditional/hidden presentation supplied by application state;
- no scoring or applicability logic inside the design system.

### P0: Ordinal / Likert scale
Pattern: `.ef-ordinal-scale`

One pattern shall support discrete ordered scales such as:

- 3-point;
- 5-point;
- 7-point;
- agreement;
- frequency;
- quality;
- confidence;
- satisfaction;
- maturity/readiness;
- numeric discrete ratings.

Requirements:

- native radio inputs;
- fieldset/legend semantics;
- cardinality variants;
- equal-width horizontal presentation when space permits;
- stacked mobile presentation;
- strong selected and focus-visible states;
- selection not communicated by color alone;
- label text supplied by the application;
- keyboard behavior remains native radio-group behavior;
- reduced-motion support;
- special states such as Don't Know and Not Applicable rendered outside the ordinal continuum;
- no scoring semantics inferred from position or label.

Separate `Likert5`, `Agreement5`, `Frequency5`, and similar components shall not be created. They are application/presentation presets over the same ordinal pattern.

### P0: Choice group
Pattern: `.ef-choice-group` / `.ef-choice`

Support:

- single choice using radios;
- multi-choice using checkboxes;
- forced choice and pairwise choice through the same semantic primitives;
- primary and supporting option text;
- native required/disabled behavior;
- mobile/touch targets;
- selected and focus-visible states;
- no hidden score/meaning attached to visual order.

### P0: Special answer choices
Pattern: `.ef-special-choices` / `.ef-special-choice`

Use for semantic states that must not be confused with the primary answer scale, including:

- Don't Know / Unknown;
- Not Applicable;
- other application-defined non-scale states.

The pattern must visually and structurally separate these from an ordinal scale while preserving the same native radio group when they are mutually exclusive with scale values.

### P0: Validation message and summary
Patterns: `.ef-validation-message`, `.ef-validation-summary`

Requirements:

- question-level message;
- page/section/survey error summary;
- focusable summary for application-directed focus;
- links back to affected controls where appropriate;
- icon/text/non-color cues;
- stable heading;
- compatible with live insertion by Limen;
- no raw exception text as primary user communication.

### P0: Survey/task progress
Pattern: `.ef-survey-progress`

Requirements:

- native `progress` element for determinate progress;
- explicit accessible name;
- current/total text;
- optional section/context text;
- indeterminate variant when total is unknown;
- application supplies current value and progress semantics;
- progress must not infer domain completion.

### P1: Ranking
Visual contract: `.ef-ranking` (Limen behavior required)

Requirements:

- ordered list semantics;
- visible ordinal position;
- keyboard-operable move up/down or move-to-position path;
- drag-and-drop optional only;
- disabled boundary actions;
- live announcement contract for changed position;
- cancel/revert;
- small-item-set emphasis;
- application/Ordo owns uniqueness and ranking validation.

### P1: Allocation
Visual contract: `.ef-allocation` (Limen behavior required for aggregate validation)

Requirements:

- direct numeric entry for every allocation item;
- per-item min/max/step;
- visible aggregate total;
- explicit valid/invalid aggregate state supplied by application;
- remaining/excess amount presentation when applicable;
- no slider-only or drag-only allocation;
- application/Ordo owns total constraints and scoring.

### P1: Rule builder
Visual contract: `.ef-rule-builder` (Limen behavior required)

Requirements:

- field/operator/value clause layout;
- AND/OR group presentation;
- nested groups when justified;
- add/remove controls;
- keyboard operation;
- validation;
- plain-language meaning/preview;
- application owns typed expression semantics and serialization;
- design system shall not embed Signal-specific AST or rule meaning.

### P0: Obligation panel
Pattern/visual contract: `.ef-obligation-panel`

Requirements:

- unresolved obligation count;
- textual severity/type labels;
- blocking versus nonblocking distinction;
- obligation title and recovery/evidence description;
- action/navigation affordance supplied by application;
- unknown/unreconciled work can be represented distinctly;
- severity is not communicated by color alone;
- Ordo/application remains authority for whether obligations exist or are discharged.

## 4. Navigation and command components

### P0: Tabs
Visual contract: `.ef-tabs` (Limen behavior required)

Support manual and automatic activation modes, overflow, deep-link integration hooks, keyboard navigation, and reduced-motion panel transitions.

### P0: Breadcrumbs
Prefer semantic nav/list markup with system styling. A component is optional for overflow collapsing.

### P0: Pagination
Support page navigation, unknown total count, cursor-style next/previous variants, compact mobile representation, and clear current-page semantics.

### P0: Application shell
Pattern: `.ef-app-shell`

Provide stable regions for header, navigation, main, contextual rail, footer, alerts, and transient overlays without owning application routing.

### P1: Side navigation
Pattern/visual contract: `.ef-side-nav`

Support nested groups, compact mode, responsive drawer mode, keyboard navigation, current-location semantics, and persistent versus transient behavior.

### P1: Toolbar
Pattern/visual contract: `.ef-toolbar`

Support roving keyboard focus when appropriate, overflow, separator semantics, contextual actions, and adaptive collapse.

### P1: Command palette
Visual contract: `.ef-command-palette` (Limen behavior required)

Requirements:

- keyboard-first open/close;
- search/filter;
- grouped actions;
- shortcut display;
- recently used and suggested sections supplied by application;
- async providers;
- disabled/unavailable commands with reason;
- no execution of hidden or unauthorized commands;
- focus restoration;
- optional nested command levels;
- mobile full-screen mode.

### P2: Tree navigation
Visual contract: `.ef-tree` (Limen behavior required)

Support expand/collapse, selection policy, keyboard tree interaction, async children, loading/error nodes, and large-tree performance.

## 5. Overlay and transient surfaces

### P0: Dialog
Pattern: `.ef-dialog` using native `dialog`

Use native dialog behavior where it satisfies requirements. Provide consistent focus management, labelled structure, destructive variants, scroll containment, responsive full-screen mode, and return-focus behavior.

### P0: Popover
Pattern: `.ef-popover` using native Popover HTML

Prefer the platform Popover API and CSS anchor positioning when available.

Support auto/light-dismiss and controlled/manual variants, placement fallback, collision handling, focus behavior, and top-layer animation.

### P0: Tooltip
Declarative pattern where browser baseline supports it; otherwise visual contract

Tooltips are supplemental only. Required information and essential actions shall not exist only in a tooltip.

Support hover and keyboard focus, delayed open/close, pointer-safe hover travel, and reduced motion.

### P0: Menu and menu button
Visual contracts: `.ef-menu`, `.ef-menu-button` (Limen behavior required for menu keyboard model)

Support actions, checkable items, radio groups, nested submenu only where justified, keyboard typeahead, separators, disabled items, icons, shortcuts, and responsive mobile presentation.

### P1: Context menu
Visual contract: `.ef-context-menu` (Limen behavior required)

Must always have a non-context-menu path to essential actions.

### P1: Drawer / sheet
Visual contract: `.ef-drawer` (Limen behavior required)

Support modal and nonmodal modes, side and bottom placement, responsive adaptation, focus management, swipe as optional enhancement only, and reduced-motion entry/exit.

### P1: Toggletip
Declarative popover pattern where sufficient

For interactive explanatory content that is too important or interactive for a tooltip.

### P1: Coachmark / guided tour
Visual contract: `.ef-coachmark` (Limen behavior required)

Support:

- target anchoring;
- step count;
- next/back/skip;
- action-dependent advancement;
- focus management;
- escape and dismissal policy;
- target missing state;
- responsive placement;
- persistent progress supplied by the application;
- reduced-motion transitions.

Tours shall never block access to the underlying feature merely because onboarding state is missing.

## 6. Feedback and status

### P0
- ef-alert
- ef-inline-message
- ef-toast
- ef-progress-bar
- ef-progress-circle
- ef-spinner
- ef-skeleton
- ef-empty-state
- ef-error-summary

Requirements include semantic live-region policy, duplicate-announcement prevention, determinate/indeterminate distinction, pause/dismiss policy, and unknown outcome support.

### P1: Async action button pattern
This may be a pattern around a native button rather than a custom element.

States: ready, pending, succeeded, failed.

The visual success state must not substitute for durable application confirmation.

### P1: Undo notification
Support a bounded undo window without requiring the user to act before reading the message.

## 7. Data and productivity

### P0: Data table styling
Static and lightly interactive tables shall remain semantic HTML.

### P1: Data grid
Visual contract: `.ef-data-grid` (Limen behavior required for interactive grid)

Requirements:

- sortable columns;
- filter integration;
- column visibility;
- resizable columns;
- reorderable columns with non-drag alternative;
- row selection;
- keyboard grid navigation;
- sticky header;
- pagination or virtualization strategy;
- loading/skeleton rows;
- empty/error states;
- density modes;
- inline actions;
- accessible row and cell labeling;
- horizontal overflow handling;
- persisted user preferences supplied by application.

### P2: Editable data grid
Add:

- cell and row edit modes;
- commit/cancel semantics;
- validation;
- dirty state;
- conflict presentation;
- optimistic/pessimistic integration hooks;
- bulk edit;
- undo where feasible.

This component has meaningful internal state and should receive an explicit Ordo-style state model.

### P2: Tree grid
Visual contract: `.ef-tree` (Limen behavior required)-grid

Combine hierarchy and tabular data only after the keyboard and screen-reader model is proven against WAI-ARIA expectations.

### P1: List and virtual list
Static list pattern; `.ef-virtual-list` requires Limen behavior

Virtualization is optional and must never become the default for small lists.

### P1: Filter builder
Visual contract: `.ef-filter-builder` (Limen behavior required)

Support composable field/operator/value clauses, nested groups where justified, keyboard editing, validation, removable clauses, and application-owned expression serialization.

### P2: Query/search builder
A more advanced rule-expression UI may extend the filter builder but shall not embed application-specific expression semantics.

### P1: Sort builder
Support multi-column priority ordering and non-drag reordering.

### P1: Bulk action bar
Appears based on selection state, announces selection count, exposes legal actions supplied by application, and remains keyboard reachable.

### P2: Timeline / activity feed
Support grouped timestamps, status changes, expandable detail, source attribution, and virtual loading if needed.

### P2: Diff viewer
Support text/structured differences, additions/removals/changes, keyboard navigation between changes, and non-color cues.

## 8. Layout and workspace components

### P0
- page shell;
- section;
- card;
- panel;
- header;
- footer;
- divider;
- scroll container;
- sticky action region.

### P1: Resizable split pane
Visual contract: `.ef-split-pane` (Limen behavior required)

Requirements:

- pointer drag;
- keyboard resizing;
- collapse/expand;
- minimum pane sizes;
- saved size supplied by application;
- double-click reset option;
- visible resize handle;
- no drag-only requirement;
- reduced-motion collapse/restore.

### P1: Responsive drawer layout
Supports navigation/content/detail compositions that transition between multi-pane desktop and stacked/mobile presentation without changing semantic order unnecessarily.

### P2: Dockable panels
Only if multiple applications demonstrate need. Docking must not become a general desktop-window framework by default.

## 9. Content and utility components

### P0
- badge;
- tag/chip;
- avatar;
- icon;
- icon button pattern;
- card/tile;
- accordion/disclosure;
- key-value list;
- stat/metric;
- code block with copy action;
- keyboard shortcut display;
- separator.

### P1
- stepper / progress indicator;
- timeline;
- status lozenge;
- meter;
- rating display/input if justified;
- copyable field;
- expandable text;
- relative-time display.

### P2
- syntax-highlighted editor shell adapter;
- rich text editor shell adapter.

The design system should style and integrate editors rather than invent a full text editor engine without a demonstrated need.

## 10. Visualization

### P1: Visualization tokens
Define categorical, sequential, diverging, positive/negative, threshold, focus, and selection color tokens.

### P2: Small visualization primitives
Potential components:

- sparkline;
- progress ring;
- simple bar;
- simple line;
- distribution strip;
- status matrix.

### P2: Chart accessibility contract
Any chart implementation shall provide an equivalent data representation, keyboard access where interaction exists, text summaries where meaningful, and non-color distinctions.

The design system shall not become a full charting framework unless application requirements demonstrate that need.

## 11. Specialized interaction patterns

### P1: Reorderable list
Visual contract: `.ef-reorder-list` (Limen behavior required)

Support drag, keyboard move up/down or position controls, live announcement of movement, auto-scroll, drop indicators, and cancel/revert.

### P2: Transfer list
Visual contract: `.ef-transfer-list` (Limen behavior required)

Support moving items between sets without requiring drag-and-drop.

### P2: Editable key/value collection
For metadata, tags, environment variables, and configuration where pair editing is common.

### P2: Step-by-step wizard shell
Visual contract: `.ef-wizard` (Limen/Ordo behavior required)

Supports:

- explicit step state;
- optional branching supplied by application;
- validation before advance;
- save/exit;
- resume;
- previous-step policy;
- progress;
- incomplete/error states.

Business transition legality remains application/Ordo owned.

## 12. Zero-runtime rule

No catalog entry authorizes JavaScript or WebAssembly inside the design-system package.

If an entry requires behavior beyond semantic HTML, its behavior belongs to Limen/application code while this repository owns only markup/CSS/accessibility/communication contracts.

## 13. Explicit non-goals

Do not automatically build:

- a custom replacement for every native element;
- a general-purpose rich text editor;
- a full charting engine;
- a spreadsheet engine;
- a window manager;
- application-specific workflow controls;
- a framework-specific wrapper as the canonical API.

Those may be added only after concrete application evidence.

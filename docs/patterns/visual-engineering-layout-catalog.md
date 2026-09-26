# Visual Engineering layout capability catalog

This catalog translates Visual Engineering research into reusable Forma layout capabilities. Visual Engineering remains the evidence and design-intent source; Forma owns the implementation substrate.

## Rules

1. Prefer composition primitives over named page templates.
2. A layout pattern must preserve semantic/source order when it reflows.
3. Density is contextual. Use the existing relaxed, standard, compact, and analytical postures rather than fixed element-count thresholds.
4. Color, border, elevation, and motion may reinforce grouping or state but may not be the only carrier of meaning.
5. Every capability must survive 320px reflow, 200% text scaling, keyboard use, forced colors, reduced motion, long/unbroken values, and content localization pressure.
6. Responsive behavior is a transformation contract, not merely a breakpoint.
7. Application state and business semantics remain outside Forma.

## Capability families

### 1. Reading rail

A bounded readable content column that can coexist with wider figures, tables, evidence, and actions.

Primitive contract:
- readable measure token/utility;
- optional breakout region for wide content;
- no source-order mutation;
- no horizontal page scrolling at narrow widths.

Use for reports, explanations, evidence, help, and long-form application content.

### 2. Split emphasis

Two related regions with intentionally unequal visual weight, such as primary task + supporting context.

Primitive contract:
- configurable emphasis ratio rather than hard-coded page template;
- collapses to semantic source order;
- supports either side as the emphasized region;
- supports relaxed through analytical density.

### 3. Sidebar shell

Persistent supporting navigation/context beside a primary work region.

Primitive contract:
- start/end placement;
- bounded sidebar measure;
- content region min-width: 0 behavior;
- narrow-screen transformation to inline/disclosure/flyout chosen by the application;
- no assumption that sidebar content is navigation.

### 4. Master-detail

Collection/selection region paired with a detail region.

Primitive contract:
- visual pairing only;
- application owns selection, routing, history, and data;
- narrow layouts may replace simultaneous display with sequential display;
- selected state must not depend on color alone.

### 5. Dashboard matrix

Composable summary, status, metric, and action regions without prescribing card-heavy presentation.

Primitive contract:
- responsive repeat grid;
- span controls for priority items;
- stable reading order;
- bounded analytical density;
- equal-height behavior optional, never required for semantics.

### 6. Comparison matrix

Aligned alternatives, attributes, or evidence designed to preserve cross-item comparison.

Primitive contract:
- semantic table when relationships are tabular;
- contained horizontal scrolling permitted when reflow would destroy comparison;
- sticky aids must not obscure useful content;
- narrow-screen alternative may repeat labels but must preserve relationships.

### 7. Timeline / sequence rail

Ordered events, stages, history, or process states.

Primitive contract:
- orientation may adapt by available space;
- order remains semantic;
- current/completed/blocked/unknown states use text or accessible labels in addition to decoration;
- application owns transition legality.

### 8. Evidence stack

Claim, evidence, provenance, confidence/strength, caveat, and action composed as a repeatable information unit.

Primitive contract:
- evidence metadata remains visible or discoverable without hover;
- unknown, missing, contradictory, and stale evidence remain distinguishable;
- confidence styling does not imply a scoring model Forma owns.

### 9. Decision frame

Decision/problem statement, options, constraints, evidence, risks, posture, and next actions.

Primitive contract:
- regions are individually composable;
- no required scoring or recommendation algorithm;
- supports progressive disclosure while retaining an overview;
- critical constraints and unresolved obligations remain visible.

### 10. Command/workbench shell

High-frequency application layout with navigation, command/action area, primary workspace, contextual inspector, and status/obligation regions.

Primitive contract:
- regions may be omitted independently;
- supports compact and analytical density;
- inspector may transform to flyout on narrow screens;
- keyboard traversal follows semantic order;
- no framework/runtime dependency.

### 11. Mosaic / editorial composition

Asymmetric grid for marketing, discovery, portfolios, examples, and visually led content.

Primitive contract:
- explicit spans;
- deterministic reflow;
- visual asymmetry must not reorder meaning;
- imagery may dominate visually without becoming required to understand the content.

### 12. Focus stage

One dominant task or artifact with secondary controls and context deliberately subordinated.

Primitive contract:
- primary region receives available space;
- supporting controls wrap/reflow before primary content becomes unusable;
- works for editors, previews, investigations, media, diagrams, and focused forms.

### 13. Dense ledger

Rows of repeated operational information optimized for scanning and repeated expert work.

Primitive contract:
- compact/analytical density only when task supports it;
- row grouping survives loss of borders/color;
- exceptions remain salient;
- long values and zoom do not cause destructive overlap;
- semantic table/list choice follows the data relationship.

### 14. Responsive priority stack

A general transformation primitive for deciding what remains simultaneous as space contracts.

Contract:
- priority controls visual allocation, not DOM/source order;
- regions may stack, collapse into disclosure, or move into an application-controlled flyout;
- essential actions and state cannot disappear;
- transformations must be documented per composed pattern.

## Cross-cutting composition controls

Forma should expose reusable controls for:

- readable measure;
- full-bleed/breakout regions;
- grid span and priority;
- min/max region measures;
- start/end rail placement;
- cluster wrapping;
- stack rhythm;
- alignment and distribution;
- contained overflow;
- sticky-with-boundaries behavior;
- visual separators that are non-semantic;
- density posture;
- responsive transformation hints.

These should remain CSS-first and zero-runtime wherever native HTML/CSS can satisfy the behavior.

## Validation matrix

Every new layout primitive or example must validate:

| Pressure | Required observation |
| --- | --- |
| 320px width | no page-level clipping or lost essential action |
| 200% text | no overlap or semantic loss |
| 400% zoom/reflow | usable sequence and controls |
| long values | wrapping/overflow remains bounded |
| keyboard | source order matches understandable traversal |
| forced colors | grouping/state still understandable |
| reduced motion | no information depends on animation |
| no color | hierarchy/grouping remains legible |
| localization | labels can expand without collision |
| sparse content | composition does not leave misleading structure |
| dense content | exceptions and grouping remain discoverable |

## Implementation sequence

1. Add low-level composition primitives: measure, breakout, split, rail, responsive grid/span, bounded overflow, priority stack.
2. Build reference compositions from those primitives: master-detail, dashboard matrix, comparison matrix, timeline, workbench, decision frame, evidence stack, mosaic, focus stage, dense ledger.
3. Put at least three examples of each reference composition on the Forma example site: ordinary, content-stress, and narrow/mobile.
4. Record any composition that still requires application-specific CSS as a Forma capability gap.
5. Feed unresolved perceptual questions back to Visual Engineering rather than encoding unsupported universal rules in Forma.

## Boundary with Visual Engineering

Visual Engineering currently identifies a major evidence gap around external validation, calibration, cross-population transfer, and context dependence. Forma must therefore encode adaptable mechanisms and testable contracts, not claims that one composition is universally optimal.

In particular:
- progressive disclosure and overview should both remain available;
- hierarchy must not substitute for semantic structure;
- density must remain contextual;
- pixel values are implementation tokens, not universal perceptual constants;
- evidence strength should be represented without turning research confidence into application authority.

## Definition of done

A layout capability is shipped only when:
- the primitive/composition exists in Forma;
- its public usage contract is documented;
- the example site demonstrates at least three cases;
- mobile/reflow and accessibility checks pass;
- no hidden application semantics were moved into the design system;
- the originating Visual Engineering principle or research question is traceable.


### 15. Attention competition / first-glance path

A composition for consequential screens where one state, exception, question, or action path must remain perceptually primary despite realistic competing information.

Primitive contract:
- the intended priority path is explicit and inspectable through `data-attention-step`;
- priority order follows semantic/source order rather than CSS reordering;
- the primary consequential state and action remain textual and programmatically available;
- supporting content may be visually rich but cannot erase or precede the required consequential path in keyboard order;
- declared priority must survive narrow reflow, 200% text, text-spacing overrides, grayscale, border/background dropout, forced colors, and reduced motion;
- application content determines what deserves priority. Forma does not infer urgency, consequence, or authority.

Validation boundary:
- automated tests can prove declared order, source/focus order, containment, semantic presence, and survival when presentation channels are removed;
- automated CSS/browser tests do **not** prove human first fixation, comprehension, salience magnitude, task performance, or universal perceptual ordering;
- claims about actual human attention require Visual Engineering measurement or human-subject evidence.

Reference specimen: `catalog/specimens/LAY-ATTENTION-COMPETITION.html`.

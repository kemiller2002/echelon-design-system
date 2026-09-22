# First Implementation Pilot

## Objective

Prove that the Echelon Design System can deliver polished, accessible components with **zero browser runtime** by using semantic HTML, CSS, and declarative platform behavior only.

## Pilot foundation

- DTCG design tokens compiled to CSS;
- light/dark themes;
- typography;
- native buttons and fields;
- layout stack/cluster/grid;
- focus system;
- reduced-motion and forced-colors behavior.

## Pilot patterns

### Switch
Native checkbox with `role="switch"` plus CSS track/thumb animation.

Validates native forms, keyboard/touch behavior, focus, disabled state, motion, and theming.

### Slider
Native `input[type=range]`.

The pilot deliberately preserves native range behavior and `accent-color` rather than requiring JavaScript to synchronize a custom filled track or live value bubble.

### Segmented control
Native radio group styled as a segmented selector.

### Disclosure
Native `details`/`summary`.

### Popover
Declarative `popover` + `popovertarget` HTML with CSS top-layer transitions.

### Dialog
Native `dialog` controlled declaratively using `commandfor` and `command` on the declared browser baseline.

## Explicit exclusions

The pilot shall contain:

- no Custom Elements;
- no Shadow DOM;
- no ElementInternals;
- no Fable browser code;
- no JavaScript or WebAssembly in production artifacts;
- no hidden design-system runtime.

Build and test tooling may use scripts because they are not shipped component behavior.

## Pilot acceptance

The pilot is complete only when:

- `dist/` contains no JavaScript or WebAssembly;
- package production dependencies are empty;
- canonical patterns are HTML only;
- switch and slider participate in native forms;
- keyboard tests pass;
- popover, dialog, disclosure, and segmented control work declaratively across the declared browser baseline;
- reduced motion works;
- forced colors remains usable;
- light/dark themes work;
- axe reports no automated WCAG A/AA violations in the representative fixture;
- ROS validation passes;
- the Limen boundary is documented for behavior the declarative layer cannot own.

## Validation question

The experiment is no longer whether Ordo-style state belongs inside components.

The experiment is:

> How far can standards-based HTML and CSS provide a professional Echelon component system before behavior legitimately requires Limen?

Behavior that crosses that boundary is documented, not smuggled into the design-system package.

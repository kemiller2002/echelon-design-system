# Echelon Design System current state

## Repository status

Repository initialized with:

- SDE / Ordo 1.3.0
- Repository Operating System 3.1.4
- Visual Engineering 1.0.0
- Communication Engineering 1.0.0

The design-system architecture has pivoted from Custom Elements to a zero-runtime HTML/CSS model.

## Accepted direction

- Production design-system components contain HTML and CSS only.
- No Custom Elements, Shadow DOM, Fable browser output, Lit, JavaScript, or WebAssembly ship with components.
- DTCG token JSON remains canonical and is compiled to CSS by build-time F#.
- Native HTML owns interaction whenever it can do so correctly.
- CSS owns appearance and motion.
- Limen/application code owns behavior beyond native HTML.
- Ordo retains application/domain authority.
- Accessibility targets WCAG 2.2 AA for stable patterns.
- Browser differences are tested rather than hidden behind a component runtime.

## Implemented pilot patterns

- switch using native checkbox + role=switch;
- native range slider;
- segmented radio control;
- details/summary disclosure;
- declarative popover;
- declarative modal dialog.

## Explicit zero-runtime gate

CI scans production distribution and canonical patterns for executable artifacts.

The design-system browser runtime budget is 0 bytes.

## Important slider conclusion

CSS-only cross-browser components cannot reliably synchronize an arbitrary live value bubble or custom filled track with the changing range value.

The pilot therefore preserves native range rendering/accent behavior. Rich value displays belong to consuming application/Limen behavior.

## Remaining validation

- run current zero-runtime build/test workflow;
- confirm declarative dialog baseline across Chromium/Firefox/WebKit;
- run axe accessibility scan;
- complete ROS work attribution;
- record final pilot evidence.

## Next boundary after pilot

Create Limen behavior contracts for the first patterns that cannot be complete declaratively, likely tabs and combobox, without adding runtime behavior to this package.

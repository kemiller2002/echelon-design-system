# Echelon Design System current state

## Repository status

Repository initialized with:

- SDE / Ordo 1.3.0
- Repository Operating System 3.1.4
- Visual Engineering 1.0.0
- Communication Engineering 1.0.0

The accepted architecture is zero-runtime HTML/CSS.

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

## Validated core patterns

The first zero-runtime pilot passed Chromium, Firefox, WebKit, axe, token, runtime, and governance validation with:

- switch using native checkbox + role=switch;
- native range slider;
- segmented radio control;
- details/summary disclosure;
- declarative popover;
- declarative modal dialog.

## Signal-derived assessment slice

Echelon Signal requirements are now driving a second reusable pattern slice:

- question shell;
- ordinal/Likert scale;
- choice group;
- special answer choices;
- validation message;
- validation summary;
- survey/task progress;
- ranking visual contract;
- allocation visual contract;
- rule-builder visual contract;
- Ordo obligation panel.

These patterns remain application-independent. Signal supplies labels, scoring, branching, applicability, validation, progress, capabilities, and obligations.

Likert5, Agreement5, Frequency5, Maturity5, and similar concepts are treated as presets over the same ordinal-scale pattern rather than separate components.

## Explicit zero-runtime gate

CI scans production distribution and canonical patterns for executable artifacts.

The design-system browser runtime budget is 0 bytes.

## Important slider conclusion

CSS-only cross-browser components cannot reliably synchronize an arbitrary live value bubble or custom filled track with the changing range value.

The canonical slider therefore preserves native range rendering/accent behavior. Rich value displays belong to consuming application/Limen behavior.

## Current validation target

The Signal assessment slice must pass:

- distribution of `assessment.css`;
- zero-runtime gate;
- desktop and mobile ordinal behavior;
- native radio/checkbox/number/progress semantics;
- ranking non-drag control contract;
- rule-builder labelled controls;
- obligation non-color severity;
- Chromium/Firefox/WebKit;
- axe WCAG A/AA scan;
- ROS attribution and validation.

## Next boundary

After this slice, use Signal to define the first reusable Limen behavior contracts for behavior-required patterns such as ranking, allocation aggregate validation, rule editing, tabs, and comboboxes without adding runtime behavior to the design-system package.

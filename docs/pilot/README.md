# Design System Pilot

This pilot validates a zero-runtime architecture for the Echelon Design System.

## Included

- DTCG 2025.10 canonical token source;
- F# build-time token compiler with alias and contrast validation;
- semantic HTML patterns;
- CSS foundations and components;
- switch, slider, segmented control, disclosure, popover, and dialog;
- light/dark semantic themes;
- reduced-motion and forced-colors behavior;
- Chromium, Firefox, and WebKit tests;
- automated axe accessibility scan.

## Production runtime rule

The published design-system artifact contains **HTML and CSS only**.

F#, Node, Playwright, and other tools may be used to generate or verify artifacts, but no JavaScript or WebAssembly may be shipped as component behavior.

## Validation rule

The pilot must demonstrate:

1. zero JavaScript/WASM in `dist/`;
2. zero production npm runtime dependencies;
3. valid token references and contrast constraints;
4. switch native keyboard/form/reset behavior;
5. slider native keyboard/form/reset behavior;
6. declarative segmented control, disclosure, popover, and dialog behavior;
7. reduced-motion behavior;
8. native accessible roles/names;
9. no automatically detected WCAG A/AA violations in the fixture;
10. consistent behavior across Chromium, Firefox, and WebKit.

Failed checks are architecture evidence and must be resolved or recorded as a browser-baseline limitation before the pilot is accepted.

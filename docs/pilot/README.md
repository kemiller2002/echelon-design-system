# Design System Pilot

This pilot validates the first executable architecture for the Echelon Design System.

## Included

- DTCG 2025.10 canonical token source;
- F# token compiler with alias and contrast validation;
- framework-free Fable Custom Element runtime;
- `ef-switch` backed by a native checkbox;
- `ef-slider` backed by a native range input;
- ElementInternals form participation;
- light/dark semantic themes;
- reduced-motion and forced-colors behavior;
- Chromium, Firefox, and WebKit tests;
- automated axe accessibility scan.

## Validation rule

The architecture is not considered accepted merely because it compiles.

The pilot must demonstrate:

1. no production JavaScript runtime dependency;
2. clean Fable compilation and bundling;
3. valid token references and contrast constraints;
4. switch keyboard, form, reset, and cancellation behavior;
5. slider keyboard, form, reset, and input/change behavior;
6. reduced-motion behavior;
7. accessible roles and names through open Shadow DOM;
8. no automatically detected WCAG A/AA violations in the fixture;
9. consistent behavior across Chromium, Firefox, and WebKit.

Failed checks are treated as architecture evidence and must be resolved or recorded as a limitation before this pilot is accepted.

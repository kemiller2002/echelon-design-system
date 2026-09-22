# Feature Manifest — Assessment and workflow patterns

## Purpose

Provide reusable semantic markup and CSS for assessment, decision, validation, and Ordo-style unresolved-work presentation without embedding application behavior.

## Ownership

- State, including presentation state: native radio/checkbox/number/progress state plus application-rendered `data-ef-*` state
- Transitions / commands / messages: native HTML events only for declarative controls; ranking/allocation/rule-builder behavior belongs to Limen/application code
- Invariants and guards: semantic form grouping, accessible names, non-color state cues, special answer separation, zero-runtime boundary
- Capabilities / authority: none — Signal/Ordo/application owns applicability, scoring, validation, capabilities, obligations, and completion
- Important effects and effect contracts: none

## Interfaces

### Declarative patterns

- `.ef-question`
- `.ef-ordinal-scale`
- `.ef-choice-group`
- `.ef-special-choices`
- `.ef-validation-message`
- `.ef-validation-summary`
- `.ef-survey-progress`
- `.ef-obligation-panel`

### Behavior-required visual contracts

- `.ef-ranking`
- `.ef-allocation` aggregate validation
- `.ef-rule-builder`

## Tests and verification

- browser behavior: `tests/browser/assessment.spec.mjs`
- automated accessibility: `tests/browser/accessibility.spec.mjs`
- zero-runtime boundary: `tests/zero-runtime.test.mjs`
- responsive ordinal presentation: browser test at narrow viewport

## Dependencies

- allowed direct dependencies: semantic tokens, foundations, assessment CSS
- required composition context: consuming application supplies domain state and Limen behavior where documented

## Modification boundaries

Normal:

- `patterns/question.html`
- `patterns/ordinal-scale.html`
- `patterns/choice-group.html`
- `patterns/special-choice.html`
- `patterns/validation-*.html`
- `patterns/survey-progress.html`
- `patterns/ranking.html`
- `patterns/allocation.html`
- `patterns/rule-builder.html`
- `patterns/obligation-panel.html`
- `src/styles/assessment.css`
- related tests/docs

Escalation required:

- adding executable behavior to the package;
- creating scoring semantics from presentation;
- replacing native radio/checkbox semantics;
- collapsing Unknown, Not Applicable, and ordinal values into one visual continuum;
- making drag the only ranking path.

## Maintenance

- Owner: Echelon Foundry design system
- First demanding consumer: Echelon Signal
- Last checked against implementation: 2026-09-22

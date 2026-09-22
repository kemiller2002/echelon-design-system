# Assessment and decision patterns

These patterns were introduced from Echelon Signal requirements but are reusable across assessment, configuration, decision-support, onboarding, and administrative workflows.

They obey the design-system zero-runtime rule: HTML and CSS only.

## Package usage

Assessment consumers should load:

```css
@import "@echelon-foundry/design-system/tokens.css";
@import "@echelon-foundry/design-system/foundations.css";
@import "@echelon-foundry/design-system/components.css";
@import "@echelon-foundry/design-system/assessment.css";
```

`all.css` includes the same assessment layer when a single combined stylesheet is preferable.

## Question shell

Use `.ef-question` to compose:

- question number or identifier;
- prompt;
- help/instructions;
- answer selector;
- validation.

The shell carries no applicability, branching, scoring, or persistence semantics.

Do not hide a required question using CSS as a substitute for application branching. Limen/application state decides whether the question is rendered/applicable.

## Ordinal scale

Use `.ef-ordinal-scale` for ordered discrete choices.

Examples:

- low / medium / high;
- strongly disagree through strongly agree;
- never through always;
- initial through optimized;
- numeric 1 through 5.

Cardinality classes:

- `.ef-ordinal-scale--3`;
- `.ef-ordinal-scale--5`;
- `.ef-ordinal-scale--7`.

The canonical control is a native radio group.

### Presets are data, not components

Do not create separate design-system components named:

- Likert5;
- Agreement5;
- Frequency5;
- Quality5;
- Confidence5;
- Satisfaction5;
- Maturity5.

Those are label/meaning presets supplied by the application over the same ordinal markup.

### Scoring is not visual order

The design system never assumes that the first option scores 0, that the last scores 4, that the scale is direct, or that it contributes to scoring at all.

The application explicitly maps response values to meaning.

### Unknown and Not Applicable

Unknown/Don't Know and Not Applicable are not extra ordinal positions.

Render them in `.ef-special-choices` outside the visual scale. They may share the same radio name when mutually exclusive with ordinal values.

## Choice group

Use `.ef-choice-group` for:

- single select;
- multi-select;
- forced choice;
- pairwise comparison.

Use native radios for mutually exclusive options and checkboxes for independent selections.

The design system does not attach score or business meaning to option order.

## Validation

Use `.ef-validation-message` for a local control/question error.

Use `.ef-validation-summary` for page, section, or workflow-level blocking issues.

When a summary appears after an attempted transition, Limen should move focus to the summary when that improves recovery. The design system only provides the focusable structure.

Do not display raw exception text as the primary message.

## Survey/task progress

Use `.ef-survey-progress` for determinate progress.

The application supplies:

- current value;
- maximum value;
- page/question text;
- section context;
- progress definition.

A design-system progress bar never decides whether work is complete.

## Ranking

`.ef-ranking` is a visual contract requiring Limen behavior.

Required application behavior:

- reorder item;
- update authoritative positions;
- announce movement;
- enforce uniqueness;
- cancel/revert if needed;
- retain keyboard move controls.

Drag-and-drop may be added as an enhancement but must never be the only way to reorder.

## Allocation

`.ef-allocation` provides direct numeric entry and aggregate-total presentation.

The application owns:

- total calculation;
- required total;
- remaining/excess calculation;
- cross-item constraints;
- validation;
- scoring.

Do not require sliders or drag interaction for allocation.

## Rule builder

`.ef-rule-builder` is a visual contract for structured expressions.

The design system owns:

- clause/group layout;
- operator badges;
- form-control spacing;
- readable summary area.

The application owns:

- field vocabulary;
- operator legality;
- value types;
- AND/OR semantics;
- nested expression state;
- typed AST;
- validation;
- serialization;
- rule execution.

A plain-language meaning preview is strongly recommended.

## Obligation panel

Use `.ef-obligation-panel` for unresolved work such as:

- reconciliation;
- missing evidence;
- stale derived state;
- required validation;
- migration work;
- policy blockers.

The application/Ordo layer determines whether an obligation exists and when it is discharged.

Every item should communicate severity/type in text. Color is supplemental.

Unknown/unreconciled work must be distinguishable from known failure.

## Accessibility requirements

All assessment patterns shall:

- preserve native form semantics wherever possible;
- use fieldset/legend for grouped choices;
- expose clear accessible names;
- preserve keyboard operation;
- remain usable at 400% zoom/reflow;
- provide touch-friendly targets;
- avoid color-only state;
- support forced colors;
- support reduced motion;
- keep semantic order intact on narrow screens.

## Signal integration boundary

Signal supplies:

- answer primitive;
- selector labels;
- special-state semantics;
- applicability;
- validation rules;
- scoring;
- branching;
- completion policy;
- current progress;
- capabilities;
- obligations.

The design system supplies only the reusable presentation and native interaction substrate.

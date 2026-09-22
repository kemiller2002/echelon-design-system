# Ordo and Limen Integration Requirements

## 1. Boundary principle

The design-system package owns **structure and presentation**.

It does not own application behavior.

The production package contains HTML and CSS only. Native browser interactions are allowed because the browser owns them. Any behavior beyond native HTML belongs to Limen/application code.

## 2. Native event contract

### STATE-001 Native events are the default contract
Patterns shall expose the native events of their underlying semantic elements.

Examples:

- checkbox/switch: `input`, `change`;
- slider: `input`, `change`;
- radio/segmented control: `input`, `change`;
- forms: `submit`, `reset`, `invalid`;
- details: `toggle`;
- popover: `toggle` / `beforetoggle` where supported by the browser;
- dialog: native close/cancel/command behavior provided by the platform.

The design system shall not wrap these in custom JavaScript events.

### STATE-002 Input versus commit
Where the platform already distinguishes continuous input from committed change, application code shall use that distinction rather than inventing a parallel design-system protocol.

A range input is the primary example: `input` represents continuous value changes and `change` represents committed change.

### STATE-003 Application events belong to Limen
If an application needs events such as:

- selection-change-requested;
- reorder-requested;
- resize-requested;
- retry-requested;
- command-invoked;

those are Limen/application contracts, not design-system runtime behavior.

### STATE-004 Rejection and rollback
Pure HTML controls may change their local native state before Ordo evaluates a domain transition.

For consequential operations, the application shall choose an appropriate interaction model:

- treat the local HTML value as draft input until submission;
- let Limen translate native events into Ordo messages and re-render authoritative state if rejected;
- intercept the interaction in application behavior when pre-authorization is essential;
- use an explicit command/confirmation flow rather than an immediate toggle.

The design system shall not add JavaScript solely to provide pre-commit cancellation.

## 3. Ordo use

### ORDO-001 Application authority
Ordo or the application state authority determines:

- legal domain transitions;
- capabilities;
- obligations;
- guards;
- domain validation;
- external-effect policy;
- unknown effect state;
- durable workflow state.

### ORDO-002 No Ordo state inside the design-system package
Because the design-system package contains no executable component behavior, it contains no Ordo state machine for components.

Ordo models may exist in consuming applications for complex UI workflows.

### ORDO-003 Native state remains native
Checked, selected, open, required, invalid, focused, and similar browser-native state should remain represented by native elements where possible.

Do not duplicate these states into application state unless the application needs durable/domain meaning.

### ORDO-004 Application-rendered state
When Ordo/application state must affect presentation, the application may render:

- native attributes such as `disabled`, `checked`, `selected`, `open`;
- semantic ARIA attributes when appropriate;
- documented `data-ef-state` values when no native state represents the concept.

CSS may render those states but shall not infer their legality.

### ORDO-005 Unknown is first class
Where application state is unknown or an external effect has an indeterminate outcome, the markup contract must allow that state to be rendered distinctly from success or failure.

## 4. Capabilities

### CAP-001 Actions supplied by application
Pattern markup may display action locations, but currently legal actions come from the application.

A bulk-action bar, command palette, wizard, or context menu must not infer permissions from CSS or static markup.

### CAP-002 Disabled reason
When an action remains visible but unavailable, the application should render a human-readable explanation through the documented pattern.

### CAP-003 Hidden versus disabled
The semantic distinction remains:

- hidden: not relevant or not discoverable in current context;
- disabled: relevant but unavailable;
- blocked: unavailable because a known condition is unmet;
- pending: already requested and unresolved.

CSS may distinguish these supplied states; it does not choose them.

## 5. Obligations

Patterns may visualize unresolved obligations supplied by the application, for example:

- validation errors;
- missing required fields;
- unsaved changes;
- required approvals;
- unresolved conflicts.

They shall not invent domain obligations.

## 6. Limen integration

### LIMEN-001 Standard DOM only
Limen integrates with semantic HTML through normal DOM queries, properties, attributes, forms, and native events.

There is no design-system JavaScript API.

### LIMEN-002 No design-system runtime dependency
The design-system package shall not import Limen, and Limen shall not be required to render static or natively interactive patterns.

### LIMEN-003 Message translation
Limen may translate native browser events into typed application messages and application state back into HTML attributes/content.

### LIMEN-004 Behavioral adapters live outside the package
Advanced patterns may publish a behavioral contract documenting:

- required DOM structure;
- selectors;
- focus expectations;
- application-rendered state attributes;
- native events to observe;
- messages an application would typically generate.

The adapter implementation belongs to Limen/application code.

### LIMEN-005 Render loop safety
Application re-rendering after a native event must not accidentally treat programmatic state synchronization as a second user intent.

This is an application integration concern and must be tested in consuming systems.

## 7. Switch example

A switch controlling a domain setting:

1. HTML renders a native checkbox styled as an Echelon switch.
2. The user changes the checkbox.
3. The browser emits native `input`/`change`.
4. Limen translates the event into an application message.
5. Ordo decides whether the domain transition is legal.
6. The application renders the authoritative resulting state.
7. CSS renders that state.

The design system participates only in steps 1 and 7.

## 8. Behavior-required patterns

The following remain design-system visual/markup contracts but require Limen/application behavior for a complete product interaction:

- tabs with coordinated keyboard focus;
- combobox/autocomplete;
- multi-range slider;
- date-range picker;
- command palette;
- interactive data grid/treegrid;
- drag/reorder;
- resizable split panes;
- filter/query builders;
- branching wizards;
- upload queues/progress;
- notification lifecycle.

See `DECLARATIVE-CAPABILITY-MATRIX.md`.

## 9. Integration testing

Consuming applications shall test that:

- native events map to the intended typed messages;
- rejected domain changes return to authoritative rendered state;
- stale async responses do not overwrite newer authoritative state;
- unknown effects remain unknown;
- disabled capabilities cannot be invoked through alternate paths;
- keyboard and pointer paths produce equivalent domain intent where required;
- application behavior does not depend on design-system JavaScript because none exists.

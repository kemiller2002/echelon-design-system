# Ordo and Limen Integration Requirements

## 1. Boundary principle

The design system renders state and captures user intent. It does not own application-domain authority.

A component may know that it is visually disabled. It should not decide that a business action is illegal.

## 2. Event contract

### STATE-001 Intent events
Behavior-rich components shall emit stable DOM events representing user intent.

Examples:

- value-input
- value-commit
- selection-change-requested
- open-requested
- close-requested
- reorder-requested
- resize-requested
- retry-requested
- command-invoked

The exact public event names shall be versioned and consistent across components.

### STATE-002 Input versus commit
Direct-manipulation components shall distinguish transient input from committed value where that distinction matters.

For example, a slider can emit continuous input while dragging and a commit event on release.

### STATE-003 Event payloads
Event detail shall use small, documented, serializable payloads.

Do not expose internal DOM nodes or implementation classes as part of the stable contract.

### STATE-004 Cancellation
Where the caller may legitimately reject an intent before a local visual state becomes committed, events should support a documented cancellation or controlled-component model.

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

### ORDO-002 Component-local state
A component may use an explicit state model when its own behavior is complex.

Good candidates:

- editable data grid;
- file upload queue;
- wizard shell;
- command palette with nested levels;
- coachmark tour;
- async action presentation;
- resizable/dockable workspace;
- complex combobox;
- drag/reorder interaction.

### ORDO-003 Avoid architecture theater
Simple components do not require an Ordo model merely because Ordo exists.

A static card, badge, divider, paragraph style, or simple disclosure should remain simple.

### ORDO-004 Illegal visual combinations
For complex components, mutually exclusive visual states should be represented explicitly rather than through unrelated boolean flags.

Example:

- Ready
- Editing
- Validating
- Saving
- SaveFailed
- Conflict

is preferable to independent editing/loading/error/success booleans when those booleans can create nonsensical combinations.

### ORDO-005 Unknown is first class
Where the caller supplies an unknown or indeterminate result, the component must preserve it.

Unknown external effect must not be rendered as ordinary failure unless the application has reconciled it as failure.

## 4. Capabilities

### CAP-001 Actions supplied by caller
Components that display actions shall accept currently available actions from the application.

A data grid bulk-action bar, command palette, wizard action row, or context menu must not infer permissions from hidden heuristics.

### CAP-002 Disabled reason
When an action is visible but unavailable, the system should support a human-readable reason supplied by the application.

### CAP-003 Hidden versus disabled
The design system shall document the semantic distinction:

- hidden: not relevant or not discoverable in current context;
- disabled: relevant but unavailable;
- blocked: unavailable because a known condition is unmet;
- pending: already requested and unresolved.

## 5. Obligations

Components may visualize unresolved obligations supplied by the application, for example:

- validation errors;
- missing required fields;
- unsaved changes;
- required approvals;
- unresolved conflicts.

They shall not invent domain obligations.

## 6. Limen integration

### LIMEN-001 Browser-native contract
All components shall be usable without Limen.

Limen integration is an adapter over standard properties, attributes, methods, and DOM events.

### LIMEN-002 No framework coupling
The component package shall not import Limen application code or require a Limen runtime to render.

### LIMEN-003 Message translation
A Limen adapter may translate component intent into application messages and application state back into component properties.

### LIMEN-004 Stable event ordering
For direct manipulation and async interactions, event ordering must be documented so Limen can process messages deterministically.

### LIMEN-005 Render loop safety
Controlled component updates from Limen shall not recursively re-emit the same user-intent event unless the user actually performed another action.

## 7. Example boundary

A switch controlling an application setting:

1. The component renders Checked = false.
2. The user activates the switch.
3. The component emits a change request.
4. Limen translates it into an application message.
5. Ordo/application logic decides whether the transition is legal.
6. The application returns the authoritative new state.
7. The component renders the new state.

For purely local non-consequential settings, the application may choose an uncontrolled mode. The component still must not assume that pattern for consequential domain changes.

## 8. Async effects

Complex action components shall support the application presenting:

- idle;
- pending;
- succeeded;
- failed;
- unknown;
- retry-blocked where relevant.

Retry UI must not appear when retry safety is unknown.

## 9. Testing the boundary

Integration tests shall prove:

- a component cannot invent a domain transition;
- rejected intent returns to authoritative state cleanly;
- stale async responses do not overwrite newer authoritative state;
- controlled updates do not loop;
- unknown effects remain unknown;
- disabled capabilities cannot be invoked through alternate input paths;
- keyboard and pointer paths emit equivalent intent.

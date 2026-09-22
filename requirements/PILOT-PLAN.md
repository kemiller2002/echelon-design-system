# First Implementation Pilot

## Objective

Prove the architectural approach with a vertical slice that includes native styling, a form-associated custom component, advanced motion, overlay behavior, accessibility, and Ordo/Limen integration.

## Pilot components

### Foundation
- design tokens;
- light/dark themes;
- typography;
- native buttons;
- native text fields;
- layout stack/cluster/grid;
- focus system.

### Component 1: ef-switch
Why:

- simple enough to finish completely;
- exercises form association;
- requires polished microinteraction;
- exposes accessibility and reduced-motion requirements;
- demonstrates controlled versus uncontrolled state.

### Component 2: ef-slider
Why:

- advanced direct manipulation;
- keyboard/pointer parity;
- value semantics;
- motion;
- tooltip/value bubble;
- range geometry;
- form integration;
- reduced motion.

Implement the single-value slider first. The multi-range variant follows only after the single slider passes the full interaction and accessibility matrix.

### Component 3: ef-popover
Why:

- exercises browser top layer;
- positioning;
- focus relationships;
- modern Popover API;
- animation;
- progressive enhancement.

### Component 4: ef-tabs
Why:

- composite keyboard model;
- selection indicator animation;
- content composition;
- responsive overflow.

### Pattern: async action
Use a native button plus system feedback patterns rather than forcing a custom button element.

States:

- ready;
- pending;
- succeeded;
- failed;
- unknown where the calling workflow can produce indeterminate effect outcome.

## Pilot acceptance

The pilot is complete only when:

- components install from the package into a clean consumer;
- plain HTML can use them;
- Limen can consume them through ordinary DOM events/properties;
- form participation works;
- keyboard tests pass;
- reduced motion works;
- forced colors works;
- 400% zoom/reflow is acceptable;
- light/dark themes work;
- pointer/touch tests pass;
- visual regression exists;
- documentation examples are live;
- public API is documented;
- ROS validation passes;
- Ordo boundary is demonstrated without embedding business logic.

## Explicit experiment

Compare two implementation strategies for component behavioral state:

A. ordinary small component-local state logic;
B. explicit discriminated-union / Ordo-style state modeling.

Run this only on ef-slider and one more complex component.

Measure:

- illegal state combinations prevented;
- implementation complexity;
- test count and defect yield;
- event contract clarity;
- maintenance cost;
- code size.

Do not assume Ordo-style modeling is automatically better for every component.

## Next wave after pilot

If the pilot validates the architecture, next build:

- segmented control;
- dialog;
- menu/menu-button;
- combobox;
- toast/alert;
- application shell;
- side navigation;
- date picker;
- file upload;
- resizable split pane.

Then use real application demand to select the first heavy component:

- data grid;
- command palette;
- filter builder;
- coachmark;
- reorderable list.

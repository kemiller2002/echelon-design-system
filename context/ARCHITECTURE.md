# Echelon Design System architecture

## Current architecture

The system is standards-first and layered.

```text
Applications / Limen
        |
        v
DOM properties, attributes, methods, events
        |
        v
Behavior-rich Web Components
        |
        v
Native HTML + CSS foundations
        |
        v
Semantic design tokens
```

Ordo/application state remains beside and above this visual stack as the authority for domain legality, capabilities, obligations, and consequential transitions.

## Layers

### 1. Tokens
Primitive, semantic, component, state, motion, visualization, and accessibility-related tokens.

### 2. Foundations
Native HTML styling, typography, forms, layout primitives, focus, surfaces, responsive behavior, and utilities.

### 3. Components
Custom Elements for composite or behavior-rich interaction such as switch, slider, popover, tabs, combobox, data grid, and resizable split panes.

### 4. Patterns
Compositions such as async action, search/results, form layout, master/detail, bulk actions, filters, navigation shell, and wizard flow.

### 5. Integration
Stable browser-native contracts that plain HTML, Limen, F#, and framework consumers can use without forks.

## Native versus component decision

Do not create a Custom Element solely to restyle a native element.

Use a component when reuse materially benefits from centralized behavior, accessibility, focus management, state coordination, encapsulation, overlay handling, or a stable cross-application contract.

## Shadow DOM

Shadow DOM is selective.

Prefer light DOM for:

- layout;
- content structure;
- typography;
- page shells where composition is more important than encapsulation;
- print-adjacent structures.

Use open Shadow DOM for components whose internal structure needs protection or tightly coordinated styling.

Expose public customization deliberately through tokens, slots, properties, attributes, and CSS parts.

## State

Three state categories must remain distinct:

1. **Domain state**: application/Ordo authority.
2. **Component state**: reusable interaction state such as open, selected, editing, dragging, or validating when the component itself legitimately owns it.
3. **Ephemeral presentation state**: hover, pressed, focus-visible, animation phase, pointer capture.

Complex components should use explicit state models where this prevents illegal combinations. Simple components should remain simple.

## Browser platform strategy

Prefer standard platform facilities including:

- Custom Elements;
- native form controls;
- ElementInternals when true custom form association is required;
- dialog;
- Popover API;
- CSS anchor positioning where supported;
- container queries;
- logical properties;
- View Transitions as optional enhancement;
- Invoker Commands where supported and useful.

Every optional enhancement requires a fallback contract.

## Distribution

Publish framework-independent ES modules and CSS with subpath exports so applications load only the capabilities they use.

Runtime dependencies require explicit justification.

## Documentation

The documentation site dogfoods the design system and must expose:

- live component states;
- keyboard behavior;
- accessibility notes;
- motion/reduced-motion examples;
- API/events;
- tokens;
- anti-patterns;
- stability status.

## Architectural constraints

- Canonical requirements and decisions remain repository artifacts.
- Application-domain rules do not move into visual components.
- Generated views do not replace canonical source records.
- Untrusted content is treated as text by default.
- Components do not persist application secrets.
- Advanced UI cannot be pointer-only.
- Accessibility-critical behavior cannot be application-specific styling.
- The public API is browser-native first.

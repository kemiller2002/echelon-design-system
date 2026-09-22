# Motion and Interaction Requirements

Polished UI is not produced by adding animation after layout is complete. Motion is part of the interaction grammar.

## 1. Motion principles

### MOT-001 Purpose
Every animation shall serve at least one of:

- continuity between states;
- confirmation of input;
- spatial relationship;
- hierarchy;
- attention to a newly available result;
- transition into or out of a temporary surface;
- progress or activity feedback.

Animations with no communication purpose should be removable without loss.

### MOT-002 Direct manipulation
During dragging, sliding, resizing, scrubbing, or other direct manipulation, the controlled visual shall track the pointer without decorative lag.

Spring, easing, or overshoot effects may occur after release only when they do not change the selected semantic value or reduce control.

### MOT-003 Reduced motion
All meaningful motion patterns shall define a prefers-reduced-motion behavior.

Reduced motion shall not simply make every duration zero if a short opacity change preserves comprehension better. Large translations, zooms, parallax, rotations, and repeated motion should normally be removed.

### MOT-004 Interruption
Animations shall be safely interruptible. Rapid repeated input must not queue long animation sequences.

### MOT-005 State accuracy
The visual state at the end of animation shall always match the actual component state.

Animation state is never semantic authority.

### MOT-006 Performance
Prefer compositor-friendly opacity and transform animation when appropriate. Avoid layout-thrashing animation for decorative effect.

## 2. Token model

Define:

- motion-duration-instant
- motion-duration-fast
- motion-duration-standard
- motion-duration-slow
- motion-duration-emphasis
- motion-ease-standard
- motion-ease-enter
- motion-ease-exit
- motion-ease-emphasized
- direct-manipulation response tokens
- reduced-motion substitutions

Do not expose arbitrary per-component animation timings without a demonstrated reason.

## 3. Switch polish contract

The switch is a flagship microinteraction and shall feel deliberate.

### Resting transition
On state change:

1. track visual state changes;
2. thumb travels to its new position;
3. optional icon/glyph state changes;
4. label/state text updates without layout jump;
5. accessibility state changes immediately with the semantic value, not after animation.

### Pointer press
The thumb may expand slightly or the track may provide press feedback.

The press effect must not move the semantic target or make the control difficult to release.

### Keyboard activation
Space activation shall produce the same state transition as pointer activation and retain a visible focus indicator.

### Reduced motion
Thumb travel may become immediate or nearly immediate. State differentiation remains clear through position, shape/glyph, text, and color.

## 4. Slider polish contract

The canonical slider uses native `input[type=range]` behavior.

### SL-MOT-001 Native interaction is authoritative
The browser-owned thumb, track, keyboard behavior, touch behavior, and value semantics shall remain the interaction substrate.

CSS may style accent color, focus treatment, opacity, surrounding labels, bounds, and non-semantic hover/active emphasis without replacing the native control.

### SL-MOT-002 No fake synchronized fill
The HTML/CSS-only package shall not promise a cross-browser custom filled track that must continuously mirror the changing range value.

If a consuming application needs a custom fill, live value bubble, histogram, or synchronized numeric display, Limen/application behavior owns that synchronization.

### SL-MOT-003 Focus and active polish
The slider shall have deliberate focus-visible treatment and may use subtle CSS-only hover/active emphasis that does not interfere with direct manipulation.

### SL-MOT-004 Bounds and named context
Static minimum/maximum labels, named stops, help text, units, and descriptive context may be included in the canonical markup because they do not require value synchronization.

### SL-MOT-005 Reduced motion
Any CSS transitions around the native control shall collapse under reduced motion.

### SL-MOT-006 Multi-thumb
Multi-thumb range selection is not a declarative design-system component. It is a visual contract whose coordinated value/keyboard behavior must be implemented and tested by Limen/application code.

### SL-MOT-007 Application synchronization
When application behavior mirrors the range value elsewhere, the application must treat the native input value as the browser source for the current interaction and avoid oscillation or delayed disagreement.

## 5. Segmented control

The selected indicator may move between segments to reinforce continuity.

Requirements:

- selected semantics update immediately;
- the indicator may interpolate position/size;
- text does not slide unnecessarily;
- reduced motion uses immediate indicator placement or a short fade;
- rapid keyboard arrow movement does not queue animations.

## 6. Tabs

Tab-panel transitions are optional.

If used:

- changing panels must not delay focus;
- directionality may reflect adjacent tab movement;
- content should not fly large distances;
- automatic tab activation shall not produce distracting repeated animation during arrow navigation;
- reduced motion removes translation.

## 7. Dialog, popover, menu, tooltip, drawer

### Entry
Temporary surfaces may use opacity plus a small spatial cue related to origin.

Popover/menu motion should visually connect to its invoker.

Drawer motion should reflect the edge it occupies.

### Exit
Exit is normally shorter than entry.

Focus restoration shall not wait on decorative animation.

### Top layer
Where browser top-layer APIs are used, animation shall account for discrete display/open state transitions and avoid leaving invisible interactive surfaces.

## 8. Reorder and drag

During drag:

- dragged item remains identifiable;
- original position and candidate drop position remain clear;
- auto-scroll is controlled;
- other items may shift to preview placement;
- animation never makes drop position ambiguous.

Keyboard reorder shall receive equally clear position feedback and live announcements.

## 9. Resizable panes

Pointer resize updates should be immediate.

Keyboard resize may animate only enough to show the change.

Collapse/expand may animate width/height or transform when this does not destabilize content. Reduced motion uses an immediate size change.

## 10. Loading and completion

### Skeleton
Skeleton animation is optional and must respect reduced motion. Static skeletons are valid.

### Spinner
Indeterminate spinners shall not be the only indication of what operation is occurring.

### Progress
Determinate progress transitions may interpolate between known values but shall never visually imply progress beyond the actual value.

### Success
Short success confirmation may use check/glyph transition. It shall not create a required delay before the next action.

## 11. View transitions

View Transitions may be used for navigation and major state changes where they improve continuity.

They are an enhancement, not a routing dependency.

Requirements:

- semantic navigation completes even without animation;
- focus and announcement behavior is verified;
- stale snapshots cannot receive interaction;
- reduced motion can skip or simplify the transition;
- shared-element transitions are used sparingly.

## 12. Animation test requirements

Each animated component shall have tests or deterministic checks for:

- final state;
- interrupted state;
- rapid repeated activation;
- reduced motion;
- disabled state;
- focus retention;
- no semantic delay;
- no interactive invisible state after close;
- no pointer-only dependence.

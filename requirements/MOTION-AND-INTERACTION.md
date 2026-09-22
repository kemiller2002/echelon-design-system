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

### SL-MOT-001 Thumb behavior
The thumb shall have distinct rest, hover, focus, pressed, and disabled visuals.

Pressed feedback may use controlled scale or emphasis without changing the hit target.

### SL-MOT-002 Track fill
The selected portion of the track shall update continuously with the value.

The fill must not visually lag behind the thumb during direct manipulation.

### SL-MOT-003 Value bubble
A value bubble may appear on focus, keyboard adjustment, or pointer drag.

Appearance/disappearance should use short opacity and position/scale transitions.

The value remains available in accessible semantics whether or not the bubble is visible.

### SL-MOT-004 Discrete stops
When a slider has meaningful discrete stops, snap feedback may emphasize arrival at a stop.

Snap animation must not prevent selecting neighboring values or create false values.

### SL-MOT-005 Ticks
Ticks may animate emphasis for the selected stop or range, but non-selected ticks must remain stable enough for visual comparison.

### SL-MOT-006 Multi-thumb
When thumbs approach or cross according to the component policy, labels must avoid unreadable overlap and keyboard focus must remain on the same logical thumb.

### SL-MOT-007 Input synchronization
If a numeric text input mirrors the slider, both shall update from the same semantic value with no visible oscillation or delayed disagreement.

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

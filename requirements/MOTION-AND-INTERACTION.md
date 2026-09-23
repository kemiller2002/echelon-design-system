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

### MOT-008 Physics-derived response model

Forma may use a deterministic physics-derived model when motion needs to convey perceived mass consistently across controls and transient surfaces. This is not a continuous rigid-body simulation and must not be described as one.

The canonical normalized variables are:

- `--ef-motion-mass` (`m`): inertial mass;
- `--ef-motion-stiffness` (`k`): spring/restoring stiffness;
- `--ef-motion-damping` (`ζ`): normalized damping ratio in the supported underdamped preset range;
- `--ef-motion-distance` (`s`): normalized travel distance for gravity-derived movement;
- `--ef-motion-gravity` (`g`): normalized gravitational acceleration;
- `--ef-motion-base-duration`: the dimensional scale factor that maps the normalized model to UI time;
- `--ef-motion-exit-duration`: a derived dismissal duration, normally shorter than inertial entry.

For spring/inertial settling, Forma uses the second-order-system scaling relationship:

`T_inertia ∝ sqrt(m / k) / ζ`

The constant and physical units are intentionally normalized into the base duration because UI pixels are not meters and the component is not a literal mechanical body.

For vertical gravity-derived travel, Forma uses:

`T_gravity ∝ sqrt(2s / g)`

Mass must not appear in the gravity-derived duration. In a uniform gravitational field, changing an item's mass does not change its gravitational acceleration.

The shipped weight presets are:

| Weight | Mass | Stiffness | Damping ratio | Intended perception |
| --- | ---: | ---: | ---: | --- |
| light | 0.65 | 1.15 | 0.94 | fast, highly damped, little perceived inertia |
| standard | 1.00 | 1.00 | 0.84 | default control response |
| heavy | 1.80 | 0.92 | 0.76 | slower, more inertial settling |

Rules:

- presets are presentation parameters, never business or domain semantics;
- component size does not automatically determine mass;
- weight may change inertial timing but may not delay the native semantic state change;
- gravity-derived timing remains independent of mass;
- CSS math support may be progressively enhanced; unsupported browsers must retain a usable static/fallback timing;
- motion must remain interruptible;
- tests must verify the expected ordering `light < standard < heavy` for inertial duration and verify mass independence for gravity timing;
- transient-surface exit duration derives from inertial duration and is shorter than entry; the canonical factor is 0.68 before clamping;
- reduced motion collapses spatial travel and overshoot while retaining clear final state.

### MOT-009 Surface mass grammar

The same physical variables shall be used across controls and transient surfaces. Forma's canonical defaults are:

| Surface family | Default perceived weight | Rationale |
| --- | --- | --- |
| disclosure indicator, tab indicator, popover, ordinary action menu | light | local, quickly reversible context |
| alert / toast notification | standard | deserves attention without modal weight |
| modal dialog, flyout / modal drawer baseline, command palette | heavy | larger spatial and attentional commitment |

These defaults describe perceived inertia only. They do not encode severity, privilege, business importance, risk, destructive intent, or domain legality.

Applications may override the preset when composition provides a real visual-mass reason, but one product should not make physically equivalent surfaces behave arbitrarily differently.

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

## 3.5 Checkbox and native-select physics extensions

### Checkbox

The canonical checkbox remains a native `input[type=checkbox]`. CSS may animate a visible box/check glyph using the same inertia model as the switch.

Requirements:

- checked state changes immediately at the native input;
- the check glyph is a non-color state cue;
- press feedback does not change target geometry or semantic state;
- light/standard/heavy presets use the shared physics variables;
- reduced motion makes the glyph/state change effectively immediate.

### Native select

The canonical ordinary select remains a native `select`; Forma shall not recreate its option picker in script.

Requirements:

- platform value, keyboard, form, disabled, and picker behavior remain authoritative;
- the visible indicator may use inertial rotation;
- a small vertical indicator cue may use gravity-derived timing;
- mass may alter the inertial indicator duration but not gravity-derived timing;
- `:open` styling is progressive enhancement only; lack of open-state styling cannot reduce usability;
- searchable, rich-option, async, and multiselect behavior remains a Limen/application concern;
- reduced motion removes spatial indicator travel.

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

- the selected indicator uses the shared light surface-response model;
- changing `aria-selected` remains semantically immediate and is never delayed by indicator motion;
- changing panels must not delay focus;
- directionality may reflect adjacent tab movement;
- content should not fly large distances;
- automatic tab activation shall not produce distracting repeated animation during arrow navigation;
- rapid selection changes must retarget the current transition rather than queue motion;
- reduced motion removes translation and indicator travel while preserving selected styling.

## 7. Dialog, popover, menu, tooltip, flyout, drawer

### Entry
Temporary surfaces may use opacity plus a small spatial cue related to origin.

Popover and ordinary action-menu surfaces use the light preset by default. Modal dialog, flyout, and command palette use the heavy preset by default.

Popover/menu motion should visually connect to its invoker.

Centered modal dialogs shall use a restrained vertical/scale response. Modal flyouts shall travel from the edge they occupy: negative inline travel for the left edge and positive inline travel for the right edge.

Dialog, flyout, popover, and menu spatial entry shall use the shared physics-derived inertia model. `data-ef-motion-weight="light|standard|heavy"` may tune perceived mass, but it must never imply domain importance, severity, permission, risk, or destructive intent.

### Exit
Exit is shorter than entry and uses a damped response rather than spring overshoot. Forma derives transient-surface exit from the same inertial duration using the canonical 0.68 factor, subject to clamping.

Focus restoration shall not wait on decorative animation. Native dialog and Popover state changes immediately; animation only represents that state.

### Native authority
Native `dialog[open]`, `:popover-open`, and `details[open]` remain semantic authority. CSS motion must not synthesize a parallel visibility state.

### Ordinary action-menu boundary
Forma may provide an ordinary action-list menu surface using the Popover API with normal buttons or links. The declarative baseline intentionally does not claim the full ARIA `menu` interaction model.

If an application requires roving focus, typeahead, checkable menu items, radio menu items, nested submenus, or other full ARIA-menu behavior, Limen/application code owns that interaction model.

### Flyout / modal drawer boundary
The native-dialog `.ef-flyout` pattern is Forma's canonical left/right modal drawer or side-sheet baseline. It preserves native modal focus, inertness, Escape, and return-focus behavior while presenting the surface from its occupied edge.

Swipe tracking, velocity-based release, resize gestures, bottom sheets, persistent nonmodal drawers, and other direct manipulation belong to Limen/application code.

A direct-manipulation enhancement must track the pointer without lag and may use a spring only after release. It may not become the only close path.

### Backdrop
Modal dialog and flyout backdrops may fade and apply a small visual blur. Backdrop animation must remain synchronized with the top-layer surface and must not communicate state that is absent from text or semantics.

### Reduced motion
Reduced motion removes modal scale/translation, flyout edge travel, and other transient-surface spatial motion. The final open/closed distinction remains immediate and unambiguous.


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

### Alert and toast notification
A newly inserted alert may opt into a standard-weight entry cue with a short spatial movement. Persistent alerts shall not repeatedly animate merely because a page rerenders.

Toast notifications use a standard perceived weight by default. When implemented with the Popover API, show/hide state remains browser authoritative and dismissal uses the shorter derived exit duration.

Notification motion never substitutes for live-region semantics, visible text, dismissal policy, or durable confirmation.

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


## 13. Aegis fault surfaces

Aegis presentation intent determines the surface family; motion does not determine severity or intent.

- Inline faults do not require spatial entry motion.
- Fault notifications use the standard perceived-weight preset by default.
- Fault banners use the standard perceived-weight preset only for initial insertion and do not repeatedly animate while persistent.
- Blocking faults use the heavy perceived-weight preset because they are modal surfaces with greater spatial/attentional commitment.
- `data-ef-motion-weight` remains a presentation override only and may not encode Diagnostic/Warning/Error/Critical.
- Aegis lifecycle state changes immediately. Animation never delays acknowledgement, recovery, resolution, focus, or application state.
- Reduced motion removes notification/banner travel and modal scale/travel while preserving the final visible state.

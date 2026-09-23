# Aegis Fault Presentation Requirements

Status: canonical
Updated: 2026-09-23

## 1. Purpose

Forma shall provide a complete visual and semantic presentation family for faults supplied by Aegis while preserving the Echelon architecture boundary:

`Aegis Fault → Aegis Presentation.T → application/Limen → Forma markup/CSS`

Forma shall not become an Aegis client library, exception renderer, logging sink, recovery engine, or domain authority.

## 2. Upstream Aegis model

The normal UI input is Aegis `Presentation.T`, containing:

- title;
- safe user-facing message;
- `FaultSeverity`;
- presentation `Intent`;
- recovery `Action` list;
- short quotable reference.

Aegis currently defines the visible intents `Inline`, `Notification`, `Banner`, and `Blocking`, plus `Silent`.

Aegis severity is `Diagnostic | Warning | Error | Critical`.

Aegis presentation actions are derived from recovery capabilities. Forma shall render those actions but shall not decide which actions exist.

## 3. Intent mapping

### AEGIS-UI-001 Silent

`Silent` shall not render a visible fault component by default.

Diagnostic persistence/queue state may independently be rendered through `diagnostic-status` when the application explicitly supplies that state.

### AEGIS-UI-002 Inline

`Inline` maps to `fault-inline`.

Inline faults shall:

- remain near the affected operation or field/region;
- expose visible severity text and a non-color marker;
- expose the Aegis reference when available;
- allow the affected control/region to reference the message through `aria-describedby` when appropriate;
- not steal focus merely because they appeared;
- expose only application-supplied recovery actions.

### AEGIS-UI-003 Notification

`Notification` maps to `fault-notification`.

Notifications shall:

- provide a readable title/message/reference;
- use a live-region role only when the application inserts a genuinely new notification;
- include an explicit dismiss control when dismissal is allowed;
- not require pointer hover to pause, inspect, dismiss, or recover;
- not auto-dismiss actionable faults inside Forma;
- use standard perceived motion weight by default;
- collapse spatial motion under `prefers-reduced-motion`.

Notification lifecycle and throttling belong to Aegis/application behavior.

### AEGIS-UI-004 Banner

`Banner` maps to `fault-banner`.

Banners shall:

- remain in the application/page flow;
- persist while the application reports the condition;
- provide visible severity text, non-color marker, title, message, reference, and legal recovery actions;
- not repeatedly animate on rerender;
- use standard perceived motion weight for initial insertion only;
- not infer criticality from visual weight.

### AEGIS-UI-005 Blocking

`Blocking` maps to `fault-blocking`.

Blocking faults shall:

- use native `dialog` semantics;
- be opened modally by the consuming application/Limen;
- have an accessible name and description;
- expose only current legal recovery actions;
- never invent a bypass such as “Continue anyway”;
- keep keyboard focus within the modal surface while it is blocking;
- restore focus appropriately after the fault resolves or the application legally transitions;
- require Limen/application handling for browser cancel/close requests when dismissal is not currently legal.

Forma cannot enforce a blocking policy with CSS alone and shall not pretend that it can.

## 4. Common fault shell

### AEGIS-UI-006 Generic shell

`fault` provides the common visual vocabulary:

- marker;
- visible severity label;
- title;
- user-facing message;
- reference;
- recovery-action region.

Intent-specific patterns may compose the same class vocabulary with existing Forma alert, toast, validation, and dialog primitives.

### AEGIS-UI-007 Severity

Severity shall be represented using:

- visible text;
- a structural/non-color marker;
- optional border/shape emphasis;
- color as a secondary cue only.

Color alone shall never distinguish Diagnostic, Warning, Error, or Critical.

CSS motion weight shall never be used as a proxy for severity.

## 5. Fault reference

### AEGIS-UI-008 Quotable reference

`fault-reference` shall present the short Aegis reference as text that can be selected, read aloud, and quoted to support.

A copy button may be rendered, but copy behavior belongs to Limen/application code.

The reference must never be replaced by a stack trace, exception type, repository path, token, correlation payload, or other developer-only material.

## 6. Recovery actions

### AEGIS-UI-009 Capability projection

`recovery-actions` shall project Aegis recovery capabilities into ordinary native buttons.

The canonical DOM annotation is:

`data-ef-aegis-capability="<CapabilityCaseName>"`

This attribute communicates intent to application code. It is not authority.

### AEGIS-UI-010 Revalidation

The consuming application must revalidate the current capability and domain state when a recovery control is activated. Stale DOM must not authorize a recovery operation.

### AEGIS-UI-011 Labels

Default labels should mirror Aegis presentation labels:

- CanRetry: Try again
- CanReauthenticate: Sign in
- CanReload: Reload
- CanQuarantine: Set aside
- CanReprocess: Process again
- CanOpenReadOnly: Open read-only
- CanRestoreSink: Reconnect diagnostics

Applications may localize these labels without changing capability identity.

## 7. Summary

### AEGIS-UI-012 Fault summary

`fault-summary` shall present multiple unresolved faults in one focusable region.

It shall support:

- count;
- title;
- grouped entries;
- severity text;
- reference;
- occurrence count;
- links/navigation to affected regions where applicable.

### AEGIS-UI-013 Deduplication ownership

Forma shall not calculate fingerprints, collapse repeated faults, or determine whether two events have the same cause.

Aegis/application code supplies already-grouped faults and occurrence counts.

### AEGIS-UI-014 Announcement policy

A fault summary shall not automatically use an assertive live region for every render. After a failed submit or similar user action, the application may focus the summary and/or announce one concise update. Re-renders must avoid duplicate announcements.

## 8. Safe diagnostic details

### AEGIS-UI-015 Safe details surface

`fault-details` provides optional disclosure for diagnostic information explicitly approved for the current audience.

It shall never directly accept or automatically expose raw:

- `Fault.TechnicalDetails`;
- `ExceptionDetail`;
- stack traces;
- `ContextValue.Secret`;
- sensitive/internal context unless separately approved;
- breadcrumb raw data;
- snapshot locations;
- tokens/credentials;
- unredacted exported bundles.

### AEGIS-UI-016 Sanitization boundary

The application must produce a separate safe view model before rendering `fault-details`.

Redaction and authorization occur before the data reaches Forma.

## 9. Diagnostic persistence state

### AEGIS-UI-017 Persistence status

`diagnostic-status` shall support Aegis persistence states:

- Synchronized;
- Queued with count;
- Unavailable;
- LastSynchronizationFailed with a safe reason.

This status is operational state, not a fault severity.

The state must always be written in text and may use an icon/color as secondary cues.

## 10. Accessibility

### AEGIS-UI-018 Baseline

The family targets WCAG 2.2 AA and follows Forma's canonical accessibility requirements.

### AEGIS-UI-019 Live regions

Live-region semantics shall match actual communication intent:

- inline faults are normally described by the affected region/control rather than announced globally;
- newly inserted notifications may use `role="status"`;
- persistent banners must not repeatedly announce on rerender;
- blocking dialogs rely on modal dialog naming/focus semantics;
- summaries use focus/navigation rather than repeated assertive announcements.

### AEGIS-UI-020 Focus

Recovery actions must have visible focus.

Blocking faults require application-owned focus management consistent with native modal dialog behavior.

Fault summaries shall be programmatically focusable so an application can move focus after a failed consequential operation.

### AEGIS-UI-021 Non-color communication

Every severity/state presentation includes text and structure independent of color.

### AEGIS-UI-022 Touch

Standalone dismiss/recovery/copy controls should provide approximately 44 by 44 CSS pixel target areas where practical.

## 11. Mobile

### AEGIS-UI-023 320px

Every Aegis presentation pattern must remain usable at 320 CSS px.

On narrow screens:

- actions wrap or become full-width;
- reference text may wrap without clipping;
- summary links remain readable;
- banner and generic fault grids collapse without changing reading order;
- blocking dialog respects viewport/safe-area bounds;
- no essential content causes page-level horizontal scrolling.

## 12. Motion

### AEGIS-UI-024 Motion grammar

Fault notification and banner entry use standard perceived weight. Blocking dialog uses heavy perceived weight because of surface size/commitment, not severity.

Persistent surfaces do not repeatedly animate.

### AEGIS-UI-025 Reduced motion

Reduced motion removes spatial travel/overshoot and preserves immediate semantic state and visible final state.

No animation delays focus, capability execution, live-region updates, or recovery state.

## 13. Forced colors and themes

### AEGIS-UI-026 Forced colors

Borders, markers, focus indicators, buttons, and references remain visible in forced-colors/high-contrast modes.

### AEGIS-UI-027 Branding

Brand/skin tokens may change appearance but never:

- severity;
- intent;
- action availability;
- reference identity;
- recovery legality;
- announcement priority.

## 14. Limen and Ordo integration

### AEGIS-UI-028 Mapping

Limen/application code maps `Presentation.T` to Forma markup.

Forma does not import Aegis.

### AEGIS-UI-029 Actions

Native button clicks are translated by Limen/application code into typed recovery requests.

### AEGIS-UI-030 Authority

Aegis recovery capabilities and Ordo/application state are rechecked before effects execute.

DOM presence is never sufficient authorization.

### AEGIS-UI-031 Lifecycle

Acknowledged, recovery-started, recovery-concluded, escalated, resolved, reopened, and superseded lifecycle events may cause the application to rerender or remove a presentation. Forma does not reconstruct lifecycle history.

## 15. Testing and evidence

### AEGIS-UI-032 Required automated checks

The feature shall have automated evidence for:

- zero-runtime packaging;
- semantic roles/names;
- Axe WCAG A/AA scan;
- recovery capability annotations;
- visible reference;
- blocking dialog accessible name;
- summary navigation;
- 320px containment;
- reduced-motion compatibility through the shared motion system;
- generated site pages and examples.

### AEGIS-UI-033 Site examples

Every Aegis pattern receives the standard Forma generated examples, including a true 320px mobile example. Motion-enabled fault surfaces also show light/standard/heavy comparison for presentation testing, while documentation states the canonical defaults.

## 16. Explicit non-goals

Forma shall not:

- catch exceptions;
- classify faults;
- persist faults;
- choose presentation intent;
- generate fingerprints;
- throttle notifications;
- decide recovery policy;
- execute recovery;
- authorize domain transitions;
- inspect secrets;
- render raw stack traces;
- create an Aegis-specific JavaScript runtime.

Those responsibilities remain upstream.

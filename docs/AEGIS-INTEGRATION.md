# Aegis + Forma Integration

Status: canonical application integration guidance  
Updated: 2026-09-23

## Boundary

The supported path is:

```text
Aegis Fault
  ↓ Aegis Presentation.present
Aegis Presentation.T
  ↓ application / Limen mapping
Forma semantic markup + CSS
  ↓ native DOM events
application / Limen recovery request
  ↓ capability + Ordo/application state revalidation
recovery effect
```

Forma does not import Aegis and Aegis does not render HTML.

## What to pass to Forma

Use the safe Aegis presentation model:

- `Title`
- `Message`
- `Severity`
- `Intent`
- `Actions`
- `Reference`

Do not hand Forma the raw `Fault`.

The full fault contains operational and diagnostic material that has different audiences and disclosure rules. Keeping the UI boundary at `Presentation.T` prevents accidental coupling to:

- `TechnicalDetails`
- preserved exceptions and stack traces
- raw context values
- breadcrumbs
- snapshots
- internal dependencies
- diagnostic environment details

## Intent mapping

| Aegis intent | Forma pattern | Notes |
| --- | --- | --- |
| Silent | none | No visible fault surface. |
| Inline | `fault-inline` | Place near affected operation/region. |
| Notification | `fault-notification` | Application owns insertion, throttling, dismissal, and persistence. |
| Banner | `fault-banner` | Persistent application/page condition. |
| Blocking | `fault-blocking` | Application opens native dialog modally and enforces current close/cancel policy. |

The generic `fault` shell is useful for adapters and nonstandard compositions, but known Aegis intents should use the corresponding intent pattern.

## Severity

Render the Aegis severity into `data-ef-severity` using:

- `diagnostic`
- `warning`
- `error`
- `critical`

The visible markup must also include a textual severity label. CSS color is supplementary.

## Recovery actions

Each action is an ordinary native button with the exact Aegis capability identity:

```html
<button type="button" data-ef-aegis-capability="CanRetry">
  Try again
</button>
```

The DOM attribute is not authorization.

At click time the application must re-check the current fault/capability and legal application transition before performing an effect. This protects against stale DOM and state changes that occurred after rendering.

Known Aegis capability labels:

| Capability | Default label |
| --- | --- |
| CanRetry | Try again |
| CanReauthenticate | Sign in |
| CanReload | Reload |
| CanQuarantine | Set aside |
| CanReprocess | Process again |
| CanOpenReadOnly | Open read-only |
| CanRestoreSink | Reconnect diagnostics |

Applications may localize labels while preserving capability identity.

## Example: inline presentation

```html
<ef-fault-inline class="ef-component-tag">
  <div class="ef-fault ef-fault--inline"
       data-ef-intent="inline"
       data-ef-severity="error"
       aria-labelledby="save-fault-title">
    <div class="ef-fault__marker" aria-hidden="true">!</div>
    <div class="ef-fault__body">
      <p class="ef-fault__severity">Error</p>
      <p class="ef-fault__title" id="save-fault-title"><strong>Could not save changes</strong></p>
      <p class="ef-fault__message">The update did not complete.</p>
      <p class="ef-fault-reference">Reference <code>AG-4F82C</code></p>
    </div>
    <div class="ef-recovery-actions" role="group" aria-label="Recovery actions">
      <button type="button" data-ef-aegis-capability="CanRetry">Try again</button>
    </div>
  </div>
</ef-fault-inline>
```

Limen observes the native button click and translates it to the application's typed recovery message.

## Example: blocking presentation

`fault-blocking` uses native `dialog`. The canonical Forma markup supplies the dialog structure and styling. The application must:

1. call `showModal()` when current Aegis presentation intent is Blocking;
2. choose initial focus based on the available legal recovery controls;
3. handle `cancel`/close requests according to current application policy;
4. re-check recovery capability when an action is invoked;
5. close/remove the dialog only after a legal transition changes the authoritative state;
6. restore focus to a meaningful location after resolution.

Do not render “Continue anyway” unless the application has a real capability that means exactly that.

## Notification lifetime

Forma never starts dismissal timers.

For actionable Aegis faults, prefer persistence until the user dismisses the notification or the condition resolves. If an application uses timed dismissal for non-actionable information, preserve a durable notification/history path and meet the application's accessibility timing policy.

Aegis throttling/fingerprinting remains upstream. Forma displays the result.

## Summary and repeated faults

`fault-summary` can show grouped faults and occurrence counts, but Forma does not decide which faults are equivalent.

Use Aegis lifecycle/fingerprint logic before rendering. Supply:

- display title/message;
- severity;
- reference;
- occurrence count;
- target/navigation location when relevant.

## Safe details

`fault-details` is intentionally conservative.

The application should create a separate audience-safe diagnostic view model. Never bind raw `Fault` fields into the details template merely because the user asked for more information.

A good safe model might contain:

- public reference;
- application name;
- current recovery state;
- a user-visible dependency name;
- an explicitly approved timestamp.

It should not automatically contain stack traces, raw context, secrets, internal paths, or exception messages.

## Diagnostic persistence state

Map Aegis `PersistenceState` to `diagnostic-status`:

| Aegis state | `data-ef-state` |
| --- | --- |
| Synchronized | `synchronized` |
| Queued n | `queued` |
| Unavailable | `unavailable` |
| LastSynchronizationFailed reason | `last-synchronization-failed` |

Always render text. The icon/color is supplementary.

## Accessibility integration

- Associate inline faults with affected controls/regions using `aria-describedby` when the relationship is direct.
- Do not globally announce every rerendered fault.
- Newly inserted notifications may use `role="status"`.
- Focus `fault-summary` after a failed submit when that is the clearest recovery path.
- Native modal dialog semantics handle the blocking surface, but the application still owns opening, close policy, and focus restoration.
- Do not duplicate the same message simultaneously into multiple live regions.

## Mobile integration

At 320 CSS px Forma stacks recovery actions and collapses multi-column fault layouts. The application must not hide legal actions or substitute a different semantic fault type on mobile.

## Testing consuming applications

At minimum verify:

- each Aegis intent maps to the expected Forma pattern;
- Silent renders nothing visible;
- every action identity matches the current Aegis capability;
- stale actions are rejected by current state;
- resolved/superseded faults disappear or change presentation correctly;
- notification rerenders do not repeatedly announce;
- blocking faults remain modal while the application says they are blocking;
- no raw diagnostic material reaches DOM snapshots or accessibility trees;
- 320px layout contains without page-level overflow;
- reduced-motion and forced-colors modes remain usable.

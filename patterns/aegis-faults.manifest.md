# Feature Manifest — Aegis fault presentation

## Purpose

Provide the canonical Forma presentation vocabulary for user-facing Aegis faults without making Forma understand, store, classify, recover, or authorize a raw Aegis `Fault`.

## Upstream contract

The default integration input is the safe Aegis `Presentation.T` model:

- `Title`
- `Message`
- `Severity`
- `Intent`
- `Actions`
- `Reference`

The full Aegis `Fault` record is not a Forma input contract.

## Intent mapping

- `Silent`: render no visible fault surface.
- `Inline`: `.ef-fault--inline` / `<ef-fault-inline>`.
- `Notification`: `.ef-fault-notification` / `<ef-fault-notification>`.
- `Banner`: `.ef-fault-banner` / `<ef-fault-banner>`.
- `Blocking`: `.ef-fault-blocking` / `<ef-fault-blocking>`.

`<ef-fault>` is the common visual shell. The intent-specific patterns are preferred when the Aegis intent is already known.

## Ownership

- Aegis owns fault classification, presentation intent, severity, recovery policy, safe user message, reference, lifecycle, throttling, and recovery capability derivation.
- Ordo/application state owns whether a recovery transition is currently legal.
- Limen/application behavior maps Aegis data into DOM, handles clicks, focus, notification lifecycle, blocking-dialog policy, copy behavior, and revalidates capabilities before executing them.
- Forma owns semantic markup, CSS, non-color cues, responsive composition, focus styling, reduced-motion behavior, and forced-colors behavior.

## Security boundary

Do not pass the raw Aegis `Fault`, `TechnicalDetails`, `ExceptionDetail`, stack trace, raw context values, breadcrumbs, snapshot locations, secrets, or unredacted diagnostics into these patterns.

`fault-details` is not an escape hatch. It accepts only data that the application has explicitly approved and sanitized for the current audience.

## Recovery action contract

Buttons use `data-ef-aegis-capability` with the exact Aegis capability name. The attribute is descriptive, not authoritative. The consuming application must re-check current capability/state at activation time.

Canonical labels mirror Aegis:

- `CanRetry` → Try again
- `CanReauthenticate` → Sign in
- `CanReload` → Reload
- `CanQuarantine` → Set aside
- `CanReprocess` → Process again
- `CanOpenReadOnly` → Open read-only
- `CanRestoreSink` → Reconnect diagnostics

Never synthesize `Continue anyway` or another action that Aegis/application state did not supply.

## Notification policy

Forma does not run timers. Fault notifications with recovery actions are persistent until the application dismisses/resolves them. An application that chooses timed dismissal for non-actionable information must preserve an accessible durable history or equivalent recovery path and pause/extend timing when required by accessibility policy.

## Summary and repeat policy

Forma does not fingerprint or deduplicate faults. Aegis/application code performs lifecycle/fingerprint logic and supplies already-grouped entries plus occurrence counts. The summary pattern only presents that result.

## Blocking policy

The blocking pattern uses native `dialog` as the semantic surface. Limen/application code is responsible for opening it modally, handling browser close/cancel requests according to current Aegis/Ordo state, keeping legal recovery actions reachable, and restoring focus after resolution.

## Verification

The feature is covered by:

- zero-runtime package checks;
- generated-site coverage and 320px mobile examples;
- Axe WCAG A/AA checks;
- accessible-name/role tests;
- recovery capability attribute tests;
- mobile overflow tests;
- pull-request CI across the repository validation workflows.

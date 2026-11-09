# Echelon Waiting and Progress Standard

**ID:** EDS-UX-WAIT-001  
**Status:** Normative draft; pending design-system release and implementation verification  
**Applies to:** All Echelon interactive applications, including initial WebAssembly startup

## Mandatory contract

Whenever an operation prevents a user from proceeding, the interface MUST show an immediate, perceivable, branded or contextual waiting state. A blank screen, frozen interface without feedback, or the word “Loading” alone is noncompliant. The indicator MUST remain visible until the operation completes, fails, or transitions to another meaningful state. Do not display fake percentages, fabricated stages, or arbitrary completion estimates.

### Required patterns

| Context | Required treatment |
| --- | --- |
| Initial WASM bootstrap | Lightweight branded splash rendered before WASM initializes, with EF mark, application name, animated indicator, and meaningful accessible status |
| Route or workspace transition | Retain existing shell and show immediate route-level feedback or skeleton |
| Data retrieval | Contextual skeleton or localized busy state; preserve usable surrounding content |
| Form submission | In-place pending state, prevention of accidental duplicate submissions, and clear completion/error feedback |
| Long-running action | Descriptive progress panel; show real progress only when measurable; otherwise indeterminate activity and meaningful verified stages |
| Background work | Nonblocking indicator with status access, without unnecessarily interrupting the user |
| Timeout or failure | Explain failure and provide safe retry, cancel, or recovery when possible |

### Behavior and accessibility

1. Provide a visible indicator and human-readable description; animation alone is insufficient.
2. Provide semantic status announcements using appropriate ARIA live regions/status roles, without repeated announcements on each animation frame.
3. Respect reduced-motion preferences; show a static but perceivable equivalent when motion is disabled.
4. Never rely on color alone; maintain WCAG 2.2 AA applicable contrast and focus requirements.
5. Keep focus stable; do not trap focus in passive loading states. Restore sensible focus after completion.
6. Distinguish busy, successful, empty, failed, and timed-out states. Empty results are not perpetual loading.
7. Preserve previously available content when safe; do not replace the entire screen for a local fetch.
8. On startup, ensure the waiting screen is supplied by initial HTML/CSS and does not depend on the WASM runtime it is waiting for.
9. Avoid an unnecessary flash for extremely short operations, but do not leave a blank screen or dead control during any delay. A delay before showing decorative animation is permitted only when meaningful feedback is already visible.
10. Avoid falsely promising cancellation or retry; operations must support those actions safely, including idempotency considerations.

### Shared ownership

- **Design system:** Defines waiting-state behavior, visual tokens, and acceptance contracts.
- **Forma:** Implements reusable loading screen, progress indicator, skeleton, button pending state, and status/error patterns.
- **Forma Studio:** Documents and demonstrates all states in light/dark, mobile, and reduced-motion modes.
- **Folio:** Uses appropriate progress feedback for report generation; generated static documents do not animate.
- **Percepta/Dokimos:** Verify behavior and aggregate evidence using supported contracts and runners.
- **Conditor:** Generates applications with a pre-WASM branded startup shell and test fixtures.

### Verification gates

Automated browser tests MUST simulate delayed startup, delayed data, slow navigation, pending submissions, timeout, failure, and recovery. Confirm the indicator appears before the delayed operation resolves, is meaningful and accessible, disappears or transitions after resolution, and does not mask errors. Include negative fixtures for blank startup, text-only “Loading”, invisible indicators, fabricated progress, missing reduced-motion fallback, and permanent spinners.

**Release acceptance:** No interactive application may claim full design-system compliance without passing the waiting-state contract for every applicable critical workflow. Operational deployment readiness and design compliance remain separate verdicts during migration.

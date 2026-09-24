# Tutela Security Results Components

Forma MUST provide reusable presentation primitives for Tutela artifacts. Forma displays state; it MUST NOT independently derive security posture.

Required components:
- ef-security-posture: PASS/CONDITIONAL/BLOCKED/INDETERMINATE, scope, ref, freshness.
- ef-security-state-matrix: Verified/Violated/Unknown/Stale/N/A counts.
- ef-security-blockers: violated invariants, unknown effects, stale evidence, expired exceptions.
- ef-invariant-result: invariant statement/state/evidence/unknowns.
- ef-evidence-chain: source -> observation -> invariant relationship and provenance.
- ef-unknown-result: unknown, consequence, evidence needed and obligation.
- ef-exception-status: approver/scope/expiry/compensating controls.
- ef-evidence-age and ef-security-trend.
- ef-boundary-map for trust-boundary/data-flow presentation.

Requirements:
1. Status MUST NOT depend on color alone.
2. Unknowns MUST be as discoverable as findings.
3. No single numeric security score may be the primary representation.
4. Keyboard, screen-reader, zoom/reflow, high-contrast and reduced-motion behavior are required.
5. Components MUST work on mobile.
6. Sensitive evidence MUST be redacted by default.
7. Stable IDs and deep-link targets MUST be exposed.
8. Components MUST accept machine state as input and MUST NOT silently reinterpret it.
9. At least three examples per component SHOULD be added to the Forma example site, including adverse/unknown states.
10. Print behavior MUST cooperate with Folio without dropping IDs, scope, unknowns or evidence references.

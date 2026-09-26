# Visual Engineering Verification Contract

Status: canonical Forma verification requirement

## Purpose
Forma must preserve meaning under realistic perceptual, content, accessibility, and responsive stress. Visual Engineering supplies evidence and decision criteria. Forma supplies presentation contracts and verification surfaces. Applications retain authoritative state, legal actions, labels, values, and domain meaning.

## Recognition and verification
Consequential views distinguish:
1. Recognition: identify the primary state, task, or issue at first glance.
2. Verification: inspect values, evidence, scope, freshness, unresolved work, and other facts needed before consequential action.

The verification-frame pattern is the canonical recognize -> verify -> act composition. It never decides whether an action is legal.

## Low-context content
Identifiers, codes, unfamiliar names, hashes, monetary values, dates, times, measurements, and safety-critical values receive less linguistic error correction than prose.

Forma requires selectable text, tabular numerals where useful, strong glyph differentiation, wrapping, visible semantic labels, and an optional deliberate-verification cue. Typography must not be the only carrier of state, validity, or authority.

Canonical classes: .ef-identifier and .ef-critical-value. data-ef-verify="true" is descriptive presentation only.

## Semantic state preservation
Forma must present without strengthening or collapsing application-supplied pending, confirmed, failed, conflict, unknown, reconciling, stale, blocked, unavailable, insufficient, partial, and scoped-completeness states.

Unknown is not failure. Loading is not empty. Partial is not complete. Stale evidence is not proof of current state.

## Semantic-channel survivability
Consequential meaning must survive removal of any one nonessential visual cue. Screen at least: hue/grayscale, decorative icon, nonessential border, motion, and secondary surface tint. Remaining text, semantic structure, labels, native state, and necessary structural cues must preserve the material conclusion.

This is presentation fault injection, not human-subject validation.

## Required perceptual and accessibility screens
For representative consequential patterns verify:
- keyboard-only operation and visible unobscured focus;
- 200% text scaling and browser zoom/reflow through 400% where applicable;
- 320px and 390px widths;
- text-spacing overrides;
- reduced motion;
- forced colors/high contrast;
- grayscale;
- protan, deutan, and tritan simulation as screening when color carries categorization;
- low-brightness viewing;
- glare/reduced effective contrast;
- screen-reader semantics for critical workflows.

CVD, grayscale, low-brightness, and glare screens are fault-injection checks, not substitutes for affected-user validation.

## Content stress matrix
Exercise canonical patterns and reference compositions with long labels/prose, localization expansion, long unbroken identifiers, missing optional data, explicit unknown data, extreme/zero/negative legal values, large counts, sparse content, dense content, repeated records, and conflicting/stale state where permitted.

Generated documentation should progressively expose these stress cases. Ideal-content rendering alone is insufficient evidence of robustness.

## Responsive comparison
Narrow recomposition must preserve the comparison task, using explicit Before/After labels, repeated field labels, bounded tabular overflow when simultaneous comparison is essential, or paired record projections. CSS visual reordering must not conflict with source, reading, or focus order.

## Progressive disclosure and overview
Disclosure may hide secondary detail but not information required to recognize consequential state, understand scope/uncertainty, discover unresolved work, identify recovery, or determine that further verification is required. Applications decide what is consequential.

## Adaptive presentation boundary
Presentation may adapt density, measure, spacing, layout, contrast emphasis, motion, or other non-semantic properties only when adaptation is inspectable, user-selected adaptation is reversible, semantic meaning/legal actions/programmatic state are unchanged, and DOM/reading/focus order remains valid.

A diagnosis or demographic category must not silently select a semantic mode. Prefer measured need or explicit user choice.

## Evidence and completion
Passing this contract demonstrates survival of defined engineering screens. It does not prove universal human performance, clinical benefit, preference, or independent empirical validation.

Consequential UI handoff records the Visual Engineering context/source commit, principles applied, screens performed, material deviations, unresolved evidence questions, and authoritative semantic-state source when not obvious.

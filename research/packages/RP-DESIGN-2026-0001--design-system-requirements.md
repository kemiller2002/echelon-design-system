---
id: RP-DESIGN-2026-0001
title: Echelon Design System requirements research
research_area: design-system
discipline:
  - software-engineering
  - accessibility
  - interaction-design
author_agent: chatgpt
version: 1.0.0
confidence: high
completion: complete
priority: high
created: 2026-09-22
updated: 2026-09-22
related_projects:
  - echelon-design-system
related_documents:
  - requirements/DESIGN-SYSTEM-REQUIREMENTS.md
  - requirements/COMPONENT-CATALOG.md
  - requirements/MOTION-AND-INTERACTION.md
  - requirements/ACCESSIBILITY-AND-INCLUSIVE-DESIGN.md
  - requirements/ORDO-LIMEN-INTEGRATION.md
supersedes: []
superseded_by: []
tags: [design-system, web-components, accessibility, motion, requirements]
keywords: [web-components, custom-elements, accessibility, wcag, aria, motion, components]
---

# Research State Snapshot

- **Theory version:** none
- **Knowledge-base version:** requirements pass 1
- **Highest-confidence areas:** native-first architecture, accessibility baseline, component accessibility contracts
- **Lowest-confidence areas:** value of Ordo-style internal state modeling for reusable UI components
- **Largest remaining unknown:** whether explicit state modeling provides enough benefit inside complex UI components to justify its cost
- **Active research streams:** implementation pilot
- **Recently invalidated ideas:** none
- **Priority changes:** advanced components are explicitly in scope when reuse justifies them

# Executive Summary

A standards-first design-system architecture is appropriate for Echelon applications.

The recommended architecture uses semantic HTML and CSS for simple foundations and standards-based Web Components for composite or behavior-rich controls. Accessibility, motion, communication, and state boundaries are part of the component contract rather than application-specific polish.

The requirements deliberately include advanced reusable components such as switches, sliders, multi-range sliders, segmented controls, command palettes, data grids, resizable panes, date/range pickers, coachmarks, reorderable lists, and advanced overlays. They also explicitly reject turning every native element into a custom element or building large specialized engines without application evidence.

# Original Objective

Define a deep, durable set of requirements for a polished Echelon-wide design system, including advanced components and high-quality motion/microinteraction behavior.

# Scope

Included:

- web-platform architecture;
- design tokens and foundations;
- advanced component inventory;
- motion;
- accessibility;
- Ordo/Limen boundaries;
- packaging/testing;
- pilot plan.

Excluded:

- implementation;
- final visual style;
- full component API design;
- validation of a complete component library.

# Repository Context

The repository is a new greenfield design-system project operating under ROS, SDE/Ordo, Visual Engineering, and Communication Engineering.

# Current Understanding

## Native first

Native HTML should remain the authority where browsers already provide correct semantics and behavior.

Evidence: EV-DESIGN-2026-0003.

## Web Components for difficult reusable behavior

Custom Elements provide a browser-native, framework-independent mechanism for reusable controls. Shadow DOM is useful but should be selective rather than automatic.

Evidence: EV-DESIGN-2026-0003.

## Accessibility is architecture

WCAG 2.2 and WAI-ARIA APG make keyboard, pointer alternatives, focus, name/role/value, and interaction semantics part of correctness for advanced controls.

Evidence: EV-DESIGN-2026-0001, EV-DESIGN-2026-0002.

## Modern browser APIs reduce custom infrastructure

Popover, anchor positioning, and View Transitions can reduce custom overlay and animation plumbing when used with feature detection and fallbacks.

Evidence: EV-DESIGN-2026-0004.

## Advanced components are appropriate

Mature design systems centralize difficult interaction patterns rather than stopping at primitive styling.

Evidence: EV-DESIGN-2026-0005.

# Key Discoveries

1. The correct abstraction is a design system, not merely a Web Component library.
2. Components should be selected by behavioral complexity and reuse value.
3. Motion must have a token system and a reduced-motion contract.
4. Direct manipulation must not be decorative or lag behind pointer state.
5. Drag-based interactions require non-drag alternatives.
6. Advanced controls such as slider, data grid, split pane, and date range picker require explicit keyboard models.
7. Domain-state legality belongs outside the component layer.
8. Unknown external outcomes must remain distinguishable from ordinary failure.
9. Limen should integrate through standard browser events/properties.
10. The first pilot should include both simple and difficult interaction components.

# Evidence Registry

- EV-DESIGN-2026-0001: WCAG 2.2 interaction accessibility baseline.
- EV-DESIGN-2026-0002: WAI-ARIA APG widget patterns.
- EV-DESIGN-2026-0003: Web Components platform.
- EV-DESIGN-2026-0004: modern overlay and motion browser capabilities.
- EV-DESIGN-2026-0005: mature design-system component scope.

# Hypothesis Registry

No accepted hypothesis record yet.

Pilot hypothesis to test:

Explicit Ordo-style state modeling will reduce illegal state combinations and clarify event contracts in sufficiently complex components, but will impose unnecessary overhead in simple controls.

# Failed Assumptions

No material failed assumption was recorded during this pass.

# Open Questions

- Should the implementation source be primarily F#, TypeScript, or a small combination while publishing only standards-based browser artifacts?
- Which browser baseline should define the first stable release?
- Does explicit state modeling materially improve complex component maintenance?
- Which application should be the first real consumer after the isolated pilot?
- What exact visual identity should be derived from the current Echelon Foundry site?

# Recommended Next Research

1. Build the pilot in requirements/PILOT-PLAN.md.
2. Compare ordinary versus explicit state modeling in ef-slider and one more complex component.
3. Run accessibility verification with real browsers and assistive-technology-oriented inspection.
4. Measure bundle/runtime impact.
5. Use a real Echelon application as the first integration trial.

# Research Backlog

- browser support baseline;
- token derivation from Echelon Foundry brand;
- forced-colors design;
- advanced grid accessibility;
- virtualization accessibility;
- date-picker locale behavior;
- cross-framework Custom Element interoperability;
- print token bridge to echelon-print-components.

# Suggested Specialized Research Agents

- accessibility validation;
- browser compatibility;
- motion/performance;
- data-grid interaction;
- token/color/typography.

# Parallel Research Opportunities

Browser compatibility, visual token derivation, and accessibility prototype testing can proceed in parallel once the pilot skeleton exists.

# Risks

- component catalog grows faster than real application demand;
- advanced controls become mini-frameworks;
- Shadow DOM blocks legitimate customization;
- animation adds latency instead of polish;
- accessibility is tested only automatically;
- framework interoperability is assumed rather than proven;
- design-system state accidentally absorbs domain authority.

# Cross-Discipline Opportunities

- Visual Engineering can govern token and interaction evidence.
- Communication Engineering can govern labels, feedback, warnings, help, and error recovery.
- Ordo can provide a testable model for complex component state without owning all component behavior.
- Limen can demonstrate clean browser-boundary integration.

# Knowledge Relationships

The requirements documents are derived outputs from this evidence pass. They should evolve with implementation evidence rather than remain frozen as speculative scope.

# Theory Impact Assessment

## Affected theory records

None yet.

## Affected engineering principles

- native-first;
- standards-first;
- explicit state where complexity warrants;
- accessibility as correctness;
- progressive enhancement.

## New principle candidates

- A design-system component earns its abstraction by centralizing difficult reusable behavior, not by renaming HTML.
- Motion should communicate state but never become state authority.

## Deprecated principles

None.

## Confidence changes

High confidence in the layered architecture and accessibility baseline. Medium confidence in the full P2 catalog until consuming applications prove demand.

## Predictions created

- A well-tested slider/switch/popover pilot will expose the majority of architectural boundary problems before the first heavy data component.
- Selective Shadow DOM will produce fewer integration problems than universal Shadow DOM.

## Predictions invalidated

None.

## Required theory-registry updates

None until experiments produce outcome evidence.

# Research Quality Metrics

- **Primary sources:** 2
- **Independent sources:** 5 evidence records across W3C/WAI, MDN, IBM Carbon, Adobe Spectrum
- **Counterexamples reviewed:** Shadow DOM and catalog-size drawbacks considered
- **Competing viewpoints reviewed:** native-only versus component abstraction; universal versus selective Shadow DOM
- **Hypotheses tested:** 0
- **Failed hypotheses:** 0
- **Research completeness:** sufficient for requirements and pilot, not final implementation architecture
- **Confidence gain:** high for first-pass requirements
- **Open questions reduced:** architecture and component scope substantially narrowed

# Research Debt

- **Missing evidence:** implementation outcome data
- **Missing experiments:** pilot
- **Missing disciplines:** deeper assistive-technology empirical testing
- **Weak areas:** virtualization and complex grid accessibility
- **Replication needed:** browser/platform support at implementation time
- **Tool limitations:** no live component implementation existed to test
- **Assumptions awaiting evidence:** internal Ordo-style state modeling benefit

# Repository Updates

The requirements directory, project charter, architecture, and current-state documents were updated.

# Website Updates

None.

# AI Consumption Notes

Agents should read requirements/README.md first, then the specific requirement document relevant to the component being changed.

P2 and P3 catalog entries are not automatic implementation authorization.

# Handoff Instructions

Next work should create the semantic map and feature manifests for the pilot, then implement the smallest vertical component slice.

# Research Journal

2026-09-22: Reviewed web platform, W3C accessibility patterns, and mature design-system component scope. Converted findings into requirements with explicit boundaries and pilot criteria.

# Appendix

Canonical requirement documents live under requirements/.

# Completion Checklist

- [x] Required metadata is complete.
- [x] Important claims reference evidence IDs.
- [x] Competing explanations were considered.
- [x] Failed assumptions were recorded.
- [x] Theory impacts were assessed.
- [x] Research debt was recorded.
- [ ] Registries were updated by ROS.
- [x] The next agent can continue without conversational context.

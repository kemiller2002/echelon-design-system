# Layout Catalog and Composition Requirements

## Purpose

Forma shall maintain a catalog of reusable layout relationships derived from Visual Engineering evidence. The catalog is not a gallery of screenshots. Each entry records the semantic and perceptual relationships that make a composition useful and whether Forma can reproduce them without product-specific CSS.

## Source model

The initial model is derived from the Visual Engineering Composition Science genome and Design Library research. Relevant dimensions include spatial organization, hierarchy, structure, navigation, interaction, density, perceptual separation, landmarks, and first-glance versus deliberate verification.

## Catalog entry contract

Every cataloged layout shall record:

- family and intended tasks;
- semantic regions and authoritative source order;
- primary recognition path and deliberate-verification regions;
- grouping, alignment, proximity, enclosure, and separation relationships;
- density posture;
- navigation landmarks and decision points;
- wide-layout relationships;
- explicit narrow-layout recomposition;
- relationships that must survive recomposition;
- long, missing, extreme, and localized content behavior;
- keyboard, reading, focus, and visual order expectations;
- required Forma primitives and higher-level patterns;
- capability gaps;
- verification evidence and unresolved assumptions.

A layout is **supported** only when its meaningful relationships can be reproduced with Forma's public contracts and verified under required responsive and accessibility conditions.

## Abstraction rule

Do not create a custom component merely because a layout recurs visually. Prefer CSS composition primitives for contextual relationships among independent children. Promote a relationship into a semantic composite only when repeated evidence shows durable semantics or bounded behavior.

Components own intrinsic layout required by their semantics or interaction. Parent compositions own external spacing, placement, width, sibling relationships, and page-level arrangement.

## Initial composition vocabulary

Forma shall provide CSS-first, zero-runtime primitives for:

- **stack**: vertical flow with consistent relational spacing;
- **cluster**: wrapping inline grouping for related controls, labels, or metadata;
- **sidebar**: a bounded secondary region paired with a flexible primary region, recomposing without source-order changes;
- **frame**: proportion-constrained media/content region;
- **measure**: readable inline measure independent of placement;
- existing **dashboard-grid** for repeated analytical summaries;
- existing **master-detail** for selection plus detail workspaces.

Future candidates shall be added from observed layouts only when existing primitives cannot express the required relationship.

## Capability-gap workflow

When a layout cannot be reproduced:

1. Record the failed relationship, not just the visual difference.
2. Determine whether the gap is presentation, semantic structure, intrinsic behavior, or product-specific behavior.
3. Prefer a CSS composition primitive for presentation relationships.
4. Prefer native HTML for existing semantics and behavior.
5. Add a Forma semantic composite only when the relationship is durable across contexts.
6. Keep application/Limen behavior outside Forma when it requires domain state or non-native interaction.
7. Add verification before marking the layout supported.
8. Reproduce the original layout using only public Forma contracts.

## Verification

Every composition primitive shall be checked for:

- containment at 320px and 390px;
- no page-level horizontal overflow;
- long and localized content;
- 200% text scaling;
- semantic source order preserved through recomposition;
- keyboard/focus order matching reading order;
- forced colors and reduced motion where applicable;
- meaningful grouping when borders, hue, or another nonessential cue is removed.

Higher-level catalog layouts additionally require first-glance hierarchy inspection and deliberate verification of consequential information.

## Initial Visual Engineering gaps

The first comparison found that Forma already contains specialized dashboard-grid and master-detail patterns, but lacks the lower-level composition primitives named by the Design Library research: stack, cluster, sidebar, frame, and content measure. These primitives are therefore the first capability expansion.

Spacing values remain contextual. Visual Engineering rejects a universal perceptual spacing constant; Forma's primitives provide defaults and controlled composition variables rather than claiming a universally optimal gap.

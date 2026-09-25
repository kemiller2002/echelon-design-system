# Layout density contract

Visual Engineering does not support a universal pixel gap or element-count threshold for perceptual density. Forma therefore treats density as a contextual contract rather than a component.

## Postures

- **relaxed**: reading, learning, unfamiliar workflows, or low-frequency tasks where separation and orientation dominate.
- **standard**: ordinary mixed application work.
- **compact**: repeated expert work where more simultaneous information materially improves the task.
- **analytical**: comparison and monitoring where preserving relationships can justify bounded density and contained scrolling.

A density posture may change spacing and information exposure but may not change semantics, authority, source order, accessible relationships, minimum usable targets, or state meaning.

## Required checks

Dense layouts must test target-background competition, grouping ambiguity, exception salience, long values, 200% text scaling, 320px reflow, keyboard reachability, and whether removing color or borders destroys grouping.

Density is not measured by raw element count alone. Review should consider feature congestion, local variability, similarity, grouping, task, viewing time, and observer capability.

Do not claim a density posture is perceptually optimal without evidence for the actual task and population.

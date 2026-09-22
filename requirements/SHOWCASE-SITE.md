# Forma Component Showcase Site Requirements

Status: implementation baseline.

## Purpose

Provide a public Forma site for the Echelon Foundry design system that explains and demonstrates every canonical component while remaining coupled to the actual package source.

## Requirements

### SHOW-001 — Echelon Foundry visual language

Forma must use the established Echelon Foundry visual language, including:

- parchment, charcoal, forged iron, oxide bronze, verdigris, graphite, and stone roles through design-system tokens;
- Newsreader display typography;
- Manrope interface/body typography;
- IBM Plex Mono technical metadata;
- grid texture;
- restrained borders and rectangular surfaces;
- sticky application header;
- clear focus treatment;
- restrained motion with reduced-motion support.

The site must consume the design system's generated CSS rather than duplicating component token values.

### SHOW-002 — One canonical pattern per page

Every canonical `patterns/*.html` file must have exactly one corresponding component page.

The generator must fail when a canonical pattern has no showcase metadata.

### SHOW-003 — Three examples minimum

Every component page must contain at least three live examples.

The baseline examples are:

1. canonical/default context;
2. state/context demonstration;
3. narrow composition.

Examples must be generated from the canonical pattern markup, not separately hand-maintained copies.

### SHOW-004 — Source visibility

Every example must expose the HTML used to render it.

IDs and form names must be namespaced per example so multiple examples can coexist without invalid duplicate references or cross-example form grouping.

### SHOW-005 — Zero runtime

The published showcase must contain no browser JavaScript.

Build-time Node tooling is permitted.

The site must not add JavaScript to canonical components.

### SHOW-006 — Responsive and accessible documentation

The documentation shell must support:

- keyboard navigation;
- skip link;
- visible focus;
- reflow on narrow screens;
- reduced motion;
- forced colors;
- semantic headings/navigation;
- component examples using the canonical accessibility contracts.

### SHOW-007 — GitHub Pages

The repository must include a GitHub Pages deployment workflow that:

1. checks out `main`;
2. restores the F# token compiler;
3. builds the design-system package;
4. builds the showcase;
5. validates showcase completeness;
6. uploads `site-dist/`;
7. deploys through the GitHub Pages deployment action.

All internal site links and assets must work when hosted under a project Pages path, not only at domain root.

### SHOW-008 — Agent guidance

The repository must include explicit agent instructions covering:

- component discovery;
- CSS imports;
- canonical markup usage;
- native-first semantics;
- Ordo/application authority;
- Limen behavior boundary;
- zero-runtime rule;
- accessibility preservation;
- new-pattern showcase obligations;
- validation commands.

The root `AGENTS.md` and GitHub Copilot entry point must route agents to the design-system usage contract.

### SHOW-009 — Generated-output boundary

`site-dist/` is generated output.

It must be ignored by git and must never be edited manually.

### SHOW-010 — CI enforcement

Pull-request validation must build and test the showcase.

Tests must verify:

- page coverage for all canonical patterns;
- at least three examples per page;
- agent instructions page exists;
- component manifest count matches canonical patterns;
- no `<script>` tags exist in generated HTML.

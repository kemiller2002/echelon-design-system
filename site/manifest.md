# Feature Manifest — Component Showcase Site

## Purpose

Generate and publish a static Echelon Foundry site that explains and demonstrates every canonical design-system pattern.

## Ownership

- canonical component semantics: `patterns/*.html`
- showcase metadata and static page generation: `site/build-site.mjs`
- documentation shell styling: `site/assets/site.css`
- generated output: `site-dist/`
- application/domain authority: none
- browser runtime: none

## Interfaces

Inbound:

- `patterns/*.html`
- built design-system CSS in `dist/`
- showcase metadata
- agent usage contract

Outbound:

- static HTML component pages
- static CSS/assets
- `showcase-manifest.json`
- GitHub Pages artifact

## Invariants

- one page per canonical pattern;
- at least three examples per page;
- examples derive from canonical markup;
- IDs and form names are namespaced per example;
- no browser JavaScript;
- project-relative internal links;
- generated output is not hand-edited or committed;
- new canonical patterns require showcase metadata.

## Verification

- `npm run site:build:only`
- `npm run site:test`
- PR design-system validation
- GitHub Pages build validation

## Modification boundaries

Normal:

- `site/**`
- `requirements/SHOWCASE-SITE.md`
- `docs/agents/DESIGN-SYSTEM-USAGE.md`
- showcase tests and workflows

Escalation required:

- browser JavaScript in the published site;
- independent hand-maintained component examples;
- making the showcase a second canonical component source;
- framework runtime dependency for documentation.

## Maintenance

Owner: Echelon Foundry design system.

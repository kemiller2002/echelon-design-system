# Feature Manifest — Token compiler

## Purpose

Validate the supported DTCG token subset, resolve aliases, enforce Echelon semantic constraints, and generate deterministic CSS.

## Ownership

- State, including presentation state: none
- Transitions / commands / messages: compiler pipeline in `Program.fs`
- Invariants and guards: alias resolution, cycle detection, type rendering, theme variable parity
- Capabilities / authority: generation only; token values remain owned by `tokens/echelon.tokens.json`
- Important effects and effect contracts: writes a caller-specified CSS output file

## Interfaces

- Inbound: token JSON path and output CSS path
- Outbound: deterministic CSS or non-zero failure

## Tests and verification

- Local behavior tests: `tests/TokenCompiler.Tests/`
- Boundary/contract tests: generated output checked by `npm run tokens:check`
- Integration/live verification: `npm run test:browser`

## Dependencies

- Allowed direct dependencies: .NET BCL only
- Required composition context: Design tokens

## Modification boundaries

- Normal: `tools/TokenCompiler/**`, `tests/TokenCompiler.Tests/**`
- Escalation required: expanding beyond the documented DTCG subset or changing generated public names

## Local agent instructions

- none

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-22
- Known gaps: no general-purpose DTCG resolver claim; compiler intentionally implements only repository-used types

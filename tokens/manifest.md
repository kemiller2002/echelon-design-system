# Feature Manifest — Design tokens

## Purpose

Own the canonical cross-application visual vocabulary. The JSON token source is authoritative; generated CSS is not.

## Ownership

- State, including presentation state: `tokens/echelon.tokens.json`
- Transitions / commands / messages: none — token data is declarative
- Invariants and guards: DTCG type/reference validity; semantic contrast constraints
- Capabilities / authority: token paths and theme mappings
- Important effects and effect contracts: generation to `dist/tokens.css`

## Interfaces

- Inbound: DTCG 2025.10-compatible JSON
- Outbound: CSS custom properties and theme selectors

## Tests and verification

- Local behavior tests: `dotnet test tests/TokenCompiler.Tests/`
- Boundary/contract tests: `npm run tokens:check`
- Integration/live verification: browser tests consuming generated CSS

## Dependencies

- Allowed direct dependencies: DTCG format contract; Token Compiler
- Required composition context: Foundations and component CSS consume semantic tokens

## Modification boundaries

- Normal: `tokens/**`, token compiler tests when representation changes
- Escalation required: changing public semantic token names or theme meaning

## Local agent instructions

- none — repository AGENTS.md and this manifest are sufficient

## Maintenance

- Owner: Echelon Foundry design system
- Last checked against implementation: 2026-09-22
- Known gaps: font delivery strategy remains separate from font-family token selection

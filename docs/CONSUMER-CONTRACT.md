# Consumer integration contract

The design-system repository owns semantic design contracts and their schemas, not runtime UI components. Forma implements typed F# theme access and CSS variables; Forma Studio demonstrates them; Folio maps shared semantics to print-specific values; Percepta supplies applicable experience contracts; Dokimos aggregates compliance evidence; Conditor pins approved releases.

Consumers must pin immutable tagged releases and verify artifact integrity. Never fetch the moving main branch at build time. Do not duplicate authoritative values across projects. A provisional draft is not an approved release. Each consumer records contract version, adapter version, tested modes, exceptions, and verification revision.

Migration: audit existing styling, pin approved contract, adopt Forma components, test responsive and accessible states, capture visual regressions, then migrate in waves. Do not claim application compliance without evidence.

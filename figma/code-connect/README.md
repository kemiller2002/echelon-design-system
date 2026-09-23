# Code Connect templates

This directory contains Figma Code Connect template files for published Forma
library components.

Do not create placeholder templates with invented Figma URLs. Generate a
template from a real published component:

```bash
npx figma connect create "FIGMA_COMPONENT_URL" --outDir figma/code-connect
```

Then replace the generated example with canonical Forma HTML from
`patterns/*.html`, preview the relevant property combinations, and publish
only after review.

See `docs/FIGMA.md` and `requirements/FIGMA-INTEGRATION.md`.

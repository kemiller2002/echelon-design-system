# Consuming Forma

Forma is the zero-runtime Echelon Foundry presentation package.

## Canonical version

The current application baseline is **Forma 0.2.0**.

Applications must pin a concrete Forma version. Do not copy CSS files into an
application and do not depend on the moving repository branch.

The release artifact is produced by the repository release workflow and
attached to the matching GitHub release. Until npm Trusted Publishing is
configured for this package, the canonical dependency form is the immutable
GitHub release tarball:

```json
{
  "dependencies": {
    "@echelon-foundry/design-system": "https://github.com/kemiller2002/echelon-design-system/releases/download/v0.2.0/echelon-foundry-design-system-0.2.0.tgz"
  }
}
```

When the npm package is published, applications may replace the tarball URL
with the exact version `0.2.0`. Do not use a floating range for the application
baseline.

## CSS

Most applications should load the complete presentation surface:

```css
@import "@echelon-foundry/design-system/all.css";
```

More selective imports are available:

- `@echelon-foundry/design-system/tokens.css`
- `@echelon-foundry/design-system/foundations.css`
- `@echelon-foundry/design-system/components.css`
- `@echelon-foundry/design-system/assessment.css`
- `@echelon-foundry/design-system/skins.css`
- `@echelon-foundry/design-system/brands/<brand-id>.css`

Canonical HTML patterns are exported under `patterns/*` and documented at
https://forma.echelonfoundry.com/.


## Component authoring tags

Consumer markup should use the documented inert `<ef-*>` wrapper around the
canonical pattern. The tag is `ef-` plus the pattern slug.

```html
<ef-dialog class="ef-component-tag">
  <button type="button" commandfor="confirm-dialog" command="show-modal">Open</button>
  <dialog class="ef-dialog" id="confirm-dialog" aria-labelledby="confirm-title">
    <div class="ef-dialog__body">
      <h2 id="confirm-title">Confirm action</h2>
    </div>
  </dialog>
</ef-dialog>
```

The wrapper has no runtime registration or lifecycle. Do not call
`customElements.define()` for Forma tags. Native HTML inside the wrapper
remains the semantic and interaction authority; Limen supplies behavior beyond
the browser-native baseline.

## Branding and skins

White-label identity is supplied through a versioned Brand Manifest and compiled
to static scoped CSS. Load a generated brand stylesheet after Forma and apply
`data-ef-brand="<brand-id>"` at the document root or on a subtree.

Presentation-only skins use `data-ef-skin="compact"`,
`data-ef-skin="comfortable"`, or `data-ef-skin="square"`.

Do not copy or fork Forma CSS for customer branding. See
`docs/BRANDING.md` for the manifest, scoping, theme, accessibility, and Limen
boundary contracts.

## Ownership boundary

Forma owns semantic HTML contracts, CSS, design tokens, responsive
recomposition, accessibility presentation, and non-color state cues.

The consuming application owns labels, content, application state, data,
routing, asynchronous behavior, and domain-specific meaning.

Limen owns browser/application interaction beyond native HTML.

Ordo/application state owns legal transitions, capabilities, obligations,
permissions, scoring, and domain invariants.

## Mobile

Every canonical pattern has an explicit 320px presentation. Applications must
not fork the pattern solely to make a phone layout. If an application exposes a
new responsive need, record the gap in Forma and improve the shared contract.

## Upgrade rule

A Forma version change is an explicit application dependency change:

1. update the pinned version;
2. run the application's build and browser/accessibility tests;
3. inspect any changed canonical pattern used by the application;
4. record material migration decisions through ROS.

Do not silently track Forma `main`.

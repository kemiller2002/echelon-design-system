# Forma Branding and Skinning

Forma treats branding and skinning as separate presentation contracts.

- A **brand** changes identity and brand-level design tokens.
- A **skin** changes presentation density/shape without changing identity.
- Neither contract owns application behavior or domain state.

## Brand Manifest

Create a JSON manifest that conforms to `schemas/brand-manifest.schema.json`.
Repository-owned manifests live in `brands/*.brand.json`.

A manifest contains a stable brand ID, identity metadata, optional typography
and shape values, complete light/dark semantic colors, and optional application
terminology.

The manifest is data. Do not place CSS, script, credentials, or executable
configuration in it.

## Build

Compile all repository brand manifests with:

```bash
npm run brands:build
```

The F# compiler writes static files to:

```text
dist/brands/<brand-id>.css
dist/brands/index.json
```

Invalid six-digit colors, unsafe font values, invalid dimensions, unsupported
schema versions, or insufficient required contrast fail the build.

## Load and apply a brand

Load Forma first, then the desired generated brand CSS:

```html
<link rel="stylesheet" href="/forma/all.css">
<link rel="stylesheet" href="/forma/brands/acme.css">
```

Apply the brand at the document root:

```html
<html data-ef-brand="acme">
```

or to a subtree:

```html
<section data-ef-brand="acme">
  <!-- canonical Forma markup -->
</section>
```

Because brands override the same documented `--ef-*` variables consumed by
Forma, canonical component markup does not change.

Multiple brand scopes can coexist on one page. This is useful for previews,
embedded products, partner portals, accessibility comparison, and design-system
testing.

## Themes

Forma still uses `data-ef-theme="light"` and `data-ef-theme="dark"`.
The brand compiler emits both semantic maps and also honors operating-system dark
preference when an explicit theme is absent.

```html
<section data-ef-brand="acme" data-ef-theme="dark">
  ...
</section>
```

Theme selection or persistence at runtime belongs to the consuming application,
normally through Limen. Forma only supplies the static presentation contract.

## Skins

`dist/skins.css` defines the initial zero-runtime skin presets:

- `compact`
- `comfortable`
- `square`

Use a skin independently of brand:

```html
<main data-ef-brand="acme" data-ef-skin="compact">
  ...
</main>
```

A skin must not change labels, identity, permissions, workflow, validation,
scoring, or domain state.

## Terminology and assets

Brand terminology and identity assets are intentionally not converted into CSS.
Applications/build tooling consume those fields because they affect content and
metadata rather than component presentation.

This keeps a strong boundary:

```text
Brand Manifest
  ├─ identity / assets / terms -> application/build adapters
  └─ presentation             -> BrandCompiler -> scoped CSS variables

Skin
  └─ presentation only        -> skins.css

Application / Limen
  └─ runtime selection, persistence, remote loading, preview behavior

Ordo / domain
  └─ legal state and transitions
```

## Accessibility

The brand compiler currently validates the relationships that are most likely to
make a branded interface unreadable: primary and secondary text, text on
secondary surfaces, inverse text, primary/secondary accents, and focus rings.

A failed brand does not get a best-effort output. Fix the manifest and compile
again.

Forced-colors behavior and non-color state cues remain part of Forma's existing
component accessibility contract.

## White-labeling rules for applications

Applications should not fork Forma component CSS just to implement customer
branding. Add or update a Brand Manifest and consume its generated CSS.

Arbitrary customer CSS is not the supported extension mechanism. Internal
component structure is not a theming API.

If a required presentation concept cannot be expressed through the current
manifest/token contract, record the gap in Forma and extend the public contract
deliberately.

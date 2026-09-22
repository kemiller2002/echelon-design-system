import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const patternsDir = path.join(root, "patterns");
const distDir = path.join(root, "dist");
const outDir = path.join(root, "site-dist");

const meta = {
  "allocation": { title: "Allocation", category: "Assessment", description: "Direct numeric allocation with an explicit aggregate total and a non-drag interaction path.", boundary: "Limen owns total calculation and validation." },
  "best-worst": { title: "Best–Worst", category: "Assessment", description: "Choose one best and one worst option from the same finite set.", boundary: "Limen enforces cross-column exclusion." },
  "binary-choice": { title: "Binary Choice", category: "Selection", description: "Radio-backed binary or bounded three-way selection that can preserve an unanswered state.", boundary: "Native selection; application owns answer meaning." },
  "choice-group": { title: "Choice Group", category: "Selection", description: "Reusable radio or checkbox choices with primary and supporting text.", boundary: "Native selection; application owns meaning and scoring." },
  "dialog": { title: "Dialog", category: "Overlay", description: "Native modal dialog presentation using browser dialog semantics.", boundary: "Native dialog where possible; application owns domain action." },
  "disclosure": { title: "Disclosure", category: "Content", description: "Progressive disclosure using native details and summary.", boundary: "Native browser state." },
  "hierarchical-choice": { title: "Hierarchical Choice", category: "Selection", description: "Single-choice hierarchy using disclosure and stable option identities.", boundary: "Application owns parent, child, and cascade semantics." },
  "hierarchical-multi-choice": { title: "Hierarchical Multi-choice", category: "Selection", description: "Multi-choice hierarchy with explicit application-owned parent/descendant policy.", boundary: "Limen/application owns hierarchy semantics." },
  "image-choice": { title: "Image Choice", category: "Selection", description: "Choice-card variant with visual media and equivalent visible text.", boundary: "Images reinforce meaning but never replace text." },
  "matrix-single": { title: "Matrix", category: "Assessment", description: "Responsive repeated-question matrix that decomposes to ordinary row controls.", boundary: "Rows remain independent primitive answers." },
  "multi-choice": { title: "Multi-choice", category: "Selection", description: "Checkbox selection with count guidance and exclusive-option presentation.", boundary: "Limen owns cardinality and exclusion enforcement." },
  "numeric-stepper": { title: "Numeric Stepper", category: "Input", description: "Bounded numeric input built on the native number control.", boundary: "Native input; application owns interpretation." },
  "obligation-panel": { title: "Obligation Panel", category: "Workflow", description: "Presentation for unresolved Ordo obligations, blockers, warnings, and recovery work.", boundary: "Ordo/application is the authority for obligations." },
  "ordinal-scale": { title: "Ordinal Scale", category: "Assessment", description: "Ordered discrete response scale for Likert, maturity, confidence, NPS-style, and related presets.", boundary: "Labels and scoring are supplied explicitly by the application." },
  "pairwise-choice": { title: "Pairwise Choice", category: "Assessment", description: "Two-option comparative choice with ordinary radio semantics.", boundary: "Native selection; application owns aggregation." },
  "popover": { title: "Popover", category: "Overlay", description: "Top-layer supplemental content using the platform popover model when supported.", boundary: "Native platform behavior with progressive enhancement." },
  "question": { title: "Question Shell", category: "Assessment", description: "Prompt, help, selector, and validation composition for assessment questions.", boundary: "Application owns applicability, branching, and scoring." },
  "range-entry": { title: "Range Entry", category: "Input", description: "Accessible paired endpoint entry for a bounded lower/upper range.", boundary: "Graphical dual-thumb interaction is an optional Limen enhancement." },
  "ranking": { title: "Ranking", category: "Assessment", description: "Ordered-list ranking with explicit keyboard-operable move controls.", boundary: "Limen owns reordering and announcements." },
  "rule-builder": { title: "Rule Builder", category: "Workflow", description: "Structured clause/group presentation for typed application expressions.", boundary: "Application owns AST, legality, validation, and execution." },
  "segmented-control": { title: "Segmented Control", category: "Selection", description: "Compact mutually-exclusive choice presentation backed by native radio semantics.", boundary: "Native selection; application owns semantic meaning." },
  "semantic-differential": { title: "Semantic Differential", category: "Assessment", description: "Bipolar ordinal scale with explicit textual endpoint meaning.", boundary: "Application owns endpoint semantics and scoring." },
  "slider": { title: "Slider", category: "Input", description: "Native bounded range input with design-system focus, spacing, and semantic accent treatment.", boundary: "Native range behavior; Limen may add richer synchronized presentation." },
  "special-choice": { title: "Special Choice", category: "Assessment", description: "Special response states such as Don't Know, Not Applicable, or Declined outside the ordinal continuum.", boundary: "Application owns the semantic distinction." },
  "survey-progress": { title: "Survey Progress", category: "Feedback", description: "Determinate progress presentation using the native progress element.", boundary: "Application supplies current value and completion semantics." },
  "switch": { title: "Switch", category: "Input", description: "Boolean setting control built on a native checkbox with switch semantics.", boundary: "Use only when an authoritative boolean already exists." },
  "symbol-rating": { title: "Symbol Rating", category: "Assessment", description: "Star/icon presentation over an ordinal response with complete textual alternatives.", boundary: "Symbol is decorative; application owns semantic labels and scoring." },
  "validation-message": { title: "Validation Message", category: "Feedback", description: "Local validation and recovery communication associated with a control or question.", boundary: "Application evaluates validity." },
  "validation-summary": { title: "Validation Summary", category: "Feedback", description: "Page- or workflow-level summary of blocking validation issues.", boundary: "Limen/application owns focus routing and recovery." }
};

const categoryOrder = ["Assessment", "Selection", "Input", "Feedback", "Overlay", "Content", "Workflow"];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function namespaceMarkup(markup, suffix, assetPrefix) {
  const ids = [];
  let value = markup.replace(/\bid="([^"]+)"/g, (_m, id) => {
    ids.push(id);
    return `id="${id}-${suffix}"`;
  });

  for (const id of ids) {
    const next = `${id}-${suffix}`;
    value = value
      .replaceAll(`for="${id}"`, `for="${next}"`)
      .replaceAll(`href="#${id}"`, `href="#${next}"`)
      .replaceAll(`popovertarget="${id}"`, `popovertarget="${next}"`)
      .replaceAll(`commandfor="${id}"`, `commandfor="${next}"`);

    for (const attr of ["aria-labelledby", "aria-describedby", "aria-controls"]) {
      value = value.replace(new RegExp(`${attr}="([^"]*)\\b${id}\\b([^"]*)"`, "g"), (_m, before, after) =>
        `${attr}="${before}${next}${after}"`
      );
    }
  }

  value = value.replace(/\bname="([^"]+)"/g, (_m, name) => `name="${name}-${suffix}"`);

  let mediaIndex = 0;
  value = value.replace(/src="\/path\/to\/[^"]+"/g, () => {
    mediaIndex += 1;
    return `src="${assetPrefix}assets/example-${mediaIndex % 2 === 0 ? "spacious" : "compact"}.svg"`;
  });

  return value;
}

function stateExample(markup) {
  let value = markup;

  if (/<input[^>]+type="radio"/i.test(value) && !/<input[^>]+type="radio"[^>]+checked/i.test(value)) {
    value = value.replace(/<input([^>]+type="radio"[^>]*)>/i, "<input$1 checked>");
  } else if (/<input[^>]+type="checkbox"/i.test(value) && !/<input[^>]+type="checkbox"[^>]+checked/i.test(value)) {
    value = value.replace(/<input([^>]+type="checkbox"[^>]*)>/i, "<input$1 checked>");
  } else if (/<details(?![^>]*\bopen\b)/i.test(value)) {
    value = value.replace(/<details/i, "<details open");
  } else if (/<dialog(?![^>]*\bopen\b)/i.test(value)) {
    value = value.replace(/<dialog/i, "<dialog open");
  } else if (/<input[^>]+type="range"/i.test(value)) {
    value = value.replace(/value="[^"]*"/i, 'value="75"');
  }

  return value;
}

function styles(prefix) {
  return `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,650&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${prefix}assets/design-system/tokens.css">
  <link rel="stylesheet" href="${prefix}assets/design-system/foundations.css">
  <link rel="stylesheet" href="${prefix}assets/design-system/components.css">
  <link rel="stylesheet" href="${prefix}assets/design-system/assessment.css">
  <link rel="stylesheet" href="${prefix}assets/site.css">`;
}

function header(prefix, current) {
  return `
  <a class="docs-skip-link" href="#main-content">Skip to main content</a>
  <header class="docs-header">
    <div class="docs-header__inner">
      <a class="docs-brand" href="${prefix}index.html">
        <span class="docs-brand__mark" aria-hidden="true">EF</span>
        <span class="docs-brand__text"><span>Echelon / Foundry</span><small>Design System</small></span>
      </a>
      <nav class="docs-nav" aria-label="Primary">
        <a href="${prefix}index.html"${current === "home" ? ' aria-current="page"' : ""}>Components</a>
        <a href="${prefix}agents/"${current === "agents" ? ' aria-current="page"' : ""}>Agent use</a>
        <a href="https://github.com/kemiller2002/echelon-design-system">GitHub</a>
      </nav>
    </div>
  </header>`;
}

function grouped(components) {
  return categoryOrder
    .map(category => [category, components.filter(item => item.category === category)])
    .filter(([_category, items]) => items.length);
}

function sidebar(prefix, components, currentSlug) {
  return `
    <aside class="docs-sidebar" aria-label="Component navigation">
      <div class="docs-sidebar__title">Component index</div>
      ${grouped(components).map(([category, items]) => `
      <div class="docs-sidebar__group">
        <h2>${category}</h2>
        <ul>
          ${items.map(item => `<li><a href="${prefix}components/${item.slug}/"${item.slug === currentSlug ? ' aria-current="page"' : ""}>${item.title}</a></li>`).join("\n")}
        </ul>
      </div>`).join("\n")}
    </aside>`;
}

function footer() {
  return `
  <footer class="docs-footer">
    <p>Echelon Foundry Design System · Zero-runtime HTML/CSS components · Ordo for meaningful state · Limen for browser behavior beyond native HTML.</p>
  </footer>`;
}

function shell({ title, description, prefix, current, components, currentSlug, content }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)} | Echelon Foundry Design System</title>
  ${styles(prefix)}
</head>
<body class="docs-site">
  ${header(prefix, current)}
  <div class="docs-layout">
    ${sidebar(prefix, components, currentSlug)}
    <main class="docs-main" id="main-content">
      ${content}
      ${footer()}
    </main>
  </div>
</body>
</html>`;
}

function sourceDetails(markup) {
  return `<details><summary>View HTML</summary><pre class="docs-code"><code>${escapeHtml(markup.trim())}</code></pre></details>`;
}

function example(title, kicker, markup, className = "") {
  return `
  <article class="docs-example" data-example>
    <header class="docs-example__header">
      <h3>${title}</h3>
      <span class="docs-example__kicker">${kicker}</span>
    </header>
    <div class="docs-example__preview ${className}">
      ${markup}
    </div>
    ${sourceDetails(markup)}
  </article>`;
}

function componentPage(component, patternMarkup, components, index) {
  const prefix = "../../";
  const canonical = namespaceMarkup(patternMarkup, `${component.slug}-canonical`, prefix);
  const stateful = namespaceMarkup(stateExample(patternMarkup), `${component.slug}-state`, prefix);
  const narrow = namespaceMarkup(patternMarkup, `${component.slug}-narrow`, prefix);
  const previous = components[index - 1];
  const next = components[index + 1];

  const content = `
    <section class="docs-hero">
      <div class="docs-eyebrow">${component.category} · canonical pattern</div>
      <h1>${component.title}</h1>
      <p class="docs-hero__lead">${component.description}</p>
      <div class="docs-meta">
        <span class="docs-tag">HTML + CSS only</span>
        <span class="docs-tag">patterns/${component.slug}.html</span>
        <span class="docs-tag">${component.boundary}</span>
      </div>
    </section>

    <section class="docs-section">
      <div class="docs-section__heading">
        <div><div class="docs-eyebrow">Usage contract</div><h2>Use the semantic pattern first.</h2></div>
        <p>Copy from the canonical pattern. Preserve labels, native control semantics, focus behavior, and the application boundary.</p>
      </div>
      <div class="docs-rules">
        <div class="docs-rule"><span class="docs-rule-label">Authority</span><p>${component.boundary}</p></div>
        <div class="docs-rule"><span class="docs-rule-label">Runtime</span><p>No JavaScript, Custom Elements, or WASM ships inside the component.</p></div>
        <div class="docs-rule"><span class="docs-rule-label">Styling</span><p>Use design tokens and public classes. Do not encode domain meaning in visual order or color.</p></div>
        <div class="docs-rule"><span class="docs-rule-label">Accessibility</span><p>Keep native names, roles, values, keyboard behavior, reflow, reduced motion, and forced-colors support intact.</p></div>
      </div>
    </section>

    <section class="docs-section">
      <div class="docs-section__heading">
        <div><div class="docs-eyebrow">Examples</div><h2>Three contexts, one contract.</h2></div>
        <p>Examples are generated from the canonical pattern so the showcase stays coupled to the shipped markup.</p>
      </div>
      ${example("Canonical", "Default context", canonical)}
      ${example("State demonstration", "Selected / open where native", stateful, "docs-example__preview--secondary")}
      ${example("Narrow composition", "28rem content frame", narrow, "docs-example__preview--narrow")}
    </section>

    <nav class="docs-prev-next" aria-label="Adjacent components">
      ${previous ? `<a href="../${previous.slug}/"><span>Previous</span><strong>${previous.title}</strong></a>` : "<span></span>"}
      ${next ? `<a href="../${next.slug}/"><span>Next</span><strong>${next.title}</strong></a>` : "<span></span>"}
    </nav>`;

  return shell({
    title: component.title,
    description: component.description,
    prefix,
    current: "components",
    components,
    currentSlug: component.slug,
    content
  });
}

function homePage(components) {
  const prefix = "./";
  const content = `
    <section class="docs-hero docs-hero--home">
      <div>
        <div class="docs-eyebrow">Echelon / Foundry · Design System</div>
        <h1>Build the interface from known parts.</h1>
        <p class="docs-hero__lead">A zero-runtime HTML and CSS component system for Echelon applications. Native browser semantics first, Ordo for meaningful state, and Limen only where behavior exceeds the platform.</p>
        <div class="docs-meta"><span class="docs-tag">${components.length} canonical patterns</span><span class="docs-tag">WCAG 2.2 AA target</span><span class="docs-tag">0-byte browser runtime</span></div>
      </div>
      <p class="docs-signal">The design system owns presentation and interaction substrate. Applications keep domain authority.</p>
    </section>

    <section class="docs-section">
      <div class="docs-section__heading">
        <div><div class="docs-eyebrow">Component catalog</div><h2>One pattern per page.</h2></div>
        <p>Every page includes at least three live examples and the exact HTML used to render them.</p>
      </div>
      ${grouped(components).map(([category, items]) => `
        <div class="docs-eyebrow" style="margin:2rem 0 .75rem">${category}</div>
        <div class="docs-component-grid">
          ${items.map(item => `<a class="docs-component-card" href="components/${item.slug}/"><span class="docs-component-card__category">${item.category}</span><h3>${item.title}</h3><p>${item.description}</p></a>`).join("\n")}
        </div>`).join("\n")}
    </section>`;

  return shell({ title: "Components", description: "Echelon Foundry zero-runtime design-system component showcase.", prefix, current: "home", components, content });
}

function agentsPage(components) {
  const prefix = "../";
  const content = `
    <section class="docs-hero">
      <div class="docs-eyebrow">Agent contract</div>
      <h1>Use the system before inventing UI.</h1>
      <p class="docs-hero__lead">These instructions apply to coding agents working in Echelon repositories. The authoritative repository document is <code>docs/agents/DESIGN-SYSTEM-USAGE.md</code>.</p>
    </section>

    <section class="docs-section">
      <div class="docs-section__heading">
        <div><div class="docs-eyebrow">Required sequence</div><h2>Agent use is explicit.</h2></div>
        <p>Do not recreate controls from screenshots or introduce application-local variants before checking this catalog.</p>
      </div>
      <ol class="docs-agent-steps">
        <li><div><strong>Identify the interaction semantics.</strong><p>Start with native HTML and find the closest canonical pattern in <code>patterns/</code> or this catalog.</p></div></li>
        <li><div><strong>Import the four public CSS layers.</strong><p>Load tokens, foundations, components, and assessment CSS. Do not copy token values into application CSS.</p></div></li>
        <li><div><strong>Copy canonical markup.</strong><p>Preserve labels, fieldsets, legends, names, roles, focus behavior, special-state separation, and direct-entry accessibility paths.</p></div></li>
        <li><div><strong>Keep authority in the application.</strong><p>Scoring, legality, applicability, completion, capabilities, obligations, persistence, and cross-control validation do not belong in the design system.</p></div></li>
        <li><div><strong>Use Limen only for missing browser behavior.</strong><p>Ranking, dual-thumb range enhancement, complex hierarchy, rule editing, and other coordinated behaviors remain outside the component package.</p></div></li>
        <li><div><strong>Do not add component JavaScript.</strong><p>The package runtime budget is zero. No Custom Elements, inline scripts, framework runtimes, or WASM ship inside canonical components.</p></div></li>
        <li><div><strong>Validate changes.</strong><p>Update browser/accessibility tests, keep this site complete, run the zero-runtime gate, and follow ROS attribution before merging.</p></div></li>
      </ol>
    </section>

    <section class="docs-section">
      <div class="docs-section__heading">
        <div><div class="docs-eyebrow">Public imports</div><h2>Use the package surface.</h2></div>
        <p>Applications may use individual layers or the combined stylesheet.</p>
      </div>
      <pre class="docs-code"><code>@import "@echelon-foundry/design-system/tokens.css";
@import "@echelon-foundry/design-system/foundations.css";
@import "@echelon-foundry/design-system/components.css";
@import "@echelon-foundry/design-system/assessment.css";</code></pre>
    </section>`;

  return shell({ title: "Agent use", description: "Explicit agent instructions for using the Echelon Foundry Design System.", prefix, current: "agents", components, content });
}

async function copyRequiredFile(source, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
}

async function main() {
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(path.join(outDir, "assets", "design-system"), { recursive: true });
  await fs.mkdir(path.join(outDir, "components"), { recursive: true });
  await fs.mkdir(path.join(outDir, "agents"), { recursive: true });

  for (const css of ["tokens.css", "foundations.css", "components.css", "assessment.css"]) {
    await copyRequiredFile(path.join(distDir, css), path.join(outDir, "assets", "design-system", css));
  }
  await copyRequiredFile(path.join(here, "assets", "site.css"), path.join(outDir, "assets", "site.css"));

  await fs.writeFile(path.join(outDir, "assets", "example-compact.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-label="Compact layout illustration"><rect width="320" height="220" fill="#e3e0d7"/><g fill="#202421"><rect x="28" y="34" width="264" height="22"/><rect x="28" y="72" width="210" height="12"/><rect x="28" y="98" width="242" height="12"/><rect x="28" y="124" width="190" height="12"/><rect x="28" y="150" width="230" height="12"/></g></svg>`);
  await fs.writeFile(path.join(outDir, "assets", "example-spacious.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" role="img" aria-label="Spacious layout illustration"><rect width="320" height="220" fill="#e3e0d7"/><g fill="#202421"><rect x="28" y="30" width="264" height="25"/><rect x="28" y="88" width="210" height="14"/><rect x="28" y="140" width="242" height="14"/></g></svg>`);

  const files = (await fs.readdir(patternsDir)).filter(file => file.endsWith(".html")).sort();
  const components = files.map(file => {
    const slug = file.replace(/\.html$/, "");
    const item = meta[slug];
    if (!item) throw new Error(`Missing showcase metadata for patterns/${file}`);
    return { slug, ...item };
  });

  const extraMeta = Object.keys(meta).filter(slug => !components.some(item => item.slug === slug));
  if (extraMeta.length) throw new Error(`Showcase metadata has no canonical pattern: ${extraMeta.join(", ")}`);

  await fs.writeFile(path.join(outDir, "index.html"), homePage(components));
  await fs.writeFile(path.join(outDir, "agents", "index.html"), agentsPage(components));

  for (let index = 0; index < components.length; index += 1) {
    const component = components[index];
    const markup = await fs.readFile(path.join(patternsDir, `${component.slug}.html`), "utf8");
    const target = path.join(outDir, "components", component.slug);
    await fs.mkdir(target, { recursive: true });
    await fs.writeFile(path.join(target, "index.html"), componentPage(component, markup, components, index));
  }

  await fs.writeFile(path.join(outDir, ".nojekyll"), "");
  await fs.writeFile(path.join(outDir, "showcase-manifest.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    componentCount: components.length,
    components: components.map(({ slug, title, category }) => ({ slug, title, category })),
    runtime: "static-html-css"
  }, null, 2));

  console.log(`Built ${components.length} component pages in site-dist/.`);
}

await main();

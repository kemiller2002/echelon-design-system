import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const patternDir = path.join(root, "patterns");
const output = path.join(root, "site-dist");

const meta = {
  "allocation": ["Allocation", "Assessment & decision", "Application / Limen", "Distribute a bounded amount across multiple choices while preserving direct numeric entry."],
  "best-worst": ["Best–Worst", "Assessment & decision", "Application / Limen", "Capture distinct strongest and weakest choices without hiding the two-selection constraint."],
  "binary-choice": ["Binary choice", "Assessment & decision", "Native HTML", "A two-option radio-backed answer that preserves Unanswered as distinct from false."],
  "choice-group": ["Choice group", "Selection", "Native HTML", "Semantic single-choice options with primary and supporting text."],
  "dialog": ["Dialog", "Overlay & disclosure", "Native HTML", "Modal presentation built on the platform dialog element and declarative commands."],
  "disclosure": ["Disclosure", "Overlay & disclosure", "Native HTML", "Expandable content built on details and summary with no runtime behavior layer."],
  "hierarchical-choice": ["Hierarchical choice", "Selection", "Native baseline / application semantics", "Nested disclosure and choice structure for hierarchy without assigning parent-child domain meaning."],
  "hierarchical-multi-choice": ["Hierarchical multi-choice", "Selection", "Application / Limen", "Multi-selection across a hierarchy with application-owned propagation and selection rules."],
  "image-choice": ["Image choice", "Selection", "Native HTML", "Choice cards that pair media with visible text while keeping the input semantic."],
  "matrix-single": ["Single-choice matrix", "Assessment & decision", "Native HTML", "Repeated single-choice scales arranged as a matrix while retaining per-row radio semantics."],
  "multi-choice": ["Multi-choice", "Selection", "Native HTML", "Checkbox-backed selection with explicit guidance for minimum, maximum, or exclusive choices."],
  "numeric-stepper": ["Numeric stepper", "Input", "Native HTML", "Bounded numeric entry using the native number input and explicit constraints."],
  "obligation-panel": ["Obligation panel", "State & feedback", "Application state", "Present unresolved work, evidence needs, and blocking status without making the design system authoritative."],
  "ordinal-scale": ["Ordinal scale", "Assessment & decision", "Native HTML", "One radio-backed contract for ordered Likert, agreement, confidence, frequency, and similar scales."],
  "pairwise-choice": ["Pairwise choice", "Assessment & decision", "Native HTML", "A focused two-alternative comparison using ordinary choice semantics."],
  "popover": ["Popover", "Overlay & disclosure", "Native HTML", "Top-layer supplemental content built on the Popover API."],
  "question": ["Question shell", "Assessment & decision", "Application content", "A stable prompt, help, selector, and validation structure for assessment questions."],
  "range-entry": ["Range entry", "Input", "Native HTML", "Direct lower/upper endpoint entry; graphical dual-thumb behavior is an optional application enhancement."],
  "ranking": ["Ranking", "Assessment & decision", "Application / Limen", "Ordered-choice presentation with non-drag movement controls and visible positions."],
  "rule-builder": ["Rule builder", "Advanced input", "Application / Limen", "Field/operator/value clauses for typed rule editing while the application owns expression semantics."],
  "segmented-control": ["Segmented control", "Selection", "Native HTML", "Radio-backed compact selection with visible selected and focus states."],
  "semantic-differential": ["Semantic differential", "Assessment & decision", "Native HTML", "A bipolar textual scale that keeps the ordered response radio-backed and explicit."],
  "slider": ["Slider", "Input", "Native HTML", "Single-value range input with accessible bounds and direct keyboard/pointer control."],
  "special-choice": ["Special choice", "Assessment & decision", "Native HTML", "Unknown, not-applicable, and other non-scale answers visually separated from the primary continuum."],
  "survey-progress": ["Survey progress", "State & feedback", "Native HTML", "Determinate progress using the native progress element plus explicit current/total text."],
  "switch": ["Switch", "Input", "Native HTML", "A checkbox-backed on/off preference control with role=switch and a visible track/thumb treatment."],
  "symbol-rating": ["Symbol rating", "Assessment & decision", "Native HTML", "Ordinal rating presented with symbols while retaining accessible textual labels."],
  "validation-message": ["Validation message", "State & feedback", "Application state", "Question-level recovery guidance with icon, text, and non-color signaling."],
  "validation-summary": ["Validation summary", "State & feedback", "Application state", "Focusable page-level error summary with links back to affected controls."],
  "alert": ["Alert", "State & feedback", "Application state", "Structured status or warning communication with text, icon, and non-color cues."],
  "collection-toolbar": ["Collection toolbar", "Data & productivity", "Application / Limen", "A responsive composition for search, filters, sort, saved views, and result counts."],
  "combobox": ["Combobox", "Input", "Native baseline / Limen enhancement", "Searchable selection baseline that preserves direct text entry and native semantics."],
  "command-palette": ["Command palette", "Navigation & commands", "Application / Limen", "Keyboard-first command discovery that can become a full-screen mobile surface."],
  "conflict-review": ["Conflict review", "State & feedback", "Ordo / application", "Explain optimistic-concurrency conflicts and expose application-supplied recovery actions without guessing."],
  "dashboard-grid": ["Dashboard grid", "Layout & workspace", "Application content", "Responsive operational dashboard composition for metrics, status, and attention-first blocks."],
  "data-grid": ["Data grid", "Data & productivity", "Application / Limen", "Semantic tabular records with sortable affordances and a labeled mobile record projection."],
  "date-range": ["Date range", "Input", "Native HTML / application", "Paired direct date entry with reusable preset affordances and mobile stacking."],
  "diff-viewer": ["Diff viewer", "Data & productivity", "Application content", "Before/after structured differences with explicit changed-field cues and stacked mobile comparison."],
  "empty-state": ["Empty state", "State & feedback", "Application content", "Explain an empty result and provide a useful recovery action without treating absence as failure."],
  "file-upload": ["File upload queue", "Input", "Native HTML / Limen", "Native file selection plus a reusable upload queue for progress, success, cancellation, failure, and unknown outcomes."],
  "master-detail": ["Master/detail workspace", "Layout & workspace", "Application / Limen", "List-and-detail composition that collapses cleanly from multi-pane desktop to mobile navigation."],
  "metric-card": ["Metric card", "Content & utility", "Application content", "A compact labeled value with context and optional action, without inventing metric meaning."],
  "mobile-action-bar": ["Mobile action bar", "Navigation & commands", "Application / Limen", "Safe-area-aware mobile action region for critical contextual actions."],
  "operation-status": ["Operation status", "State & feedback", "Ordo / application", "Present pending, confirmed, failed, conflict, unknown, reconciling, stale, blocked, unavailable, or insufficient states."],
  "pagination": ["Pagination", "Navigation & commands", "Application / Limen", "Page navigation with explicit current-page semantics and compact mobile presentation."],
  "preview-surface": ["Preview surface", "Layout & workspace", "Application content", "A bounded review surface for consequential content before an application commits or publishes it."],
  "provenance-trail": ["Provenance trail", "Data & productivity", "Application content", "Trace displayed output through source, aggregate, analysis, and presentation stages."],
  "readiness-checklist": ["Readiness checklist", "State & feedback", "Ordo / application", "Explicit complete, incomplete, and blocking prerequisites before a consequential transition."],
  "record-header": ["Record header", "Layout & workspace", "Application content", "Persistent record identity, status, context, breadcrumbs, and legal actions with mobile action collapse."],
  "search": ["Search", "Input", "Application / Limen", "Search entry, clearing, and result-count feedback with asynchronous behavior owned by the application."],
  "skeleton": ["Skeleton", "State & feedback", "Application state", "Low-information loading placeholder with explicit busy semantics and reduced-motion support."],
  "status-lozenge": ["Status lozenge", "Content & utility", "Application state", "Compact textual state labels with structural and non-color cues."],
  "tabs": ["Tabs", "Navigation & commands", "Application / Limen", "Focused views with keyboard and deep-link integration hooks plus mobile overflow strategy."],
  "timeline": ["Timeline", "Data & productivity", "Application content", "Chronological or ordered activity with timestamps, state changes, provenance, and single-column mobile flow."],
  "wizard": ["Wizard", "Navigation & commands", "Limen / Ordo", "Step-by-step workflow shell with current-step state, progress, validation hooks, resume, and mobile reduction."],
  "work-queue": ["Work queue", "State & feedback", "Ordo / application", "Attention-first list of unresolved work with reason, context, and application-supplied legal actions."]
};

const escapeHtml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function namespaceSnippet(source, prefix) {
  let html = source;
  html = html.replace(/\bid="([^"]+)"/g, (_, v) => `id="${prefix}${v}"`);
  html = html.replace(/\b(for|popovertarget|commandfor)="([^"]+)"/g, (_, a, v) => `${a}="${prefix}${v}"`);
  html = html.replace(/\b(aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g, (_, a, v) =>
    `${a}="${v.split(/\s+/).map(token => prefix + token).join(" ")}"`);
  html = html.replace(/\bhref="#([^"]+)"/g, (_, v) => `href="#${prefix}${v}"`);
  html = html.replace(/\bname="([^"]+)"/g, (_, v) => `name="${prefix}${v}"`);
  return html;
}

function representativeState(source) {
  let html = source;
  let changed = false;

  if (/<details\b(?![^>]*\bopen\b)/.test(html)) {
    html = html.replace(/<details\b/, "<details open");
    changed = true;
  } else if (/<dialog\b(?![^>]*\bopen\b)/.test(html)) {
    html = html.replace(/<dialog\b/, "<dialog open");
    changed = true;
  } else if (/type="range"/.test(html)) {
    html = html.replace(/(<input\b[^>]*type="range"[^>]*\bvalue=")([^"]*)(")/, (_, a, _v, c) => a + "75" + c);
    changed = true;
  } else if (/<progress\b/.test(html)) {
    html = html.replace(/(<progress\b[^>]*\bvalue=")([^"]*)(")/, (_, a, _v, c) => a + "70" + c);
    changed = true;
  } else if (/type="(?:checkbox|radio)"/.test(html)) {
    html = html.replace(/<input\b([^>]*type="(?:checkbox|radio)"[^>]*)>/, (match, attrs) => {
      if (/\bchecked\b/.test(attrs)) return match;
      changed = true;
      return `<input${attrs} checked>`;
    });
  } else if (/type="number"/.test(html)) {
    html = html.replace(/<input\b([^>]*type="number"[^>]*)>/, (match, attrs) => {
      if (/\bvalue=/.test(attrs)) return match;
      changed = true;
      return `<input${attrs} value="3">`;
    });
  }

  return { html, changed };
}

function header(rootPath) {
  return `<header class="site-header">
  <div class="nav-shell">
    <div class="brand">
      <a class="brand-link" href="${rootPath}">
        <span class="brand-mark" aria-hidden="true">EF</span>
        <span>Echelon / Foundry</span>
      </a>
      <span class="brand-subtitle">Forma / Interface system</span>
    </div>
    <nav class="site-nav" aria-label="Primary">
      <a href="${rootPath}">Overview</a>
      <a href="${rootPath}#components">Components</a>
      <a href="${rootPath}branding/">Branding</a>
      <a class="pill-link" href="${rootPath}agents/">Agent use</a>
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <p class="eyebrow">Echelon / Foundry</p>
      <p>Forma: semantic HTML, deliberate CSS, and explicit application boundaries.</p>
    </div>
    <div>
      <a href="https://echelonfoundry.com/">Echelon Foundry</a>
    </div>
  </div>
  <p class="footer-note">Forma design system <span>Generated from canonical component patterns.</span></p>
</footer>`;
}

function page(title, rootPath, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="Forma, the zero-runtime Echelon Foundry design system.">
  <title>${escapeHtml(title)} · Forma · Echelon Foundry</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,650&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${rootPath}assets/forma.css">
  <link rel="stylesheet" href="${rootPath}assets/brands/echelon.css">
  <link rel="stylesheet" href="${rootPath}assets/brands/example-harbor.css">
  <link rel="stylesheet" href="${rootPath}assets/site.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${header(rootPath)}
  ${body}
  ${footer()}
</body>
</html>`;
}

function mobileDocument(title, source) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} mobile preview</title>
  <link rel="stylesheet" href="../../assets/forma.css">
  <style>
    html, body { inline-size: 100%; max-inline-size: 100%; overflow-x: clip; }
    body { margin: 0; padding: 8px; }
    main { inline-size: 100%; max-inline-size: 100%; }
  </style>
</head>
<body>
  <main>${source}</main>
</body>
</html>`;
}

function nav(active) {
  return `<nav class="component-nav" aria-label="Component catalog"><div class="component-nav-inner">
  <h2>Components</h2>
  <ul>${Object.keys(meta).sort().map(slug =>
    `<li><a href="../${slug}/"${slug === active ? ' aria-current="page"' : ""}>${escapeHtml(meta[slug][0])}</a></li>`
  ).join("")}</ul>
</div></nav>`;
}

function example(number, title, note, snippet, canvasClass = "") {
  return `<section class="example-block" data-example="${number}">
  <div class="example-heading">
    <div><span class="component-kicker">Example ${number}</span><h2>${escapeHtml(title)}</h2></div>
    <p>${escapeHtml(note)}</p>
  </div>
  <div class="example-canvas ${canvasClass}">${snippet}</div>
  <details>
    <summary>View HTML</summary>
    <pre><code>${escapeHtml(snippet.trim())}</code></pre>
  </details>
</section>`;
}

function mobileExample(number, title, note, snippet) {
  return `<section class="example-block" data-example="${number}" data-mobile-example="320">
  <div class="example-heading">
    <div><span class="component-kicker">Example ${number}</span><h2>${escapeHtml(title)}</h2></div>
    <p>${escapeHtml(note)}</p>
  </div>
  <div class="example-canvas example-canvas--mobile">
    <iframe class="example-mobile-frame" title="${escapeHtml(title)} component preview" src="mobile.html" loading="lazy"></iframe>
  </div>
  <details>
    <summary>View HTML</summary>
    <pre><code>${escapeHtml(snippet.trim())}</code></pre>
  </details>
</section>`;
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, "assets"), { recursive: true });
fs.mkdirSync(path.join(output, "components"), { recursive: true });
fs.mkdirSync(path.join(output, "agents"), { recursive: true });
fs.mkdirSync(path.join(output, "branding"), { recursive: true });

if (!fs.existsSync(path.join(root, "dist", "all.css"))) {
  throw new Error("dist/all.css is missing. Run the Forma library build first.");
}

fs.copyFileSync(path.join(root, "dist", "all.css"), path.join(output, "assets", "forma.css"));
fs.copyFileSync(path.join(root, "site", "site.css"), path.join(output, "assets", "site.css"));
fs.cpSync(path.join(root, "dist", "brands"), path.join(output, "assets", "brands"), { recursive: true });
fs.writeFileSync(path.join(output, ".nojekyll"), "");

const slugs = fs.readdirSync(patternDir)
  .filter(file => file.endsWith(".html"))
  .map(file => path.basename(file, ".html"))
  .sort();

const missing = slugs.filter(slug => !meta[slug]);
const stale = Object.keys(meta).filter(slug => !slugs.includes(slug));
if (missing.length || stale.length) {
  throw new Error(`Forma site metadata mismatch. Missing: ${missing.join(", ") || "none"}; stale: ${stale.join(", ") || "none"}`);
}

const grouped = new Map();
for (const slug of slugs) {
  const category = meta[slug][1];
  if (!grouped.has(category)) grouped.set(category, []);
  grouped.get(category).push(slug);
}

const indexBody = `<main id="main">
<section class="hero">
  <div>
    <span class="eyebrow">Echelon Foundry / Interface system</span>
    <h1>Forma</h1>
    <p class="lead">A zero-runtime design system for interfaces where state, meaning, and accessibility need to remain explicit. Forma supplies semantic HTML contracts, design tokens, and CSS. Applications retain authority over behavior and domain state.</p>
  </div>
  <div class="hero-stats" aria-label="Current Forma facts">
    <div class="hero-stat"><span class="metric-label">Implemented patterns</span><strong>${slugs.length}</strong></div>
    <div class="hero-stat"><span class="metric-label">Runtime JavaScript</span><strong>0 bytes by contract</strong></div>
    <div class="hero-stat"><span class="metric-label">Rendered examples</span><strong>${slugs.length * 3}+</strong></div>
  </div>
</section>

<section class="content-section">
  <div class="section-heading">
    <div><span class="eyebrow">Operating principles</span><h2>Native first. Explicit boundaries.</h2></div>
    <p>Forma standardizes presentation without becoming a second application runtime.</p>
  </div>
  <div class="principle-grid">
    <article class="principle"><span class="category-label">01</span><h3>Semantic HTML first</h3><p>Native controls keep browser behavior, forms, keyboard interaction, and assistive-technology semantics visible.</p></article>
    <article class="principle"><span class="category-label">02</span><h3>CSS owns presentation</h3><p>Tokens, layout, state styling, responsive behavior, motion, and forced-color support live in the design system.</p></article>
    <article class="principle"><span class="category-label">03</span><h3>Applications own authority</h3><p>Limen/application code supplies non-native behavior. Ordo/domain state decides what transitions are legal.</p></article>
  </div>
</section>

<section class="content-section" id="components">
  <div class="section-heading">
    <div><span class="eyebrow">Component catalog</span><h2>One contract at a time.</h2></div>
    <p>Every implemented pattern has a dedicated page with canonical, representative-state, and explicit Mobile · 320px examples.</p>
  </div>
  ${[...grouped.entries()].map(([category, items]) => `<section class="catalog-group">
    <span class="category-label">${escapeHtml(category)}</span>
    <div class="component-grid">
      ${items.map(slug => `<article class="component-card"><a href="components/${slug}/"><h3>${escapeHtml(meta[slug][0])}</h3></a><p>${escapeHtml(meta[slug][3])}</p></article>`).join("")}
    </div>
  </section>`).join("")}
</section>

<section class="content-section">
  <div class="section-heading">
    <div><span class="eyebrow">For agents</span><h2>Use the pattern before inventing one.</h2></div>
    <a class="ef-button" href="agents/">Read the agent contract</a>
  </div>
</section>
</main>`;

fs.writeFileSync(path.join(output, "index.html"), page("Overview", "./", indexBody));

const brandSample = () => `<div class="brand-demo__content">
  <span class="brand-demo__eyebrow">Operational review</span>
  <h2>Release readiness</h2>
  <p>The same semantic Forma markup inherits identity from its nearest brand scope.</p>
  <div class="brand-demo__accent">
    <strong>12 obligations</strong>
    <span>3 require evidence before release.</span>
  </div>
  <button type="button">Review obligations</button>
</div>`;

const brandingBody = `<main id="main" class="content-section brand-lab">
  <span class="eyebrow">White label / skin system</span>
  <h1>Brand Laboratory</h1>
  <p class="lead">Brand identity enters Forma through a versioned manifest that compiles to scoped semantic tokens. Skins adjust presentation without changing identity, semantics, or application behavior.</p>

  <section class="brand-lab__section">
    <div class="section-heading">
      <div><span class="eyebrow">Scoped identity</span><h2>One component contract. Multiple brands.</h2></div>
      <p>These examples use identical inner markup. Only the brand and theme scopes differ.</p>
    </div>
    <div class="brand-demo-grid">
      <article class="brand-demo-wrap"><p class="category-label">Echelon / light</p><section class="brand-demo" data-ef-brand="echelon">${brandSample()}</section></article>
      <article class="brand-demo-wrap"><p class="category-label">Example Harbor / light</p><section class="brand-demo" data-ef-brand="example-harbor">${brandSample()}</section></article>
      <article class="brand-demo-wrap"><p class="category-label">Example Harbor / dark</p><section class="brand-demo" data-ef-brand="example-harbor" data-ef-theme="dark">${brandSample()}</section></article>
    </div>
  </section>

  <section class="brand-lab__section">
    <div class="section-heading">
      <div><span class="eyebrow">Presentation only</span><h2>Skins are independent of identity.</h2></div>
      <p>Density and shape can change while the brand's semantic color and typography remain authoritative.</p>
    </div>
    <div class="brand-demo-grid">
      <article class="brand-demo-wrap"><p class="category-label">Compact</p><section class="brand-demo" data-ef-brand="echelon" data-ef-skin="compact">${brandSample()}</section></article>
      <article class="brand-demo-wrap"><p class="category-label">Comfortable</p><section class="brand-demo" data-ef-brand="echelon" data-ef-skin="comfortable">${brandSample()}</section></article>
      <article class="brand-demo-wrap"><p class="category-label">Square</p><section class="brand-demo" data-ef-brand="echelon" data-ef-skin="square">${brandSample()}</section></article>
    </div>
  </section>

  <section class="brand-lab__section brand-boundary">
    <span class="eyebrow">Boundary</span>
    <h2>Presentation changes. Authority does not.</h2>
    <p>Runtime selection, persistence, remote manifest loading, or an interactive editor belong to the consuming application through Limen. Legal state and transitions remain Ordo/application authority. Forma emits static CSS and preserves its zero-runtime contract.</p>
    <a class="ef-button" href="../agents/">Read the agent contract</a>
  </section>
</main>`;

fs.writeFileSync(path.join(output, "branding", "index.html"), page("Brand Laboratory", "../", brandingBody));

for (const slug of slugs) {
  const [title, category, behavior, summary] = meta[slug];
  const source = fs.readFileSync(path.join(patternDir, slug + ".html"), "utf8").trim();
  const state = representativeState(source);
  const canonical = namespaceSnippet(source, `ex1-${slug}-`);
  const stateful = namespaceSnippet(state.html, `ex2-${slug}-`);
  const mobileMarkup = source;

  const body = `<div class="docs-shell">
    ${nav(slug)}
    <main class="component-main" id="main">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../../">Forma</a><span>/</span><span>${escapeHtml(title)}</span></nav>
      <header class="component-header">
        <span class="component-kicker">${escapeHtml(category)}</span>
        <h1>${escapeHtml(title)}</h1>
        <p class="lead">${escapeHtml(summary)}</p>
        <div class="contract-grid">
          <div class="contract-item"><span class="metric-label">Canonical source</span><strong>patterns/${slug}.html</strong></div>
          <div class="contract-item"><span class="metric-label">Behavior owner</span><strong>${escapeHtml(behavior)}</strong></div>
          <div class="contract-item"><span class="metric-label">Runtime inside Forma</span><strong>None</strong></div>
        </div>
      </header>

      <div class="examples">
        ${example(1, "Canonical", "Canonical repository markup, namespaced only to keep examples independent.", canonical)}
        ${example(2, state.changed ? "Representative state" : "Secondary surface", state.changed ? "A browser-native state made visible without adding a runtime." : "The same contract demonstrated on a secondary Forma surface.", stateful, "example-canvas--secondary")}
        ${mobileExample(3, "Mobile · 320px", "Rendered inside a true 320px viewport so Forma's mobile media queries execute. Semantic meaning and actions must remain available.", mobileMarkup)}
      </div>
    </main>
  </div>`;

  const dir = path.join(output, "components", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(title, "../../", body));
  fs.writeFileSync(path.join(dir, "mobile.html"), mobileDocument(title, mobileMarkup));
}

const agentBody = `<main id="main" class="content-section agent-page">
  <span class="eyebrow">Agent operating contract</span>
  <h1>Use Forma as a presentation boundary, not an application runtime.</h1>
  <p class="lead">Agents reuse canonical patterns, preserve native semantics, and leave behavioral and domain authority in the systems that own it.</p>

  <h2>Required sequence</h2>
  <ol>
    <li>Identify the user task and domain state.</li>
    <li>Find the closest canonical pattern under <code>patterns/</code>.</li>
    <li>Preserve its semantic elements, class structure, labels, IDs, and ARIA relationships.</li>
    <li>Supply application content and rendered state.</li>
    <li>Put non-native behavior in the consuming application/Limen.</li>
    <li>Keep legal transitions, permissions, obligations, and scoring in Ordo/application state.</li>
    <li>Run repository and site verification before claiming completion.</li>
  </ol>

  <h2>Boundary ownership</h2>
  <div class="table-scroll" role="region" aria-label="Boundary ownership table" tabindex="0">
    <table>
      <thead><tr><th>Concern</th><th>Owner</th></tr></thead>
      <tbody>
        <tr><td>Typography, color, spacing, layout, responsive presentation</td><td>Forma</td></tr>
        <tr><td>Checked/open/required/disabled and native state</td><td>Native HTML rendered by the application</td></tr>
        <tr><td>Async search, ranking movement, rule editing</td><td>Application / Limen</td></tr>
        <tr><td>Legal transitions, capabilities, obligations, permissions</td><td>Ordo/application domain state</td></tr>
        <tr><td>Scores and assessment interpretation</td><td>Application domain logic</td></tr>
      </tbody>
    </table>
  </div>

  <h2>Do not</h2>
  <ul>
    <li>Add runtime JavaScript or WebAssembly to Forma.</li>
    <li>Replace native HTML only to obtain a custom appearance.</li>
    <li>Create duplicate components for presets an existing semantic pattern represents.</li>
    <li>Infer domain meaning from color, order, or CSS state.</li>
    <li>Make drag, hover, pointer input, or color the only usable path.</li>
    <li>Fork a pattern in an application merely to change visual styling.</li>
  </ul>

  <h2>Mobile is part of the component contract</h2>
  <p>Every Forma pattern must recompose at 320 CSS px without changing its semantic meaning or domain authority.</p>
  <ul>
    <li>No essential page-level horizontal scrolling.</li>
    <li>No hover-only, drag-only, pointer-only, or color-only interaction.</li>
    <li>Critical actions remain reachable when layouts collapse.</li>
    <li>Side-by-side comparisons stack with explicit labels.</li>
    <li>Tables provide a usable narrow projection when ordinary columns cannot fit.</li>
    <li>Target sizes should be approximately 44×44 CSS px where practical.</li>
    <li>Deep-link and URL-backed state keeps the same meaning when its visual control changes form.</li>
    <li>Reduced-motion and forced-colors behavior still applies on mobile.</li>
  </ul>

  <h2>Build and verify</h2>
  <pre><code>npm install
npm run build
npm run check
npm run site:check
./ros registry check
./ros validate</code></pre>

  <p>The repository source of truth for this contract is <code>docs/AGENT-USAGE.md</code>.</p>
</main>`;

fs.writeFileSync(path.join(output, "agents", "index.html"), page("Agent use", "../", agentBody));

const manifest = {
  generatedAt: new Date().toISOString(),
  componentCount: slugs.length,
  exampleMinimum: 3,
  components: slugs.map(slug => ({
    slug,
    title: meta[slug][0],
    category: meta[slug][1],
    behavior: meta[slug][2],
    summary: meta[slug][3]
  }))
};
fs.writeFileSync(path.join(output, "site-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ output: "site-dist", components: slugs.length, examples: slugs.length * 3 }));

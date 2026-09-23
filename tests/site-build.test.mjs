import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const output = path.join(root, "site-dist");
const patterns = fs.readdirSync(path.join(root, "patterns"))
  .filter(file => file.endsWith(".html"))
  .map(file => path.basename(file, ".html"))
  .sort();

test("site documents every implemented Forma pattern", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "site-manifest.json"), "utf8"));
  assert.equal(manifest.componentCount, patterns.length);
  assert.deepEqual(manifest.components.map(item => item.slug).sort(), patterns);

  for (const slug of patterns) {
    assert.ok(
      fs.existsSync(path.join(output, "components", slug, "index.html")),
      `missing component page for ${slug}`
    );
  }
});

test("every component page renders at least three examples", () => {
  for (const slug of patterns) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    const count = (html.match(/data-example="/g) ?? []).length;
    assert.ok(count >= 3, `${slug} has only ${count} examples`);
  }
});

test("physics-enabled surface pages publish explicit light standard heavy examples", () => {
  const physicsSlugs = [
    "alert",
    "command-palette",
    "dialog",
    "disclosure",
    "flyout",
    "menu",
    "popover",
    "tabs",
    "toast"
  ];

  for (const slug of physicsSlugs) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    const count = (html.match(/data-example="/g) ?? []).length;

    assert.ok(count >= 4, `${slug} is missing its explicit physics example`);
    assert.match(html, new RegExp(`data-physics-motion-example="${slug}"`));
    assert.match(html, /data-motion-weight="light"/);
    assert.match(html, /data-motion-weight="standard"/);
    assert.match(html, /data-motion-weight="heavy"/);
    assert.match(html, /Motion weights/);
    assert.match(html, /presentation only/i);
  }
});

test("physics examples remain zero-runtime and namespaced", () => {
  for (const slug of ["dialog", "flyout", "menu", "popover", "toast", "command-palette"]) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    assert.equal(/<script\b/i.test(html), false);
    assert.match(html, new RegExp(`motion-${slug}-light-`));
    assert.match(html, new RegExp(`motion-${slug}-standard-`));
    assert.match(html, new RegExp(`motion-${slug}-heavy-`));
  }
});

test("published Forma documentation has no runtime script elements", () => {
  const files = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) files.push(full);
    }
  };

  walk(output);
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    assert.equal(/<script\b/i.test(html), false, `runtime script found in ${path.relative(root, file)}`);
  }
});

test("index and agent documentation are complete", () => {
  const index = fs.readFileSync(path.join(output, "index.html"), "utf8");
  for (const slug of patterns) {
    assert.match(index, new RegExp(`components/${slug}/`));
  }

  assert.ok(fs.existsSync(path.join(output, "agents", "index.html")));
  assert.ok(fs.existsSync(path.join(output, "assets", "forma.css")));
  assert.ok(fs.existsSync(path.join(output, "assets", "site.css")));
  assert.ok(fs.existsSync(path.join(output, ".nojekyll")));
});


test("site chrome preserves the canonical Echelon Foundry visual system", () => {
  const css = fs.readFileSync(path.join(output, "assets", "site.css"), "utf8");
  const index = fs.readFileSync(path.join(output, "index.html"), "utf8");

  for (const value of [
    "#202421",
    "#3a403c",
    "#f2efe7",
    "#905831",
    "#47756b",
    "#171a18",
    "#686d68",
    "#e3e0d7"
  ]) {
    assert.match(css, new RegExp(value.replace("#", "\\#"), "i"), `missing Echelon Foundry palette value ${value}`);
  }

  assert.match(css, /background-size:\s*48px\s+48px/);
  assert.match(css, /rgb\(242 239 231 \/ \.94\)/);
  assert.match(css, /backdrop-filter:\s*blur\(14px\)/);
  assert.match(index, /family=IBM\+Plex\+Mono/);
  assert.match(index, /family=Manrope/);
  assert.match(index, /family=Newsreader/);
  assert.match(index, /Forma \/ Interface system/);
});


test("every component page publishes an explicit 320px mobile example", () => {
  for (const slug of patterns) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    assert.match(html, /Mobile · 320px/, `${slug} is missing the explicit mobile example title`);
    assert.match(html, /example-canvas--mobile/, `${slug} is missing the mobile example canvas`);
    assert.match(html, /class="example-mobile-frame"/, `${slug} is missing the true mobile iframe`);
    const mobilePath = path.join(output, "components", slug, "mobile.html");
    assert.ok(fs.existsSync(mobilePath), `${slug} is missing mobile.html`);
    const mobile = fs.readFileSync(mobilePath, "utf8");
    assert.match(mobile, /width=device-width/);
    assert.equal(/<script\b/i.test(mobile), false, `runtime script found in mobile preview for ${slug}`);
  }

  const css = fs.readFileSync(path.join(output, "assets", "site.css"), "utf8");
  assert.match(css, /max-inline-size:\s*320px/);
  assert.match(css, /320px mobile viewport/);
});


test("brand laboratory proves scoped brands and skins without runtime script", () => {
  const brandPage = path.join(output, "branding", "index.html");
  assert.ok(fs.existsSync(brandPage), "missing Brand Laboratory page");

  const html = fs.readFileSync(brandPage, "utf8");
  assert.match(html, /data-ef-brand="echelon"/);
  assert.match(html, /data-ef-brand="example-harbor"/);
  assert.match(html, /data-ef-theme="dark"/);
  assert.match(html, /data-ef-skin="compact"/);
  assert.match(html, /data-ef-skin="comfortable"/);
  assert.match(html, /data-ef-skin="square"/);
  assert.equal(/<script\b/i.test(html), false);

  for (const file of ["echelon.css", "example-harbor.css", "index.json"]) {
    assert.ok(
      fs.existsSync(path.join(output, "assets", "brands", file)),
      "missing published brand artifact " + file
    );
  }
});

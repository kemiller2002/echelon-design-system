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

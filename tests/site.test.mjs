import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const patternsDir = path.join(root, "patterns");
const siteDir = path.join(root, "site-dist");

test("showcase contains one page per canonical pattern with at least three examples", async () => {
  const patterns = (await fs.readdir(patternsDir))
    .filter(file => file.endsWith(".html"))
    .map(file => file.replace(/\.html$/, ""))
    .sort();

  assert.ok(patterns.length > 0);

  for (const slug of patterns) {
    const page = await fs.readFile(path.join(siteDir, "components", slug, "index.html"), "utf8");
    const examples = page.match(/data-example/g) ?? [];
    assert.ok(examples.length >= 3, `${slug} must have at least three examples`);
    assert.match(page, new RegExp(`patterns/${slug}\\.html`));
  }
});

test("showcase publishes its component manifest and agent instructions", async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(siteDir, "showcase-manifest.json"), "utf8"));
  const patternCount = (await fs.readdir(patternsDir)).filter(file => file.endsWith(".html")).length;
  assert.equal(manifest.componentCount, patternCount);
  assert.equal(manifest.runtime, "static-html-css");

  const agentPage = await fs.readFile(path.join(siteDir, "agents", "index.html"), "utf8");
  assert.match(agentPage, /Use the system before inventing UI/);
  assert.match(agentPage, /DESIGN-SYSTEM-USAGE\.md/);
});

test("generated site ships no browser JavaScript", async () => {
  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await walk(target));
      else files.push(target);
    }
    return files;
  }

  for (const file of await walk(siteDir)) {
    if (!file.endsWith(".html")) continue;
    const html = await fs.readFile(file, "utf8");
    assert.doesNotMatch(html, /<script\b/i, `${path.relative(siteDir, file)} must remain zero-runtime`);
  }
});

test("showcase root and GitHub Pages marker exist", async () => {
  await fs.access(path.join(siteDir, "index.html"));
  await fs.access(path.join(siteDir, ".nojekyll"));
  await fs.access(path.join(siteDir, "assets", "site.css"));
  await fs.access(path.join(siteDir, "assets", "design-system", "tokens.css"));
});

import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";

test("Forma is a versioned public-consumer package", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.name, "@echelon-foundry/design-system");
  assert.equal(pkg.version, "0.1.0");
  assert.equal(pkg.private, false);
  assert.equal(pkg.publishConfig?.access, "public");

  for (const path of [
    "dist/all.css",
    "dist/tokens.css",
    "dist/foundations.css",
    "dist/components.css",
    "dist/assessment.css",
    "dist/skins.css",
    "dist/brands/echelon.css",
    "dist/brands/example-harbor.css",
    "dist/brands/index.json",
    "schemas/brand-manifest.schema.json",
    "docs/BRANDING.md",
    "patterns/search.html",
    "patterns/data-grid.html",
    "patterns/work-queue.html"
  ]) {
    assert.ok(fs.existsSync(path), `missing consumer artifact ${path}`);
  }
});

test("npm package contract contains the expected consumer surface", () => {
  const output = execFileSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { encoding: "utf8" }
  );
  const packed = JSON.parse(output)[0];
  const files = new Set(packed.files.map(file => file.path));

  for (const path of [
    "dist/all.css",
    "dist/tokens.css",
    "dist/foundations.css",
    "dist/components.css",
    "dist/assessment.css",
    "dist/skins.css",
    "dist/brands/echelon.css",
    "dist/brands/example-harbor.css",
    "dist/brands/index.json",
    "schemas/brand-manifest.schema.json",
    "docs/BRANDING.md",
    "patterns/search.html",
    "patterns/data-grid.html",
    "patterns/work-queue.html"
  ]) {
    assert.ok(files.has(path), `release package omits ${path}`);
  }
});

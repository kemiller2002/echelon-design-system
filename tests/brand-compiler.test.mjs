import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const project = "tools/BrandCompiler/BrandCompiler.fsproj";

function runCompiler(source, output) {
  return spawnSync("dotnet", ["run", "--project", project, "--", source, output], { encoding: "utf8" });
}

function copyRepositoryBrands(dir) {
  for (const file of ["echelon.brand.json", "example-harbor.brand.json"]) {
    fs.copyFileSync(path.join("brands", file), path.join(dir, file));
  }
}

test("repository brand manifests compile deterministically and remain scoped", () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "ef-brands-src-"));
  const first = fs.mkdtempSync(path.join(os.tmpdir(), "ef-brands-out-"));
  const second = fs.mkdtempSync(path.join(os.tmpdir(), "ef-brands-out-"));
  copyRepositoryBrands(source);

  const a = runCompiler(source, first);
  assert.equal(a.status, 0, a.stderr);
  const b = runCompiler(source, second);
  assert.equal(b.status, 0, b.stderr);

  for (const file of ["echelon.css", "example-harbor.css", "index.json"]) {
    assert.equal(
      fs.readFileSync(path.join(first, file), "utf8"),
      fs.readFileSync(path.join(second, file), "utf8"),
      file + " is not deterministic"
    );
  }

  const css = fs.readFileSync(path.join(first, "example-harbor.css"), "utf8");
  assert.match(css, /\[data-ef-brand="example-harbor"\]/);
  assert.match(css, /\[data-ef-theme="dark"\] \[data-ef-brand="example-harbor"\]/);
  assert.match(css, /--ef-color-accent-primary: #7a4a00/);
  assert.match(css, /--ef-primitive-radius-medium: 12px/);

  const index = JSON.parse(fs.readFileSync(path.join(first, "index.json"), "utf8"));
  assert.deepEqual(index.brands.map(item => item.id), ["echelon", "example-harbor"]);
});

test("unsafe brand contrast is rejected", () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "ef-brands-src-"));
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "ef-brands-out-"));
  const data = JSON.parse(fs.readFileSync("brands/example-harbor.brand.json", "utf8"));
  data.themes.light.color.accent.primary = "#ffffff";
  fs.writeFileSync(path.join(source, "unsafe.brand.json"), JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /light primary accent contrast/i);
});

test("unsafe font-family injection is rejected", () => {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), "ef-brands-src-"));
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "ef-brands-out-"));
  const data = JSON.parse(fs.readFileSync("brands/example-harbor.brand.json", "utf8"));
  data.presentation.fontFamily.sans = ["Arial; color: red"];
  fs.writeFileSync(path.join(source, "unsafe-font.brand.json"), JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unsafe font-family/i);
});

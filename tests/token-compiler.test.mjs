import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const project = "tools/TokenCompiler/TokenCompiler.fsproj";
const canonicalPath = path.resolve("tokens/echelon.tokens.json");

function runCompiler(source, output) {
  return spawnSync(
    "dotnet",
    ["run", "--project", project, "--", source, output],
    { encoding: "utf8" }
  );
}

test("canonical token source compiles deterministically", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-tokens-"));
  const first = path.join(dir, "first.css");
  const second = path.join(dir, "second.css");

  const a = runCompiler(canonicalPath, first);
  assert.equal(a.status, 0, a.stderr);
  const b = runCompiler(canonicalPath, second);
  assert.equal(b.status, 0, b.stderr);

  const one = fs.readFileSync(first, "utf8");
  const two = fs.readFileSync(second, "utf8");
  assert.equal(one, two);
  assert.match(one, /--ef-color-accent-primary: #905831/);
  assert.match(one, /--ef-color-text-on-secondary-surface: #3a403c/);
  assert.match(one, /--ef-primitive-motion-duration-standard: 180ms/);
});

test("unsafe dark accent pairing is rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-tokens-"));
  const source = path.join(dir, "unsafe.json");
  const output = path.join(dir, "unsafe.css");
  const data = JSON.parse(fs.readFileSync(canonicalPath, "utf8"));

  data.semantic.dark.color.accent.primary.$value = "{primitive.color.oxide-bronze}";
  fs.writeFileSync(source, JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /dark primary accent contrast/i);
});

test("circular aliases are rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ef-tokens-"));
  const source = path.join(dir, "cycle.json");
  const output = path.join(dir, "cycle.css");
  const data = JSON.parse(fs.readFileSync(canonicalPath, "utf8"));

  data.semantic.light.color.text.primary.$value = "{semantic.light.color.text.secondary}";
  data.semantic.light.color.text.secondary.$value = "{semantic.light.color.text.primary}";
  fs.writeFileSync(source, JSON.stringify(data, null, 2));

  const result = runCompiler(source, output);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /circular token reference/i);
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function filesUnder(dir) {
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...filesUnder(full));
    else output.push(full);
  }
  return output;
}

test("production distribution contains no JavaScript or WebAssembly", () => {
  const forbidden = filesUnder("dist").filter(file => /\.(?:js|mjs|cjs|wasm)$/i.test(file));
  assert.deepEqual(forbidden, []);
});

test("canonical HTML patterns contain no executable script", () => {
  for (const file of filesUnder("patterns").filter(file => file.endsWith(".html"))) {
    const content = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(content, /<script\b/i, file);
    assert.doesNotMatch(content, /javascript\s*:/i, file);
    assert.doesNotMatch(content, /\son\w+\s*=/i, file);
  }
});

test("package has no production runtime dependencies", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.dependencies, undefined);
});

test("component source is CSS and HTML only", () => {
  const componentFiles = [
    ...filesUnder("patterns"),
    ...filesUnder("src/styles")
  ];
  assert.equal(componentFiles.some(file => /\.(?:js|mjs|cjs|wasm|fs)$/i.test(file)), false);
});

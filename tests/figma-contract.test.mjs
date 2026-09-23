import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const readJson = path => JSON.parse(fs.readFileSync(path, "utf8"));

test("every canonical HTML pattern has exactly one Figma contract entry", () => {
  const contract = readJson("figma/component-contracts.json");
  const patterns = fs.readdirSync("patterns")
    .filter(name => name.endsWith(".html"))
    .map(name => `patterns/${name}`)
    .sort();
  const mapped = contract.components.map(component => component.source).sort();

  assert.deepEqual(mapped, patterns);
  assert.equal(new Set(mapped).size, mapped.length, "duplicate Figma pattern mapping");
  assert.equal(
    new Set(contract.components.map(component => component.codeConnect.id)).size,
    contract.components.length,
    "duplicate Code Connect id"
  );

  for (const component of contract.components) {
    assert.match(component.figmaName, /^Forma \/ /);
    assert.equal(component.codeConnect.nodeUrl, null);
    assert.equal(component.codeConnect.status, "requires-published-figma-component");
  }
});

test("Figma contract points to canonical Forma token source", () => {
  const contract = readJson("figma/component-contracts.json");
  assert.equal(contract.sourceOfTruth.tokens, "tokens/echelon.tokens.json");
  assert.ok(fs.existsSync(contract.sourceOfTruth.tokens));
  assert.deepEqual(contract.figma.modes, ["Light", "Dark"]);
});

test("npm exposes canonical design metadata for external tooling", () => {
  const pkg = readJson("package.json");

  assert.equal(pkg.exports["./tokens.json"], "./tokens/echelon.tokens.json");
  assert.equal(pkg.exports["./figma/components.json"], "./figma/component-contracts.json");
  assert.ok(pkg.files.includes("tokens/echelon.tokens.json"));
  assert.ok(pkg.files.includes("figma/component-contracts.json"));
});

import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "catalog", "layouts.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const patternNames = new Set(fs.readdirSync(path.join(root, "patterns")).filter(x => x.endsWith(".html")).map(x => x.replace(/\.html$/, "")));
const compositionPrimitives = new Set(["stack", "cluster", "sidebar", "frame", "measure", "split-pane", "landmark-region", "comparison-grid"]);

function doc(source) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><style>html,body{margin:0}body{padding:1rem}</style></head><body>${source}</body></html>`;
}

test("catalog references only public Forma composition contracts", () => {
  for (const family of catalog.families) {
    for (const capability of family.composition) {
      expect(patternNames.has(capability) || compositionPrimitives.has(capability), `${family.id} references missing capability ${capability}`).toBeTruthy();
    }
  }
});

test("every supported or verified family has a canonical specimen", () => {
  for (const family of catalog.families.filter(x => ["supported", "verified"].includes(x.status))) {
    const specimen = path.join(root, "catalog", "specimens", `${family.id}.html`);
    expect(fs.existsSync(specimen), `${family.id} has no specimen`).toBeTruthy();
    expect(fs.readFileSync(specimen, "utf8")).toContain(`data-layout-id="${family.id}"`);
  }
});

for (const family of catalog.families) {
  test(`${family.id} specimen preserves containment and source order`, async ({ page }) => {
    const source = fs.readFileSync(path.join(root, "catalog", "specimens", `${family.id}.html`), "utf8");
    let wideOrder;

    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(doc(source));
      const result = await page.evaluate(() => {
        const viewport = document.documentElement.clientWidth;
        const order = [...document.querySelectorAll("h1,h2,h3,a,button,label,th,td,summary,figcaption")]
          .map(el => `${el.tagName}:${(el.textContent || "").trim().replace(/\s+/g, " ")}`);
        const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > viewport + 1;
        return { order, overflow };
      });
      expect(result.overflow, `${family.id} overflows at ${width}px`).toBeFalsy();
      if (wideOrder === undefined) wideOrder = result.order;
      else expect(result.order, `${family.id} changes semantic source order at ${width}px`).toEqual(wideOrder);
    }
  });
}


for (const family of catalog.families) {
  test(`${family.id} specimen has no automatically detectable accessibility violations`, async ({ page }) => {
    const source = fs.readFileSync(path.join(root, "catalog", "specimens", `${family.id}.html`), "utf8");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.setContent(doc(source));
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

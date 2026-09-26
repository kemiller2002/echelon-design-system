import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const ids = [
  "LAY-SPATIAL-CANVAS",
  "LAY-BOARD",
  "LAY-SEARCH-RESULTS",
  "LAY-KNOWLEDGE-GRAPH",
  "LAY-SEMANTIC-ZOOM",
  "LAY-RECURSIVE-OUTLINE",
  "LAY-LIVE-OPERATIONS",
  "LAY-BIDIRECTIONAL-COMPARISON",
  "LAY-HUMAN-AGENT-HANDOFF"
];

function source(id) {
  return fs.readFileSync(path.join(root, "catalog", "specimens", id + ".html"), "utf8");
}
function doc(body, extra = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Forma composition stress specimen</title><style>${css}</style><style>html,body{margin:0}body{padding:1rem}${extra}</style></head><body>${body}</body></html>`;
}
async function pageOverflow(page) {
  return page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > document.documentElement.clientWidth + 1);
}

for (const id of ids) {
  test(`${id} survives 200% text sizing at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.setContent(doc(source(id), "html{font-size:200%}"));
    expect(await pageOverflow(page), id + " page-overflows under 200% text").toBeFalsy();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
  });

  test(`${id} survives forced colors and reduced motion`, async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.setContent(doc(source(id)));
    expect(await pageOverflow(page), id + " page-overflows in forced colors").toBeFalsy();
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations, JSON.stringify(axe.violations, null, 2)).toEqual([]);
  });
}

test("nested hard compositions contain long unbroken content", async ({ page }) => {
  const longValue = "REPOSITORY_" + "0123456789abcdef".repeat(24);
  const nested = source("LAY-HUMAN-AGENT-HANDOFF").replace("CI run 1042 passed.", longValue)
    + source("LAY-KNOWLEDGE-GRAPH").replace("provides time to", longValue);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(doc(nested, "*{overflow-wrap:anywhere}"));
  expect(await pageOverflow(page)).toBeFalsy();
});

test("keyboard traversal follows DOM order in nested handoff", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.setContent(doc(source("LAY-HUMAN-AGENT-HANDOFF")));
  const expected = await page.evaluate(() => [...document.querySelectorAll("a,button,input,select,textarea,summary,[tabindex]:not([tabindex='-1'])")].filter(x => !x.disabled).map(x => (x.textContent || x.getAttribute("aria-label") || "").trim()));
  const seen = [];
  for (let i = 0; i < expected.length; i++) {
    await page.keyboard.press("Tab");
    seen.push(await page.evaluate(() => (document.activeElement?.textContent || document.activeElement?.getAttribute("aria-label") || "").trim()));
  }
  expect(seen).toEqual(expected);
});

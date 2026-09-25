import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");

function documentFor(source) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><main>${source}</main></body></html>`;
}

const compositionPatterns = ["stack.html", "cluster.html", "sidebar.html", "frame.html", "measure.html"];

for (const file of compositionPatterns) {
  test(`${file} preserves DOM order across wide and narrow composition`, async ({ page }) => {
    const source = fs.readFileSync(path.join(root, "patterns", file), "utf8");
    const snapshots = [];

    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(documentFor(source));
      snapshots.push(await page.evaluate(() =>
        [...document.querySelectorAll("main *")]
          .filter(el => ["H1","H2","H3","P","A","BUTTON","NAV","ASIDE","ARTICLE","SECTION","FIGCAPTION"].includes(el.tagName))
          .map(el => ({ tag: el.tagName, text: (el.textContent || "").trim().replace(/\s+/g, " ") }))
      ));
    }

    expect(snapshots[1]).toEqual(snapshots[0]);
  });
}

test("sidebar recomposes to one column without CSS ordering", async ({ page }) => {
  const source = fs.readFileSync(path.join(root, "patterns", "sidebar.html"), "utf8");
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(documentFor(source));

  const result = await page.evaluate(() => {
    const shell = document.querySelector(".ef-sidebar");
    const side = document.querySelector(".ef-sidebar__side");
    const content = document.querySelector(".ef-sidebar__content");
    const style = getComputedStyle(shell);
    return {
      columns: style.gridTemplateColumns,
      sideTop: side.getBoundingClientRect().top,
      contentTop: content.getBoundingClientRect().top,
      sideOrder: getComputedStyle(side).order,
      contentOrder: getComputedStyle(content).order
    };
  });

  expect(result.columns.split(" ").length).toBe(1);
  expect(result.sideTop).toBeLessThan(result.contentTop);
  expect(result.sideOrder).toBe("0");
  expect(result.contentOrder).toBe("0");
});

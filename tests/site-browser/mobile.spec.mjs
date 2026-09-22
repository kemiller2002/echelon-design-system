import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "site-dist", "site-manifest.json"), "utf8")
);

const pages = [
  "/site-dist/index.html",
  "/site-dist/agents/index.html",
  ...manifest.components.map(component =>
    `/site-dist/components/${component.slug}/index.html`
  )
];

const viewports = [
  { name: "compact phone", width: 320, height: 568 },
  { name: "modern phone", width: 390, height: 844 }
];

for (const viewport of viewports) {
  test(`generated site remains contained on ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const url of pages) {
      await page.goto(url);

      const result = await page.evaluate(() => {
        const documentWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        );

        const tooSmall = [];
        for (const element of document.querySelectorAll(
          ".site-nav a, .component-nav a, .ef-button, .example-block summary, .site-footer a"
        )) {
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden") continue;
          const rect = element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.width < 43.5 || rect.height < 43.5) {
            tooSmall.push({
              text: element.textContent?.trim().slice(0, 60) || "",
              width: Math.round(rect.width * 10) / 10,
              height: Math.round(rect.height * 10) / 10
            });
          }
        }

        return {
          documentWidth,
          viewportWidth: window.innerWidth,
          tooSmall
        };
      });

      expect(
        result.documentWidth,
        `${url} creates page-level horizontal overflow at ${viewport.width}px`
      ).toBeLessThanOrEqual(result.viewportWidth + 1);

      expect(
        result.tooSmall,
        `${url} has undersized site touch targets at ${viewport.width}px: ${JSON.stringify(result.tooSmall)}`
      ).toEqual([]);
    }
  });
}

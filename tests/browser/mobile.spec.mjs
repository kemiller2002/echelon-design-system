import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const patterns = fs.readdirSync(path.join(root, "patterns"))
  .filter(file => file.endsWith(".html"))
  .sort();

const viewports = [
  { name: "compact phone", width: 320, height: 568 },
  { name: "modern phone", width: 390, height: 844 }
];

function documentFor(source) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${css}</style>
  <style>
    html, body { margin: 0; }
    body { padding: 1rem; }
    .mobile-test-frame { min-inline-size: 0; max-inline-size: 100%; }
  </style>
</head>
<body>
  <main class="mobile-test-frame">${source}</main>
</body>
</html>`;
}

async function exposeNativeState(page) {
  await page.evaluate(() => {
    for (const details of document.querySelectorAll("details")) details.open = true;
    for (const dialog of document.querySelectorAll("dialog")) {
      if (!dialog.open) dialog.setAttribute("open", "");
    }
    for (const popover of document.querySelectorAll("[popover]")) {
      try {
        if (!popover.matches(":popover-open")) popover.showPopover();
      } catch {
        // A browser that cannot expose a popover still validates its closed layout.
      }
    }
  });
}

async function mobileMetrics(page) {
  return page.evaluate(() => {
    const documentWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth
    );

    const candidates = [
      ...document.querySelectorAll("button, summary, input, select, textarea"),
      ...[...document.querySelectorAll("label")].filter(label =>
        label.querySelector('input[type="checkbox"], input[type="radio"]')
      )
    ];

    const tooSmall = [];
    for (const element of candidates) {
      const style = getComputedStyle(element);
      const input = element instanceof HTMLInputElement ? element : null;
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) === 0 ||
        input?.type === "hidden" ||
        input?.type === "checkbox" ||
        input?.type === "radio"
      ) {
        continue;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.width < 43.5 || rect.height < 43.5) {
        tooSmall.push({
          element: element.tagName.toLowerCase(),
          className: element.className || "",
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10
        });
      }
    }

    const viewportWidth = document.documentElement.clientWidth;
    const overflowElements = [...document.querySelectorAll("body *")]
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          element: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter(item => item.left < -1 || item.right > viewportWidth + 1)
      .sort((a, b) => b.width - a.width)
      .slice(0, 8);

    return {
      documentWidth,
      viewportWidth,
      tooSmall,
      overflowElements
    };
  });
}

for (const viewport of viewports) {
  test(`all canonical patterns reflow on ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const file of patterns) {
      const source = fs.readFileSync(path.join(root, "patterns", file), "utf8");
      await page.setContent(documentFor(source));
      await exposeNativeState(page);

      const metrics = await mobileMetrics(page);
      expect(
        metrics.documentWidth,
        `${file} creates page-level horizontal overflow at ${viewport.width}px: ${JSON.stringify(metrics.overflowElements)}`
      ).toBeLessThanOrEqual(metrics.viewportWidth + 1);

      expect(
        metrics.tooSmall,
        `${file} has undersized standalone touch targets at ${viewport.width}px: ${JSON.stringify(metrics.tooSmall)}`
      ).toEqual([]);
    }
  });
}

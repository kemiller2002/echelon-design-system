import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.cwd();
const css = [
  "dist/tokens.css",
  "dist/foundations.css",
  "dist/components.css",
  "dist/assessment.css"
].map(file => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

const operationalPatterns = [
  "alert",
  "collection-toolbar",
  "combobox",
  "command-palette",
  "conflict-review",
  "dashboard-grid",
  "data-grid",
  "date-range",
  "diff-viewer",
  "empty-state",
  "file-upload",
  "master-detail",
  "metric-card",
  "mobile-action-bar",
  "operation-status",
  "pagination",
  "preview-surface",
  "provenance-trail",
  "readiness-checklist",
  "record-header",
  "search",
  "skeleton",
  "status-lozenge",
  "tabs",
  "timeline",
  "wizard",
  "work-queue"
];

function fixture(slug) {
  const fragment = fs.readFileSync(path.join(root, "patterns", slug + ".html"), "utf8");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}body{padding:8px}main{max-inline-size:100%}</style></head><body><main>${fragment}</main></body></html>`;
}

for (const slug of operationalPatterns) {
  test(`${slug} has no page-level overflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.setContent(fixture(slug));
    const size = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    }));
    expect(size.document, JSON.stringify(size)).toBeLessThanOrEqual(size.viewport);
    expect(size.body, JSON.stringify(size)).toBeLessThanOrEqual(size.viewport);
  });
}

test("mobile data grid recomposes into labeled record rows", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(fixture("data-grid"));
  await expect(page.locator(".ef-data-grid thead")).toBeHidden();
  const cell = page.locator('.ef-data-grid td[data-label="Invoice"]').first();
  await expect(cell).toBeVisible();
  expect(await cell.evaluate(el => getComputedStyle(el).display)).toBe("grid");
});

test("mobile diff stacks comparison panels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(fixture("diff-viewer"));
  const columns = await page.locator(".ef-diff-viewer__grid").evaluate(el => getComputedStyle(el).gridTemplateColumns);
  expect(columns.trim().split(/\s+/)).toHaveLength(1);
});

test("mobile wizard reduces the full step rail to the current step", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(fixture("wizard"));
  await expect(page.locator('.ef-wizard__steps [data-state="current"]')).toBeVisible();
  await expect(page.locator('.ef-wizard__steps li:not([data-state="current"])').first()).toBeHidden();
});

test("mobile command palette fits the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.setContent(fixture("command-palette"));
  const box = await page.locator(".ef-command-palette").boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeLessThanOrEqual(320);
  expect(box.height).toBeLessThanOrEqual(640);
});

test("mobile master/detail becomes a single-column workspace", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(fixture("master-detail"));
  const columns = await page.locator(".ef-master-detail").evaluate(el => getComputedStyle(el).gridTemplateColumns);
  expect(columns.trim().split(/\s+/)).toHaveLength(1);
});

test("representative operational patterns pass automated WCAG A/AA checks", async ({ page }) => {
  for (const slug of ["collection-toolbar", "data-grid", "conflict-review", "work-queue", "wizard", "record-header", "operation-status"]) {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.setContent(fixture(slug));
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, slug).toEqual([]);
  }
});

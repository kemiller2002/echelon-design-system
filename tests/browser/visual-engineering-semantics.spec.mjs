import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const read = slug => fs.readFileSync(path.join(root, "patterns", slug + ".html"), "utf8");
const doc = body => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><style>html,body{margin:0}body{padding:1rem}</style></head><body>${body}</body></html>`;

async function overflow(page) {
  return page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > document.documentElement.clientWidth + 1);
}

test("comparison pairs repeat comparison labels and remain contained at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(doc(read("comparison-pairs")));
  expect(await overflow(page)).toBeFalsy();
  await expect(page.locator('[data-side="before"]')).toHaveCount(2);
  await expect(page.locator('[data-side="after"]')).toHaveCount(2);
  for (const side of ["before", "after"]) {
    const labels = await page.locator(`[data-side="${side}"]`).evaluateAll(nodes => nodes.map(n => n.getAttribute("data-label")));
    expect(labels.every(Boolean)).toBeTruthy();
  }
});

test("overview remains visible when secondary disclosure is closed", async ({ page }) => {
  await page.setContent(doc(read("overview-disclosure")));
  await expect(page.getByText("Verification still required")).toBeVisible();
  await expect(page.getByText(/Evidence is stale/)).toBeVisible();
  await expect(page.getByText(/Last verified 3 hours ago/)).not.toBeVisible();
  expect(await page.locator("details").getAttribute("open")).toBeNull();
});

test("state survivability exposes distinct state words in text", async ({ page }) => {
  await page.setContent(doc(read("state-survivability")));
  for (const state of ["Unknown", "Stale", "Partial", "Unavailable"]) {
    await expect(page.getByText(state, { exact: true })).toBeVisible();
  }
  const descriptions = await page.locator(".ef-state-survivability__state p").allTextContents();
  expect(descriptions.join(" ")).toMatch(/not been confirmed/i);
  expect(descriptions.join(" ")).toMatch(/older than/i);
  expect(descriptions.join(" ")).toMatch(/scope/i);
  expect(descriptions.join(" ")).toMatch(/unavailable/i);
});

test("state distinctions survive grayscale and forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.setContent(doc(`<div style="filter:grayscale(1)">${read("state-survivability")}</div>`));
  for (const state of ["Unknown", "Stale", "Partial", "Unavailable"]) {
    await expect(page.getByText(state, { exact: true })).toBeVisible();
  }
});

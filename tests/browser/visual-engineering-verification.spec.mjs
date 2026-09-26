import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");

function pattern(slug) {
  return fs.readFileSync(path.join(root, "patterns", slug + ".html"), "utf8");
}

function doc(body, extra = "") {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VE verification</title><style>${css}</style><style>html,body{margin:0}body{padding:1rem}${extra}</style></head><body>${body}</body></html>`;
}

async function overflow(page) {
  return page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > document.documentElement.clientWidth + 1);
}

for (const width of [320, 390]) {
  test(`verification frame and identifiers remain contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const long = pattern("identifier").replace("INV-10O2-7B51", "INV-" + "01OIl".repeat(40));
    await page.setContent(doc(pattern("verification-frame") + long));
    expect(await overflow(page)).toBeFalsy();
  });
}

test("verification frame survives 200% text and text-spacing overrides", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(doc(pattern("verification-frame"), `html{font-size:200%} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}`));
  expect(await overflow(page)).toBeFalsy();
  await expect(page.locator(".ef-verification-frame__act button").first()).toBeVisible();
});

test("verification semantics survive forced colors and reduced motion", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.setContent(doc(pattern("verification-frame")));
  await expect(page.getByRole("heading", { name: "Ready for deliberate verification" })).toBeVisible();
  await expect(page.getByText("$10,001.00")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve transition" })).toBeVisible();
  expect(await overflow(page)).toBeFalsy();
});

test("critical values remain text and do not encode authority in CSS", async ({ page }) => {
  await page.setContent(doc(pattern("identifier")));
  const value = page.locator(".ef-critical-value[data-ef-verify='true']");
  await expect(value).toHaveText("$10,001.00");
  expect(await value.evaluate(el => el.tagName)).toBe("SPAN");
  expect(await value.getAttribute("role")).toBeNull();
  expect(await value.getAttribute("aria-checked")).toBeNull();
  expect(await value.getAttribute("aria-selected")).toBeNull();
});

test("verification action focus order follows DOM order", async ({ page }) => {
  await page.setContent(doc(pattern("verification-frame")));
  const expected = await page.locator("button").allTextContents();
  const seen = [];
  for (let i = 0; i < expected.length; i++) {
    await page.keyboard.press("Tab");
    seen.push((await page.locator(":focus").textContent()).trim());
  }
  expect(seen).toEqual(expected.map(x => x.trim()));
});

import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const css = fs.readFileSync(path.join(root, "dist", "all.css"), "utf8");
const source = fs.readFileSync(path.join(root, "patterns", "attention-path.html"), "utf8");
const doc = (body, extra = "") => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Attention path conformance</title><style>${css}</style><style>html,body{margin:0}body{padding:1rem}${extra}</style></head><body>${body}</body></html>`;

async function snapshot(page) {
  return page.evaluate(() => ({
    width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    viewport: document.documentElement.clientWidth,
    steps: [...document.querySelectorAll("[data-attention-step]")].map(el => el.getAttribute("data-attention-step")),
    headings: [...document.querySelectorAll("h2,h3")].map(el => el.textContent.trim()),
    actions: [...document.querySelectorAll("button")].map(el => el.textContent.trim())
  }));
}

for (const width of [1280, 390, 320]) {
  test(`attention path preserves declared order and containment at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(doc(source));
    const state = await snapshot(page);
    expect(state.width).toBeLessThanOrEqual(state.viewport + 1);
    expect(state.steps).toEqual(["1", "2", "3", "4"]);
    expect(state.headings[0]).toBe("Human review required");
    expect(state.headings[1]).toBe("Reconcile the consumer smoke test before publishing");
    expect(state.actions.slice(0, 2)).toEqual(["Reconcile consumer", "Inspect evidence"]);
  });
}

test("attention path survives 200% text and spacing pressure", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(doc(source, `html{font-size:200%} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}`));
  const state = await snapshot(page);
  expect(state.width).toBeLessThanOrEqual(state.viewport + 1);
  await expect(page.getByText("Unknown consumer outcome")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reconcile consumer" })).toBeVisible();
});

test("declared priority survives visual-channel dropout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.setContent(doc(`<div class="dropout">${source}</div>`, `.dropout{filter:grayscale(1)} .dropout *{background:transparent!important;border-color:transparent!important;box-shadow:none!important}`));
  for (const n of ["1", "2", "3", "4"]) {
    await expect(page.locator(`[data-attention-step="${n}"]`)).toBeVisible();
  }
  await expect(page.getByText("Unknown consumer outcome")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reconcile consumer" })).toBeVisible();
});

test("attention path remains intelligible in forced colors and reduced motion", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.setContent(doc(source));
  expect((await snapshot(page)).steps).toEqual(["1", "2", "3", "4"]);
  const priority = await page.locator('[data-attention-step="1"]').evaluate(el => getComputedStyle(el, "::before").content);
  expect(priority).toContain("Priority 1");
});

test("keyboard reaches consequential actions before supporting interactive content", async ({ page }) => {
  await page.setContent(doc(source.replace("<p>CI run 1042 passed 148 checks. Package contents were generated successfully.</p>", "<p>CI run 1042 passed 148 checks. Package contents were generated successfully.</p><button type=\"button\">Open CI run</button>")));
  await page.keyboard.press("Tab");
  expect((await page.locator(":focus").textContent()).trim()).toBe("Reconcile consumer");
  await page.keyboard.press("Tab");
  expect((await page.locator(":focus").textContent()).trim()).toBe("Inspect evidence");
  await page.keyboard.press("Tab");
  expect((await page.locator(":focus").textContent()).trim()).toBe("Open CI run");
});


test("realistic competition specimen keeps consequential path ahead of distractors", async ({ page }) => {
  const specimen = fs.readFileSync(path.join(root, "catalog", "specimens", "LAY-ATTENTION-COMPETITION.html"), "utf8");
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.setContent(doc(specimen));
  const sequence = await page.evaluate(() => [...document.querySelectorAll("h1,h2,[data-attention-step],button")].map(el => ({
    tag: el.tagName,
    text: (el.textContent || "").trim().replace(/\s+/g, " "),
    step: el.getAttribute("data-attention-step")
  })));
  const reconcileHeading = sequence.findIndex(x => x.text === "Reconciliation required before publish");
  const activityHeading = sequence.findIndex(x => x.text === "Repository activity");
  expect(reconcileHeading).toBeGreaterThanOrEqual(0);
  expect(activityHeading).toBeGreaterThan(reconcileHeading);
  expect((await snapshot(page)).width).toBeLessThanOrEqual((await snapshot(page)).viewport + 1);
});

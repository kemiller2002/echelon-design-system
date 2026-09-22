import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("showcase home publishes every canonical component", async ({ page }) => {
  await page.goto("/site-dist/index.html");

  await expect(page.getByRole("heading", { name: "Build the interface from known parts." })).toBeVisible();
  const manifest = await page.evaluate(async () => (await fetch("/site-dist/showcase-manifest.json")).json());
  await expect(page.locator(".docs-component-card")).toHaveCount(manifest.componentCount);
  expect(manifest.componentCount).toBe(29);
});

test("component pages render three live examples and source", async ({ page }) => {
  await page.goto("/site-dist/components/ordinal-scale/");

  await expect(page.getByRole("heading", { name: "Ordinal Scale", level: 1 })).toBeVisible();
  await expect(page.locator("[data-example]")).toHaveCount(3);
  await expect(page.getByText("patterns/ordinal-scale.html", { exact: true })).toBeVisible();
  await expect(page.getByText("View HTML")).toHaveCount(3);

  const display = await page.locator(".ef-ordinal-scale__options").first().evaluate(element => getComputedStyle(element).display);
  expect(display).toBe("grid");
});

test("agent usage page exposes the zero-runtime application boundary", async ({ page }) => {
  await page.goto("/site-dist/agents/");

  await expect(page.getByRole("heading", { name: "Use the system before inventing UI." })).toBeVisible();
  await expect(page.getByText("Do not add component JavaScript.")).toBeVisible();
  await expect(page.getByText("Use Limen only for missing browser behavior.")).toBeVisible();
});

test("showcase shell has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  for (const target of ["/site-dist/index.html", "/site-dist/components/switch/", "/site-dist/components/matrix-single/"]) {
    await page.goto(target);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, target).toEqual([]);
  }
});

test("showcase shell does not create page-level horizontal overflow on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const target of ["/site-dist/index.html", "/site-dist/components/semantic-differential/", "/site-dist/components/matrix-single/"]) {
    await page.goto(target);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth
    }));
    expect(dimensions.scrollWidth, target).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }
});

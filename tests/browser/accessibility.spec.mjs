import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { openFixture } from "./helpers.mjs";

test("pilot fixture has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await openFixture(page);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("native controls expose expected roles and names", async ({ page }) => {
  await openFixture(page);

  await expect(page.getByRole("switch", { name: "Notifications" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Required setting" })).toBeVisible();
  await expect(page.getByRole("slider", { name: "Volume" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Comfortable" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Compact" })).toBeVisible();
});

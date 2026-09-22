import { test, expect } from "@playwright/test";
import { openFixture } from "./helpers.mjs";

test("explicit dark theme resolves accessible derived accent tokens", async ({ page }) => {
  await openFixture(page);
  await page.locator("html").evaluate(element => element.setAttribute("data-ef-theme", "dark"));

  const values = await page.locator("html").evaluate(element => {
    const style = getComputedStyle(element);
    return {
      primary: style.getPropertyValue("--ef-color-accent-primary").trim(),
      secondary: style.getPropertyValue("--ef-color-accent-secondary").trim(),
      surface: style.getPropertyValue("--ef-color-surface-primary").trim()
    };
  });

  expect(values).toEqual({
    primary: "#a87e5e",
    secondary: "#698d84",
    surface: "#171a18"
  });
});

test("light secondary surface uses its dedicated safe text token", async ({ page }) => {
  await openFixture(page);
  const value = await page.locator("html").evaluate(element =>
    getComputedStyle(element).getPropertyValue("--ef-color-text-on-secondary-surface").trim()
  );
  expect(value).toBe("#3a403c");
});

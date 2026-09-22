import { test, expect } from "@playwright/test";
import { openFixture, formData } from "./helpers.mjs";

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("slider keeps native role, value, keyboard behavior, and form participation", async ({ page }) => {
  const slider = page.getByRole("slider", { name: "Volume" });
  await expect(slider).toHaveValue("25");

  await slider.focus();
  await slider.press("ArrowRight");

  await expect(slider).toHaveValue("30");
  await expect.poll(() => formData(page)).toEqual({
    volume: "30",
    density: "comfortable"
  });
});

test("slider reset restores its initial value", async ({ page }) => {
  const slider = page.getByRole("slider", { name: "Volume" });
  await slider.focus();
  await slider.press("End");
  await expect(slider).toHaveValue("100");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(slider).toHaveValue("25");
});

test("slider uses the semantic active color through accent-color", async ({ page }) => {
  const accent = await page.locator("#volume").evaluate(element => getComputedStyle(element).accentColor);
  expect(accent).not.toBe("auto");
});

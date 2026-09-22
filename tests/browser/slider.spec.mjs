import { test, expect } from "@playwright/test";
import { openFixture, formData } from "./helpers.mjs";

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("slider exposes native slider semantics and keyboard behavior", async ({ page }) => {
  const slider = page.getByRole("slider", { name: "Volume" });
  await expect(slider).toBeVisible();
  await expect(slider).toHaveValue("25");

  await slider.focus();
  await slider.press("ArrowRight");

  await expect(slider).toHaveValue("30");
  await expect(page.locator("#volume")).toHaveAttribute("value", "30");
  await expect.poll(() => formData(page)).toEqual({ volume: "30" });
});

test("slider distinguishes continuous input and committed change", async ({ page }) => {
  const events = await page.locator("#volume").evaluate(element => {
    const seen = [];
    element.addEventListener("ef-input", event => seen.push(["input", event.detail.value]));
    element.addEventListener("ef-change", event => seen.push(["change", event.detail.value]));
    element.shadowRoot.querySelector("input").value = "45";
    element.shadowRoot.querySelector("input").dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    element.shadowRoot.querySelector("input").dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    return new Promise(resolve => queueMicrotask(() => resolve(seen)));
  });

  expect(events).toEqual([["input", "45"], ["change", "45"]]);
  await expect(page.locator("#volume")).toHaveAttribute("value", "45");
});

test("slider form reset restores the initial value", async ({ page }) => {
  const slider = page.getByRole("slider", { name: "Volume" });
  await slider.focus();
  await slider.press("End");
  await expect(slider).toHaveValue("100");

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(slider).toHaveValue("25");
  await expect.poll(() => formData(page)).toEqual({ volume: "25" });
});

test("slider fill follows the semantic value without animation lag", async ({ page }) => {
  await page.locator("#volume").evaluate(element => { element.value = "75"; });
  const percent = await page.locator("#volume").evaluate(element =>
    element.shadowRoot.querySelector("input").style.getPropertyValue("--ef-slider-percent")
  );
  expect(percent).toBe("75%");
});

test("slider value bubble motion collapses under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.evaluate(() => customElements.whenDefined("ef-slider"));

  const seconds = await page.locator("#volume").evaluate(element => {
    const bubble = element.shadowRoot.querySelector(".bubble");
    const duration = getComputedStyle(bubble).transitionDuration.split(",")[0];
    return duration.endsWith("ms") ? parseFloat(duration) / 1000 : parseFloat(duration);
  });

  expect(seconds).toBeLessThan(0.01);
});

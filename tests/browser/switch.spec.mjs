import { test, expect } from "@playwright/test";
import { openFixture, formData } from "./helpers.mjs";

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("switch exposes switch semantics and toggles from keyboard", async ({ page }) => {
  const control = page.getByRole("switch", { name: "Notifications" });
  await expect(control).toBeVisible();
  await expect(control).not.toBeChecked();

  await control.focus();
  await control.press("Space");

  await expect(control).toBeChecked();
  await expect(page.locator("#notifications")).toHaveAttribute("checked", "");
  await expect.poll(() => formData(page)).toEqual({ notifications: "enabled", volume: "25" });
});

test("cancelable intent can reject the state transition", async ({ page }) => {
  const host = page.locator("#notifications");
  await host.evaluate(element => {
    element.addEventListener("ef-change-requested", event => event.preventDefault(), { once: true });
  });

  await page.getByRole("switch", { name: "Notifications" }).click();

  await expect(page.getByRole("switch", { name: "Notifications" })).not.toBeChecked();
  await expect(host).not.toHaveAttribute("checked", "");
  await expect.poll(() => formData(page)).toEqual({ volume: "25" });
});

test("switch participates in reset and form submission", async ({ page }) => {
  const control = page.getByRole("switch", { name: "Notifications" });
  await control.click();
  await expect.poll(() => formData(page)).toEqual({ notifications: "enabled", volume: "25" });

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(control).not.toBeChecked();
  await expect.poll(() => formData(page)).toEqual({ volume: "25" });
});

test("required switch reports invalid until selected", async ({ page }) => {
  const validBefore = await page.locator("#required-switch").evaluate(element => element.matches(":invalid"));
  expect(validBefore).toBe(true);

  await page.getByRole("switch", { name: "Required setting" }).click();

  const validAfter = await page.locator("#required-switch").evaluate(element => element.matches(":valid"));
  expect(validAfter).toBe(true);
});

test("switch motion collapses under reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.evaluate(() => customElements.whenDefined("ef-switch"));

  const seconds = await page.locator("#notifications").evaluate(element => {
    const track = element.shadowRoot.querySelector(".track");
    const duration = getComputedStyle(track).transitionDuration.split(",")[0];
    return duration.endsWith("ms") ? parseFloat(duration) / 1000 : parseFloat(duration);
  });

  expect(seconds).toBeLessThan(0.01);
});

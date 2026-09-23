import { test, expect } from "@playwright/test";
import { openFixture, formData } from "./helpers.mjs";

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("switch is a native form control with switch semantics", async ({ page }) => {
  const control = page.getByRole("switch", { name: "Notifications" });
  await expect(control).toBeVisible();
  await expect(control).not.toBeChecked();

  await control.focus();
  await control.press("Space");

  await expect(control).toBeChecked();
  await expect.poll(() => formData(page)).toEqual({
    notifications: "enabled",
    volume: "25",
    density: "comfortable"
  });
});

test("switch reset and required validity are browser-native", async ({ page }) => {
  const notifications = page.getByRole("switch", { name: "Notifications" });
  const required = page.getByRole("switch", { name: "Required setting" });

  await notifications.click();
  await required.click();
  await expect(required).toBeChecked();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(notifications).not.toBeChecked();
  await expect(required).not.toBeChecked();

  expect(await page.locator("#required-switch").evaluate(element => element.matches(":invalid"))).toBe(true);
});

test("switch thumb is vertically centered in the track", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  const track = page.locator(".ef-switch__track").first();
  const geometry = await track.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const thumb = getComputedStyle(element, "::after");
    const trackStyle = getComputedStyle(element);

    return {
      trackHeight: rect.height,
      thumbAnchor: parseFloat(trackStyle.borderBlockStartWidth) + parseFloat(thumb.top),
      translate: thumb.translate
    };
  });

  expect(geometry.thumbAnchor).toBeCloseTo(geometry.trackHeight / 2, 1);
  expect(geometry.translate).toContain("-50%");

  await page.getByRole("switch", { name: "Notifications" }).click();
  const checkedTranslate = await track.evaluate(element =>
    getComputedStyle(element, "::after").translate
  );
  expect(checkedTranslate).toContain("-50%");
});

test("switch animation collapses for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  const duration = await page.locator(".ef-switch__track").first().evaluate(element =>
    getComputedStyle(element).transitionDuration.split(",")[0]
  );

  const seconds = duration.endsWith("ms") ? parseFloat(duration) / 1000 : parseFloat(duration);
  expect(seconds).toBeLessThan(0.01);
});

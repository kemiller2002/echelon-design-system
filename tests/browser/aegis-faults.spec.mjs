import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const fixture = "/tests/browser/fixture/aegis-faults.html";

test("Aegis fault presentation has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto(fixture);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Aegis fault presentation exposes readable severity, reference, and legal recovery hooks", async ({ page }) => {
  await page.goto(fixture);

  await expect(page.getByText("Error", { exact: true })).toBeVisible();
  await expect(page.getByText("AG-4F82C", { exact: true }).first()).toBeVisible();

  const retry = page.getByRole("button", { name: "Try again" });
  await expect(retry).toHaveAttribute("data-ef-aegis-capability", "CanRetry");

  const restore = page.getByRole("button", { name: "Reconnect diagnostics" });
  await expect(restore).toHaveAttribute("data-ef-aegis-capability", "CanRestoreSink");

  const readOnly = page.getByRole("button", { name: "Open read-only" });
  await expect(readOnly).toHaveAttribute("data-ef-aegis-capability", "CanOpenReadOnly");
});

test("blocking fault exposes an accessible dialog name and no synthetic continue action", async ({ page }) => {
  await page.goto(fixture);

  await expect(page.getByRole("dialog", { name: "Application cannot continue safely" })).toBeVisible();
  await expect(page.getByRole("button", { name: /continue anyway/i })).toHaveCount(0);
});

test("fault summary provides a focusable navigation region", async ({ page }) => {
  await page.goto(fixture);

  const summary = page.locator(".ef-fault-summary");
  await expect(summary).toHaveAttribute("tabindex", "-1");
  await expect(summary.getByRole("link", { name: "Save failed" })).toHaveAttribute("href", "#fixture-target");
});

test("Aegis fault family contains at 320 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(fixture);

  const metrics = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open read-only" })).toBeVisible();
});

test("Aegis fault motion honors reduced-motion variables", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(fixture);

  const duration = await page.locator(".ef-fault-notification").evaluate(el =>
    getComputedStyle(el).getPropertyValue("--ef-motion-inertia-duration").trim()
  );

  expect(duration).toBe("0.01ms");
});

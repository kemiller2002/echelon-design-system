import { test, expect } from "@playwright/test";
import { openFixture } from "./helpers.mjs";

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("segmented control is a native radio group", async ({ page }) => {
  const compact = page.getByRole("radio", { name: "Compact" });
  await compact.check();
  await expect(compact).toBeChecked();
  await expect(page.getByRole("radio", { name: "Comfortable" })).not.toBeChecked();
});

test("details disclosure opens without component script", async ({ page }) => {
  const details = page.locator("#advanced-options");
  await expect(details).not.toHaveAttribute("open", "");
  await page.getByText("Advanced options", { exact: true }).click();
  await expect(details).toHaveAttribute("open", "");
});

test("popover opens and closes declaratively", async ({ page }) => {
  const popover = page.locator("#example-popover");
  await page.locator("#popover-open").click();
  expect(await popover.evaluate(element => element.matches(":popover-open"))).toBe(true);

  await page.locator("#popover-close").click();
  expect(await popover.evaluate(element => element.matches(":popover-open"))).toBe(false);
});

test("dialog opens and closes through declarative commands", async ({ page }) => {
  const dialog = page.locator("#example-dialog");
  await page.locator("#dialog-open").click();
  await expect(dialog).toHaveAttribute("open", "");

  await page.locator("#dialog-close").click();
  await expect(dialog).not.toHaveAttribute("open", "");
});

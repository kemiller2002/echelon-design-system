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


test("assessment patterns have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/tests/browser/fixture/assessment.html");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("assessment primitives expose native accessible names and roles", async ({ page }) => {
  await page.goto("/tests/browser/fixture/assessment.html");

  await expect(page.getByRole("radio", { name: "Strongly disagree" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Don't know" })).toBeVisible();
  await expect(page.getByRole("radio", { name: /^Cloud\b/ })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Survey progress" })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Reliability" })).toBeVisible();
});


test("selector completeness fixture has no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/tests/browser/fixture/selector-completeness.html");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("new selector families expose accessible native controls", async ({ page }) => {
  await page.goto("/tests/browser/fixture/selector-completeness.html");

  await expect(page.getByRole("radio", { name: "Yes", exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Highly manual, position 1 of 7" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "5 of 5, very satisfied" })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Minimum" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Reliability, Best" })).toBeVisible();
});


test("physics motion controls have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/tests/browser/fixture/physics-motion.html");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("physics motion controls preserve native accessible roles and names", async ({ page }) => {
  await page.goto("/tests/browser/fixture/physics-motion.html");

  await expect(page.getByRole("switch", { name: "Standard switch" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Record audit events" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Deployment region" })).toBeVisible();
});


test("overlay motion surfaces have no automatically detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/tests/browser/fixture/overlay-motion.html");

  for (const buttonName of ["Open modal", "Open left flyout", "Open right flyout"]) {
    await page.getByRole("button", { name: buttonName }).click();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    expect(results.violations).toEqual([]);
    await page.keyboard.press("Escape");
  }
});

test("modal and flyouts expose native dialog roles and accessible names", async ({ page }) => {
  await page.goto("/tests/browser/fixture/overlay-motion.html");

  for (const [buttonName, dialogName] of [
    ["Open modal", "Confirm action"],
    ["Open left flyout", "Left flyout"],
    ["Open right flyout", "Right flyout"]
  ]) {
    await page.getByRole("button", { name: buttonName }).click();
    await expect(page.getByRole("dialog", { name: dialogName })).toBeVisible();
    await page.keyboard.press("Escape");
  }
});

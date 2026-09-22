import { test, expect } from "@playwright/test";

async function openAssessment(page) {
  await page.goto("/tests/browser/fixture/assessment.html");
}

test.beforeEach(async ({ page }) => {
  await openAssessment(page);
});

test("assessment stylesheet is distributed and applied", async ({ page }) => {
  const display = await page.locator(".ef-ordinal-scale__options").evaluate(element => getComputedStyle(element).display);
  expect(display).toBe("grid");
});

test("ordinal scale is a native required radio group", async ({ page }) => {
  const agree = page.getByRole("radio", { name: "Agree", exact: true });
  await expect(agree).not.toBeChecked();
  await agree.check();
  await expect(agree).toBeChecked();

  const data = await page.evaluate(() =>
    Object.fromEntries(new FormData(document.querySelector("#assessment-form")).entries())
  );
  expect(data.likert).toBe("3");
});

test("special answer states remain distinct choices outside the ordinal scale", async ({ page }) => {
  const unknown = page.getByRole("radio", { name: "Don't know" });
  await unknown.check();
  await expect(unknown).toBeChecked();

  const data = await page.evaluate(() =>
    Object.fromEntries(new FormData(document.querySelector("#assessment-form")).entries())
  );
  expect(data.likert).toBe("unknown");

  const relation = await page.evaluate(() => {
    const scale = document.querySelector(".ef-ordinal-scale__options");
    const special = document.querySelector(".ef-special-choices");
    return scale.compareDocumentPosition(special) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(Boolean(relation)).toBe(true);
});

test("choice cards preserve ordinary radio behavior", async ({ page }) => {
  const hybrid = page.getByRole("radio", { name: /^Hybrid\b/ });
  await hybrid.check();
  await expect(hybrid).toBeChecked();
  await expect(page.getByRole("radio", { name: /^Cloud\b/ })).not.toBeChecked();
});

test("assessment reset restores native unanswered state", async ({ page }) => {
  await page.getByRole("radio", { name: "Agree", exact: true }).check();
  await page.getByRole("radio", { name: /^Hybrid\b/ }).check();
  await page.getByRole("button", { name: "Reset assessment" }).click();

  await expect(page.getByRole("radio", { name: "Agree", exact: true })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: /^Hybrid\b/ })).not.toBeChecked();
});

test("ordinal scale stacks vertically on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const first = await page.locator(".ef-ordinal-option").nth(0).boundingBox();
  const second = await page.locator(".ef-ordinal-option").nth(1).boundingBox();

  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(Math.abs(first.x - second.x)).toBeLessThan(2);
  expect(second.y).toBeGreaterThan(first.y);
});

test("survey progress exposes native progress semantics", async ({ page }) => {
  const progress = page.getByRole("progressbar", { name: "Survey progress" });
  await expect(progress).toBeVisible();
  await expect(progress).toHaveAttribute("value", "3");
  await expect(progress).toHaveAttribute("max", "12");
});

test("ranking exposes keyboard-operable move commands for Limen", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Move Reliability up" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Move Reliability down" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Move Delivery speed up" })).toBeEnabled();
  await expect(page.locator(".ef-ranking__announcement")).toHaveAttribute("aria-live", "polite");
});

test("allocation keeps direct numeric entry as the non-drag path", async ({ page }) => {
  await expect(page.getByRole("spinbutton", { name: "Reliability" })).toHaveValue("4");
  await expect(page.getByRole("spinbutton", { name: "Delivery speed" })).toHaveValue("6");
  await expect(page.getByText("10 / 10", { exact: true })).toBeVisible();
  await expect(page.locator(".ef-allocation__total")).toHaveAttribute("aria-live", "polite");
});

test("rule builder has labelled structured form controls", async ({ page }) => {
  await expect(page.getByRole("combobox", { name: "Field" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Operator" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Value" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove condition" })).toBeVisible();
});

test("obligation panel communicates severity in text, not color alone", async ({ page }) => {
  await expect(page.getByText("Blocking", { exact: true })).toBeVisible();
  await expect(page.getByText("Required", { exact: true })).toBeVisible();
  await expect(page.getByText("Reconcile unknown storage outcome")).toBeVisible();
});

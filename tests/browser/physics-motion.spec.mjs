import { expect, test } from "@playwright/test";

const fixture = "/tests/browser/fixture/physics-motion.html";

function seconds(value) {
  const trimmed = value.trim();
  return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) / 1000 : Number.parseFloat(trimmed);
}

async function pseudoDurations(locator, pseudo = null) {
  return locator.evaluateAll((elements, pseudoValue) =>
    elements.map(element =>
      getComputedStyle(
        pseudoValue ? element : element.querySelector(".ef-select__indicator"),
        pseudoValue || undefined
      ).transitionDuration.split(",").map(value => value.trim())
    ),
  pseudo);
}

test.beforeEach(async ({ page }) => {
  await page.goto(fixture);
});

test("physics weight orders inertial duration while gravity duration is mass independent", async ({ page }) => {
  const switchDurations = await pseudoDurations(page.locator(".ef-switch__track"), "::after");
  const switchInertia = switchDurations.map(values => seconds(values[0]));
  expect(switchInertia[0]).toBeLessThan(switchInertia[1]);
  expect(switchInertia[1]).toBeLessThan(switchInertia[2]);

  const checkboxDurations = await pseudoDurations(page.locator(".ef-checkbox__box"), "::after");
  const checkboxInertia = checkboxDurations.slice(0, 3).map(values => seconds(values[1]));
  expect(checkboxInertia[0]).toBeLessThan(checkboxInertia[1]);
  expect(checkboxInertia[1]).toBeLessThan(checkboxInertia[2]);

  const selectDurations = await pseudoDurations(page.locator(".ef-select"));
  const selectInertia = selectDurations.slice(0, 3).map(values => seconds(values[0]));
  const selectGravity = selectDurations.slice(0, 3).map(values => seconds(values[1]));

  expect(selectInertia[0]).toBeLessThan(selectInertia[1]);
  expect(selectInertia[1]).toBeLessThan(selectInertia[2]);
  expect(Math.max(...selectGravity) - Math.min(...selectGravity)).toBeLessThan(0.001);
});

test("native checkbox and select semantics remain authoritative", async ({ page }) => {
  const checkbox = page.getByRole("checkbox", { name: "Record audit events" });
  const select = page.getByRole("combobox", { name: "Deployment region" });
  const toggle = page.getByRole("switch", { name: "Standard switch" });

  await checkbox.focus();
  await checkbox.press("Space");
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toBeFocused();

  await toggle.press("Space");
  await expect(toggle).toBeChecked();

  await select.selectOption("eu-west");
  await expect(select).toHaveValue("eu-west");

  const data = await page.locator("#physics-controls").evaluate(form =>
    Object.fromEntries(new FormData(form).entries())
  );
  expect(data).toEqual({
    notifications: "enabled",
    "audit-log": "enabled",
    region: "eu-west"
  });

  await page.getByRole("button", { name: "Reset physics controls" }).click();
  await expect(checkbox).not.toBeChecked();
  await expect(toggle).not.toBeChecked();
  await expect(select).toHaveValue("us-east");
});

test("rapid repeated activation ends at the actual native state without queued semantic work", async ({ page }) => {
  const toggle = page.locator("#physics-switch");

  await toggle.evaluate(element => {
    for (let index = 0; index < 12; index += 1) element.click();
  });

  await expect(toggle).not.toBeChecked();

  await toggle.evaluate(element => {
    for (let index = 0; index < 11; index += 1) element.click();
  });

  await expect(toggle).toBeChecked();
});

test("disabled native controls stay disabled", async ({ page }) => {
  await expect(page.getByRole("checkbox", { name: "Disabled checkbox" })).toBeDisabled();
  await expect(page.getByRole("combobox", { name: "Disabled region" })).toBeDisabled();
});

test("reduced motion collapses spatial timing across the physics controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  const switchDurations = await pseudoDurations(page.locator(".ef-switch__track"), "::after");
  const checkboxDurations = await pseudoDurations(page.locator(".ef-checkbox__box"), "::after");
  const selectDurations = await pseudoDurations(page.locator(".ef-select"));

  for (const values of [...switchDurations, ...checkboxDurations, ...selectDurations]) {
    for (const value of values) expect(seconds(value)).toBeLessThan(0.01);
  }
});

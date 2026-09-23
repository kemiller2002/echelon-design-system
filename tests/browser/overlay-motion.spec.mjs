import { expect, test } from "@playwright/test";

const fixture = "/tests/browser/fixture/overlay-motion.html";

function seconds(value) {
  const trimmed = value.trim();
  return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) / 1000 : Number.parseFloat(trimmed);
}

test.beforeEach(async ({ page }) => {
  await page.goto(fixture);
});

test("native modal and both flyout sides open and close without a runtime behavior layer", async ({ page }) => {
  const cases = [
    ["Open modal", "#test-modal"],
    ["Open left flyout", "#test-left-flyout"],
    ["Open right flyout", "#test-right-flyout"]
  ];

  for (const [buttonName, selector] of cases) {
    const trigger = page.getByRole("button", { name: buttonName });
    const surface = page.locator(selector);

    await trigger.click();
    await expect(surface).toHaveJSProperty("open", true);

    await page.keyboard.press("Escape");
    await expect(surface).toHaveJSProperty("open", false);
    await expect(trigger).toBeFocused();
  }
});

test("left and right flyouts preserve opposite physical origins", async ({ page }) => {
  const origins = await page.locator(".ef-flyout").evaluateAll(elements =>
    elements.map(element => ({
      side: element.dataset.efSide,
      closedX: getComputedStyle(element).getPropertyValue("--ef-flyout-closed-x").trim()
    }))
  );

  expect(origins).toEqual([
    { side: "left", closedX: "-100%" },
    { side: "right", closedX: "100%" }
  ]);
});

test("modal and flyout entry use the shared physics-derived inertia duration", async ({ page }) => {
  for (const [buttonName, selector] of [
    ["Open modal", "#test-modal"],
    ["Open left flyout", "#test-left-flyout"],
    ["Open right flyout", "#test-right-flyout"]
  ]) {
    await page.getByRole("button", { name: buttonName }).click();

    const motion = await page.locator(selector).evaluate(element => {
      const style = getComputedStyle(element);
      return {
        inertia: style.getPropertyValue("--ef-motion-inertia-duration").trim(),
        exit: style.getPropertyValue("--ef-motion-exit-duration").trim(),
        durations: style.transitionDuration.split(",").map(value => value.trim())
      };
    });

    expect(seconds(motion.inertia)).toBeGreaterThan(seconds(motion.exit));
    expect(seconds(motion.durations[0])).toBeCloseTo(seconds(motion.inertia), 3);

    await page.keyboard.press("Escape");
  }
});

test("reduced motion removes modal and flyout spatial travel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  const states = await page.locator(".ef-dialog, .ef-flyout").evaluateAll(elements =>
    elements.map(element => {
      const style = getComputedStyle(element);
      return {
        translate: style.translate,
        scale: style.scale,
        duration: style.getPropertyValue("--ef-motion-inertia-duration").trim()
      };
    })
  );

  for (const state of states) {
    expect(state.translate === "none" || state.translate === "0px" || state.translate === "0px 0px").toBeTruthy();
    expect(state.scale === "none" || state.scale === "1").toBeTruthy();
    expect(seconds(state.duration)).toBeLessThan(0.01);
  }
});

test("flyouts remain contained at 320 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.getByRole("button", { name: "Open right flyout" }).click();

  const box = await page.locator("#test-right-flyout").boundingBox();
  expect(box).not.toBeNull();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320.5);
  expect(box.height).toBeLessThanOrEqual(700.5);
});

import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const fixture = "/tests/browser/fixture/surface-physics.html";

function seconds(value) {
  const trimmed = value.trim();
  return trimmed.endsWith("ms") ? Number.parseFloat(trimmed) / 1000 : Number.parseFloat(trimmed);
}

async function durations(locator, pseudo = null) {
  return locator.evaluate((element, pseudoValue) =>
    getComputedStyle(element, pseudoValue || undefined)
      .transitionDuration.split(",").map(value => value.trim()),
  pseudo);
}

test.beforeEach(async ({ page }) => {
  await page.goto(fixture);
});

test("surface mass produces coherent light standard heavy inertial ordering", async ({ page }) => {
  const disclosure = await durations(page.locator("#physics-disclosure > summary"), "::after");

  await page.locator("#physics-toast-open").click();
  const toast = await durations(page.locator("#physics-toast"));

  await page.locator("#physics-dialog-open").click();
  const dialog = await durations(page.locator("#physics-dialog"));

  const light = seconds(disclosure[0]);
  const standard = seconds(toast[1]);
  const heavy = seconds(dialog[1]);

  expect(light).toBeLessThan(standard);
  expect(standard).toBeLessThan(heavy);
});

test("transient exits are derived shorter than entries", async ({ page }) => {
  const popover = page.locator("#physics-popover");
  const closedPopover = await durations(popover);
  const popoverExit = seconds(closedPopover[1]);

  await page.locator("#physics-popover-open").click();
  const openPopover = await durations(popover);
  const popoverEntry = seconds(openPopover[1]);
  expect(popoverExit).toBeLessThan(popoverEntry);

  const drawer = page.locator("#physics-drawer");
  const closedDrawer = await durations(drawer);
  const drawerExit = seconds(closedDrawer[1]);

  await page.locator("#physics-drawer-open").click();
  const openDrawer = await durations(drawer);
  const drawerEntry = seconds(openDrawer[1]);
  expect(drawerExit).toBeLessThan(drawerEntry);
});

test("native disclosure popover menu dialog drawer and toast states remain authoritative", async ({ page }) => {
  const disclosure = page.locator("#physics-disclosure");
  await page.getByText("Advanced options", { exact: true }).click();
  await expect(disclosure).toHaveAttribute("open", "");

  const popover = page.locator("#physics-popover");
  await page.locator("#physics-popover-open").click();
  expect(await popover.evaluate(element => element.matches(":popover-open"))).toBe(true);
  await page.locator("#physics-popover-close").click();
  expect(await popover.evaluate(element => element.matches(":popover-open"))).toBe(false);

  const menu = page.locator("#physics-menu");
  await page.locator("#physics-menu-open").click();
  expect(await menu.evaluate(element => element.matches(":popover-open"))).toBe(true);
  await page.keyboard.press("Escape");
  expect(await menu.evaluate(element => element.matches(":popover-open"))).toBe(false);

  const dialog = page.locator("#physics-dialog");
  await page.locator("#physics-dialog-open").click();
  await expect(dialog).toHaveAttribute("open", "");
  await page.locator("#physics-dialog-close").click();
  await expect(dialog).not.toHaveAttribute("open", "");

  const drawer = page.locator("#physics-drawer");
  await page.locator("#physics-drawer-open").click();
  await expect(drawer).toHaveAttribute("open", "");
  await page.locator("#physics-drawer-close").click();
  await expect(drawer).not.toHaveAttribute("open", "");

  const toast = page.locator("#physics-toast");
  await page.locator("#physics-toast-open").click();
  expect(await toast.evaluate(element => element.matches(":popover-open"))).toBe(true);
  await page.locator("#physics-toast-close").click();
  expect(await toast.evaluate(element => element.matches(":popover-open"))).toBe(false);
});

test("drawer direction follows its occupied edge", async ({ page }) => {
  const endClosed = await page.locator("#physics-drawer").evaluate(element => getComputedStyle(element).translate);
  const startClosed = await page.locator("#physics-drawer-start").evaluate(element => getComputedStyle(element).translate);

  expect(Number.parseFloat(endClosed)).toBeGreaterThan(0);
  expect(Number.parseFloat(startClosed)).toBeLessThan(0);
});

test("rapid tab semantic changes end at the application supplied state", async ({ page }) => {
  await page.locator("#physics-tabs").evaluate(tabs => {
    const [a, b] = tabs.querySelectorAll('[role="tab"]');
    for (let index = 0; index < 20; index += 1) {
      const selectB = index % 2 === 0;
      a.setAttribute("aria-selected", String(!selectB));
      b.setAttribute("aria-selected", String(selectB));
    }
    a.setAttribute("aria-selected", "false");
    b.setAttribute("aria-selected", "true");
  });

  await expect(page.locator("#physics-tab-a")).toHaveAttribute("aria-selected", "false");
  await expect(page.locator("#physics-tab-b")).toHaveAttribute("aria-selected", "true");

  await expect.poll(async () =>
    page.locator("#physics-tab-b").evaluate(element =>
      Number.parseFloat(getComputedStyle(element, "::after").scale)
    )
  ).toBeCloseTo(1, 2);
});

test("surface physics fixture passes automated WCAG A AA checks", async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("reduced motion collapses spatial transition timing for transient surfaces", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();

  await page.locator("#physics-popover-open").click();
  await page.locator("#physics-toast-open").click();

  const checks = [
    [page.locator("#physics-disclosure > summary"), "::after"],
    [page.locator("#physics-popover"), null],
    [page.locator("#physics-menu"), null],
    [page.locator("#physics-dialog"), null],
    [page.locator("#physics-drawer"), null],
    [page.locator("#physics-tab-a"), "::after"],
    [page.locator("#physics-alert"), null],
    [page.locator("#physics-toast"), null],
    [page.locator("#physics-command"), null]
  ];

  for (const [locator, pseudo] of checks) {
    const values = await durations(locator, pseudo);
    for (const value of values) expect(seconds(value)).toBeLessThan(0.01);
  }
});

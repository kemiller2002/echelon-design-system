import { test, expect } from "@playwright/test";

async function openSelectors(page) {
  await page.goto("/tests/browser/fixture/selector-completeness.html");
}

test.beforeEach(async ({ page }) => {
  await openSelectors(page);
});

test("binary choice preserves unanswered until a radio is intentionally selected", async ({ page }) => {
  const yes = page.getByRole("radio", { name: "Yes", exact: true });
  const no = page.getByRole("radio", { name: "No", exact: true });

  await expect(yes).not.toBeChecked();
  await expect(no).not.toBeChecked();

  await yes.check();
  await expect(yes).toBeChecked();
  await page.getByRole("button", { name: "Reset selectors" }).click();

  await expect(yes).not.toBeChecked();
  await expect(no).not.toBeChecked();
});

test("semantic differential exposes textual endpoint meaning through radio names", async ({ page }) => {
  const first = page.getByRole("radio", { name: "Highly manual, position 1 of 7" });
  const last = page.getByRole("radio", { name: "Highly automated, position 7 of 7" });

  await expect(first).toBeVisible();
  await expect(last).toBeVisible();
  await last.check();
  await expect(last).toBeChecked();
});

test("symbol rating does not rely on the star glyph for its accessible name", async ({ page }) => {
  const rating = page.getByRole("radio", { name: "4 of 5, satisfied" });
  await expect(rating).toBeVisible();
  await rating.check();
  await expect(rating).toBeChecked();
});

test("numeric stepper and range endpoints keep direct native numeric entry", async ({ page }) => {
  await expect(page.getByRole("spinbutton", { name: "Target deployments per week" })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "Minimum" })).toHaveValue("500");
  await expect(page.getByRole("spinbutton", { name: "Maximum" })).toHaveValue("1500");
});

test("multi-choice guidance is available before validation", async ({ page }) => {
  await expect(page.getByText("Choose exactly 2 options. None of these is exclusive.")).toBeVisible();
  await expect(page.getByText("0 of 2 selected", { exact: true })).toHaveAttribute("aria-live", "polite");
  await expect(page.getByRole("checkbox", { name: /None of these/ })).toBeVisible();
});

test("matrix rows remain independent native radio groups", async ({ page }) => {
  const testing = page.getByRole("group", { name: "Automated testing" });
  const deployment = page.getByRole("group", { name: "Deployment automation" });

  await expect(testing.getByRole("radio", { name: "Established" })).toBeVisible();
  await expect(deployment.getByRole("radio", { name: "Optimized" })).toBeVisible();
});

test("matrix decomposes vertically on narrow layouts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const flow = await page.locator(".ef-matrix__choices").first().evaluate(element => getComputedStyle(element).gridAutoFlow);
  expect(flow).toBe("row");
});

test("pairwise comparison remains a native two-option radio group", async ({ page }) => {
  const reliability = page.getByRole("radio", { name: /Option A.*Reliability/ });
  const speed = page.getByRole("radio", { name: /Option B.*Delivery speed/ });
  await reliability.check();
  await expect(reliability).toBeChecked();
  await expect(speed).not.toBeChecked();
});

test("best-worst exposes distinct labelled best and worst groups", async ({ page }) => {
  await expect(page.getByRole("radio", { name: "Reliability, Best" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Reliability, Worst" })).toBeVisible();
  await expect(page.locator(".ef-best-worst__status")).toHaveAttribute("aria-live", "polite");
});

test("hierarchical selector uses native disclosure and choice semantics", async ({ page }) => {
  await expect(page.getByRole("radio", { name: "Identity" })).toBeVisible();
  await page.getByText("Data", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Warehouse" })).toBeVisible();
});

test("ordinal system supports an 11-position NPS-style presentation without a separate component", async ({ page }) => {
  const tracks = await page.evaluate(() => {
    const root = document.createElement("div");
    root.className = "ef-ordinal-scale ef-ordinal-scale--11";
    const options = document.createElement("div");
    options.className = "ef-ordinal-scale__options";
    for (let i = 0; i < 11; i++) options.append(document.createElement("span"));
    root.append(options);
    document.body.append(root);
    return getComputedStyle(options).gridTemplateColumns.split(" ").filter(Boolean).length;
  });
  expect(tracks).toBe(11);
});

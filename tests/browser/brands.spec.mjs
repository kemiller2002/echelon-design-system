import { test, expect } from "@playwright/test";
import { openFixture } from "./helpers.mjs";

test("brand scopes coexist without semantic-token leakage", async ({ page }) => {
  await openFixture(page);
  await page.locator("body").evaluate(body => {
    const shell = document.createElement("div");
    shell.innerHTML = [
      '<section id="brand-ech" data-ef-brand="echelon"><button type="button">Action</button></section>',
      '<section id="brand-harbor" data-ef-brand="example-harbor"><button type="button">Action</button></section>'
    ].join("");
    body.append(shell);
  });

  const values = await page.evaluate(() => {
    const read = id => {
      const style = getComputedStyle(document.querySelector(id));
      return {
        accent: style.getPropertyValue("--ef-color-accent-primary").trim(),
        radius: style.getPropertyValue("--ef-primitive-radius-medium").trim()
      };
    };
    return {
      root: getComputedStyle(document.documentElement).getPropertyValue("--ef-color-accent-primary").trim(),
      echelon: read("#brand-ech"),
      harbor: read("#brand-harbor")
    };
  });

  expect(values.root).toBe("#905831");
  expect(values.echelon).toEqual({ accent: "#905831", radius: "8px" });
  expect(values.harbor).toEqual({ accent: "#7a4a00", radius: "12px" });
});

test("explicit dark theme resolves inside a brand scope", async ({ page }) => {
  await openFixture(page);
  await page.locator("body").evaluate(body => {
    const element = document.createElement("section");
    element.id = "dark-brand";
    element.setAttribute("data-ef-brand", "example-harbor");
    element.setAttribute("data-ef-theme", "dark");
    element.textContent = "Dark branded surface";
    body.append(element);
  });

  const values = await page.locator("#dark-brand").evaluate(element => {
    const style = getComputedStyle(element);
    return {
      accent: style.getPropertyValue("--ef-color-accent-primary").trim(),
      surface: style.getPropertyValue("--ef-color-surface-primary").trim()
    };
  });

  expect(values).toEqual({ accent: "#d7a85b", surface: "#101820" });
});

test("skin presets override presentation primitives without changing brand tokens", async ({ page }) => {
  await openFixture(page);
  await page.locator("body").evaluate(body => {
    body.insertAdjacentHTML("beforeend", [
      '<section id="compact" data-ef-brand="echelon" data-ef-skin="compact">Compact</section>',
      '<section id="comfortable" data-ef-brand="echelon" data-ef-skin="comfortable">Comfortable</section>',
      '<section id="square" data-ef-brand="echelon" data-ef-skin="square">Square</section>'
    ].join(""));
  });

  const values = await page.evaluate(() => {
    const token = (selector, name) =>
      getComputedStyle(document.querySelector(selector)).getPropertyValue(name).trim();
    return {
      compactSpacing: token("#compact", "--ef-primitive-spacing-4"),
      comfortableSpacing: token("#comfortable", "--ef-primitive-spacing-4"),
      squareRadius: token("#square", "--ef-primitive-radius-medium"),
      compactAccent: token("#compact", "--ef-color-accent-primary")
    };
  });

  expect(values).toEqual({
    compactSpacing: "12px",
    comfortableSpacing: "20px",
    squareRadius: "0",
    compactAccent: "#905831"
  });
});

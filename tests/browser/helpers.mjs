export async function openFixture(page) {
  await page.goto("/tests/browser/fixture/index.html");
}

export async function formData(page) {
  return page.evaluate(() => Object.fromEntries(new FormData(document.querySelector("#settings")).entries()));
}

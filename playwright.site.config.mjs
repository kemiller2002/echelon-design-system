import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/site-browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "chromium-mobile-site", use: { browserName: "chromium" } }
  ],
  webServer: {
    command: "node tools/serve-tests.mjs",
    url: "http://127.0.0.1:4173/site-dist/index.html",
    reuseExistingServer: !process.env.CI
  }
});

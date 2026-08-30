import { defineConfig, devices } from '@playwright/test'

// E2E specs live in e2e/ and require the vite dev server on :3000.
// Run with: pnpm exec playwright test
// The vitest unit suite (vite.config.ts `test:` block) already excludes e2e/**;
// this config is the Playwright-side half: it scopes discovery to e2e/ so
// `playwright test` never picks up vitest specs.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start the dev server automatically; reuse one that's already listening.
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})

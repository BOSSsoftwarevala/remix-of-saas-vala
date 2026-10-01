import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const START_WEB_SERVER = process.env.E2E_START_WEB_SERVER !== 'false';
// Some sandboxes can't run Playwright's bundled browser (missing system libs);
// point this at a working Chromium, e.g. E2E_CHROMIUM_PATH=/usr/bin/chromium.
const CHROMIUM_PATH = process.env.E2E_CHROMIUM_PATH || '';


const desktopChrome: Record<string, unknown> = { ...devices['Desktop Chrome'] };
if (CHROMIUM_PATH) {
  delete desktopChrome.channel;
  desktopChrome.launchOptions = {
    ...((desktopChrome.launchOptions as Record<string, unknown>) ?? {}),
    executablePath: CHROMIUM_PATH,
  };
}

export default defineConfig({

  testDir: '.',
  testMatch: ['e2e/**/*.spec.ts', 'tests/e2e/**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: Number(process.env.E2E_TEST_TIMEOUT_MS || 45_000),
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/reports/html', open: 'never' }],
    ['json', { outputFile: 'e2e/reports/report.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: START_WEB_SERVER
    ? {
        command: 'npm run dev -- --host 127.0.0.1 --port 4173',
        port: 4173,
        timeout: 120_000,
        reuseExistingServer: true,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: desktopChrome,
    },
  ],
});

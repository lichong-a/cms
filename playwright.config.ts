// @ts-check
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env['CI']);
const frontendBaseUrl = process.env['PLAYWRIGHT_FRONTEND_BASE_URL'] ?? 'http://localhost:3001';
const adminBaseUrl = process.env['PLAYWRIGHT_ADMIN_BASE_URL'] ?? 'http://localhost:3002';
const apiBaseUrl = process.env['PLAYWRIGHT_API_BASE_URL'] ?? 'http://localhost:3003';
const adminStorageState = path.join(__dirname, 'tests/e2e/.auth/admin.json');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 1 } : {}),
  reporter: 'html',
  use: {
    baseURL: frontendBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: adminStorageState,
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: adminStorageState,
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: adminStorageState,
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command: 'pnpm dev:api',
      url: `${apiBaseUrl}/api/v1/config`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: 'pnpm dev:frontend',
      url: frontendBaseUrl,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
    {
      command: 'pnpm dev:admin',
      url: `${adminBaseUrl}/login`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});

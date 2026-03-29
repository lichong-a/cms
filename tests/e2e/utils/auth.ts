import { expect, type Page } from '@playwright/test';

export const FRONTEND_BASE_URL =
  process.env['PLAYWRIGHT_FRONTEND_BASE_URL'] ?? 'http://localhost:3001';
export const ADMIN_BASE_URL =
  process.env['PLAYWRIGHT_ADMIN_BASE_URL'] ?? 'http://localhost:3002';
export const ADMIN_STORAGE_STATE = 'tests/e2e/.auth/admin.json';

export const TEST_USER = {
  email: process.env['E2E_ADMIN_EMAIL'] ?? 'admin@example.com',
  password: process.env['E2E_ADMIN_PASSWORD'] ?? 'admin123',
};

export function frontendUrl(path = '/') {
  return new URL(path, `${FRONTEND_BASE_URL}/`).toString();
}

export function adminUrl(path = '/') {
  return new URL(path, `${ADMIN_BASE_URL}/`).toString();
}

export async function login(page: Page, credentials = TEST_USER) {
  await page.goto(adminUrl('/login'));
  await page.waitForTimeout(1_000);
  await page.locator('#email').fill(credentials.email);
  await page.locator('#password').fill(credentials.password);
  const loginResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes('/auth/login')
  );
  await page.getByRole('button', { name: '登录' }).click();
  expect((await loginResponse).ok()).toBeTruthy();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 30_000 });
  await page.goto(adminUrl('/admin'));
  await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
}

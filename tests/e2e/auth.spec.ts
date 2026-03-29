import { test, expect } from '@playwright/test';

import { adminUrl, login } from './utils/auth';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Admin Authentication', () => {
  test('redirects unauthenticated admin access to login', async ({ page }) => {
    await page.goto(adminUrl('/admin'));
    await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'CMS 管理后台' })).toBeVisible();
  });

  test('renders the real login form', async ({ page }) => {
    await page.goto(adminUrl('/login'));
    await expect(page.getByRole('heading', { name: 'CMS 管理后台' })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto(adminUrl('/login'));
    await page.waitForTimeout(1_000);
    await page.locator('#email').fill('wrong@example.com');
    await page.locator('#password').fill('wrongpassword');
    const loginResponse = page.waitForResponse((response) => response.url().includes('/auth/login'));
    await page.getByRole('button', { name: '登录' }).click();
    const response = await loginResponse;
    expect(response.status()).toBe(401);
    await expect(page).toHaveURL(/\/login$/);
  });

  test('logs in with the development admin account', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
  });
});

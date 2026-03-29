import { test, expect } from '@playwright/test';

import { adminUrl } from './utils/auth';

test.describe('Articles Management', () => {
  test('renders the articles list page', async ({ page }) => {
    await page.goto(adminUrl('/admin/articles'));
    await expect(page.getByRole('heading', { name: '文章管理' })).toBeVisible();
    await expect(page.getByRole('link', { name: /新建文章/ })).toBeVisible();
  });

  test('opens the new article page', async ({ page }) => {
    await page.goto(adminUrl('/admin/articles'));
    await page.getByRole('link', { name: /新建文章/ }).click();
    await expect(page).toHaveURL(/\/admin\/articles\/new$/);
    await expect(page.getByRole('heading', { name: '新建文章' })).toBeVisible();
  });

  test('validates a whitespace-only title', async ({ page }) => {
    await page.goto(adminUrl('/admin/articles/new'));
    await page.locator('#title').fill('   ');
    await page.getByRole('button', { name: '保存文章' }).click();
    await expect(page.getByText('请输入文章标题')).toBeVisible();
  });

  test('creates an article and returns to the list', async ({ page }) => {
    const timestamp = Date.now();
    const articleTitle = `E2E Article ${timestamp}`;

    await page.goto(adminUrl('/admin/articles/new'));
    await page.locator('#title').fill(articleTitle);
    await page.locator('#excerpt').fill(`E2E excerpt ${timestamp}`);
    await page.locator('.ProseMirror').fill(`E2E content ${timestamp}`);
    await page.getByRole('button', { name: '保存文章' }).click();

    await expect(page).toHaveURL(/\/admin\/articles$/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: '文章管理' })).toBeVisible();
    await expect(page.getByText(articleTitle)).toBeVisible({ timeout: 15_000 });
  });
});

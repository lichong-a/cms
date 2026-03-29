import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '最新文章' })).toBeVisible();
  await expect(page.getByRole('main').first()).toBeVisible();
});

import { test, expect } from '@playwright/test';

import { adminUrl } from './utils/auth';

test.describe('Configuration Management', () => {
  test('renders the current settings form', async ({ page }) => {
    await page.goto(adminUrl('/admin/settings'));
    await expect(page.getByRole('heading', { name: '系统设置' })).toBeVisible();
    await expect(page.getByText('网站名称')).toBeVisible();
    await expect(page.getByText('网站描述')).toBeVisible();
    await expect(page.getByText('Meta 关键词')).toBeVisible();
    await expect(page.getByRole('button', { name: '保存设置' })).toBeVisible();
  });

  test('allows editing visible settings fields', async ({ page }) => {
    await page.goto(adminUrl('/admin/settings'));
    const siteName = page.getByPlaceholder('CMS 系统');
    const siteDescription = page.getByPlaceholder('输入网站描述');
    const metaKeywords = page.getByPlaceholder('关键词1, 关键词2, 关键词3');

    await siteName.fill('E2E CMS');
    await siteDescription.fill('E2E description');
    await metaKeywords.fill('cms,e2e');

    await expect(siteName).toHaveValue('E2E CMS');
    await expect(siteDescription).toHaveValue('E2E description');
    await expect(metaKeywords).toHaveValue('cms,e2e');
  });
});

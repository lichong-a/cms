import { test as setup } from '@playwright/test';

import { ADMIN_STORAGE_STATE, login } from './utils/auth';

setup('authenticate admin user', async ({ page }) => {
  await login(page);
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});

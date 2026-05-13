import { expect, Page } from '@playwright/test';

import { ROLE_DISPLAY_NAMES, Roles } from '../../../src/constants/roles';

const SYSTEM_ADMIN_EMAIL = process.env.PLAYWRIGHT_SYSTEM_ADMIN_EMAIL ?? 'admin@bookmyhotel.com';
const SYSTEM_ADMIN_PASSWORD = process.env.PLAYWRIGHT_SYSTEM_ADMIN_PASSWORD ?? 'admin123';

export async function loginAsSystemAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await expect(page.getByTestId('login-form')).toBeVisible();

  await page.getByTestId('email-input').fill(SYSTEM_ADMIN_EMAIL);
  await page.getByTestId('password-input').fill(SYSTEM_ADMIN_PASSWORD);
  await page.getByTestId('login-button').click();

  await expect(page.getByTestId('user-role')).toContainText(ROLE_DISPLAY_NAMES[Roles.SUPER_ADMIN], {
    timeout: 15000,
  });
}
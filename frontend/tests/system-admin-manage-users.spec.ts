import { expect, test } from '@playwright/test';

import { loginAsSystemAdmin } from './support/auth/adminAuth';
import { buildUserCreationData } from './support/data/userManagement';
import { UserManagementPage } from './support/pages/UserManagementPage';

test.describe('System Admin - Manage Users', () => {
  test('should load the user management page', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);

    await loginAsSystemAdmin(page);
    await userManagementPage.goto();

    await expect(page.getByText('Filters')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should create a new admin user through the add user dialog', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    const user = buildUserCreationData();

    await loginAsSystemAdmin(page);
    await userManagementPage.goto();
    await userManagementPage.openCreateUserDialog();
    await userManagementPage.fillCreateUserForm(user);

    const createUserOutcomePromise = Promise.race([
      page.waitForResponse(
        (response) => response.url().includes('/admin/users') && response.request().method() === 'POST',
        { timeout: 15000 }
      ).then((response) => ({ kind: 'response' as const, response })),
      page.waitForEvent('requestfailed', {
        predicate: (request) => request.url().includes('/admin/users') && request.method() === 'POST',
        timeout: 15000,
      }).then((request) => ({ kind: 'failed' as const, request })),
    ]);

    await userManagementPage.submitCreateUser();

    const createUserOutcome = await createUserOutcomePromise;
    expect(
      createUserOutcome.kind,
      createUserOutcome.kind === 'failed'
        ? createUserOutcome.request.failure()?.errorText
        : 'create user response was never observed'
    ).toBe('response');
    expect(createUserOutcome.response.status()).toBe(200);

    await userManagementPage.expectUserCreated(user);
  });
});

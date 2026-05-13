import { expect, Page } from '@playwright/test';

import { UserCreationData } from '../data/userManagement';

export class UserManagementPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/system/users');
    await expect(this.page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Add User' })).toBeVisible();
  }

  async openCreateUserDialog(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add User' }).click();
    await expect(this.page.getByRole('dialog', { name: 'Add New User' })).toBeVisible();
  }

  async fillCreateUserForm(data: UserCreationData): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Add New User' });

    await dialog.getByLabel('First Name').fill(data.firstName);
    await dialog.getByLabel('Last Name').fill(data.lastName);
    await dialog.getByLabel('Email').fill(data.email);
    await dialog.getByLabel('Password').fill(data.password);
    await dialog.getByLabel('Phone').fill(data.phone);

    const roleCombobox = dialog.getByRole('combobox').first();

    await roleCombobox.click();
    await this.page.locator('[role="option"][data-value="ADMIN"]').click();
  }

  async submitCreateUser(): Promise<void> {
    await this.page.getByRole('dialog', { name: 'Add New User' }).getByRole('button', { name: 'Create User' }).click();
  }

  async expectUserCreated(data: UserCreationData): Promise<void> {
    await expect(this.page.getByRole('dialog', { name: 'Add New User' })).toBeHidden({ timeout: 15000 });
    await this.searchForUser(data.email);
    await expect(this.userRow(data.email)).toBeVisible({ timeout: 15000 });
    await expect(this.userRow(data.email)).toContainText(`${data.firstName} ${data.lastName}`);
    await expect(this.userRow(data.email)).toContainText('ADMIN');
  }

  async searchForUser(query: string): Promise<void> {
    await this.page.getByLabel('Search').fill(query);
  }

  private userRow(email: string) {
    return this.page.locator('tbody tr', {
      has: this.page.getByText(email, { exact: true }),
    }).first();
  }
}
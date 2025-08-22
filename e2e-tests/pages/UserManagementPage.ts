import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * User Management Page Object Model
 * Handles user creation, modification, and role assignments
 */
export class UserManagementPage extends BasePage {
  
  // Locators
  private readonly pageTitle: Locator;
  private readonly createUserButton: Locator;
  private readonly usersTable: Locator;
  private readonly userRows: Locator;
  private readonly searchInput: Locator;
  private readonly roleFilter: Locator;
  private readonly statusFilter: Locator;
  private readonly refreshButton: Locator;
  private readonly noDataMessage: Locator;

  // User form locators
  private readonly userFormModal: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly phoneInput: Locator;
  private readonly roleSelect: Locator;
  private readonly tenantSelect: Locator;
  private readonly statusSelect: Locator;
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Page elements
    this.pageTitle = page.locator('[data-testid="users-title"]');
    this.createUserButton = page.locator('[data-testid="create-user-button"]');
    this.usersTable = page.locator('[data-testid="users-table"]');
    this.userRows = page.locator('[data-testid="user-row"]');
    this.searchInput = page.locator('[data-testid="search-users"]');
    this.roleFilter = page.locator('[data-testid="filter-role"]');
    this.statusFilter = page.locator('[data-testid="filter-status"]');
    this.refreshButton = page.locator('[data-testid="refresh-users"]');
    this.noDataMessage = page.locator('[data-testid="no-users"]');

    // Form elements
    this.userFormModal = page.locator('[data-testid="user-form-modal"]');
    this.firstNameInput = page.locator('[data-testid="user-firstName"]');
    this.lastNameInput = page.locator('[data-testid="user-lastName"]');
    this.emailInput = page.locator('[data-testid="user-email"]');
    this.phoneInput = page.locator('[data-testid="user-phone"]');
    this.roleSelect = page.locator('[data-testid="user-role"]');
    this.tenantSelect = page.locator('[data-testid="user-tenant"]');
    this.statusSelect = page.locator('[data-testid="user-status"]');
    this.saveButton = page.locator('[data-testid="save-user"]');
    this.cancelButton = page.locator('[data-testid="cancel-user"]');
  }

  /**
   * Navigate to user management page
   */
  async navigateTo(): Promise<void> {
    await this.goto('/admin/users');
    await this.waitForPageLoad();
  }

  /**
   * Verify page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toContainText('User Management');
  }

  /**
   * Open create user form
   */
  async openCreateUserForm(): Promise<void> {
    await this.createUserButton.click();
    await expect(this.userFormModal).toBeVisible();
  }

  /**
   * Create a new user
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'SYSTEM_ADMIN' | 'HOTEL_ADMIN' | 'FRONT_DESK' | 'CUSTOMER';
    tenantId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<void> {
    await this.openCreateUserForm();
    
    // Fill form
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.emailInput.fill(userData.email);
    await this.phoneInput.fill(userData.phone);
    await this.roleSelect.selectOption(userData.role);
    
    if (userData.tenantId) {
      await this.tenantSelect.selectOption(userData.tenantId);
    }
    
    if (userData.status) {
      await this.statusSelect.selectOption(userData.status);
    }
    
    // Save user
    await this.saveButton.click();
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Wait for modal to close
    await expect(this.userFormModal).not.toBeVisible();
    
    // Wait for API response
    await this.waitForApiResponse('/api/admin/users');
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<Locator | null> {
    const rows = await this.getUserRows();
    
    for (const row of rows) {
      const emailElement = row.locator('[data-testid="user-email"]');
      const userEmail = await emailElement.textContent();
      
      if (userEmail?.includes(email)) {
        return row;
      }
    }
    
    return null;
  }

  /**
   * Get all user rows
   */
  async getUserRows(): Promise<Locator[]> {
    await this.userRows.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await this.userRows.count();
    const rows: Locator[] = [];
    
    for (let i = 0; i < count; i++) {
      rows.push(this.userRows.nth(i));
    }
    
    return rows;
  }

  /**
   * Edit user
   */
  async editUser(email: string, updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    status?: string;
  }): Promise<void> {
    const userRow = await this.findUserByEmail(email);
    
    if (!userRow) {
      throw new Error(`User with email "${email}" not found`);
    }

    // Click edit button
    await userRow.locator('[data-testid="edit-user"]').click();
    await expect(this.userFormModal).toBeVisible();
    
    // Update fields
    if (updates.firstName) {
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(updates.firstName);
    }
    
    if (updates.lastName) {
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(updates.lastName);
    }
    
    if (updates.phone) {
      await this.phoneInput.clear();
      await this.phoneInput.fill(updates.phone);
    }
    
    if (updates.role) {
      await this.roleSelect.selectOption(updates.role);
    }
    
    if (updates.status) {
      await this.statusSelect.selectOption(updates.status);
    }
    
    // Save changes
    await this.saveButton.click();
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Wait for modal to close
    await expect(this.userFormModal).not.toBeVisible();
  }

  /**
   * Delete user
   */
  async deleteUser(email: string): Promise<void> {
    const userRow = await this.findUserByEmail(email);
    
    if (!userRow) {
      throw new Error(`User with email "${email}" not found`);
    }

    // Click delete button
    await userRow.locator('[data-testid="delete-user"]').click();
    
    // Confirm deletion
    await this.page.locator('[data-testid="confirm-delete"]').click();
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Wait for API response
    await this.waitForApiResponse('/api/admin/users');
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForApiResponse('/api/admin/users');
  }

  /**
   * Filter users by role
   */
  async filterByRole(role: 'ALL' | 'SYSTEM_ADMIN' | 'HOTEL_ADMIN' | 'FRONT_DESK' | 'CUSTOMER'): Promise<void> {
    await this.roleFilter.selectOption(role);
    await this.waitForApiResponse('/api/admin/users');
  }

  /**
   * Filter users by status
   */
  async filterByStatus(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.waitForApiResponse('/api/admin/users');
  }

  /**
   * Get user role
   */
  async getUserRole(email: string): Promise<string> {
    const userRow = await this.findUserByEmail(email);
    
    if (!userRow) {
      throw new Error(`User with email "${email}" not found`);
    }

    const roleElement = userRow.locator('[data-testid="user-role"]');
    return await roleElement.textContent() || '';
  }

  /**
   * Get user status
   */
  async getUserStatus(email: string): Promise<string> {
    const userRow = await this.findUserByEmail(email);
    
    if (!userRow) {
      throw new Error(`User with email "${email}" not found`);
    }

    const statusElement = userRow.locator('[data-testid="user-status"]');
    return await statusElement.textContent() || '';
  }

  /**
   * Verify user exists
   */
  async verifyUserExists(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    expect(user).not.toBeNull();
  }

  /**
   * Verify user does not exist
   */
  async verifyUserNotExists(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    expect(user).toBeNull();
  }

  /**
   * Refresh users list
   */
  async refreshList(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForApiResponse('/api/admin/users');
  }

  /**
   * Get total number of users
   */
  async getTotalUsers(): Promise<number> {
    try {
      await this.userRows.first().waitFor({ state: 'visible', timeout: 5000 });
      return await this.userRows.count();
    } catch {
      return 0;
    }
  }

  /**
   * Get users by role count
   */
  async getUsersByRoleCount(role: string): Promise<number> {
    await this.filterByRole(role as any);
    return await this.getTotalUsers();
  }
}

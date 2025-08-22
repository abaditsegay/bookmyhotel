import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestHotelRegistration } from '../fixtures/testData';

/**
 * Hotel Registrations Management Page Object Model
 * Handles hotel registration approval/rejection workflows
 */
export class HotelRegistrationsPage extends BasePage {
  
  // Locators
  private readonly pageTitle: Locator;
  private readonly registrationsTable: Locator;
  private readonly registrationRows: Locator;
  private readonly searchInput: Locator;
  private readonly filterSelect: Locator;
  private readonly refreshButton: Locator;
  private readonly noDataMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    this.pageTitle = page.locator('[data-testid="registrations-title"]');
    this.registrationsTable = page.locator('[data-testid="registrations-table"]');
    this.registrationRows = page.locator('[data-testid="registration-row"]');
    this.searchInput = page.locator('[data-testid="search-registrations"]');
    this.filterSelect = page.locator('[data-testid="filter-status"]');
    this.refreshButton = page.locator('[data-testid="refresh-button"]');
    this.noDataMessage = page.locator('[data-testid="no-registrations"]');
  }

  /**
   * Navigate to hotel registrations page
   */
  async navigateTo(): Promise<void> {
    await this.goto('/admin/hotel-registrations');
    await this.waitForPageLoad();
  }

  /**
   * Verify page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toContainText('Hotel Registrations');
  }

  /**
   * Get all registration rows
   */
  async getRegistrationRows(): Promise<Locator[]> {
    await this.registrationRows.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await this.registrationRows.count();
    const rows: Locator[] = [];
    
    for (let i = 0; i < count; i++) {
      rows.push(this.registrationRows.nth(i));
    }
    
    return rows;
  }

  /**
   * Find registration by hotel name
   */
  async findRegistrationByHotelName(hotelName: string): Promise<Locator | null> {
    const rows = await this.getRegistrationRows();
    
    for (const row of rows) {
      const nameElement = row.locator('[data-testid="hotel-name"]');
      const name = await nameElement.textContent();
      
      if (name?.includes(hotelName)) {
        return row;
      }
    }
    
    return null;
  }

  /**
   * Approve a hotel registration
   */
  async approveRegistration(hotelName: string, notes?: string): Promise<void> {
    const registrationRow = await this.findRegistrationByHotelName(hotelName);
    
    if (!registrationRow) {
      throw new Error(`Registration for hotel "${hotelName}" not found`);
    }

    // Click approve button
    await registrationRow.locator('[data-testid="approve-button"]').click();
    
    // Fill approval dialog if notes provided
    if (notes) {
      const notesField = this.page.locator('[data-testid="approval-notes"]');
      await notesField.waitFor({ state: 'visible' });
      await notesField.fill(notes);
    }
    
    // Confirm approval
    await this.page.locator('[data-testid="confirm-approval"]').click();
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Wait for API call to complete
    await this.waitForApiResponse('/api/admin/hotel-registrations');
  }

  /**
   * Reject a hotel registration
   */
  async rejectRegistration(hotelName: string, reason: string): Promise<void> {
    const registrationRow = await this.findRegistrationByHotelName(hotelName);
    
    if (!registrationRow) {
      throw new Error(`Registration for hotel "${hotelName}" not found`);
    }

    // Click reject button
    await registrationRow.locator('[data-testid="reject-button"]').click();
    
    // Fill rejection reason
    const reasonField = this.page.locator('[data-testid="rejection-reason"]');
    await reasonField.waitFor({ state: 'visible' });
    await reasonField.fill(reason);
    
    // Confirm rejection
    await this.page.locator('[data-testid="confirm-rejection"]').click();
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Wait for API call to complete
    await this.waitForApiResponse('/api/admin/hotel-registrations');
  }

  /**
   * View registration details
   */
  async viewRegistrationDetails(hotelName: string): Promise<void> {
    const registrationRow = await this.findRegistrationByHotelName(hotelName);
    
    if (!registrationRow) {
      throw new Error(`Registration for hotel "${hotelName}" not found`);
    }

    await registrationRow.locator('[data-testid="view-details-button"]').click();
    
    // Wait for details modal/page to load
    await expect(this.page.locator('[data-testid="registration-details"]')).toBeVisible();
  }

  /**
   * Search for registrations
   */
  async searchRegistrations(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForApiResponse('/api/admin/hotel-registrations');
  }

  /**
   * Filter registrations by status
   */
  async filterByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'): Promise<void> {
    await this.filterSelect.selectOption(status);
    await this.waitForApiResponse('/api/admin/hotel-registrations');
  }

  /**
   * Get registration status
   */
  async getRegistrationStatus(hotelName: string): Promise<string> {
    const registrationRow = await this.findRegistrationByHotelName(hotelName);
    
    if (!registrationRow) {
      throw new Error(`Registration for hotel "${hotelName}" not found`);
    }

    const statusElement = registrationRow.locator('[data-testid="registration-status"]');
    return await statusElement.textContent() || '';
  }

  /**
   * Verify registration appears in list
   */
  async verifyRegistrationExists(hotelName: string): Promise<void> {
    const registration = await this.findRegistrationByHotelName(hotelName);
    expect(registration).not.toBeNull();
  }

  /**
   * Verify registration does not appear in list
   */
  async verifyRegistrationNotExists(hotelName: string): Promise<void> {
    const registration = await this.findRegistrationByHotelName(hotelName);
    expect(registration).toBeNull();
  }

  /**
   * Refresh registrations list
   */
  async refreshList(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForApiResponse('/api/admin/hotel-registrations');
  }

  /**
   * Get total number of registrations
   */
  async getTotalRegistrations(): Promise<number> {
    try {
      await this.registrationRows.first().waitFor({ state: 'visible', timeout: 5000 });
      return await this.registrationRows.count();
    } catch {
      return 0;
    }
  }
}

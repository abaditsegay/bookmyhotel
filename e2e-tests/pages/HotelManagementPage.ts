import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Hotel Management Page Object Model
 * Handles hotel information viewing and management for system admins
 */
export class HotelManagementPage extends BasePage {
  
  // Locators
  private readonly pageTitle: Locator;
  private readonly hotelsTable: Locator;
  private readonly hotelRows: Locator;
  private readonly searchInput: Locator;
  private readonly statusFilter: Locator;
  private readonly cityFilter: Locator;
  private readonly refreshButton: Locator;
  private readonly noDataMessage: Locator;
  private readonly exportButton: Locator;

  // Hotel details modal
  private readonly hotelDetailsModal: Locator;
  private readonly hotelStatusSelect: Locator;
  private readonly saveStatusButton: Locator;

  constructor(page: Page) {
    super(page);
    
    this.pageTitle = page.locator('[data-testid="hotels-title"]');
    this.hotelsTable = page.locator('[data-testid="hotels-table"]');
    this.hotelRows = page.locator('[data-testid="hotel-row"]');
    this.searchInput = page.locator('[data-testid="search-hotels"]');
    this.statusFilter = page.locator('[data-testid="filter-status"]');
    this.cityFilter = page.locator('[data-testid="filter-city"]');
    this.refreshButton = page.locator('[data-testid="refresh-hotels"]');
    this.noDataMessage = page.locator('[data-testid="no-hotels"]');
    this.exportButton = page.locator('[data-testid="export-hotels"]');

    // Modal elements
    this.hotelDetailsModal = page.locator('[data-testid="hotel-details-modal"]');
    this.hotelStatusSelect = page.locator('[data-testid="hotel-status-select"]');
    this.saveStatusButton = page.locator('[data-testid="save-status"]');
  }

  /**
   * Navigate to hotel management page
   */
  async navigateTo(): Promise<void> {
    await this.goto('/admin/hotels');
    await this.waitForPageLoad();
  }

  /**
   * Verify page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toContainText('Hotel Management');
  }

  /**
   * Get all hotel rows
   */
  async getHotelRows(): Promise<Locator[]> {
    await this.hotelRows.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await this.hotelRows.count();
    const rows: Locator[] = [];
    
    for (let i = 0; i < count; i++) {
      rows.push(this.hotelRows.nth(i));
    }
    
    return rows;
  }

  /**
   * Find hotel by name
   */
  async findHotelByName(hotelName: string): Promise<Locator | null> {
    const rows = await this.getHotelRows();
    
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
   * View hotel details
   */
  async viewHotelDetails(hotelName: string): Promise<void> {
    const hotelRow = await this.findHotelByName(hotelName);
    
    if (!hotelRow) {
      throw new Error(`Hotel "${hotelName}" not found`);
    }

    await hotelRow.locator('[data-testid="view-details"]').click();
    await expect(this.hotelDetailsModal).toBeVisible();
  }

  /**
   * Update hotel status
   */
  async updateHotelStatus(hotelName: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<void> {
    await this.viewHotelDetails(hotelName);
    
    await this.hotelStatusSelect.selectOption(newStatus);
    await this.saveStatusButton.click();
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Wait for modal to close
    await expect(this.hotelDetailsModal).not.toBeVisible();
    
    // Wait for API response
    await this.waitForApiResponse('/api/admin/hotels');
  }

  /**
   * Search hotels
   */
  async searchHotels(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.waitForApiResponse('/api/admin/hotels');
  }

  /**
   * Filter hotels by status
   */
  async filterByStatus(status: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.waitForApiResponse('/api/admin/hotels');
  }

  /**
   * Filter hotels by city
   */
  async filterByCity(city: string): Promise<void> {
    await this.cityFilter.selectOption(city);
    await this.waitForApiResponse('/api/admin/hotels');
  }

  /**
   * Get hotel status
   */
  async getHotelStatus(hotelName: string): Promise<string> {
    const hotelRow = await this.findHotelByName(hotelName);
    
    if (!hotelRow) {
      throw new Error(`Hotel "${hotelName}" not found`);
    }

    const statusElement = hotelRow.locator('[data-testid="hotel-status"]');
    return await statusElement.textContent() || '';
  }

  /**
   * Get hotel owner information
   */
  async getHotelOwner(hotelName: string): Promise<string> {
    const hotelRow = await this.findHotelByName(hotelName);
    
    if (!hotelRow) {
      throw new Error(`Hotel "${hotelName}" not found`);
    }

    const ownerElement = hotelRow.locator('[data-testid="hotel-owner"]');
    return await ownerElement.textContent() || '';
  }

  /**
   * Get hotel location
   */
  async getHotelLocation(hotelName: string): Promise<string> {
    const hotelRow = await this.findHotelByName(hotelName);
    
    if (!hotelRow) {
      throw new Error(`Hotel "${hotelName}" not found`);
    }

    const locationElement = hotelRow.locator('[data-testid="hotel-location"]');
    return await locationElement.textContent() || '';
  }

  /**
   * Get hotel registration date
   */
  async getHotelRegistrationDate(hotelName: string): Promise<string> {
    const hotelRow = await this.findHotelByName(hotelName);
    
    if (!hotelRow) {
      throw new Error(`Hotel "${hotelName}" not found`);
    }

    const dateElement = hotelRow.locator('[data-testid="registration-date"]');
    return await dateElement.textContent() || '';
  }

  /**
   * Verify hotel exists
   */
  async verifyHotelExists(hotelName: string): Promise<void> {
    const hotel = await this.findHotelByName(hotelName);
    expect(hotel).not.toBeNull();
  }

  /**
   * Verify hotel does not exist
   */
  async verifyHotelNotExists(hotelName: string): Promise<void> {
    const hotel = await this.findHotelByName(hotelName);
    expect(hotel).toBeNull();
  }

  /**
   * Refresh hotels list
   */
  async refreshList(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForApiResponse('/api/admin/hotels');
  }

  /**
   * Export hotels data
   */
  async exportHotels(): Promise<void> {
    await this.exportButton.click();
    
    // Wait for download to start
    await this.page.waitForEvent('download');
  }

  /**
   * Get total number of hotels
   */
  async getTotalHotels(): Promise<number> {
    try {
      await this.hotelRows.first().waitFor({ state: 'visible', timeout: 5000 });
      return await this.hotelRows.count();
    } catch {
      return 0;
    }
  }

  /**
   * Get hotels by status count
   */
  async getHotelsByStatusCount(status: string): Promise<number> {
    await this.filterByStatus(status as any);
    return await this.getTotalHotels();
  }

  /**
   * Verify hotel details in modal
   */
  async verifyHotelDetailsModal(expectedDetails: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    status?: string;
  }): Promise<void> {
    await expect(this.hotelDetailsModal).toBeVisible();
    
    if (expectedDetails.name) {
      await expect(this.page.locator('[data-testid="modal-hotel-name"]'))
        .toContainText(expectedDetails.name);
    }
    
    if (expectedDetails.address) {
      await expect(this.page.locator('[data-testid="modal-hotel-address"]'))
        .toContainText(expectedDetails.address);
    }
    
    if (expectedDetails.city) {
      await expect(this.page.locator('[data-testid="modal-hotel-city"]'))
        .toContainText(expectedDetails.city);
    }
    
    if (expectedDetails.phone) {
      await expect(this.page.locator('[data-testid="modal-hotel-phone"]'))
        .toContainText(expectedDetails.phone);
    }
    
    if (expectedDetails.email) {
      await expect(this.page.locator('[data-testid="modal-hotel-email"]'))
        .toContainText(expectedDetails.email);
    }
    
    if (expectedDetails.status) {
      await expect(this.hotelStatusSelect)
        .toHaveValue(expectedDetails.status);
    }
  }

  /**
   * Close hotel details modal
   */
  async closeDetailsModal(): Promise<void> {
    await this.page.locator('[data-testid="close-modal"]').click();
    await expect(this.hotelDetailsModal).not.toBeVisible();
  }
}

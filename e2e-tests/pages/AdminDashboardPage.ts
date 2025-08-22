import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Admin Dashboard Page Object Model
 * Handles System Admin dashboard interactions and navigation
 */
export class AdminDashboardPage extends BasePage {
  
  // Locators
  private readonly pageTitle: Locator;
  private readonly statisticsCards: Locator;
  private readonly totalHotelsCard: Locator;
  private readonly totalUsersCard: Locator;
  private readonly activeBookingsCard: Locator;
  private readonly revenueCard: Locator;
  private readonly pendingRegistrationsCard: Locator;
  private readonly totalBookingsCard: Locator;
  private readonly recentActivitiesList: Locator;
  private readonly refreshButton: Locator;
  
  // Navigation links
  private readonly hotelRegistrationsLink: Locator;
  private readonly userManagementLink: Locator;
  private readonly hotelManagementLink: Locator;

  constructor(page: Page) {
    super(page);
    
    this.pageTitle = page.locator('[data-testid="admin-dashboard-title"]');
    this.statisticsCards = page.locator('[data-testid^="stats-card-"]'); // Cards that start with stats-card-
    this.totalHotelsCard = page.locator('[data-testid="total-hotels"]');
    this.totalUsersCard = page.locator('[data-testid="total-users"]');
    this.activeBookingsCard = page.locator('[data-testid="active-bookings"]');
    this.revenueCard = page.locator('[data-testid="revenue"]');
    this.pendingRegistrationsCard = page.locator('[data-testid="pending-registrations"]');
    this.totalBookingsCard = page.locator('[data-testid="total-bookings"]');
    this.recentActivitiesList = page.locator('[data-testid="recent-activities"]');
    this.refreshButton = page.locator('[data-testid="refresh-dashboard"]');
    
    // Navigation links - update to match system dashboard structure
    this.hotelRegistrationsLink = page.locator('[data-testid="nav-manage-hotels"]');
    this.userManagementLink = page.locator('[data-testid="nav-manage-users"]');
    this.hotelManagementLink = page.locator('[data-testid="nav-manage-hotels"]');
  }

  /**
   * Navigate to admin dashboard (system dashboard for system admin)
   */
  async navigateTo(): Promise<void> {
    await this.goto('/system-dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Verify page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toContainText('System Admin Dashboard');
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(): Promise<{
    totalHotels: number;
    totalUsers: number;
    activeBookings: number;
    revenue: string;
    pendingRegistrations: number;
    totalBookings: number;
  }> {
    // Wait for statistics to load
    await this.statisticsCards.first().waitFor({ state: 'visible', timeout: 10000 });
    
    const totalHotelsText = await this.totalHotelsCard.textContent() || '0';
    const totalUsersText = await this.totalUsersCard.textContent() || '0';
    const activeBookingsText = await this.activeBookingsCard.textContent() || '0';
    const revenueText = await this.revenueCard.textContent() || '$0';
    
    // Handle optional cards (they might not be present in all implementations)
    let pendingRegistrationsText = '0';
    let totalBookingsText = '0';
    
    try {
      pendingRegistrationsText = await this.pendingRegistrationsCard.textContent() || '0';
    } catch {
      // Card might not exist
    }
    
    try {
      totalBookingsText = await this.totalBookingsCard.textContent() || '0';
    } catch {
      // Card might not exist
    }
    
    return {
      totalHotels: this.extractNumber(totalHotelsText),
      totalUsers: this.extractNumber(totalUsersText),
      activeBookings: this.extractNumber(activeBookingsText),
      revenue: revenueText.trim(),
      pendingRegistrations: this.extractNumber(pendingRegistrationsText),
      totalBookings: this.extractNumber(totalBookingsText)
    };
  }

  /**
   * Navigate to hotel registrations from dashboard
   */
  async navigateToHotelRegistrations(): Promise<void> {
    await this.hotelRegistrationsLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to user management from dashboard
   */
  async navigateToUserManagement(): Promise<void> {
    await this.userManagementLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to hotel management from dashboard
   */
  async navigateToHotelManagement(): Promise<void> {
    await this.hotelManagementLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<string[]> {
    try {
      await this.recentActivitiesList.waitFor({ state: 'visible', timeout: 5000 });
      const activities = await this.recentActivitiesList.locator('li').allTextContents();
      return activities;
    } catch {
      // No activities or section doesn't exist
      return [];
    }
  }

  /**
   * Refresh dashboard data
   */
  async refreshDashboard(): Promise<void> {
    await this.refreshButton.click();
    
    // Wait for refresh to complete
    await this.waitForApiResponse('/api/admin/dashboard');
    
    // Wait for statistics to reload
    await this.statisticsCards.first().waitFor({ state: 'visible' });
  }

  /**
   * Verify dashboard shows expected sections
   */
  async verifyDashboardSections(): Promise<void> {
    const cardCount = await this.statisticsCards.count();
    expect(cardCount).toBeGreaterThan(0);
    await expect(this.totalHotelsCard).toBeVisible();
    await expect(this.totalUsersCard).toBeVisible();
    await expect(this.activeBookingsCard).toBeVisible();
  }

  /**
   * Get current page URL for navigation verification
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for statistics to update after an operation
   */
  async waitForStatisticsUpdate(): Promise<void> {
    await this.waitForApiResponse('/api/admin/dashboard');
    await this.page.waitForTimeout(1000); // Brief pause for UI update
  }

  /**
   * Helper method to extract numbers from text content
   */
  private extractNumber(text: string): number {
    const matches = text.match(/\d+/);
    return matches ? parseInt(matches[0], 10) : 0;
  }
}

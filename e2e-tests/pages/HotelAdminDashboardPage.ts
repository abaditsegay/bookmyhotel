import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface HotelAdminStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  totalBookings: number;
  totalRevenue: number;
  totalStaff: number;
}

export class HotelAdminDashboardPage extends BasePage {
  readonly dashboardContainer: Locator;
  readonly statsCards: Locator;
  readonly totalRoomsCard: Locator;
  readonly availableRoomsCard: Locator;
  readonly occupiedRoomsCard: Locator;
  readonly checkInsCard: Locator;
  readonly checkOutsCard: Locator;
  readonly bookingsCard: Locator;
  readonly revenueCard: Locator;
  readonly staffCard: Locator;
  readonly roomChartContainer: Locator;
  readonly bookingChartContainer: Locator;
  readonly recentActivitiesContainer: Locator;
  readonly refreshButton: Locator;
  readonly roomManagementLink: Locator;
  readonly bookingManagementLink: Locator;
  readonly staffManagementLink: Locator;
  readonly frontDeskLink: Locator;
  readonly reportsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardContainer = page.locator('[data-testid="hotel-admin-dashboard"]');
    this.statsCards = page.locator('[data-testid="stats-card"]');
    this.totalRoomsCard = page.locator('[data-testid="total-rooms-card"]');
    this.availableRoomsCard = page.locator('[data-testid="available-rooms-card"]');
    this.occupiedRoomsCard = page.locator('[data-testid="occupied-rooms-card"]');
    this.checkInsCard = page.locator('[data-testid="check-ins-card"]');
    this.checkOutsCard = page.locator('[data-testid="check-outs-card"]');
    this.bookingsCard = page.locator('[data-testid="bookings-card"]');
    this.revenueCard = page.locator('[data-testid="revenue-card"]');
    this.staffCard = page.locator('[data-testid="staff-card"]');
    this.roomChartContainer = page.locator('[data-testid="room-chart"]');
    this.bookingChartContainer = page.locator('[data-testid="booking-chart"]');
    this.recentActivitiesContainer = page.locator('[data-testid="recent-activities"]');
    this.refreshButton = page.locator('[data-testid="refresh-dashboard"]');
    this.roomManagementLink = page.locator('[data-testid="nav-room-management"]');
    this.bookingManagementLink = page.locator('[data-testid="nav-booking-management"]');
    this.staffManagementLink = page.locator('[data-testid="nav-staff-management"]');
    this.frontDeskLink = page.locator('[data-testid="nav-front-desk"]');
    this.reportsLink = page.locator('[data-testid="nav-reports"]');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/hotel-admin/dashboard');
    await this.waitForPageLoad();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.dashboardContainer).toBeVisible();
    await expect(this.statsCards.first()).toBeVisible();
  }

  async getDashboardStatistics(): Promise<HotelAdminStats> {
    await this.verifyPageLoaded();
    
    const totalRooms = await this.getCardValue(this.totalRoomsCard);
    const availableRooms = await this.getCardValue(this.availableRoomsCard);
    const occupiedRooms = await this.getCardValue(this.occupiedRoomsCard);
    const todayCheckIns = await this.getCardValue(this.checkInsCard);
    const todayCheckOuts = await this.getCardValue(this.checkOutsCard);
    const totalBookings = await this.getCardValue(this.bookingsCard);
    const totalRevenue = await this.getCardValue(this.revenueCard);
    const totalStaff = await this.getCardValue(this.staffCard);

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      todayCheckIns,
      todayCheckOuts,
      totalBookings,
      totalRevenue,
      totalStaff
    };
  }

  private async getCardValue(card: Locator): Promise<number> {
    const valueElement = card.locator('[data-testid="card-value"]');
    const text = await valueElement.textContent();
    const numericValue = text?.replace(/[^0-9.-]/g, '') || '0';
    return parseFloat(numericValue);
  }

  async refreshDashboard(): Promise<void> {
    await this.refreshButton.click();
    await this.waitForPageLoad();
  }

  async navigateToRoomManagement(): Promise<void> {
    await this.roomManagementLink.click();
    await this.waitForPageLoad();
  }

  async navigateToBookingManagement(): Promise<void> {
    await this.bookingManagementLink.click();
    await this.waitForPageLoad();
  }

  async navigateToStaffManagement(): Promise<void> {
    await this.staffManagementLink.click();
    await this.waitForPageLoad();
  }

  async navigateToFrontDesk(): Promise<void> {
    await this.frontDeskLink.click();
    await this.waitForPageLoad();
  }

  async navigateToReports(): Promise<void> {
    await this.reportsLink.click();
    await this.waitForPageLoad();
  }

  async getRecentActivities(): Promise<string[]> {
    const activities = await this.recentActivitiesContainer
      .locator('[data-testid="activity-item"]')
      .allTextContents();
    return activities;
  }

  async verifyRoomStatusChart(): Promise<void> {
    await expect(this.roomChartContainer).toBeVisible();
    const chartCanvas = this.roomChartContainer.locator('canvas');
    await expect(chartCanvas).toBeVisible();
  }

  async verifyBookingTrendsChart(): Promise<void> {
    await expect(this.bookingChartContainer).toBeVisible();
    const chartCanvas = this.bookingChartContainer.locator('canvas');
    await expect(chartCanvas).toBeVisible();
  }

  async exportDashboardData(): Promise<void> {
    const exportButton = this.page.locator('[data-testid="export-dashboard"]');
    await exportButton.click();
    
    // Wait for download to start
    await this.page.waitForTimeout(1000);
  }
}

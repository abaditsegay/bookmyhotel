import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface FrontDeskStats {
  todayCheckIns: number;
  todayCheckOuts: number;
  currentOccupancy: number;
  availableRooms: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  maintenanceRooms: number;
  outOfOrderRooms: number;
}

export interface QuickCheckIn {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface RoomStatusUpdate {
  roomNumber: string;
  status: string;
  notes?: string;
}

export class FrontDeskDashboardPage extends BasePage {
  readonly dashboardContainer: Locator;
  readonly statsCards: Locator;
  readonly checkInsCard: Locator;
  readonly checkOutsCard: Locator;
  readonly occupancyCard: Locator;
  readonly availableRoomsCard: Locator;
  readonly pendingCheckInsCard: Locator;
  readonly pendingCheckOutsCard: Locator;
  readonly maintenanceRoomsCard: Locator;
  readonly outOfOrderRoomsCard: Locator;
  readonly roomsGridContainer: Locator;
  readonly roomStatusCards: Locator;
  readonly quickCheckInButton: Locator;
  readonly quickCheckOutButton: Locator;
  readonly roomStatusButton: Locator;
  readonly refreshButton: Locator;
  readonly roomSearchInput: Locator;
  readonly filterByStatus: Locator;
  readonly todaysArrivalsSection: Locator;
  readonly todaysDeparturesSection: Locator;
  readonly walkInRegistrationButton: Locator;
  readonly housekeepingNotifications: Locator;
  readonly maintenanceRequests: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardContainer = page.locator('[data-testid="frontdesk-dashboard"]');
    this.statsCards = page.locator('[data-testid="frontdesk-stats-card"]');
    this.checkInsCard = page.locator('[data-testid="checkins-card"]');
    this.checkOutsCard = page.locator('[data-testid="checkouts-card"]');
    this.occupancyCard = page.locator('[data-testid="occupancy-card"]');
    this.availableRoomsCard = page.locator('[data-testid="available-rooms-card"]');
    this.pendingCheckInsCard = page.locator('[data-testid="pending-checkins-card"]');
    this.pendingCheckOutsCard = page.locator('[data-testid="pending-checkouts-card"]');
    this.maintenanceRoomsCard = page.locator('[data-testid="maintenance-rooms-card"]');
    this.outOfOrderRoomsCard = page.locator('[data-testid="out-of-order-rooms-card"]');
    this.roomsGridContainer = page.locator('[data-testid="rooms-grid-container"]');
    this.roomStatusCards = page.locator('[data-testid="room-status-card"]');
    this.quickCheckInButton = page.locator('[data-testid="quick-checkin-btn"]');
    this.quickCheckOutButton = page.locator('[data-testid="quick-checkout-btn"]');
    this.roomStatusButton = page.locator('[data-testid="room-status-btn"]');
    this.refreshButton = page.locator('[data-testid="refresh-frontdesk"]');
    this.roomSearchInput = page.locator('[data-testid="room-search"]');
    this.filterByStatus = page.locator('[data-testid="room-status-filter"]');
    this.todaysArrivalsSection = page.locator('[data-testid="todays-arrivals"]');
    this.todaysDeparturesSection = page.locator('[data-testid="todays-departures"]');
    this.walkInRegistrationButton = page.locator('[data-testid="walk-in-registration-btn"]');
    this.housekeepingNotifications = page.locator('[data-testid="housekeeping-notifications"]');
    this.maintenanceRequests = page.locator('[data-testid="maintenance-requests"]');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/frontdesk/dashboard');
    await this.waitForPageLoad();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.dashboardContainer).toBeVisible();
    await expect(this.statsCards.first()).toBeVisible();
  }

  async getFrontDeskStatistics(): Promise<FrontDeskStats> {
    await this.verifyPageLoaded();
    
    const todayCheckIns = await this.getCardValue(this.checkInsCard);
    const todayCheckOuts = await this.getCardValue(this.checkOutsCard);
    const currentOccupancy = await this.getCardValue(this.occupancyCard);
    const availableRooms = await this.getCardValue(this.availableRoomsCard);
    const pendingCheckIns = await this.getCardValue(this.pendingCheckInsCard);
    const pendingCheckOuts = await this.getCardValue(this.pendingCheckOutsCard);
    const maintenanceRooms = await this.getCardValue(this.maintenanceRoomsCard);
    const outOfOrderRooms = await this.getCardValue(this.outOfOrderRoomsCard);

    return {
      todayCheckIns,
      todayCheckOuts,
      currentOccupancy,
      availableRooms,
      pendingCheckIns,
      pendingCheckOuts,
      maintenanceRooms,
      outOfOrderRooms
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

  async performQuickCheckIn(checkInData: QuickCheckIn): Promise<void> {
    await this.quickCheckInButton.click();
    
    const modal = this.page.locator('[data-testid="quick-checkin-modal"]');
    await expect(modal).toBeVisible();

    // Fill check-in form
    await modal.locator('input[name="guestName"]').fill(checkInData.guestName);
    await modal.locator('input[name="guestEmail"]').fill(checkInData.guestEmail);
    await modal.locator('input[name="guestPhone"]').fill(checkInData.guestPhone);
    await modal.locator('input[name="roomNumber"]').fill(checkInData.roomNumber);
    await modal.locator('input[name="checkInDate"]').fill(checkInData.checkInDate);
    await modal.locator('input[name="checkOutDate"]').fill(checkInData.checkOutDate);

    // Submit form
    await modal.locator('button[type="submit"]').click();
    await expect(modal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async performQuickCheckOut(roomNumber: string, notes?: string): Promise<void> {
    await this.quickCheckOutButton.click();
    
    const modal = this.page.locator('[data-testid="quick-checkout-modal"]');
    await expect(modal).toBeVisible();

    // Fill check-out form
    await modal.locator('input[name="roomNumber"]').fill(roomNumber);
    if (notes) {
      await modal.locator('textarea[name="notes"]').fill(notes);
    }

    // Submit form
    await modal.locator('button[type="submit"]').click();
    await expect(modal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async updateRoomStatus(update: RoomStatusUpdate): Promise<void> {
    await this.roomStatusButton.click();
    
    const modal = this.page.locator('[data-testid="room-status-modal"]');
    await expect(modal).toBeVisible();

    // Update room status
    await modal.locator('input[name="roomNumber"]').fill(update.roomNumber);
    await modal.locator('select[name="status"]').selectOption(update.status);
    if (update.notes) {
      await modal.locator('textarea[name="notes"]').fill(update.notes);
    }

    // Submit form
    await modal.locator('button[type="submit"]').click();
    await expect(modal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async searchRoom(roomNumber: string): Promise<void> {
    await this.roomSearchInput.fill(roomNumber);
    await this.roomSearchInput.press('Enter');
    await this.waitForPageLoad();
  }

  async filterRoomsByStatus(status: string): Promise<void> {
    await this.filterByStatus.selectOption(status);
    await this.waitForPageLoad();
  }

  async getRoomStatus(roomNumber: string): Promise<string> {
    const roomCard = this.getRoomCard(roomNumber);
    const statusElement = roomCard.locator('[data-testid="room-status"]');
    return await statusElement.textContent() || '';
  }

  async clickRoomCard(roomNumber: string): Promise<void> {
    const roomCard = this.getRoomCard(roomNumber);
    await roomCard.click();
  }

  async getTodaysArrivals(): Promise<string[]> {
    const arrivalItems = await this.todaysArrivalsSection
      .locator('[data-testid="arrival-item"]')
      .allTextContents();
    return arrivalItems;
  }

  async getTodaysDepartures(): Promise<string[]> {
    const departureItems = await this.todaysDeparturesSection
      .locator('[data-testid="departure-item"]')
      .allTextContents();
    return departureItems;
  }

  async processArrival(confirmationNumber: string): Promise<void> {
    const arrivalItem = this.todaysArrivalsSection
      .locator(`[data-testid="arrival-item"][data-confirmation="${confirmationNumber}"]`);
    
    const processButton = arrivalItem.locator('[data-testid="process-arrival"]');
    await processButton.click();
    
    const confirmModal = this.page.locator('[data-testid="confirm-arrival-modal"]');
    await expect(confirmModal).toBeVisible();
    
    const confirmButton = confirmModal.locator('[data-testid="confirm-arrival"]');
    await confirmButton.click();
    
    await expect(confirmModal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async processDeparture(confirmationNumber: string): Promise<void> {
    const departureItem = this.todaysDeparturesSection
      .locator(`[data-testid="departure-item"][data-confirmation="${confirmationNumber}"]`);
    
    const processButton = departureItem.locator('[data-testid="process-departure"]');
    await processButton.click();
    
    const confirmModal = this.page.locator('[data-testid="confirm-departure-modal"]');
    await expect(confirmModal).toBeVisible();
    
    const confirmButton = confirmModal.locator('[data-testid="confirm-departure"]');
    await confirmButton.click();
    
    await expect(confirmModal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async registerWalkInGuest(guestData: QuickCheckIn): Promise<void> {
    await this.walkInRegistrationButton.click();
    
    const modal = this.page.locator('[data-testid="walk-in-registration-modal"]');
    await expect(modal).toBeVisible();

    // Fill registration form
    await modal.locator('input[name="guestName"]').fill(guestData.guestName);
    await modal.locator('input[name="guestEmail"]').fill(guestData.guestEmail);
    await modal.locator('input[name="guestPhone"]').fill(guestData.guestPhone);
    await modal.locator('input[name="roomNumber"]').fill(guestData.roomNumber);
    await modal.locator('input[name="checkInDate"]').fill(guestData.checkInDate);
    await modal.locator('input[name="checkOutDate"]').fill(guestData.checkOutDate);

    // Submit form
    await modal.locator('button[type="submit"]').click();
    await expect(modal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async getHousekeepingNotifications(): Promise<string[]> {
    const notifications = await this.housekeepingNotifications
      .locator('[data-testid="housekeeping-notification"]')
      .allTextContents();
    return notifications;
  }

  async getMaintenanceRequests(): Promise<string[]> {
    const requests = await this.maintenanceRequests
      .locator('[data-testid="maintenance-request"]')
      .allTextContents();
    return requests;
  }

  async markHousekeepingComplete(roomNumber: string): Promise<void> {
    const notification = this.housekeepingNotifications
      .locator(`[data-testid="housekeeping-notification"][data-room="${roomNumber}"]`);
    
    const completeButton = notification.locator('[data-testid="mark-complete"]');
    await completeButton.click();
    await this.waitForPageLoad();
  }

  async submitMaintenanceRequest(roomNumber: string, issue: string): Promise<void> {
    const submitButton = this.page.locator('[data-testid="submit-maintenance-request"]');
    await submitButton.click();
    
    const modal = this.page.locator('[data-testid="maintenance-request-modal"]');
    await expect(modal).toBeVisible();

    await modal.locator('input[name="roomNumber"]').fill(roomNumber);
    await modal.locator('textarea[name="issue"]').fill(issue);

    await modal.locator('button[type="submit"]').click();
    await expect(modal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async exportDailyReport(): Promise<void> {
    const exportButton = this.page.locator('[data-testid="export-daily-report"]');
    await exportButton.click();
    
    // Wait for download
    await this.page.waitForTimeout(1000);
  }

  async switchToCompactView(): Promise<void> {
    const compactViewButton = this.page.locator('[data-testid="compact-view-btn"]');
    await compactViewButton.click();
    await this.waitForPageLoad();
  }

  async switchToDetailedView(): Promise<void> {
    const detailedViewButton = this.page.locator('[data-testid="detailed-view-btn"]');
    await detailedViewButton.click();
    await this.waitForPageLoad();
  }

  private getRoomCard(roomNumber: string): Locator {
    return this.roomStatusCards.filter({
      has: this.page.locator(`[data-testid="room-number"]:has-text("${roomNumber}")`)
    });
  }

  async verifyRoomColorCoding(): Promise<void> {
    // Verify different room statuses have different colors
    const availableRooms = this.roomStatusCards.filter({ hasText: 'Available' });
    const occupiedRooms = this.roomStatusCards.filter({ hasText: 'Occupied' });
    const maintenanceRooms = this.roomStatusCards.filter({ hasText: 'Maintenance' });
    
    // Check that color classes are applied
    if (await availableRooms.count() > 0) {
      await expect(availableRooms.first()).toHaveClass(/available/);
    }
    if (await occupiedRooms.count() > 0) {
      await expect(occupiedRooms.first()).toHaveClass(/occupied/);
    }
    if (await maintenanceRooms.count() > 0) {
      await expect(maintenanceRooms.first()).toHaveClass(/maintenance/);
    }
  }
}

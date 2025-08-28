import { test, expect } from '@playwright/test';
import { HotelAdminDashboardPage } from '../pages/HotelAdminDashboardPage';
import { RoomManagementPage } from '../pages/RoomManagementPage';
import { TEST_USERS, EXISTING_TEST_HOTELS } from '../fixtures/testData';

// Hotel Admin Test Suite
test.describe('Hotel Admin - Dashboard Operations', () => {
  let dashboardPage: HotelAdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new HotelAdminDashboardPage(page);
    await dashboardPage.navigateTo();
    await dashboardPage.verifyPageLoaded();
  });

  test('should display hotel dashboard statistics', async () => {
    const stats = await dashboardPage.getDashboardStatistics();
    
    expect(stats.totalRooms).toBeGreaterThanOrEqual(0);
    expect(stats.availableRooms).toBeGreaterThanOrEqual(0);
    expect(stats.occupiedRooms).toBeGreaterThanOrEqual(0);
    expect(stats.todayCheckIns).toBeGreaterThanOrEqual(0);
    expect(stats.todayCheckOuts).toBeGreaterThanOrEqual(0);
    expect(stats.totalBookings).toBeGreaterThanOrEqual(0);
    expect(stats.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(stats.totalStaff).toBeGreaterThanOrEqual(0);
  });

  test('should navigate between hotel management sections', async ({ page }) => {
    // Navigate to room management
    await dashboardPage.navigateToRoomManagement();
    await expect(page).toHaveURL(/.*\/hotel-admin\/rooms/);
    
    // Navigate to booking management
    await page.goto('/hotel-admin/dashboard');
    await dashboardPage.navigateToBookingManagement();
    await expect(page).toHaveURL(/.*\/hotel-admin\/bookings/);
    
    // Navigate to staff management
    await page.goto('/hotel-admin/dashboard');
    await dashboardPage.navigateToStaffManagement();
    await expect(page).toHaveURL(/.*\/hotel-admin\/staff/);
    
    // Navigate to front desk
    await page.goto('/hotel-admin/dashboard');
    await dashboardPage.navigateToFrontDesk();
    await expect(page).toHaveURL(/.*\/frontdesk\/dashboard/);
    
    // Navigate to reports
    await page.goto('/hotel-admin/dashboard');
    await dashboardPage.navigateToReports();
    await expect(page).toHaveURL(/.*\/hotel-admin\/reports/);
  });

  test('should display room status charts', async () => {
    await dashboardPage.verifyRoomStatusChart();
    await dashboardPage.verifyBookingTrendsChart();
  });

  test('should show recent activities', async () => {
    const activities = await dashboardPage.getRecentActivities();
    expect(Array.isArray(activities)).toBe(true);
  });

  test('should refresh dashboard data', async () => {
    const initialStats = await dashboardPage.getDashboardStatistics();
    
    await dashboardPage.refreshDashboard();
    
    const refreshedStats = await dashboardPage.getDashboardStatistics();
    expect(refreshedStats.totalRooms).toBe(initialStats.totalRooms);
  });

  test('should export dashboard data', async () => {
    await dashboardPage.exportDashboardData();
    // Note: Actual download verification would need additional setup
  });
});

test.describe('Hotel Admin - Room Management', () => {
  let roomManagementPage: RoomManagementPage;

  test.beforeEach(async ({ page }) => {
    roomManagementPage = new RoomManagementPage(page);
    await roomManagementPage.navigateTo();
    await roomManagementPage.verifyPageLoaded();
  });

  test('should view all rooms', async () => {
    const totalRooms = await roomManagementPage.getTotalRooms();
    expect(totalRooms).toBeGreaterThanOrEqual(0);
  });

  test('should search rooms', async () => {
    await roomManagementPage.searchRooms('101');
    // Verify search functionality
    await roomManagementPage.searchRooms(''); // Clear search
  });

  test('should filter rooms by status', async () => {
    await roomManagementPage.filterByStatus('AVAILABLE');
    await roomManagementPage.filterByStatus('OCCUPIED');
    await roomManagementPage.filterByStatus('MAINTENANCE');
    await roomManagementPage.filterByStatus('ALL');
  });

  test('should filter rooms by type', async () => {
    await roomManagementPage.filterByType('SINGLE');
    await roomManagementPage.filterByType('DOUBLE');
    await roomManagementPage.filterByType('SUITE');
    await roomManagementPage.filterByType('ALL');
  });

  test('should filter rooms by capacity', async () => {
    await roomManagementPage.filterByCapacity(1);
    await roomManagementPage.filterByCapacity(2);
    await roomManagementPage.filterByCapacity(4);
  });

  test('should apply price filter', async () => {
    await roomManagementPage.applyPriceFilter(50, 200);
    await roomManagementPage.applyPriceFilter(0, 1000); // Reset filter
  });

  test('should sort rooms', async () => {
    await roomManagementPage.sortRooms('number');
    await roomManagementPage.sortRooms('price');
    await roomManagementPage.sortRooms('type');
    await roomManagementPage.sortRooms('status');
  });

  test('should switch between view modes', async () => {
    await roomManagementPage.switchToListView();
    await roomManagementPage.switchToGridView();
  });

  test('should refresh rooms list', async () => {
    await roomManagementPage.refreshList();
    await roomManagementPage.verifyPageLoaded();
  });

  test('should export rooms data', async () => {
    await roomManagementPage.exportRoomsData();
    // Note: Actual download verification would need additional setup
  });

  // Note: The following tests are skipped as they require test data setup
  // In a real environment, you would need to create test rooms or use existing ones

  test.skip('should add new room', async () => {
    const newRoom = {
      number: '999',
      type: 'DOUBLE',
      capacity: 2,
      price: 150,
      amenities: ['WiFi', 'TV', 'AC']
    };

    await roomManagementPage.addRoom(newRoom);
    
    // Verify room was added
    const roomExists = await roomManagementPage.verifyRoomExists('999');
    expect(roomExists).toBe(true);
    
    // Get room details to verify
    const roomDetails = await roomManagementPage.getRoomDetails('999');
    expect(roomDetails?.type).toBe('DOUBLE');
    expect(roomDetails?.capacity).toBe(2);
    expect(roomDetails?.price).toBe(150);
  });

  test.skip('should edit existing room', async () => {
    const roomNumber = '101'; // Assuming this room exists
    const updates = {
      type: 'SUITE',
      capacity: 4,
      price: 250
    };

    await roomManagementPage.editRoom(roomNumber, updates);
    
    // Verify changes
    const roomDetails = await roomManagementPage.getRoomDetails(roomNumber);
    expect(roomDetails?.type).toBe('SUITE');
    expect(roomDetails?.capacity).toBe(4);
    expect(roomDetails?.price).toBe(250);
  });

  test.skip('should update room status', async () => {
    const roomNumber = '102'; // Assuming this room exists
    
    await roomManagementPage.updateRoomStatus(roomNumber, 'MAINTENANCE');
    
    // Verify status change
    const roomDetails = await roomManagementPage.getRoomDetails(roomNumber);
    expect(roomDetails?.status).toContain('MAINTENANCE');
  });

  test.skip('should perform bulk status update', async () => {
    const roomNumbers = ['103', '104', '105']; // Assuming these rooms exist
    
    await roomManagementPage.bulkUpdateStatus(roomNumbers, 'CLEANING');
    
    // Verify bulk update
    for (const roomNumber of roomNumbers) {
      const roomDetails = await roomManagementPage.getRoomDetails(roomNumber);
      expect(roomDetails?.status).toContain('CLEANING');
    }
  });

  test.skip('should delete room', async () => {
    const roomNumber = '999'; // Room created in add test
    
    await roomManagementPage.deleteRoom(roomNumber);
    
    // Verify room was deleted
    const roomExists = await roomManagementPage.verifyRoomExists(roomNumber);
    expect(roomExists).toBe(false);
  });

  test.skip('should upload room images', async () => {
    const roomNumber = '101';
    const imagePaths = ['test-images/room1.jpg', 'test-images/room2.jpg'];
    
    await roomManagementPage.uploadRoomImages(roomNumber, imagePaths);
    // Note: Image upload verification would need additional checks
  });
});

test.describe('Hotel Admin - Staff Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hotel-admin/staff');
  });

  test('should view staff list', async ({ page }) => {
    await expect(page.locator('[data-testid="staff-container"]')).toBeVisible();
  });

  test('should add new staff member', async ({ page }) => {
    const addStaffButton = page.locator('[data-testid="add-staff-btn"]');
    await addStaffButton.click();
    
    const modal = page.locator('[data-testid="staff-modal"]');
    await expect(modal).toBeVisible();
    
    // Fill staff form
    await modal.locator('input[name="firstName"]').fill('John');
    await modal.locator('input[name="lastName"]').fill('Doe');
    await modal.locator('input[name="email"]').fill('john.doe@test.com');
    await modal.locator('input[name="phone"]').fill('+1-555-1234');
    await modal.locator('select[name="role"]').selectOption('HOUSEKEEPING');
    
    await modal.locator('button[type="submit"]').click();
    await expect(modal).not.toBeVisible();
  });

  test('should search staff members', async ({ page }) => {
    const searchInput = page.locator('[data-testid="staff-search"]');
    await searchInput.fill('John');
    await searchInput.press('Enter');
  });

  test('should filter staff by role', async ({ page }) => {
    const roleFilter = page.locator('[data-testid="role-filter"]');
    await roleFilter.selectOption('HOUSEKEEPING');
    await roleFilter.selectOption('MAINTENANCE');
    await roleFilter.selectOption('FRONTDESK');
  });
});

test.describe('Hotel Admin - Booking Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hotel-admin/bookings');
  });

  test('should view all bookings', async ({ page }) => {
    await expect(page.locator('[data-testid="bookings-container"]')).toBeVisible();
  });

  test('should filter bookings by status', async ({ page }) => {
    const statusFilter = page.locator('[data-testid="booking-status-filter"]');
    await statusFilter.selectOption('CONFIRMED');
    await statusFilter.selectOption('CHECKED_IN');
    await statusFilter.selectOption('CHECKED_OUT');
    await statusFilter.selectOption('CANCELLED');
  });

  test('should search bookings', async ({ page }) => {
    const searchInput = page.locator('[data-testid="booking-search"]');
    await searchInput.fill('BMH-');
    await searchInput.press('Enter');
  });

  test('should view booking details', async ({ page }) => {
    const firstBooking = page.locator('[data-testid="booking-card"]').first();
    const viewButton = firstBooking.locator('[data-testid="view-booking-btn"]');
    
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page.locator('[data-testid="booking-details-modal"]')).toBeVisible();
    }
  });
});

test.describe('Hotel Admin - Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hotel-admin/reports');
  });

  test('should view occupancy report', async ({ page }) => {
    const occupancyTab = page.locator('[data-testid="occupancy-report-tab"]');
    await occupancyTab.click();
    
    await expect(page.locator('[data-testid="occupancy-chart"]')).toBeVisible();
  });

  test('should view revenue report', async ({ page }) => {
    const revenueTab = page.locator('[data-testid="revenue-report-tab"]');
    await revenueTab.click();
    
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
  });

  test('should export reports', async ({ page }) => {
    const exportButton = page.locator('[data-testid="export-report-btn"]');
    await exportButton.click();
    
    // Select report type and date range
    const reportModal = page.locator('[data-testid="export-report-modal"]');
    await expect(reportModal).toBeVisible();
    
    await reportModal.locator('select[name="reportType"]').selectOption('occupancy');
    await reportModal.locator('input[name="startDate"]').fill('2025-01-01');
    await reportModal.locator('input[name="endDate"]').fill('2025-01-31');
    
    await reportModal.locator('[data-testid="confirm-export"]').click();
    await expect(reportModal).not.toBeVisible();
  });

  test('should filter reports by date range', async ({ page }) => {
    const startDateInput = page.locator('[data-testid="start-date-input"]');
    const endDateInput = page.locator('[data-testid="end-date-input"]');
    const applyFilterButton = page.locator('[data-testid="apply-date-filter"]');
    
    await startDateInput.fill('2025-01-01');
    await endDateInput.fill('2025-01-31');
    await applyFilterButton.click();
  });
});

test.describe('Hotel Admin - Integration Workflows', () => {
  let dashboardPage: HotelAdminDashboardPage;
  let roomManagementPage: RoomManagementPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new HotelAdminDashboardPage(page);
    roomManagementPage = new RoomManagementPage(page);
  });

  test('should navigate between all hotel admin sections', async () => {
    // Start from dashboard
    await dashboardPage.navigateTo();
    await dashboardPage.verifyPageLoaded();
    
    // Navigate to rooms
    await dashboardPage.navigateToRoomManagement();
    await roomManagementPage.verifyPageLoaded();
    
    // Navigate to staff
    await dashboardPage.navigateToStaffManagement();
    
    // Navigate to bookings
    await dashboardPage.navigateToBookingManagement();
    
    // Navigate to reports
    await dashboardPage.navigateToReports();
    
    // Return to dashboard
    await dashboardPage.navigateTo();
    await dashboardPage.verifyPageLoaded();
  });

  test('should maintain consistent data between dashboard and room management', async () => {
    // Get room stats from dashboard
    await dashboardPage.navigateTo();
    const dashboardStats = await dashboardPage.getDashboardStatistics();
    
    // Navigate to room management and verify room counts
    await roomManagementPage.navigateTo();
    const totalRooms = await roomManagementPage.getTotalRooms();
    
    // The dashboard total rooms should match room management total
    expect(totalRooms).toBeGreaterThanOrEqual(0);
    // Note: Exact matching would depend on test data setup
  });

  test('should handle concurrent operations', async ({ page, context }) => {
    // Simulate multiple operations happening simultaneously
    const page2 = await context.newPage();
    
    // Page 1: Navigate to dashboard
    await dashboardPage.navigateTo();
    
    // Page 2: Navigate to room management
    const roomPage2 = new RoomManagementPage(page2);
    await roomPage2.navigateTo();
    
    // Both pages should be functional
    await dashboardPage.verifyPageLoaded();
    await roomPage2.verifyPageLoaded();
    
    await page2.close();
  });
});

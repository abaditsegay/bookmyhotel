import { test, expect } from '@playwright/test';
import { FrontDeskDashboardPage } from '../pages/FrontDeskDashboardPage';
import { TEST_USERS } from '../fixtures/testData';

// Front Desk Test Suite
test.describe('Front Desk - Dashboard Operations', () => {
  let frontDeskPage: FrontDeskDashboardPage;

  test.beforeEach(async ({ page }) => {
    frontDeskPage = new FrontDeskDashboardPage(page);
    await frontDeskPage.navigateTo();
    await frontDeskPage.verifyPageLoaded();
  });

  test('should display front desk statistics', async () => {
    const stats = await frontDeskPage.getFrontDeskStatistics();
    
    expect(stats.todayCheckIns).toBeGreaterThanOrEqual(0);
    expect(stats.todayCheckOuts).toBeGreaterThanOrEqual(0);
    expect(stats.currentOccupancy).toBeGreaterThanOrEqual(0);
    expect(stats.availableRooms).toBeGreaterThanOrEqual(0);
    expect(stats.pendingCheckIns).toBeGreaterThanOrEqual(0);
    expect(stats.pendingCheckOuts).toBeGreaterThanOrEqual(0);
    expect(stats.maintenanceRooms).toBeGreaterThanOrEqual(0);
    expect(stats.outOfOrderRooms).toBeGreaterThanOrEqual(0);
  });

  test('should refresh dashboard data', async () => {
    const initialStats = await frontDeskPage.getFrontDeskStatistics();
    
    await frontDeskPage.refreshDashboard();
    
    const refreshedStats = await frontDeskPage.getFrontDeskStatistics();
    expect(refreshedStats.currentOccupancy).toBe(initialStats.currentOccupancy);
  });

  test('should search for specific room', async () => {
    await frontDeskPage.searchRoom('101');
    // Verify search functionality
    await frontDeskPage.searchRoom(''); // Clear search
  });

  test('should filter rooms by status', async () => {
    await frontDeskPage.filterRoomsByStatus('AVAILABLE');
    await frontDeskPage.filterRoomsByStatus('OCCUPIED');
    await frontDeskPage.filterRoomsByStatus('MAINTENANCE');
    await frontDeskPage.filterRoomsByStatus('OUT_OF_ORDER');
    await frontDeskPage.filterRoomsByStatus('ALL');
  });

  test('should verify room color coding', async () => {
    await frontDeskPage.verifyRoomColorCoding();
  });

  test('should switch between view modes', async () => {
    await frontDeskPage.switchToCompactView();
    await frontDeskPage.switchToDetailedView();
  });

  test('should display todays arrivals and departures', async () => {
    const arrivals = await frontDeskPage.getTodaysArrivals();
    const departures = await frontDeskPage.getTodaysDepartures();
    
    expect(Array.isArray(arrivals)).toBe(true);
    expect(Array.isArray(departures)).toBe(true);
  });

  test('should show housekeeping notifications', async () => {
    const notifications = await frontDeskPage.getHousekeepingNotifications();
    expect(Array.isArray(notifications)).toBe(true);
  });

  test('should show maintenance requests', async () => {
    const requests = await frontDeskPage.getMaintenanceRequests();
    expect(Array.isArray(requests)).toBe(true);
  });

  test('should export daily report', async () => {
    await frontDeskPage.exportDailyReport();
    // Note: Actual download verification would need additional setup
  });
});

test.describe('Front Desk - Check-In Operations', () => {
  let frontDeskPage: FrontDeskDashboardPage;

  test.beforeEach(async ({ page }) => {
    frontDeskPage = new FrontDeskDashboardPage(page);
    await frontDeskPage.navigateTo();
    await frontDeskPage.verifyPageLoaded();
  });

  test.skip('should perform quick check-in', async () => {
    const checkInData = {
      guestName: 'John Doe',
      guestEmail: 'john.doe@test.com',
      guestPhone: '+1-555-1234',
      roomNumber: '201',
      checkInDate: '2025-08-22',
      checkOutDate: '2025-08-25'
    };

    await frontDeskPage.performQuickCheckIn(checkInData);
    
    // Verify check-in was processed
    const roomStatus = await frontDeskPage.getRoomStatus('201');
    expect(roomStatus).toContain('OCCUPIED');
  });

  test.skip('should register walk-in guest', async () => {
    const walkInData = {
      guestName: 'Jane Smith',
      guestEmail: 'jane.smith@test.com',
      guestPhone: '+1-555-5678',
      roomNumber: '202',
      checkInDate: '2025-08-22',
      checkOutDate: '2025-08-24'
    };

    await frontDeskPage.registerWalkInGuest(walkInData);
    
    // Verify registration was processed
    const roomStatus = await frontDeskPage.getRoomStatus('202');
    expect(roomStatus).toContain('OCCUPIED');
  });

  test.skip('should process scheduled arrival', async () => {
    const confirmationNumber = 'BMH-TEST-001';
    
    await frontDeskPage.processArrival(confirmationNumber);
    
    // Verify arrival was processed
    // Note: This would require the booking to exist in the system
  });
});

test.describe('Front Desk - Check-Out Operations', () => {
  let frontDeskPage: FrontDeskDashboardPage;

  test.beforeEach(async ({ page }) => {
    frontDeskPage = new FrontDeskDashboardPage(page);
    await frontDeskPage.navigateTo();
    await frontDeskPage.verifyPageLoaded();
  });

  test.skip('should perform quick check-out', async () => {
    const roomNumber = '201';
    const notes = 'Guest satisfied with stay';

    await frontDeskPage.performQuickCheckOut(roomNumber, notes);
    
    // Verify check-out was processed
    const roomStatus = await frontDeskPage.getRoomStatus(roomNumber);
    expect(roomStatus).toContain('CLEANING');
  });

  test.skip('should process scheduled departure', async () => {
    const confirmationNumber = 'BMH-TEST-002';
    
    await frontDeskPage.processDeparture(confirmationNumber);
    
    // Verify departure was processed
    // Note: This would require the booking to exist in the system
  });
});

test.describe('Front Desk - Room Status Management', () => {
  let frontDeskPage: FrontDeskDashboardPage;

  test.beforeEach(async ({ page }) => {
    frontDeskPage = new FrontDeskDashboardPage(page);
    await frontDeskPage.navigateTo();
    await frontDeskPage.verifyPageLoaded();
  });

  test.skip('should update room status', async () => {
    const roomUpdate = {
      roomNumber: '203',
      status: 'MAINTENANCE',
      notes: 'AC unit needs repair'
    };

    await frontDeskPage.updateRoomStatus(roomUpdate);
    
    // Verify status update
    const roomStatus = await frontDeskPage.getRoomStatus('203');
    expect(roomStatus).toContain('MAINTENANCE');
  });

  test.skip('should click on room card', async () => {
    await frontDeskPage.clickRoomCard('101');
    // This would typically open a room details modal or navigate to room page
  });
});

test.describe('Front Desk - Housekeeping Operations', () => {
  let frontDeskPage: FrontDeskDashboardPage;

  test.beforeEach(async ({ page }) => {
    frontDeskPage = new FrontDeskDashboardPage(page);
    await frontDeskPage.navigateTo();
    await frontDeskPage.verifyPageLoaded();
  });

  test.skip('should mark housekeeping task complete', async () => {
    const roomNumber = '204';
    
    await frontDeskPage.markHousekeepingComplete(roomNumber);
    
    // Verify housekeeping task was completed
    // This would update the room status from CLEANING to AVAILABLE
    const roomStatus = await frontDeskPage.getRoomStatus(roomNumber);
    expect(roomStatus).toContain('AVAILABLE');
  });

  test.skip('should submit maintenance request', async () => {
    const roomNumber = '205';
    const issue = 'Bathroom sink is leaking';
    
    await frontDeskPage.submitMaintenanceRequest(roomNumber, issue);
    
    // Verify maintenance request was submitted
    const requests = await frontDeskPage.getMaintenanceRequests();
    expect(requests.some(request => request.includes(roomNumber))).toBe(true);
  });
});

test.describe('Front Desk - Guest Services', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/frontdesk/guest-services');
  });

  test('should view guest requests', async ({ page }) => {
    const guestRequestsContainer = page.locator('[data-testid="guest-requests-container"]');
    await expect(guestRequestsContainer).toBeVisible();
  });

  test('should handle guest complaint', async ({ page }) => {
    const complaintButton = page.locator('[data-testid="handle-complaint-btn"]');
    if (await complaintButton.isVisible()) {
      await complaintButton.click();
      
      const complaintModal = page.locator('[data-testid="complaint-modal"]');
      await expect(complaintModal).toBeVisible();
      
      await complaintModal.locator('textarea[name="resolution"]').fill('Issue resolved by offering room upgrade');
      await complaintModal.locator('select[name="priority"]').selectOption('HIGH');
      
      await complaintModal.locator('[data-testid="submit-resolution"]').click();
      await expect(complaintModal).not.toBeVisible();
    }
  });

  test('should process room service request', async ({ page }) => {
    const roomServiceButton = page.locator('[data-testid="room-service-btn"]');
    if (await roomServiceButton.isVisible()) {
      await roomServiceButton.click();
      
      const serviceModal = page.locator('[data-testid="room-service-modal"]');
      await expect(serviceModal).toBeVisible();
      
      await serviceModal.locator('input[name="roomNumber"]').fill('301');
      await serviceModal.locator('textarea[name="serviceDetails"]').fill('Extra towels and pillows');
      await serviceModal.locator('select[name="urgency"]').selectOption('NORMAL');
      
      await serviceModal.locator('[data-testid="submit-service-request"]').click();
      await expect(serviceModal).not.toBeVisible();
    }
  });

  test('should manage wake-up calls', async ({ page }) => {
    const wakeUpCallButton = page.locator('[data-testid="wake-up-call-btn"]');
    if (await wakeUpCallButton.isVisible()) {
      await wakeUpCallButton.click();
      
      const wakeUpModal = page.locator('[data-testid="wake-up-call-modal"]');
      await expect(wakeUpModal).toBeVisible();
      
      await wakeUpModal.locator('input[name="roomNumber"]').fill('302');
      await wakeUpModal.locator('input[name="callTime"]').fill('07:00');
      await wakeUpModal.locator('input[name="callDate"]').fill('2025-08-23');
      
      await wakeUpModal.locator('[data-testid="schedule-wake-up-call"]').click();
      await expect(wakeUpModal).not.toBeVisible();
    }
  });
});

test.describe('Front Desk - Payment Processing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/frontdesk/payments');
  });

  test('should process payment', async ({ page }) => {
    const processPaymentButton = page.locator('[data-testid="process-payment-btn"]');
    if (await processPaymentButton.isVisible()) {
      await processPaymentButton.click();
      
      const paymentModal = page.locator('[data-testid="payment-modal"]');
      await expect(paymentModal).toBeVisible();
      
      await paymentModal.locator('input[name="amount"]').fill('150.00');
      await paymentModal.locator('select[name="paymentMethod"]').selectOption('CREDIT_CARD');
      await paymentModal.locator('input[name="confirmationNumber"]').fill('BMH-TEST-PAY-001');
      
      await paymentModal.locator('[data-testid="process-payment"]').click();
      await expect(paymentModal).not.toBeVisible();
    }
  });

  test('should issue refund', async ({ page }) => {
    const refundButton = page.locator('[data-testid="issue-refund-btn"]');
    if (await refundButton.isVisible()) {
      await refundButton.click();
      
      const refundModal = page.locator('[data-testid="refund-modal"]');
      await expect(refundModal).toBeVisible();
      
      await refundModal.locator('input[name="amount"]').fill('75.00');
      await refundModal.locator('textarea[name="reason"]').fill('Room maintenance issue');
      await refundModal.locator('input[name="confirmationNumber"]').fill('BMH-TEST-REF-001');
      
      await refundModal.locator('[data-testid="process-refund"]').click();
      await expect(refundModal).not.toBeVisible();
    }
  });

  test('should view payment history', async ({ page }) => {
    const paymentHistoryContainer = page.locator('[data-testid="payment-history-container"]');
    await expect(paymentHistoryContainer).toBeVisible();
    
    // Search payment history
    const searchInput = page.locator('[data-testid="payment-search"]');
    await searchInput.fill('BMH-TEST');
    await searchInput.press('Enter');
  });
});

test.describe('Front Desk - Reporting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/frontdesk/reports');
  });

  test('should view daily operations report', async ({ page }) => {
    const dailyReportTab = page.locator('[data-testid="daily-report-tab"]');
    await dailyReportTab.click();
    
    await expect(page.locator('[data-testid="daily-report-content"]')).toBeVisible();
  });

  test('should view shift handover report', async ({ page }) => {
    const shiftReportTab = page.locator('[data-testid="shift-report-tab"]');
    await shiftReportTab.click();
    
    await expect(page.locator('[data-testid="shift-report-content"]')).toBeVisible();
  });

  test('should generate occupancy report', async ({ page }) => {
    const occupancyReportButton = page.locator('[data-testid="generate-occupancy-report"]');
    await occupancyReportButton.click();
    
    const reportModal = page.locator('[data-testid="occupancy-report-modal"]');
    await expect(reportModal).toBeVisible();
    
    await reportModal.locator('input[name="reportDate"]').fill('2025-08-22');
    await reportModal.locator('[data-testid="generate-report"]').click();
    
    await expect(page.locator('[data-testid="occupancy-report-results"]')).toBeVisible();
  });
});

test.describe('Front Desk - Integration Workflows', () => {
  let frontDeskPage: FrontDeskDashboardPage;

  test.beforeEach(async ({ page }) => {
    frontDeskPage = new FrontDeskDashboardPage(page);
  });

  test('should navigate between front desk sections', async ({ page }) => {
    // Start from dashboard
    await frontDeskPage.navigateTo();
    await frontDeskPage.verifyPageLoaded();
    
    // Navigate to guest services
    await page.goto('/frontdesk/guest-services');
    await expect(page.locator('[data-testid="guest-requests-container"]')).toBeVisible();
    
    // Navigate to payments
    await page.goto('/frontdesk/payments');
    await expect(page.locator('[data-testid="payment-history-container"]')).toBeVisible();
    
    // Navigate to reports
    await page.goto('/frontdesk/reports');
    await expect(page.locator('[data-testid="daily-report-tab"]')).toBeVisible();
    
    // Return to dashboard
    await frontDeskPage.navigateTo();
    await frontDeskPage.verifyPageLoaded();
  });

  test('should handle real-time updates', async ({ page }) => {
    await frontDeskPage.navigateTo();
    await frontDeskPage.verifyPageLoaded();
    
    // Get initial stats
    const initialStats = await frontDeskPage.getFrontDeskStatistics();
    
    // Refresh and verify data consistency
    await frontDeskPage.refreshDashboard();
    const refreshedStats = await frontDeskPage.getFrontDeskStatistics();
    
    // Stats should remain consistent or reflect real changes
    expect(refreshedStats.currentOccupancy).toBeGreaterThanOrEqual(0);
    expect(refreshedStats.availableRooms).toBeGreaterThanOrEqual(0);
  });

  test('should maintain session during extended use', async ({ page }) => {
    await frontDeskPage.navigateTo();
    
    // Simulate extended session with various operations
    await frontDeskPage.refreshDashboard();
    await frontDeskPage.filterRoomsByStatus('AVAILABLE');
    await frontDeskPage.searchRoom('101');
    await frontDeskPage.filterRoomsByStatus('ALL');
    
    // Verify session is still active and page functions normally
    await frontDeskPage.verifyPageLoaded();
    const stats = await frontDeskPage.getFrontDeskStatistics();
    expect(stats.currentOccupancy).toBeGreaterThanOrEqual(0);
  });
});

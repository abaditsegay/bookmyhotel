import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { HotelRegistrationsPage } from '../pages/HotelRegistrationsPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { HotelManagementPage } from '../pages/HotelManagementPage';
import { TEST_HOTEL_REGISTRATIONS, TEST_USERS } from '../fixtures/testData';

// System Admin Test Suite
test.describe('System Admin - Dashboard Operations', () => {
  let adminDashboard: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    adminDashboard = new AdminDashboardPage(page);
    await adminDashboard.navigateTo();
    await adminDashboard.verifyPageLoaded();
  });

  test('should display correct dashboard statistics', async () => {
    // Verify all statistics cards are visible
    const stats = await adminDashboard.getDashboardStatistics();
    
    expect(stats.totalHotels).toBeGreaterThanOrEqual(0);
    expect(stats.pendingRegistrations).toBeGreaterThanOrEqual(0);
    expect(stats.totalUsers).toBeGreaterThanOrEqual(1); // At least system admin
    expect(stats.totalBookings).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to different sections from dashboard', async ({ page }) => {
    // Test navigation to hotel registrations
    await adminDashboard.navigateToHotelRegistrations();
    await expect(page).toHaveURL(/.*\/admin\/hotel-registrations/);
    
    // Navigate back to dashboard
    await adminDashboard.navigateTo();
    
    // Test navigation to user management
    await adminDashboard.navigateToUserManagement();
    await expect(page).toHaveURL(/.*\/admin\/users/);
    
    // Navigate back to dashboard
    await adminDashboard.navigateTo();
    
    // Test navigation to hotel management
    await adminDashboard.navigateToHotelManagement();
    await expect(page).toHaveURL(/.*\/admin\/hotels/);
  });

  test('should display recent activities', async () => {
    // Check if recent activities section is visible
    const activities = await adminDashboard.getRecentActivities();
    expect(Array.isArray(activities)).toBe(true);
  });

  test('should refresh dashboard data', async () => {
    const initialStats = await adminDashboard.getDashboardStatistics();
    
    // Refresh dashboard
    await adminDashboard.refreshDashboard();
    
    // Verify data is reloaded (should be the same values)
    const refreshedStats = await adminDashboard.getDashboardStatistics();
    expect(refreshedStats.totalHotels).toBe(initialStats.totalHotels);
    expect(refreshedStats.totalUsers).toBe(initialStats.totalUsers);
  });
});

test.describe('System Admin - Hotel Registration Management', () => {
  let hotelRegistrationsPage: HotelRegistrationsPage;

  test.beforeEach(async ({ page }) => {
    hotelRegistrationsPage = new HotelRegistrationsPage(page);
    await hotelRegistrationsPage.navigateTo();
    await hotelRegistrationsPage.verifyPageLoaded();
  });

  test('should view hotel registration requests', async () => {
    // Get total registrations
    const totalRegistrations = await hotelRegistrationsPage.getTotalRegistrations();
    expect(totalRegistrations).toBeGreaterThanOrEqual(0);
    
    // If there are registrations, verify first one is visible
    if (totalRegistrations > 0) {
      const registrations = await hotelRegistrationsPage.getRegistrationRows();
      expect(registrations.length).toBeGreaterThan(0);
    }
  });

  test('should filter registrations by status', async () => {
    // Test filtering by pending status
    await hotelRegistrationsPage.filterByStatus('PENDING');
    
    // Test filtering by approved status
    await hotelRegistrationsPage.filterByStatus('APPROVED');
    
    // Test filtering by rejected status
    await hotelRegistrationsPage.filterByStatus('REJECTED');
    
    // Reset to all
    await hotelRegistrationsPage.filterByStatus('ALL');
  });

  test('should search hotel registrations', async () => {
    // Search for test hotel
    await hotelRegistrationsPage.searchRegistrations(TEST_HOTEL_REGISTRATIONS[0].hotelName);
    
    // Clear search
    await hotelRegistrationsPage.searchRegistrations('');
  });

  test('should refresh registrations list', async () => {
    await hotelRegistrationsPage.refreshList();
    
    // Verify page is still functional
    await hotelRegistrationsPage.verifyPageLoaded();
  });

  // Note: Actual approval/rejection tests would need test data setup
  // These tests demonstrate the page object model usage
  test.skip('should approve hotel registration', async () => {
    const testHotelName = TEST_HOTEL_REGISTRATIONS[0].hotelName;
    
    // This test would require a pending registration to exist
    await hotelRegistrationsPage.approveRegistration(
      testHotelName,
      'Approved after verification'
    );
    
    // Verify status changed
    const status = await hotelRegistrationsPage.getRegistrationStatus(testHotelName);
    expect(status).toContain('APPROVED');
  });

  test.skip('should reject hotel registration', async () => {
    const testHotelName = TEST_HOTEL_REGISTRATIONS[0].hotelName;
    
    // This test would require a pending registration to exist
    await hotelRegistrationsPage.rejectRegistration(
      testHotelName,
      'Incomplete documentation'
    );
    
    // Verify status changed
    const status = await hotelRegistrationsPage.getRegistrationStatus(testHotelName);
    expect(status).toContain('REJECTED');
  });
});

test.describe('System Admin - User Management', () => {
  let userManagementPage: UserManagementPage;

  test.beforeEach(async ({ page }) => {
    userManagementPage = new UserManagementPage(page);
    await userManagementPage.navigateTo();
    await userManagementPage.verifyPageLoaded();
  });

  test('should view users list', async () => {
    const totalUsers = await userManagementPage.getTotalUsers();
    expect(totalUsers).toBeGreaterThanOrEqual(1); // At least system admin should exist
  });

  test('should filter users by role', async () => {
    // Test filtering by different roles
    await userManagementPage.filterByRole('SYSTEM_ADMIN');
    const systemAdmins = await userManagementPage.getTotalUsers();
    expect(systemAdmins).toBeGreaterThanOrEqual(1);
    
    await userManagementPage.filterByRole('HOTEL_ADMIN');
    await userManagementPage.filterByRole('FRONT_DESK');
    await userManagementPage.filterByRole('CUSTOMER');
    
    // Reset to all
    await userManagementPage.filterByRole('ALL');
  });

  test('should filter users by status', async () => {
    await userManagementPage.filterByStatus('ACTIVE');
    await userManagementPage.filterByStatus('INACTIVE');
    
    // Reset to all
    await userManagementPage.filterByStatus('ALL');
  });

  test('should search users', async () => {
    // Search for admin
    await userManagementPage.searchUsers('admin');
    
    // Clear search
    await userManagementPage.searchUsers('');
  });

  test('should refresh users list', async () => {
    await userManagementPage.refreshList();
    await userManagementPage.verifyPageLoaded();
  });

  // Note: User creation/modification tests would need proper setup
  test.skip('should create new user', async () => {
    const newUser = TEST_USERS[0]; // Hotel admin
    
    await userManagementPage.createUser({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: '+1-555-TEST',
      role: 'HOTEL_ADMIN',
      status: 'ACTIVE'
    });
    
    // Verify user was created
    await userManagementPage.verifyUserExists(newUser.email);
  });

  test.skip('should edit existing user', async () => {
    const userEmail = TEST_USERS[0].email;
    
    await userManagementPage.editUser(userEmail, {
      firstName: 'Updated First Name',
      phone: '+1-555-9999'
    });
    
    // Verify changes
    await userManagementPage.verifyUserExists(userEmail);
  });
});

test.describe('System Admin - Hotel Management', () => {
  let hotelManagementPage: HotelManagementPage;

  test.beforeEach(async ({ page }) => {
    hotelManagementPage = new HotelManagementPage(page);
    await hotelManagementPage.navigateTo();
    await hotelManagementPage.verifyPageLoaded();
  });

  test('should view hotels list', async () => {
    const totalHotels = await hotelManagementPage.getTotalHotels();
    expect(totalHotels).toBeGreaterThanOrEqual(0);
  });

  test('should filter hotels by status', async () => {
    await hotelManagementPage.filterByStatus('ACTIVE');
    await hotelManagementPage.filterByStatus('INACTIVE');
    await hotelManagementPage.filterByStatus('SUSPENDED');
    
    // Reset to all
    await hotelManagementPage.filterByStatus('ALL');
  });

  test('should search hotels', async () => {
    // Search for test hotel
    await hotelManagementPage.searchHotels(TEST_HOTEL_REGISTRATIONS[0].hotelName);
    
    // Clear search
    await hotelManagementPage.searchHotels('');
  });

  test('should refresh hotels list', async () => {
    await hotelManagementPage.refreshList();
    await hotelManagementPage.verifyPageLoaded();
  });

  // Note: Hotel status updates would need existing hotel data
  test.skip('should update hotel status', async () => {
    const testHotelName = TEST_HOTEL_REGISTRATIONS[0].hotelName;
    
    await hotelManagementPage.updateHotelStatus(testHotelName, 'SUSPENDED');
    
    // Verify status change
    const status = await hotelManagementPage.getHotelStatus(testHotelName);
    expect(status).toContain('SUSPENDED');
  });

  test.skip('should view hotel details', async () => {
    const testHotelName = TEST_HOTEL_REGISTRATIONS[0].hotelName;
    
    await hotelManagementPage.viewHotelDetails(testHotelName);
    
    // Verify details modal
    await hotelManagementPage.verifyHotelDetailsModal({
      name: testHotelName
    });
    
    await hotelManagementPage.closeDetailsModal();
  });
});

test.describe('System Admin - Integration Workflows', () => {
  let adminDashboard: AdminDashboardPage;
  let hotelRegistrationsPage: HotelRegistrationsPage;
  let userManagementPage: UserManagementPage;
  let hotelManagementPage: HotelManagementPage;

  test.beforeEach(async ({ page }) => {
    adminDashboard = new AdminDashboardPage(page);
    hotelRegistrationsPage = new HotelRegistrationsPage(page);
    userManagementPage = new UserManagementPage(page);
    hotelManagementPage = new HotelManagementPage(page);
  });

  test('should navigate between all admin sections', async () => {
    // Start from dashboard
    await adminDashboard.navigateTo();
    await adminDashboard.verifyPageLoaded();
    
    // Navigate to hotel registrations
    await hotelRegistrationsPage.navigateTo();
    await hotelRegistrationsPage.verifyPageLoaded();
    
    // Navigate to user management
    await userManagementPage.navigateTo();
    await userManagementPage.verifyPageLoaded();
    
    // Navigate to hotel management
    await hotelManagementPage.navigateTo();
    await hotelManagementPage.verifyPageLoaded();
    
    // Return to dashboard
    await adminDashboard.navigateTo();
    await adminDashboard.verifyPageLoaded();
  });

  test('should maintain consistent data across sections', async () => {
    // Get statistics from dashboard
    await adminDashboard.navigateTo();
    const dashboardStats = await adminDashboard.getDashboardStatistics();
    
    // Verify user count matches user management
    await userManagementPage.navigateTo();
    const totalUsers = await userManagementPage.getTotalUsers();
    expect(totalUsers).toBe(dashboardStats.totalUsers);
    
    // Verify hotel count matches hotel management
    await hotelManagementPage.navigateTo();
    const totalHotels = await hotelManagementPage.getTotalHotels();
    expect(totalHotels).toBe(dashboardStats.totalHotels);
  });
});

import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/testData';

const authFiles = {
  'hotel-admin': 'e2e-tests/auth/.auth/hotel-admin.json',
  'frontdesk': 'e2e-tests/auth/.auth/frontdesk.json',
  'customer': 'e2e-tests/auth/.auth/customer.json'
};

// Find users by role
const hotelAdmin = TEST_USERS.find(user => user.role === 'HOTEL_ADMIN');
const frontDesk = TEST_USERS.find(user => user.role === 'FRONTDESK');
const customer = TEST_USERS.find(user => user.role === 'CUSTOMER');

// Hotel Admin Authentication Setup
setup('authenticate as hotel admin', async ({ page }) => {
  if (!hotelAdmin) throw new Error('Hotel admin test user not found');
  
  await page.goto('/login');

  // Fill login form
  await page.fill('input[data-testid="email-input"]', hotelAdmin.email);
  await page.fill('input[data-testid="password-input"]', hotelAdmin.password);
  
  // Submit login
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login and redirect
  await page.waitForURL('/hotel-admin/dashboard');
  
  // Save authentication state
  await page.context().storageState({ path: authFiles['hotel-admin'] });
  console.log('✅ Hotel admin authentication setup completed');
});

// Front Desk Authentication Setup
setup('authenticate as front desk', async ({ page }) => {
  if (!frontDesk) throw new Error('Front desk test user not found');
  
  await page.goto('/login');

  // Fill login form
  await page.fill('input[data-testid="email-input"]', frontDesk.email);
  await page.fill('input[data-testid="password-input"]', frontDesk.password);
  
  // Submit login
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login and redirect
  await page.waitForURL('/frontdesk/dashboard');
  
  // Save authentication state
  await page.context().storageState({ path: authFiles['frontdesk'] });
  console.log('✅ Front desk authentication setup completed');
});

// Customer Authentication Setup
setup('authenticate as customer', async ({ page }) => {
  if (!customer) throw new Error('Customer test user not found');
  
  await page.goto('/login');

  // Fill login form
  await page.fill('input[data-testid="email-input"]', customer.email);
  await page.fill('input[data-testid="password-input"]', customer.password);
  
  // Submit login
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login and redirect - customers should go to home/dashboard
  await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('dashboard') || url.pathname.includes('customer'));
  
  // Save authentication state
  await page.context().storageState({ path: authFiles['customer'] });
  console.log('✅ Customer authentication setup completed');
});

// Cleanup setup
setup('cleanup', async ({ page }) => {
  // Any cleanup operations needed
  console.log('Authentication setup completed for all roles');
});

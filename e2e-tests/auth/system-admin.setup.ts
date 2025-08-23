import { test as setup, expect } from '@playwright/test';
import { SYSTEM_ADMIN } from '../fixtures/testData';

/**
 * Authentication Setup for System Admin E2E Tests
 * This setup runs before all tests to authenticate the system admin user
 */

const authFile = 'e2e-tests/auth/system-admin.json';

setup('authenticate as system admin', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in login form with system admin credentials
  await page.fill('input[data-testid="email-input"]', SYSTEM_ADMIN.email);
  await page.fill('input[data-testid="password-input"]', SYSTEM_ADMIN.password);
  
  // Submit the form
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login and redirect to system dashboard
  await page.waitForURL('/system-dashboard');
  
  // Verify we're logged in by checking for system admin elements
  await expect(page.locator('[data-testid="system-dashboard"]')).toBeVisible();
  
  // Save the authentication state
  await page.context().storageState({ path: 'e2e-tests/auth/.auth/system-admin.json' });
  
  console.log('✅ System admin authentication setup completed');
});

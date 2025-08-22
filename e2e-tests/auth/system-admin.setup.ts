import { test as setup, expect } from '@playwright/test';
import { SYSTEM_ADMIN } from '../fixtures/testData';

/**
 * Authentication Setup for System Admin E2E Tests
 * This setup runs before all tests to authenticate the system admin user
 */

const authFile = 'e2e-tests/auth/system-admin.json';

setup('authenticate system admin', async ({ page }) => {
  console.log('🔐 Setting up System Admin authentication...');
  
  // Navigate to login page
  await page.goto('/login');
  
  // Wait for login form to be visible
  await expect(page.locator('[data-testid="login-form"]')).toBeVisible({ timeout: 10000 });
  
  // Fill login credentials
  await page.fill('[data-testid="email-input"]', SYSTEM_ADMIN.email);
  await page.fill('[data-testid="password-input"]', SYSTEM_ADMIN.password);
  
  // Submit login form
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login - should redirect to system dashboard (for system-wide admin)
  await expect(page).toHaveURL(/\/system-dashboard/, { timeout: 15000 });
  
  // Verify we're logged in as system admin
  await expect(page.locator('[data-testid="user-role"]')).toContainText('System Administrator');
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
  
  console.log('✅ System Admin authentication completed successfully');
});

import { test, expect } from '@playwright/test';

test.describe('BookMyHotel App', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page title contains expected text
    await expect(page).toHaveTitle(/BookMyHotel|Hotel/i);
    
    // You can add more specific assertions based on your app structure
    // For example:
    // await expect(page.locator('h1')).toBeVisible();
    // await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Add tests for navigation based on your app structure
    // For example:
    // await page.click('[data-testid="hotels-link"]');
    // await expect(page).toHaveURL(/.*hotels/);
  });
});

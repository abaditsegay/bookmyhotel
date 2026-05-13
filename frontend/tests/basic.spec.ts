import { test, expect } from '@playwright/test';

test.describe('Public Landing Page', () => {
  test('homepage loads with search and partner CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/BookMyHotel|Hotel/i);
    await expect(page.getByRole('heading', { name: 'BookMyHotel', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Find Your Perfect Stay' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Partner With Us' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register Your Business' })).toBeVisible();
  });

  test('partner CTA opens public hotel registration', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Register Your Business' }).click();

    await expect(page).toHaveURL(/\/register-hotel$/);
    await expect(page.getByRole('heading', { name: 'Register Your Hotel' })).toBeVisible();
  });
});

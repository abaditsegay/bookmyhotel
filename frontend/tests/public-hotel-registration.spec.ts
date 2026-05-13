import { test, expect } from '@playwright/test';

test.describe('Public Hotel Registration', () => {
	test('registration form renders current public onboarding fields', async ({ page }) => {
		await page.goto('/register-hotel');

		await expect(page.getByRole('heading', { name: 'Register Your Hotel' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Hotel Information' })).toBeVisible();
		await expect(page.getByLabel('Hotel Name')).toBeVisible();
		await expect(page.getByLabel('Contact Person')).toBeVisible();
		await expect(page.getByLabel('Contact Email')).toBeVisible();
		await expect(page.getByLabel('Address')).toBeVisible();
		await expect(page.getByLabel('City')).toBeVisible();
		await expect(page.getByLabel('Country')).toHaveValue('Ethiopia');
		await expect(page.getByRole('button', { name: 'Submit Registration' })).toBeDisabled();
	});

	test('submits registration and shows success state', async ({ page }) => {
		const hotelName = `Playwright Public Hotel ${Date.now()}`;
		const contactEmail = `public.hotel.${Date.now()}@example.com`;

		await page.route('**/public/hotel-registration/submit', async route => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					hotelName,
					loginEmail: contactEmail,
				}),
			});
		});

		await page.goto('/register-hotel');

		await page.getByLabel('Hotel Name').fill(hotelName);
		await page.getByLabel('Contact Person').fill('Playwright Owner');
		await page.getByLabel('Contact Email').fill(contactEmail);
		await page.getByLabel('Address').fill('123 Test Avenue');
		await page.getByLabel('City').fill('Addis Ababa');

		await page.getByRole('button', { name: 'Submit Registration' }).click();

		await expect(page.getByRole('heading', { name: 'Registration Successful!' })).toBeVisible();
		await expect(page.getByText(hotelName, { exact: true })).toBeVisible();
		await expect(page.getByText(contactEmail, { exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Go to Login' })).toBeVisible();
	});
});

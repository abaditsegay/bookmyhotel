import { expect, test } from '@playwright/test';

import { seedAuthSession } from './support/auth/mockAuth';

test.describe('Front Desk Walk-in Booking Flow', () => {
  test('front desk staff can create a walk-in booking from the dashboard', async ({ page }) => {
    const now = Date.now();
    const guestEmail = `walkin.${now}@example.com`;
    const confirmationNumber = `WALK-${now}`;

    await seedAuthSession(page, {
      id: '901',
      email: 'frontdesk.playwright@example.com',
      firstName: 'Front',
      lastName: 'Desk',
      role: 'FRONTDESK',
      roles: ['FRONTDESK'],
      tenantId: 'tenant-playwright',
      hotelId: '99',
      hotelName: 'Playwright Grand Hotel',
    });

    await page.route('**/front-desk/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          todaysArrivals: 2,
          todaysDepartures: 1,
          currentOccupancy: 14,
          availableRooms: 8,
          roomsOutOfOrder: 0,
          roomsUnderMaintenance: 1,
        }),
      });
    });

    await page.route(/.*\/front-desk\/bookings\?.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [],
          size: 10,
          number: 0,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
          numberOfElements: 0,
          empty: true,
        }),
      });
    });

    await page.route('**/rooms/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 9001,
            roomNumber: '101',
            roomType: 'Deluxe Suite',
            pricePerNight: 2500,
            capacity: 2,
            description: 'City view deluxe suite',
            isAvailable: true,
            hotelId: 99,
          },
        ]),
      });
    });

    await page.route('**/front-desk/hotel', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 99, name: 'Playwright Grand Hotel' }),
      });
    });

    await page.route('**/hotels/99/tax-rate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ vatRate: 0.15, serviceTaxRate: 0.05, cityTaxRate: 0 }),
      });
    });

    await page.route(/.*\/front-desk\/hotels\/99\/available-rooms\?.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 9001,
            roomNumber: '101',
            roomType: 'Deluxe Suite',
            pricePerNight: 2500,
            capacity: 2,
            description: 'City view deluxe suite',
          },
        ]),
      });
    });

    await page.route('**/front-desk/walk-in-booking', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reservationId: 7788,
          confirmationNumber,
          guestName: 'Walk In Guest',
          guestEmail: guestEmail,
          roomNumber: '101',
          roomType: 'Deluxe Suite',
          hotelName: 'Playwright Grand Hotel',
          checkInDate: '2026-05-12',
          checkOutDate: '2026-05-13',
          totalAmount: 2500,
          paymentStatus: 'PENDING',
          status: 'BOOKED',
        }),
      });
    });

    await page.goto('/frontdesk/dashboard');

    await expect(page.getByTestId('user-role')).toContainText('Front Desk', { timeout: 15000 });
    await expect(page.getByText('Loading...')).toHaveCount(0, { timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Walk-in Guest' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Walk-in Guest' }).click();

    await expect(page.getByText('Walk-in Guest Booking')).toBeVisible();
    await page.getByLabel('First Name').fill('Walk');
    await page.getByLabel('Last Name').fill('In Guest');
    await page.getByLabel('Email').fill(guestEmail);
    await page.getByLabel('Phone').fill('0911778899');
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText('Room 101')).toBeVisible();
    await page.getByText('Room 101').click();
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText('Walk In Guest')).toBeVisible();
    await expect(page.getByText('101 (Deluxe Suite)')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText(`Walk-in booking created successfully! Confirmation: ${confirmationNumber}`)).toBeVisible();
    await expect(page.getByRole('button', { name: 'OK' })).toBeVisible();
  });
});
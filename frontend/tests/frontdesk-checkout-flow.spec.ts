import { expect, test } from '@playwright/test';

import { seedAuthSession } from './support/auth/mockAuth';

test.describe('Front Desk Checkout Flow', () => {
  test('front desk staff can check out a guest and see the final receipt', async ({ page }) => {
    const receipt = {
      guestName: 'Checkout Guest',
      guestEmail: 'checkout.guest@example.com',
      guestPhone: '0911665544',
      reservationId: 8301,
      confirmationNumber: 'FD-CHECKOUT-1001',
      checkInDate: '2026-06-20',
      checkOutDate: '2026-06-22',
      actualCheckInTime: '2026-06-20T14:00:00Z',
      actualCheckOutTime: '2026-06-22T11:10:00Z',
      status: 'CHECKED_OUT',
      numberOfNights: 2,
      numberOfGuests: 2,
      hotelName: 'Playwright Grand Hotel',
      hotelAddress: '123 Test Avenue, Addis Ababa',
      roomNumber: '401',
      roomType: 'DELUXE_ROOM',
      roomChargePerNight: 2700,
      totalRoomCharges: 5400,
      additionalCharges: [],
      totalAdditionalCharges: 0,
      taxesAndFees: [],
      totalTaxesAndFees: 0,
      grandTotal: 5400,
      receiptNumber: 'RCT-1001',
      generatedAt: '2026-06-22T11:15:00Z',
      generatedBy: 'Front Desk Staff',
    };

    let bookingState = {
      reservationId: 8301,
      confirmationNumber: 'FD-CHECKOUT-1001',
      guestName: 'Checkout Guest',
      guestEmail: 'checkout.guest@example.com',
      roomNumber: '401',
      roomType: 'DELUXE_ROOM',
      checkInDate: '2026-06-20',
      checkOutDate: '2026-06-22',
      status: 'CHECKED_IN',
      totalAmount: 5400,
      paymentStatus: 'COMPLETED',
      paymentType: 'CASH',
      hotelName: 'Playwright Grand Hotel',
      hotelAddress: '123 Test Avenue, Addis Ababa',
      pricePerNight: 2700,
      createdAt: '2026-05-13T11:00:00Z',
      paymentReference: 'CASH-1001',
      adults: 2,
      children: 0,
      nights: 2,
      hotelId: 99,
    };

    await seedAuthSession(page, {
      id: '904',
      email: 'frontdesk.checkout@example.com',
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
          todaysArrivals: 3,
          todaysDepartures: 2,
          currentOccupancy: 17,
          availableRooms: 8,
          roomsOutOfOrder: 0,
          roomsUnderMaintenance: 1,
        }),
      });
    });

    await page.route('**/rooms/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route(/.*\/front-desk\/bookings\?.*/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [bookingState],
          size: 10,
          number: 0,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
          numberOfElements: 1,
          empty: false,
        }),
      });
    });

    await page.route('**/front-desk/checkout-with-receipt/8301', async (route) => {
      bookingState = {
        ...bookingState,
        status: 'CHECKED_OUT',
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          booking: bookingState,
          receipt,
          receiptGenerated: true,
          message: 'Guest Checkout Guest checked out successfully. Final receipt generated.',
        }),
      });
    });

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/front-desk/bookings?') && response.request().method() === 'GET'),
      page.goto('/frontdesk/dashboard'),
    ]);

    await expect(page.getByTestId('user-role')).toContainText('Front Desk', { timeout: 15000 });
    const firstBookingActionCell = page.locator('table tbody tr').first().locator('td').last();
    await expect(firstBookingActionCell.locator('button').nth(1)).toBeVisible({ timeout: 15000 });
    await firstBookingActionCell.locator('button').nth(1).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Confirm Guest Checkout')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('This will mark the guest as checked out and generate a final receipt.')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Check Out' }).click();

    const receiptDialog = page.getByRole('dialog').filter({ hasText: 'Receipt #RCT-1001' });
    await expect(receiptDialog.getByText('Receipt #RCT-1001')).toBeVisible({ timeout: 15000 });
    await expect(receiptDialog.getByText('Checkout Guest', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(receiptDialog.getByText('401 (DELUXE_ROOM)')).toBeVisible({ timeout: 15000 });
    await expect(receiptDialog.getByRole('row', { name: /TOTAL AMOUNT ETB 5,400/i })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByText('CHECKED OUT', { exact: true })).toBeVisible({ timeout: 15000 });
  });
});
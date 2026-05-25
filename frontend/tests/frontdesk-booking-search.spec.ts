import { expect, test } from '@playwright/test';

import { seedAuthSession } from './support/auth/mockAuth';

test.describe('Front Desk Booking Search Flow', () => {
  test('front desk staff can search existing bookings by confirmation number', async ({ page }) => {
    const targetBooking = {
      reservationId: 8101,
      confirmationNumber: 'FD-SEARCH-1001',
      guestName: 'Grace Search',
      guestEmail: 'grace.search@example.com',
      roomNumber: '204',
      roomType: 'Deluxe Suite',
      checkInDate: '2026-06-18',
      checkOutDate: '2026-06-20',
      status: 'BOOKED',
      totalAmount: 5200,
      paymentStatus: 'PENDING',
      paymentType: 'CASH',
      confirmationCode: 'FD-SEARCH-1001',
      hotelName: 'Playwright Grand Hotel',
      hotelAddress: '123 Test Avenue, Addis Ababa',
      pricePerNight: 2600,
      createdAt: '2026-05-13T10:00:00Z',
      paymentReference: 'FRONTDESK',
      adults: 2,
      children: 0,
      nights: 2,
    };

    const secondaryBooking = {
      reservationId: 8102,
      confirmationNumber: 'FD-OTHER-1002',
      guestName: 'Other Guest',
      guestEmail: 'other.guest@example.com',
      roomNumber: '305',
      roomType: 'Executive Room',
      checkInDate: '2026-06-19',
      checkOutDate: '2026-06-21',
      status: 'CHECKED_IN',
      totalAmount: 6400,
      paymentStatus: 'COMPLETED',
      paymentType: 'MOBILE',
      hotelName: 'Playwright Grand Hotel',
      hotelAddress: '123 Test Avenue, Addis Ababa',
      pricePerNight: 3200,
      createdAt: '2026-05-13T10:10:00Z',
      paymentReference: 'MOB-1002',
      adults: 2,
      children: 1,
      nights: 2,
    };

    let allBookingsRequestCount = 0;
    let searchBookingsRequestCount = 0;

    await seedAuthSession(page, {
      id: '902',
      email: 'frontdesk.search@example.com',
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
          todaysDepartures: 1,
          currentOccupancy: 16,
          availableRooms: 9,
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
      const requestUrl = new URL(route.request().url());
      const search = requestUrl.searchParams.get('search');

      const content = search === targetBooking.confirmationNumber
        ? [targetBooking]
        : [targetBooking, secondaryBooking];

      if (search === targetBooking.confirmationNumber) {
        searchBookingsRequestCount += 1;
      } else {
        allBookingsRequestCount += 1;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content,
          size: 10,
          number: 0,
          totalElements: content.length,
          totalPages: 1,
          first: true,
          last: true,
          numberOfElements: content.length,
          empty: content.length === 0,
        }),
      });
    });

    await page.goto('/frontdesk/dashboard');

    await expect(page.getByTestId('user-role')).toContainText('Front Desk', { timeout: 15000 });
    await expect(page.getByLabel('Search Bookings')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(targetBooking.guestName)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(secondaryBooking.guestName)).toBeVisible({ timeout: 15000 });

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/front-desk/bookings?') && response.url().includes(`search=${targetBooking.confirmationNumber}`)),
      page.getByLabel('Search Bookings').fill(targetBooking.confirmationNumber),
    ]);

    await expect(page.getByText(targetBooking.confirmationNumber)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(targetBooking.guestName)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(`${targetBooking.roomNumber} - ${targetBooking.roomType}`)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(secondaryBooking.guestName)).toHaveCount(0, { timeout: 15000 });
    expect(allBookingsRequestCount).toBeGreaterThanOrEqual(1);
    expect(searchBookingsRequestCount).toBeGreaterThanOrEqual(1);
  });
});
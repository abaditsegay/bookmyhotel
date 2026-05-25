import { expect, test } from '@playwright/test';

import { seedAuthSession } from './support/auth/mockAuth';

test.describe('Front Desk Check-in Flow', () => {
  test('front desk staff can assign a room and check in a booked guest', async ({ page }) => {
    const initialBooking = {
      reservationId: 8201,
      confirmationNumber: 'FD-CHECKIN-1001',
      guestName: 'Check In Guest',
      guestEmail: 'checkin.guest@example.com',
      roomNumber: 'TBA',
      roomType: 'DELUXE_ROOM',
      checkInDate: '2026-06-22',
      checkOutDate: '2026-06-24',
      status: 'BOOKED',
      totalAmount: 5400,
      paymentStatus: 'PENDING',
      paymentType: 'CASH',
      hotelName: 'Playwright Grand Hotel',
      hotelAddress: '123 Test Avenue, Addis Ababa',
      pricePerNight: 2700,
      createdAt: '2026-05-13T10:30:00Z',
      paymentReference: 'FRONTDESK',
      adults: 2,
      children: 0,
      nights: 2,
      hotelId: 99,
    };

    let bookingState = {
      ...initialBooking,
      roomNumber: undefined as string | undefined,
      assignedRoomId: undefined as number | undefined,
    };

    await seedAuthSession(page, {
      id: '903',
      email: 'frontdesk.checkin@example.com',
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
          todaysArrivals: 4,
          todaysDepartures: 2,
          currentOccupancy: 18,
          availableRooms: 7,
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

    await page.route(/.*\/front-desk\/hotels\/[^/]+\/available-rooms(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 9101,
            roomNumber: '401',
            roomType: 'DELUXE_ROOM',
            status: 'AVAILABLE',
            pricePerNight: 2700,
            capacity: 2,
            description: 'Deluxe room for check-in testing',
            isAvailable: true,
            hotelId: 99,
            hotelName: 'Playwright Grand Hotel',
          },
        ]),
      });
    });

    await page.route('**/hotels/99/tax-rate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ taxRate: 0.2, vatRate: 0.15, serviceTaxRate: 0.05 }),
      });
    });

    await page.route('**/front-desk/bookings/8201/room-assignment**', async (route) => {
      bookingState = {
        ...bookingState,
        roomNumber: '401',
        assignedRoomId: 9101,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bookingState),
      });
    });

    await page.route('**/front-desk/bookings/8201/checkin**', async (route) => {
      bookingState = {
        ...bookingState,
        status: 'CHECKED_IN',
        roomNumber: '401',
        assignedRoomId: 9101,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bookingState),
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
    await expect(page.getByText('Check-in Guest')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('No room assigned yet.')).toBeVisible({ timeout: 15000 });

    await page.getByRole('radio', { name: /Room 401/i }).check();
    await expect(page.getByText('Room is assigned and ready for check-in.')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('room-assignment-section').getByRole('heading', { name: 'Room 401' })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Check In Guest' }).click();

    await expect(page.getByText('Guest Check In Guest has been successfully checked in to room 401!')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 15000 });
    await expect(page.getByText('401 - DELUXE_ROOM')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('CHECKED IN', { exact: true })).toBeVisible({ timeout: 15000 });
  });
});
import { expect, test } from '@playwright/test';

import { seedAuthSession } from './support/auth/mockAuth';

test.describe('Front Desk Surface Journey', () => {
  test('front desk staff can work bookings through a continuous dashboard journey', async ({ page }) => {
    const walkInConfirmationNumber = `WALK-${Date.now()}`;
    const walkInGuestEmail = `walkin.${Date.now()}@example.com`;

    const searchBooking = {
      reservationId: 8401,
      confirmationNumber: 'FD-JOURNEY-SEARCH-1001',
      guestName: 'Search Guest',
      guestEmail: 'search.guest@example.com',
      roomNumber: '204',
      roomType: 'Deluxe Suite',
      checkInDate: '2026-06-18',
      checkOutDate: '2026-06-20',
      status: 'BOOKED',
      totalAmount: 5200,
      paymentStatus: 'PENDING',
      paymentType: 'CASH',
      hotelName: 'Playwright Grand Hotel',
      hotelAddress: '123 Test Avenue, Addis Ababa',
      pricePerNight: 2600,
      createdAt: '2026-05-13T10:00:00Z',
      paymentReference: 'FRONTDESK',
      adults: 2,
      children: 0,
      nights: 2,
      hotelId: 99,
    };

    let checkInBooking = {
      reservationId: 8402,
      confirmationNumber: 'FD-JOURNEY-CHECKIN-1002',
      guestName: 'Journey Guest',
      guestEmail: 'journey.guest@example.com',
      roomNumber: undefined as string | undefined,
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
      assignedRoomId: undefined as number | undefined,
    };

    let walkInBooking: Record<string, unknown> | null = null;

    const checkoutReceipt = {
      guestName: 'Journey Guest',
      guestEmail: 'journey.guest@example.com',
      guestPhone: '0911665544',
      reservationId: 8402,
      confirmationNumber: 'FD-JOURNEY-CHECKIN-1002',
      checkInDate: '2026-06-22',
      checkOutDate: '2026-06-24',
      actualCheckInTime: '2026-06-22T14:00:00Z',
      actualCheckOutTime: '2026-06-24T11:10:00Z',
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
      receiptNumber: 'RCT-JOURNEY-1002',
      generatedAt: '2026-06-24T11:15:00Z',
      generatedBy: 'Front Desk Staff',
    };

    await seedAuthSession(page, {
      id: '905',
      email: 'frontdesk.journey@example.com',
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
        body: JSON.stringify({ taxRate: 0.2, vatRate: 0.15, serviceTaxRate: 0.05, cityTaxRate: 0 }),
      });
    });

    await page.route(/.*\/front-desk\/bookings\?.*/, async (route) => {
      const requestUrl = new URL(route.request().url());
      const search = requestUrl.searchParams.get('search')?.trim().toLowerCase();
      const bookings = [searchBooking, checkInBooking, ...(walkInBooking ? [walkInBooking] : [])];
      const content = search
        ? bookings.filter((booking) => {
            const guestName = String(booking.guestName ?? '').toLowerCase();
            const confirmationNumber = String(booking.confirmationNumber ?? '').toLowerCase();
            return guestName.includes(search) || confirmationNumber.includes(search);
          })
        : bookings;

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
          {
            id: 9101,
            roomNumber: '401',
            roomType: 'DELUXE_ROOM',
            status: 'AVAILABLE',
            pricePerNight: 2700,
            capacity: 2,
            description: 'Deluxe room for journey check-in testing',
            isAvailable: true,
            hotelId: 99,
            hotelName: 'Playwright Grand Hotel',
          },
        ]),
      });
    });

    await page.route('**/front-desk/walk-in-booking', async (route) => {
      walkInBooking = {
        reservationId: 8403,
        confirmationNumber: walkInConfirmationNumber,
        guestName: 'Walk In Guest',
        guestEmail: walkInGuestEmail,
        roomNumber: '101',
        roomType: 'Deluxe Suite',
        hotelName: 'Playwright Grand Hotel',
        hotelAddress: '123 Test Avenue, Addis Ababa',
        checkInDate: '2026-05-12',
        checkOutDate: '2026-05-13',
        totalAmount: 2500,
        paymentStatus: 'PENDING',
        paymentType: 'CASH',
        status: 'BOOKED',
        adults: 2,
        children: 0,
        nights: 1,
        hotelId: 99,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(walkInBooking),
      });
    });

    await page.route('**/front-desk/bookings/8402/room-assignment**', async (route) => {
      checkInBooking = {
        ...checkInBooking,
        roomNumber: '401',
        assignedRoomId: 9101,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(checkInBooking),
      });
    });

    await page.route('**/front-desk/bookings/8402/checkin**', async (route) => {
      checkInBooking = {
        ...checkInBooking,
        status: 'CHECKED_IN',
        roomNumber: '401',
        assignedRoomId: 9101,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(checkInBooking),
      });
    });

    await page.route('**/front-desk/checkout-with-receipt/8402', async (route) => {
      checkInBooking = {
        ...checkInBooking,
        status: 'CHECKED_OUT',
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          booking: checkInBooking,
          receipt: checkoutReceipt,
          receiptGenerated: true,
          message: 'Guest Journey Guest checked out successfully. Final receipt generated.',
        }),
      });
    });

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/front-desk/bookings?') && response.request().method() === 'GET'),
      page.goto('/frontdesk/dashboard'),
    ]);

    await expect(page.getByTestId('user-role')).toContainText('Front Desk', { timeout: 15000 });

    await test.step('search bookings by confirmation number', async () => {
      await expect(page.getByLabel('Search Bookings')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Search Guest')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Journey Guest')).toBeVisible({ timeout: 15000 });

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/front-desk/bookings?') && response.url().includes('search=FD-JOURNEY-SEARCH-1001')),
        page.getByLabel('Search Bookings').fill('FD-JOURNEY-SEARCH-1001'),
      ]);

      await expect(page.getByText('FD-JOURNEY-SEARCH-1001')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Search Guest')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Journey Guest')).toHaveCount(0, { timeout: 15000 });

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/front-desk/bookings?') && !response.url().includes('search=')),
        page.getByLabel('Search Bookings').fill(''),
      ]);

      await expect(page.getByText('Journey Guest')).toBeVisible({ timeout: 15000 });
    });

    await test.step('create a walk-in booking from the dashboard', async () => {
      await page.getByRole('button', { name: 'Walk-in Guest' }).click();

      await expect(page.getByText('Walk-in Guest Booking')).toBeVisible({ timeout: 15000 });
      await page.getByLabel('First Name').fill('Walk');
      await page.getByLabel('Last Name').fill('In Guest');
      await page.getByLabel('Email').fill(walkInGuestEmail);
      await page.getByLabel('Phone').fill('0911778899');
      await page.getByRole('button', { name: 'Next' }).click();

      await expect(page.getByText('Room 101')).toBeVisible({ timeout: 15000 });
      await page.getByText('Room 101').click();
      await page.getByRole('button', { name: 'Next' }).click();

      await expect(page.getByText('Walk In Guest')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('101 (Deluxe Suite)')).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: 'Confirm' }).click();

      await expect(page.getByText(`Walk-in booking created successfully! Confirmation: ${walkInConfirmationNumber}`)).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: 'OK' }).click();
      const walkInRow = page.locator('table tbody tr').filter({ hasText: walkInConfirmationNumber }).first();
      await expect(walkInRow).toBeVisible({ timeout: 15000 });
      await expect(walkInRow.getByText('Walk In Guest', { exact: true })).toBeVisible({ timeout: 15000 });
    });

    await test.step('assign a room and check in a booked guest', async () => {
      const checkInRow = page.locator('table tbody tr').filter({ hasText: 'FD-JOURNEY-CHECKIN-1002' }).first();
      const actionCell = checkInRow.locator('td').last();

      await expect(actionCell.locator('button').nth(1)).toBeVisible({ timeout: 15000 });
      await actionCell.locator('button').nth(1).click();

      await expect(page.getByText('Check-in Guest')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('No room assigned yet.')).toBeVisible({ timeout: 15000 });
      await page.getByRole('radio', { name: /Room 401/i }).check();
      await expect(page.getByText('Room is assigned and ready for check-in.')).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: 'Check In Guest' }).click();

      await expect(page.getByText('Guest Journey Guest has been successfully checked in to room 401!')).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 15000 });
      await expect(page.getByText('401 - DELUXE_ROOM')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('CHECKED IN', { exact: true })).toBeVisible({ timeout: 15000 });
    });

    await test.step('check out the guest and open the final receipt', async () => {
      const checkoutRow = page.locator('table tbody tr').filter({ hasText: 'FD-JOURNEY-CHECKIN-1002' }).first();
      const actionCell = checkoutRow.locator('td').last();

      await expect(actionCell.locator('button').nth(1)).toBeVisible({ timeout: 15000 });
      await actionCell.locator('button').nth(1).click();

      await expect(page.getByText('Confirm Guest Checkout')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('This will mark the guest as checked out and generate a final receipt.')).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: 'Check Out' }).click();

      const receiptDialog = page.getByRole('dialog').filter({ hasText: 'Receipt #RCT-JOURNEY-1002' });
      await expect(receiptDialog.getByText('Receipt #RCT-JOURNEY-1002')).toBeVisible({ timeout: 15000 });
      await expect(receiptDialog.getByText('Journey Guest', { exact: true })).toBeVisible({ timeout: 15000 });
      await expect(receiptDialog.getByText('401 (DELUXE_ROOM)')).toBeVisible({ timeout: 15000 });
      await expect(receiptDialog.getByRole('row', { name: /TOTAL AMOUNT ETB 5,400/i })).toBeVisible({ timeout: 15000 });
      await receiptDialog.getByRole('button', { name: 'Close' }).click();

      await expect(page.getByText('CHECKED OUT', { exact: true })).toBeVisible({ timeout: 15000 });
    });
  });
});
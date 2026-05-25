import { expect, test, type Page } from '@playwright/test';

async function searchAndOpenRoomTypeBooking(
  page: Page,
  options: {
    location: string;
    hotelName: string;
    roomTypeName: string;
    actionButtonName: RegExp;
  }
): Promise<void> {
  await page.goto('/');

  await page.getByLabel('Destination').fill(options.location);
  await page.getByLabel('Guests').fill('2');
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/hotels/search') && response.request().method() === 'POST'),
    page.locator('main').getByRole('button', { name: 'Search Hotels' }).click(),
  ]);

  await page.waitForURL(/\/hotels\/search-results/, { timeout: 15000 });
  await expect(page.getByText(options.hotelName).first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(options.roomTypeName).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: /View Hotel|Show All Rooms/i }).first().click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: options.actionButtonName }).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: options.actionButtonName }).first().click();
  await expect(page).toHaveURL(/\/booking$/, { timeout: 15000 });
}

test.describe('Booking Surface Journey', () => {
  test('guest can book, find, modify, and cancel a reservation in one continuous journey', async ({ page }) => {
    const now = Date.now();
    const guestEmail = `journey.booking.${now}@example.com`;
    const managementToken = 'booking-journey-token-1001';

    const searchResponse = [
      {
        id: 299,
        name: 'Journey Grand Hotel',
        description: 'A hotel used for booking surface journey tests',
        address: '123 Journey Avenue',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        availableRooms: [],
        roomTypeAvailability: [
          {
            roomType: 'Deluxe Suite',
            availableCount: 3,
            totalCount: 5,
            pricePerNight: 2500,
            capacity: 2,
            description: 'Spacious suite for booking journey tests',
            displayMessage: '3 Deluxe Suites available',
          },
        ],
        minPrice: 2500,
        maxPrice: 2500,
      },
    ];

    let bookingState = {
      reservationId: 9321,
      confirmationNumber: `BKJ-${now}`,
      hotelId: 299,
      hotelName: 'Journey Grand Hotel',
      hotelAddress: '123 Journey Avenue, Addis Ababa',
      roomNumber: 'Room will be assigned at check-in',
      roomType: 'DELUXE_ROOM',
      pricePerNight: 2500,
      guestName: 'Journey Guest',
      guestEmail,
      guestPhone: '0911223344',
      numberOfGuests: 2,
      checkInDate: '2026-06-20',
      checkOutDate: '2026-06-22',
      totalAmount: 5000,
      paymentMethod: 'pay_at_frontdesk',
      paymentStatus: 'PENDING',
      paymentReference: 'PAY-JOURNEY-1001',
      status: 'BOOKED',
      createdAt: '2026-05-13T10:00:00Z',
    };

    await page.route('**/public/system-settings/payment-gateway', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ gatewayMode: 'mock' }),
      });
    });

    await page.route('**/hotels/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(searchResponse),
      });
    });

    await page.route('**/hotels/299/tax-rate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ vatRate: 0.15, serviceTaxRate: 0.05, cityTaxRate: 0 }),
      });
    });

    await page.route(/.*\/hotels\/299(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(searchResponse[0]),
      });
    });

    await page.route('**/hotels/299', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 299,
          name: 'Journey Grand Hotel',
          mobilePaymentPhone: '0911223344',
          mobilePaymentPhone2: '0911223355',
        }),
      });
    });

    await page.route('**/bookings/room-type', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bookingState),
      });
    });

    await page.route('**/bookings/search**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bookingState),
      });
    });

    await page.route('**/bookings/authenticate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Authentication email sent successfully',
          token: managementToken,
        }),
      });
    });

    await page.route(/.*\/booking-management\?token=.*/, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(bookingState),
        });
        return;
      }

      if (method === 'PUT') {
        const payload = JSON.parse(route.request().postData() ?? '{}');
        bookingState = {
          ...bookingState,
          guestName: payload.newGuestName ?? bookingState.guestName,
          guestEmail: payload.newGuestEmail ?? bookingState.guestEmail,
          checkInDate: payload.newCheckInDate ?? bookingState.checkInDate,
          checkOutDate: payload.newCheckOutDate ?? bookingState.checkOutDate,
          roomType: payload.newRoomType ?? bookingState.roomType,
          numberOfGuests: payload.newNumberOfGuests ?? bookingState.numberOfGuests,
        };

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Booking modified successfully',
            updatedBooking: bookingState,
          }),
        });
        return;
      }

      if (method === 'DELETE') {
        bookingState = {
          ...bookingState,
          status: 'Cancelled',
        };

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(bookingState),
        });
        return;
      }

      await route.fallback();
    });

    await page.route('**/bookings/modify', async (route) => {
      const payload = JSON.parse(route.request().postData() ?? '{}');
      bookingState = {
        ...bookingState,
        guestName: payload.newGuestName ?? bookingState.guestName,
        guestEmail: payload.newGuestEmail ?? bookingState.guestEmail,
        checkInDate: payload.newCheckInDate ?? bookingState.checkInDate,
        checkOutDate: payload.newCheckOutDate ?? bookingState.checkOutDate,
        roomType: payload.newRoomType ?? bookingState.roomType,
        numberOfGuests: payload.newNumberOfGuests ?? bookingState.numberOfGuests,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Booking modified successfully',
          updatedBooking: bookingState,
        }),
      });
    });

    await page.route('**/bookings/cancel', async (route) => {
      bookingState = {
        ...bookingState,
        status: 'Cancelled',
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Booking cancelled successfully',
          booking: bookingState,
        }),
      });
    });

    await test.step('create a public guest booking', async () => {
      await searchAndOpenRoomTypeBooking(page, {
        location: 'Addis Ababa',
        hotelName: 'Journey Grand Hotel',
        roomTypeName: 'Deluxe Suite',
        actionButtonName: /Book as Guest/i,
      });

      await expect(page.getByText('Journey Grand Hotel').first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Deluxe Suite').first()).toBeVisible({ timeout: 15000 });

      await page.getByLabel('First Name').fill('Journey');
      await page.getByLabel('Last Name').fill('Guest');
      await page.getByLabel('Email Address').fill(guestEmail);
      await page.getByLabel('Phone Number').fill('0911223344');
      await page.getByRole('radio', { name: /Pay at Front Desk/i }).check({ force: true });
      await page.getByRole('button', { name: /Book (Now )?- ETB 5,000|Book Now - ETB 5,000|Book - ETB 5,000/i }).click();

      await expect(page).toHaveURL(/\/booking-confirmation\/9321$/, { timeout: 15000 });
      await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(`Confirmation: ${bookingState.confirmationNumber}`)).toBeVisible({ timeout: 15000 });
    });

    await test.step('find the booking and open guest management', async () => {
      await page.goto('/find-booking');
      await expect(page).toHaveURL(/\/find-booking$/, { timeout: 15000 });

      await page.getByLabel('Reference Number').fill(bookingState.confirmationNumber);
      await page.getByLabel('Email Address').fill(bookingState.guestEmail);

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/bookings/search') && response.request().method() === 'GET'),
        page.getByRole('button', { name: /Find Booking/i }).click(),
      ]);

      await expect(page.getByText(bookingState.hotelName).first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(bookingState.guestName, { exact: true })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(bookingState.confirmationNumber)).toBeVisible({ timeout: 15000 });

      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/bookings/search') && response.request().method() === 'GET'),
        page.getByRole('button', { name: /Manage Booking/i }).click(),
      ]);

      await expect(page).toHaveURL(/\/guest-booking-management$/, { timeout: 15000 });
      await expect(page.getByRole('button', { name: /Modify Booking/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: /Cancel Booking/i })).toBeVisible({ timeout: 15000 });
    });

    await test.step('modify the booking details', async () => {
      await page.getByRole('button', { name: /Modify Booking/i }).click();

      await expect(page.getByText('Authentication email sent. Please check your email and click the link to Modify Booking.')).toBeVisible({ timeout: 15000 });

      await page.goto(`/guest-booking-management?token=${managementToken}`);
      await expect(page.getByText(bookingState.confirmationNumber)).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: /Modify Booking/i }).click();

      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Modify Your Booking')).toBeVisible({ timeout: 15000 });

      await page.getByLabel('Guest Name').fill('Updated Journey Guest');
      await page.getByLabel('Reason for Modification').fill('Guest corrected their displayed name');
      await page.getByRole('dialog').getByRole('button', { name: /^Modify Booking$/i }).click();

      await expect(page.getByText('Booking modified successfully')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Updated Journey Guest')).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 15000 });
    });

    await test.step('cancel the booking from guest management', async () => {
      await page.getByRole('button', { name: /Cancel Booking/i }).click();

      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Cancel Your Booking')).toBeVisible({ timeout: 15000 });

      await page.getByLabel('Reason for Cancellation').fill('Travel plans changed');
      await page.getByRole('dialog').getByRole('button', { name: /^Cancel Booking$/i }).click();

      await expect(page.getByText('Booking cancelled successfully')).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: 'Booking Cancelled' })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: /Make New Booking/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: /Find Another Booking/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 15000 });
    });
  });
});
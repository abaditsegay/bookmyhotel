import { test, expect } from '@playwright/test';

test.describe('Guest Booking Flow', () => {
  test('guest can complete a room-type booking and reach confirmation', async ({ page }) => {
    const now = Date.now();
    const guestEmail = `guest.booking.${now}@example.com`;
    const bookingState = {
      roomType: {
        roomType: 'Deluxe Suite',
        pricePerNight: 2500,
        capacity: 2,
        availableCount: 3,
      },
      hotelName: 'Playwright Grand Hotel',
      hotelId: 99,
      searchRequest: {
        checkInDate: '2026-05-20',
        checkOutDate: '2026-05-22',
        guests: 2,
      },
      asGuest: true,
    };

    const confirmationResponse = {
      reservationId: 4321,
      confirmationNumber: `BKT-${now}`,
      hotelId: 99,
      hotelName: 'Playwright Grand Hotel',
      roomType: 'Deluxe Suite',
      pricePerNight: 2500,
      guestName: 'Playwright Guest',
      guestEmail,
      guestPhone: '0911223344',
      numberOfGuests: 2,
      checkInDate: '2026-05-20',
      checkOutDate: '2026-05-22',
      totalAmount: 5000,
      paymentMethod: 'pay_at_frontdesk',
      paymentStatus: 'PENDING',
      status: 'CONFIRMED',
      createdAt: '2026-05-12T10:00:00Z',
    };

    await page.addInitScript((state) => {
      window.history.replaceState(
        { usr: state, key: 'guest-booking-test', idx: 0 },
        '',
        '/booking'
      );
    }, bookingState);

    await page.route('**/public/system-settings/payment-gateway', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ gatewayMode: 'mock' }),
      });
    });

    await page.route('**/hotels/99/tax-rate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ vatRate: 0.15, serviceTaxRate: 0.05, cityTaxRate: 0 }),
      });
    });

    await page.route('**/hotels/99', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 99,
          name: 'Playwright Grand Hotel',
          mobilePaymentPhone: '0911223344',
          mobilePaymentPhone2: '0911223355',
        }),
      });
    });

    await page.route('**/bookings/room-type', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(confirmationResponse),
      });
    });

    await page.goto('/booking');

    await expect(page.getByText('Guest Booking', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Playwright Grand Hotel' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Deluxe Suite' }).first()).toBeVisible();

    await page.getByLabel('First Name').fill('Playwright');
    await page.getByLabel('Last Name').fill('Guest');
    await page.getByLabel('Email Address').fill(guestEmail);
    await page.getByLabel('Phone Number').fill('0911223344');

    await page.getByRole('radio', { name: /Pay at Front Desk/i }).check();
    await page.getByRole('button', { name: /Book (Now )?- ETB 5,000|Book Now - ETB 5,000|Book - ETB 5,000/i }).click();

    await expect(page).toHaveURL(/\/booking-confirmation\/4321$/);
    await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible();
    await expect(page.getByText(`Confirmation: ${confirmationResponse.confirmationNumber}`)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Playwright Grand Hotel' }).first()).toBeVisible();
    await expect(page.locator('p').filter({ hasText: guestEmail }).first()).toBeVisible();
  });
});
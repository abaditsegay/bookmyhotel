import { test, expect, type Page } from '@playwright/test';

import { seedAuthSession } from './support/auth/mockAuth';

async function searchAndOpenRoomTypeBooking(
  page: Page,
  options: {
    location: string;
    checkInInput: string;
    checkOutInput: string;
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

test.describe('Guest Booking Flow', () => {
  test('guest can complete a room-type booking and reach confirmation', async ({ page }) => {
    const now = Date.now();
    const guestEmail = `guest.booking.${now}@example.com`;
    const searchResponse = [
      {
        id: 99,
        name: 'Playwright Grand Hotel',
        description: 'A hotel used for Playwright tests',
        address: '123 Test Avenue',
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
            description: 'Spacious suite for guest booking',
            displayMessage: '3 Deluxe Suites available',
          },
        ],
        minPrice: 2500,
        maxPrice: 2500,
      },
    ];

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

    await page.route('**/hotels/99/tax-rate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ vatRate: 0.15, serviceTaxRate: 0.05, cityTaxRate: 0 }),
      });
    });

    await page.route(/.*\/hotels\/99(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(searchResponse[0]),
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

    await searchAndOpenRoomTypeBooking(page, {
      location: 'Addis Ababa',
      checkInInput: '05/20/2026',
      checkOutInput: '05/22/2026',
      hotelName: 'Playwright Grand Hotel',
      roomTypeName: 'Deluxe Suite',
      actionButtonName: /Book as Guest/i,
    });

    await expect(page.getByText('Playwright Grand Hotel').first()).toBeVisible();
    await expect(page.getByText('Deluxe Suite').first()).toBeVisible();

    await page.getByLabel('First Name').fill('Playwright');
    await page.getByLabel('Last Name').fill('Guest');
    await page.getByLabel('Email Address').fill(guestEmail);
    await page.getByLabel('Phone Number').fill('0911223344');

    await page.getByRole('radio', { name: /Pay at Front Desk/i }).check({ force: true });
    await page.getByRole('button', { name: /Book (Now )?- ETB 5,000|Book Now - ETB 5,000|Book - ETB 5,000/i }).click();

    await expect(page).toHaveURL(/\/booking-confirmation\/4321$/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(`Confirmation: ${confirmationResponse.confirmationNumber}`)).toBeVisible({ timeout: 15000 });
  });

  test('registered customer can complete a room-type booking and reach confirmation', async ({ page }) => {
    const now = Date.now();
    const customerEmail = `registered.booking.${now}@example.com`;
    const searchResponse = [
      {
        id: 109,
        name: 'Playwright City Hotel',
        description: 'A hotel used for registered booking tests',
        address: '456 Test Street',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        availableRooms: [],
        roomTypeAvailability: [
          {
            roomType: 'Executive Room',
            availableCount: 5,
            totalCount: 8,
            pricePerNight: 1800,
            capacity: 2,
            description: 'Executive room for signed-in customers',
            displayMessage: '5 Executive Rooms available',
          },
        ],
        minPrice: 1800,
        maxPrice: 1800,
      },
    ];

    const confirmationResponse = {
      reservationId: 5321,
      confirmationNumber: `BKC-${now}`,
      hotelId: 109,
      hotelName: 'Playwright City Hotel',
      roomType: 'Executive Room',
      pricePerNight: 1800,
      guestName: 'Registered Customer',
      guestEmail: customerEmail,
      guestPhone: '0911556677',
      numberOfGuests: 2,
      checkInDate: '2026-06-03',
      checkOutDate: '2026-06-05',
      totalAmount: 3600,
      paymentMethod: 'pay_at_frontdesk',
      paymentStatus: 'PENDING',
      status: 'CONFIRMED',
      createdAt: '2026-05-12T10:30:00Z',
    };

    await seedAuthSession(page, {
      id: '321',
      email: customerEmail,
      firstName: 'Registered',
      lastName: 'Customer',
      phone: '0911556677',
      role: 'CUSTOMER',
      roles: ['CUSTOMER'],
      tenantId: null,
    });

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

    await page.route('**/hotels/109/tax-rate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ vatRate: 0.15, serviceTaxRate: 0.05, cityTaxRate: 0 }),
      });
    });

    await page.route(/.*\/hotels\/109(\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(searchResponse[0]),
      });
    });

    await page.route('**/hotels/109', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 109,
          name: 'Playwright City Hotel',
          mobilePaymentPhone: '0911556677',
          mobilePaymentPhone2: '0911556688',
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

    await searchAndOpenRoomTypeBooking(page, {
      location: 'Addis Ababa',
      checkInInput: '06/03/2026',
      checkOutInput: '06/05/2026',
      hotelName: 'Playwright City Hotel',
      roomTypeName: 'Executive Room',
      actionButtonName: /Book Now/i,
    });

    await expect(page.getByText('Playwright City Hotel').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Executive Room').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Guest Booking', { exact: true })).toHaveCount(0, { timeout: 15000 });
    await expect(page.getByText('Registered Customer')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(customerEmail)).toBeVisible({ timeout: 15000 });

    await page.getByRole('radio', { name: /Pay at Front Desk/i }).check({ force: true });
    await page.getByRole('button', { name: /Book (Now )?- ETB 3,600|Book Now - ETB 3,600|Book - ETB 3,600/i }).click();

    await expect(page).toHaveURL(/\/booking-confirmation\/5321$/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(`Confirmation: ${confirmationResponse.confirmationNumber}`)).toBeVisible({ timeout: 15000 });
  });
});
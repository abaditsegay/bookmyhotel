import { test, expect } from '@playwright/test';

test.describe('Booking Lookup Flow', () => {
  test('guest can find a booking by reference and open booking management', async ({ page }) => {
    const bookingResponse = {
      reservationId: 6789,
      confirmationNumber: 'BKF-20260513-1001',
      guestName: 'Lookup Guest',
      guestEmail: 'lookup.guest@example.com',
      guestPhone: '0911998877',
      numberOfGuests: 2,
      hotelId: 205,
      hotelName: 'Lookup Test Hotel',
      hotelAddress: '789 Lookup Avenue, Addis Ababa',
      roomNumber: 'Room will be assigned at check-in',
      roomType: 'DELUXE_ROOM',
      checkInDate: '2026-06-10',
      checkOutDate: '2026-06-12',
      totalAmount: 4600,
      pricePerNight: 2300,
      status: 'CONFIRMED',
      createdAt: '2026-05-13T08:30:00Z',
      paymentStatus: 'PENDING',
      paymentReference: 'PAY-LOOKUP-1001',
    };

    let searchRequestCount = 0;

    await page.route('**/bookings/search**', async (route) => {
      searchRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bookingResponse),
      });
    });

    await page.goto('/find-booking');

    await expect(page).toHaveURL(/\/find-booking$/);

    await page.getByLabel('Reference Number').fill(bookingResponse.confirmationNumber);
    await page.getByLabel('Email Address').fill(bookingResponse.guestEmail);

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/bookings/search') && response.request().method() === 'GET'),
      page.getByRole('button', { name: /Find Booking/i }).click(),
    ]);

    await expect(page.getByText(bookingResponse.hotelName).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(bookingResponse.guestName)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(bookingResponse.confirmationNumber)).toBeVisible({ timeout: 15000 });

    await Promise.all([
      page.waitForResponse((response) => response.url().includes('/bookings/search') && response.request().method() === 'GET'),
      page.getByRole('button', { name: /Manage Booking/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/guest-booking-management$/, { timeout: 15000 });
    await expect(page.getByRole('button', { name: /Modify Booking/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Cancel Booking/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(bookingResponse.hotelName).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(bookingResponse.confirmationNumber)).toBeVisible({ timeout: 15000 });
    expect(searchRequestCount).toBeGreaterThanOrEqual(2);
  });
});
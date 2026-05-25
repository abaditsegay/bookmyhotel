import { test, expect } from '@playwright/test';

test.describe('Booking Modification Flow', () => {
  test('guest can modify a booked reservation from a tokenized management link', async ({ page }) => {
    const token = 'modify-token-1001';
    const currentBooking = {
      reservationId: 6790,
      confirmationNumber: 'BKM-20260513-1002',
      guestName: 'Original Guest',
      guestEmail: 'original.guest@example.com',
      guestPhone: '0911887766',
      numberOfGuests: 2,
      hotelId: 206,
      hotelName: 'Modification Test Hotel',
      hotelAddress: '123 Modify Avenue, Addis Ababa',
      roomNumber: 'Room will be assigned at check-in',
      roomType: 'DELUXE_ROOM',
      checkInDate: '2026-06-20',
      checkOutDate: '2026-06-22',
      totalAmount: 4600,
      pricePerNight: 2300,
      status: 'BOOKED',
      createdAt: '2026-05-13T09:00:00Z',
      paymentStatus: 'PENDING',
      paymentReference: 'PAY-MODIFY-1002',
    };

    let bookingState = { ...currentBooking };
    let bookingFetchCount = 0;

    await page.route(/.*\/booking-management\?token=.*/, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        bookingFetchCount += 1;
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

      await route.fallback();
    });

    await page.route('**/hotels/206/tax-rate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ taxRate: 0.2, vatRate: 0.15, serviceTaxRate: 0.05 }),
      });
    });

    await page.goto(`/guest-booking-management?token=${token}`);

    await expect(page.getByText(currentBooking.confirmationNumber)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Modify Booking/i })).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: /Modify Booking/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Modify Your Booking')).toBeVisible({ timeout: 15000 });

    await page.getByLabel('Guest Name').fill('Updated Guest');
    await page.getByLabel('Reason for Modification').fill('Guest corrected their name');
    await page.getByRole('dialog').getByRole('button', { name: /^Modify Booking$/i }).click();

    await expect(page.getByText('Booking modified successfully')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Name:')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Updated Guest')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 15000 });
    expect(bookingFetchCount).toBeGreaterThanOrEqual(2);
  });
});
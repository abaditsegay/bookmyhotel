import { test, expect } from '@playwright/test';

test.describe('Booking Cancellation Flow', () => {
  test('guest can cancel a booked reservation from a tokenized management link', async ({ page }) => {
    const token = 'cancel-token-1001';
    const currentBooking = {
      reservationId: 6791,
      confirmationNumber: 'BKC-20260513-1003',
      guestName: 'Cancelable Guest',
      guestEmail: 'cancelable.guest@example.com',
      guestPhone: '0911776655',
      numberOfGuests: 2,
      hotelId: 207,
      hotelName: 'Cancellation Test Hotel',
      hotelAddress: '456 Cancel Avenue, Addis Ababa',
      roomNumber: 'Room will be assigned at check-in',
      roomType: 'DELUXE_ROOM',
      checkInDate: '2026-06-25',
      checkOutDate: '2026-06-27',
      totalAmount: 4800,
      pricePerNight: 2400,
      status: 'BOOKED',
      createdAt: '2026-05-13T09:30:00Z',
      paymentStatus: 'PENDING',
      paymentReference: 'PAY-CANCEL-1003',
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

      if (method === 'DELETE') {
        bookingState = {
          ...bookingState,
          status: 'CANCELLED',
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

    await page.goto(`/guest-booking-management?token=${token}`);

    await expect(page.getByText(currentBooking.confirmationNumber)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /Cancel Booking/i })).toBeVisible({ timeout: 15000 });

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
    expect(bookingFetchCount).toBeGreaterThanOrEqual(1);
  });
});
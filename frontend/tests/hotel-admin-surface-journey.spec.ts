import { expect, test } from '@playwright/test';

import { seedAuthSession } from './support/auth/mockAuth';

test.describe('Hotel Admin Surface Journey', () => {
  test('hotel admin can review dashboard data, inspect rooms, and manage staff in one continuous journey', async ({ page }) => {
    let staffMembers = [
      {
        id: 4101,
        email: 'frontdesk.existing@example.com',
        firstName: 'Front',
        lastName: 'Desk',
        phone: '0911001100',
        roles: ['FRONTDESK'],
        isActive: true,
        hotelId: 99,
        hotelName: 'Playwright Grand Hotel',
        createdAt: '2026-05-13T09:00:00Z',
        updatedAt: '2026-05-13T09:00:00Z',
      },
    ];

    const rooms = [
      {
        id: 5101,
        roomNumber: '101',
        roomType: 'STANDARD',
        pricePerNight: 1800,
        capacity: 2,
        description: 'Standard room for tenant admin journey',
        isAvailable: true,
        status: 'AVAILABLE',
        hotelId: 99,
        hotelName: 'Playwright Grand Hotel',
        createdAt: '2026-05-13T09:00:00Z',
        updatedAt: '2026-05-13T09:00:00Z',
      },
      {
        id: 5102,
        roomNumber: '201',
        roomType: 'DELUXE_ROOM',
        pricePerNight: 2600,
        capacity: 2,
        description: 'Deluxe room for tenant admin journey',
        isAvailable: false,
        status: 'OCCUPIED',
        hotelId: 99,
        hotelName: 'Playwright Grand Hotel',
        currentGuest: 'Occupied Guest',
        createdAt: '2026-05-13T09:00:00Z',
        updatedAt: '2026-05-13T09:00:00Z',
      },
    ];

    await seedAuthSession(page, {
      id: '906',
      email: 'hotel.admin@example.com',
      firstName: 'Hotel',
      lastName: 'Admin',
      role: 'HOTEL_ADMIN',
      roles: ['HOTEL_ADMIN'],
      tenantId: 'tenant-playwright',
      hotelId: '99',
      hotelName: 'Playwright Grand Hotel',
    });

    await page.route('**/rooms/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rooms),
      });
    });

    await page.route('**/hotel-admin/statistics', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalRooms: 2,
          availableRooms: 1,
          bookedBookings: 3,
          bookedRooms: 1,
          totalStaff: staffMembers.length,
          activeStaff: staffMembers.filter((member) => member.isActive).length,
          staffByRole: { FRONTDESK: 1 },
          roomsByType: { STANDARD: 1, DELUXE_ROOM: 1 },
        }),
      });
    });

    await page.route('**/hotel-admin/bookings/statistics**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalBookings: 3,
          statusBreakdown: { BOOKED: 2, CHECKED_IN: 1 },
          currentYearRevenue: 120000,
          thisMonthBookings: 3,
          upcomingCheckIns: 1,
          upcomingCheckOuts: 1,
        }),
      });
    });

    await page.route('**/hotel-admin/my-hotel', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 99,
          name: 'Playwright Grand Hotel',
          description: 'Tenant admin journey hotel',
          address: '123 Test Avenue',
          city: 'Addis Ababa',
          country: 'Ethiopia',
          isActive: true,
          totalRooms: 2,
          availableRooms: 1,
          bookedRooms: 1,
          totalStaff: staffMembers.length,
        }),
      });
    });

    await page.route(/.*\/hotel-admin\/rooms\?.*/, async (route) => {
      const requestUrl = new URL(route.request().url());
      const search = requestUrl.searchParams.get('search')?.trim().toLowerCase();
      const content = search
        ? rooms.filter((room) => room.roomNumber.toLowerCase().includes(search))
        : rooms;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content,
          totalElements: content.length,
          totalPages: 1,
          number: 0,
          size: 25,
        }),
      });
    });

    await page.route(/.*\/hotel-admin\/staff\?.*/, async (route) => {
      const requestUrl = new URL(route.request().url());
      const search = requestUrl.searchParams.get('search')?.trim().toLowerCase();
      const content = search
        ? staffMembers.filter((member) => {
            const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
            return fullName.includes(search) || member.email.toLowerCase().includes(search);
          })
        : staffMembers;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content,
          page: {
            totalElements: content.length,
            totalPages: 1,
            number: 0,
            size: 10,
          },
        }),
      });
    });

    await page.route('**/hotel-admin/staff', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback();
        return;
      }

      const payload = JSON.parse(route.request().postData() ?? '{}');
      const createdStaff = {
        id: 4102,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phone: payload.phone,
        roles: payload.roles,
        isActive: true,
        hotelId: 99,
        hotelName: 'Playwright Grand Hotel',
        createdAt: '2026-05-13T10:30:00Z',
        updatedAt: '2026-05-13T10:30:00Z',
      };

      staffMembers = [...staffMembers, createdStaff];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createdStaff),
      });
    });

    await page.route(/.*\/hotel-admin\/staff\/\d+\/(deactivate|activate)/, async (route) => {
      if (route.request().method() !== 'PUT') {
        await route.fallback();
        return;
      }

      const requestUrl = route.request().url();
      const match = requestUrl.match(/\/hotel-admin\/staff\/(\d+)\/(deactivate|activate)/);

      if (!match) {
        await route.fallback();
        return;
      }

      const staffId = Number(match[1]);
      const action = match[2];

      let updatedStaff = null;
      staffMembers = staffMembers.map((member) => {
        if (member.id !== staffId) {
          return member;
        }

        updatedStaff = {
          ...member,
          isActive: action === 'activate',
          updatedAt: '2026-05-13T11:00:00Z',
        };

        return updatedStaff;
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedStaff),
      });
    });

    await test.step('review the hotel admin dashboard', async () => {
      await page.goto('/hotel-admin/dashboard');
      await expect(page.getByText('Playwright Grand Hotel').first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('2').first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: 'Edit Hotel Details' })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Hotel Information')).toBeVisible({ timeout: 15000 });
    });

    await test.step('inspect the rooms surface', async () => {
      await page.goto('/hotel-admin/rooms');
      await expect(page.getByText('101')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('201')).toBeVisible({ timeout: 15000 });

      await page.getByRole('textbox', { name: 'Search rooms' }).fill('101');
      const roomRow = page.locator('tbody tr').filter({ hasText: '101' }).first();
      await expect(roomRow).toBeVisible({ timeout: 15000 });
      await expect(roomRow.getByText('STANDARD')).toBeVisible({ timeout: 15000 });
    });

    await test.step('create a new staff member', async () => {
      await page.goto('/hotel-admin/staff');
      await expect(page.getByText('frontdesk.existing@example.com')).toBeVisible({ timeout: 15000 });

      await page.getByRole('button', { name: 'Add New Staff' }).click();
      const dialog = page.getByRole('dialog', { name: 'Add New Staff Member' });
      await expect(dialog).toBeVisible({ timeout: 15000 });

      await dialog.getByLabel('Email').fill('new.staff@example.com');
      await dialog.getByLabel('Password').fill('staffPass123');
      await dialog.getByLabel('First Name').fill('New');
      await dialog.getByLabel('Last Name').fill('Staff');
      await dialog.getByLabel('Phone (Optional)').fill('0911333444');
      await dialog.getByRole('checkbox', { name: 'FRONTDESK' }).check();
      await dialog.getByRole('button', { name: 'Create Staff' }).click();

      await expect(dialog).toHaveCount(0, { timeout: 15000 });
      await page.getByLabel('Search staff...').fill('new.staff@example.com');
      const staffRow = page.locator('tbody tr').filter({ hasText: 'new.staff@example.com' }).first();
      await expect(staffRow).toBeVisible({ timeout: 15000 });
      await expect(staffRow.getByText('New Staff', { exact: true })).toBeVisible({ timeout: 15000 });
    });

    await test.step('deactivate and reactivate a staff member', async () => {
      await page.getByLabel('Search staff...').fill('new.staff@example.com');
      const staffRow = page.locator('tbody tr').filter({ hasText: 'new.staff@example.com' }).first();
      const activeToggle = staffRow.getByRole('checkbox').first();

      await expect(staffRow.getByText('Active', { exact: true })).toBeVisible({ timeout: 15000 });
      await expect(activeToggle).toBeChecked({ timeout: 15000 });

      await activeToggle.click();
      await expect(activeToggle).not.toBeChecked({ timeout: 15000 });
      await expect(staffRow.getByText('Inactive', { exact: true })).toBeVisible({ timeout: 15000 });

      await activeToggle.click();
      await expect(activeToggle).toBeChecked({ timeout: 15000 });
      await expect(staffRow.getByText('Active', { exact: true })).toBeVisible({ timeout: 15000 });
    });
  });
});
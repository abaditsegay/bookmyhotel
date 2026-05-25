import { expect, test } from '@playwright/test';

import { buildHotelRegistrationData } from './support/data/hotelRegistration';
import { buildUserCreationData } from './support/data/userManagement';
import { seedAuthSession } from './support/auth/mockAuth';
import { HotelManagementPage } from './support/pages/HotelManagementPage';
import { HotelRegistrationReviewPage } from './support/pages/HotelRegistrationReviewPage';
import { UserManagementPage } from './support/pages/UserManagementPage';

test.describe('System Admin Surface Journey', () => {
  test('system admin can create a user and complete hotel registration approval in one continuous journey', async ({ page }) => {
    const userManagementPage = new UserManagementPage(page);
    const hotelManagementPage = new HotelManagementPage(page);
    const hotelRegistrationReviewPage = new HotelRegistrationReviewPage(page);
    const user = buildUserCreationData();
    const registration = buildHotelRegistrationData();
    const approvalComments = `Surface journey approval ${Date.now()}`;
    let users = [
      {
        id: 100,
        email: 'admin@bookmyhotel.com',
        firstName: 'System',
        lastName: 'Admin',
        phone: '0911000000',
        isActive: true,
        roles: ['SUPER_ADMIN'],
        createdAt: '2026-05-13T09:00:00Z',
        updatedAt: '2026-05-13T09:00:00Z',
      },
    ];
    let registrations = [
      {
        id: 501,
        hotelName: 'Approved Seed Hotel',
        contactPerson: 'Existing Owner',
        description: 'Existing approved registration',
        address: 'Approved Address',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        contactEmail: 'approved@example.com',
        phone: '0911002200',
        mobilePaymentPhone: '0912002200',
        mobilePaymentPhone2: '0913002200',
        licenseNumber: 'LIC-APPROVED-1',
        taxId: 'TIN-APPROVED-1',
        websiteUrl: 'https://approved.example.com',
        facilityAmenities: 'WiFi',
        numberOfRooms: 50,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        status: 'APPROVED',
        createdAt: '2026-05-13T09:00:00Z',
        updatedAt: '2026-05-13T09:00:00Z',
      },
    ];

    await seedAuthSession(page, {
      id: '900',
      email: 'admin@bookmyhotel.com',
      firstName: 'System',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      roles: ['SUPER_ADMIN'],
      tenantId: null,
    });

    await page.route('**/admin/tenants/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { tenantId: 'tenant-playwright', name: 'Playwright Tenant', isActive: true },
        ]),
      });
    });

    await page.route('**/admin/hotels/tenant/**/options', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 99, name: 'Playwright Grand Hotel', city: 'Addis Ababa' },
        ]),
      });
    });

    await page.route(/.*\/admin\/users(?:\?.*)?$/, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: users,
            totalElements: users.length,
            totalPages: 1,
            number: 0,
            size: 10,
            numberOfElements: users.length,
            first: true,
            last: true,
            empty: users.length === 0,
          }),
        });
        return;
      }

      if (method === 'POST') {
        const payload = JSON.parse(route.request().postData() ?? '{}');
        const createdUser = {
          id: 101,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phone,
          isActive: true,
          roles: payload.roles,
          createdAt: '2026-05-13T10:00:00Z',
          updatedAt: '2026-05-13T10:00:00Z',
        };
        users = [...users, createdUser];

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(createdUser),
        });
        return;
      }

      await route.fallback();
    });

    await page.route(/.*\/admin\/users\/search\?.*/, async (route) => {
      const requestUrl = new URL(route.request().url());
      const searchTerm = requestUrl.searchParams.get('searchTerm')?.toLowerCase() ?? '';
      const content = users.filter((candidate) =>
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm)
      );

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content,
          totalElements: content.length,
          totalPages: 1,
          number: 0,
          size: 10,
          numberOfElements: content.length,
          first: true,
          last: true,
          empty: content.length === 0,
        }),
      });
    });

    await page.route(/.*\/admin\/hotels(?:\?.*)?$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 1000,
          numberOfElements: 0,
          first: true,
          last: true,
          empty: true,
        }),
      });
    });

    await page.route(/.*\/admin\/hotel-registrations(?:\?.*)?$/, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: registrations,
            totalElements: registrations.length,
            totalPages: 1,
            number: 0,
            size: 10,
            numberOfElements: registrations.length,
            first: true,
            last: true,
            empty: registrations.length === 0,
          }),
        });
        return;
      }

      if (method === 'POST') {
        const payload = JSON.parse(route.request().postData() ?? '{}');
        const createdRegistration = {
          id: 777,
          ...payload,
          status: 'PENDING',
          createdAt: '2026-05-13T10:10:00Z',
          updatedAt: '2026-05-13T10:10:00Z',
        };
        registrations = [createdRegistration, ...registrations];

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(createdRegistration),
        });
        return;
      }

      await route.fallback();
    });

    await page.route(/.*\/admin\/hotel-registrations\/\d+\/approve$/, async (route) => {
      const id = Number(route.request().url().match(/hotel-registrations\/(\d+)\/approve$/)?.[1]);
      registrations = registrations.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              status: 'APPROVED',
              updatedAt: '2026-05-13T10:15:00Z',
            }
          : candidate
      );
      const approved = registrations.find((candidate) => candidate.id === id);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(approved),
      });
    });

    await test.step('log in as system admin', async () => {
      await page.goto('/system/users');
      await expect(page.getByText('System Administrator')).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('create a new admin user', async () => {
      await userManagementPage.goto();
      await userManagementPage.openCreateUserDialog();
      await userManagementPage.fillCreateUserForm(user);

      const createUserOutcomePromise = Promise.race([
        page.waitForResponse(
          (response) => response.url().includes('/admin/users') && response.request().method() === 'POST',
          { timeout: 15000 }
        ).then((response) => ({ kind: 'response' as const, response })),
        page.waitForEvent('requestfailed', {
          predicate: (request) => request.url().includes('/admin/users') && request.method() === 'POST',
          timeout: 15000,
        }).then((request) => ({ kind: 'failed' as const, request })),
      ]);

      await userManagementPage.submitCreateUser();

      const createUserOutcome = await createUserOutcomePromise;
      expect(
        createUserOutcome.kind,
        createUserOutcome.kind === 'failed'
          ? createUserOutcome.request.failure()?.errorText
          : 'create user response was never observed'
      ).toBe('response');
      expect(createUserOutcome.response.status()).toBe(200);

      await userManagementPage.expectUserCreated(user);
    });

    await test.step('register a new hotel', async () => {
      await hotelManagementPage.goto();
      await hotelManagementPage.openRegistrationsTab();
      await hotelManagementPage.openRegistrationDialog();
      await hotelManagementPage.fillRegistrationForm(registration);

      const registrationOutcomePromise = Promise.race([
        page.waitForResponse(
          (response) => response.url().includes('/admin/hotel-registrations') && response.request().method() === 'POST',
          { timeout: 15000 }
        ).then((response) => ({ kind: 'response' as const, response })),
        page.waitForEvent('requestfailed', {
          predicate: (request) => request.url().includes('/admin/hotel-registrations') && request.method() === 'POST',
          timeout: 15000,
        }).then((request) => ({ kind: 'failed' as const, request })),
      ]);

      await hotelManagementPage.submitRegistration();

      const registrationOutcome = await registrationOutcomePromise;
      expect(
        registrationOutcome.kind,
        registrationOutcome.kind === 'failed'
          ? registrationOutcome.request.failure()?.errorText
          : 'registration response was never observed'
      ).toBe('response');
      expect(registrationOutcome.response.status()).toBe(201);

      await hotelManagementPage.expectRegistrationSubmitted(registration);
    });

    await test.step('review and approve the hotel registration', async () => {
      await hotelRegistrationReviewPage.openReview(registration.hotelName);
      await hotelRegistrationReviewPage.openApprovalDialog();

      const approvalOutcomePromise = Promise.race([
        page.waitForResponse(
          (response) => response.url().includes('/admin/hotel-registrations/') && response.url().includes('/approve') && response.request().method() === 'POST',
          { timeout: 15000 }
        ).then((response) => ({ kind: 'response' as const, response })),
        page.waitForEvent('requestfailed', {
          predicate: (request) => request.url().includes('/admin/hotel-registrations/') && request.url().includes('/approve') && request.method() === 'POST',
          timeout: 15000,
        }).then((request) => ({ kind: 'failed' as const, request })),
      ]);

      await hotelRegistrationReviewPage.confirmApproval(approvalComments);

      const approvalOutcome = await approvalOutcomePromise;
      expect(
        approvalOutcome.kind,
        approvalOutcome.kind === 'failed'
          ? approvalOutcome.request.failure()?.errorText
          : 'approval response was never observed'
      ).toBe('response');
      expect(approvalOutcome.response.status()).toBe(200);

      await hotelRegistrationReviewPage.expectApproved(registration.hotelName);
    });
  });
});
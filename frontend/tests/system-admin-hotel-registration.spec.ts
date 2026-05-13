import { expect, test } from '@playwright/test';

import { loginAsSystemAdmin } from './support/auth/adminAuth';
import { buildHotelRegistrationData } from './support/data/hotelRegistration';
import { HotelManagementPage } from './support/pages/HotelManagementPage';

test.describe('System Admin - Hotel Registration', () => {
  test('should submit a new hotel registration through the admin flow', async ({ page }) => {
    const hotelManagementPage = new HotelManagementPage(page);
    const registration = buildHotelRegistrationData();

    await loginAsSystemAdmin(page);
    await hotelManagementPage.goto();
    await hotelManagementPage.openRegistrationsTab();
    await hotelManagementPage.openRegistrationDialog();
    await hotelManagementPage.fillRegistrationForm(registration);

    const endpointMatcher = (url: string, method?: string): boolean =>
      url.includes('/admin/hotel-registrations') && (!method || method === 'POST');

    const responseOutcomePromise = Promise.race([
      page.waitForResponse(
        (response) => endpointMatcher(response.url(), response.request().method()),
        { timeout: 15000 }
      ).then((response) => ({ kind: 'response' as const, response })),
      page.waitForEvent('requestfailed', {
        predicate: (request) => endpointMatcher(request.url(), request.method()),
        timeout: 15000,
      }).then((request) => ({ kind: 'failed' as const, request })),
    ]);

    await hotelManagementPage.submitRegistration();

    const outcome = await responseOutcomePromise;
    expect(
      outcome.kind,
      outcome.kind === 'failed' ? outcome.request.failure()?.errorText : 'registration response was never observed'
    ).toBe('response');

    expect(outcome.response.status()).toBe(201);
    await hotelManagementPage.expectRegistrationSubmitted(registration);
  });
});

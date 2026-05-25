import { expect, test } from '@playwright/test';

import { loginAsSystemAdmin } from './support/auth/adminAuth';
import { buildHotelRegistrationData } from './support/data/hotelRegistration';
import { HotelManagementPage } from './support/pages/HotelManagementPage';
import { HotelRegistrationReviewPage } from './support/pages/HotelRegistrationReviewPage';

test.describe('System Admin - Hotel Approval', () => {
  test('should approve a pending hotel registration through the review dialog', async ({ page }) => {
    const hotelManagementPage = new HotelManagementPage(page);
    const hotelRegistrationReviewPage = new HotelRegistrationReviewPage(page);
    const registration = buildHotelRegistrationData();
    const approvalComments = `Approved during Playwright test ${Date.now()}`;

    await loginAsSystemAdmin(page);
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

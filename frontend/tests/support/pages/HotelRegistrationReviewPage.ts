import { expect, Page } from '@playwright/test';

export class HotelRegistrationReviewPage {
  constructor(private readonly page: Page) {}

  private registrationRow(hotelName: string) {
    return this.page.locator('tbody tr', {
      has: this.page.getByText(hotelName, { exact: true }),
    }).first();
  }

  async openReview(hotelName: string): Promise<void> {
    const row = this.registrationRow(hotelName);
    const reviewDialog = this.page.getByRole('dialog', { name: /Review Hotel Registration/ });

    await expect(row).toBeVisible({ timeout: 15000 });
    await row.getByRole('button', { name: 'Review' }).click();
    await expect(reviewDialog.getByRole('heading', { name: 'Review Hotel Registration' })).toBeVisible();
    await expect(reviewDialog.getByText(hotelName, { exact: true })).toBeVisible();
  }

  async openApprovalDialog(): Promise<void> {
    const reviewDialog = this.page.getByRole('dialog', { name: /Review Hotel Registration/ });

    if (await reviewDialog.getByRole('button', { name: 'Approve' }).count() === 0) {
      await reviewDialog.getByRole('button', { name: 'Next' }).click();
    }

    await expect(reviewDialog.getByRole('button', { name: 'Approve' })).toBeVisible();
    await reviewDialog.getByRole('button', { name: 'Approve' }).click();
    await expect(this.page.getByRole('heading', { name: 'Approve Hotel Registration' })).toBeVisible();
  }

  async confirmApproval(comments: string): Promise<void> {
    await this.page.getByLabel('Approval Comments (Optional)').fill(comments);
    await this.page.getByRole('button', { name: 'Approve Registration' }).click();
  }

  async expectApproved(hotelName: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Approve Hotel Registration' })).toBeHidden();
    await expect(this.page.getByTestId('hotel-management-success-alert')).toContainText(
      'Hotel registration approved successfully!',
      { timeout: 15000 }
    );
    await expect(this.registrationRow(hotelName)).toContainText('APPROVED', { timeout: 15000 });
  }
}
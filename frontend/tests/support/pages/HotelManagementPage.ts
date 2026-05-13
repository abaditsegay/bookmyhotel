import { expect, Page } from '@playwright/test';

import { HotelRegistrationData } from '../data/hotelRegistration';

export class HotelManagementPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/system/hotels');
    await expect(this.page.getByTestId('hotel-management-page')).toBeVisible();
  }

  async openRegistrationsTab(): Promise<void> {
    await this.page.getByTestId('hotel-management-registrations-tab').click();
    await expect(this.page.getByTestId('hotel-management-registrations-tab')).toHaveAttribute('aria-selected', 'true');
  }

  async openRegistrationDialog(): Promise<void> {
    await this.page.getByTestId('hotel-management-register-button').click();
    await expect(this.page.getByTestId('hotel-registration-dialog')).toBeVisible();
  }

  async openExistingHotelsTab(): Promise<void> {
    await this.page.getByTestId('hotel-management-existing-hotels-tab').click();
    await expect(this.page.getByTestId('hotel-management-existing-hotels-tab')).toHaveAttribute('aria-selected', 'true');
  }

  async fillRegistrationForm(data: HotelRegistrationData): Promise<void> {
    await this.page.getByTestId('hotel-registration-hotel-name-input').fill(data.hotelName);
    await this.page.getByTestId('hotel-registration-contact-person-input').fill(data.contactPerson);
    await this.page.getByTestId('hotel-registration-description-input').fill(data.description);
    await this.page.getByTestId('hotel-registration-address-input').fill(data.address);
    await this.page.getByTestId('hotel-registration-city-input').fill(data.city);
    await this.page.getByTestId('hotel-registration-country-input').fill(data.country);
    await this.page.getByTestId('hotel-registration-contact-email-input').fill(data.contactEmail);
    await this.page.getByTestId('hotel-registration-phone-input').fill(data.phone);
    await this.page.getByTestId('hotel-registration-mobile-payment-phone-input').fill(data.mobilePaymentPhone);
    await this.page.getByTestId('hotel-registration-mobile-payment-phone-2-input').fill(data.mobilePaymentPhone2);
    await this.page.getByTestId('hotel-registration-license-number-input').fill(data.licenseNumber);
    await this.page.getByTestId('hotel-registration-tax-id-input').fill(data.taxId);
    await this.page.getByTestId('hotel-registration-website-url-input').fill(data.websiteUrl);
    await this.page.getByTestId('hotel-registration-facility-amenities-input').fill(data.facilityAmenities);
    await this.page.getByTestId('hotel-registration-number-of-rooms-input').fill(data.numberOfRooms);
    await this.page.getByTestId('hotel-registration-check-in-time-input').fill(data.checkInTime);
    await this.page.getByTestId('hotel-registration-check-out-time-input').fill(data.checkOutTime);
  }

  async submitRegistration(): Promise<void> {
    await this.page.getByTestId('hotel-registration-submit-button').click();
  }

  async expectRegistrationSubmitted(data: HotelRegistrationData): Promise<void> {
    await expect(this.page.getByTestId('hotel-registration-dialog')).toBeHidden();
    await expect(this.page.getByRole('heading', { name: data.hotelName })).toBeVisible({ timeout: 10000 });
    await expect(this.page.getByText(data.contactEmail, { exact: true })).toBeVisible({ timeout: 10000 });
  }
}
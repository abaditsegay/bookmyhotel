import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CustomerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  loyaltyNumber?: string;
  membershipTier?: string;
  loyaltyPoints?: number;
  preferences?: {
    roomType?: string;
    floorPreference?: string;
    smokingPreference?: string;
    bedType?: string;
  };
}

export interface CustomerBooking {
  id: string;
  confirmationNumber: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  guestCount: number;
}

export class CustomerDashboardPage extends BasePage {
  readonly dashboardContainer: Locator;
  readonly welcomeMessage: Locator;
  readonly upcomingBookingsSection: Locator;
  readonly pastBookingsSection: Locator;
  readonly profileSection: Locator;
  readonly loyaltySection: Locator;
  readonly bookingCards: Locator;
  readonly viewAllBookingsButton: Locator;
  readonly editProfileButton: Locator;
  readonly bookNewStayButton: Locator;
  readonly loyaltyPointsDisplay: Locator;
  readonly loyaltyTierDisplay: Locator;
  readonly preferencesButton: Locator;
  readonly supportButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardContainer = page.locator('[data-testid="customer-dashboard"]');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.upcomingBookingsSection = page.locator('[data-testid="upcoming-bookings"]');
    this.pastBookingsSection = page.locator('[data-testid="past-bookings"]');
    this.profileSection = page.locator('[data-testid="profile-section"]');
    this.loyaltySection = page.locator('[data-testid="loyalty-section"]');
    this.bookingCards = page.locator('[data-testid="booking-card"]');
    this.viewAllBookingsButton = page.locator('[data-testid="view-all-bookings"]');
    this.editProfileButton = page.locator('[data-testid="edit-profile-btn"]');
    this.bookNewStayButton = page.locator('[data-testid="book-new-stay-btn"]');
    this.loyaltyPointsDisplay = page.locator('[data-testid="loyalty-points"]');
    this.loyaltyTierDisplay = page.locator('[data-testid="loyalty-tier"]');
    this.preferencesButton = page.locator('[data-testid="preferences-btn"]');
    this.supportButton = page.locator('[data-testid="support-btn"]');
    this.logoutButton = page.locator('[data-testid="logout-btn"]');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/customer/dashboard');
    await this.waitForPageLoad();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.dashboardContainer).toBeVisible();
    await expect(this.welcomeMessage).toBeVisible();
  }

  async getUpcomingBookings(): Promise<CustomerBooking[]> {
    const bookings: CustomerBooking[] = [];
    const upcomingCards = await this.upcomingBookingsSection
      .locator('[data-testid="booking-card"]')
      .all();
    
    for (const card of upcomingCards) {
      const booking = await this.extractBookingData(card);
      bookings.push(booking);
    }
    
    return bookings;
  }

  async getPastBookings(): Promise<CustomerBooking[]> {
    const bookings: CustomerBooking[] = [];
    const pastCards = await this.pastBookingsSection
      .locator('[data-testid="booking-card"]')
      .all();
    
    for (const card of pastCards) {
      const booking = await this.extractBookingData(card);
      bookings.push(booking);
    }
    
    return bookings;
  }

  private async extractBookingData(card: Locator): Promise<CustomerBooking> {
    const confirmationNumber = await card.locator('[data-testid="confirmation-number"]').textContent();
    const hotelName = await card.locator('[data-testid="hotel-name"]').textContent();
    const roomType = await card.locator('[data-testid="room-type"]').textContent();
    const checkInDate = await card.locator('[data-testid="checkin-date"]').textContent();
    const checkOutDate = await card.locator('[data-testid="checkout-date"]').textContent();
    const totalAmountText = await card.locator('[data-testid="total-amount"]').textContent();
    const status = await card.locator('[data-testid="booking-status"]').textContent();
    const guestCountText = await card.locator('[data-testid="guest-count"]').textContent();
    
    const totalAmount = parseFloat(totalAmountText?.replace(/[^0-9.-]/g, '') || '0');
    const guestCount = parseInt(guestCountText?.replace(/[^0-9]/g, '') || '1');
    
    return {
      id: confirmationNumber || '',
      confirmationNumber: confirmationNumber || '',
      hotelName: hotelName || '',
      roomType: roomType || '',
      checkInDate: checkInDate || '',
      checkOutDate: checkOutDate || '',
      totalAmount,
      status: status || '',
      guestCount
    };
  }

  async viewBookingDetails(confirmationNumber: string): Promise<void> {
    const bookingCard = this.bookingCards.filter({
      has: this.page.locator(`[data-testid="confirmation-number"]:has-text("${confirmationNumber}")`)
    });
    
    const viewDetailsButton = bookingCard.locator('[data-testid="view-details-btn"]');
    await viewDetailsButton.click();
    await this.waitForPageLoad();
  }

  async cancelBooking(confirmationNumber: string, reason: string): Promise<void> {
    const bookingCard = this.bookingCards.filter({
      has: this.page.locator(`[data-testid="confirmation-number"]:has-text("${confirmationNumber}")`)
    });
    
    const cancelButton = bookingCard.locator('[data-testid="cancel-booking-btn"]');
    await cancelButton.click();
    
    const cancelModal = this.page.locator('[data-testid="cancel-booking-modal"]');
    await expect(cancelModal).toBeVisible();
    
    await cancelModal.locator('select[name="reason"]').selectOption(reason);
    const confirmCancelButton = cancelModal.locator('[data-testid="confirm-cancel"]');
    await confirmCancelButton.click();
    
    await expect(cancelModal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async downloadBookingConfirmation(confirmationNumber: string): Promise<void> {
    const bookingCard = this.bookingCards.filter({
      has: this.page.locator(`[data-testid="confirmation-number"]:has-text("${confirmationNumber}")`)
    });
    
    const downloadButton = bookingCard.locator('[data-testid="download-confirmation-btn"]');
    await downloadButton.click();
    
    // Wait for download
    await this.page.waitForTimeout(1000);
  }

  async editProfile(): Promise<void> {
    await this.editProfileButton.click();
    await this.waitForPageLoad();
  }

  async updateProfile(profileData: Partial<CustomerProfile>): Promise<void> {
    await this.editProfileButton.click();
    
    const profileModal = this.page.locator('[data-testid="edit-profile-modal"]');
    await expect(profileModal).toBeVisible();
    
    if (profileData.firstName) {
      await profileModal.locator('input[name="firstName"]').fill(profileData.firstName);
    }
    if (profileData.lastName) {
      await profileModal.locator('input[name="lastName"]').fill(profileData.lastName);
    }
    if (profileData.phone) {
      await profileModal.locator('input[name="phone"]').fill(profileData.phone);
    }
    if (profileData.address) {
      await profileModal.locator('input[name="address"]').fill(profileData.address);
    }
    if (profileData.city) {
      await profileModal.locator('input[name="city"]').fill(profileData.city);
    }
    if (profileData.country) {
      await profileModal.locator('select[name="country"]').selectOption(profileData.country);
    }
    
    const saveButton = profileModal.locator('[data-testid="save-profile"]');
    await saveButton.click();
    
    await expect(profileModal).not.toBeVisible();
    await this.waitForPageLoad();
  }

  async getLoyaltyPoints(): Promise<number> {
    const pointsText = await this.loyaltyPointsDisplay.textContent();
    return parseInt(pointsText?.replace(/[^0-9]/g, '') || '0');
  }

  async getLoyaltyTier(): Promise<string> {
    return await this.loyaltyTierDisplay.textContent() || '';
  }

  async viewLoyaltyDetails(): Promise<void> {
    await this.loyaltySection.click();
    await this.waitForPageLoad();
  }

  async bookNewStay(): Promise<void> {
    await this.bookNewStayButton.click();
    await this.waitForPageLoad();
  }

  async viewAllBookings(): Promise<void> {
    await this.viewAllBookingsButton.click();
    await this.waitForPageLoad();
  }

  async managePreferences(): Promise<void> {
    await this.preferencesButton.click();
    await this.waitForPageLoad();
  }

  async contactSupport(): Promise<void> {
    await this.supportButton.click();
    await this.waitForPageLoad();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.waitForPageLoad();
  }

  async verifyWelcomeMessage(customerName: string): Promise<void> {
    await expect(this.welcomeMessage).toContainText(customerName);
  }

  async verifyBookingStatus(confirmationNumber: string, expectedStatus: string): Promise<void> {
    const bookingCard = this.bookingCards.filter({
      has: this.page.locator(`[data-testid="confirmation-number"]:has-text("${confirmationNumber}")`)
    });
    
    const statusElement = bookingCard.locator('[data-testid="booking-status"]');
    await expect(statusElement).toContainText(expectedStatus);
  }

  async getBookingCount(): Promise<{ upcoming: number; past: number }> {
    const upcomingCount = await this.upcomingBookingsSection
      .locator('[data-testid="booking-card"]')
      .count();
    
    const pastCount = await this.pastBookingsSection
      .locator('[data-testid="booking-card"]')
      .count();
    
    return { upcoming: upcomingCount, past: pastCount };
  }

  async searchBookings(query: string): Promise<void> {
    const searchInput = this.page.locator('[data-testid="booking-search"]');
    await searchInput.fill(query);
    await searchInput.press('Enter');
    await this.waitForPageLoad();
  }

  async filterBookingsByStatus(status: string): Promise<void> {
    const statusFilter = this.page.locator('[data-testid="booking-status-filter"]');
    await statusFilter.selectOption(status);
    await this.waitForPageLoad();
  }

  // Additional navigation methods
  async navigateToBookings(): Promise<void> {
    await this.page.goto('/customer/bookings');
    await this.waitForPageLoad();
  }

  async navigateToProfile(): Promise<void> {
    await this.page.goto('/customer/profile');
    await this.waitForPageLoad();
  }

  async navigateToLoyalty(): Promise<void> {
    await this.page.goto('/customer/loyalty');
    await this.waitForPageLoad();
  }

  async navigateToReviews(): Promise<void> {
    await this.page.goto('/customer/reviews');
    await this.waitForPageLoad();
  }

  async navigateToSupport(): Promise<void> {
    await this.page.goto('/customer/support');
    await this.waitForPageLoad();
  }

  // Data retrieval methods
  async getCustomerProfile(): Promise<CustomerProfile> {
    const profileSection = this.page.locator('[data-testid="profile-section"]');
    
    const firstName = await profileSection.locator('[data-testid="first-name"]').textContent() || '';
    const lastName = await profileSection.locator('[data-testid="last-name"]').textContent() || '';
    const email = await profileSection.locator('[data-testid="email"]').textContent() || '';
    const phone = await profileSection.locator('[data-testid="phone"]').textContent() || '';
    const dateOfBirth = await profileSection.locator('[data-testid="date-of-birth"]').textContent() || '';
    const address = await profileSection.locator('[data-testid="address"]').textContent() || '';
    const membershipTier = await profileSection.locator('[data-testid="membership-tier"]').textContent() || '';
    const loyaltyPointsText = await profileSection.locator('[data-testid="loyalty-points"]').textContent() || '0';
    const loyaltyPoints = parseInt(loyaltyPointsText.replace(/[^0-9]/g, ''));

    const preferencesSection = profileSection.locator('[data-testid="preferences-section"]');
    const preferences = {
      roomType: await preferencesSection.locator('[data-testid="room-type-pref"]').textContent() || '',
      floorPreference: await preferencesSection.locator('[data-testid="floor-pref"]').textContent() || '',
      smokingPreference: await preferencesSection.locator('[data-testid="smoking-pref"]').textContent() || '',
      bedType: await preferencesSection.locator('[data-testid="bed-type-pref"]').textContent() || ''
    };

    return {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city: '',
      country: '',
      membershipTier,
      loyaltyPoints,
      preferences
    };
  }

  async getBookingSummary(): Promise<any> {
    const summarySection = this.page.locator('[data-testid="booking-summary"]');
    
    const totalBookingsText = await summarySection.locator('[data-testid="total-bookings"]').textContent() || '0';
    const upcomingBookingsText = await summarySection.locator('[data-testid="upcoming-bookings"]').textContent() || '0';
    const completedBookingsText = await summarySection.locator('[data-testid="completed-bookings"]').textContent() || '0';
    const cancelledBookingsText = await summarySection.locator('[data-testid="cancelled-bookings"]').textContent() || '0';

    return {
      totalBookings: parseInt(totalBookingsText.replace(/[^0-9]/g, '')),
      upcomingBookings: parseInt(upcomingBookingsText.replace(/[^0-9]/g, '')),
      completedBookings: parseInt(completedBookingsText.replace(/[^0-9]/g, '')),
      cancelledBookings: parseInt(cancelledBookingsText.replace(/[^0-9]/g, ''))
    };
  }

  async refreshDashboard(): Promise<void> {
    await this.page.locator('[data-testid="refresh-dashboard"]').click();
    await this.waitForPageLoad();
  }

  async getBookingHistory(): Promise<CustomerBooking[]> {
    const historyCards = await this.page.locator('[data-testid="booking-history"] [data-testid="booking-card"]').all();
    return Promise.all(historyCards.map(card => this.extractBookingData(card)));
  }

  // Loyalty program methods
  async getLoyaltyStatus(): Promise<any> {
    const loyaltySection = this.page.locator('[data-testid="loyalty-status"]');
    
    const currentTier = await loyaltySection.locator('[data-testid="current-tier"]').textContent() || '';
    const pointsText = await loyaltySection.locator('[data-testid="current-points"]').textContent() || '0';
    const pointsToNextTierText = await loyaltySection.locator('[data-testid="points-to-next-tier"]').textContent() || '0';
    const lifetimePointsText = await loyaltySection.locator('[data-testid="lifetime-points"]').textContent() || '0';
    const memberSince = await loyaltySection.locator('[data-testid="member-since"]').textContent() || '';

    return {
      currentTier,
      points: parseInt(pointsText.replace(/[^0-9]/g, '')),
      pointsToNextTier: parseInt(pointsToNextTierText.replace(/[^0-9]/g, '')),
      lifetimePoints: parseInt(lifetimePointsText.replace(/[^0-9]/g, '')),
      memberSince
    };
  }

  async getPointsHistory(): Promise<any[]> {
    const historyItems = await this.page.locator('[data-testid="points-history-item"]').all();
    return Promise.all(historyItems.map(async (item) => ({
      date: await item.locator('[data-testid="transaction-date"]').textContent(),
      description: await item.locator('[data-testid="transaction-description"]').textContent(),
      points: parseInt(await item.locator('[data-testid="transaction-points"]').textContent() || '0'),
      type: await item.locator('[data-testid="transaction-type"]').textContent()
    })));
  }

  async getAvailableRewards(): Promise<any[]> {
    const rewardCards = await this.page.locator('[data-testid="reward-card"]').all();
    return Promise.all(rewardCards.map(async (card) => ({
      id: await card.getAttribute('data-reward-id'),
      name: await card.locator('[data-testid="reward-name"]').textContent(),
      description: await card.locator('[data-testid="reward-description"]').textContent(),
      pointsRequired: parseInt(await card.locator('[data-testid="points-required"]').textContent() || '0'),
      category: await card.locator('[data-testid="reward-category"]').textContent()
    })));
  }

  async redeemReward(rewardId: string): Promise<void> {
    const rewardCard = this.page.locator(`[data-reward-id="${rewardId}"]`);
    await rewardCard.locator('[data-testid="redeem-reward-btn"]').click();
    
    const confirmModal = this.page.locator('[data-testid="confirm-redeem-modal"]');
    await expect(confirmModal).toBeVisible();
    
    await confirmModal.locator('[data-testid="confirm-redeem"]').click();
    await expect(confirmModal).not.toBeVisible();
  }

  async getTierBenefits(): Promise<any[]> {
    const benefitItems = await this.page.locator('[data-testid="tier-benefit"]').all();
    return Promise.all(benefitItems.map(async (item) => ({
      name: await item.locator('[data-testid="benefit-name"]').textContent(),
      description: await item.locator('[data-testid="benefit-description"]').textContent(),
      tier: await item.locator('[data-testid="benefit-tier"]').textContent()
    })));
  }

  // Review methods
  async getCustomerReviews(): Promise<any[]> {
    const reviewCards = await this.page.locator('[data-testid="customer-review"]').all();
    return Promise.all(reviewCards.map(async (card) => ({
      id: await card.getAttribute('data-review-id'),
      hotelName: await card.locator('[data-testid="review-hotel-name"]').textContent(),
      rating: parseInt(await card.locator('[data-testid="review-rating"]').textContent() || '0'),
      reviewDate: await card.locator('[data-testid="review-date"]').textContent(),
      comment: await card.locator('[data-testid="review-comment"]').textContent(),
      confirmationNumber: await card.locator('[data-testid="review-confirmation"]').textContent()
    })));
  }

  async writeReview(reviewData: any): Promise<void> {
    await this.page.locator('[data-testid="write-review-btn"]').click();
    
    const reviewModal = this.page.locator('[data-testid="review-modal"]');
    await expect(reviewModal).toBeVisible();
    
    await reviewModal.locator('select[name="confirmationNumber"]').selectOption(reviewData.confirmationNumber);
    await reviewModal.locator('input[name="rating"]').fill(reviewData.rating.toString());
    await reviewModal.locator('textarea[name="comment"]').fill(reviewData.comment);
    
    if (reviewData.categories) {
      await reviewModal.locator('input[name="cleanliness"]').fill(reviewData.categories.cleanliness.toString());
      await reviewModal.locator('input[name="service"]').fill(reviewData.categories.service.toString());
      await reviewModal.locator('input[name="location"]').fill(reviewData.categories.location.toString());
      await reviewModal.locator('input[name="value"]').fill(reviewData.categories.value.toString());
    }
    
    await reviewModal.locator('[data-testid="submit-review"]').click();
    await expect(reviewModal).not.toBeVisible();
  }

  async editReview(reviewId: string, reviewData: any): Promise<void> {
    const reviewCard = this.page.locator(`[data-review-id="${reviewId}"]`);
    await reviewCard.locator('[data-testid="edit-review-btn"]').click();
    
    const editModal = this.page.locator('[data-testid="edit-review-modal"]');
    await expect(editModal).toBeVisible();
    
    if (reviewData.rating) {
      await editModal.locator('input[name="rating"]').fill(reviewData.rating.toString());
    }
    
    if (reviewData.comment) {
      await editModal.locator('textarea[name="comment"]').fill(reviewData.comment);
    }
    
    if (reviewData.categories) {
      if (reviewData.categories.cleanliness) {
        await editModal.locator('input[name="cleanliness"]').fill(reviewData.categories.cleanliness.toString());
      }
      if (reviewData.categories.service) {
        await editModal.locator('input[name="service"]').fill(reviewData.categories.service.toString());
      }
      if (reviewData.categories.location) {
        await editModal.locator('input[name="location"]').fill(reviewData.categories.location.toString());
      }
      if (reviewData.categories.value) {
        await editModal.locator('input[name="value"]').fill(reviewData.categories.value.toString());
      }
    }
    
    await editModal.locator('[data-testid="update-review"]').click();
    await expect(editModal).not.toBeVisible();
  }

  async deleteReview(reviewId: string): Promise<void> {
    const reviewCard = this.page.locator(`[data-review-id="${reviewId}"]`);
    await reviewCard.locator('[data-testid="delete-review-btn"]').click();
    
    const confirmModal = this.page.locator('[data-testid="confirm-delete-modal"]');
    await expect(confirmModal).toBeVisible();
    
    await confirmModal.locator('[data-testid="confirm-delete"]').click();
    await expect(confirmModal).not.toBeVisible();
  }

  // Support methods
  async getSupportOptions(): Promise<any[]> {
    const options = await this.page.locator('[data-testid="support-option"]').all();
    return Promise.all(options.map(async (option) => ({
      title: await option.locator('[data-testid="option-title"]').textContent(),
      description: await option.locator('[data-testid="option-description"]').textContent()
    })));
  }

  async getFAQs(): Promise<any[]> {
    const faqs = await this.page.locator('[data-testid="faq-item"]').all();
    return Promise.all(faqs.map(async (faq) => ({
      question: await faq.locator('[data-testid="faq-question"]').textContent(),
      answer: await faq.locator('[data-testid="faq-answer"]').textContent(),
      category: await faq.locator('[data-testid="faq-category"]').textContent()
    })));
  }

  async submitSupportTicket(ticketData: any): Promise<void> {
    await this.page.locator('[data-testid="submit-ticket-btn"]').click();
    
    const ticketModal = this.page.locator('[data-testid="support-ticket-modal"]');
    await expect(ticketModal).toBeVisible();
    
    await ticketModal.locator('input[name="subject"]').fill(ticketData.subject);
    await ticketModal.locator('select[name="category"]').selectOption(ticketData.category);
    await ticketModal.locator('select[name="priority"]').selectOption(ticketData.priority);
    await ticketModal.locator('textarea[name="description"]').fill(ticketData.description);
    
    if (ticketData.confirmationNumber) {
      await ticketModal.locator('input[name="confirmationNumber"]').fill(ticketData.confirmationNumber);
    }
    
    await ticketModal.locator('[data-testid="submit-ticket"]').click();
    await expect(ticketModal).not.toBeVisible();
  }

  async getSupportTickets(): Promise<any[]> {
    const tickets = await this.page.locator('[data-testid="support-ticket"]').all();
    return Promise.all(tickets.map(async (ticket) => ({
      ticketNumber: await ticket.locator('[data-testid="ticket-number"]').textContent(),
      subject: await ticket.locator('[data-testid="ticket-subject"]').textContent(),
      status: await ticket.locator('[data-testid="ticket-status"]').textContent(),
      createdDate: await ticket.locator('[data-testid="ticket-date"]').textContent()
    })));
  }

  async isLiveChatAvailable(): Promise<boolean> {
    return await this.page.locator('[data-testid="live-chat-btn"]').isVisible();
  }

  async startLiveChat(): Promise<void> {
    await this.page.locator('[data-testid="live-chat-btn"]').click();
  }

  // Profile management methods
  async changePassword(passwordData: any): Promise<void> {
    await this.page.locator('[data-testid="change-password-btn"]').click();
    
    const passwordModal = this.page.locator('[data-testid="change-password-modal"]');
    await expect(passwordModal).toBeVisible();
    
    await passwordModal.locator('input[name="currentPassword"]').fill(passwordData.currentPassword);
    await passwordModal.locator('input[name="newPassword"]').fill(passwordData.newPassword);
    await passwordModal.locator('input[name="confirmPassword"]').fill(passwordData.confirmPassword);
    
    await passwordModal.locator('[data-testid="update-password"]').click();
    await expect(passwordModal).not.toBeVisible();
  }

  async updateNotificationPreferences(preferences: any): Promise<void> {
    await this.page.locator('[data-testid="notification-preferences-btn"]').click();
    
    const prefModal = this.page.locator('[data-testid="notification-preferences-modal"]');
    await expect(prefModal).toBeVisible();
    
    if (preferences.emailNotifications !== undefined) {
      await prefModal.locator('input[name="emailNotifications"]').setChecked(preferences.emailNotifications);
    }
    if (preferences.smsNotifications !== undefined) {
      await prefModal.locator('input[name="smsNotifications"]').setChecked(preferences.smsNotifications);
    }
    if (preferences.marketingEmails !== undefined) {
      await prefModal.locator('input[name="marketingEmails"]').setChecked(preferences.marketingEmails);
    }
    if (preferences.bookingReminders !== undefined) {
      await prefModal.locator('input[name="bookingReminders"]').setChecked(preferences.bookingReminders);
    }
    if (preferences.specialOffers !== undefined) {
      await prefModal.locator('input[name="specialOffers"]').setChecked(preferences.specialOffers);
    }
    
    await prefModal.locator('[data-testid="save-preferences"]').click();
    await expect(prefModal).not.toBeVisible();
  }

  async getPaymentMethods(): Promise<any[]> {
    const methods = await this.page.locator('[data-testid="payment-method"]').all();
    return Promise.all(methods.map(async (method) => ({
      id: await method.getAttribute('data-method-id'),
      type: await method.locator('[data-testid="method-type"]').textContent(),
      last4: await method.locator('[data-testid="method-last4"]').textContent(),
      expiry: await method.locator('[data-testid="method-expiry"]').textContent()
    })));
  }

  async addPaymentMethod(paymentData: any): Promise<void> {
    await this.page.locator('[data-testid="add-payment-method-btn"]').click();
    
    const paymentModal = this.page.locator('[data-testid="add-payment-modal"]');
    await expect(paymentModal).toBeVisible();
    
    await paymentModal.locator('select[name="type"]').selectOption(paymentData.type);
    await paymentModal.locator('input[name="cardNumber"]').fill(paymentData.cardNumber);
    await paymentModal.locator('select[name="expiryMonth"]').selectOption(paymentData.expiryMonth);
    await paymentModal.locator('select[name="expiryYear"]').selectOption(paymentData.expiryYear);
    await paymentModal.locator('input[name="cvv"]').fill(paymentData.cvv);
    await paymentModal.locator('input[name="nameOnCard"]').fill(paymentData.nameOnCard);
    await paymentModal.locator('textarea[name="billingAddress"]').fill(paymentData.billingAddress);
    
    await paymentModal.locator('[data-testid="save-payment-method"]').click();
    await expect(paymentModal).not.toBeVisible();
  }

  async removePaymentMethod(methodId: string): Promise<void> {
    const method = this.page.locator(`[data-method-id="${methodId}"]`);
    await method.locator('[data-testid="remove-payment-method"]').click();
    
    const confirmModal = this.page.locator('[data-testid="confirm-remove-payment-modal"]');
    await expect(confirmModal).toBeVisible();
    
    await confirmModal.locator('[data-testid="confirm-remove"]').click();
    await expect(confirmModal).not.toBeVisible();
  }

  // Booking modification method fix
  async modifyBooking(confirmationNumber: string, modifications: any): Promise<void> {
    const bookingCard = this.bookingCards.filter({
      has: this.page.locator(`[data-testid="confirmation-number"]:has-text("${confirmationNumber}")`)
    });
    
    const modifyButton = bookingCard.locator('[data-testid="modify-booking-btn"]');
    await modifyButton.click();

    const modifyModal = this.page.locator('[data-testid="modify-booking-modal"]');
    await expect(modifyModal).toBeVisible();

    if (modifications.checkInDate) {
      await modifyModal.locator('input[name="checkInDate"]').fill(modifications.checkInDate);
    }
    if (modifications.checkOutDate) {
      await modifyModal.locator('input[name="checkOutDate"]').fill(modifications.checkOutDate);
    }
    if (modifications.guestCount) {
      await modifyModal.locator('select[name="guestCount"]').selectOption(modifications.guestCount.toString());
    }

    await modifyModal.locator('[data-testid="save-modifications"]').click();
    await expect(modifyModal).not.toBeVisible();
    await this.waitForPageLoad();
  }
}

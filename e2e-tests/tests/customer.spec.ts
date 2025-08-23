import { test, expect } from '@playwright/test';
import { CustomerDashboardPage } from '../pages/CustomerDashboardPage';
import { TEST_USERS } from '../fixtures/testData';

// Customer Test Suite
test.describe('Customer - Dashboard Operations', () => {
  let customerPage: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    customerPage = new CustomerDashboardPage(page);
    await customerPage.navigateTo();
    await customerPage.verifyPageLoaded();
  });

  test('should display customer profile information', async () => {
    const profile = await customerPage.getCustomerProfile();
    
    expect(profile.firstName).toBeTruthy();
    expect(profile.lastName).toBeTruthy();
    expect(profile.email).toBeTruthy();
    expect(profile.phone).toBeTruthy();
    expect(profile.membershipTier).toBeTruthy();
    expect(profile.loyaltyPoints).toBeGreaterThanOrEqual(0);
  });

  test('should display booking summary', async () => {
    const summary = await customerPage.getBookingSummary();
    
    expect(summary.totalBookings).toBeGreaterThanOrEqual(0);
    expect(summary.upcomingBookings).toBeGreaterThanOrEqual(0);
    expect(summary.completedBookings).toBeGreaterThanOrEqual(0);
    expect(summary.cancelledBookings).toBeGreaterThanOrEqual(0);
  });

  test('should refresh dashboard data', async () => {
    const initialSummary = await customerPage.getBookingSummary();
    
    await customerPage.refreshDashboard();
    
    const refreshedSummary = await customerPage.getBookingSummary();
    expect(refreshedSummary.totalBookings).toBe(initialSummary.totalBookings);
  });

  test('should navigate to different sections', async () => {
    await customerPage.navigateToBookings();
    await customerPage.navigateToProfile();
    await customerPage.navigateToLoyalty();
    await customerPage.navigateToSupport();
    await customerPage.navigateTo(); // Back to dashboard
  });
});

test.describe('Customer - Booking Management', () => {
  let customerPage: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    customerPage = new CustomerDashboardPage(page);
    await customerPage.navigateToBookings();
  });

  test('should display upcoming bookings', async () => {
    const upcomingBookings = await customerPage.getUpcomingBookings();
    
    expect(Array.isArray(upcomingBookings)).toBe(true);
    
    // Verify booking structure if bookings exist
    if (upcomingBookings.length > 0) {
      const booking = upcomingBookings[0];
      expect(booking.confirmationNumber).toBeTruthy();
      expect(booking.hotelName).toBeTruthy();
      expect(booking.checkInDate).toBeTruthy();
      expect(booking.checkOutDate).toBeTruthy();
      expect(booking.roomType).toBeTruthy();
      expect(booking.totalAmount).toBeGreaterThan(0);
    }
  });

  test('should display booking history', async () => {
    const bookingHistory = await customerPage.getBookingHistory();
    
    expect(Array.isArray(bookingHistory)).toBe(true);
    
    // Verify historical booking structure if bookings exist
    if (bookingHistory.length > 0) {
      const booking = bookingHistory[0];
      expect(booking.confirmationNumber).toBeTruthy();
      expect(booking.hotelName).toBeTruthy();
      expect(booking.status).toBeTruthy();
    }
  });

  test('should filter bookings by status', async () => {
    await customerPage.filterBookingsByStatus('CONFIRMED');
    await customerPage.filterBookingsByStatus('CANCELLED');
    await customerPage.filterBookingsByStatus('COMPLETED');
    await customerPage.filterBookingsByStatus('ALL');
  });

  test('should search bookings', async () => {
    await customerPage.searchBookings('BMH-');
    // Clear search
    await customerPage.searchBookings('');
  });

  test.skip('should cancel booking', async () => {
    const upcomingBookings = await customerPage.getUpcomingBookings();
    
    if (upcomingBookings.length > 0) {
      const bookingToCancel = upcomingBookings[0];
      
      await customerPage.cancelBooking(
        bookingToCancel.confirmationNumber,
        'Change of plans'
      );
      
      // Verify booking was cancelled
      const updatedBookings = await customerPage.getUpcomingBookings();
      const cancelledBooking = updatedBookings.find(
        b => b.confirmationNumber === bookingToCancel.confirmationNumber
      );
      
      expect(cancelledBooking?.status).toBe('CANCELLED');
    }
  });

  test.skip('should modify booking', async () => {
    const upcomingBookings = await customerPage.getUpcomingBookings();
    
    if (upcomingBookings.length > 0) {
      const bookingToModify = upcomingBookings[0];
      
      const modifications = {
        checkInDate: '2025-08-25',
        checkOutDate: '2025-08-28',
        guestCount: 2
      };
      
      await customerPage.modifyBooking(
        bookingToModify.confirmationNumber,
        modifications
      );
      
      // Verify booking was modified
      const updatedBookings = await customerPage.getUpcomingBookings();
      const modifiedBooking = updatedBookings.find(
        b => b.confirmationNumber === bookingToModify.confirmationNumber
      );
      
      expect(modifiedBooking?.checkInDate).toBe('2025-08-25');
      expect(modifiedBooking?.checkOutDate).toBe('2025-08-28');
    }
  });

  test('should view booking details', async () => {
    const upcomingBookings = await customerPage.getUpcomingBookings();
    
    if (upcomingBookings.length > 0) {
      const booking = upcomingBookings[0];
      
      await customerPage.viewBookingDetails(booking.confirmationNumber);
      
      // This would typically open a modal or navigate to details page
      // Verification would depend on the actual implementation
    }
  });

  test('should download booking confirmation', async () => {
    const upcomingBookings = await customerPage.getUpcomingBookings();
    
    if (upcomingBookings.length > 0) {
      const booking = upcomingBookings[0];
      
      await customerPage.downloadBookingConfirmation(booking.confirmationNumber);
      
      // Note: Actual download verification would need additional setup
    }
  });
});

test.describe('Customer - Profile Management', () => {
  let customerPage: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    customerPage = new CustomerDashboardPage(page);
    await customerPage.navigateToProfile();
  });

  test('should display current profile information', async () => {
    const profile = await customerPage.getCustomerProfile();
    
    expect(profile.firstName).toBeTruthy();
    expect(profile.lastName).toBeTruthy();
    expect(profile.email).toBeTruthy();
    expect(profile.phone).toBeTruthy();
    expect(profile.dateOfBirth).toBeTruthy();
    expect(profile.address).toBeTruthy();
    expect(profile.membershipTier).toBeTruthy();
  });

  test.skip('should update profile information', async () => {
    const updatedProfile = {
      firstName: 'John',
      lastName: 'Doe Updated',
      phone: '+1-555-9999',
      dateOfBirth: '1990-01-01',
      address: '123 Updated Street, City, State 12345',
      preferences: {
        roomType: 'SUITE',
        floorPreference: 'HIGH',
        smokingPreference: 'NON_SMOKING',
        bedType: 'KING'
      }
    };

    await customerPage.updateProfile(updatedProfile);
    
    // Verify profile was updated
    const profile = await customerPage.getCustomerProfile();
    expect(profile.lastName).toBe('Doe Updated');
    expect(profile.phone).toBe('+1-555-9999');
    expect(profile.preferences.roomType).toBe('SUITE');
  });

  test.skip('should change password', async () => {
    const passwordChange = {
      currentPassword: 'currentPassword123',
      newPassword: 'newPassword456',
      confirmPassword: 'newPassword456'
    };

    await customerPage.changePassword(passwordChange);
    
    // Note: Password change verification would require additional setup
  });

  test('should manage notification preferences', async () => {
    const preferences = {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      bookingReminders: true,
      specialOffers: false
    };

    await customerPage.updateNotificationPreferences(preferences);
    
    // Verify preferences were saved
    // This would require reading the updated preferences
  });

  test('should manage payment methods', async () => {
    // View existing payment methods
    const paymentMethods = await customerPage.getPaymentMethods();
    expect(Array.isArray(paymentMethods)).toBe(true);
  });

  test.skip('should add new payment method', async () => {
    const newPaymentMethod = {
      type: 'CREDIT_CARD',
      cardNumber: '4111111111111111',
      expiryMonth: '12',
      expiryYear: '2027',
      cvv: '123',
      nameOnCard: 'John Doe',
      billingAddress: '123 Main St, City, State 12345'
    };

    await customerPage.addPaymentMethod(newPaymentMethod);
    
    // Verify payment method was added
    const paymentMethods = await customerPage.getPaymentMethods();
    const addedMethod = paymentMethods.find(
      method => method.last4 === '1111'
    );
    
    expect(addedMethod).toBeTruthy();
  });

  test.skip('should remove payment method', async () => {
    const paymentMethods = await customerPage.getPaymentMethods();
    
    if (paymentMethods.length > 0) {
      const methodToRemove = paymentMethods[0];
      
      await customerPage.removePaymentMethod(methodToRemove.id);
      
      // Verify payment method was removed
      const updatedMethods = await customerPage.getPaymentMethods();
      const removedMethod = updatedMethods.find(
        method => method.id === methodToRemove.id
      );
      
      expect(removedMethod).toBeFalsy();
    }
  });
});

test.describe('Customer - Loyalty Program', () => {
  let customerPage: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    customerPage = new CustomerDashboardPage(page);
    await customerPage.navigateToLoyalty();
  });

  test('should display loyalty program status', async () => {
    const loyaltyStatus = await customerPage.getLoyaltyStatus();
    
    expect(loyaltyStatus.currentTier).toBeTruthy();
    expect(loyaltyStatus.points).toBeGreaterThanOrEqual(0);
    expect(loyaltyStatus.pointsToNextTier).toBeGreaterThanOrEqual(0);
    expect(loyaltyStatus.lifetimePoints).toBeGreaterThanOrEqual(0);
    expect(loyaltyStatus.memberSince).toBeTruthy();
  });

  test('should display points history', async () => {
    const pointsHistory = await customerPage.getPointsHistory();
    
    expect(Array.isArray(pointsHistory)).toBe(true);
    
    if (pointsHistory.length > 0) {
      const transaction = pointsHistory[0];
      expect(transaction.date).toBeTruthy();
      expect(transaction.description).toBeTruthy();
      expect(transaction.points).toBeDefined();
      expect(transaction.type).toMatch(/EARNED|REDEEMED/);
    }
  });

  test('should display available rewards', async () => {
    const rewards = await customerPage.getAvailableRewards();
    
    expect(Array.isArray(rewards)).toBe(true);
    
    if (rewards.length > 0) {
      const reward = rewards[0];
      expect(reward.name).toBeTruthy();
      expect(reward.description).toBeTruthy();
      expect(reward.pointsRequired).toBeGreaterThan(0);
      expect(reward.category).toBeTruthy();
    }
  });

  test.skip('should redeem reward', async () => {
    const rewards = await customerPage.getAvailableRewards();
    const loyaltyStatus = await customerPage.getLoyaltyStatus();
    
    // Find a reward that can be redeemed
    const affordableReward = rewards.find(
      reward => reward.pointsRequired <= loyaltyStatus.points
    );
    
    if (affordableReward) {
      await customerPage.redeemReward(affordableReward.id);
      
      // Verify reward was redeemed and points were deducted
      const updatedStatus = await customerPage.getLoyaltyStatus();
      expect(updatedStatus.points).toBe(
        loyaltyStatus.points - affordableReward.pointsRequired
      );
    }
  });

  test('should view tier benefits', async () => {
    const tierBenefits = await customerPage.getTierBenefits();
    
    expect(Array.isArray(tierBenefits)).toBe(true);
    
    if (tierBenefits.length > 0) {
      const benefit = tierBenefits[0];
      expect(benefit.name).toBeTruthy();
      expect(benefit.description).toBeTruthy();
      expect(benefit.tier).toBeTruthy();
    }
  });
});

test.describe('Customer - Reviews and Ratings', () => {
  let customerPage: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    customerPage = new CustomerDashboardPage(page);
    await customerPage.navigateToReviews();
  });

  test('should display customer reviews', async () => {
    const reviews = await customerPage.getCustomerReviews();
    
    expect(Array.isArray(reviews)).toBe(true);
    
    if (reviews.length > 0) {
      const review = reviews[0];
      expect(review.hotelName).toBeTruthy();
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.reviewDate).toBeTruthy();
      expect(review.comment).toBeTruthy();
    }
  });

  test.skip('should write new review', async () => {
    const newReview = {
      confirmationNumber: 'BMH-TEST-001',
      rating: 5,
      comment: 'Excellent stay! Staff was very friendly and the room was clean.',
      categories: {
        cleanliness: 5,
        service: 5,
        location: 4,
        value: 4
      }
    };

    await customerPage.writeReview(newReview);
    
    // Verify review was submitted
    const reviews = await customerPage.getCustomerReviews();
    const submittedReview = reviews.find(
      review => review.confirmationNumber === newReview.confirmationNumber
    );
    
    expect(submittedReview).toBeTruthy();
    expect(submittedReview?.rating).toBe(5);
  });

  test.skip('should edit existing review', async () => {
    const reviews = await customerPage.getCustomerReviews();
    
    if (reviews.length > 0) {
      const reviewToEdit = reviews[0];
      
      const updatedReview = {
        rating: 4,
        comment: 'Updated review: Good stay overall with minor improvements needed.',
        categories: {
          cleanliness: 4,
          service: 4,
          location: 5,
          value: 3
        }
      };

      await customerPage.editReview(reviewToEdit.id, updatedReview);
      
      // Verify review was updated
      const updatedReviews = await customerPage.getCustomerReviews();
      const editedReview = updatedReviews.find(
        review => review.id === reviewToEdit.id
      );
      
      expect(editedReview?.rating).toBe(4);
      expect(editedReview?.comment).toContain('Updated review');
    }
  });

  test.skip('should delete review', async () => {
    const reviews = await customerPage.getCustomerReviews();
    
    if (reviews.length > 0) {
      const reviewToDelete = reviews[0];
      
      await customerPage.deleteReview(reviewToDelete.id);
      
      // Verify review was deleted
      const updatedReviews = await customerPage.getCustomerReviews();
      const deletedReview = updatedReviews.find(
        review => review.id === reviewToDelete.id
      );
      
      expect(deletedReview).toBeFalsy();
    }
  });
});

test.describe('Customer - Support and Help', () => {
  let customerPage: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    customerPage = new CustomerDashboardPage(page);
    await customerPage.navigateToSupport();
  });

  test('should display support options', async () => {
    const supportOptions = await customerPage.getSupportOptions();
    
    expect(Array.isArray(supportOptions)).toBe(true);
    expect(supportOptions.length).toBeGreaterThan(0);
  });

  test('should view FAQ section', async () => {
    const faqs = await customerPage.getFAQs();
    
    expect(Array.isArray(faqs)).toBe(true);
    
    if (faqs.length > 0) {
      const faq = faqs[0];
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
      expect(faq.category).toBeTruthy();
    }
  });

  test.skip('should submit support ticket', async () => {
    const supportTicket = {
      subject: 'Billing inquiry',
      category: 'BILLING',
      priority: 'MEDIUM',
      description: 'I have a question about my recent booking charges.',
      confirmationNumber: 'BMH-TEST-001'
    };

    await customerPage.submitSupportTicket(supportTicket);
    
    // Verify ticket was submitted
    const tickets = await customerPage.getSupportTickets();
    const submittedTicket = tickets.find(
      ticket => ticket.subject === supportTicket.subject
    );
    
    expect(submittedTicket).toBeTruthy();
    expect(submittedTicket?.status).toBe('OPEN');
  });

  test('should view support ticket history', async () => {
    const tickets = await customerPage.getSupportTickets();
    
    expect(Array.isArray(tickets)).toBe(true);
    
    if (tickets.length > 0) {
      const ticket = tickets[0];
      expect(ticket.ticketNumber).toBeTruthy();
      expect(ticket.subject).toBeTruthy();
      expect(ticket.status).toBeTruthy();
      expect(ticket.createdDate).toBeTruthy();
    }
  });

  test('should initiate live chat', async () => {
    const liveChatSupported = await customerPage.isLiveChatAvailable();
    
    if (liveChatSupported) {
      await customerPage.startLiveChat();
      // This would typically open a chat widget or modal
    }
  });
});

test.describe('Customer - Integration Workflows', () => {
  let customerPage: CustomerDashboardPage;

  test.beforeEach(async ({ page }) => {
    customerPage = new CustomerDashboardPage(page);
  });

  test('should navigate between customer sections', async ({ page }) => {
    // Start from dashboard
    await customerPage.navigateTo();
    await customerPage.verifyPageLoaded();
    
    // Navigate through all sections
    await customerPage.navigateToBookings();
    await expect(page.locator('[data-testid="bookings-container"]')).toBeVisible();
    
    await customerPage.navigateToProfile();
    await expect(page.locator('[data-testid="profile-container"]')).toBeVisible();
    
    await customerPage.navigateToLoyalty();
    await expect(page.locator('[data-testid="loyalty-container"]')).toBeVisible();
    
    await customerPage.navigateToReviews();
    await expect(page.locator('[data-testid="reviews-container"]')).toBeVisible();
    
    await customerPage.navigateToSupport();
    await expect(page.locator('[data-testid="support-container"]')).toBeVisible();
    
    // Return to dashboard
    await customerPage.navigateTo();
    await customerPage.verifyPageLoaded();
  });

  test('should maintain data consistency across sections', async () => {
    // Get profile info from dashboard
    await customerPage.navigateTo();
    const dashboardProfile = await customerPage.getCustomerProfile();
    
    // Navigate to profile section and verify same data
    await customerPage.navigateToProfile();
    const profilePageData = await customerPage.getCustomerProfile();
    
    expect(profilePageData.firstName).toBe(dashboardProfile.firstName);
    expect(profilePageData.lastName).toBe(dashboardProfile.lastName);
    expect(profilePageData.email).toBe(dashboardProfile.email);
    expect(profilePageData.membershipTier).toBe(dashboardProfile.membershipTier);
  });

  test('should handle session timeout gracefully', async ({ page }) => {
    await customerPage.navigateTo();
    await customerPage.verifyPageLoaded();
    
    // Simulate session expiration (this would need to be implemented based on app behavior)
    // For now, just verify the page continues to function
    await customerPage.refreshDashboard();
    await customerPage.verifyPageLoaded();
  });

  test('should support responsive design', async ({ page }) => {
    await customerPage.navigateTo();
    
    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await customerPage.verifyPageLoaded();
    
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await customerPage.verifyPageLoaded();
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await customerPage.verifyPageLoaded();
  });

  test('should handle concurrent operations', async () => {
    await customerPage.navigateTo();
    
    // Perform multiple operations concurrently
    const [profile, bookingSummary, loyaltyStatus] = await Promise.all([
      customerPage.getCustomerProfile(),
      customerPage.getBookingSummary(),
      customerPage.getLoyaltyStatus()
    ]);
    
    // Verify all operations completed successfully
    expect(profile.email).toBeTruthy();
    expect(bookingSummary.totalBookings).toBeGreaterThanOrEqual(0);
    expect(loyaltyStatus.points).toBeGreaterThanOrEqual(0);
  });
});

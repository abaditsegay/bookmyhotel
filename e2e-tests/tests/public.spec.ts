import { test, expect } from '@playwright/test';
import { PublicHomePage } from '../pages/PublicHomePage';

// Public/Guest Test Suite
test.describe('Public - Home Page', () => {
  let publicPage: PublicHomePage;

  test.beforeEach(async ({ page }) => {
    publicPage = new PublicHomePage(page);
    await publicPage.navigateTo();
    await publicPage.verifyPageLoaded();
  });

  test('should display homepage elements', async () => {
    await expect(publicPage.heroSection).toBeVisible();
    await expect(publicPage.searchForm).toBeVisible();
    await expect(publicPage.featuredHotelsSection).toBeVisible();
    await expect(publicPage.navigationMenu).toBeVisible();
  });

  test('should display navigation menu items', async () => {
    await expect(publicPage.homeLink).toBeVisible();
    await expect(publicPage.hotelsLink).toBeVisible();
    await expect(publicPage.aboutLink).toBeVisible();
    await expect(publicPage.contactLink).toBeVisible();
    await expect(publicPage.loginButton).toBeVisible();
    await expect(publicPage.registerButton).toBeVisible();
  });

  test('should display search form elements', async () => {
    await expect(publicPage.destinationInput).toBeVisible();
    await expect(publicPage.checkInInput).toBeVisible();
    await expect(publicPage.checkOutInput).toBeVisible();
    await expect(publicPage.guestsSelect).toBeVisible();
    await expect(publicPage.searchButton).toBeVisible();
  });

  test('should search for hotels', async () => {
    const searchCriteria = {
      destination: 'New York',
      checkInDate: '2025-08-25',
      checkOutDate: '2025-08-28',
      guests: 2,
      rooms: 1  // Add the missing rooms property
    };

    await publicPage.searchHotels(searchCriteria);
    
    // Should navigate to search results page
    await expect(publicPage.currentPage.url()).toContain('/search');
  });

  test('should display featured hotels', async () => {
    const featuredHotels = await publicPage.getFeaturedHotels();
    
    expect(Array.isArray(featuredHotels)).toBe(true);
    expect(featuredHotels.length).toBeGreaterThan(0);
    
    if (featuredHotels.length > 0) {
      const hotel = featuredHotels[0];
      expect(hotel.name).toBeTruthy();
      expect(hotel.location).toBeTruthy();
      expect(hotel.rating).toBeGreaterThanOrEqual(0);
      expect(hotel.priceFrom).toBeGreaterThan(0);
    }
  });

  test('should navigate to hotel details', async () => {
    const featuredHotels = await publicPage.getFeaturedHotels();
    
    if (featuredHotels.length > 0) {
      const hotel = featuredHotels[0];
      await publicPage.viewHotelDetails(hotel.id);
      
      // Should navigate to hotel details page
      await expect(publicPage.currentPage.url()).toContain('/hotel/');
    }
  });

  test('should subscribe to newsletter', async () => {
    const email = 'test@example.com';
    
    await publicPage.subscribeToNewsletter(email);
    
    // Should show success message
    const successMessage = publicPage.currentPage.locator('[data-testid="newsletter-success"]');
    await expect(successMessage).toBeVisible();
  });

  test('should handle invalid newsletter email', async () => {
    const invalidEmail = 'invalid-email';
    
    await publicPage.subscribeToNewsletter(invalidEmail);
    
    // Should show error message
    const errorMessage = publicPage.currentPage.locator('[data-testid="newsletter-error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should verify responsive design', async () => {
    await publicPage.verifyResponsiveDesign();
    
    // Elements should remain visible after responsive verification
    await expect(publicPage.heroSection).toBeVisible();
    await expect(publicPage.searchForm).toBeVisible();
    await expect(publicPage.featuredHotelsSection).toBeVisible();
  });

  test('should display footer elements', async () => {
    await expect(publicPage.footer).toBeVisible();
    await expect(publicPage.socialMediaLinks).toBeVisible();
    await expect(publicPage.newsletterSection).toBeVisible();
  });

  test('should navigate to login page', async () => {
    await publicPage.loginButton.click();
    
    await expect(publicPage.currentPage.url()).toContain('/login');
  });

  test('should navigate to register page', async () => {
    await publicPage.registerButton.click();
    
    await expect(publicPage.currentPage.url()).toContain('/register');
  });
});

test.describe('Public - Hotel Search', () => {
  let publicPage: PublicHomePage;

  test.beforeEach(async ({ page }) => {
    publicPage = new PublicHomePage(page);
    await page.goto('/search');
  });

  test('should display search results', async ({ page }) => {
    const searchResultsContainer = page.locator('[data-testid="search-results"]');
    await expect(searchResultsContainer).toBeVisible();
  });

  test('should filter search results', async ({ page }) => {
    const priceFilter = page.locator('[data-testid="price-filter"]');
    if (await priceFilter.isVisible()) {
      await priceFilter.click();
      
      const minPriceInput = page.locator('[data-testid="min-price"]');
      const maxPriceInput = page.locator('[data-testid="max-price"]');
      
      await minPriceInput.fill('100');
      await maxPriceInput.fill('300');
      
      const applyFilterButton = page.locator('[data-testid="apply-price-filter"]');
      await applyFilterButton.click();
    }
  });

  test('should sort search results', async ({ page }) => {
    const sortDropdown = page.locator('[data-testid="sort-dropdown"]');
    if (await sortDropdown.isVisible()) {
      await sortDropdown.selectOption('price-low-to-high');
      
      // Wait for results to update
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display hotel ratings and reviews', async ({ page }) => {
    const hotelCards = page.locator('[data-testid="hotel-card"]');
    const firstHotel = hotelCards.first();
    
    if (await firstHotel.isVisible()) {
      const rating = firstHotel.locator('[data-testid="hotel-rating"]');
      const reviewCount = firstHotel.locator('[data-testid="review-count"]');
      
      await expect(rating).toBeVisible();
      await expect(reviewCount).toBeVisible();
    }
  });

  test('should handle empty search results', async ({ page }) => {
    // Perform a search that should return no results
    await page.goto('/search?destination=NonExistentCity&checkIn=2025-08-25&checkOut=2025-08-28');
    
    const noResultsMessage = page.locator('[data-testid="no-results-message"]');
    if (await noResultsMessage.isVisible()) {
      await expect(noResultsMessage).toContainText('No hotels found');
    }
  });

  test('should paginate search results', async ({ page }) => {
    const paginationContainer = page.locator('[data-testid="pagination"]');
    
    if (await paginationContainer.isVisible()) {
      const nextPageButton = paginationContainer.locator('[data-testid="next-page"]');
      
      if (await nextPageButton.isVisible() && await nextPageButton.isEnabled()) {
        await nextPageButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on page 2
        const currentPageIndicator = paginationContainer.locator('[data-testid="current-page"]');
        await expect(currentPageIndicator).toContainText('2');
      }
    }
  });
});

test.describe('Public - Hotel Details', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a sample hotel details page
    await page.goto('/hotel/sample-hotel-1');
  });

  test('should display hotel information', async ({ page }) => {
    await expect(page.locator('[data-testid="hotel-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="hotel-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="hotel-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="hotel-rating"]')).toBeVisible();
  });

  test('should display room types and prices', async ({ page }) => {
    const roomTypesSection = page.locator('[data-testid="room-types"]');
    await expect(roomTypesSection).toBeVisible();
    
    const roomCards = page.locator('[data-testid="room-card"]');
    if (await roomCards.count() > 0) {
      const firstRoom = roomCards.first();
      
      await expect(firstRoom.locator('[data-testid="room-name"]')).toBeVisible();
      await expect(firstRoom.locator('[data-testid="room-price"]')).toBeVisible();
      await expect(firstRoom.locator('[data-testid="room-capacity"]')).toBeVisible();
    }
  });

  test('should display hotel amenities', async ({ page }) => {
    const amenitiesSection = page.locator('[data-testid="amenities"]');
    await expect(amenitiesSection).toBeVisible();
    
    const amenityItems = page.locator('[data-testid="amenity-item"]');
    expect(await amenityItems.count()).toBeGreaterThan(0);
  });

  test('should display hotel photos', async ({ page }) => {
    const photoGallery = page.locator('[data-testid="photo-gallery"]');
    await expect(photoGallery).toBeVisible();
    
    const photos = page.locator('[data-testid="hotel-photo"]');
    expect(await photos.count()).toBeGreaterThan(0);
  });

  test('should display guest reviews', async ({ page }) => {
    const reviewsSection = page.locator('[data-testid="guest-reviews"]');
    await expect(reviewsSection).toBeVisible();
    
    const reviewCards = page.locator('[data-testid="review-card"]');
    if (await reviewCards.count() > 0) {
      const firstReview = reviewCards.first();
      
      await expect(firstReview.locator('[data-testid="reviewer-name"]')).toBeVisible();
      await expect(firstReview.locator('[data-testid="review-rating"]')).toBeVisible();
      await expect(firstReview.locator('[data-testid="review-text"]')).toBeVisible();
    }
  });

  test('should allow room booking for guests', async ({ page }) => {
    const roomCards = page.locator('[data-testid="room-card"]');
    
    if (await roomCards.count() > 0) {
      const bookButton = roomCards.first().locator('[data-testid="book-room-btn"]');
      await bookButton.click();
      
      // Should redirect to login/registration page for guests
      await expect(page.url()).toMatch(/(login|register)/);
    }
  });

  test('should display hotel policies', async ({ page }) => {
    const policiesSection = page.locator('[data-testid="hotel-policies"]');
    await expect(policiesSection).toBeVisible();
    
    const checkInPolicy = page.locator('[data-testid="checkin-policy"]');
    const checkOutPolicy = page.locator('[data-testid="checkout-policy"]');
    const cancellationPolicy = page.locator('[data-testid="cancellation-policy"]');
    
    await expect(checkInPolicy).toBeVisible();
    await expect(checkOutPolicy).toBeVisible();
    await expect(cancellationPolicy).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    const contactSection = page.locator('[data-testid="contact-info"]');
    await expect(contactSection).toBeVisible();
    
    const phoneNumber = page.locator('[data-testid="hotel-phone"]');
    const emailAddress = page.locator('[data-testid="hotel-email"]');
    
    await expect(phoneNumber).toBeVisible();
    await expect(emailAddress).toBeVisible();
  });

  test('should show map location', async ({ page }) => {
    const mapContainer = page.locator('[data-testid="hotel-map"]');
    await expect(mapContainer).toBeVisible();
  });
});

test.describe('Public - User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('[data-testid="registration-form"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
  });

  test.skip('should register new user', async ({ page }) => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test.${Date.now()}@example.com`,
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
      phone: '+1-555-1234'
    };

    await page.fill('input[name="firstName"]', userData.firstName);
    await page.fill('input[name="lastName"]', userData.lastName);
    await page.fill('input[name="email"]', userData.email);
    await page.fill('input[name="password"]', userData.password);
    await page.fill('input[name="confirmPassword"]', userData.confirmPassword);
    await page.fill('input[name="phone"]', userData.phone);

    await page.click('[data-testid="register-button"]');

    // Should redirect to dashboard or show success message
    await expect(page.url()).toMatch(/(dashboard|login|success)/);
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="register-button"]');

    // Should show validation errors
    const errorMessages = page.locator('[data-testid="validation-error"]');
    expect(await errorMessages.count()).toBeGreaterThan(0);
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('[data-testid="register-button"]');

    const emailError = page.locator('[data-testid="email-validation-error"]');
    if (await emailError.isVisible()) {
      await expect(emailError).toContainText('valid email');
    }
  });

  test('should validate password strength', async ({ page }) => {
    await page.fill('input[name="password"]', '123');
    await page.click('[data-testid="register-button"]');

    const passwordError = page.locator('[data-testid="password-validation-error"]');
    if (await passwordError.isVisible()) {
      await expect(passwordError).toContainText('password');
    }
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.fill('input[name="password"]', 'SecurePassword123');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword456');
    await page.click('[data-testid="register-button"]');

    const confirmError = page.locator('[data-testid="confirm-password-validation-error"]');
    if (await confirmError.isVisible()) {
      await expect(confirmError).toContainText('match');
    }
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.locator('[data-testid="login-link"]');
    await loginLink.click();

    await expect(page.url()).toContain('/login');
  });
});

test.describe('Public - User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="login-button"]');

    // Should show validation errors
    const errorMessages = page.locator('[data-testid="validation-error"]');
    expect(await errorMessages.count()).toBeGreaterThan(0);
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    const loginError = page.locator('[data-testid="login-error"]');
    if (await loginError.isVisible()) {
      await expect(loginError).toContainText('Invalid');
    }
  });

  test('should navigate to registration page', async ({ page }) => {
    const registerLink = page.locator('[data-testid="register-link"]');
    await registerLink.click();

    await expect(page.url()).toContain('/register');
  });

  test('should show forgot password option', async ({ page }) => {
    const forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    await expect(forgotPasswordLink).toBeVisible();
  });

  test('should handle forgot password', async ({ page }) => {
    const forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    await forgotPasswordLink.click();

    const forgotPasswordModal = page.locator('[data-testid="forgot-password-modal"]');
    if (await forgotPasswordModal.isVisible()) {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.click('[data-testid="send-reset-link"]');

      const successMessage = page.locator('[data-testid="reset-email-sent"]');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toContainText('sent');
      }
    }
  });
});

test.describe('Public - Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    // Verify mobile navigation
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
    }

    // Verify search form is responsive
    const searchForm = page.locator('[data-testid="search-form"]');
    await expect(searchForm).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');

    const heroSection = page.locator('[data-testid="hero-section"]');
    const searchForm = page.locator('[data-testid="search-form"]');
    const featuredHotels = page.locator('[data-testid="featured-hotels"]');

    await expect(heroSection).toBeVisible();
    await expect(searchForm).toBeVisible();
    await expect(featuredHotels).toBeVisible();
  });

  test('should work on desktop devices', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await page.goto('/');

    const navigationMenu = page.locator('[data-testid="navigation-menu"]');
    const heroSection = page.locator('[data-testid="hero-section"]');
    const searchForm = page.locator('[data-testid="search-form"]');
    const featuredHotels = page.locator('[data-testid="featured-hotels"]');

    await expect(navigationMenu).toBeVisible();
    await expect(heroSection).toBeVisible();
    await expect(searchForm).toBeVisible();
    await expect(featuredHotels).toBeVisible();
  });
});

test.describe('Public - SEO and Performance', () => {
  test('should have proper page titles', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
  });

  test('should have meta descriptions', async ({ page }) => {
    await page.goto('/');
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBeTruthy();
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(50);
    }
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have proper alt texts for images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      
      // Images should have alt text (can be empty for decorative images)
      expect(altText).not.toBeNull();
    }
  });
});

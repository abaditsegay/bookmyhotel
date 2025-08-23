import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface HotelSearchCriteria {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
}

export interface HotelSearchResult {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  priceFrom: number;  // Add this property
  amenities: string[];
  imageUrl: string;
}

export class PublicHomePage extends BasePage {
  readonly heroSection: Locator;
  readonly searchForm: Locator;
  readonly destinationInput: Locator;
  readonly checkInInput: Locator;
  readonly checkOutInput: Locator;
  readonly guestsSelect: Locator;
  readonly roomsSelect: Locator;
  readonly searchButton: Locator;
  readonly featuredHotelsSection: Locator;
  readonly featuredHotelCards: Locator;
  readonly testimonials: Locator;
  readonly footerSection: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly aboutUsLink: Locator;
  readonly contactUsLink: Locator;
  readonly termsLink: Locator;
  readonly privacyLink: Locator;

  // Additional navigation elements
  readonly navigationMenu: Locator;
  readonly homeLink: Locator;
  readonly hotelsLink: Locator;
  readonly aboutLink: Locator;
  readonly contactLink: Locator;

  // Footer elements
  readonly footer: Locator;
  readonly socialMediaLinks: Locator;
  readonly newsletterSection: Locator;

  constructor(page: Page) {
    super(page);
    this.heroSection = page.locator('[data-testid="hero-section"]');
    this.searchForm = page.locator('[data-testid="hotel-search-form"]');
    this.destinationInput = page.locator('[data-testid="destination-input"]');
    this.checkInInput = page.locator('[data-testid="checkin-input"]');
    this.checkOutInput = page.locator('[data-testid="checkout-input"]');
    this.guestsSelect = page.locator('[data-testid="guests-select"]');
    this.roomsSelect = page.locator('[data-testid="rooms-select"]');
    this.searchButton = page.locator('[data-testid="search-hotels-btn"]');
    this.featuredHotelsSection = page.locator('[data-testid="featured-hotels"]');
    this.featuredHotelCards = page.locator('[data-testid="featured-hotel-card"]');
    this.testimonials = page.locator('[data-testid="testimonials"]');
    this.footerSection = page.locator('[data-testid="footer"]');
    this.loginButton = page.locator('[data-testid="login-btn"]');
    this.registerButton = page.locator('[data-testid="register-btn"]');
    this.aboutUsLink = page.locator('[data-testid="about-us-link"]');
    this.contactUsLink = page.locator('[data-testid="contact-us-link"]');
    this.termsLink = page.locator('[data-testid="terms-link"]');
    this.privacyLink = page.locator('[data-testid="privacy-link"]');

    // Additional navigation elements
    this.navigationMenu = page.locator('[data-testid="navigation-menu"]');
    this.homeLink = page.locator('[data-testid="home-link"]');
    this.hotelsLink = page.locator('[data-testid="hotels-link"]');
    this.aboutLink = page.locator('[data-testid="about-link"]');
    this.contactLink = page.locator('[data-testid="contact-link"]');

    // Footer elements
    this.footer = page.locator('[data-testid="footer"]');
    this.socialMediaLinks = page.locator('[data-testid="social-media-links"]');
    this.newsletterSection = page.locator('[data-testid="newsletter-section"]');
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.heroSection).toBeVisible();
    await expect(this.searchForm).toBeVisible();
  }

  async searchHotels(criteria: HotelSearchCriteria): Promise<void> {
    await this.destinationInput.fill(criteria.destination);
    await this.checkInInput.fill(criteria.checkInDate);
    await this.checkOutInput.fill(criteria.checkOutDate);
    await this.guestsSelect.selectOption(criteria.guests.toString());
    await this.roomsSelect.selectOption(criteria.rooms.toString());
    
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async getFeaturedHotels(): Promise<HotelSearchResult[]> {
    const hotels: HotelSearchResult[] = [];
    const hotelCards = await this.featuredHotelCards.all();
    
    for (const card of hotelCards) {
      const name = await card.locator('[data-testid="hotel-name"]').textContent();
      const location = await card.locator('[data-testid="hotel-location"]').textContent();
      const ratingText = await card.locator('[data-testid="hotel-rating"]').textContent();
      const priceText = await card.locator('[data-testid="hotel-price"]').textContent();
      const imageUrl = await card.locator('[data-testid="hotel-image"]').getAttribute('src');
      
      const rating = parseFloat(ratingText?.replace(/[^0-9.]/g, '') || '0');
      const price = parseFloat(priceText?.replace(/[^0-9.-]/g, '') || '0');
      
      const amenityElements = await card.locator('[data-testid="hotel-amenity"]').allTextContents();
      
      hotels.push({
        id: `hotel-${hotels.length + 1}`,
        name: name || '',
        location: location || '',
        rating,
        price,
        priceFrom: price, // Add priceFrom property
        amenities: amenityElements,
        imageUrl: imageUrl || ''
      });
    }
    
    return hotels;
  }

  async clickFeaturedHotel(hotelName: string): Promise<void> {
    const hotelCard = this.featuredHotelCards.filter({
      has: this.page.locator(`[data-testid="hotel-name"]:has-text("${hotelName}")`)
    });
    
    await hotelCard.click();
    await this.waitForPageLoad();
  }

  async navigateToLogin(): Promise<void> {
    await this.loginButton.click();
    await this.waitForPageLoad();
  }

  async navigateToRegister(): Promise<void> {
    await this.registerButton.click();
    await this.waitForPageLoad();
  }

  async navigateToAboutUs(): Promise<void> {
    await this.aboutUsLink.click();
    await this.waitForPageLoad();
  }

  async navigateToContactUs(): Promise<void> {
    await this.contactUsLink.click();
    await this.waitForPageLoad();
  }

  async getTestimonials(): Promise<string[]> {
    const testimonialTexts = await this.testimonials
      .locator('[data-testid="testimonial-text"]')
      .allTextContents();
    return testimonialTexts;
  }

  async verifyResponsiveDesign(): Promise<void> {
    // Test mobile breakpoint
    await this.page.setViewportSize({ width: 375, height: 667 });
    await expect(this.searchForm).toBeVisible();
    
    // Test tablet breakpoint
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await expect(this.searchForm).toBeVisible();
    
    // Test desktop breakpoint
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    await expect(this.searchForm).toBeVisible();
  }

  async subscribeToNewsletter(email: string): Promise<void> {
    const emailInput = this.footerSection.locator('[data-testid="newsletter-email"]');
    const subscribeButton = this.footerSection.locator('[data-testid="newsletter-subscribe"]');
    
    await emailInput.fill(email);
    await subscribeButton.click();
    
    // Verify success message
    const successMessage = this.page.locator('[data-testid="newsletter-success"]');
    await expect(successMessage).toBeVisible();
  }

  async quickSearch(destination: string): Promise<void> {
    await this.destinationInput.fill(destination);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async verifySearchFormValidation(): Promise<void> {
    // Try to search without filling required fields
    await this.searchButton.click();
    
    // Check for validation messages
    const destinationError = this.page.locator('[data-testid="destination-error"]');
    const checkInError = this.page.locator('[data-testid="checkin-error"]');
    const checkOutError = this.page.locator('[data-testid="checkout-error"]');
    
    await expect(destinationError).toBeVisible();
    await expect(checkInError).toBeVisible();
    await expect(checkOutError).toBeVisible();
  }

  async getPopularDestinations(): Promise<string[]> {
    const popularDestinations = this.page.locator('[data-testid="popular-destinations"]');
    const destinations = await popularDestinations
      .locator('[data-testid="destination-link"]')
      .allTextContents();
    return destinations;
  }

  async clickPopularDestination(destination: string): Promise<void> {
    const destinationLink = this.page.locator(`[data-testid="destination-link"]:has-text("${destination}")`);
    await destinationLink.click();
    await this.waitForPageLoad();
  }

  async viewHotelDetails(hotelId: string): Promise<void> {
    const hotelCard = this.featuredHotelCards.filter({
      hasText: hotelId
    }).first();
    
    const viewDetailsButton = hotelCard.locator('[data-testid="view-details-btn"]');
    await viewDetailsButton.click();
    await this.waitForPageLoad();
  }

  // Getter for page to make it accessible in tests
  get currentPage(): Page {
    return this.page;
  }
}

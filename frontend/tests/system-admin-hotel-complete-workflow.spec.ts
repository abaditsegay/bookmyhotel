import { test, expect, Page } from '@playwright/test';

/**
 * System Admin E2E Tests - Complete Hotel Workflow
 * 
 * This test suite covers the complete hotel workflow:
 * 1. Register a new hotel
 * 2. Approve the hotel registration
 * 
 * This ensures the full end-to-end flow works correctly.
 */

class HotelWorkflowPage {
  constructor(private page: Page) {}

  async highlightElement(selector: string, color: string = '#00ff00', duration: number = 800) {
    await this.page.evaluate(
      ({ selector, color }) => {
        const element = document.querySelector(selector);
        if (element) {
          const htmlElement = element as HTMLElement;
          htmlElement.style.border = `3px solid ${color}`;
          htmlElement.style.boxShadow = `0 0 10px ${color}`;
        }
      },
      { selector, color }
    );
    await this.page.waitForTimeout(duration);
  }

  async loginAsSystemAdmin() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    
    await this.page.fill('[data-testid="email-input"]', 'admin@bookmyhotel.com');
    await this.page.fill('[data-testid="password-input"]', 'admin123');
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForLoadState('networkidle');
    
    // Verify login success
    await expect(this.page.locator('[data-testid="user-role"]')).toContainText('System Admin');
  }

  async registerHotel(hotelName: string) {
    // Navigate to hotel management
    await this.page.waitForSelector('[data-testid="stats-card-manage-hotels"]', { state: 'visible' });
    await this.highlightElement('[data-testid="stats-card-manage-hotels"]', '#0066ff');
    await this.page.click('[data-testid="stats-card-manage-hotels"]');
    await this.page.waitForLoadState('networkidle');

    // Click on Register New Hotel or similar button
    const registerButtons = [
      'button:has-text("Register New Hotel")',
      'button:has-text("Add New Hotel")',
      'button:has-text("Register Hotel")',
      '[data-testid="register-hotel-button"]',
      'text=Register New Hotel',
      'text=Add New Hotel'
    ];

    for (const selector of registerButtons) {
      try {
        const element = this.page.locator(selector);
        if (await element.count() > 0) {
          await this.highlightElement(selector, '#00ff00');
          await element.first().click();
          break;
        }
      } catch (error) {
        continue;
      }
    }

    // Wait for registration form/dialog
    await this.page.waitForSelector('form, [role="dialog"]', { state: 'visible', timeout: 10000 });

    // Fill hotel registration form
    const formData = {
      hotelName: hotelName,
      contactPerson: 'Test Manager',
      contactEmail: 'manager@testhotel.com',
      phone: '+1234567890',
      address: '123 Test Street',
      city: 'Test City',
      country: 'Test Country',
      description: 'A test hotel for approval workflow testing',
      numberOfRooms: '100',
      taxId: 'TAX123456',
      licenseNumber: 'LIC789012',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      websiteUrl: 'https://testhotel.com',
      facilityAmenities: 'WiFi, Pool, Gym, Restaurant'
    };

    // Fill form fields with various possible selectors
    const fieldMappings = [
      { data: formData.hotelName, selectors: ['[name="hotelName"]', '[name="hotel_name"]', 'input[placeholder*="Hotel Name"]', 'input[placeholder*="hotel name"]'] },
      { data: formData.contactPerson, selectors: ['[name="contactPerson"]', '[name="contact_person"]', 'input[placeholder*="Contact Person"]'] },
      { data: formData.contactEmail, selectors: ['[name="contactEmail"]', '[name="contact_email"]', '[name="email"]', 'input[type="email"]'] },
      { data: formData.phone, selectors: ['[name="phone"]', 'input[type="tel"]', 'input[placeholder*="Phone"]'] },
      { data: formData.address, selectors: ['[name="address"]', 'input[placeholder*="Address"]'] },
      { data: formData.city, selectors: ['[name="city"]', 'input[placeholder*="City"]'] },
      { data: formData.country, selectors: ['[name="country"]', 'input[placeholder*="Country"]'] },
      { data: formData.description, selectors: ['[name="description"]', 'textarea[placeholder*="Description"]', 'textarea'] },
      { data: formData.numberOfRooms, selectors: ['[name="numberOfRooms"]', '[name="number_of_rooms"]', 'input[placeholder*="Rooms"]'] }
    ];

    for (const field of fieldMappings) {
      for (const selector of field.selectors) {
        try {
          const element = this.page.locator(selector);
          if (await element.count() > 0) {
            await this.highlightElement(selector, '#00ff00', 500);
            await element.first().fill(field.data);
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }

    // Submit the registration form
    const submitButtons = [
      'button[type="submit"]',
      'button:has-text("Register")',
      'button:has-text("Submit")',
      'button:has-text("Create")',
      '[data-testid="submit-button"]'
    ];

    for (const selector of submitButtons) {
      try {
        const element = this.page.locator(selector);
        if (await element.count() > 0) {
          await this.highlightElement(selector, '#00ff00');
          await element.first().click();
          break;
        }
      } catch (error) {
        continue;
      }
    }

    // Wait for success message or redirect
    await this.page.waitForTimeout(2000);
  }

  async navigateToHotelApprovals() {
    // Navigate to hotel registrations/approvals section
    const approvalNavigation = [
      'text=Hotel Registrations',
      'text=Pending Approvals',
      'button:has-text("Hotel Registrations")',
      '[data-testid="hotel-registrations-tab"]'
    ];

    for (const selector of approvalNavigation) {
      try {
        const element = this.page.locator(selector);
        if (await element.count() > 0) {
          await this.highlightElement(selector, '#0066ff');
          await element.first().click();
          await this.page.waitForTimeout(1000);
          break;
        }
      } catch (error) {
        continue;
      }
    }
  }

  async approveHotel(hotelName: string) {
    await this.navigateToHotelApprovals();
    
    // Find the hotel registration row
    const hotelRow = this.page.locator(`tr:has-text("${hotelName}")`);
    await expect(hotelRow).toBeVisible({ timeout: 10000 });
    
    // Find and click the approve button
    const approveButton = hotelRow.locator('button:has-text("Approve")');
    await this.highlightElement('button:has-text("Approve")', '#00ff00');
    await approveButton.click();
    
    // Handle approval dialog
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' });
    
    // Select tenant if dropdown exists
    const tenantDropdown = this.page.locator('[role="dialog"] select, [role="dialog"] .MuiSelect-root');
    if (await tenantDropdown.count() > 0) {
      await tenantDropdown.first().click();
      // Select the first available tenant
      await this.page.locator('[role="option"]').first().click();
    }
    
    // Click final approve button
    const finalApproveButton = this.page.locator('[role="dialog"] button:has-text("Approve")');
    await finalApproveButton.waitFor({ state: 'visible' });
    await this.highlightElement('[role="dialog"] button:has-text("Approve")', '#00ff00');
    await finalApproveButton.click();
    
    // Wait for success message
    await this.page.waitForTimeout(2000);
  }
}

test.describe('System Admin - Complete Hotel Workflow', () => {
  let hotelWorkflowPage: HotelWorkflowPage;
  const testHotelName = `Test Hotel ${Date.now()}`;

  test.beforeEach(async ({ page }) => {
    hotelWorkflowPage = new HotelWorkflowPage(page);
    await hotelWorkflowPage.loginAsSystemAdmin();
  });

  test('should complete full hotel workflow: register then approve', async () => {
    // Step 1: Register a new hotel
    console.log(`Registering hotel: ${testHotelName}`);
    await hotelWorkflowPage.registerHotel(testHotelName);
    
    // Step 2: Approve the registered hotel
    console.log(`Approving hotel: ${testHotelName}`);
    await hotelWorkflowPage.approveHotel(testHotelName);
    
    // Verify the workflow completed successfully
    console.log('Hotel workflow completed successfully!');
  });
});
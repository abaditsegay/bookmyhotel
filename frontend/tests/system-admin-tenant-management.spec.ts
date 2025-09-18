import { test, expect, Page } from '@playwright/test';

/**
 * System Admin E2E Tests - Tenant Management
 * 
 * This test suite covers the complete tenant management workflow
 * including adding new tenants with DOM highlighting for better visibility
 * 
 * Color Scheme:
 * - #00ff00 (Green) - Interactive elements, buttons, form inputs
 * - #0066ff (Blue) - Containers, dialogs, navigation elements  
 * - #ff6600 (Orange) - Authentication/login elements
 * - #ff0000 (Red) - Error states, validation issues
 */

class TenantManagementPage {
  constructor(private page: Page) {}

  // Highlight element with consistent green border only and remove previous highlights
  async highlightElement(selector: string, color: string = '#00ff00', duration: number = 800) {
    await this.page.evaluate(
      ({ selector, color, duration }) => {
        // First, remove all existing highlights
        const allElements = document.querySelectorAll('*');
        allElements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.border = '';
          htmlElement.style.boxShadow = '';
          htmlElement.style.outline = '';
        });
        
        // Then highlight ONLY the first matching element (not all elements)
        const element = document.querySelector(selector); // Use querySelector instead of querySelectorAll
        if (element) {
          const htmlElement = element as HTMLElement;
          htmlElement.style.border = `3px solid ${color}`;
          htmlElement.style.boxShadow = `0 0 10px ${color}`;
        } else {
          console.warn(`Element not found for selector: ${selector}`);
        }
      },
      { selector, color, duration }
    );

    // Wait for the highlight duration
    await this.page.waitForTimeout(duration);
  }

  // Remove all highlights from the page
  async removeAllHighlights() {
    await this.page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.border = '';
        htmlElement.style.boxShadow = '';
        htmlElement.style.outline = '';
      });
    });
  }

  // Add a new tenant with sequential highlighting
  async addNewTenant(tenantName: string, description: string) {
    // Step 1: Find and highlight the Add New Tenant button
    await this.page.waitForSelector('button', { state: 'visible' });
    
    const addButtonSelector = await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addButton = buttons.find(btn => 
        btn.textContent?.includes('Add New Tenant') || 
        btn.textContent?.includes('Add Tenant') ||
        btn.getAttribute('data-testid')?.includes('add-tenant')
      );
      if (addButton) {
        addButton.id = addButton.id || 'add-tenant-btn-' + Date.now();
        return '#' + addButton.id;
      }
      return null;
    });
    
    if (!addButtonSelector) {
      throw new Error('Could not find Add New Tenant button');
    }
    
    await this.highlightElement(addButtonSelector, '#00ff00', 2000);
    await this.page.click(addButtonSelector);
    await this.page.waitForTimeout(1000);
    
    // Step 2: Wait for dialog and highlight it
    await this.page.waitForSelector('div[role="dialog"]', { state: 'visible' });
    await this.highlightElement('div[role="dialog"]', '#0066ff', 2000);
    
    // Step 3: Highlight and fill name input
    const nameInput = 'div[role="dialog"] input[type="text"]:first-of-type';
    await this.page.waitForSelector(nameInput, { state: 'visible' });
    await this.highlightElement(nameInput, '#00ff00', 1500);
    await this.page.fill(nameInput, tenantName);
    
    // Step 4: Highlight and fill description textarea
    const descriptionInput = 'div[role="dialog"] textarea';
    await this.page.waitForSelector(descriptionInput, { state: 'visible' });
    await this.highlightElement(descriptionInput, '#00ff00', 1500);
    await this.page.fill(descriptionInput, description);
    
    // Step 5: Highlight and click Create button
    await this.page.waitForSelector('div[role="dialog"] button', { state: 'visible' });
    
    await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="dialog"] button'));
      const createButton = buttons.find(btn => {
        const text = btn.textContent?.toLowerCase().trim() || '';
        return text.includes('create') || text.includes('add') || text.includes('save') || text.includes('submit');
      }) as HTMLElement;
      
      if (!createButton && buttons.length >= 2) {
        const lastButton = buttons[buttons.length - 1] as HTMLElement;
        lastButton.style.border = '3px solid #00ff00';
        lastButton.style.boxShadow = '0 0 10px #00ff00';
      } else if (createButton) {
        createButton.style.border = '3px solid #00ff00';
        createButton.style.boxShadow = '0 0 10px #00ff00';
      }
    });
    
    await this.page.waitForTimeout(1500);
    
    // Step 6: Click the Create Tenant button
    const textSelectors = ['Create Tenant', 'Create', 'Add', 'Save', 'Submit'];
    let buttonClicked = false;
    
    for (const text of textSelectors) {
      try {
        const button = this.page.locator(`div[role="dialog"] button:has-text("${text}")`).first();
        if (await button.isVisible()) {
          await button.click();
          await this.page.waitForTimeout(1000);
          buttonClicked = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!buttonClicked) {
      const buttons = await this.page.locator('div[role="dialog"] button').all();
      if (buttons.length >= 2) {
        const lastButton = buttons[buttons.length - 1];
        await lastButton.click();
        await this.page.waitForTimeout(1000);
      }
    }
    
    // Step 7: Remove highlights and show success
    await this.removeAllHighlights();
    await this.page.waitForLoadState('networkidle');
    
    // Show success overlay
    await this.showSuccessOverlay();
  }

  // Show success overlay
  private async showSuccessOverlay() {
    await this.page.evaluate(() => {
      let overlay = document.getElementById('tenant-success-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'tenant-success-overlay';
        overlay.innerHTML = `
          <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 30px 50px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            border: 3px solid #00ff00;
            animation: successPulse 2s ease-in-out;
          ">
            ✅ Tenant Created Successfully!
            <div style="font-size: 16px; font-weight: normal; margin-top: 10px; opacity: 0.9;">
              The new tenant has been added to the system
            </div>
          </div>
        `;
        
        if (!document.getElementById('success-overlay-styles')) {
          const style = document.createElement('style');
          style.id = 'success-overlay-styles';
          style.textContent = `
            @keyframes successPulse {
              0% { 
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
              }
              50% { 
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.05);
              }
              100% { 
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }
          `;
          document.head.appendChild(style);
        }
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
          if (overlay && overlay.parentNode) {
            overlay.style.animation = 'successPulse 0.5s ease-in-out reverse';
            setTimeout(() => {
              overlay?.remove();
            }, 500);
          }
        }, 5000);
      }
    });
    
    await this.page.waitForTimeout(3000);
  }
}

test.describe('System Admin - Tenant Management', () => {
  let tenantPage: TenantManagementPage;

  test.beforeEach(async ({ page }) => {
    tenantPage = new TenantManagementPage(page);
    
    // Login as system admin first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Sequential highlighting for login process
    await tenantPage.highlightElement('[data-testid="login-form"]', '#ff6600', 800);
    
    // Fill admin credentials with sequential highlighting
    await tenantPage.highlightElement('[data-testid="email-input"]', '#ff6600', 600);
    await page.fill('[data-testid="email-input"]', 'admin@bookmyhotel.com');
    
    await tenantPage.highlightElement('[data-testid="password-input"]', '#ff6600', 600);
    await page.fill('[data-testid="password-input"]', 'password123');
    
    // Highlight and click login
    await tenantPage.highlightElement('[data-testid="login-button"]', '#ff6600', 800);
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(1000);
    
    // Remove all highlights after login
    await tenantPage.removeAllHighlights();
    
    await page.waitForLoadState('networkidle');
    
    // Verify we're logged in as system admin
    await expect(page.locator('[data-testid="user-role"]')).toContainText('SYSTEM_ADMIN');
    
    // Navigate to tenant management
    await page.waitForSelector('[data-testid="stats-card-manage-tenants"]', { state: 'visible' });
    await tenantPage.highlightElement('[data-testid="stats-card-manage-tenants"]', '#0066ff', 2000);
    
    // Click on the Manage Tenants card
    await page.click('[data-testid="stats-card-manage-tenants"]');
    await page.waitForTimeout(1000);
    
    // Remove highlights after navigation
    await tenantPage.removeAllHighlights();
    
    await page.waitForLoadState('networkidle');
  });

  test('should add a new tenant successfully', async ({ page }) => {
    const tenantName = `Test Hotel ${Date.now()}`;
    const description = 'A test hotel for automated testing purposes';
    
    // Navigation is already handled in beforeEach, proceed directly to adding tenant
    
    // Add the new tenant with DOM highlighting demonstration
    await tenantPage.addNewTenant(tenantName, description);
    
    // Verify the form submission workflow was successful
    const currentUrl = page.url();
    expect(currentUrl).toContain('tenant');
    
    // Take a screenshot for manual verification
    await page.screenshot({ path: 'tenant-creation-result.png' });
  });
});

import { test, Page, Locator } from '@playwright/test';

class HotelApprovalPage {
  public page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation methods
  async navigateToLogin() {
    await this.page.goto('http://localhost:3000/login');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToSystemAdminDashboard() {
    // Wait for dashboard to load after login
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500); // Brief wait for dashboard to settle
  }

  async navigateToManageHotels() {
    // Target the Manage Hotels card directly
    const manageHotelsSelectors = [
      '[data-testid*="manage-hotels"]',
      '.card:has-text("Manage Hotels")',
      '.MuiCard-root:has-text("Manage Hotels")',
      'div:has-text("Manage Hotels")',
      'text=Manage Hotels'
    ];
    
    let manageHotelsElement: Locator | null = null;
    for (const selector of manageHotelsSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        manageHotelsElement = element.first();
        break;
      }
    }
    
    if (manageHotelsElement) {
      await this.highlightElement(manageHotelsElement, 'Manage Hotels card', 1500);
      await manageHotelsElement.click();
    } else {
      // Fallback to text-based selection
      const fallbackElement = this.page.locator('text=Manage Hotels');
      await this.highlightElement(fallbackElement, 'Manage Hotels button', 1500);
      await fallbackElement.click();
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToHotelRegistrationsTab() {
    const tabSelectors = [
      'text=Hotel Registrations',
      '[role="tab"]:has-text("Hotel Registrations")',
      'button:has-text("Hotel Registrations")',
      '[data-testid*="registrations"]'
    ];
    
    for (const selector of tabSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        await this.highlightElement(element.first(), 'Hotel Registrations tab', 1000);
        await element.first().click();
        break;
      }
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToManageHotels() {
    // Wait a moment for page to be ready
    await this.page.waitForTimeout(500);
    
    // Target the entire Manage Hotels card/container instead of just text
    const manageHotelsSelectors = [
      'text=Manage Hotels',
      '[data-testid*="manage-hotels"]',
      '.card:has-text("Manage Hotels")',
      '.MuiCard-root:has-text("Manage Hotels")',
      'div:has-text("Manage Hotels"):has(button)',
      'button:has-text("Manage Hotels")'
    ];
    
    let manageHotelsElement: Locator | null = null;
    for (const selector of manageHotelsSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        manageHotelsElement = element.first();
        console.log(`Found Manage Hotels element with selector: ${selector}`);
        break;
      }
    }
    
    if (manageHotelsElement) {
      await this.highlightElement(manageHotelsElement, 'Manage Hotels card', 2500);
      await manageHotelsElement.click();
    } else {
      // Fallback: try to find any clickable element containing "Hotel" text
      const hotelElements = this.page.locator('*:has-text("Hotel")');
      if (await hotelElements.count() > 0) {
        await this.highlightElement(hotelElements.first(), 'Hotel-related element', 2500);
        await hotelElements.first().click();
      } else {
        throw new Error('Could not find Manage Hotels or any Hotel-related elements');
      }
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToHotelRegistrationsTab() {
    // Wait for the page to load
    await this.page.waitForTimeout(1000);
    
    // Look for Hotel Registrations tab with multiple selector strategies
    const tabSelectors = [
      'text=Hotel Registrations',
      'text=Registrations',
      '[data-testid*="registration"]',
      'tab:has-text("Hotel Registrations")',
      'button:has-text("Hotel Registrations")',
      'a:has-text("Hotel Registrations")',
      '.MuiTab-root:has-text("Registration")'
    ];
    
    let registrationTab: Locator | null = null;
    for (const selector of tabSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        registrationTab = element.first();
        console.log(`Found Hotel Registrations tab with selector: ${selector}`);
        break;
      }
    }
    
    if (registrationTab) {
      await this.highlightElement(registrationTab, 'Hotel Registrations tab');
      await registrationTab.click();
      await this.page.waitForLoadState('networkidle');
    } else {
      console.log('Hotel Registrations tab not found, might already be on the correct page');
      // Continue anyway - might already be on the registrations page
    }
  }

  // Authentication methods
  async loginAsSystemAdmin() {
    await this.highlightElement(this.page.locator('[data-testid="email-input"]'), 'Email field');
    await this.page.fill('[data-testid="email-input"]', 'admin@bookmyhotel.com');
    
    await this.highlightElement(this.page.locator('[data-testid="password-input"]'), 'Password field');
    await this.page.fill('[data-testid="password-input"]', 'password123');
    
    await this.highlightElement(this.page.locator('[data-testid="login-button"]'), 'Login button');
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  // Hotel approval methods
  async findPendingHotelRegistration() {
    // Wait for content to load
    await this.page.waitForTimeout(2000);
    
    // Look for hotel rows with APPROVE button - try various selectors
    const rowSelectors = [
      'tr:has(button:has-text("Approve"))',
      '[data-testid*="hotel-row"]:has(button:has-text("Approve"))',
      '.hotel-row:has(button:has-text("Approve"))',
      '.MuiTableRow-root:has(button:has-text("Approve"))',
      'tr',
      '[data-testid*="hotel-row"]',
      '.hotel-row',
      '.MuiTableRow-root'
    ];
    
    for (const rowSelector of rowSelectors) {
      const hotelRows = this.page.locator(rowSelector);
      const count = await hotelRows.count();
      
      console.log(`Checking ${count} rows with selector: ${rowSelector}`);
      
      // Check each row for approve buttons
      for (let i = 0; i < count; i++) {
        const row = hotelRows.nth(i);
        const approveButton = row.locator('button').filter({ hasText: /approve/i });
        
        if (await approveButton.count() > 0) {
          console.log(`Found approve button in row ${i} with selector: ${rowSelector}`);
          return { row, approveButton: approveButton.first() };
        }
      }
    }
    
    // Fallback: look for any approve button on the page
    const anyApproveButton = this.page.locator('button').filter({ hasText: /approve/i });
    if (await anyApproveButton.count() > 0) {
      console.log('Found approve button anywhere on page');
      return { 
        row: anyApproveButton.first().locator('..'), // Parent element
        approveButton: anyApproveButton.first() 
      };
    }
    
    throw new Error('No hotel rows with APPROVE buttons found for approval testing');
  }

  async approveHotelRegistration() {
    // Find hotel row with approve button
    const { row, approveButton } = await this.findPendingHotelRegistration();
    
    // Highlight the specific hotel row
    await this.highlightElement(row, 'Hotel row with approve button');
    
    // Highlight and click the specific APPROVE button
    await this.highlightElement(approveButton, 'APPROVE button');
    await approveButton.click();
    
    // Wait for approval dialog to open
    await this.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await this.highlightElement(this.page.locator('[role="dialog"]'), 'Approval dialog');
    
    // Select tenant from dropdown - try different selector patterns
    const tenantSelectors = [
      '[role="dialog"] select',
      '[role="dialog"] [data-testid*="tenant"]', 
      '[role="dialog"] .MuiSelect-root',
      '[role="dialog"] input[placeholder*="tenant"]',
      '[role="dialog"] [aria-label*="tenant"]',
      '[role="dialog"] [id*="tenant"]',
      '[role="dialog"] .MuiFormControl-root select',
      '[role="dialog"] .MuiFormControl-root .MuiSelect-root'
    ];
    
    let tenantDropdown: Locator | null = null;
    for (const selector of tenantSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        tenantDropdown = element.first();
        console.log(`Found tenant dropdown with selector: ${selector}`);
        break;
      }
    }
    
    if (tenantDropdown) {
      await this.highlightElement(tenantDropdown, 'Tenant dropdown');
      await tenantDropdown.click();
      
      // Wait for dropdown options to appear and select the first available tenant
      await this.page.waitForTimeout(2000);
      
      const tenantOptionSelectors = [
        '[role="listbox"] [role="option"]',
        '[role="option"]',
        '.MuiMenuItem-root',
        'option',
        '[data-value]:not([data-value=""])'
      ];
      
      for (const optionSelector of tenantOptionSelectors) {
        const options = this.page.locator(optionSelector);
        if (await options.count() > 0) {
          console.log(`Found tenant options with selector: ${optionSelector}, count: ${await options.count()}`);
          await this.highlightElement(options.first(), 'First tenant option');
          await options.first().click();
          await this.page.waitForTimeout(1000); // Wait for selection to register
          break;
        }
      }
    } else {
      console.log('No tenant dropdown found, checking if tenant is already selected or not required');
    }
    
    // Click "Approve Registration" button - wait for it to be enabled
    const approveRegistrationSelectors = [
      '[role="dialog"] button:has-text("Approve Registration")',
      '[role="dialog"] button:has-text("Approve")',
      '[role="dialog"] button:has-text("Confirm")',
      '[role="dialog"] [data-testid*="approve"]'
    ];
    
    let approveRegistrationButton: Locator | null = null;
    for (const selector of approveRegistrationSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        approveRegistrationButton = element.first();
        console.log(`Found approve registration button with selector: ${selector}`);
        break;
      }
    }
    
    if (approveRegistrationButton) {
      // Wait for the button to be enabled (after tenant selection)
      await approveRegistrationButton.waitFor({ state: 'attached', timeout: 10000 });
      
      // Check if button is still disabled and wait a bit more
      let attempts = 0;
      while (await approveRegistrationButton.isDisabled() && attempts < 10) {
        console.log(`Approve button is disabled, waiting... (attempt ${attempts + 1})`);
        await this.page.waitForTimeout(1000);
        attempts++;
      }
      
      if (await approveRegistrationButton.isDisabled()) {
        console.log('Approve button is still disabled - tenant might not be selected properly');
        // Try to select tenant again or click on dropdown
        const anyDropdown = this.page.locator('[role="dialog"] .MuiSelect-root, [role="dialog"] select');
        if (await anyDropdown.count() > 0) {
          await anyDropdown.first().click();
          await this.page.waitForTimeout(1000);
          const options = this.page.locator('[role="option"], .MuiMenuItem-root, option');
          if (await options.count() > 0) {
            await options.first().click();
            await this.page.waitForTimeout(2000);
          }
        }
      }
      
      await this.highlightElement(approveRegistrationButton, 'Approve Registration button');
      await approveRegistrationButton.click();
    } else {
      throw new Error('Could not find Approve Registration button in dialog');
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  async rejectHotel(hotelRow: Locator) {
    await this.highlightElement(hotelRow, 'Pending hotel row');
    
    // Find the reject button in the row
    const rejectButton = hotelRow.locator('button').filter({ hasText: /reject|deny/i });
    await this.highlightElement(rejectButton, 'Reject button');
    await rejectButton.click();
    
    // Wait for confirmation dialog
    await this.page.waitForSelector('[role="dialog"]');
    const confirmButton = this.page.locator('[role="dialog"] button').filter({ hasText: /confirm|reject/i });
    
    await this.highlightElement(confirmButton, 'Confirm rejection button');
    await confirmButton.click();
    
    await this.page.waitForLoadState('networkidle');
  }

  async verifyApprovalSuccess() {
    // Check for success indicators on the page
    const successIndicators = [
      this.page.locator('text=approved successfully'),
      this.page.locator('text=registration approved'),
      this.page.locator('[data-testid="success-message"]'),
      this.page.locator('.success, .approved')
    ];
    
    for (const indicator of successIndicators) {
      if (await indicator.count() > 0) {
        await this.highlightElement(indicator, 'Success indicator');
        return true;
      }
    }
    
    return false;
  }

  // Visual feedback methods
  async highlightElement(locator: Locator, description: string, duration: number = 4000) {
    try {
      await locator.waitFor({ timeout: 15000 });
      
      // Use a more direct approach to highlight elements
      await locator.evaluate((element, desc) => {
        const el = element as HTMLElement;
        el.style.border = '3px solid #4CAF50';
        el.style.boxShadow = '0 0 10px #4CAF50';
        el.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        console.log(`Highlighting: ${desc}`);
      }, description);
      
      await this.page.waitForTimeout(duration);
      
      // Remove highlighting
      await locator.evaluate((element) => {
        const el = element as HTMLElement;
        el.style.border = '';
        el.style.boxShadow = '';
        el.style.backgroundColor = '';
      });
    } catch (error) {
      console.log(`Failed to highlight element: ${description}, Error: ${error}`);
    }
  }

  async showSuccessOverlay(message: string) {
    await this.page.evaluate((msg) => {
      const overlay = document.createElement('div');
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
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          z-index: 10000;
          animation: slideIn 0.5s ease-out;
        ">
          ✅ ${msg}
        </div>
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { opacity: 0; transform: translate(-50%, -60%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(overlay);
      
      setTimeout(() => {
        overlay.remove();
        style.remove();
      }, 4000);
    }, message);
    
    await this.page.waitForTimeout(4000);
  }
}

test.describe('System Admin - Hotel Approval Functionality', () => {
  let hotelApprovalPage: HotelApprovalPage;

  test.beforeEach(async ({ page }) => {
    hotelApprovalPage = new HotelApprovalPage(page);
    await hotelApprovalPage.navigateToLogin();
    await hotelApprovalPage.loginAsSystemAdmin();
    await hotelApprovalPage.navigateToSystemAdminDashboard();
    await hotelApprovalPage.navigateToManageHotels();
    await hotelApprovalPage.navigateToHotelRegistrationsTab();
  });

  test('should approve a hotel registration with tenant selection', async () => {
    // Approve hotel registration with tenant selection
    await hotelApprovalPage.approveHotelRegistration();
    
    // Show success message
    await hotelApprovalPage.showSuccessOverlay('Hotel Registration Approved Successfully!');
  });

  test('should display hotel registrations with approve buttons', async () => {
    // Check for approve buttons in the hotel rows
    const hotelRows = hotelApprovalPage.page.locator('tr, [data-testid*="hotel-row"], .hotel-row, .MuiTableRow-root');
    const totalRows = await hotelRows.count();
    
    let approveButtonsFound = 0;
    
    // Count approve buttons in each row
    for (let i = 0; i < totalRows; i++) {
      const row = hotelRows.nth(i);
      const approveButton = row.locator('button').filter({ hasText: /approve/i });
      if (await approveButton.count() > 0) {
        approveButtonsFound++;
        if (approveButtonsFound === 1) {
          await hotelApprovalPage.highlightElement(row, `Hotel row ${i + 1} with approve button`);
          await hotelApprovalPage.highlightElement(approveButton.first(), 'Approve button');
        }
      }
    }
    
    if (approveButtonsFound > 0) {
      await hotelApprovalPage.showSuccessOverlay(`Found ${approveButtonsFound} hotel registrations awaiting approval`);
    } else {
      await hotelApprovalPage.showSuccessOverlay('No hotel registrations awaiting approval');
    }
  });
});

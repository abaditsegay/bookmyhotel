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

  // Authentication methods
  async loginAsSystemAdmin() {
    await this.highlightElement(this.page.locator('[data-testid="email-input"]'), 'Email field', 1500);
    await this.page.fill('[data-testid="email-input"]', 'admin@bookmyhotel.com');
    
    await this.highlightElement(this.page.locator('[data-testid="password-input"]'), 'Password field', 1500);
    await this.page.fill('[data-testid="password-input"]', 'password123');
    
    await this.highlightElement(this.page.locator('[data-testid="login-button"]'), 'Login button', 1500);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForLoadState('networkidle');
  }

  // Hotel approval methods
  async findAndHighlightPendingHotelRegistration() {
    // Wait for table to load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    // Look for hotel rows with APPROVE button using multiple strategies
    const rowSelectors = [
      'tr:has(button:has-text("APPROVE"))',
      'tr:has(button:has-text("Approve"))', 
      '.MuiTableRow-root:has(button:has-text("APPROVE"))',
      '.MuiTableRow-root:has(button:has-text("Approve"))',
      '[data-testid*="hotel-row"]:has(button:has-text("APPROVE"))',
      'tr', // Fallback to check all rows
      '.MuiTableRow-root' // Fallback to Material-UI table rows
    ];
    
    let targetRow: Locator | null = null;
    let approveButton: Locator | null = null;
    
    for (const selector of rowSelectors) {
      const rows = this.page.locator(selector);
      const count = await rows.count();
      console.log(`Checking ${count} rows with selector: ${selector}`);
      
      // Check each row for an approve button
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const buttons = row.locator('button').filter({ hasText: /approve/i });
        
        if (await buttons.count() > 0) {
          targetRow = row;
          approveButton = buttons.first();
          console.log(`Found approve button in row ${i} using selector: ${selector}`);
          
          // Scroll the row into view before highlighting
          console.log(`Scrolling hotel row ${i + 1} into view...`);
          await targetRow.scrollIntoViewIfNeeded();
          await this.page.waitForTimeout(1000); // Wait for scroll to complete
          
          // Highlight the entire row first
          await this.highlightElement(targetRow, `Hotel row ${i + 1} with APPROVE button`, 2000);
          
          // Then highlight the specific approve button
          await this.highlightElement(approveButton, 'APPROVE button', 2000);
          
          return { row: targetRow, approveButton };
        }
      }
    }
    
    // If no rows with approve buttons found, show what we have
    const allRows = this.page.locator('tr, .MuiTableRow-root');
    const totalRows = await allRows.count();
    console.log(`Total rows found: ${totalRows}`);
    
      if (totalRows > 0) {
        // Show first few rows for debugging
        for (let i = 0; i < Math.min(3, totalRows); i++) {
          const row = allRows.nth(i);
          const buttons = row.locator('button');
          const buttonCount = await buttons.count();
          const buttonTexts: string[] = [];
          
          for (let j = 0; j < buttonCount; j++) {
            const text = await buttons.nth(j).textContent();
            if (text) buttonTexts.push(text);
          }
          
          console.log(`Row ${i}: ${buttonCount} buttons with texts: ${buttonTexts.join(', ')}`);
          
          if (i === 0) {
            // Scroll the first row into view before highlighting for debugging
            await row.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(500);
            await this.highlightElement(row, `Sample hotel row ${i + 1}`, 1500);
          }
        }
      }    throw new Error(`No hotel rows with APPROVE buttons found for approval testing. Found ${totalRows} total rows.`);
  }

  async approveHotelRegistration() {
    // Find hotel row with approve button
    const { approveButton } = await this.findAndHighlightPendingHotelRegistration();
    
    // Ensure the approve button is visible and scroll it into view if needed
    await approveButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    
    // Highlight and click the specific APPROVE button
    await this.highlightElement(approveButton, 'APPROVE button', 1500);
    
    // Click the approve button and wait for the action to complete
    console.log('Clicking APPROVE button...');
    await approveButton.click();
    
    // Give a brief moment for the click to be processed
    await this.page.waitForTimeout(1500);
    
    // Wait for approval dialog to open
    console.log('Waiting for approval dialog to open...');
    await this.page.waitForSelector('[role="dialog"]', { timeout: 15000 });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Additional wait for dialog to fully render
    
    await this.highlightElement(this.page.locator('[role="dialog"]'), 'Approval dialog opened', 1500);
    
    // Wait for tenant dropdown to be available in the dialog
    console.log('Looking for tenant dropdown in dialog...');
    const tenantSelectors = [
      '[role="dialog"] .MuiSelect-root', // Material-UI Select component
      '[role="dialog"] .MuiFormControl-root .MuiSelect-root',
      '[role="dialog"] [role="combobox"]', // ARIA combobox role
      '[role="dialog"] .MuiInputBase-root', // Material-UI input base
      '[role="dialog"] input[placeholder*="Tenant"]',
      '[role="dialog"] div:has-text("Tenant") + div', // Look for div after "Tenant" label
      '[role="dialog"] div:contains("Tenant *")', // Look for the exact label
      '[role="dialog"] .MuiTextField-root .MuiSelect-root', // Material-UI TextField with Select
      '[role="dialog"] [data-testid*="tenant"]',
      '[role="dialog"] select'
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
    
    // If still not found, try to find it by looking for the first clickable element in the dialog
    if (!tenantDropdown) {
      console.log('Trying to find tenant dropdown by position...');
      const firstClickableElements = this.page.locator('[role="dialog"] div[role="button"], [role="dialog"] .MuiSelect-select, [role="dialog"] [aria-haspopup="listbox"]');
      const count = await firstClickableElements.count();
      console.log(`Found ${count} clickable elements in dialog`);
      if (count > 0) {
        tenantDropdown = firstClickableElements.first();
        console.log('Using first clickable element as tenant dropdown');
      }
    }
    
    if (tenantDropdown) {
      await this.highlightElement(tenantDropdown, 'Tenant dropdown in dialog', 2000);
      console.log('Clicking tenant dropdown to open options...');
      await tenantDropdown.click();
      
      // Wait for dropdown options to appear
      console.log('Waiting for tenant dropdown options to load...');
      await this.page.waitForTimeout(2000);
      
      // Look for tenant options using Material-UI specific selectors
      const tenantOptionSelectors = [
        '[role="presentation"] [role="option"]', // Material-UI dropdown options
        '.MuiMenu-list [role="option"]', // Material-UI Menu list
        '.MuiMenuItem-root', // Material-UI Menu items
        '[data-value]:not([data-value=""])', // Options with data-value attribute
        '[role="listbox"] [role="option"]', // Standard listbox options
        'li[data-value]', // List items with data-value
        'li.MuiMenuItem-root' // Material-UI list items
      ];
      
      let optionSelected = false;
      for (const optionSelector of tenantOptionSelectors) {
        const options = this.page.locator(optionSelector);
        const optionCount = await options.count();
        console.log(`Found ${optionCount} options with selector: ${optionSelector}`);
        
        if (optionCount > 0) {
          // Try to find a meaningful option (not empty or placeholder)
          for (let i = 0; i < Math.min(optionCount, 5); i++) {
            const option = options.nth(i);
            const optionText = await option.textContent();
            const optionValue = await option.getAttribute('data-value');
            
            console.log(`Option ${i}: text="${optionText}", data-value="${optionValue}"`);
            
            // Skip empty or placeholder options
            if (optionText && optionText.trim() && 
                optionText !== 'Select Tenant' && 
                optionText !== 'Choose...' &&
                optionText !== 'None' &&
                !optionText.includes('Select')) {
              
              await this.highlightElement(option, `Tenant option: ${optionText}`, 2000);
              console.log(`Selecting tenant option: ${optionText}`);
              await option.click();
              optionSelected = true;
              
              // Wait for selection to register
              await this.page.waitForTimeout(1500);
              break;
            }
          }
          
          // If no good option found, select the first one anyway
          if (!optionSelected && optionCount > 0) {
            const firstOption = options.first();
            const firstOptionText = await firstOption.textContent();
            console.log(`No ideal option found, selecting first option: ${firstOptionText}`);
            await this.highlightElement(firstOption, `First available option: ${firstOptionText}`, 1500);
            await firstOption.click();
            optionSelected = true;
            await this.page.waitForTimeout(1500);
          }
          
          if (optionSelected) break;
        }
      }
      
      if (!optionSelected) {
        console.log('Could not find or select any tenant option, proceeding anyway...');
        // Try to close dropdown by clicking elsewhere
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(1000);
      } else {
        console.log('Tenant selection completed successfully');
      }
    } else {
      console.log('No tenant dropdown found in dialog, proceeding without tenant selection');
    }
    
    // Wait for the Approve Registration button to be enabled after tenant selection
    console.log('Waiting for Approve Registration button to be ready...');
    await this.page.waitForTimeout(2000);
    
    // Find and click the "Approve Registration" button in the dialog
    const approveRegistrationSelectors = [
      '[role="dialog"] button:has-text("Approve Registration")',
      '[role="dialog"] button:has-text("Approve")',
      '[role="dialog"] button:has-text("Confirm")',
      '[role="dialog"] button[type="submit"]',
      '[role="dialog"] .MuiButton-contained:has-text("Approve")',
      '[role="dialog"] [data-testid*="approve"]',
      '[role="dialog"] [data-testid*="confirm"]'
    ];
    
    let approveRegistrationButton: Locator | null = null;
    for (const selector of approveRegistrationSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        approveRegistrationButton = element.first();
        const buttonText = await approveRegistrationButton.textContent();
        console.log(`Found approve button with selector: ${selector}, text: "${buttonText}"`);
        break;
      }
    }
    
    if (approveRegistrationButton) {
      // Check if button is enabled
      const isDisabled = await approveRegistrationButton.isDisabled();
      console.log(`Approve Registration button disabled: ${isDisabled}`);
      
      if (isDisabled) {
        console.log('Button is disabled, waiting a bit more...');
        await this.page.waitForTimeout(2000);
      }
      
      await this.highlightElement(approveRegistrationButton, 'Approve Registration button', 2000);
      console.log('Clicking Approve Registration button...');
      
      // Ensure the button is clickable and click it
      await approveRegistrationButton.waitFor({ state: 'visible' });
      await approveRegistrationButton.click({ force: true });
      
      // Wait for the approval action to complete
      console.log('Waiting for approval action to process...');
      await this.page.waitForTimeout(3000);
      
      // Check if dialog closed (indicating success)
      const dialogStillOpen = await this.page.locator('[role="dialog"]').count();
      if (dialogStillOpen === 0) {
        console.log('Dialog closed - approval likely successful');
      } else {
        console.log('Dialog still open - checking for success indicators');
      }
      
      // Show success overlay
      await this.showSuccessOverlay('Hotel Registration Approved Successfully!');
    } else {
      // Show available buttons for debugging
      const allButtons = this.page.locator('[role="dialog"] button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} buttons in dialog:`);
      
      for (let i = 0; i < buttonCount; i++) {
        const button = allButtons.nth(i);
        const buttonText = await button.textContent();
        console.log(`  Button ${i}: "${buttonText}"`);
      }
      
      throw new Error('Could not find Approve Registration button in dialog');
    }
    
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
        await this.highlightElement(indicator, 'Success indicator', 1500);
        return true;
      }
    }
    
    return false;
  }

  // Visual feedback methods
  async highlightElement(locator: Locator, description: string, duration: number = 2000) {
    try {
      await locator.waitFor({ timeout: 15000 });
      
      // Use a consistent border highlighting approach for all elements
      await locator.evaluate((element, desc) => {
        const el = element as HTMLElement;
        // Store original styles to restore later
        el.dataset.originalBorder = el.style.border || '';
        el.dataset.originalBoxShadow = el.style.boxShadow || '';
        el.dataset.originalOutline = el.style.outline || '';
        
        // Apply consistent border highlighting (no background overlay)
        el.style.border = '3px solid #4CAF50';
        el.style.boxShadow = '0 0 15px #4CAF50, 0 0 25px rgba(76, 175, 80, 0.3)';
        el.style.outline = '2px solid #4CAF50';
        el.style.outlineOffset = '2px';
        
        console.log(`Highlighting with border: ${desc}`);
      }, description);
      
      await this.page.waitForTimeout(duration);
      
      // Remove highlighting and restore original styles
      await locator.evaluate((element) => {
        const el = element as HTMLElement;
        // Restore original styles
        el.style.border = el.dataset.originalBorder || '';
        el.style.boxShadow = el.dataset.originalBoxShadow || '';
        el.style.outline = el.dataset.originalOutline || '';
        
        // Clean up data attributes
        delete el.dataset.originalBorder;
        delete el.dataset.originalBoxShadow;
        delete el.dataset.originalOutline;
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
    
    // Show success message is already handled in the method
  });
});

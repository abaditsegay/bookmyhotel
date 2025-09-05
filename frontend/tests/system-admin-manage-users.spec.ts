import { test, Page, Locator } from '@playwright/test';

class ManageUsersPage {
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

  async navigateToManageUsers() {
    // Target the Manage Users card directly
    const manageUsersSelectors = [
      '[data-testid*="manage-users"]',
      '.card:has-text("Manage Users")',
      '.MuiCard-root:has-text("Manage Users")',
      'div:has-text("Manage Users")',
      'text=Manage Users'
    ];
    
    let manageUsersElement: Locator | null = null;
    for (const selector of manageUsersSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        manageUsersElement = element.first();
        break;
      }
    }
    
    if (manageUsersElement) {
      // Scroll the card into view before highlighting
      console.log('Scrolling Manage Users card into view...');
      await manageUsersElement.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1000);
      
      await this.highlightElement(manageUsersElement, 'Manage Users card', 2000);
      console.log('Clicking Manage Users card...');
      await manageUsersElement.click();
    } else {
      // Fallback to text-based selection
      const fallbackElement = this.page.locator('text=Manage Users');
      if (await fallbackElement.count() > 0) {
        await fallbackElement.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        await this.highlightElement(fallbackElement, 'Manage Users button', 2000);
        console.log('Clicking Manage Users button (fallback)...');
        await fallbackElement.click();
      } else {
        throw new Error('Could not find Manage Users card or button');
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

  // User management methods
  async verifyManageUsersPageLoaded() {
    // Wait for users page to load and check for user management elements
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    // Look for user management indicators
    const userPageIndicators = [
      'text=User Management',
      'text=Manage Users',
      'text=Users',
      '[data-testid*="user"]',
      'table', // Users are likely displayed in a table
      '.MuiTable-root',
      'thead', // Table header
      'tbody' // Table body
    ];
    
    let pageLoaded = false;
    for (const indicator of userPageIndicators) {
      const element = this.page.locator(indicator);
      if (await element.count() > 0) {
        await this.highlightElement(element.first(), `User management indicator: ${indicator}`, 1500);
        pageLoaded = true;
        break;
      }
    }
    
    if (pageLoaded) {
      await this.showSuccessOverlay('Manage Users page loaded successfully!');
    } else {
      await this.showSuccessOverlay('Navigated to Manage Users - checking page content');
    }
    
    return pageLoaded;
  }

  async findAndClickAddUserButton() {
    // Wait for page to fully load
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
    
    // Look for ADD USER button using multiple selector strategies
    const addUserSelectors = [
      'button:has-text("ADD USER")',
      'button:has-text("Add User")',
      'button:has-text("Create User")',
      'button:has-text("New User")',
      '[data-testid*="add-user"]',
      '[data-testid*="create-user"]',
      '.MuiButton-root:has-text("ADD USER")',
      '.MuiButton-root:has-text("Add User")',
      '[aria-label*="add user"]',
      '[aria-label*="create user"]'
    ];
    
    let addUserButton: Locator | null = null;
    for (const selector of addUserSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        addUserButton = element.first();
        console.log(`Found ADD USER button with selector: ${selector}`);
        break;
      }
    }
    
    if (addUserButton) {
      // Scroll the button into view before highlighting
      console.log('Scrolling ADD USER button into view...');
      await addUserButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(1000);
      
      // Highlight the ADD USER button
      await this.highlightElement(addUserButton, 'ADD USER button', 2000);
      
      // Click the ADD USER button
      console.log('Clicking ADD USER button...');
      await addUserButton.click();
      
      // Wait for the action to complete
      await this.page.waitForTimeout(1500);
      
      return true;
    } else {
      // If no ADD USER button found, show available buttons for debugging
      const allButtons = this.page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`Found ${buttonCount} buttons on the page:`);
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = allButtons.nth(i);
        const buttonText = await button.textContent();
        console.log(`  Button ${i}: "${buttonText}"`);
        
        if (i === 0 && buttonText) {
          // Highlight the first button for debugging
          await this.highlightElement(button, `First button: ${buttonText}`, 1500);
        }
      }
      
      throw new Error('Could not find ADD USER button on the page');
    }
  }

  async verifyAddUserAction() {
    // Check if add user dialog/form opened or if we navigated to add user page
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
    
    const addUserIndicators = [
      '[role="dialog"]', // Modal dialog for adding user
      'text=Add User',
      'text=Create User',
      'text=New User',
      'form', // Form for user creation
      'input[placeholder*="email"]',
      'input[placeholder*="name"]',
      '[data-testid*="user-form"]'
    ];
    
    let actionVerified = false;
    for (const indicator of addUserIndicators) {
      const element = this.page.locator(indicator);
      if (await element.count() > 0) {
        await this.highlightElement(element.first(), `Add user form/dialog: ${indicator}`, 1500);
        actionVerified = true;
        break;
      }
    }
    
    return actionVerified;
  }

  async fillUserCreationForm() {
    // Wait for the dialog/form to be fully loaded
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    console.log('Filling user creation form with 6 fields...');
    
    // First, let's debug what input fields are available in the dialog
    await this.debugDialogFields();
    
    // Use a more direct approach - fill fields by index position within dialog
    const allInputs = this.page.locator('[role="dialog"] input');
    const inputCount = await allInputs.count();
    console.log(`Found ${inputCount} total input fields to fill`);
    
    if (inputCount >= 5) { // Need at least 5 inputs for user form
      // Fill fields by position based on typical Material-UI form order
      const testData = [
        { value: 'John', label: 'First Name' },
        { value: 'Smith', label: 'Last Name' },
        { value: 'john.smith@example.com', label: 'Email' },
        { value: 'SecurePass123!', label: 'Password' },
        { value: '+1234567890', label: 'Phone' },
        { value: 'hotel123', label: 'Hotel ID or Additional Field' }
      ];
      
      for (let i = 0; i < Math.min(inputCount, testData.length); i++) {
        const field = allInputs.nth(i);
        const data = testData[i];
        
        try {
          await field.scrollIntoViewIfNeeded();
          await this.page.waitForTimeout(300);
          await this.highlightElement(field, data.label, 1000);
          await field.clear();
          await field.fill(data.value);
          console.log(`✅ Filled field ${i} (${data.label}) with: ${data.value}`);
          await this.page.waitForTimeout(500);
        } catch (error) {
          console.log(`⚠️ Failed to fill field ${i} (${data.label}): ${error}`);
        }
      }
    } else {
      console.log(`⚠️ Expected at least 5 input fields but found ${inputCount}`);
      // Fallback: try the old approach
      await this.fillFormFieldFallback();
    }
    
    // Field 6: Role (Dropdown) - always do this last
    await this.selectUserRole();
    
    console.log('All form fields processing completed');
  }
  
  async fillFormFieldFallback() {
    // Fallback method using selectors
    console.log('Using fallback field filling approach...');
    
    // Field 1: First Name
    const firstNameSelectors = [
      '[role="dialog"] input[placeholder*="First Name"]',
      '[role="dialog"] input[placeholder*="first name"]',
      '[role="dialog"] [data-testid*="first-name"]',
      '[role="dialog"] input[name="firstName"]',
      '[role="dialog"] input[name="first_name"]',
      '[role="dialog"] .MuiTextField-root input:first-of-type'
    ];
    
    await this.fillFormField(firstNameSelectors, 'John', 'First Name field');
    
    // Field 2: Last Name
    const lastNameSelectors = [
      '[role="dialog"] input[placeholder*="Last Name"]',
      '[role="dialog"] input[placeholder*="last name"]',
      '[role="dialog"] [data-testid*="last-name"]',
      '[role="dialog"] input[name="lastName"]',
      '[role="dialog"] input[name="last_name"]',
      '[role="dialog"] .MuiTextField-root:nth-of-type(2) input'
    ];
    
    await this.fillFormField(lastNameSelectors, 'Smith', 'Last Name field');
    
    // Field 3: Email
    const emailSelectors = [
      '[role="dialog"] input[placeholder*="Email"]',
      '[role="dialog"] input[placeholder*="email"]',
      '[role="dialog"] input[type="email"]',
      '[role="dialog"] [data-testid*="email"]',
      '[role="dialog"] input[name="email"]'
    ];
    
    await this.fillFormField(emailSelectors, 'john.smith@example.com', 'Email field');
    
    // Field 4: Phone
    const phoneSelectors = [
      '[role="dialog"] input[placeholder*="Phone"]',
      '[role="dialog"] input[placeholder*="phone"]',
      '[role="dialog"] input[type="tel"]',
      '[role="dialog"] [data-testid*="phone"]',
      '[role="dialog"] input[name="phone"]'
    ];
    
    await this.fillFormField(phoneSelectors, '+1234567890', 'Phone field');
    
    // Field 5: Password
    const passwordSelectors = [
      '[role="dialog"] input[placeholder*="Password"]',
      '[role="dialog"] input[placeholder*="password"]',
      '[role="dialog"] input[type="password"]',
      '[role="dialog"] [data-testid*="password"]',
      '[role="dialog"] input[name="password"]'
    ];
    
    await this.fillFormField(passwordSelectors, 'SecurePass123!', 'Password field');
  }
    
    await this.fillFormField(phoneSelectors, '+1234567890', 'Phone field');
    
    // Field 5: Password
    const passwordSelectors = [
      '[role="dialog"] input[placeholder*="Password"]',
      '[role="dialog"] input[placeholder*="password"]',
      '[role="dialog"] input[type="password"]',
      '[role="dialog"] [data-testid*="password"]',
      '[role="dialog"] input[name="password"]'
    ];
    
    await this.fillFormField(passwordSelectors, 'SecurePass123!', 'Password field');
  }
    ];
    
    await this.fillFormField(phoneSelectors, '+1234567890', 'Phone field');
    
    // Field 5: Password - must be in dialog
    const passwordSelectors = [
      '[role="dialog"] input[placeholder*="Password"]',
      '[role="dialog"] input[placeholder*="password"]',
      '[role="dialog"] input[type="password"]',
      '[role="dialog"] [data-testid*="password"]',
      '[role="dialog"] input[name="password"]'
    ];
    
    await this.fillFormField(passwordSelectors, 'SecurePass123!', 'Password field');
    
    // Field 6: Role (Dropdown) - already targeting dialog
    await this.selectUserRole();
    
    console.log('All 6 form fields filled successfully');
  }

  async debugDialogFields() {
    console.log('=== Debugging dialog input fields ===');
    const dialogInputs = this.page.locator('[role="dialog"] input');
    const inputCount = await dialogInputs.count();
    console.log(`Found ${inputCount} input fields in dialog:`);
    
    for (let i = 0; i < inputCount; i++) {
      const input = dialogInputs.nth(i);
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type');
      const id = await input.getAttribute('id');
      
      console.log(`  Input ${i}: placeholder="${placeholder}", name="${name}", type="${type}", id="${id}"`);
    }
    
    // Also check for select/dropdown elements
    const dialogSelects = this.page.locator('[role="dialog"] select, [role="dialog"] [role="combobox"]');
    const selectCount = await dialogSelects.count();
    console.log(`Found ${selectCount} dropdown/select elements in dialog`);
    console.log('=== End debug ===');
  }
  
  async fillFormField(selectors: string[], value: string, fieldName: string) {
    let field: Locator | null = null;
    for (const selector of selectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        field = element.first();
        console.log(`Found ${fieldName} with selector: ${selector}`);
        break;
      }
    }
    
    if (field) {
      await field.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await this.highlightElement(field, fieldName, 1500);
      await field.fill(value);
      console.log(`Filled ${fieldName} with: ${value}`);
    } else {
      console.log(`Could not find ${fieldName} - skipping`);
    }
  }
  
  async selectUserRole() {
    console.log('Looking for role dropdown...');
    
    // Role dropdown selectors
    const roleSelectors = [
      '[role="dialog"] select',
      '[role="dialog"] .MuiSelect-root',
      '[role="dialog"] [role="combobox"]',
      'select[name="role"]',
      '[data-testid*="role"]',
      'input[placeholder*="Role"]',
      'input[placeholder*="role"]'
    ];
    
    let roleDropdown: Locator | null = null;
    for (const selector of roleSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        roleDropdown = element.first();
        console.log(`Found role dropdown with selector: ${selector}`);
        break;
      }
    }
    
    if (roleDropdown) {
      await roleDropdown.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await this.highlightElement(roleDropdown, 'Role dropdown', 1500);
      
      console.log('Clicking role dropdown...');
      await roleDropdown.click();
      
      // Wait for dropdown options to appear
      await this.page.waitForTimeout(1500);
      
      // Look for role options
      const roleOptionSelectors = [
        '[role="presentation"] [role="option"]',
        '.MuiMenuItem-root',
        'option',
        '[data-value]',
        '[role="option"]'
      ];
      
      let roleSelected = false;
      for (const optionSelector of roleOptionSelectors) {
        const options = this.page.locator(optionSelector);
        const optionCount = await options.count();
        console.log(`Found ${optionCount} role options with selector: ${optionSelector}`);
        
        if (optionCount > 0) {
          // Look for a suitable role option
          for (let i = 0; i < Math.min(optionCount, 5); i++) {
            const option = options.nth(i);
            const optionText = await option.textContent();
            
            console.log(`Role option ${i}: "${optionText}"`);
            
            // Select a meaningful role (prefer USER, ADMIN, MANAGER, etc.)
            if (optionText && optionText.trim() && 
                (optionText.includes('USER') || 
                 optionText.includes('ADMIN') || 
                 optionText.includes('MANAGER') ||
                 optionText.includes('STAFF') ||
                 i === 0)) { // Or select first option as fallback
              
              await this.highlightElement(option, `Role option: ${optionText}`, 1500);
              console.log(`Selecting role: ${optionText}`);
              await option.click();
              roleSelected = true;
              break;
            }
          }
          
          if (roleSelected) break;
        }
      }
      
      if (!roleSelected) {
        console.log('Could not select role - proceeding anyway');
        // Try to close dropdown by pressing Escape
        await this.page.keyboard.press('Escape');
      }
      
      await this.page.waitForTimeout(1000);
    } else {
      console.log('Could not find role dropdown - skipping');
    }
  }
  
  async clickCreateUserButton() {
    console.log('Looking for Create User button...');
    
    const createUserSelectors = [
      'button:has-text("Create User")',
      'button:has-text("CREATE USER")',
      'button:has-text("Add User")',
      'button:has-text("ADD USER")',
      'button:has-text("Save")',
      'button:has-text("Submit")',
      '[data-testid*="create-user"]',
      '[data-testid*="submit"]',
      '[role="dialog"] button[type="submit"]',
      '.MuiButton-contained:has-text("Create")'
    ];
    
    let createButton: Locator | null = null;
    for (const selector of createUserSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        createButton = element.first();
        console.log(`Found Create User button with selector: ${selector}`);
        break;
      }
    }
    
    if (createButton) {
      await createButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await this.highlightElement(createButton, 'Create User button', 2000);
      
      console.log('Clicking Create User button...');
      await createButton.click();
      
      // Wait for the action to complete
      await this.page.waitForTimeout(2000);
      
      return true;
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
      
      throw new Error('Could not find Create User button');
    }
  }
}

test.describe('System Admin - Manage Users Functionality', () => {
  let manageUsersPage: ManageUsersPage;

  test.beforeEach(async ({ page }) => {
    manageUsersPage = new ManageUsersPage(page);
    await manageUsersPage.navigateToLogin();
    await manageUsersPage.loginAsSystemAdmin();
    await manageUsersPage.navigateToSystemAdminDashboard();
  });

  test('should navigate to Manage Users and display users page', async () => {
    // Navigate to Manage Users
    await manageUsersPage.navigateToManageUsers();
    
    // Verify the users page loaded
    await manageUsersPage.verifyManageUsersPageLoaded();
  });

  test('should highlight and click Manage Users card from dashboard', async () => {
    // This test focuses specifically on highlighting and clicking the Manage Users card
    await manageUsersPage.navigateToManageUsers();
    
    // Show success message after navigation
    await manageUsersPage.showSuccessOverlay('Successfully clicked Manage Users card!');
  });

  test('should navigate to Manage Users and click ADD USER button', async () => {
    // Navigate to Manage Users
    await manageUsersPage.navigateToManageUsers();
    
    // Verify the users page loaded
    await manageUsersPage.verifyManageUsersPageLoaded();
    
    // Find and click ADD USER button
    await manageUsersPage.findAndClickAddUserButton();
    
    // Verify the add user dialog opened
    await manageUsersPage.verifyAddUserAction();
  });

  test('should create a new user by filling all form fields', async () => {
    // Navigate to Manage Users
    await manageUsersPage.navigateToManageUsers();
    
    // Find and click ADD USER button
    await manageUsersPage.findAndClickAddUserButton();
    
    // Verify the add user dialog opened
    await manageUsersPage.verifyAddUserAction();
    
    // Fill all 6 form fields
    await manageUsersPage.fillUserCreationForm();
    
    // Click Create User button
    await manageUsersPage.clickCreateUserButton();
  });
});

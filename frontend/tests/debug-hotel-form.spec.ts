import { test, expect } from '@playwright/test';

test.describe('Debug Hotel Registration Form', () => {
  test('should identify all available fields in hotel registration dialog', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Login as system admin
    await page.fill('input[name="email"]', 'system@admin.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Navigate to hotel management
    await page.click('[data-testid="stats-card-manage-hotels"]');
    await page.waitForLoadState('networkidle');
    
    // Find and click Register Hotel button
    const buttons = await page.locator('button').all();
    let registerButtonFound = false;
    
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && (text.includes('Register Hotel') || text.includes('Add Hotel'))) {
        await button.click();
        await page.waitForTimeout(1000);
        registerButtonFound = true;
        break;
      }
    }
    
    if (!registerButtonFound) {
      throw new Error('Register Hotel button not found');
    }
    
    // Wait for dialog
    await page.waitForSelector('div[role="dialog"]', { state: 'visible' });
    
    // Count and log all input types
    const textInputs = await page.locator('div[role="dialog"] input[type="text"]').count();
    const emailInputs = await page.locator('div[role="dialog"] input[type="email"]').count();
    const telInputs = await page.locator('div[role="dialog"] input[type="tel"]').count();
    const urlInputs = await page.locator('div[role="dialog"] input[type="url"]').count();
    const numberInputs = await page.locator('div[role="dialog"] input[type="number"]').count();
    const timeInputs = await page.locator('div[role="dialog"] input[type="time"]').count();
    const passwordInputs = await page.locator('div[role="dialog"] input[type="password"]').count();
    const textareas = await page.locator('div[role="dialog"] textarea').count();
    const selects = await page.locator('div[role="dialog"] select').count();
    const allInputs = await page.locator('div[role="dialog"] input').count();
    
    console.log('=== HOTEL REGISTRATION FORM ANALYSIS ===');
    console.log(`Text inputs: ${textInputs}`);
    console.log(`Email inputs: ${emailInputs}`);
    console.log(`Tel inputs: ${telInputs}`);
    console.log(`URL inputs: ${urlInputs}`);
    console.log(`Number inputs: ${numberInputs}`);
    console.log(`Time inputs: ${timeInputs}`);
    console.log(`Password inputs: ${passwordInputs}`);
    console.log(`Textareas: ${textareas}`);
    console.log(`Select dropdowns: ${selects}`);
    console.log(`All inputs total: ${allInputs}`);
    console.log(`Total form fields: ${allInputs + textareas + selects}`);
    
    // Get field labels/placeholders
    const allFormInputs = await page.locator('div[role="dialog"] input, div[role="dialog"] textarea, div[role="dialog"] select').all();
    
    console.log('\n=== FIELD DETAILS ===');
    for (let i = 0; i < allFormInputs.length; i++) {
      const field = allFormInputs[i];
      const tagName = await field.evaluate(el => el.tagName.toLowerCase());
      const type = await field.evaluate(el => el.getAttribute('type') || el.tagName.toLowerCase());
      const name = await field.evaluate(el => el.getAttribute('name') || '');
      const placeholder = await field.evaluate(el => el.getAttribute('placeholder') || '');
      const id = await field.evaluate(el => el.getAttribute('id') || '');
      
      console.log(`Field ${i + 1}: ${tagName}[type="${type}"] name="${name}" placeholder="${placeholder}" id="${id}"`);
    }
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'hotel-form-debug.png', fullPage: true });
    
    // Verify we have some form fields
    expect(allInputs + textareas + selects).toBeGreaterThan(0);
  });
});

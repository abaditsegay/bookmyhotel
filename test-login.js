const { chromium } = require('playwright');

async function testLogin() {
  console.log('🚀 Starting UI login test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📝 Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Check if we're redirected to login or can access login
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (!currentUrl.includes('/login')) {
      console.log('🔄 Navigating to login page...');
      await page.goto('http://localhost:3000/login');
      await page.waitForTimeout(2000);
    }
    
    // Test System Administrator
    console.log('\n🔧 Testing System Administrator login...');
    
    // Click the System Administrator button to auto-fill
    const systemAdminButton = page.locator('button:has-text("System Administrator")');
    await systemAdminButton.click();
    await page.waitForTimeout(1000);
    
    // Check if fields are filled
    const emailValue = await page.locator('input[data-testid="email-input"]').inputValue();
    const passwordValue = await page.locator('input[data-testid="password-input"]').inputValue();
    
    console.log('📧 Email filled:', emailValue);
    console.log('🔑 Password filled:', passwordValue.replace(/./g, '*'));
    
    // Submit the form
    console.log('🚀 Submitting login form...');
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation or error
    try {
      await page.waitForURL('**/system-dashboard**', { timeout: 10000 });
      console.log('✅ Successfully logged in as System Administrator!');
      console.log('📍 Redirected to:', page.url());
    } catch (e) {
      console.log('❌ Login failed or timeout');
      console.log('📍 Current URL:', page.url());
      
      // Check for error messages
      const errorElements = await page.locator('[role="alert"], .MuiAlert-message, [data-testid*="error"]').all();
      for (const error of errorElements) {
        const errorText = await error.textContent();
        if (errorText && errorText.trim()) {
          console.log('❌ Error message:', errorText);
        }
      }
    }
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin().catch(console.error);

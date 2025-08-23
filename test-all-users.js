const { chromium } = require('playwright');

async function testAllUsers() {
  console.log('🚀 Starting comprehensive UI login test...');
  
  const browser = await chromium.launch({ headless: false });
  
  const testUsers = [
    { name: 'System Administrator', buttonText: 'System Administrator' },
    { name: 'Hotel Administrator', buttonText: 'Hotel Administrator' },
    { name: 'Front Desk Staff', buttonText: 'Front Desk Staff' },
    { name: 'Regular Customer', buttonText: 'Regular Customer' },
    { name: 'Guest User', buttonText: 'Guest User' }
  ];
  
  for (const user of testUsers) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Testing: ${user.name}`);
    console.log(`${'='.repeat(50)}`);
    
    const page = await browser.newPage();
    
    try {
      // Navigate to login page
      await page.goto('http://localhost:3000/login');
      await page.waitForTimeout(2000);
      
      // Find and click the user button
      const userButton = page.locator(`button:has-text("${user.buttonText}")`);
      await userButton.click();
      await page.waitForTimeout(1000);
      
      // Get filled credentials
      const emailValue = await page.locator('input[data-testid="email-input"]').inputValue();
      const passwordValue = await page.locator('input[data-testid="password-input"]').inputValue();
      
      console.log('📧 Email:', emailValue);
      console.log('🔑 Password:', passwordValue.replace(/./g, '*'));
      
      // Submit login
      await page.click('[data-testid="login-button"]');
      
      // Wait for navigation (with different expected URLs)
      try {
        await page.waitForNavigation({ timeout: 10000 });
        console.log('✅ Login successful!');
        console.log('📍 Redirected to:', page.url());
        
        // Check for any dashboard elements
        const dashboardElements = await page.locator('[data-testid*="dashboard"], h1, h2, h3').first().textContent();
        if (dashboardElements) {
          console.log('🎯 Dashboard content found:', dashboardElements);
        }
        
      } catch (e) {
        console.log('❌ Login failed or timeout');
        console.log('📍 Current URL:', page.url());
        
        // Check for error messages
        const errorElements = await page.locator('[role="alert"], .MuiAlert-message').all();
        for (const error of errorElements) {
          const errorText = await error.textContent();
          if (errorText && errorText.trim()) {
            console.log('❌ Error:', errorText);
          }
        }
      }
      
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.error(`💥 Test failed for ${user.name}:`, error.message);
    } finally {
      await page.close();
    }
  }
  
  await browser.close();
  console.log('\n🏁 All tests completed!');
}

testAllUsers().catch(console.error);

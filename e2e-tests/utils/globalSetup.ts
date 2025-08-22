/**
 * Global setup for E2E tests
 * Runs once before all tests to prepare the environment
 */

import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');
  
  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Check if the application is running
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    console.log(`🔍 Checking if application is available at ${baseURL}`);
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    console.log('✅ Application is running and accessible');
    
    // You can add more setup steps here:
    // - Database seeding
    // - User creation
    // - Test data preparation
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('✅ Global setup completed successfully');
}

export default globalSetup;

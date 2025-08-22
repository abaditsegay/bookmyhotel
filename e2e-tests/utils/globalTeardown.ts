/**
 * Global teardown for E2E tests
 * Runs once after all tests to clean up the environment
 */

import type { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test global teardown...');
  
  try {
    // Add cleanup steps here:
    // - Clear test data
    // - Reset database state
    // - Remove temporary files
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

export default globalTeardown;

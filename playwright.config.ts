import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for BookMyHotel E2E Tests
 * Focuses on System Admin workflows with comprehensive coverage
 */
export default defineConfig({
  testDir: './e2e-tests',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'e2e-tests/test-results/html-report' }],
    ['json', { outputFile: 'e2e-tests/test-results/results.json' }],
    ['junit', { outputFile: 'e2e-tests/test-results/results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Capture screenshots on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for each action (e.g., click, fill, etc.) */
    actionTimeout: 10000,
    
    /* Global timeout for navigation actions */
    navigationTimeout: 30000,
  },
  
  /* Configure projects for major browsers */
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },
    
    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.cleanup\.ts/,
    },
    
    // System Admin tests
    {
      name: 'system-admin-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e-tests/auth/system-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*system-admin\.spec\.ts/,
    },
    {
      name: 'system-admin-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'e2e-tests/auth/system-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*system-admin\.spec\.ts/,
    },
    {
      name: 'system-admin-webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'e2e-tests/auth/system-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*system-admin\.spec\.ts/,
    },
    
    // Hotel Admin tests
    {
      name: 'hotel-admin-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e-tests/auth/hotel-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*hotel-admin\.spec\.ts/,
    },
    {
      name: 'hotel-admin-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'e2e-tests/auth/hotel-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*hotel-admin\.spec\.ts/,
    },
    {
      name: 'hotel-admin-webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'e2e-tests/auth/hotel-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*hotel-admin\.spec\.ts/,
    },
    
    // Front Desk tests
    {
      name: 'frontdesk-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e-tests/auth/frontdesk.json'
      },
      dependencies: ['setup'],
      testMatch: /.*frontdesk\.spec\.ts/,
    },
    {
      name: 'frontdesk-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'e2e-tests/auth/frontdesk.json'
      },
      dependencies: ['setup'],
      testMatch: /.*frontdesk\.spec\.ts/,
    },
    {
      name: 'frontdesk-webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'e2e-tests/auth/frontdesk.json'
      },
      dependencies: ['setup'],
      testMatch: /.*frontdesk\.spec\.ts/,
    },
    
    // Customer tests
    {
      name: 'customer-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e-tests/auth/customer.json'
      },
      dependencies: ['setup'],
      testMatch: /.*customer\.spec\.ts/,
    },
    {
      name: 'customer-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'e2e-tests/auth/customer.json'
      },
      dependencies: ['setup'],
      testMatch: /.*customer\.spec\.ts/,
    },
    {
      name: 'customer-webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'e2e-tests/auth/customer.json'
      },
      dependencies: ['setup'],
      testMatch: /.*customer\.spec\.ts/,
    },
    
    // Public/Guest tests (no authentication)
    {
      name: 'public-chromium',
      use: devices['Desktop Chrome'],
      dependencies: ['setup'],
      testMatch: /.*public\.spec\.ts/,
    },
    {
      name: 'public-firefox',
      use: devices['Desktop Firefox'],
      dependencies: ['setup'],
      testMatch: /.*public\.spec\.ts/,
    },
    {
      name: 'public-webkit',
      use: devices['Desktop Safari'],
      dependencies: ['setup'],
      testMatch: /.*public\.spec\.ts/,
    },
    
    // Cross-role integration tests
    {
      name: 'integration-chromium',
      use: devices['Desktop Chrome'],
      dependencies: ['setup'],
      testMatch: /.*integration\.spec\.ts/,
    },
    
    // Mobile testing
    {
      name: 'mobile-system-admin',
      use: { 
        ...devices['iPhone 13'],
        storageState: 'e2e-tests/auth/system-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*mobile\.spec\.ts/,
    },
    {
      name: 'mobile-customer',
      use: { 
        ...devices['iPhone 13'],
        storageState: 'e2e-tests/auth/customer.json'
      },
      dependencies: ['setup'],
      testMatch: /.*mobile\.spec\.ts/,
    },
  ],
  
  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd frontend && npm start',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=test',
      port: 8080,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e-tests/utils/globalSetup.ts'),
  globalTeardown: require.resolve('./e2e-tests/utils/globalTeardown.ts'),
  
  /* Test timeout */
  timeout: 60000,
  
  /* Expect timeout */
  expect: {
    timeout: 10000,
  },
});

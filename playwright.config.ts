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
    
    // System Admin tests on Chromium
    {
      name: 'system-admin-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e-tests/auth/system-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*system-admin\.spec\.ts/,
    },
    
    // System Admin tests on Firefox
    {
      name: 'system-admin-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'e2e-tests/auth/system-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*system-admin\.spec\.ts/,
    },
    
    // System Admin tests on WebKit (Safari)
    {
      name: 'system-admin-webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'e2e-tests/auth/system-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*system-admin\.spec\.ts/,
    },
    
    // Mobile testing (optional)
    {
      name: 'system-admin-mobile',
      use: { 
        ...devices['iPhone 13'],
        storageState: 'e2e-tests/auth/system-admin.json'
      },
      dependencies: ['setup'],
      testMatch: /.*system-admin\.spec\.ts/,
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

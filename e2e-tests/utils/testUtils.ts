/**
 * E2E Test Utilities
 * Common helper functions for System Admin E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for network to be idle (no requests for specified time)
 */
export async function waitForNetworkIdle(page: Page, timeout = 2000): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(timeout);
}

/**
 * Take a screenshot with a custom name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true
  });
}

/**
 * Verify element text contains expected value (case insensitive)
 */
export async function verifyTextContains(
  page: Page, 
  selector: string, 
  expectedText: string
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  
  const actualText = await element.textContent();
  expect(actualText?.toLowerCase()).toContain(expectedText.toLowerCase());
}

/**
 * Fill form field and verify value was set
 */
export async function fillAndVerify(
  page: Page, 
  selector: string, 
  value: string
): Promise<void> {
  const field = page.locator(selector);
  await field.fill(value);
  await expect(field).toHaveValue(value);
}

/**
 * Click and wait for navigation
 */
export async function clickAndWaitForNavigation(
  page: Page, 
  selector: string, 
  expectedUrl?: string | RegExp
): Promise<void> {
  const element = page.locator(selector);
  await element.click();
  
  if (expectedUrl) {
    await expect(page).toHaveURL(expectedUrl);
  }
  
  await waitForNetworkIdle(page);
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Check if element exists without throwing error
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'attached', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get table data as array of objects
 */
export async function getTableData(
  page: Page, 
  tableSelector: string,
  headerSelector: string = 'th',
  rowSelector: string = 'tbody tr'
): Promise<Record<string, string>[]> {
  const table = page.locator(tableSelector);
  await table.waitFor({ state: 'visible' });
  
  // Get headers
  const headers = await table.locator(headerSelector).allTextContents();
  
  // Get rows
  const rows = table.locator(rowSelector);
  const rowCount = await rows.count();
  
  const data: Record<string, string>[] = [];
  
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const cells = await row.locator('td').allTextContents();
    
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (cells[index] !== undefined) {
        rowData[header.trim()] = cells[index].trim();
      }
    });
    
    data.push(rowData);
  }
  
  return data;
}

/**
 * Validate form field has expected attributes
 */
export async function validateFormField(
  page: Page,
  selector: string,
  expectedAttributes: Record<string, string | boolean>
): Promise<void> {
  const field = page.locator(selector);
  await expect(field).toBeVisible();
  
  for (const [attribute, expectedValue] of Object.entries(expectedAttributes)) {
    if (typeof expectedValue === 'boolean') {
      if (expectedValue) {
        await expect(field).toHaveAttribute(attribute);
      } else {
        await expect(field).not.toHaveAttribute(attribute);
      }
    } else {
      await expect(field).toHaveAttribute(attribute, expectedValue);
    }
  }
}

/**
 * Wait for specific API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  timeout = 10000
): Promise<void> {
  await page.waitForResponse(
    response => {
      const url = response.url();
      const matchesUrl = typeof urlPattern === 'string' 
        ? url.includes(urlPattern)
        : urlPattern.test(url);
      
      return matchesUrl && response.request().method() === method;
    },
    { timeout }
  );
}

/**
 * Get current timestamp for unique test data
 */
export function getTestTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}@test.bookmyhotel.com`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
}

/**
 * Format currency value for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[$,]/g, ''));
}

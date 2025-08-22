import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object Model
 * Contains common functionality shared across all pages
 */
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot with a custom name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `e2e-tests/test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout: number = 10000): Promise<void> {
    await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for element to be enabled
   */
  async waitForElementEnabled(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
    await expect(this.page.locator(selector)).toBeEnabled({ timeout });
  }

  /**
   * Get text content of element
   */
  async getTextContent(selector: string): Promise<string> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return await element.textContent() || '';
  }

  /**
   * Get multiple text contents
   */
  async getMultipleTextContents(selector: string): Promise<string[]> {
    await this.page.locator(selector).first().waitFor({ state: 'visible' });
    return await this.page.locator(selector).allTextContents();
  }
}

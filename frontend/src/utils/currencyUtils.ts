/**
 * Currency formatting utilities for the booking application
 */

/**
 * Format currency amount with thousand separators in ETB
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "ETB 5,670")
 */
export const formatCurrency = (amount: number): string => {
  return `ETB ${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })}`;
};

/**
 * Format currency amount using browser's Intl.NumberFormat (for forms/detailed displays)
 * @param amount - The amount to format
 * @returns Formatted currency string using browser's locale
 */
export const formatCurrencyIntl = (amount: number): string => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
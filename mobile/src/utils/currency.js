/**
 * Currency Utility Functions
 * Handles currency formatting and parsing for Ethiopian Birr (ETB)
 */

/**
 * Format amount as Ethiopian Birr
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show currency symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? 'ETB 0.00' : '0.00';
  }

  const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `ETB ${formattedAmount}` : formattedAmount;
};

/**
 * Format amount as compact Ethiopian Birr (for large numbers)
 * @param {number} amount - The amount to format
 * @returns {string} Compact formatted currency string
 */
export const formatCurrencyCompact = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'ETB 0';
  }

  if (amount >= 1000000) {
    return `ETB ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `ETB ${(amount / 1000).toFixed(1)}K`;
  }

  return formatCurrency(amount);
};

/**
 * Parse formatted currency string to number
 * @param {string} formattedAmount - Formatted currency string
 * @returns {number} Parsed amount
 */
export const parseCurrency = (formattedAmount) => {
  if (!formattedAmount) return 0;
  
  const cleaned = formattedAmount.toString().replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Calculate percentage of amount
 * @param {number} amount - Base amount
 * @param {number} percentage - Percentage to calculate
 * @returns {number} Calculated percentage amount
 */
export const calculatePercentage = (amount, percentage) => {
  return (amount * percentage) / 100;
};

/**
 * Format price breakdown for display
 * @param {Object} breakdown - Price breakdown object
 * @returns {Object} Formatted breakdown
 */
export const formatPriceBreakdown = (breakdown) => {
  const {
    basePrice = 0,
    nights = 1,
    taxRate = 0,
    serviceFee = 0,
    discount = 0,
  } = breakdown;

  const subtotal = basePrice * nights;
  const taxAmount = calculatePercentage(subtotal, taxRate);
  const discountAmount = calculatePercentage(subtotal, discount);
  const total = subtotal + taxAmount + serviceFee - discountAmount;

  return {
    basePrice: formatCurrency(basePrice),
    basePriceRaw: basePrice,
    nights,
    subtotal: formatCurrency(subtotal),
    subtotalRaw: subtotal,
    taxRate: `${taxRate}%`,
    taxAmount: formatCurrency(taxAmount),
    taxAmountRaw: taxAmount,
    serviceFee: formatCurrency(serviceFee),
    serviceFeeRaw: serviceFee,
    discount: discount > 0 ? formatCurrency(discountAmount) : null,
    discountRaw: discountAmount,
    total: formatCurrency(total),
    totalRaw: total,
  };
};

/**
 * Validate currency amount
 * @param {number} amount - Amount to validate
 * @param {number} min - Minimum allowed amount
 * @param {number} max - Maximum allowed amount
 * @returns {Object} Validation result
 */
export const validateAmount = (amount, min = 0, max = Infinity) => {
  const numAmount = typeof amount === 'string' ? parseCurrency(amount) : amount;

  if (isNaN(numAmount)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (numAmount < min) {
    return { valid: false, error: `Amount must be at least ${formatCurrency(min)}` };
  }

  if (numAmount > max) {
    return { valid: false, error: `Amount cannot exceed ${formatCurrency(max)}` };
  }

  return { valid: true, amount: numAmount };
};

/**
 * Currency constants
 */
export const CURRENCY = {
  CODE: 'ETB',
  SYMBOL: 'ETB',
  NAME: 'Ethiopian Birr',
  LOCALE: 'am-ET',
  DECIMAL_PLACES: 2,
};

export default {
  formatCurrency,
  formatCurrencyCompact,
  parseCurrency,
  calculatePercentage,
  formatPriceBreakdown,
  validateAmount,
  CURRENCY,
};

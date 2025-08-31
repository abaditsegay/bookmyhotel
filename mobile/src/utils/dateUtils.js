import { format, addDays, differenceInDays, parseISO, isValid } from 'date-fns';

/**
 * Date utility functions using date-fns
 */

// Re-export commonly used functions from date-fns
export { addDays } from 'date-fns';

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} formatString - Format pattern
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatString) : '';
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Format date for display (alias for formatDate with default format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date) => {
  return formatDate(date, 'MMM dd, yyyy');
};

/**
 * Format date for API (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} API formatted date string
 */
export const formatDateForAPI = (date) => {
  return formatDate(date, 'yyyy-MM-dd');
};

/**
 * Get today's date
 * @returns {Date} Today's date
 */
export const getToday = () => {
  return new Date();
};

/**
 * Get tomorrow's date
 * @returns {Date} Tomorrow's date
 */
export const getTomorrow = () => {
  return addDays(new Date(), 1);
};

/**
 * Get date after specified days
 * @param {number} days - Number of days to add
 * @param {Date} fromDate - Starting date (default: today)
 * @returns {Date} Future date
 */
export const getDateAfterDays = (days, fromDate = new Date()) => {
  return addDays(fromDate, days);
};

/**
 * Calculate number of nights between two dates
 * @param {Date|string} checkin - Check-in date
 * @param {Date|string} checkout - Check-out date
 * @returns {number} Number of nights
 */
export const calculateNights = (checkin, checkout) => {
  try {
    const checkinDate = typeof checkin === 'string' ? parseISO(checkin) : checkin;
    const checkoutDate = typeof checkout === 'string' ? parseISO(checkout) : checkout;
    
    if (!isValid(checkinDate) || !isValid(checkoutDate)) {
      return 0;
    }
    
    const nights = differenceInDays(checkoutDate, checkinDate);
    return nights > 0 ? nights : 0;
  } catch (error) {
    console.error('Error calculating nights:', error);
    return 0;
  }
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is today
 */
export const isToday = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    
    return dateObj.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is past date
 */
export const isPastDate = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  } catch (error) {
    return false;
  }
};

/**
 * Get default check-in date (today or tomorrow if past cutoff time)
 * @param {number} cutoffHour - Hour after which to use tomorrow (default: 18)
 * @returns {Date} Default check-in date
 */
export const getDefaultCheckinDate = (cutoffHour = 18) => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // If it's after cutoff time, default to tomorrow
  return currentHour >= cutoffHour ? getTomorrow() : getToday();
};

/**
 * Get default check-out date (day after check-in)
 * @param {Date|string} checkinDate - Check-in date
 * @returns {Date} Default check-out date
 */
export const getDefaultCheckoutDate = (checkinDate) => {
  try {
    const checkin = typeof checkinDate === 'string' ? parseISO(checkinDate) : checkinDate;
    return addDays(checkin, 1);
  } catch (error) {
    return addDays(getToday(), 1);
  }
};

/**
 * Format date range for display
 * @param {Date|string} checkin - Check-in date
 * @param {Date|string} checkout - Check-out date
 * @returns {string} Formatted date range
 */
export const formatDateRange = (checkin, checkout) => {
  try {
    const checkinFormatted = formatDate(checkin, 'MMM dd');
    const checkoutFormatted = formatDate(checkout, 'MMM dd, yyyy');
    const nights = calculateNights(checkin, checkout);
    
    return `${checkinFormatted} - ${checkoutFormatted} (${nights} night${nights !== 1 ? 's' : ''})`;
  } catch (error) {
    return '';
  }
};

/**
 * Validate date range for booking
 * @param {Date|string} checkin - Check-in date
 * @param {Date|string} checkout - Check-out date
 * @returns {Object} Validation result
 */
export const validateDateRange = (checkin, checkout) => {
  const result = {
    isValid: true,
    errors: [],
  };

  try {
    const checkinDate = typeof checkin === 'string' ? parseISO(checkin) : checkin;
    const checkoutDate = typeof checkout === 'string' ? parseISO(checkout) : checkout;

    // Check if dates are valid
    if (!isValid(checkinDate)) {
      result.isValid = false;
      result.errors.push('Invalid check-in date');
    }

    if (!isValid(checkoutDate)) {
      result.isValid = false;
      result.errors.push('Invalid check-out date');
    }

    if (!result.isValid) return result;

    // Check if check-in is in the past
    if (isPastDate(checkinDate)) {
      result.isValid = false;
      result.errors.push('Check-in date cannot be in the past');
    }

    // Check if check-out is after check-in
    if (checkoutDate <= checkinDate) {
      result.isValid = false;
      result.errors.push('Check-out date must be after check-in date');
    }

    // Check if stay is too long (e.g., more than 30 days)
    const nights = calculateNights(checkinDate, checkoutDate);
    if (nights > 30) {
      result.isValid = false;
      result.errors.push('Maximum stay is 30 nights');
    }

  } catch (error) {
    result.isValid = false;
    result.errors.push('Invalid date format');
  }

  return result;
};

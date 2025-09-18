/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Formats a date string for HTML date input (YYYY-MM-DD format)
 * Handles timezone issues by using local date without time zone conversion
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  // If the date is already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // For ISO strings or other formats, extract just the date part
  // This prevents timezone conversion issues
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string for display (localized format)
 * Uses consistent formatting for display purposes
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // For display, we want to show the actual date without timezone conversion
  // If it's in YYYY-MM-DD format, create date with local timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString();
  }
  
  // For other formats, use standard conversion but be careful about timezone
  return new Date(dateString).toLocaleDateString();
};

/**
 * Ensures a date string is in YYYY-MM-DD format for API calls
 */
export const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  
  // If already in correct format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Convert to YYYY-MM-DD format
  return formatDateForInput(dateString);
};

/**
 * Checks if two date strings represent the same date
 * regardless of format differences
 */
export const isSameDate = (date1: string, date2: string): boolean => {
  if (!date1 || !date2) return false;
  
  const normalized1 = formatDateForInput(date1);
  const normalized2 = formatDateForInput(date2);
  
  return normalized1 === normalized2;
};
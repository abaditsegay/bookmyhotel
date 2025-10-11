/**
 * Date utility functions for consistent date handling across the application
 * Since all dates come from date pickers, these focus on formatting and calculation
 */
import dayjs, { Dayjs } from 'dayjs';

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
  
  // If it's an ISO string or has time info, extract just the date part
  if (dateString.includes('T') || dateString.includes(' ')) {
    const dateOnly = dateString.split('T')[0].split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return dateOnly;
    }
  }
  
  // For other formats, extract date components manually to avoid timezone issues
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // Return empty if invalid
  
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
  
  // Extract date part from any format to avoid timezone issues
  let dateOnly: string;
  
  // If it's in YYYY-MM-DD format, use as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    dateOnly = dateString;
  } 
  // If it's an ISO string or has time info, extract just the date part
  else if (dateString.includes('T') || dateString.includes(' ')) {
    dateOnly = dateString.split('T')[0].split(' ')[0];
  }
  // For other formats, try to convert to YYYY-MM-DD first
  else {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dateOnly = `${year}-${month}-${day}`;
  }
  
  // Always create date using local timezone to avoid off-by-one issues
  const [year, month, day] = dateOnly.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.toLocaleDateString();
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

/**
 * Calculate number of nights between two dates
 * Uses dayjs for consistent calculation
 */
export const calculateNights = (checkInDate: string | Dayjs, checkOutDate: string | Dayjs): number => {
  const checkIn = typeof checkInDate === 'string' ? dayjs(checkInDate) : checkInDate;
  const checkOut = typeof checkOutDate === 'string' ? dayjs(checkOutDate) : checkOutDate;
  
  if (!checkIn.isValid() || !checkOut.isValid()) {
    return 0; // Return 0 for invalid dates instead of throwing
  }
  
  const nights = checkOut.diff(checkIn, 'day');
  return Math.max(0, nights); // Ensure non-negative result
};

/**
 * Get default booking dates (tomorrow and day after)
 */
export const getDefaultBookingDates = () => {
  const checkIn = dayjs().add(1, 'day');
  const checkOut = checkIn.add(1, 'day');
  
  return {
    checkInDate: checkIn,
    checkOutDate: checkOut,
    checkInString: checkIn.format('YYYY-MM-DD'),
    checkOutString: checkOut.format('YYYY-MM-DD'),
    nights: 1
  };
};

/**
 * Format date for display with time
 */
export const formatDateTimeForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleString();
};

/**
 * Check if a date is within peak season (configurable months)
 */
export const isWithinPeakSeason = (checkInDate: string | Dayjs, checkOutDate: string | Dayjs, peakMonths: number[] = [6, 7, 8, 12]): boolean => {
  const checkIn = typeof checkInDate === 'string' ? dayjs(checkInDate) : checkInDate;
  const checkOut = typeof checkOutDate === 'string' ? dayjs(checkOutDate) : checkOutDate;
  
  if (!checkIn.isValid() || !checkOut.isValid()) {
    return false;
  }
  
  let current = checkIn;
  while (current.isBefore(checkOut) || current.isSame(checkOut, 'day')) {
    if (peakMonths.includes(current.month() + 1)) { // dayjs months are 0-indexed
      return true;
    }
    current = current.add(1, 'day');
  }
  
  return false;
};
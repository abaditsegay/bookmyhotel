/**
 * Phone number formatting utilities for Ethiopian phone numbers
 */

/**
 * Format Ethiopian phone number to +251 912 345678 format
 * @param phoneNumber - Raw phone number (can be 09xxxxxxxx, 9xxxxxxxx, +251xxxxxxxxx, etc.)
 * @returns Formatted phone number (+251 912 345678) or original if invalid
 */
export const formatEthiopianPhone = (phoneNumber: string | null | undefined): string => {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');

  // Handle different input formats
  if (digits.startsWith('251')) {
    // International format: remove country code
    digits = digits.substring(3);
  } else if (digits.startsWith('0')) {
    // National format: remove leading 0
    digits = digits.substring(1);
  }

  // Format all phone numbers consistently: +251 XXX XXXXXX
  // Works for both mobile (9 digits) and landline (9-10 digits)
  if (digits.length === 9) {
    // 9 digits: +251 912 345678 or +251 111 234567
    return `+251 ${digits.substring(0, 3)} ${digits.substring(3)}`;
  }
  
  if (digits.length === 10) {
    // 10 digits (landline with extra digit): +251 111 2345678
    return `+251 ${digits.substring(0, 3)} ${digits.substring(3)}`;
  }

  // If doesn't match expected format, return formatted with country code
  if (digits.length >= 9) {
    return `+251 ${digits.substring(0, 3)} ${digits.substring(3)}`;
  }

  // Return original if too short
  return phoneNumber;
};

/**
 * Validate Ethiopian phone number
 * @param phoneNumber - Phone number to validate
 * @returns true if valid Ethiopian mobile number
 */
export const isValidEthiopianPhone = (phoneNumber: string): boolean => {
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Check for valid Ethiopian mobile patterns:
  // 09xxxxxxxx (10 digits starting with 09)
  // 9xxxxxxxx (9 digits starting with 9)
  // 2519xxxxxxxx (12 digits starting with 2519)
  return (
    (digits.length === 10 && digits.startsWith('09')) ||
    (digits.length === 9 && digits.startsWith('9')) ||
    (digits.length === 12 && digits.startsWith('2519'))
  );
};

/**
 * Normalize Ethiopian phone number for storage (always adds +251 prefix)
 * @param phoneNumber - Raw phone number input
 * @returns Normalized phone number with +251 prefix (e.g., +251911123455)
 */
export const normalizeEthiopianPhone = (phoneNumber: string | null | undefined): string => {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');

  // Handle different input formats
  if (digits.startsWith('251')) {
    // Already has country code, just add +
    return `+${digits}`;
  } else if (digits.startsWith('0')) {
    // National format: remove leading 0 and add +251
    digits = digits.substring(1);
    return `+251${digits}`;
  } else if (digits.startsWith('9') || digits.startsWith('1')) {
    // No prefix, add +251
    return `+251${digits}`;
  }

  // Default: add +251
  return `+251${digits}`;
};

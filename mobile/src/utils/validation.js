/**
 * Validation utility functions
 */

/**
 * Email validation (alias for backward compatibility)
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const validateEmail = (email) => {
  return isValidEmail(email);
};

/**
 * Phone validation (alias for backward compatibility)
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid phone
 */
export const validatePhone = (phone) => {
  return isValidPhone(phone);
};

/**
 * Email validation
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone number validation (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it has 10-15 digits
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Name validation
 * @param {string} name - Name to validate
 * @returns {boolean} Is valid name
 */
export const isValidName = (name) => {
  return name && name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
};

/**
 * Date validation
 * @param {string} dateString - Date string to validate
 * @returns {boolean} Is valid date
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Check if date is in the future
 * @param {string} dateString - Date string to check
 * @returns {boolean} Is future date
 */
export const isFutureDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

/**
 * Check if checkout date is after checkin date
 * @param {string} checkin - Check-in date
 * @param {string} checkout - Check-out date
 * @returns {boolean} Is valid date range
 */
export const isValidDateRange = (checkin, checkout) => {
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  return checkoutDate > checkinDate;
};

/**
 * Guest count validation
 * @param {number} guests - Number of guests
 * @param {number} maxGuests - Maximum allowed guests
 * @returns {boolean} Is valid guest count
 */
export const isValidGuestCount = (guests, maxGuests = 10) => {
  return Number.isInteger(guests) && guests >= 1 && guests <= maxGuests;
};

/**
 * Room count validation
 * @param {number} rooms - Number of rooms
 * @param {number} maxRooms - Maximum allowed rooms
 * @returns {boolean} Is valid room count
 */
export const isValidRoomCount = (rooms, maxRooms = 5) => {
  return Number.isInteger(rooms) && rooms >= 1 && rooms <= maxRooms;
};

/**
 * Comprehensive form validation
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with errors
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];

    // Required field validation
    if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = fieldRules.requiredMessage || `${field} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) {
      return;
    }

    // Type-specific validations
    if (fieldRules.type === 'email' && !isValidEmail(value)) {
      errors[field] = fieldRules.invalidMessage || 'Please enter a valid email address';
    } else if (fieldRules.type === 'phone' && !isValidPhone(value)) {
      errors[field] = fieldRules.invalidMessage || 'Please enter a valid phone number';
    } else if (fieldRules.type === 'name' && !isValidName(value)) {
      errors[field] = fieldRules.invalidMessage || 'Please enter a valid name';
    } else if (fieldRules.type === 'date' && !isValidDate(value)) {
      errors[field] = fieldRules.invalidMessage || 'Please enter a valid date';
    } else if (fieldRules.type === 'futureDate' && (!isValidDate(value) || !isFutureDate(value))) {
      errors[field] = fieldRules.invalidMessage || 'Please select a future date';
    }

    // Length validations
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = fieldRules.minLengthMessage || `Minimum ${fieldRules.minLength} characters required`;
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = fieldRules.maxLengthMessage || `Maximum ${fieldRules.maxLength} characters allowed`;
    }

    // Custom validation function
    if (fieldRules.custom && !fieldRules.custom(value, formData)) {
      errors[field] = fieldRules.customMessage || 'Invalid value';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Search form validation
 * @param {Object} searchData - Search form data
 * @returns {Object} Validation result with errors
 */
export const validateSearchForm = (searchData) => {
  const errors = {};

  // Destination validation
  if (!searchData.destination || !searchData.destination.trim()) {
    errors.destination = 'Destination is required';
  }

  // Check-in date validation
  if (!searchData.checkInDate) {
    errors.checkInDate = 'Check-in date is required';
  } else if (!isFutureDate(searchData.checkInDate.toISOString().split('T')[0])) {
    errors.checkInDate = 'Check-in date must be today or in the future';
  }

  // Check-out date validation
  if (!searchData.checkOutDate) {
    errors.checkOutDate = 'Check-out date is required';
  } else if (searchData.checkInDate && searchData.checkOutDate <= searchData.checkInDate) {
    errors.checkOutDate = 'Check-out date must be after check-in date';
  }

  // Guests validation
  if (!searchData.guests || searchData.guests < 1 || searchData.guests > 10) {
    errors.guests = 'Number of guests must be between 1 and 10';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Booking form validation rules
 */
export const bookingValidationRules = {
  guestName: {
    required: true,
    type: 'name',
    requiredMessage: 'Guest name is required',
    invalidMessage: 'Please enter a valid name (letters and spaces only)',
  },
  guestEmail: {
    required: true,
    type: 'email',
    requiredMessage: 'Email address is required',
    invalidMessage: 'Please enter a valid email address',
  },
  guestPhone: {
    required: true,
    type: 'phone',
    requiredMessage: 'Phone number is required',
    invalidMessage: 'Please enter a valid phone number',
  },
  checkinDate: {
    required: true,
    type: 'futureDate',
    requiredMessage: 'Check-in date is required',
    invalidMessage: 'Please select a valid future date',
  },
  checkoutDate: {
    required: true,
    type: 'date',
    requiredMessage: 'Check-out date is required',
    custom: (value, formData) => {
      if (!value || !formData.checkinDate) return true;
      return isValidDateRange(formData.checkinDate, value);
    },
    customMessage: 'Check-out date must be after check-in date',
  },
  numberOfGuests: {
    required: true,
    custom: (value) => isValidGuestCount(value),
    customMessage: 'Please select a valid number of guests (1-10)',
  },
};

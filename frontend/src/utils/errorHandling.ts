/**
 * Utility functions for handling and formatting booking errors
 */

interface ApiError {
  message?: string;
  error?: string;
  errors?: string[];
  status?: number;
  data?: {
    message?: string;
    error?: string;
  };
}

/**
 * Extract a user-friendly error message from various error formats
 */
export const extractBookingErrorMessage = (error: unknown): string => {
  // Default error message
  let errorMessage = 'Failed to create booking. Please try again.';
  
  // Handle Error instances
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const originalMessage = error.message;
    
    // Check for specific backend error messages (exact matches) - highest priority
    if (originalMessage.includes('An active reservation already exists for this email address') ||
        originalMessage.includes('You already have a confirmed booking')) {
      return '⚠️ This email address already has an active booking. Please use a different email address or contact the front desk to modify the existing booking.';
    }
    
    if (originalMessage.includes('Guest name is required')) {
      return '📝 Please enter the guest\'s full name.';
    }
    
    if (originalMessage.includes('Guest email is required')) {
      return '📧 Please enter a valid email address for the guest.';
    }
    
    if (originalMessage.includes('Check-in date must be before check-out date')) {
      return '📅 Check-in date must be before the check-out date. Please adjust your dates.';
    }
    
    if (originalMessage.includes('Check-in date cannot be in the past')) {
      return '📅 Check-in date cannot be in the past. Please select a future date.';
    }
    
    if (originalMessage.includes('Number of guests must be greater than 0')) {
      return '👥 Please specify at least 1 guest for the booking.';
    }
    
    if (originalMessage.includes('Hotel ID is required')) {
      return '🏨 Hotel information is missing. Please refresh the page and try again.';
    }
    
    if (originalMessage.includes('Room type is required')) {
      return '🛏️ Please select a room type for the booking.';
    }
    
    if (originalMessage.includes('No available rooms of type')) {
      return '🛏️ No rooms of the selected type are available for your dates. Please try different dates or a different room type.';
    }
    
    if (originalMessage.includes('Room pricing not configured')) {
      return '💰 Room pricing has not been configured for this hotel. Please contact the hotel administrator.';
    }
    
    if (originalMessage.includes('Hotel not found')) {
      return '🏨 The selected hotel could not be found. Please refresh and try again.';
    }
    
    if (originalMessage.includes('User not found')) {
      return '👤 Your user account could not be found. Please log in again.';
    }
    
    if (originalMessage.includes('Unauthorized') || originalMessage.includes('Access denied')) {
      return '🔒 You do not have permission to perform this action. Please contact support.';
    }
    
    // Check for general error patterns (case-insensitive)
    if (message.includes('email') && (message.includes('already') || message.includes('exists') || message.includes('duplicate'))) {
      return '⚠️ This email address is already associated with an existing booking. Please use a different email address.';
    }
    
    if (message.includes('guest already has') || message.includes('customer already') || message.includes('booking already exists')) {
      return '⚠️ A booking already exists for this guest. Please check existing bookings or use a different email address.';
    }
    
    if (message.includes('no available rooms') || 
        message.includes('room not available') ||
        message.includes('room is not available') ||
        message.includes('room does not belong') ||
        message.includes('room already occupied')) {
      return '🛏️ The selected room is no longer available. Please choose a different room or refresh the available rooms.';
    }
    
    if (message.includes('room not found')) {
      return '🛏️ The selected room could not be found. Please refresh and try again.';
    }
    
    if (message.includes('guest information') || message.includes('invalid guest')) {
      return '📝 Please check the guest information and try again.';
    }
    
    if (message.includes('payment failed') || message.includes('payment processing')) {
      return '💳 Payment processing failed. Please check your payment details and try again.';
    }
    
    if (message.includes('payment')) {
      return '💳 There was an issue processing the payment information. Please try again.';
    }
    
    if (message.includes('date') || message.includes('check-in') || message.includes('check-out')) {
      return '📅 Please check the check-in and check-out dates and try again.';
    }
    
    if (message.includes('conflict') || message.includes('constraint')) {
      return '⚠️ There is a booking conflict. Please check the guest information or select different dates.';
    }
    
    if (message.includes('insufficient') || message.includes('capacity')) {
      return '👥 The selected room cannot accommodate the number of guests. Please choose a different room.';
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return '🌐 Network connection error. Please check your internet connection and try again.';
    }
    
    if (message.includes('timeout')) {
      return '⏱️ The request timed out. Please try again.';
    }
    
    if (message.includes('server') || message.includes('internal error') || message.includes('500')) {
      return '🔧 Server error. Please try again later or contact support if the problem persists.';
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return '🔍 The requested resource was not found. Please refresh and try again.';
    }
    
    if (message.includes('bad request') || message.includes('400')) {
      return '⚠️ Invalid request. Please check your information and try again.';
    }
    
    // If we have a meaningful error message that's not generic, use it
    if (originalMessage && 
        originalMessage !== 'Failed to create booking. Please try again.' && 
        originalMessage !== 'There was an issue with your booking request' &&
        originalMessage.length > 10 &&
        !originalMessage.includes('undefined') &&
        !originalMessage.includes('[object Object]')) {
      return originalMessage;
    }
  }
  
  // Handle API error responses with various formats
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    
    // Check for error message in various common API response formats
    if (apiError.message) {
      return extractBookingErrorMessage(new Error(apiError.message));
    }
    
    if (apiError.error) {
      return extractBookingErrorMessage(new Error(apiError.error));
    }
    
    if (apiError.data?.message) {
      return extractBookingErrorMessage(new Error(apiError.data.message));
    }
    
    if (apiError.data?.error) {
      return extractBookingErrorMessage(new Error(apiError.data.error));
    }
    
    if (apiError.errors && Array.isArray(apiError.errors) && apiError.errors.length > 0) {
      return extractBookingErrorMessage(new Error(apiError.errors[0]));
    }
    
    // Handle HTTP status codes
    if (apiError.status) {
      switch (apiError.status) {
        case 400:
          return '⚠️ Invalid request. Please check your booking information and try again.';
        case 401:
          return '🔒 Authentication required. Please log in and try again.';
        case 403:
          return '🔒 You do not have permission to perform this action.';
        case 404:
          return '🔍 The requested resource was not found. Please refresh and try again.';
        case 409:
          return '⚠️ There is a conflict with an existing booking. Please check the details.';
        case 422:
          return '📝 Validation error. Please check all required fields and try again.';
        case 500:
          return '🔧 Server error. Please try again later or contact support.';
        case 503:
          return '⏸️ Service temporarily unavailable. Please try again in a moment.';
        default:
          return `⚠️ Server returned error code ${apiError.status}. Please try again.`;
      }
    }
  }
  
  return errorMessage;
};

/**
 * Format validation errors for display
 */
export const formatValidationError = (fieldName: string, message: string): string => {
  const emoji = getFieldEmoji(fieldName);
  return `${emoji} ${message}`;
};

/**
 * Get appropriate emoji for field name
 */
const getFieldEmoji = (fieldName: string): string => {
  const field = fieldName.toLowerCase();
  
  if (field.includes('email')) return '📧';
  if (field.includes('name')) return '📝';
  if (field.includes('phone') || field.includes('mobile')) return '📱';
  if (field.includes('date') || field.includes('check')) return '📅';
  if (field.includes('guest')) return '👥';
  if (field.includes('room')) return '🛏️';
  if (field.includes('payment') || field.includes('card')) return '💳';
  if (field.includes('hotel')) return '🏨';
  if (field.includes('price') || field.includes('amount')) return '💰';
  
  return '⚠️';
};

/**
 * Check if an error is a network/connectivity error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('connection') ||
           message.includes('timeout');
  }
  return false;
};

/**
 * Check if an error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('required') || 
           message.includes('invalid') || 
           message.includes('must be') ||
           message.includes('validation');
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return apiError.status === 400 || apiError.status === 422;
  }
  
  return false;
};

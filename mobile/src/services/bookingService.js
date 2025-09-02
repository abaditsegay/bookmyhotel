import { api } from './api';

/**
 * Booking Service - Handles all booking-related API calls
 */
export const bookingService = {
  /**
   * Create a booking (enhanced version for mobile app)
   * @param {Object} bookingData - Booking information
   * @param {number} bookingData.hotelId - Hotel ID
   * @param {string} bookingData.roomType - Room type
   * @param {string} bookingData.checkInDate - Check-in date
   * @param {string} bookingData.checkOutDate - Check-out date
   * @param {number} bookingData.numberOfGuests - Number of guests
   * @param {string} bookingData.guestFirstName - Guest first name
   * @param {string} bookingData.guestLastName - Guest last name
   * @param {string} bookingData.guestEmail - Guest email
   * @param {string} bookingData.guestPhone - Guest phone number
   * @param {string} bookingData.specialRequests - Special requests (optional)
   * @param {number} bookingData.totalAmount - Total booking amount
   * @returns {Promise} API response with booking confirmation
   */
  createBooking: async (bookingData) => {
    try {
      // Transform data for backend API
      const apiPayload = {
        hotelId: bookingData.hotelId,
        roomType: bookingData.roomType,
        checkInDate: bookingData.checkInDate instanceof Date 
          ? bookingData.checkInDate.toISOString().split('T')[0] 
          : bookingData.checkInDate,      // Format as YYYY-MM-DD
        checkOutDate: bookingData.checkOutDate instanceof Date 
          ? bookingData.checkOutDate.toISOString().split('T')[0] 
          : bookingData.checkOutDate,     // Format as YYYY-MM-DD
        guests: bookingData.numberOfGuests,        // Backend expects guests
        guestName: `${bookingData.guestFirstName} ${bookingData.guestLastName}`,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        specialRequests: bookingData.specialRequests || '',
      };

      console.log('🚀 Creating booking with payload:', JSON.stringify(apiPayload, null, 2));

      // Use the main booking endpoint
      const response = await api.post('/bookings', apiPayload);
      
      // Validate that backend provided confirmation number
      if (!response.data.confirmationNumber) {
        console.error('Backend did not provide confirmation number in response:', response.data);
        return {
          success: false,
          message: 'Booking created but confirmation number not generated. Please contact support.',
          error: 'Missing confirmation number from backend',
        };
      }

      // Transform response to include mobile-friendly format
      const booking = {
        ...response.data,
        bookingReference: response.data.confirmationNumber, // Use backend-generated confirmation number
        guestFirstName: bookingData.guestFirstName,
        guestLastName: bookingData.guestLastName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        roomType: bookingData.roomType,
        numberOfGuests: bookingData.numberOfGuests,
        specialRequests: bookingData.specialRequests,
        totalAmount: bookingData.totalAmount,
        status: response.data.status || 'Confirmed',
        paymentStatus: response.data.paymentStatus || 'Pending',
      };
      
      return {
        success: true,
        data: booking,
      };
    } catch (error) {
      console.error('Booking creation error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create booking',
        error: error.response?.data || error.message,
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Look up booking by reference and email
   * @param {Object} lookupData - Lookup information
   * @param {string} lookupData.bookingReference - Booking reference
   * @param {string} lookupData.email - Guest email
   * @returns {Promise} API response with booking details
   */
  lookupBooking: async (lookupData) => {
    try {
      // Try the guest lookup endpoint first
      const response = await api.get('/bookings/guest', {
        params: { 
          email: lookupData.email, 
          reference: lookupData.bookingReference 
        },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Booking lookup error:', error);
      
      // If not found or error, try alternative approach
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'No booking found with the provided reference and email.',
          notFound: true,
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to lookup booking',
        error: error.response?.data || error.message,
        statusCode: error.response?.status,
      };
    }
  },
  /**
   * Create an anonymous booking
   * @param {Object} bookingData - Booking information
   * @param {number} bookingData.hotelId - Hotel ID
   * @param {number} bookingData.roomId - Room ID
   * @param {string} bookingData.guestName - Guest name
   * @param {string} bookingData.guestEmail - Guest email
   * @param {string} bookingData.guestPhone - Guest phone number
   * @param {string} bookingData.checkinDate - Check-in date (YYYY-MM-DD)
   * @param {string} bookingData.checkoutDate - Check-out date (YYYY-MM-DD)
   * @param {number} bookingData.numberOfGuests - Number of guests
   * @param {string} bookingData.specialRequests - Special requests (optional)
   * @returns {Promise} API response with booking confirmation
   */
  createAnonymousBooking: async (bookingData) => {
    try {
      // Use the main booking endpoint (works for anonymous users too)
      const response = await api.post('/bookings', bookingData);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create booking',
        statusCode: error.response?.status,
        details: error.response?.data,
      };
    }
  },

  /**
   * Get booking confirmation details
   * @param {string} bookingReference - Booking reference number
   * @returns {Promise} API response with booking details
   */
  getBookingConfirmation: async (bookingReference) => {
    try {
      const response = await api.get(`/bookings/confirmation/${bookingReference}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch booking confirmation',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Look up guest booking (for anonymous users)
   * @param {string} email - Guest email
   * @param {string} reference - Booking reference
   * @returns {Promise} API response with booking details
   */
  lookupGuestBooking: async (email, reference) => {
    try {
      // Note: This endpoint might need to be created in backend if not exists
      const response = await api.get('/bookings/guest', {
        params: { email, reference },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to find booking',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Validate booking data before submission
   * @param {Object} bookingData - Booking data to validate
   * @returns {Object} Validation result
   */
  validateBookingData: (bookingData) => {
    const errors = {};

    // Required fields validation
    if (!bookingData.guestName?.trim()) {
      errors.guestName = 'Guest name is required';
    }

    if (!bookingData.guestEmail?.trim()) {
      errors.guestEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(bookingData.guestEmail)) {
      errors.guestEmail = 'Please enter a valid email address';
    }

    if (!bookingData.guestPhone?.trim()) {
      errors.guestPhone = 'Phone number is required';
    }

    if (!bookingData.checkinDate) {
      errors.checkinDate = 'Check-in date is required';
    }

    if (!bookingData.checkoutDate) {
      errors.checkoutDate = 'Check-out date is required';
    }

    // Date validation
    if (bookingData.checkinDate && bookingData.checkoutDate) {
      const checkin = new Date(bookingData.checkinDate);
      const checkout = new Date(bookingData.checkoutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkin < today) {
        errors.checkinDate = 'Check-in date cannot be in the past';
      }

      if (checkout <= checkin) {
        errors.checkoutDate = 'Check-out date must be after check-in date';
      }
    }

    // Guest count validation
    if (!bookingData.numberOfGuests || bookingData.numberOfGuests < 1) {
      errors.numberOfGuests = 'At least 1 guest is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

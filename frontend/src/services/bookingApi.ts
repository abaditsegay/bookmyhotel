// Booking API service functions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface BookingSearchResponse {
  reservationId: number;
  status: string;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  paymentStatus: string;
  paymentIntentId?: string;
  createdAt: string;
  hotelName: string;
  hotelAddress: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  guestName: string;
  guestEmail: string;
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
});

export const bookingApiService = {
  /**
   * Search for booking by confirmation number
   */
  searchByConfirmationNumber: async (confirmationNumber: string): Promise<{ success: boolean; data?: BookingSearchResponse; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/search?confirmationNumber=${encodeURIComponent(confirmationNumber.trim())}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, message: 'No booking found with the provided confirmation number' };
        }
        if (response.status === 400) {
          return { success: false, message: 'Invalid confirmation number format' };
        }
        throw new Error('Failed to search for booking');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Booking search error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to search for booking' 
      };
    }
  },

  /**
   * Search for booking by email and last name
   */
  searchByEmailAndName: async (email: string, lastName: string): Promise<{ success: boolean; data?: BookingSearchResponse; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/search?email=${encodeURIComponent(email.trim())}&lastName=${encodeURIComponent(lastName.trim())}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, message: 'No booking found for the provided email and last name' };
        }
        if (response.status === 400) {
          return { success: false, message: 'Please provide both email and last name' };
        }
        throw new Error('Failed to search for booking');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Booking search error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to search for booking' 
      };
    }
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (confirmationNumber: string, guestEmail: string, cancellationReason?: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/cancel`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            confirmationNumber: confirmationNumber.trim(),
            guestEmail: guestEmail.trim(),
            cancellationReason: cancellationReason?.trim() || ''
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to cancel booking' };
      }

      const data = await response.json();
      return { success: true, data, message: data.message };
    } catch (error) {
      console.error('Booking cancellation error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to cancel booking' 
      };
    }
  },

  /**
   * Modify a booking
   */
  modifyBooking: async (modificationRequest: {
    confirmationNumber: string;
    guestEmail: string;
    newCheckInDate?: string;
    newCheckOutDate?: string;
    newRoomType?: string;
    modificationReason?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/modify`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            confirmationNumber: modificationRequest.confirmationNumber.trim(),
            guestEmail: modificationRequest.guestEmail.trim(),
            newCheckInDate: modificationRequest.newCheckInDate,
            newCheckOutDate: modificationRequest.newCheckOutDate,
            newRoomType: modificationRequest.newRoomType?.trim(),
            modificationReason: modificationRequest.modificationReason?.trim() || ''
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to modify booking' };
      }

      const data = await response.json();
      return { success: true, data, message: data.message };
    } catch (error) {
      console.error('Booking modification error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to modify booking' 
      };
    }
  },

  /**
   * Get available modification options for a booking
   */
  getModificationOptions: async (confirmationNumber: string, guestEmail: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      // This would typically be a separate endpoint, but for now we'll use the booking search
      const searchResult = await bookingApiService.searchByConfirmationNumber(confirmationNumber);
      
      if (!searchResult.success || !searchResult.data) {
        return { success: false, message: 'Booking not found' };
      }

      // Mock modification options - in a real app, this would come from the backend
      const options = {
        canModifyDates: searchResult.data.status === 'CONFIRMED',
        canModifyRoomType: searchResult.data.status === 'CONFIRMED',
        canCancel: ['CONFIRMED', 'PENDING'].includes(searchResult.data.status),
        modificationDeadline: new Date(searchResult.data.checkInDate),
        availableRoomTypes: ['Standard', 'Deluxe', 'Suite', 'Family'], // Would come from backend
        modificationFee: 25.00
      };

      return { success: true, data: options };
    } catch (error) {
      console.error('Get modification options error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get modification options' 
      };
    }
  },
};

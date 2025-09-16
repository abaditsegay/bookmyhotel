// Booking API service functions
import { API_BASE_URL, API_ENDPOINTS } from '../config/apiConfig';

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
  numberOfGuests?: number;
  specialRequests?: string;
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
});

export const bookingApiService = {
  /**
   * Search for booking by confirmation number
   */
  searchByConfirmationNumber: async (confirmationNumber: string): Promise<{ success: boolean; data?: BookingSearchResponse; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/confirmation/${encodeURIComponent(confirmationNumber.trim())}?_t=${Date.now()}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      );      if (!response.ok) {
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
        `${API_BASE_URL}${API_ENDPOINTS.BOOKINGS.SEARCH}?email=${encodeURIComponent(email.trim())}&lastName=${encodeURIComponent(lastName.trim())}&_t=${Date.now()}`,
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
        `${API_BASE_URL}${API_ENDPOINTS.BOOKINGS.CANCEL}`,
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
   * Modify a booking - supports comprehensive changes except pricing
   */
  modifyBooking: async (modificationRequest: {
    confirmationNumber: string;
    guestEmail: string;
    // Guest information changes
    newGuestName?: string;
    newGuestEmail?: string;
    newNumberOfGuests?: number;
    // Booking details changes
    newCheckInDate?: string;
    newCheckOutDate?: string;
    newRoomType?: string;
    // Additional information
    modificationReason?: string;
    reason?: string; // Alternative field name used by frontend
    specialRequests?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/bookings/modify`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            confirmationNumber: modificationRequest.confirmationNumber.trim(),
            guestEmail: modificationRequest.guestEmail.trim(),
            // Guest information updates
            newGuestName: modificationRequest.newGuestName?.trim(),
            newGuestEmail: modificationRequest.newGuestEmail?.trim(),
            newNumberOfGuests: modificationRequest.newNumberOfGuests,
            // Booking details updates
            newCheckInDate: modificationRequest.newCheckInDate,
            newCheckOutDate: modificationRequest.newCheckOutDate,
            newRoomType: modificationRequest.newRoomType?.trim(),
            // Additional information
            modificationReason: modificationRequest.modificationReason?.trim() || '',
            reason: modificationRequest.reason?.trim() || '', // Support both field names
            specialRequests: modificationRequest.specialRequests?.trim()
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

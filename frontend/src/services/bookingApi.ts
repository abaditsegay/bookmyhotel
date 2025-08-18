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
};

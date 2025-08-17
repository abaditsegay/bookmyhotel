const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface BookingResponse {
  reservationId: number;
  status: string;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  paymentIntentId?: string;
  createdAt: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  hotelName: string;
  hotelAddress: string;
  guestName: string;
  guestEmail: string;
  paymentStatus: string;
}

export interface BookingPage {
  content: BookingResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface BookingStats {
  totalBookings: number;
  statusBreakdown: { [key: string]: number };
  currentYearRevenue: number;
  thisMonthBookings: number;
  upcomingCheckIns: number;
  upcomingCheckOuts: number;
}

/**
 * Create authenticated fetch request headers
 */
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const hotelAdminApi = {
  // Get hotel bookings with pagination and search
  getHotelBookings: async (
    token: string,
    page: number = 0, 
    size: number = 10, 
    search?: string
  ): Promise<{ success: boolean; data?: BookingPage; message?: string }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/bookings?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Bookings fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch bookings' 
      };
    }
  },

  // Get booking statistics
  getBookingStats: async (token: string): Promise<{ success: boolean; data?: BookingStats; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/bookings/statistics`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch booking statistics');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Booking stats fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch booking statistics' 
      };
    }
  },

  // Update booking status
  updateBookingStatus: async (
    token: string,
    reservationId: number, 
    status: string
  ): Promise<{ success: boolean; data?: BookingResponse; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hotel-admin/bookings/${reservationId}/status?status=${status}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update booking status');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Booking status update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update booking status' 
      };
    }
  },
};

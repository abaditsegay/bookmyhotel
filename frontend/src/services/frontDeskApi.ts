// Front Desk API service functions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Make this file a module
export {};

export interface FrontDeskBooking {
  reservationId: number;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
  totalAmount: number;
  paymentStatus: string;
  confirmationNumber: string;
  hotelName: string;
  hotelAddress: string;
  pricePerNight: number;
  createdAt: string;
  paymentIntentId?: string;
}

export interface FrontDeskStats {
  todaysArrivals: number;
  todaysDepartures: number;
  currentOccupancy: number;
  availableRooms: number;
  roomsOutOfOrder: number;
  roomsUnderMaintenance: number;
}

export interface BookingPage {
  content: FrontDeskBooking[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

const getAuthHeaders = (token: string, tenantId: string = 'default') => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Tenant-ID': tenantId,
});

export const frontDeskApiService = {
  /**
   * Get all bookings with pagination and search
   */
  getAllBookings: async (
    token: string,
    page: number = 0, 
    size: number = 10, 
    search?: string,
    tenantId: string = 'default'
  ): Promise<{ success: boolean; data?: BookingPage; message?: string }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`${API_BASE_URL}/front-desk/bookings?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
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

  /**
   * Get a single booking by reservation ID
   */
  getBookingById: async (token: string, reservationId: number, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/bookings/${reservationId}`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch booking');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Booking fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch booking' 
      };
    }
  },

  /**
   * Update booking status
   */
  updateBookingStatus: async (
    token: string,
    reservationId: number, 
    status: string,
    tenantId: string = 'default'
  ): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/front-desk/bookings/${reservationId}/status?status=${status}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token, tenantId),
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

  /**
   * Delete booking
   */
  deleteBooking: async (
    token: string,
    reservationId: number,
    tenantId: string = 'default'
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/bookings/${reservationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete booking');
      }

      return { success: true };
    } catch (error) {
      console.error('Booking delete error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete booking' 
      };
    }
  },

  /**
   * Get today's arrivals
   */
  getTodaysArrivals: async (token: string, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking[]; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/arrivals`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch arrivals');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Arrivals fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch arrivals' 
      };
    }
  },

  /**
   * Get today's departures
   */
  getTodaysDepartures: async (token: string, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking[]; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/departures`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch departures');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Departures fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch departures' 
      };
    }
  },

  /**
   * Get current guests (checked in)
   */
  getCurrentGuests: async (token: string, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking[]; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/current-guests`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch current guests');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Current guests fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch current guests' 
      };
    }
  },

  /**
   * Check in a guest
   */
  checkInGuest: async (token: string, reservationId: number, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/checkin/${reservationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check in guest');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Check in error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to check in guest' 
      };
    }
  },

  /**
   * Check out a guest
   */
  checkOutGuest: async (token: string, reservationId: number, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/checkout/${reservationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check out guest');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Check out error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to check out guest' 
      };
    }
  },

  /**
   * Mark guest as no-show
   */
  markNoShow: async (token: string, reservationId: number, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/no-show/${reservationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark as no-show');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('No-show error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to mark as no-show' 
      };
    }
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (token: string, reservationId: number, reason?: string, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
    try {
      const url = new URL(`${API_BASE_URL}/front-desk/cancel/${reservationId}`);
      if (reason) {
        url.searchParams.append('reason', reason);
      }

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Cancel booking error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to cancel booking' 
      };
    }
  },

  /**
   * Search bookings
   */
  searchBookings: async (
    token: string, 
    searchParams: {
      guestName?: string;
      roomNumber?: string;
      confirmationNumber?: string;
      checkInDate?: string;
      status?: string;
    },
    tenantId: string = 'default'
  ): Promise<{ success: boolean; data?: FrontDeskBooking[]; message?: string }> => {
    try {
      const url = new URL(`${API_BASE_URL}/front-desk/search`);
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search bookings');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Search bookings error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to search bookings' 
      };
    }
  },

  /**
   * Get front desk statistics
   */
  getFrontDeskStats: async (token: string, tenantId: string = 'default'): Promise<{ success: boolean; data?: FrontDeskStats; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/stats`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch front desk statistics');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Front desk stats error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch front desk statistics' 
      };
    }
  },
};

// Front Desk API service functions
import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Make this file a module
export {};

export interface FrontDeskBooking {
  reservationId: number;
  guestName: string;
  guestEmail: string;
  roomNumber?: string;
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

export interface ConsolidatedReceipt {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  reservationId: number;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  status: string;
  numberOfNights: number;
  numberOfGuests: number;
  hotelName: string;
  hotelAddress: string;
  hotelPhone?: string;
  hotelEmail?: string;
  roomNumber: string;
  roomType: string;
  roomChargePerNight: number;
  totalRoomCharges: number;
  additionalCharges: Array<{
    chargeId?: number;
    description: string;
    unitPrice?: number;
    quantity?: number;
    amount: number;
    chargeType?: string;
    chargeDate?: string;
    notes?: string;
  }>;
  totalAdditionalCharges: number;
  taxesAndFees: Array<{
    chargeId?: number;
    description: string;
    unitPrice?: number;
    quantity?: number;
    amount: number;
    chargeType?: string;
    chargeDate?: string;
    notes?: string;
  }>;
  totalTaxesAndFees: number;
  grandTotal: number;
  receiptNumber: string;
  generatedAt: string;
  generatedBy?: string;
}

export interface CheckoutResponse {
  booking: FrontDeskBooking;
  receipt?: ConsolidatedReceipt;
  receiptGenerated: boolean;
  message?: string;
}

export interface FrontDeskStats {
  todaysArrivals: number;
  todaysDepartures: number;
  currentOccupancy: number;
  availableRooms: number;
  roomsOutOfOrder: number;
  roomsUnderMaintenance: number;
}

export interface FrontDeskRoom {
  id: number;
  roomNumber: string;
  roomType: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'OUT_OF_ORDER';
  currentGuest?: string;
  capacity: number;
  pricePerNight: number;
  description?: string;
  lastCleaned?: string;
  notes?: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_ORDER' | 'MAINTENANCE' | 'CLEANING' | 'DIRTY';
  pricePerNight: number;
  capacity: number;
  description: string;
  isAvailable: boolean;
  hotelName: string;
  currentGuest?: string;
}

export interface RoomPage {
  content: FrontDeskRoom[];
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

export interface BookingPage {
  content: FrontDeskBooking[];
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

const getAuthHeaders = (token: string, tenantId: string | null = 'default') => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  // Only add tenant ID header if tenantId is not null (for tenant-bound users)
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }
  
  return headers;
};

export const frontDeskApiService = {
  /**
   * Get all bookings with pagination and search
   */
  getAllBookings: async (
    token: string,
    page: number = 0, 
    size: number = 10, 
    search?: string,
    tenantId: string | null = 'default'
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
  getBookingById: async (token: string, reservationId: number, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
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
    tenantId: string | null = 'default'
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
   * Update booking room assignment (for confirmed bookings during check-in)
   */
  updateBookingRoomAssignment: async (
    token: string,
    reservationId: number,
    roomId: number,
    roomType?: string,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
    try {
      const params = new URLSearchParams({
        roomId: roomId.toString(),
      });
      
      if (roomType) {
        params.append('roomType', roomType);
      }

      const response = await fetch(
        `${API_BASE_URL}/front-desk/bookings/${reservationId}/room-assignment?${params}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token, tenantId),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room assignment');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room assignment update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update room assignment' 
      };
    }
  },

  /**
   * Delete booking
   */
  deleteBooking: async (
    token: string,
    reservationId: number,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${reservationId}`, {
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
  getTodaysArrivals: async (token: string, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking[]; message?: string }> => {
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
  getTodaysDepartures: async (token: string, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking[]; message?: string }> => {
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
  getCurrentGuests: async (token: string, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking[]; message?: string }> => {
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
  checkInGuest: async (token: string, reservationId: number, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
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
  checkOutGuest: async (token: string, reservationId: number, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
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
   * Check out a guest with final receipt generation
   */
  checkOutGuestWithReceipt: async (token: string, reservationId: number, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: CheckoutResponse; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/checkout-with-receipt/${reservationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check out guest with receipt');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Check out with receipt error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to check out guest with receipt' 
      };
    }
  },

  /**
   * Generate receipt preview for any booking (without changing status)
   */
  generateReceiptPreview: async (token: string, reservationId: number, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: ConsolidatedReceipt; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/receipt/${reservationId}/preview`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate receipt preview');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Receipt preview error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to generate receipt preview' 
      };
    }
  },

  /**
   * Mark guest as no-show
   */
  markNoShow: async (token: string, reservationId: number, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
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
  cancelBooking: async (token: string, reservationId: number, reason?: string, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
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
    tenantId: string | null = 'default'
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
  getFrontDeskStats: async (token: string, tenantId: string | null = 'default'): Promise<{ success: boolean; data?: FrontDeskStats; message?: string }> => {
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

  /**
   * Get all rooms with pagination and filters for front desk
   */
  getRooms: async (
    token: string,
    page: number = 0,
    size: number = 10,
    search?: string,
    roomType?: string,
    status?: string,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: RoomPage; message?: string }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      if (roomType) {
        params.append('roomType', roomType);
      }
      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`${API_BASE_URL}/front-desk/rooms?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch rooms');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Rooms fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch rooms' 
      };
    }
  },

  /**
   * Update room status (for housekeeping operations)
   */
  updateRoomStatus: async (
    token: string,
    roomId: number,
    status: string,
    notes?: string,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: FrontDeskRoom; message?: string }> => {
    try {
      const params = new URLSearchParams({
        status: status
      });
      
      if (notes) {
        params.append('notes', notes);
      }

      const response = await fetch(`${API_BASE_URL}/front-desk/rooms/${roomId}/status?${params.toString()}`, {
        method: 'PUT',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update room status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response isn't JSON, it might be HTML error page
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room status update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update room status' 
      };
    }
  },

  /**
   * Get room details by ID
   */
  getRoomById: async (
    token: string,
    roomId: number,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: FrontDeskRoom; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/rooms/${roomId}`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch room details');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room details fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch room details' 
      };
    }
  },

  /**
   * Get all rooms with pagination and filtering
   */
  getAllRooms: async (
    token: string,
    page: number = 0, 
    size: number = 10, 
    status?: string,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: { content: Room[]; page: { size: number; number: number; totalElements: number; totalPages: number; }; first: boolean; last: boolean; numberOfElements: number; empty: boolean; }; message?: string }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (status && status !== 'ALL') {
        params.append('status', status);
      }

      const response = await fetch(`${API_BASE_URL}/front-desk/rooms?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch rooms');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Rooms fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch rooms' 
      };
    }
  },

  /**
   * Toggle room availability
   */
  toggleRoomAvailability: async (
    token: string,
    roomId: number,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: Room; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/rooms/${roomId}/toggle-availability`, {
        method: 'POST',
        headers: getAuthHeaders(token, tenantId),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle room availability');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room availability toggle error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to toggle room availability' 
      };
    }
  },

  /**
   * Get available rooms for check-in
   */
  getAvailableRoomsForCheckin: async (
    token: string,
    hotelId: number,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/front-desk/hotels/${hotelId}/available-rooms`,
        {
          method: 'GET',
          headers: getAuthHeaders(token, tenantId),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to get available rooms' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Get available rooms error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to get available rooms' 
      };
    }
  },

  /**
   * Check-in with room assignment
   */
  checkInWithRoomAssignment: async (
    token: string,
    reservationId: number,
    roomId: number,
    roomType?: string,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: FrontDeskBooking; message?: string }> => {
    try {
      const params = new URLSearchParams({
        roomId: roomId.toString(),
      });
      
      if (roomType) {
        params.append('roomType', roomType);
      }

      const response = await fetch(
        `${API_BASE_URL}/front-desk/bookings/${reservationId}/checkin?${params}`,
        {
          method: 'POST',
          headers: getAuthHeaders(token, tenantId),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Failed to check-in guest' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Check-in with room assignment error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to check-in guest' 
      };
    }
  },

  /**
   * Create a walk-in booking
   * This endpoint ensures the email confirmation is sent to the guest, not the staff member
   */
  createWalkInBooking: async (
    token: string,
    bookingRequest: any,
    tenantId: string | null = 'default'
  ): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/front-desk/walk-in-booking`, {
        method: 'POST',
        headers: getAuthHeaders(token, tenantId),
        body: JSON.stringify(bookingRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create walk-in booking');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Walk-in booking creation error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create walk-in booking' 
      };
    }
  },
};

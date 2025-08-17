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

export interface RoomResponse {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
  isAvailable: boolean;
  hotelId: number;
  hotelName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomPage {
  content: RoomResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface RoomCreateRequest {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
}

export interface RoomUpdateRequest {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
}

/**
 * Create authenticated fetch request headers
 */
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const hotelAdminApi = {
  // ===========================
  // BOOKING MANAGEMENT METHODS
  // ===========================

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

  // Get a single booking by reservation ID
  getBookingById: async (
    token: string,
    reservationId: number
  ): Promise<{ success: boolean; data?: BookingResponse; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/bookings/${reservationId}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch booking details');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Booking fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch booking details' 
      };
    }
  },

  // ===========================
  // ROOM MANAGEMENT METHODS
  // ===========================

  // Get hotel rooms with pagination and search
  getHotelRooms: async (
    token: string,
    page: number = 0, 
    size: number = 10, 
    search?: string,
    roomNumber?: string,
    roomType?: string,
    status?: string
  ): Promise<{ success: boolean; data?: RoomPage; message?: string }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      if (roomNumber && roomNumber.trim()) {
        params.append('roomNumber', roomNumber.trim());
      }
      
      if (roomType && roomType.trim()) {
        params.append('roomType', roomType.trim());
      }
      
      if (status && status.trim()) {
        params.append('available', status === 'AVAILABLE' ? 'true' : 'false');
      }

      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/rooms?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
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

  // Get a single room by ID
  getRoomById: async (
    token: string,
    roomId: number
  ): Promise<{ success: boolean; data?: RoomResponse; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/rooms/${roomId}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch room details');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch room details' 
      };
    }
  },

  // Create a new room
  createRoom: async (
    token: string,
    roomData: RoomCreateRequest
  ): Promise<{ success: boolean; data?: RoomResponse; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/rooms`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create room');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room creation error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create room' 
      };
    }
  },

  // Update an existing room
  updateRoom: async (
    token: string,
    roomId: number,
    roomData: RoomUpdateRequest
  ): Promise<{ success: boolean; data?: RoomResponse; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/rooms/${roomId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update room' 
      };
    }
  },

  // Delete a room
  deleteRoom: async (
    token: string,
    roomId: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/rooms/${roomId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete room');
      }

      return { success: true };
    } catch (error) {
      console.error('Room deletion error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete room' 
      };
    }
  },

  // Toggle room availability
  toggleRoomAvailability: async (
    token: string,
    roomId: number,
    available: boolean
  ): Promise<{ success: boolean; data?: RoomResponse; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hotel-admin/rooms/${roomId}/availability?available=${available}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update room availability');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Room availability update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update room availability' 
      };
    }
  },
};

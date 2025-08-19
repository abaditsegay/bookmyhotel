import { Hotel } from '../types/hotel';

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
  page: {
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
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

// Staff interfaces
export interface StaffResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
  isActive: boolean;
  hotelId: number;
  hotelName: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface StaffPage {
  content: StaffResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface StaffCreateRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
  password: string;
}

export interface StaffUpdateRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
  password?: string;
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

  // Delete booking
  deleteBooking: async (
    token: string,
    reservationId: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/bookings/${reservationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
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

  // ===========================
  // STAFF MANAGEMENT METHODS
  // ===========================

  // Get hotel staff with pagination and search
  getHotelStaff: async (
    token: string,
    page: number = 0,
    size: number = 10,
    search?: string,
    role?: string,
    status?: string
  ): Promise<{ success: boolean; data?: StaffPage; message?: string }> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      if (status) params.append('status', status);

      const response = await fetch(
        `${API_BASE_URL}/api/hotel-admin/staff?${params.toString()}`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch staff');
      }

      const backendData = await response.json();
      
      // Transform backend UserDTO format to frontend StaffResponse format
      const transformedData: StaffPage = {
        content: backendData.content.map((user: any) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || '',
          roles: user.roles ? user.roles.map((role: any) => typeof role === 'string' ? role : role.name || role.toString()) : [],
          isActive: user.isActive === true,
          hotelId: user.hotelId || 0,
          hotelName: user.hotelName || '',
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString(),
          lastLogin: user.lastLogin || undefined,
        })),
        totalElements: backendData.totalElements || 0,
        totalPages: backendData.totalPages || 0,
        size: backendData.size || size,
        number: backendData.number || page,
      };
      
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Get staff error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch staff' 
      };
    }
  },

  // Get staff member by ID
  getStaffById: async (
    token: string,
    staffId: number
  ): Promise<{ success: boolean; data?: StaffResponse; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hotel-admin/staff/${staffId}`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch staff member');
      }

      const user = await response.json();
      
      // Transform backend UserDTO format to frontend StaffResponse format
      const transformedData: StaffResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        roles: user.roles ? user.roles.map((role: any) => typeof role === 'string' ? role : role.name || role.toString()) : [],
        isActive: user.isActive === true,
        hotelId: user.hotelId || 0,
        hotelName: user.hotelName || '',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
        lastLogin: user.lastLogin || undefined,
      };
      
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Get staff by ID error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch staff member' 
      };
    }
  },

  // Create new staff member
  createStaff: async (
    token: string,
    staffData: StaffCreateRequest
  ): Promise<{ success: boolean; data?: StaffResponse; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/staff`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create staff member');
      }

      const user = await response.json();
      
      // Transform backend UserDTO format to frontend StaffResponse format
      const transformedData: StaffResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        roles: user.roles ? user.roles.map((role: any) => typeof role === 'string' ? role : role.name || role.toString()) : [],
        isActive: user.isActive === true,
        hotelId: user.hotelId || 0,
        hotelName: user.hotelName || '',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
        lastLogin: user.lastLogin || undefined,
      };
      
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Create staff error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create staff member' 
      };
    }
  },

  // Update staff member
  updateStaff: async (
    token: string,
    staffId: number,
    staffData: StaffUpdateRequest
  ): Promise<{ success: boolean; data?: StaffResponse; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/staff/${staffId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update staff member');
      }

      const user = await response.json();
      
      // Transform backend UserDTO format to frontend StaffResponse format
      const transformedData: StaffResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        roles: user.roles ? user.roles.map((role: any) => typeof role === 'string' ? role : role.name || role.toString()) : [],
        isActive: user.isActive === true,
        hotelId: user.hotelId || 0,
        hotelName: user.hotelName || '',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
        lastLogin: user.lastLogin || undefined,
      };
      
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Update staff error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update staff member' 
      };
    }
  },

  // Delete staff member
  deleteStaff: async (
    token: string,
    staffId: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/staff/${staffId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete staff member');
      }

      return { success: true };
    } catch (error) {
      console.error('Delete staff error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete staff member' 
      };
    }
  },

  // Activate staff member
  activateStaff: async (
    token: string,
    staffId: number
  ): Promise<{ success: boolean; data?: StaffResponse; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hotel-admin/staff/${staffId}/activate`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to activate staff member');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Activate staff error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to activate staff member' 
      };
    }
  },

  // Deactivate staff member
  deactivateStaff: async (
    token: string,
    staffId: number
  ): Promise<{ success: boolean; data?: StaffResponse; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hotel-admin/staff/${staffId}/deactivate`,
        {
          method: 'PUT',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to deactivate staff member');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Deactivate staff error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to deactivate staff member' 
      };
    }
  },

  // ===========================
  // HOTEL MANAGEMENT METHODS
  // ===========================

  // Get my hotel details
  getMyHotel: async (token: string): Promise<{ success: boolean; data?: Hotel; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/hotel`, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch hotel details');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Hotel fetch error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch hotel details' 
      };
    }
  },

  // Update my hotel details
  updateMyHotel: async (
    token: string,
    hotelData: Partial<Hotel>
  ): Promise<{ success: boolean; data?: Hotel; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hotel-admin/hotel`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(hotelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update hotel details');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Hotel update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update hotel details' 
      };
    }
  },
};

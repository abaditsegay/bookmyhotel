// Admin API service for user and hotel management

import { API_CONFIG } from '../config/apiConfig';
import TokenManager from '../utils/tokenManager';

const API_BASE_URL = API_CONFIG.BASE_URL;

class AdminApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add any additional headers from options
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    // Add Authorization header if token is available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorText = '';
      try {
        // Try to get error as JSON first
        const errorJson = await response.json();
        errorText = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } catch {
        // Fallback to text if JSON parsing fails
        errorText = await response.text();
      }
      console.error(`API Error Details: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Handle empty responses (like DELETE operations)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return response.json();
  }

  // User Management Methods
  async getUsers(page: number = 0, size: number = 10): Promise<PagedResponse<UserManagementResponse>> {
    return this.fetchApi<PagedResponse<UserManagementResponse>>(`/admin/users?page=${page}&size=${size}`);
  }

  async searchUsers(searchTerm: string, page: number = 0, size: number = 10): Promise<PagedResponse<UserManagementResponse>> {
    return this.fetchApi<PagedResponse<UserManagementResponse>>(`/admin/users/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`);
  }

  async getUserById(id: number): Promise<UserManagementResponse> {
    return this.fetchApi<UserManagementResponse>(`/admin/users/${id}`);
  }

  async updateUser(id: number, request: UpdateUserRequest): Promise<UserManagementResponse> {
    return this.fetchApi<UserManagementResponse>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async toggleUserStatus(id: number): Promise<UserManagementResponse> {
    return this.fetchApi<UserManagementResponse>(`/admin/users/${id}/toggle-status`, {
      method: 'POST',
    });
  }

  async addRoleToUser(id: number, role: string): Promise<UserManagementResponse> {
    return this.fetchApi<UserManagementResponse>(`/admin/users/${id}/roles/${role}`, {
      method: 'POST',
    });
  }

  async removeRoleFromUser(id: number, role: string): Promise<UserManagementResponse> {
    return this.fetchApi<UserManagementResponse>(`/admin/users/${id}/roles/${role}`, {
      method: 'DELETE',
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.fetchApi<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: number, newPassword: string): Promise<void> {
    return this.fetchApi<void>(`/admin/users/${id}/reset-password?newPassword=${encodeURIComponent(newPassword)}`, {
      method: 'POST',
    });
  }

  async getUserStatistics(): Promise<UserStatistics> {
    return this.fetchApi<UserStatistics>('/admin/users/statistics');
  }

  async createUser(request: CreateUserRequest): Promise<UserManagementResponse> {
    return this.fetchApi<UserManagementResponse>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Hotel Management Methods
  async getHotels(page: number = 0, size: number = 10): Promise<PagedResponse<HotelDTO>> {
    return this.fetchApi<PagedResponse<HotelDTO>>(`/admin/hotels?page=${page}&size=${size}`);
  }

  async searchHotels(searchTerm: string, page: number = 0, size: number = 10): Promise<PagedResponse<HotelDTO>> {
    return this.fetchApi<PagedResponse<HotelDTO>>(`/admin/hotels/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`);
  }

  async getHotelById(id: number): Promise<HotelDTO> {
    return this.fetchApi<HotelDTO>(`/admin/hotels/${id}`);
  }

  async createHotel(request: CreateHotelRequest): Promise<HotelDTO> {
    return this.fetchApi<HotelDTO>('/admin/hotels', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateHotel(id: number, request: UpdateHotelRequest): Promise<HotelDTO> {
    return this.fetchApi<HotelDTO>(`/admin/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteHotel(id: number): Promise<void> {
    return this.fetchApi<void>(`/admin/hotels/${id}`, {
      method: 'DELETE',
    });
  }

  async getHotelStatistics(): Promise<HotelStatistics> {
    return this.fetchApi<HotelStatistics>('/admin/hotels/statistics');
  }

  async assignHotelAdmin(hotelId: number, userId: number): Promise<HotelDTO> {
    return this.fetchApi<HotelDTO>(`/admin/hotels/${hotelId}/assign-admin/${userId}`, {
      method: 'POST',
    });
  }

  async removeHotelAdmin(hotelId: number, userId: number): Promise<HotelDTO> {
    return this.fetchApi<HotelDTO>(`/admin/hotels/${hotelId}/remove-admin/${userId}`, {
      method: 'DELETE',
    });
  }

  async toggleHotelStatus(hotelId: number): Promise<HotelDTO> {
    return this.fetchApi<HotelDTO>(`/admin/hotels/${hotelId}/toggle-status`, {
      method: 'POST',
    });
  }

  // Room Management Methods
  async getHotelRooms(hotelId: number): Promise<RoomDTO[]> {
    return this.fetchApi<RoomDTO[]>(`/admin/hotels/${hotelId}/rooms`);
  }

  async addRoomToHotel(hotelId: number, request: CreateRoomRequest): Promise<RoomDTO> {
    return this.fetchApi<RoomDTO>(`/admin/hotels/${hotelId}/rooms`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateRoom(roomId: number, request: UpdateRoomRequest): Promise<RoomDTO> {
    return this.fetchApi<RoomDTO>(`/admin/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteRoom(roomId: number): Promise<void> {
    return this.fetchApi<void>(`/admin/rooms/${roomId}`, {
      method: 'DELETE',
    });
  }

  // Tenant Management Methods
  async getTenants(page: number = 0, size: number = 10, search?: string, isActive?: boolean): Promise<PagedResponse<TenantDTO>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    if (isActive !== undefined) {
      params.append('isActive', isActive.toString());
    }
    
    return this.fetchApi<PagedResponse<TenantDTO>>(`/admin/tenants?${params.toString()}`);
  }

  async getTenantById(tenantId: string): Promise<TenantDTO> {
    return this.fetchApi<TenantDTO>(`/admin/tenants/${tenantId}`);
  }

  async createTenant(request: CreateTenantRequest): Promise<TenantDTO> {
    return this.fetchApi<TenantDTO>('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateTenant(tenantId: string, request: UpdateTenantRequest): Promise<TenantDTO> {
    return this.fetchApi<TenantDTO>(`/admin/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async toggleTenantStatus(tenantId: string): Promise<TenantDTO> {
    return this.fetchApi<TenantDTO>(`/admin/tenants/${tenantId}/toggle-status`, {
      method: 'POST',
    });
  }

  async deleteTenant(tenantId: string): Promise<void> {
    return this.fetchApi<void>(`/admin/tenants/${tenantId}`, {
      method: 'DELETE',
    });
  }

  async getTenantStatistics(): Promise<TenantStatistics> {
    return this.fetchApi<TenantStatistics>('/admin/tenants/statistics');
  }

  async getActiveTenants(): Promise<TenantDTO[]> {
    return this.fetchApi<TenantDTO[]>('/admin/tenants/active');
  }

  async getHotelsByTenant(tenantId: string): Promise<HotelDTO[]> {
    return this.fetchApi<HotelDTO[]>(`/admin/hotels/tenant/${tenantId}/options`);
  }

  // Hotel Registration Management Methods
  async getHotelRegistrations(page: number = 0, size: number = 10): Promise<PagedResponse<HotelRegistrationResponse>> {
    return this.fetchApi<PagedResponse<HotelRegistrationResponse>>(`/admin/hotel-registrations?page=${page}&size=${size}`);
  }

  async getHotelRegistrationsByStatus(status: string, page: number = 0, size: number = 10): Promise<PagedResponse<HotelRegistrationResponse>> {
    return this.fetchApi<PagedResponse<HotelRegistrationResponse>>(`/admin/hotel-registrations/status/${status}?page=${page}&size=${size}`);
  }

  async getHotelRegistrationById(id: number): Promise<HotelRegistrationResponse> {
    return this.fetchApi<HotelRegistrationResponse>(`/admin/hotel-registrations/${id}`);
  }

  async approveHotelRegistration(id: number, request: ApproveRegistrationRequest): Promise<HotelRegistrationResponse> {
    return this.fetchApi<HotelRegistrationResponse>(`/admin/hotel-registrations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async rejectHotelRegistration(id: number, request: RejectRegistrationRequest): Promise<HotelRegistrationResponse> {
    return this.fetchApi<HotelRegistrationResponse>(`/admin/hotel-registrations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async markHotelRegistrationUnderReview(id: number, request: UnderReviewRequest): Promise<HotelRegistrationResponse> {
    return this.fetchApi<HotelRegistrationResponse>(`/admin/hotel-registrations/${id}/under-review`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getHotelRegistrationStatistics(): Promise<HotelRegistrationStatistics> {
    return this.fetchApi<HotelRegistrationStatistics>('/admin/hotel-registrations/statistics');
  }

  async searchHotelRegistrations(searchTerm: string, page: number = 0, size: number = 10): Promise<PagedResponse<HotelRegistrationResponse>> {
    return this.fetchApi<PagedResponse<HotelRegistrationResponse>>(`/admin/hotel-registrations/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`);
  }
}

// Type definitions for API responses
export interface PagedResponse<T> {
  content: T[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  // Direct Spring Boot Page properties (fallback)
  size?: number;
  number?: number;
  totalElements?: number;
  totalPages?: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface UserManagementResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  tenantId?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  roles: string[];
  tenantId?: string;
  hotelId?: number;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  roleCounts: { [key: string]: number };
}

export interface HotelDTO {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  tenantId?: string;
  totalRooms?: number;
  availableRooms?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHotelRequest {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  tenantId: string | null;
}

export interface UpdateHotelRequest {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  tenantId: string | null;
}

export interface HotelStatistics {
  totalHotels: number;
  activeHotels: number;
  totalRooms: number;
  availableRooms: number;
  averageOccupancy: number;
}

export interface RoomDTO {
  id: number;
  roomNumber: string;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  hotelId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomRequest {
  roomNumber: string;
  capacity: number;
  pricePerNight: number;
}

export interface UpdateRoomRequest {
  roomNumber: string;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
}

export interface TenantDTO {
  id: number;
  tenantId: string;
  name: string;
  subdomain?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalUsers?: number;
  totalHotels?: number;
}

export interface CreateTenantRequest {
  name: string;
  subdomain?: string;
  description?: string;
}

export interface UpdateTenantRequest {
  name: string;
  subdomain?: string;
  description?: string;
}

export interface TenantStatistics {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsers: number;
  totalHotels: number;
}

export interface HotelRegistrationResponse {
  id: number;
  hotelName: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  phone?: string;
  contactEmail: string;
  contactPerson: string;
  licenseNumber?: string;
  taxId?: string;
  websiteUrl?: string;
  facilityAmenities?: string;
  numberOfRooms?: number;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewComments?: string;
  tenantId?: string;
}

export interface ApproveRegistrationRequest {
  comments?: string;
  tenantId: string;
}

export interface RejectRegistrationRequest {
  reason: string;
  comments?: string;
}

export interface UnderReviewRequest {
  comments?: string;
}

export interface HotelRegistrationStatistics {
  totalRegistrations: number;
  pendingRegistrations: number;
  underReviewRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
}

export const adminApiService = new AdminApiService();

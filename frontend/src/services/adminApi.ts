// Admin API service for user and hotel management

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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
      const errorText = await response.text();
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
}

// Type definitions for API responses
export interface PagedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
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
  subdomain: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalUsers?: number;
  totalHotels?: number;
}

export interface CreateTenantRequest {
  name: string;
  subdomain: string;
  description?: string;
}

export interface UpdateTenantRequest {
  name: string;
  subdomain: string;
  description?: string;
}

export interface TenantStatistics {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsers: number;
  totalHotels: number;
}

export const adminApiService = new AdminApiService();

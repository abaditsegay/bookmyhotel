/**
 * API service for system-wide user operations
 * Handles system admin and global guest user management
 */

const API_BASE_URL = 'http://localhost:8080/api';

export interface SystemUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantId: string | null;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  isSystemWide: boolean;
  isTenantBound: boolean;
}

export interface SystemAdminRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class SystemUserApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as unknown as T;
  }

  /**
   * Get all system-wide users (paginated)
   */
  async getAllSystemUsers(page = 0, size = 20): Promise<PaginatedResponse<SystemUser>> {
    const response = await fetch(
      `${API_BASE_URL}/system-users?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<PaginatedResponse<SystemUser>>(response);
  }

  /**
   * Get all system guest users
   */
  async getAllGuestUsers(): Promise<SystemUser[]> {
    const response = await fetch(`${API_BASE_URL}/system-users/guests`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<SystemUser[]>(response);
  }

  /**
   * Get all system admin users
   */
  async getAllSystemAdmins(): Promise<SystemUser[]> {
    const response = await fetch(`${API_BASE_URL}/system-users/admins`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<SystemUser[]>(response);
  }

  /**
   * Create a new system admin
   */
  async createSystemAdmin(adminData: SystemAdminRequest): Promise<SystemUser> {
    const response = await fetch(`${API_BASE_URL}/system-users/admins`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(adminData),
    });
    
    return this.handleResponse<SystemUser>(response);
  }

  /**
   * Promote a user to system admin
   */
  async promoteToSystemAdmin(userId: string): Promise<SystemUser> {
    const response = await fetch(
      `${API_BASE_URL}/system-users/promote?userId=${userId}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<SystemUser>(response);
  }

  /**
   * Demote a system admin to regular guest
   */
  async demoteFromSystemAdmin(userId: string, tenantId: string): Promise<SystemUser> {
    const response = await fetch(
      `${API_BASE_URL}/system-users/demote?userId=${userId}&tenantId=${tenantId}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );
    
    return this.handleResponse<SystemUser>(response);
  }

  /**
   * Get system statistics (for admin dashboard)
   */
  async getSystemStats(): Promise<{
    totalUsers: number;
    systemAdmins: number;
    globalGuests: number;
    tenantBoundUsers: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/system-users/stats`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<{
      totalUsers: number;
      systemAdmins: number;
      globalGuests: number;
      tenantBoundUsers: number;
    }>(response);
  }
}

export const systemUserApiService = new SystemUserApiService();

import { HousekeepingTask, MaintenanceTask } from '../types/operations';
import TokenManager from '../utils/tokenManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface StaffUser {
  id: number;
  username: string;
  role: string;
  staffType: 'HOUSEKEEPING' | 'MAINTENANCE';
  permissions: string[];
}

export interface TaskUpdateRequest {
  status: string;
  notes?: string;
}

export interface MaintenanceUpdateRequest {
  status: string;
  notes?: string;
  completedAt?: string;
}

class StaffApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...TokenManager.getAuthHeaders(),
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as unknown as T;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
  // Get current staff user info
  async getCurrentUser(): Promise<StaffUser> {
    return this.fetchApi<StaffUser>('/staff/profile');
  }

  // Housekeeping Staff Methods
  async getMyHousekeepingTasks(): Promise<HousekeepingTask[]> {
    const response = await this.fetchApi<{ content?: HousekeepingTask[] } | HousekeepingTask[]>('/staff/housekeeping/my-tasks');
    return Array.isArray(response) ? response : (response.content || []);
  }

  async updateHousekeepingTaskStatus(taskId: number, updateRequest: TaskUpdateRequest): Promise<void> {
    await this.fetchApi<void>(`/staff/housekeeping/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateRequest),
    });
  }

  async startHousekeepingTask(taskId: number): Promise<void> {
    await this.fetchApi<void>(`/staff/housekeeping/tasks/${taskId}/start`, {
      method: 'PUT',
    });
  }

  async completeHousekeepingTask(taskId: number, notes?: string): Promise<void> {
    await this.fetchApi<void>(`/staff/housekeeping/tasks/${taskId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  // Maintenance Staff Methods
  async getMyMaintenanceTasks(): Promise<MaintenanceTask[]> {
    const response = await this.fetchApi<{ content?: MaintenanceTask[] } | MaintenanceTask[]>('/staff/maintenance/my-tasks');
    return Array.isArray(response) ? response : (response.content || []);
  }

  async updateMaintenanceTaskStatus(taskId: number, updateRequest: MaintenanceUpdateRequest): Promise<void> {
    await this.fetchApi<void>(`/staff/maintenance/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateRequest),
    });
  }

  async startMaintenanceTask(taskId: number): Promise<void> {
    await this.fetchApi<void>(`/staff/maintenance/tasks/${taskId}/start`, {
      method: 'PUT',
    });
  }

  async completeMaintenanceTask(taskId: number, notes?: string): Promise<void> {
    await this.fetchApi<void>(`/staff/maintenance/tasks/${taskId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });
  }

  // Common methods for both staff types
  async getTaskHistory(staffType: 'HOUSEKEEPING' | 'MAINTENANCE'): Promise<any[]> {
    const endpoint = staffType === 'HOUSEKEEPING' 
      ? '/staff/housekeeping/history' 
      : '/staff/maintenance/history';
    const response = await this.fetchApi<{ content?: any[] } | any[]>(endpoint);
    return Array.isArray(response) ? response : (response.content || []);
  }

  async getStaffStats(staffType: 'HOUSEKEEPING' | 'MAINTENANCE'): Promise<any> {
    const endpoint = staffType === 'HOUSEKEEPING' 
      ? '/staff/housekeeping/stats' 
      : '/staff/maintenance/stats';
    return this.fetchApi<any>(endpoint);
  }
}

export const staffApi = new StaffApiService();
export default staffApi;

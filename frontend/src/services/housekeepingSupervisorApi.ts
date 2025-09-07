// Housekeeping Supervisor API Service
import { 
  HousekeepingTask, 
  HousekeepingStaff,
  CreateHousekeepingTaskRequest,
  StaffPerformance,
  PaginatedResponse
} from '../types/operations';
import TokenManager from '../utils/tokenManager';

import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

class HousekeepingSupervisorApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      ...TokenManager.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/housekeeping${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: /housekeeping${endpoint}`, error);
      throw error;
    }
  }

  // Task management
  async getTasks(page: number = 0, size: number = 10): Promise<PaginatedResponse<HousekeepingTask>> {
    return this.fetchApi<PaginatedResponse<HousekeepingTask>>(`/tasks?page=${page}&size=${size}`);
  }

  async createTask(task: CreateHousekeepingTaskRequest): Promise<HousekeepingTask> {
    return this.fetchApi<HousekeepingTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTaskStatus(taskId: number, status: string, notes?: string): Promise<HousekeepingTask> {
    return this.fetchApi<HousekeepingTask>(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async assignTask(taskId: number, staffId: number): Promise<void> {
    return this.fetchApi<void>(`/tasks/${taskId}/assign/${staffId}`, {
      method: 'PUT',
    });
  }

  // Staff management
  async getStaff(): Promise<HousekeepingStaff[]> {
    return this.fetchApi<HousekeepingStaff[]>('/staff');
  }

  async getStaffPerformance(staffId: number): Promise<StaffPerformance> {
    return this.fetchApi<StaffPerformance>(`/staff/${staffId}/performance`);
  }

  async getStaffTasks(staffId: number): Promise<HousekeepingTask[]> {
    return this.fetchApi<HousekeepingTask[]>(`/staff/${staffId}/tasks`);
  }

  // Room management
  async getRoomStatus(): Promise<any[]> {
    return this.fetchApi<any[]>('/rooms/status');
  }

  async updateRoomStatus(roomNumber: string, status: string): Promise<void> {
    return this.fetchApi<void>(`/rooms/${roomNumber}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const housekeepingSupervisorApi = new HousekeepingSupervisorApiService();
export default housekeepingSupervisorApi;
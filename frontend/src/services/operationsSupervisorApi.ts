// Operations Supervisor API Service
import { 
  HousekeepingTask, 
  MaintenanceRequest, 
  HousekeepingStaff,
  CreateHousekeepingTaskRequest,
  CreateMaintenanceRequestRequest,
  DashboardStats,
  RecentActivity,
  StaffPerformance,
  ApiResponse,
  PaginatedResponse
} from '../types/operations';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class OperationsSupervisorApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/supervisor${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: /supervisor${endpoint}`, error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.fetchApi<DashboardStats>('/dashboard');
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return this.fetchApi<RecentActivity[]>('/dashboard/recent-activity');
  }

  // Staff endpoints
  async getStaff(page: number = 0, size: number = 10): Promise<PaginatedResponse<HousekeepingStaff>> {
    return this.fetchApi<PaginatedResponse<HousekeepingStaff>>(`/staff?page=${page}&size=${size}`);
  }

  async getStaffTasks(staffId: number): Promise<HousekeepingTask[]> {
    return this.fetchApi<HousekeepingTask[]>(`/staff/${staffId}/tasks`);
  }

  async getStaffPerformance(staffId: number): Promise<StaffPerformance> {
    return this.fetchApi<StaffPerformance>(`/staff/${staffId}/performance`);
  }

  // Housekeeping task endpoints
  async getHousekeepingTasks(page: number = 0, size: number = 10): Promise<PaginatedResponse<HousekeepingTask>> {
    return this.fetchApi<PaginatedResponse<HousekeepingTask>>(`/tasks?page=${page}&size=${size}`);
  }

  async createHousekeepingTask(task: CreateHousekeepingTaskRequest): Promise<HousekeepingTask> {
    return this.fetchApi<HousekeepingTask>('/tasks/housekeeping', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async assignHousekeepingTask(taskId: number, staffId: number): Promise<void> {
    return this.fetchApi<void>(`/tasks/housekeeping/${taskId}/assign/${staffId}`, {
      method: 'PUT',
    });
  }

  async autoAssignHousekeepingTask(taskId: number): Promise<void> {
    return this.fetchApi<void>(`/tasks/housekeeping/${taskId}/auto-assign`, {
      method: 'PUT',
    });
  }

  // Maintenance request endpoints
  async getMaintenanceRequests(page: number = 0, size: number = 10): Promise<PaginatedResponse<MaintenanceRequest>> {
    return this.fetchApi<PaginatedResponse<MaintenanceRequest>>(`/maintenance?page=${page}&size=${size}`);
  }

  async createMaintenanceRequest(request: CreateMaintenanceRequestRequest): Promise<MaintenanceRequest> {
    return this.fetchApi<MaintenanceRequest>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async assignMaintenanceRequest(requestId: number, staffId: number): Promise<void> {
    return this.fetchApi<void>(`/maintenance/${requestId}/assign/${staffId}`, {
      method: 'PUT',
    });
  }
}

export const operationsSupervisorApi = new OperationsSupervisorApiService();
export default operationsSupervisorApi;
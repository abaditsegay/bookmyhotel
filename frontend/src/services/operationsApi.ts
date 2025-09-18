import {
  HousekeepingTask,
  MaintenanceTask,
  HousekeepingStaff,
  User,
  OperationsStats,
  StaffPerformance,
  RecentActivity,
  CreateHousekeepingTaskRequest,
  CreateMaintenanceTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  TaskFilters,
  StaffFilters,
  ApiResponse,
  PaginatedResponse,
  HousekeepingTaskStatus,
  MaintenanceTaskStatus
} from '../types/operations';
import TokenManager from '../utils/tokenManager';
import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

class OperationsApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      ...TokenManager.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Housekeeping Tasks
  async getHousekeepingTasks(
    page: number = 0,
    size: number = 20,
    filters?: TaskFilters
  ): Promise<PaginatedResponse<HousekeepingTask>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await this.fetchApi<PaginatedResponse<HousekeepingTask>>(
      `/housekeeping/tasks?${queryParams}`
    );
    return response.data;
  }

  async getHousekeepingTask(id: number): Promise<HousekeepingTask> {
    const response = await this.fetchApi<HousekeepingTask>(`/housekeeping/tasks/${id}`);
    return response.data;
  }

  async createHousekeepingTask(task: CreateHousekeepingTaskRequest): Promise<HousekeepingTask> {
    const response = await this.fetchApi<HousekeepingTask>('/housekeeping/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response.data;
  }

  async updateHousekeepingTaskStatus(
    id: number,
    statusUpdate: UpdateTaskStatusRequest
  ): Promise<HousekeepingTask> {
    const response = await this.fetchApi<HousekeepingTask>(
      `/housekeeping/tasks/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(statusUpdate),
      }
    );
    return response.data;
  }

  async assignHousekeepingTask(assignment: AssignTaskRequest): Promise<HousekeepingTask> {
    const response = await this.fetchApi<HousekeepingTask>(
      `/housekeeping/tasks/${assignment.taskId}/assign`,
      {
        method: 'PATCH',
        body: JSON.stringify({ staffId: assignment.staffId, notes: assignment.notes }),
      }
    );
    return response.data;
  }

  async deleteHousekeepingTask(id: number): Promise<void> {
    await this.fetchApi(`/housekeeping/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Maintenance Tasks
  async getMaintenanceTasks(
    page: number = 0,
    size: number = 20,
    filters?: TaskFilters
  ): Promise<PaginatedResponse<MaintenanceTask>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await this.fetchApi<PaginatedResponse<MaintenanceTask>>(
      `/maintenance/tasks?${queryParams}`
    );
    return response.data;
  }

  async getMaintenanceTask(id: number): Promise<MaintenanceTask> {
    const response = await this.fetchApi<MaintenanceTask>(`/maintenance/tasks/${id}`);
    return response.data;
  }

  async createMaintenanceTask(task: CreateMaintenanceTaskRequest): Promise<MaintenanceTask> {
    const response = await this.fetchApi<MaintenanceTask>('/maintenance/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response.data;
  }

  async updateMaintenanceTaskStatus(
    id: number,
    statusUpdate: UpdateTaskStatusRequest
  ): Promise<MaintenanceTask> {
    const response = await this.fetchApi<MaintenanceTask>(
      `/maintenance/tasks/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(statusUpdate),
      }
    );
    return response.data;
  }

  async assignMaintenanceTask(assignment: AssignTaskRequest): Promise<MaintenanceTask> {
    const response = await this.fetchApi<MaintenanceTask>(
      `/maintenance/tasks/${assignment.taskId}/assign`,
      {
        method: 'PATCH',
        body: JSON.stringify({ staffId: assignment.staffId, notes: assignment.notes }),
      }
    );
    return response.data;
  }

  async deleteMaintenanceTask(id: number): Promise<void> {
    await this.fetchApi(`/maintenance/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Staff Management
  async getHousekeepingStaff(filters?: StaffFilters): Promise<HousekeepingStaff[]> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await this.fetchApi<HousekeepingStaff[]>(
      `/housekeeping/staff?${queryParams}`
    );
    return response.data;
  }

  async getMaintenanceStaff(filters?: StaffFilters): Promise<User[]> {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await this.fetchApi<User[]>(`/maintenance/staff?${queryParams}`);
    return response.data;
  }

  // Dashboard and Analytics
  async getOperationsStats(): Promise<OperationsStats> {
    const response = await this.fetchApi<OperationsStats>('/operations/stats');
    return response.data;
  }

  async getStaffPerformance(): Promise<StaffPerformance[]> {
    const response = await this.fetchApi<StaffPerformance[]>('/operations/staff-performance');
    return response.data;
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const response = await this.fetchApi<RecentActivity[]>(
      `/operations/recent-activity?limit=${limit}`
    );
    return response.data;
  }

  // Task Assignment and Management
  async getMyTasks(userId: number): Promise<{
    housekeeping: HousekeepingTask[];
    maintenance: MaintenanceTask[];
  }> {
    const response = await this.fetchApi<{
      housekeeping: HousekeepingTask[];
      maintenance: MaintenanceTask[];
    }>(`/operations/my-tasks/${userId}`);
    return response.data;
  }

  async completeTask(
    taskId: number,
    taskType: 'housekeeping' | 'maintenance',
    completion: {
      notes?: string;
      actualDuration?: number;
      actualCost?: number;
      partsUsed?: string;
      rating?: number;
    }
  ): Promise<HousekeepingTask | MaintenanceTask> {
    const endpoint = taskType === 'housekeeping' 
      ? `/housekeeping/tasks/${taskId}/complete`
      : `/maintenance/tasks/${taskId}/complete`;

    const response = await this.fetchApi<HousekeepingTask | MaintenanceTask>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(completion),
    });
    return response.data;
  }

  // Batch Operations
  async bulkAssignTasks(assignments: {
    taskIds: number[];
    staffId: number;
    taskType: 'housekeeping' | 'maintenance';
    notes?: string;
  }): Promise<void> {
    const endpoint = assignments.taskType === 'housekeeping'
      ? '/housekeeping/tasks/bulk-assign'
      : '/maintenance/tasks/bulk-assign';

    await this.fetchApi(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(assignments),
    });
  }

  async bulkUpdateTaskStatus(updates: {
    taskIds: number[];
    status: HousekeepingTaskStatus | MaintenanceTaskStatus;
    taskType: 'housekeeping' | 'maintenance';
    notes?: string;
  }): Promise<void> {
    const endpoint = updates.taskType === 'housekeeping'
      ? '/housekeeping/tasks/bulk-status'
      : '/maintenance/tasks/bulk-status';

    await this.fetchApi(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Reports and Analytics
  async getTaskReport(
    taskType: 'housekeeping' | 'maintenance',
    startDate: string,
    endDate: string
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/operations/reports/${taskType}?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: TokenManager.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return await response.blob();
  }

  async getStaffProductivityReport(staffId: number, period: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/operations/reports/staff/${staffId}/productivity?period=${period}`,
      {
        headers: TokenManager.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate productivity report');
    }

    return await response.blob();
  }
}

export const operationsApi = new OperationsApiService();
export default operationsApi;

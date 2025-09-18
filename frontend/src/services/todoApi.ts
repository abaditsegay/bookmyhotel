import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import { apiClient } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';

export interface Todo {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodoFilters {
  completed?: boolean;
  sortBy?: 'priority' | 'dueDate' | 'created' | 'alphabetical';
}

class TodoApiService {
  private token: string | null = null;
  private tenantId: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  setTenantId(tenantId: string | null) {
    this.tenantId = tenantId;
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Set token and tenant ID in the API client
    apiClient.setToken(this.token);
    apiClient.setTenantId(this.tenantId);

    // Use the centralized API client
    const response = await apiClient.request<T>(endpoint, options);
    
    if (!response.success) {
      throw new Error(response.error || 'API call failed');
    }

    return response.data as T;
  }

  async getTodos(): Promise<Todo[]> {
    return this.fetchApi<Todo[]>(API_ENDPOINTS.TODOS.LIST);
  }

  async getFilteredTodos(filters: TodoFilters): Promise<Todo[]> {
    const params = new URLSearchParams();
    if (filters.completed !== undefined) {
      params.append('completed', filters.completed.toString());
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    
    const query = params.toString();
    return this.fetchApi<Todo[]>(`${API_ENDPOINTS.TODOS.FILTERED}${query ? `?${query}` : ''}`);
  }

  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    return this.fetchApi<Todo>(API_ENDPOINTS.TODOS.LIST, {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  async updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
    return this.fetchApi<Todo>(API_ENDPOINTS.TODOS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(todo),
    });
  }

  async toggleTodoCompletion(id: number): Promise<Todo> {
    return this.fetchApi<Todo>(API_ENDPOINTS.TODOS.TOGGLE(id), {
      method: 'PATCH',
    });
  }

  async deleteTodo(id: number): Promise<void> {
    return this.fetchApi<void>(API_ENDPOINTS.TODOS.BY_ID(id), {
      method: 'DELETE',
    });
  }

  async getPendingTodosCount(): Promise<number> {
    return this.fetchApi<number>(API_ENDPOINTS.TODOS.PENDING_COUNT);
  }

  async getOverdueTodos(): Promise<Todo[]> {
    return this.fetchApi<Todo[]>(API_ENDPOINTS.TODOS.OVERDUE);
  }
}

export const todoApiService = new TodoApiService();

export const useTodoApi = () => {
  const { tenantId } = useAuthenticatedApi();
  
  // Set tenant ID when it's available
  if (tenantId) {
    todoApiService.setTenantId(tenantId);
  }

  return todoApiService;
};

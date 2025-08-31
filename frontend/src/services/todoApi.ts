import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';

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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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

    // Add tenant ID header if available
    if (this.tenantId) {
      headers['X-Tenant-ID'] = this.tenantId;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as unknown as T;
    }
  }

  async getTodos(): Promise<Todo[]> {
    return this.fetchApi<Todo[]>('/todos');
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
    return this.fetchApi<Todo[]>(`/todos/filtered${query ? `?${query}` : ''}`);
  }

  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    return this.fetchApi<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    });
  }

  async updateTodo(id: number, todo: Partial<Todo>): Promise<Todo> {
    return this.fetchApi<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
    });
  }

  async toggleTodoCompletion(id: number): Promise<Todo> {
    return this.fetchApi<Todo>(`/todos/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async deleteTodo(id: number): Promise<void> {
    return this.fetchApi<void>(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  async getPendingTodosCount(): Promise<number> {
    return this.fetchApi<number>('/todos/pending/count');
  }

  async getOverdueTodos(): Promise<Todo[]> {
    return this.fetchApi<Todo[]>('/todos/overdue');
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

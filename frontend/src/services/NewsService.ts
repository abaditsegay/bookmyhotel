// News Service for hotel news and announcements
import TokenManager from '../utils/tokenManager';

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'housekeeping' | 'management';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorName: string;
  isActive: boolean;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'housekeeping' | 'management';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class NewsService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      ...TokenManager.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/news${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: /news${endpoint}`, error);
      throw error;
    }
  }

  async getNews(category?: string): Promise<NewsItem[]> {
    const params = category ? `?category=${category}` : '';
    return this.fetchApi<NewsItem[]>(`${params}`);
  }

  async getNewsById(id: number): Promise<NewsItem> {
    return this.fetchApi<NewsItem>(`/${id}`);
  }

  async createNews(news: CreateNewsRequest): Promise<NewsItem> {
    return this.fetchApi<NewsItem>('', {
      method: 'POST',
      body: JSON.stringify(news),
    });
  }

  async updateNews(id: number, news: Partial<CreateNewsRequest>): Promise<NewsItem> {
    return this.fetchApi<NewsItem>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(news),
    });
  }

  async deleteNews(id: number): Promise<void> {
    return this.fetchApi<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async getLatestNews(limit: number = 5): Promise<NewsItem[]> {
    return this.fetchApi<NewsItem[]>(`/latest?limit=${limit}`);
  }
}

export const newsService = new NewsService();
export default newsService;
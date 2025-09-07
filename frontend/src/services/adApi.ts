// Advertisement API service

export interface AdResponse {
  id: number;
  hotelId: number;
  hotelName: string;
  hotelLocation: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
  validUntil: string;
  isActive: boolean;
  priorityLevel: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdRequest {
  hotelId: number;
  title: string;
  description?: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercentage?: number;
  validUntil: string;
  isActive?: boolean;
  priorityLevel?: number;
}

import TokenManager from '../utils/tokenManager';
import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

class AdApiService {
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
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as unknown as T;
    }
  }

  // Public endpoint - get random active ads for home page
  async getRandomActiveAds(limit: number = 5): Promise<AdResponse[]> {
    return this.fetchApi<AdResponse[]>(`/ads/random?limit=${limit}`);
  }

  // Public endpoint - get ads by priority
  async getActiveAdsByPriority(limit: number = 10): Promise<AdResponse[]> {
    return this.fetchApi<AdResponse[]>(`/ads/priority?limit=${limit}`);
  }

  // Public endpoint - track ad click
  async trackAdClick(id: number): Promise<void> {
    return this.fetchApi<void>(`/ads/${id}/click`, {
      method: 'POST'
    });
  }

  // Protected endpoints (require authentication)
  
  // Get all ads with pagination
  async getAllAds(page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc'): Promise<{
    content: AdResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });
    return this.fetchApi<{
      content: AdResponse[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/ads?${params}`);
  }

  // Get ads by hotel
  async getAdsByHotel(hotelId: number, page: number = 0, size: number = 10): Promise<{
    content: AdResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    return this.fetchApi<{
      content: AdResponse[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/ads/hotel/${hotelId}?${params}`);
  }

  // Get ad by ID
  async getAdById(id: number): Promise<AdResponse> {
    return this.fetchApi<AdResponse>(`/ads/${id}`);
  }

  // Create new ad
  async createAd(adRequest: AdRequest): Promise<AdResponse> {
    return this.fetchApi<AdResponse>('/ads', {
      method: 'POST',
      body: JSON.stringify(adRequest)
    });
  }

  // Update ad
  async updateAd(id: number, adRequest: AdRequest): Promise<AdResponse> {
    return this.fetchApi<AdResponse>(`/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adRequest)
    });
  }

  // Delete ad
  async deleteAd(id: number): Promise<void> {
    return this.fetchApi<void>(`/ads/${id}`, {
      method: 'DELETE'
    });
  }

  // Toggle ad status
  async toggleAdStatus(id: number): Promise<AdResponse> {
    return this.fetchApi<AdResponse>(`/ads/${id}/toggle`, {
      method: 'PATCH'
    });
  }
}

// Create and export a singleton instance
const adApiService = new AdApiService();
export default adApiService;

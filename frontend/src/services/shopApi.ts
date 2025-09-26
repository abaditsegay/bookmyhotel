import { 
  Product, 
  ProductCreateRequest, 
  ProductUpdateRequest,
  ShopOrder,
  ShopOrderCreateRequest,
  RoomCharge,
  RoomChargeCreateRequest,
  ShopDashboardStats,
  ProductStock
} from '../types/shop';

import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ShopApiService {
  private token: string | null = null;
  private tenantId: string | null = null;

  setToken(token: string | null) {
    console.log('🔑 ShopApiService.setToken called with:', token ? `token of length ${token.length}` : 'null');
    this.token = token;
    
    // Log first and last few characters for debugging (don't log full token for security)
    if (token) {
      const preview = `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
      console.log('🔑 Token preview:', preview);
    }
  }

  setTenantId(tenantId: string | null) {
    console.log('🏨 ShopApiService.setTenantId called with:', tenantId);
    this.tenantId = tenantId;
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token is available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('🔐 Shop API: Using auth token (length:', this.token.length, ')');
    } else {
      console.warn('⚠️ Shop API: No token available for authentication');
    }

    // Add tenant ID header if available
    if (this.tenantId) {
      headers['X-Tenant-ID'] = this.tenantId;
      console.log('🏨 Shop API: Using tenant ID:', this.tenantId);
    } else {
      console.warn('⚠️ Shop API: No tenant ID available');
    }

    console.log('📤 Shop API Headers:', Object.keys(headers));
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Product Management - hotel-scoped endpoints
  async getProducts(
    hotelId: number, 
    options?: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
      search?: string;
      category?: string;
      activeOnly?: boolean;
      availableOnly?: boolean;
    }
  ): Promise<{ content: Product[], totalElements: number, totalPages: number, number: number, size: number }> {
    const params = new URLSearchParams();
    
    if (options?.page !== undefined) params.append('page', options.page.toString());
    if (options?.size !== undefined) params.append('size', options.size.toString());
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortDir) params.append('sortDir', options.sortDir);
    if (options?.search) params.append('search', options.search);
    if (options?.category) params.append('category', options.category);
    if (options?.activeOnly !== undefined) params.append('activeOnly', options.activeOnly.toString());
    if (options?.availableOnly !== undefined) params.append('availableOnly', options.availableOnly.toString());

    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: Product[], totalElements: number, totalPages: number, number: number, size: number }>(response);
  }

  async getProduct(hotelId: number, productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/${productId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Product>(response);
  }

  async createProduct(hotelId: number, product: ProductCreateRequest): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product),
    });
    return this.handleResponse<Product>(response);
  }

  async updateProduct(hotelId: number, productId: number, product: ProductUpdateRequest): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/${productId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product),
    });
    return this.handleResponse<Product>(response);
  }

  async deleteProduct(hotelId: number, productId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
  }

  async getProductsByCategory(hotelId: number, category: string, page = 0, size = 20): Promise<{ content: Product[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/category/${category}?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: Product[], totalElements: number }>(response);
  }

  async getActiveProducts(hotelId: number, page = 0, size = 20): Promise<{ content: Product[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/active?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: Product[], totalElements: number }>(response);
  }

  async getAvailableProducts(hotelId: number, page = 0, size = 20): Promise<{ content: Product[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/available?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: Product[], totalElements: number }>(response);
  }

  async toggleProductStatus(hotelId: number, productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/${productId}/toggle-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Product>(response);
  }

  async toggleProductActive(hotelId: number, productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/${productId}/toggle-active`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Product>(response);
  }

  async toggleProductAvailable(hotelId: number, productId: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/${productId}/toggle-available`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Product>(response);
  }

  async updateProductStock(hotelId: number, productId: number, newStock: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/${productId}/stock?quantity=${newStock}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Product>(response);
  }

  async searchProducts(hotelId: number, query: string, page = 0, size = 20): Promise<{ content: Product[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: Product[], totalElements: number }>(response);
  }

  // Inventory Management - hotel-scoped endpoints  
  async getProductStock(hotelId: number, page = 0, size = 20): Promise<{ content: ProductStock[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/inventory/stock?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: ProductStock[], totalElements: number }>(response);
  }

  async getLowStockProducts(
    hotelId: number, 
    page = 0, 
    size = 20
  ): Promise<{ content: Product[], totalElements: number, totalPages: number, number: number, size: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/dashboard/low-stock?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: Product[], totalElements: number, totalPages: number, number: number, size: number }>(response);
  }

  async getOutOfStockProducts(hotelId: number): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/inventory/out-of-stock`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Product[]>(response);
  }

  async getInventorySummary(hotelId: number): Promise<{ totalProducts: number, lowStockProducts: number, outOfStockProducts: number, activeProducts: number }> {
    try {
      console.info(`📦 Fetching inventory summary for hotel ${hotelId}`);
      const url = `${API_BASE_URL}/hotels/${hotelId}/shop/inventory/summary`;
      const headers = this.getAuthHeaders();
      
      console.info(`📤 Making request to: ${url}`);
      console.info(`📤 Request headers:`, Object.keys(headers));
      
      const response = await fetch(url, { headers });
      
      console.info(`📥 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Inventory summary API returned ${response.status}: ${response.statusText}`);
        console.error(`❌ Error details:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await this.handleResponse<{ totalProducts: number, lowStockProducts: number, outOfStockProducts: number, activeProducts: number }>(response);
      console.info(`✅ Inventory summary result:`, result);
      return result;
    } catch (error) {
      console.error('💥 Error fetching inventory summary:', error);
      throw error;
    }
  }

  async searchInventory(hotelId: number, query: string, page = 0, size = 20): Promise<{ content: ProductStock[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/inventory/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: ProductStock[], totalElements: number }>(response);
  }

  // Order Management - hotel-scoped endpoints
  async getOrders(hotelId: number, page = 0, size = 20): Promise<{ content: ShopOrder[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: ShopOrder[], totalElements: number }>(response);
  }

  async getOrder(hotelId: number, orderId: number): Promise<ShopOrder> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ShopOrder>(response);
  }

  async getOrderByNumber(hotelId: number, orderNumber: string): Promise<ShopOrder> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders/by-number/${orderNumber}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ShopOrder>(response);
  }

  async createOrder(hotelId: number, order: ShopOrderCreateRequest): Promise<ShopOrder> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(order),
    });
    return this.handleResponse<ShopOrder>(response);
  }

  async updateOrderStatus(hotelId: number, orderId: number, status: string): Promise<ShopOrder> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders/${orderId}/status?status=${status}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ShopOrder>(response);
  }

  async markOrderAsPaid(hotelId: number, orderId: number, paymentReference?: string): Promise<ShopOrder> {
    const url = `${API_BASE_URL}/hotels/${hotelId}/shop/orders/${orderId}/mark-paid${paymentReference ? `?paymentReference=${paymentReference}` : ''}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ShopOrder>(response);
  }

  async toggleOrderStatus(hotelId: number, orderId: number): Promise<ShopOrder> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders/${orderId}/toggle-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ShopOrder>(response);
  }

  async cancelOrder(hotelId: number, orderId: number, reason?: string): Promise<ShopOrder> {
    const url = `${API_BASE_URL}/hotels/${hotelId}/shop/orders/${orderId}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ShopOrder>(response);
  }

  async getPendingOrders(hotelId: number): Promise<ShopOrder[]> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders/pending`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ShopOrder[]>(response);
  }

  async getTodaysOrders(hotelId: number): Promise<ShopOrder[]> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders/today`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ShopOrder[]>(response);
  }

  async getOrdersByStatus(hotelId: number, status: string, page = 0, size = 20): Promise<{ content: ShopOrder[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders?status=${status}&page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: ShopOrder[], totalElements: number }>(response);
  }

  async searchOrders(hotelId: number, query: string, page = 0, size = 20): Promise<{ content: ShopOrder[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders?search=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: ShopOrder[], totalElements: number }>(response);
  }

  async getOrderStatistics(hotelId: number): Promise<any> {
    try {
      console.info(`📊 Fetching order statistics for hotel ${hotelId}`);
      const url = `${API_BASE_URL}/hotels/${hotelId}/shop/orders/statistics`;
      const headers = this.getAuthHeaders();
      
      console.info(`📤 Making request to: ${url}`);
      console.info(`📤 Request headers:`, Object.keys(headers));
      
      const response = await fetch(url, { headers });
      
      console.info(`📥 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Order statistics API returned ${response.status}: ${response.statusText}`);
        console.error(`❌ Error details:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await this.handleResponse<any>(response);
      console.info(`✅ Order statistics result:`, result);
      return result;
    } catch (error) {
      console.error('💥 Error fetching order statistics:', error);
      throw error;
    }
  }

  async getOrderStatuses(): Promise<string[]> {
    // This endpoint doesn't need hotelId since it just returns enum values
    // Use a generic endpoint that doesn't require hotel-specific routing
    const response = await fetch(`${API_BASE_URL}/shop/orders/statuses`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<string[]>(response);
  }

  // Dashboard and Analytics - improved backend-driven implementation
  async getDashboardStats(hotelId: number): Promise<ShopDashboardStats> {
    if (!this.token || !this.tenantId) {
      console.error('❌ Shop API: No token or tenant ID set for dashboard stats');
      throw new Error('Authentication required');
    }

    console.log('📊 Shop API: Getting consolidated dashboard stats...');
    
    try {
      // First, try to get consolidated stats from the new dedicated dashboard endpoint
      const response = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}/shop/dashboard/stats`, {
        headers: this.getAuthHeaders(),
      });
      
      console.log(`📊 Dashboard stats response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend dashboard stats loaded successfully:', data);
        return data;
      } else {
        console.warn(`⚠️ Backend dashboard endpoint failed with ${response.status}, falling back to aggregated approach`);
      }
      
    } catch (error) {
      console.warn('⚠️ Backend dashboard endpoint error, falling back to aggregated approach:', error);
    }

    // Fallback implementation: aggregate data from multiple backend endpoints
    console.info('📊 Using aggregated approach for dashboard statistics');
    
    try {
      const [inventorySummary, orderStats] = await Promise.all([
        this.getInventorySummary(hotelId).then(result => {
          console.info('Inventory summary fetched successfully:', result);
          return result;
        }).catch(err => {
          console.error('Failed to get inventory summary:', err);
          // Return default structure that matches the backend InventorySummary
          return { totalProducts: 0, activeProducts: 0, lowStockProducts: 0, outOfStockProducts: 0 };
        }),
        this.getOrderStatistics(hotelId).then(result => {
          console.info('Order statistics fetched successfully:', result);
          return result;
        }).catch(err => {
          console.error('Failed to get order statistics:', err);
          // Return default structure that matches the backend OrderStatistics
          return { 
            totalOrders: 0, 
            pendingOrders: 0, 
            completedOrders: 0, 
            totalRevenue: 0, 
            todayOrders: 0, 
            todayRevenue: 0, 
            monthlyRevenue: 0, 
            topSellingProducts: [] 
          };
        })
      ]);

      const dashboardStats: ShopDashboardStats = {
        totalProducts: Number(inventorySummary.totalProducts) || 0,
        activeProducts: Number(inventorySummary.activeProducts) || 0,
        lowStockProducts: Number(inventorySummary.lowStockProducts) || 0,
        outOfStockProducts: Number(inventorySummary.outOfStockProducts) || 0,
        totalOrders: Number(orderStats.totalOrders) || 0,
        pendingOrders: Number(orderStats.pendingOrders) || 0,
        completedOrders: Number(orderStats.completedOrders) || 0,
        totalRevenue: Number(orderStats.totalRevenue) || 0,
        todayOrders: Number(orderStats.todayOrders) || 0,
        todayRevenue: Number(orderStats.todayRevenue) || 0,
        monthlyRevenue: Number(orderStats.monthlyRevenue) || 0,
        topSellingProducts: orderStats.topSellingProducts || [],
      };

      console.info('Dashboard stats aggregated successfully:', dashboardStats);
      return dashboardStats;
    } catch (error) {
      console.error('Error getting dashboard stats from aggregated data:', error);
      
      // Return empty stats with proper logging
      const emptyStats = {
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        todayRevenue: 0,
        monthlyRevenue: 0,
        topSellingProducts: [],
      };
      
      console.warn('Returning empty dashboard stats due to errors');
      return emptyStats;
    }
  }

  // Room Charges Management - would need backend implementation
  async getRoomCharges(hotelId: number): Promise<RoomCharge[]> {
    // This would need to be implemented in the backend
    // For now, return empty array
    return [];
  }

  async createRoomCharge(hotelId: number, roomCharge: RoomChargeCreateRequest): Promise<RoomCharge> {
    // This would need to be implemented in the backend
    throw new Error('Room charges endpoint not implemented yet');
  }

  async markRoomChargePaid(hotelId: number, id: number, paymentReference?: string): Promise<RoomCharge> {
    // This would need to be implemented in the backend
    throw new Error('Room charges endpoint not implemented yet');
  }

  async getRoomChargesByReservation(hotelId: number, reservationId: number): Promise<RoomCharge[]> {
    // This would need to be implemented in the backend
    return [];
  }
}

export const shopApiService = new ShopApiService();
export default shopApiService;

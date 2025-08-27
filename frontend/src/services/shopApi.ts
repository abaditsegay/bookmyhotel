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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ShopApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // Product Management - hotel-scoped endpoints
  async getProducts(hotelId: number, page = 0, size = 20): Promise<{ content: Product[], totalElements: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/products?page=${page}&size=${size}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ content: Product[], totalElements: number }>(response);
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

  async getLowStockProducts(hotelId: number, threshold = 10): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/inventory/low-stock?threshold=${threshold}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Product[]>(response);
  }

  async getOutOfStockProducts(hotelId: number): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/inventory/out-of-stock`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Product[]>(response);
  }

  async getInventorySummary(hotelId: number): Promise<{ totalProducts: number, lowStockProducts: number, outOfStockProducts: number, activeProducts: number }> {
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/inventory/summary`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ totalProducts: number, lowStockProducts: number, outOfStockProducts: number, activeProducts: number }>(response);
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
    const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}/shop/orders/statistics`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<any>(response);
  }

  async getOrderStatuses(): Promise<string[]> {
    // This endpoint doesn't need hotelId since it just returns enum values
    const response = await fetch(`${API_BASE_URL}/hotels/1/shop/orders/statuses`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<string[]>(response);
  }

  // Dashboard and Analytics - placeholder endpoints
  async getDashboardStats(hotelId: number): Promise<ShopDashboardStats> {
    // This would need to be implemented in the backend
    // For now, we can aggregate data from other endpoints
    try {
      const [inventorySummary, orderStats] = await Promise.all([
        this.getInventorySummary(hotelId),
        this.getOrderStatistics(hotelId)
      ]);

      return {
        totalProducts: inventorySummary.totalProducts,
        activeProducts: inventorySummary.activeProducts,
        lowStockProducts: inventorySummary.lowStockProducts,
        outOfStockProducts: inventorySummary.outOfStockProducts,
        totalOrders: orderStats.totalOrders || 0,
        pendingOrders: orderStats.pendingOrders || 0,
        completedOrders: orderStats.completedOrders || 0,
        totalRevenue: orderStats.totalRevenue || 0,
        todayOrders: orderStats.todayOrders || 0,
        todayRevenue: orderStats.todayRevenue || 0,
        monthlyRevenue: orderStats.monthlyRevenue || 0,
        topSellingProducts: orderStats.topSellingProducts || [],
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
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

import { RoomCharge, RoomChargeCreateRequest } from '../types/shop';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class RoomChargeApiService {
  private getAuthHeaders() {
    // Use the same token key as AuthContext for consistency
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Handle empty responses (like for DELETE requests)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Create a new room charge
  async createRoomCharge(request: RoomChargeCreateRequest): Promise<RoomCharge> {
    return this.request<RoomCharge>('/api/room-charges', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get room charges for a hotel with pagination
  async getRoomChargesForHotel(hotelId: number, page: number = 0, size: number = 20): Promise<{
    content: RoomCharge[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return this.request<{
      content: RoomCharge[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/api/room-charges/hotel/${hotelId}?page=${page}&size=${size}`);
  }

  // Get room charges for a specific reservation
  async getRoomChargesForReservation(reservationId: number): Promise<RoomCharge[]> {
    return this.request<RoomCharge[]>(`/api/room-charges/reservation/${reservationId}`);
  }

  // Get unpaid room charges for a reservation
  async getUnpaidChargesForReservation(reservationId: number): Promise<RoomCharge[]> {
    return this.request<RoomCharge[]>(`/api/room-charges/reservation/${reservationId}/unpaid`);
  }

  // Get total unpaid amount for a reservation
  async getTotalUnpaidAmount(reservationId: number): Promise<number> {
    return this.request<number>(`/api/room-charges/reservation/${reservationId}/unpaid-total`);
  }

  // Mark a room charge as paid
  async markChargeAsPaid(chargeId: number, paymentReference?: string): Promise<RoomCharge> {
    const params = paymentReference ? `?paymentReference=${encodeURIComponent(paymentReference)}` : '';
    return this.request<RoomCharge>(`/api/room-charges/${chargeId}/mark-paid${params}`, {
      method: 'PUT',
    });
  }

  // Mark a room charge as unpaid
  async markChargeAsUnpaid(chargeId: number): Promise<RoomCharge> {
    return this.request<RoomCharge>(`/api/room-charges/${chargeId}/mark-unpaid`, {
      method: 'PUT',
    });
  }

  // Delete a room charge
  async deleteRoomCharge(chargeId: number): Promise<void> {
    return this.request<void>(`/api/room-charges/${chargeId}`, {
      method: 'DELETE',
    });
  }

  // Search room charges
  async searchRoomCharges(hotelId: number, searchTerm: string, page: number = 0, size: number = 20): Promise<{
    content: RoomCharge[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    return this.request<{
      content: RoomCharge[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
    }>(`/api/room-charges/hotel/${hotelId}/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`);
  }
}

export const roomChargeApiService = new RoomChargeApiService();

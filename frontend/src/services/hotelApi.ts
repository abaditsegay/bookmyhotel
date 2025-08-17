// Hotel and booking API service

import { 
  HotelSearchRequest, 
  HotelSearchResult, 
  BookingRequest, 
  BookingResponse,
  AvailableRoom 
} from '../types/hotel';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class HotelApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Hotel search methods
  async searchHotels(searchRequest: HotelSearchRequest): Promise<HotelSearchResult[]> {
    return this.fetchApi<HotelSearchResult[]>('/hotels/search', {
      method: 'POST',
      body: JSON.stringify(searchRequest),
    });
  }

  async getHotelDetails(
    hotelId: number, 
    checkInDate?: string, 
    checkOutDate?: string, 
    guests?: number
  ): Promise<HotelSearchResult> {
    const params = new URLSearchParams();
    if (checkInDate) params.append('checkInDate', checkInDate);
    if (checkOutDate) params.append('checkOutDate', checkOutDate);
    if (guests) params.append('guests', guests.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetchApi<HotelSearchResult>(`/hotels/${hotelId}${query}`);
  }

  async getAvailableRooms(
    hotelId: number,
    checkInDate?: string,
    checkOutDate?: string,
    guests?: number,
    roomType?: string
  ): Promise<AvailableRoom[]> {
    const params = new URLSearchParams();
    if (checkInDate) params.append('checkInDate', checkInDate);
    if (checkOutDate) params.append('checkOutDate', checkOutDate);
    if (guests) params.append('guests', guests.toString());
    if (roomType) params.append('roomType', roomType);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetchApi<AvailableRoom[]>(`/hotels/${hotelId}/rooms${query}`);
  }

  // Booking methods
  async createBooking(bookingRequest: BookingRequest): Promise<BookingResponse> {
    return this.fetchApi<BookingResponse>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingRequest),
    });
  }

  async getBooking(reservationId: number): Promise<BookingResponse> {
    return this.fetchApi<BookingResponse>(`/bookings/${reservationId}`);
  }

  async cancelBooking(reservationId: number): Promise<BookingResponse> {
    return this.fetchApi<BookingResponse>(`/bookings/${reservationId}`, {
      method: 'DELETE',
    });
  }

  async getUserBookings(userId: number): Promise<BookingResponse[]> {
    return this.fetchApi<BookingResponse[]>(`/bookings/user/${userId}`);
  }
}

export const hotelApiService = new HotelApiService();

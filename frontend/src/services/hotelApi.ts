// Hotel and booking API service

import { 
  HotelSearchRequest, 
  HotelSearchResult, 
  BookingRequest, 
  BookingResponse,
  AvailableRoom,
  BookingModificationRequest,
  BookingModificationResponse,
  BookingCancellationRequest,
  BookingCancellationResponse
} from '../types/hotel';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class HotelApiService {
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

  // Public hotel search (without tenant context for anonymous users)
  async searchHotelsPublic(searchRequest: HotelSearchRequest): Promise<HotelSearchResult[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Deliberately NOT adding Authorization or X-Tenant-ID headers for public search
    const response = await fetch(`${API_BASE_URL}/hotels/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(searchRequest),
    });

    if (!response.ok) {
      throw new Error(`Public Hotel Search Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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

  // Public random hotels for advertisement display
  async getRandomHotels(): Promise<HotelSearchResult[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Public endpoint - no auth required
    const response = await fetch(`${API_BASE_URL}/hotels/random`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Random Hotels Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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
    // Use different endpoints based on booking type
    const endpoint = bookingRequest.roomId ? '/bookings' : '/bookings/room-type';
    
    // For room-type bookings (public booking flow), don't send tenant header
    // Let the backend determine the tenant from the hotel being booked
    if (!bookingRequest.roomId) {
      // Make request without tenant header for cross-tenant booking
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token is available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingRequest),
      });

      if (!response.ok) {
        // Try to get the actual error message from the response
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`);
        } catch (jsonError) {
          // If we can't parse the JSON, fall back to the status text
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
      }

      return response.json();
    }
    
    // For specific room bookings, use the normal fetchApi with tenant context
    return this.fetchApi<BookingResponse>(endpoint, {
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

  // Email booking confirmation
  async sendBookingEmail(reservationId: number, emailAddress: string, includeItinerary: boolean = true): Promise<void> {
    await this.fetchApi<void>(`/bookings/${reservationId}/email`, {
      method: 'POST',
      body: JSON.stringify({
        emailAddress,
        includeItinerary
      }),
    });
  }

  // Download booking PDF
  async downloadBookingPDF(reservationId: number): Promise<void> {
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token is available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/bookings/${reservationId}/pdf`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`PDF Download Error: ${response.status} ${response.statusText}`);
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-confirmation-${reservationId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Search booking by confirmation number or email/name
  async searchBooking(confirmationNumber?: string, email?: string, lastName?: string): Promise<BookingResponse> {
    const params = new URLSearchParams();
    if (confirmationNumber) params.append('confirmationNumber', confirmationNumber);
    if (email) params.append('email', email);
    if (lastName) params.append('lastName', lastName);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetchApi<BookingResponse>(`/bookings/search${query}`);
  }

  // Booking modification
  async modifyBooking(modificationRequest: BookingModificationRequest): Promise<BookingModificationResponse> {
    return this.fetchApi<BookingModificationResponse>('/bookings/modify', {
      method: 'PUT',
      body: JSON.stringify(modificationRequest),
    });
  }

  // Booking cancellation
  async cancelBookingGuest(cancellationRequest: BookingCancellationRequest): Promise<BookingCancellationResponse> {
    return this.fetchApi<BookingCancellationResponse>('/bookings/cancel', {
      method: 'POST',
      body: JSON.stringify(cancellationRequest),
    });
  }
}

export const hotelApiService = new HotelApiService();

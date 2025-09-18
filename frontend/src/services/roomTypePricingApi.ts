// Room Type Pricing API Service
import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface RoomTypePricingRequest {
  roomType: string;
  basePricePerNight: number;
  weekendMultiplier?: number;
  holidayMultiplier?: number;
  peakSeasonMultiplier?: number;
  isActive?: boolean;
  currency?: string;
  description?: string;
}

export interface RoomTypePricingResponse {
  id: number;
  roomType: string;
  basePricePerNight: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  peakSeasonMultiplier: number;
  isActive: boolean;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Create authenticated fetch request headers
 */
const createAuthHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

class RoomTypePricingService {
  private baseUrl = `${API_BASE_URL}/hotel-admin/room-type-pricing`;

  /**
   * Transform backend response (actual prices) to frontend format (multipliers)
   */
  private transformResponse(backendData: any): RoomTypePricingResponse {
    return {
      id: backendData.id,
      roomType: backendData.roomType,
      basePricePerNight: backendData.basePricePerNight,
      weekendMultiplier: backendData.weekendPrice && backendData.basePricePerNight > 0 
        ? backendData.weekendPrice / backendData.basePricePerNight 
        : 1.2,
      holidayMultiplier: backendData.holidayPrice && backendData.basePricePerNight > 0
        ? backendData.holidayPrice / backendData.basePricePerNight
        : 1.5,
      peakSeasonMultiplier: backendData.peakSeasonPrice && backendData.basePricePerNight > 0
        ? backendData.peakSeasonPrice / backendData.basePricePerNight
        : 1.3,
      isActive: backendData.isActive,
      currency: backendData.currency,
      description: backendData.description,
      createdAt: backendData.createdAt,
      updatedAt: backendData.updatedAt
    };
  }

  /**
   * Get all room type pricing for the authenticated hotel admin
   */
  async getRoomTypePricing(token: string): Promise<ApiResponse<RoomTypePricingResponse[]>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch room type pricing');
      }

      const backendData = await response.json();
      const transformedData = backendData.map((item: any) => this.transformResponse(item));
      
      return {
        success: true,
        data: transformedData,
        message: 'Room type pricing fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching room type pricing:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch room type pricing'
      };
    }
  }

  /**
   * Save new room type pricing
   */
  async saveRoomTypePricing(token: string, pricing: RoomTypePricingRequest): Promise<ApiResponse<RoomTypePricingResponse>> {
    try {
      // Transform multipliers to actual prices for backend
      const transformedPricing = {
        roomType: pricing.roomType,
        basePricePerNight: pricing.basePricePerNight,
        weekendPrice: pricing.weekendMultiplier ? pricing.basePricePerNight * pricing.weekendMultiplier : undefined,
        holidayPrice: pricing.holidayMultiplier ? pricing.basePricePerNight * pricing.holidayMultiplier : undefined,
        peakSeasonPrice: pricing.peakSeasonMultiplier ? pricing.basePricePerNight * pricing.peakSeasonMultiplier : undefined,
        isActive: pricing.isActive,
        currency: pricing.currency,
        description: pricing.description
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(transformedPricing)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save room type pricing');
      }

      const backendData = await response.json();
      return {
        success: true,
        data: this.transformResponse(backendData),
        message: 'Room type pricing saved successfully'
      };
    } catch (error) {
      console.error('Error saving room type pricing:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save room type pricing'
      };
    }
  }

  /**
   * Update existing room type pricing
   */
  async updateRoomTypePricing(token: string, id: number, pricing: RoomTypePricingRequest): Promise<ApiResponse<RoomTypePricingResponse>> {
    try {
      // Transform multipliers to actual prices for backend
      const transformedPricing = {
        roomType: pricing.roomType,
        basePricePerNight: pricing.basePricePerNight,
        weekendPrice: pricing.weekendMultiplier ? pricing.basePricePerNight * pricing.weekendMultiplier : undefined,
        holidayPrice: pricing.holidayMultiplier ? pricing.basePricePerNight * pricing.holidayMultiplier : undefined,
        peakSeasonPrice: pricing.peakSeasonMultiplier ? pricing.basePricePerNight * pricing.peakSeasonMultiplier : undefined,
        isActive: pricing.isActive,
        currency: pricing.currency,
        description: pricing.description
      };

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(token),
        body: JSON.stringify(transformedPricing)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update room type pricing');
      }

      const backendData = await response.json();
      return {
        success: true,
        data: this.transformResponse(backendData),
        message: 'Room type pricing updated successfully'
      };
    } catch (error) {
      console.error('Error updating room type pricing:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update room type pricing'
      };
    }
  }

  /**
   * Delete room type pricing
   */
  async deleteRoomTypePricing(token: string, id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete room type pricing');
      }

      return {
        success: true,
        message: 'Room type pricing deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting room type pricing:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete room type pricing'
      };
    }
  }

  /**
   * Get pricing for specific room type
   */
  async getPricingByRoomType(token: string, roomType: string): Promise<ApiResponse<RoomTypePricingResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${roomType}`, {
        method: 'GET',
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch pricing for room type');
      }

      const data = await response.json();
      return {
        success: true,
        data,
        message: 'Room type pricing fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching room type pricing:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch pricing for room type'
      };
    }
  }

  /**
   * Initialize default pricing for all room types
   */
  async initializeDefaultPricing(token: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/initialize-defaults`, {
        method: 'POST',
        headers: createAuthHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to initialize default pricing');
      }

      return {
        success: true,
        message: 'Default pricing initialized successfully'
      };
    } catch (error) {
      console.error('Error initializing default pricing:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initialize default pricing'
      };
    }
  }
}

const roomTypePricingService = new RoomTypePricingService();
export default roomTypePricingService;

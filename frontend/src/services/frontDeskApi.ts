const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface FrontDeskBooking {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'arriving' | 'checked-in' | 'checked-out' | 'no-show' | 'cancelled';
  nights: number;
  adults: number;
  children: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
}

export interface HousekeepingTask {
  id: string;
  roomNumber: string;
  roomType: string;
  status: 'dirty' | 'cleaning' | 'clean' | 'inspected' | 'out-of-order' | 'maintenance';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  lastUpdated: string;
  notes: string;
  estimatedCompletion: string;
}

export interface FrontDeskStats {
  totalArrivals: number;
  totalDepartures: number;
  currentOccupancy: number;
  roomsOutOfOrder: number;
  roomsCleaning: number;
  roomsReady: number;
}

class FrontDeskApiService {
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

  // Booking Management
  async getTodaysBookings(): Promise<FrontDeskBooking[]> {
    try {
      return this.fetchApi<FrontDeskBooking[]>('/frontdesk/bookings/today');
    } catch (error) {
      console.error('Error fetching today\'s bookings:', error);
      throw error;
    }
  }

  async checkInGuest(bookingId: string): Promise<void> {
    try {
      await this.fetchApi<void>(`/frontdesk/bookings/${bookingId}/checkin`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error checking in guest:', error);
      throw error;
    }
  }

  async checkOutGuest(bookingId: string): Promise<void> {
    try {
      await this.fetchApi<void>(`/frontdesk/bookings/${bookingId}/checkout`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error checking out guest:', error);
      throw error;
    }
  }

  async getBookingDetails(bookingId: string): Promise<FrontDeskBooking> {
    try {
      return this.fetchApi<FrontDeskBooking>(`/frontdesk/bookings/${bookingId}`);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }

  // Housekeeping Management
  async getHousekeepingTasks(): Promise<HousekeepingTask[]> {
    try {
      return this.fetchApi<HousekeepingTask[]>('/frontdesk/housekeeping/tasks');
    } catch (error) {
      console.error('Error fetching housekeeping tasks:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, status: HousekeepingTask['status']): Promise<void> {
    try {
      await this.fetchApi<void>(`/frontdesk/housekeeping/tasks/${taskId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async assignTask(taskId: string, assignedTo: string): Promise<void> {
    try {
      await this.fetchApi<void>(`/frontdesk/housekeeping/tasks/${taskId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ assignedTo }),
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }

  async getTaskDetails(taskId: string): Promise<HousekeepingTask> {
    try {
      return this.fetchApi<HousekeepingTask>(`/frontdesk/housekeeping/tasks/${taskId}`);
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  }

  // Dashboard Statistics
  async getFrontDeskStats(): Promise<FrontDeskStats> {
    try {
      return this.fetchApi<FrontDeskStats>('/frontdesk/stats');
    } catch (error) {
      console.error('Error fetching front desk stats:', error);
      throw error;
    }
  }

  // Walk-in Registration
  async registerWalkInGuest(guestData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }): Promise<FrontDeskBooking> {
    try {
      return this.fetchApi<FrontDeskBooking>('/frontdesk/walkin', {
        method: 'POST',
        body: JSON.stringify(guestData),
      });
    } catch (error) {
      console.error('Error registering walk-in guest:', error);
      throw error;
    }
  }

  // Reports and Receipts
  async generateReceipt(bookingId: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/frontdesk/bookings/${bookingId}/receipt`, {
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  async printRegistrationCard(bookingId: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/frontdesk/bookings/${bookingId}/registration-card`, {
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('Error generating registration card:', error);
      throw error;
    }
  }
}

export const frontDeskApi = new FrontDeskApiService();

import { BookingResponse } from '../types/booking';
import { API_CONFIG } from '../config/apiConfig';

const API_BASE_URL = API_CONFIG.BASE_URL;

export class BookingService {
  
  static async getUserBookings(userId: number, token: string): Promise<BookingResponse[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  static async cancelBooking(reservationId: number, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${reservationId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to cancel booking: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  static async modifyBooking(reservationId: number, modificationRequest: {
    newCheckInDate?: string;
    newCheckOutDate?: string;
    newRoomType?: string;
    newSpecialRequests?: string;
  }, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${reservationId}/modify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modificationRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to modify booking: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Error modifying booking:', error);
      throw error;
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    // Handle date strings without creating timezone issues
    // Parse as local date to avoid timezone conversion
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  static formatDateTime(dateTimeString: string): string {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static calculateStayDuration(checkIn: string, checkOut: string): number {
    // Parse as local dates to avoid timezone issues
    const [year1, month1, day1] = checkIn.split('T')[0].split('-');
    const [year2, month2, day2] = checkOut.split('T')[0].split('-');
    const checkInDate = new Date(parseInt(year1), parseInt(month1) - 1, parseInt(day1));
    const checkOutDate = new Date(parseInt(year2), parseInt(month2) - 1, parseInt(day2));
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getStatusColor(status: string): 'primary' | 'success' | 'warning' | 'error' | 'default' {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'primary';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'error';
      case 'CHECKED_IN':
      case 'CHECKED_OUT':
        return 'success';
      default:
        return 'default';
    }
  }

  static getPaymentStatusColor(paymentStatus: string): 'primary' | 'success' | 'warning' | 'error' | 'default' {
    switch (paymentStatus.toUpperCase()) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'REFUNDED':
        return 'primary';
      default:
        return 'default';
    }
  }
}

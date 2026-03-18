// Shared booking interfaces for frontend components

export interface Booking {
  reservationId: number;
  confirmationNumber: string;
  guestName: string;
  guestEmail: string;
  roomNumber?: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
  adults?: number;
  children?: number;
  nights?: number;
  paymentStatus?: string;
  paymentReference?: string;
  paymentType?: string;
  // Additional fields for check-in functionality
  pricePerNight?: number;
  hotelName?: string;
  hotelId?: number;
  assignedRoomId?: number; // Room ID when room is pre-assigned (e.g., walk-in bookings)
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable: boolean;
  hotelId: number;
  capacity?: number;
  description?: string;
  status?: string;
}

export interface BookingResponse {
  reservationId: number;
  status: string;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  paymentStatus: string;
  paymentIntentId?: string;
  createdAt: string;
  
  // Hotel and room details
  hotelName: string;
  hotelAddress: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  
  // Guest details
  guestName: string;
  guestEmail: string;
  
  // Special requests
  specialRequests?: string;
  
  // Management URL for anonymous guests
  managementUrl?: string;
}

export interface BookingModificationRequest {
  confirmationNumber?: string;
  guestEmail?: string;
  newCheckInDate?: string;
  newCheckOutDate?: string;
  newRoomType?: string;
  newSpecialRequests?: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  NO_SHOW = 'NO_SHOW'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

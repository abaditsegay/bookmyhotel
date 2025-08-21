// Hotel and booking related types

export interface HotelSearchRequest {
  location?: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  // Optional filters - not used in simplified search form but supported by backend
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface AvailableRoom {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
}

export interface RoomTypeAvailability {
  roomType: string;
  availableCount: number;
  totalCount: number;
  pricePerNight: number;
  capacity: number;
  description?: string;
  displayMessage: string;
}

export interface HotelSearchResult {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  availableRooms: AvailableRoom[]; // Keep for backward compatibility
  roomTypeAvailability?: RoomTypeAvailability[]; // New room type approach
  minPrice: number;
  maxPrice: number;
}

export interface BookingRequest {
  // For individual room booking (traditional approach)
  roomId?: number;
  
  // For room type booking (new approach)
  hotelId?: number;
  roomType?: string;
  
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  specialRequests?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  
  // Payment information (optional for backward compatibility)
  paymentMethod?: 'credit_card' | 'mobile_money';
  
  // Credit card fields
  creditCardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  
  // Mobile money fields
  mobileNumber?: string;
  transferReceiptNumber?: string;
}

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
  hotelName: string;
  hotelAddress: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  guestName: string;
  guestEmail: string;
}

export interface SearchFilters {
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Hotel admin types
export interface Hotel {
  id: number;
  name: string;
  description?: string;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  tenantId?: string;
  isActive?: boolean;
  roomCount?: number;
  totalRooms?: number;
  availableRooms?: number;
  bookedRooms?: number;
  totalStaff?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Booking modification and cancellation types
export interface BookingModificationRequest {
  confirmationNumber: string;
  guestEmail: string;
  newCheckInDate?: string;
  newCheckOutDate?: string;
  newRoomId?: number;
  newSpecialRequests?: string;
  guestName?: string;
  guestPhone?: string;
  reason?: string;
}

export interface BookingModificationResponse {
  success: boolean;
  message: string;
  updatedBooking?: BookingResponse;
  additionalCharges?: number;
  refundAmount?: number;
}

export interface BookingCancellationRequest {
  confirmationNumber: string;
  guestEmail: string;
  cancellationReason?: string;
}

export interface BookingCancellationResponse {
  success: boolean;
  message: string;
  refundAmount?: number;
  cancellationFee?: number;
}

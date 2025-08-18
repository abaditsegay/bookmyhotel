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

export interface HotelSearchResult {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  availableRooms: AvailableRoom[];
  minPrice: number;
  maxPrice: number;
}

export interface BookingRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  specialRequests?: string;
  paymentMethodId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
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
  totalStaff?: number;
  createdAt?: string;
  updatedAt?: string;
}

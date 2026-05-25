export interface HotelRegistrationData {
  hotelName: string;
  contactPerson: string;
  description: string;
  address: string;
  city: string;
  country: string;
  contactEmail: string;
  phone: string;
  mobilePaymentPhone: string;
  mobilePaymentPhone2: string;
  licenseNumber: string;
  taxId: string;
  websiteUrl: string;
  facilityAmenities: string;
  numberOfRooms: string;
  checkInTime: string;
  checkOutTime: string;
}

function randomPhone(prefix: string): string {
  const suffix = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');

  return `${prefix}${suffix}`;
}

export function buildHotelRegistrationData(): HotelRegistrationData {
  const stamp = Date.now();
  const suffix = Math.floor(Math.random() * 10_000).toString().padStart(4, '0');

  return {
    hotelName: `Grand Palace Hotel ${stamp}`,
    contactPerson: 'John Anderson',
    description:
      'A luxury 5-star hotel offering world-class amenities, exceptional service, and elegant accommodations in the heart of the city.',
    address: '123 Grand Boulevard, Downtown District',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    contactEmail: `contact${suffix}@grandpalace${suffix}.com`,
    phone: randomPhone('0911'),
    mobilePaymentPhone: randomPhone('0912'),
    mobilePaymentPhone2: randomPhone('0913'),
    licenseNumber: `HTL-LIC-2026-${stamp}`,
    taxId: `TIN-${stamp}`,
    websiteUrl: `https://grandpalace${suffix}.com`,
    facilityAmenities:
      'Free WiFi, Swimming Pool, Fitness Center, Restaurant, Bar, Spa & Wellness, Business Center, Conference Rooms, 24/7 Room Service, Parking',
    numberOfRooms: '150',
    checkInTime: '14:00',
    checkOutTime: '12:00',
  };
}
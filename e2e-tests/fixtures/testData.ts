/**
 * Test Data Fixtures for System Admin E2E Tests
 * Contains all the test data needed for system admin workflows
 */

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
}

export interface TestHotel {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  description: string;
  tenantId: string;
  adminEmail: string;
}

export interface TestHotelRegistration {
  hotelName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  country: string;
  description: string;
  licenseNumber: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

/**
 * System Admin Test User
 */
export const SYSTEM_ADMIN: TestUser = {
  email: 'admin@bookmyhotel.com',
  password: 'admin123',
  firstName: 'System',
  lastName: 'Administrator',
  role: 'ADMIN'
};

/**
 * Test Hotel Registrations for approval workflows
 */
export const TEST_HOTEL_REGISTRATIONS: TestHotelRegistration[] = [
  {
    hotelName: 'Grand Paradise Resort',
    contactPersonName: 'John Manager',
    contactEmail: 'manager@grandparadise.com',
    contactPhone: '+1-555-0001',
    address: '123 Paradise Lane',
    city: 'Miami',
    country: 'USA',
    description: 'Luxury beachfront resort with world-class amenities',
    licenseNumber: 'HTL-FL-2025-001',
    adminEmail: 'admin@grandparadise.com',
    adminPassword: 'paradise123',
    adminFirstName: 'John',
    adminLastName: 'Manager'
  },
  {
    hotelName: 'City Business Center Hotel',
    contactPersonName: 'Sarah Wilson',
    contactEmail: 'sarah@citybusiness.com',
    contactPhone: '+1-555-0002',
    address: '456 Business District Ave',
    city: 'New York',
    country: 'USA',
    description: 'Modern business hotel in the heart of Manhattan',
    licenseNumber: 'HTL-NY-2025-002',
    adminEmail: 'admin@citybusiness.com',
    adminPassword: 'business123',
    adminFirstName: 'Sarah',
    adminLastName: 'Wilson'
  },
  {
    hotelName: 'Mountain View Lodge',
    contactPersonName: 'Mike Thompson',
    contactEmail: 'mike@mountainview.com',
    contactPhone: '+1-555-0003',
    address: '789 Mountain Peak Road',
    city: 'Denver',
    country: 'USA',
    description: 'Cozy mountain retreat with spectacular views',
    licenseNumber: 'HTL-CO-2025-003',
    adminEmail: 'admin@mountainview.com',
    adminPassword: 'mountain123',
    adminFirstName: 'Mike',
    adminLastName: 'Thompson'
  }
];

/**
 * Existing Test Hotels (for management scenarios)
 */
export const EXISTING_TEST_HOTELS: TestHotel[] = [
  {
    id: 'luxury-chain',
    name: 'Luxury Chain Hotel',
    email: 'contact@luxurychain.com',
    phone: '+1-555-0100',
    address: '100 Luxury Avenue',
    city: 'Los Angeles',
    country: 'USA',
    description: 'Premium luxury hotel chain',
    tenantId: 'luxury-chain',
    adminEmail: 'admin@luxurychain.com'
  },
  {
    id: 'budget-inn',
    name: 'Budget Inn & Suites',
    email: 'contact@budgetinn.com',
    phone: '+1-555-0200',
    address: '200 Affordable Street',
    city: 'Chicago',
    country: 'USA',
    description: 'Clean and comfortable budget accommodations',
    tenantId: 'budget-inn',
    adminEmail: 'admin@budgetinn.com'
  }
];

/**
 * Test Users for various scenarios
 */
export const TEST_USERS: TestUser[] = [
  // Hotel Admins
  {
    email: 'admin@luxurychain.com',
    password: 'luxury123',
    firstName: 'Alice',
    lastName: 'Luxury',
    role: 'HOTEL_ADMIN',
    tenantId: 'luxury-chain'
  },
  {
    email: 'admin@budgetinn.com',
    password: 'budget123',
    firstName: 'Bob',
    lastName: 'Budget',
    role: 'HOTEL_ADMIN',
    tenantId: 'budget-inn'
  },
  
  // Front Desk Staff
  {
    email: 'frontdesk@luxurychain.com',
    password: 'frontdesk123',
    firstName: 'Carol',
    lastName: 'Frontdesk',
    role: 'FRONTDESK',
    tenantId: 'luxury-chain'
  },
  
  // System-wide Customer
  {
    email: 'customer@test.com',
    password: 'customer123',
    firstName: 'David',
    lastName: 'Customer',
    role: 'CUSTOMER'
  }
];

/**
 * API Endpoints for testing
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register'
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    HOTELS: '/api/admin/hotels',
    HOTEL_REGISTRATIONS: '/api/admin/hotel-registrations',
    STATISTICS: '/api/admin/statistics'
  },
  HOTELS: {
    SEARCH: '/api/hotels/search',
    DETAILS: '/api/hotels'
  }
};

/**
 * Test Data Validation Patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  CONFIRMATION_NUMBER: /^BMH-[\w]+-\d+$/,
  HOTEL_ID: /^[a-z0-9\-]+$/
};

/**
 * Test Environment Configuration
 */
export const TEST_CONFIG = {
  TIMEOUTS: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 30000,
    VERY_LONG: 60000
  },
  RETRIES: {
    API_CALLS: 3,
    UI_INTERACTIONS: 2
  },
  DELAYS: {
    AFTER_LOGIN: 1000,
    AFTER_NAVIGATION: 500,
    AFTER_FORM_SUBMIT: 2000
  }
};

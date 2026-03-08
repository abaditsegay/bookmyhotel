/**
 * API Documentation Data
 * Comprehensive API endpoint documentation with request/response examples
 * Organized by categories: Authentication, Booking, Shopping, Management, Front Desk, Hotel Admin, Miscellaneous
 */

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  request?: {
    params?: Record<string, string>;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: any;
  };
  response?: {
    success?: any;
    error?: any;
  };
}

// ===== STEP 1: AUTHENTICATION & SESSION MANAGEMENT ENDPOINTS ===== 
export const authenticationEndpoints: APIEndpoint[] = [
  {
    method: 'POST',
    path: '/managemyhotel/api/auth/login',
    description: 'User authentication',
    category: 'Authentication',
    request: {
      body: {
        username: 'string',
        password: 'string'
      }
    },
    response: {
      success: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          username: 'john_doe',
          email: 'john@example.com',
          role: 'HOTEL_ADMIN',
          hotelId: 123
        }
      },
      error: {
        message: 'Invalid credentials',
        code: 'AUTH_FAILED'
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/auth/logout',
    description: 'User logout',
    category: 'Authentication',
    request: {
      headers: {
        'Authorization': 'Bearer {token}'
      }
    },
    response: {
      success: {
        message: 'Successfully logged out'
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/auth/register',
    description: 'User registration',
    category: 'Authentication',
    request: {
      body: {
        username: 'string',
        email: 'string',
        password: 'string',
        firstName: 'string',
        lastName: 'string',
        role: 'USER | HOTEL_ADMIN | STAFF'
      }
    },
    response: {
      success: {
        user: {
          id: 2,
          username: 'new_user',
          email: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Smith',
          role: 'USER',
          isActive: true,
          createdAt: '2025-10-22T10:30:00Z'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/auth/refresh',
    description: 'Refresh JWT token',
    category: 'Authentication',
    request: {
      headers: {
        'Authorization': 'Bearer {refreshToken}'
      }
    },
    response: {
      success: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/auth/session-status',
    description: 'Check session status',
    category: 'Authentication',
    request: {
      headers: {
        'Authorization': 'Bearer {token}'
      }
    },
    response: {
      success: {
        valid: true,
        user: {
          id: 1,
          username: 'john_doe',
          role: 'HOTEL_ADMIN',
          permissions: ['READ_BOOKINGS', 'WRITE_BOOKINGS', 'MANAGE_STAFF']
        },
        expiresAt: '2025-10-22T15:30:00Z'
      }
    }
  }
];

// ===== PLACEHOLDER FOR OTHER CATEGORIES (TO BE FILLED IN SUBSEQUENT STEPS) ===== 

// Step 2: System Administration Endpoints
export const systemAdminEndpoints: APIEndpoint[] = [
  // Hotel Management (Admin)
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/hotels',
    description: 'Get all hotels (admin)',
    category: 'System Admin',
    request: {
      headers: { 'Authorization': 'Bearer {adminToken}' },
      query: { page: '0', size: '20', status: 'ACTIVE (optional)' }
    },
    response: {
      success: {
        hotels: [{
          id: 1,
          name: 'Grand Plaza Hotel',
          address: '123 Main Street, City',
          status: 'ACTIVE',
          totalRooms: 150,
          occupancyRate: 85.5,
          createdAt: '2025-01-01T00:00:00Z'
        }],
        totalElements: 25,
        totalPages: 2
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/admin/hotels',
    description: 'Create new hotel (admin)',
    category: 'System Admin',
    request: {
      body: {
        name: 'string',
        address: 'string',
        city: 'string',
        description: 'string',
        amenities: ['WiFi', 'Pool', 'Restaurant']
      }
    },
    response: {
      success: {
        hotel: {
          id: 26,
          name: 'New Resort Hotel',
          status: 'PENDING_APPROVAL',
          createdAt: '2025-10-22T10:30:00Z'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/hotels/{id}',
    description: 'Get hotel by ID (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        id: 1,
        name: 'Grand Plaza Hotel',
        address: '123 Main Street, City',
        rooms: [{ id: 101, number: '101', type: 'DELUXE' }],
        statistics: { totalBookings: 1250, revenue: 125000.50 }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/admin/hotels/{id}',
    description: 'Update hotel (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' },
      body: {
        name: 'string (optional)',
        address: 'string (optional)',
        description: 'string (optional)'
      }
    },
    response: {
      success: {
        hotel: { id: 1, status: 'updated', updatedAt: '2025-10-22T10:30:00Z' }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/admin/hotels/{id}',
    description: 'Delete hotel (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: { message: 'Hotel deleted successfully' }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/hotels/search',
    description: 'Search hotels (admin)',
    category: 'System Admin',
    request: {
      query: {
        q: 'string',
        city: 'string (optional)',
        status: 'string (optional)'
      }
    },
    response: {
      success: {
        results: [{ id: 1, name: 'Grand Plaza Hotel', city: 'New York' }]
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/admin/hotels/{id}/toggle-status',
    description: 'Toggle hotel status',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        hotel: { id: 1, status: 'INACTIVE' }
      }
    }
  },

  // User Management (Admin)
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/users',
    description: 'Get all users (admin)',
    category: 'System Admin',
    request: {
      query: {
        role: 'HOTEL_ADMIN | STAFF | USER (optional)',
        status: 'ACTIVE | INACTIVE (optional)'
      }
    },
    response: {
      success: {
        users: [{
          id: 1,
          username: 'john_admin',
          email: 'john@hotel.com',
          role: 'HOTEL_ADMIN',
          status: 'ACTIVE',
          hotelId: 123,
          lastLogin: '2025-10-22T09:15:00Z'
        }]
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/admin/users',
    description: 'Create user (admin)',
    category: 'System Admin',
    request: {
      body: {
        username: 'string',
        email: 'string',
        password: 'string',
        role: 'HOTEL_ADMIN | STAFF | USER',
        firstName: 'string',
        lastName: 'string',
        hotelId: 'number (optional)'
      }
    },
    response: {
      success: {
        user: {
          id: 25,
          username: 'new_user',
          role: 'STAFF',
          status: 'ACTIVE',
          createdAt: '2025-10-22T10:30:00Z'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/users/{id}',
    description: 'Get user by ID (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        id: 1,
        username: 'john_admin',
        email: 'john@hotel.com',
        profile: { firstName: 'John', lastName: 'Admin' },
        permissions: ['READ_BOOKINGS', 'WRITE_BOOKINGS', 'MANAGE_STAFF']
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/admin/users/{id}',
    description: 'Update user (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' },
      body: {
        email: 'string (optional)',
        role: 'string (optional)',
        status: 'string (optional)'
      }
    },
    response: {
      success: {
        user: { id: 1, status: 'updated', updatedAt: '2025-10-22T10:30:00Z' }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/admin/users/{id}',
    description: 'Delete user (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: { message: 'User deleted successfully' }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/users/search',
    description: 'Search users (admin)',
    category: 'System Admin',
    request: {
      query: {
        q: 'string',
        role: 'string (optional)'
      }
    },
    response: {
      success: {
        results: [{ id: 1, username: 'john_admin', email: 'john@hotel.com' }]
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/admin/users/{id}/toggle-status',
    description: 'Toggle user status',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        user: { id: 1, status: 'INACTIVE' }
      }
    }
  },

  // Tenant Management (Admin)
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/tenants',
    description: 'Get all tenants (admin)',
    category: 'System Admin',
    request: {},
    response: {
      success: {
        tenants: [{
          id: 1,
          name: 'Hotel Chain ABC',
          domain: 'hotelchain-abc',
          status: 'ACTIVE',
          hotelCount: 15,
          createdAt: '2025-01-01T00:00:00Z'
        }]
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/admin/tenants',
    description: 'Create tenant (admin)',
    category: 'System Admin',
    request: {
      body: {
        name: 'string',
        domain: 'string',
        adminEmail: 'string'
      }
    },
    response: {
      success: {
        tenant: {
          id: 5,
          name: 'New Hotel Group',
          domain: 'new-hotel-group',
          status: 'ACTIVE'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/tenants/{id}',
    description: 'Get tenant by ID (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        id: 1,
        name: 'Hotel Chain ABC',
        domain: 'hotelchain-abc',
        settings: { maxHotels: 50, features: ['BOOKING', 'SHOP', 'ANALYTICS'] }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/admin/tenants/{id}',
    description: 'Update tenant (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' },
      body: {
        name: 'string (optional)',
        settings: 'object (optional)'
      }
    },
    response: {
      success: {
        tenant: { id: 1, status: 'updated', updatedAt: '2025-10-22T10:30:00Z' }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/admin/tenants/{id}',
    description: 'Delete tenant (admin)',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: { message: 'Tenant deleted successfully' }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/admin/tenants/{id}/toggle-status',
    description: 'Toggle tenant status',
    category: 'System Admin',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        tenant: { id: 1, status: 'SUSPENDED' }
      }
    }
  },

  // Hotel Registration Management
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/hotel-registrations',
    description: 'Get hotel registrations',
    category: 'System Admin',
    request: {
      query: {
        status: 'PENDING | APPROVED | REJECTED (optional)'
      }
    },
    response: {
      success: {
        registrations: [{
          id: 1,
          hotelName: 'Seaside Resort',
          applicantName: 'Jane Smith',
          applicantEmail: 'jane@seaside.com',
          status: 'PENDING',
          submittedAt: '2025-10-20T14:30:00Z'
        }]
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/admin/hotel-registrations/pending',
    description: 'Get pending registrations',
    category: 'System Admin',
    request: {},
    response: {
      success: {
        pendingRegistrations: [{
          id: 1,
          hotelName: 'Seaside Resort',
          applicantName: 'Jane Smith',
          urgency: 'HIGH',
          daysWaiting: 3
        }]
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/admin/hotel-registrations/{id}/approve',
    description: 'Approve hotel registration',
    category: 'System Admin',
    request: {
      params: { id: 'number' },
      body: {
        notes: 'string (optional)',
        assignedTenantId: 'number (optional)'
      }
    },
    response: {
      success: {
        registration: { id: 1, status: 'APPROVED', approvedAt: '2025-10-22T10:30:00Z' },
        hotelId: 26
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/admin/hotel-registrations/{id}/reject',
    description: 'Reject hotel registration',
    category: 'System Admin',
    request: {
      params: { id: 'number' },
      body: {
        reason: 'string',
        notes: 'string (optional)'
      }
    },
    response: {
      success: {
        registration: {
          id: 1,
          status: 'REJECTED',
          rejectedAt: '2025-10-22T10:30:00Z',
          reason: 'Incomplete documentation'
        }
      }
    }
  },

  // System User Management
  {
    method: 'GET',
    path: '/managemyhotel/api/system-users',
    description: 'Get system users',
    category: 'System Admin',
    request: {},
    response: {
      success: {
        users: [{
          id: 1,
          username: 'system_admin',
          role: 'SYSTEM_ADMIN',
          lastActivity: '2025-10-22T09:45:00Z',
          permissions: ['FULL_ACCESS']
        }]
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/system-users/guests',
    description: 'Get global guests',
    category: 'System Admin',
    request: {},
    response: {
      success: {
        guests: [{
          id: 1,
          name: 'John Guest',
          email: 'john@example.com',
          totalBookings: 5,
          totalSpent: 2500.00,
          lastBooking: '2025-10-15T00:00:00Z'
        }]
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/system-users/admins',
    description: 'Get system admins',
    category: 'System Admin',
    request: {},
    response: {
      success: {
        admins: [{
          id: 1,
          username: 'super_admin',
          role: 'SYSTEM_ADMIN',
          permissions: ['FULL_ACCESS'],
          lastLogin: '2025-10-22T08:00:00Z'
        }]
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/system-users/promote',
    description: 'Promote to system admin',
    category: 'System Admin',
    request: {
      body: {
        userId: 'number',
        permissions: ['READ_ALL', 'WRITE_ALL', 'DELETE_ALL']
      }
    },
    response: {
      success: {
        user: {
          id: 25,
          role: 'SYSTEM_ADMIN',
          promotedAt: '2025-10-22T10:30:00Z'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/system-users/demote',
    description: 'Demote from system admin',
    category: 'System Admin',
    request: {
      body: {
        userId: 'number',
        newRole: 'HOTEL_ADMIN | USER'
      }
    },
    response: {
      success: {
        user: {
          id: 25,
          role: 'HOTEL_ADMIN',
          demotedAt: '2025-10-22T10:30:00Z'
        }
      }
    }
  }
];

// Step 3: Hotel Search & Public Access Endpoints  
export const publicEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/hotels',
    description: 'Get all hotels with filtering',
    category: 'Public Access',
    request: {
      query: {
        city: 'string (optional)',
        priceMin: 'number (optional)',
        priceMax: 'number (optional)',
        amenities: 'string[] (optional)',
        rating: 'number (optional)',
        available: 'boolean (optional)'
      }
    },
    response: {
      success: {
        hotels: [{
          id: 1,
          name: 'Grand Plaza Hotel',
          description: 'Luxury hotel in downtown',
          address: '123 Main Street, City',
          city: 'New York',
          rating: 4.5,
          priceFrom: 199.99,
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
          images: ['https://example.com/hotel1.jpg'],
          availableRooms: 45,
          distance: 2.5
        }],
        totalCount: 150,
        filters: {
          appliedFilters: { city: 'New York' },
          availableFilters: {
            cities: ['New York', 'Los Angeles'],
            priceRanges: [{ min: 100, max: 200 }],
            amenities: ['WiFi', 'Pool', 'Spa']
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/hotels/search',
    description: 'Search hotels',
    category: 'Public Access',
    request: {
      body: {
        location: 'string',
        checkInDate: '2025-10-25',
        checkOutDate: '2025-10-27',
        guests: 2,
        rooms: 1,
        filters: {
          priceRange: { min: 100, max: 500 },
          amenities: ['WiFi', 'Pool'],
          rating: 4.0
        }
      }
    },
    response: {
      success: {
        searchResults: [{
          id: 1,
          name: 'Grand Plaza Hotel',
          location: 'Downtown New York',
          rating: 4.5,
          pricePerNight: 299.99,
          totalPrice: 599.98,
          availability: {
            available: true,
            roomsLeft: 5,
            roomType: 'DELUXE'
          },
          amenities: ['WiFi', 'Pool', 'Spa'],
          images: ['https://example.com/hotel1.jpg'],
          cancellationPolicy: 'Free cancellation until 24 hours before check-in'
        }],
        searchMeta: {
          totalResults: 25,
          searchTime: 0.15,
          location: 'New York',
          dates: {
            checkIn: '2025-10-25',
            checkOut: '2025-10-27',
            nights: 2
          }
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/hotels/{id}',
    description: 'Get hotel by ID',
    category: 'Public Access',
    request: {
      params: { id: 'number' },
      query: {
        checkInDate: '2025-10-25 (optional)',
        checkOutDate: '2025-10-27 (optional)',
        guests: '2 (optional)'
      }
    },
    response: {
      success: {
        id: 1,
        name: 'Grand Plaza Hotel',
        description: 'Luxury hotel in the heart of downtown',
        address: '123 Main Street, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'info@grandplaza.com',
        website: 'https://grandplaza.com',
        rating: 4.5,
        reviewCount: 1250,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking'],
        images: [
          'https://example.com/hotel1-main.jpg',
          'https://example.com/hotel1-room.jpg',
          'https://example.com/hotel1-pool.jpg'
        ],
        rooms: [{
          id: 101,
          type: 'DELUXE',
          name: 'Deluxe King Room',
          description: 'Spacious room with city view',
          pricePerNight: 299.99,
          maxGuests: 2,
          amenities: ['King Bed', 'City View', 'Mini Bar'],
          images: ['https://example.com/room-deluxe.jpg']
        }],
        policies: {
          cancellation: 'Free cancellation until 24 hours before check-in',
          checkInAge: 18,
          pets: false,
          smoking: false
        },
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          nearbyAttractions: [
            { name: 'Central Park', distance: 0.5 },
            { name: 'Times Square', distance: 1.2 }
          ]
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/hotels/{id}/rooms',
    description: 'Get hotel rooms',
    category: 'Public Access',
    request: {
      params: { id: 'number' },
      query: {
        checkInDate: '2025-10-25',
        checkOutDate: '2025-10-27',
        guests: '2'
      }
    },
    response: {
      success: {
        rooms: [{
          id: 101,
          type: 'DELUXE',
          name: 'Deluxe King Room',
          description: 'Spacious room with city view',
          pricePerNight: 299.99,
          totalPrice: 599.98,
          maxGuests: 2,
          bedType: 'King',
          size: '35 sqm',
          amenities: ['City View', 'Mini Bar', 'WiFi', 'Air Conditioning'],
          images: ['https://example.com/room-deluxe.jpg'],
          availability: {
            available: true,
            roomsLeft: 3,
            lastBooking: '2025-10-22T09:30:00Z'
          }
        }],
        hotel: {
          id: 1,
          name: 'Grand Plaza Hotel',
          checkInTime: '15:00',
          checkOutTime: '11:00'
        },
        booking: {
          checkInDate: '2025-10-25',
          checkOutDate: '2025-10-27',
          nights: 2,
          guests: 2
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/hotels/random',
    description: 'Get random hotels',
    category: 'Public Access',
    request: {
      query: {
        count: '5 (optional)',
        city: 'string (optional)',
        featured: 'boolean (optional)'
      }
    },
    response: {
      success: {
        hotels: [{
          id: 1,
          name: 'Grand Plaza Hotel',
          description: 'Luxury hotel in downtown',
          location: 'New York',
          rating: 4.5,
          priceFrom: 199.99,
          mainImage: 'https://example.com/hotel1.jpg',
          featured: true,
          specialOffer: {
            discount: 20,
            validUntil: '2025-12-31',
            description: '20% off weekend stays'
          }
        }],
        meta: {
          requestedCount: 5,
          returnedCount: 5,
          randomSeed: 'abc123',
          generatedAt: '2025-10-22T10:30:00Z'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/public/hotel-registration/submit',
    description: 'Submit hotel registration',
    category: 'Public Access',
    request: {
      body: {
        hotelName: 'string',
        ownerName: 'string',
        ownerEmail: 'string',
        ownerPhone: 'string',
        hotelAddress: 'string',
        hotelCity: 'string',
        hotelDescription: 'string',
        totalRooms: 'number',
        amenities: ['WiFi', 'Pool', 'Restaurant'],
        businessLicense: 'string',
        taxId: 'string'
      }
    },
    response: {
      success: {
        registrationId: 'REG-2025-001234',
        status: 'SUBMITTED',
        submittedAt: '2025-10-22T10:30:00Z',
        estimatedProcessingTime: '3-5 business days',
        nextSteps: [
          'Document verification',
          'Property inspection',
          'Final approval'
        ],
        contactInfo: {
          email: 'registrations@managemyhotel.com',
          phone: '+1-800-HOTELS'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/public/hotel-registration/status',
    description: 'Check registration status',
    category: 'Public Access',
    request: {
      query: {
        registrationId: 'string',
        email: 'string'
      }
    },
    response: {
      success: {
        registrationId: 'REG-2025-001234',
        hotelName: 'Seaside Resort',
        status: 'UNDER_REVIEW',
        currentStep: 'Document Verification',
        progress: {
          percentage: 60,
          completedSteps: ['Submission', 'Initial Review'],
          currentStep: 'Document Verification',
          remainingSteps: ['Property Inspection', 'Final Approval']
        },
        submittedAt: '2025-10-20T14:30:00Z',
        lastUpdated: '2025-10-22T09:15:00Z',
        estimatedCompletion: '2025-10-25T17:00:00Z',
        messages: [{
          date: '2025-10-21T10:00:00Z',
          message: 'Additional documentation required for business license verification',
          type: 'INFO'
        }]
      }
    }
  }
];

// Step 4: Booking Management Endpoints
export const bookingEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/bookings',
    description: 'Get bookings with filtering',
    category: 'Booking',
    request: {
      query: {
        status: 'PENDING | BOOKED | CHECKED_IN | CHECKED_OUT | CANCELLED (optional)',
        hotelId: 'number (optional)',
        checkInDate: 'string (optional)',
        checkOutDate: 'string (optional)',
        guestName: 'string (optional)',
        page: '0',
        size: '20'
      }
    },
    response: {
      success: {
        bookings: [{
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          guestName: 'John Doe',
          guestEmail: 'john@example.com',
          hotelId: 123,
          hotelName: 'Grand Plaza Hotel',
          roomNumber: '205',
          roomType: 'DELUXE',
          status: 'BOOKED',
          checkInDate: '2025-10-25',
          checkOutDate: '2025-10-27',
          guests: 2,
          totalAmount: 599.98,
          paymentStatus: 'PAID',
          createdAt: '2025-10-22T10:30:00Z'
        }],
        pagination: {
          totalElements: 150,
          totalPages: 8,
          currentPage: 0,
          size: 20
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/bookings',
    description: 'Create new booking',
    category: 'Booking',
    request: {
      body: {
        hotelId: 123,
        roomId: 45,
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+1234567890',
        checkInDate: '2025-10-25',
        checkOutDate: '2025-10-27',
        adults: 2,
        children: 0,
        specialRequests: 'Late check-in requested',
        paymentMethod: 'CREDIT_CARD',
        promoCode: 'SAVE20 (optional)'
      }
    },
    response: {
      success: {
        booking: {
          id: 151,
          confirmationNumber: 'CONF-XYZ789',
          hotelId: 123,
          roomId: 45,
          guestName: 'John Doe',
          guestEmail: 'john@example.com',
          status: 'BOOKED',
          checkInDate: '2025-10-25',
          checkOutDate: '2025-10-27',
          totalAmount: 599.98,
          paymentStatus: 'PENDING',
          createdAt: '2025-10-22T10:30:00Z'
        },
        payment: {
          paymentIntentId: 'pi_abc123',
          clientSecret: 'pi_abc123_secret_xyz',
          amount: 599.98,
          currency: 'USD'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/bookings/{id}',
    description: 'Get booking by ID',
    category: 'Booking',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        id: 1,
        confirmationNumber: 'CONF-ABC123',
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '+1234567890',
        hotel: {
          id: 123,
          name: 'Grand Plaza Hotel',
          address: '123 Main Street, New York',
          phone: '+1-555-0123'
        },
        room: {
          id: 45,
          number: '205',
          type: 'DELUXE',
          description: 'Deluxe King Room with City View'
        },
        status: 'BOOKED',
        checkInDate: '2025-10-25',
        checkOutDate: '2025-10-27',
        nights: 2,
        adults: 2,
        children: 0,
        specialRequests: 'Late check-in requested',
        totalAmount: 599.98,
        breakdown: {
          roomRate: 299.99,
          nights: 2,
          subtotal: 599.98,
          taxes: 60.00,
          fees: 15.00,
          total: 674.98
        },
        paymentStatus: 'PAID',
        createdAt: '2025-10-22T10:30:00Z',
        updatedAt: '2025-10-22T10:35:00Z'
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/bookings/{id}',
    description: 'Update booking',
    category: 'Booking',
    request: {
      params: { id: 'number' },
      body: {
        checkInDate: '2025-10-26 (optional)',
        checkOutDate: '2025-10-28 (optional)',
        adults: '3 (optional)',
        children: '1 (optional)',
        specialRequests: 'string (optional)',
        roomId: 'number (optional)'
      }
    },
    response: {
      success: {
        booking: {
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          status: 'BOOKED',
          checkInDate: '2025-10-26',
          checkOutDate: '2025-10-28',
          adults: 3,
          children: 1,
          totalAmount: 749.97,
          paymentStatus: 'PARTIAL',
          updatedAt: '2025-10-22T10:45:00Z'
        },
        changes: {
          dateChanged: true,
          guestsChanged: true,
          priceAdjustment: 149.99,
          newTotal: 749.97
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/bookings/{id}',
    description: 'Delete booking',
    category: 'Booking',
    request: {
      params: { id: 'number' },
      body: {
        reason: 'string (optional)'
      }
    },
    response: {
      success: {
        message: 'Booking deleted successfully',
        booking: {
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          status: 'DELETED',
          deletedAt: '2025-10-22T10:30:00Z'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/bookings/search',
    description: 'Search bookings',
    category: 'Booking',
    request: {
      query: {
        q: 'string (search term)',
        confirmationNumber: 'string (optional)',
        guestEmail: 'string (optional)',
        guestName: 'string (optional)',
        hotelId: 'number (optional)',
        dateFrom: 'string (optional)',
        dateTo: 'string (optional)'
      }
    },
    response: {
      success: {
        results: [{
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          guestName: 'John Doe',
          guestEmail: 'john@example.com',
          hotelName: 'Grand Plaza Hotel',
          checkInDate: '2025-10-25',
          checkOutDate: '2025-10-27',
          status: 'BOOKED',
          totalAmount: 599.98,
          relevanceScore: 0.95
        }],
        searchMeta: {
          query: 'john doe grand plaza',
          totalResults: 5,
          searchTime: 0.08,
          suggestions: ['John Smith', 'Jane Doe']
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/bookings/modify',
    description: 'Modify booking',
    category: 'Booking',
    request: {
      body: {
        bookingId: 1,
        modifications: {
          checkInDate: '2025-10-26 (optional)',
          checkOutDate: '2025-10-29 (optional)',
          roomType: 'SUITE (optional)',
          guests: '4 (optional)',
          addOns: ['BREAKFAST', 'PARKING'] 
        },
        reason: 'Guest requested room upgrade'
      }
    },
    response: {
      success: {
        booking: {
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          status: 'MODIFIED',
          originalTotal: 599.98,
          newTotal: 899.97,
          adjustmentAmount: 299.99,
          modifiedAt: '2025-10-22T10:30:00Z'
        },
        modifications: {
          applied: ['checkOutDate', 'roomType'],
          rejected: [],
          additionalCharges: 299.99,
          refunds: 0
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/bookings/cancel',
    description: 'Cancel booking',
    category: 'Booking',
    request: {
      body: {
        bookingId: 1,
        reason: 'GUEST_REQUEST | HOTEL_ISSUE | FORCE_MAJEURE | OTHER',
        notes: 'Guest had emergency and cannot travel',
        refundRequested: true
      }
    },
    response: {
      success: {
        booking: {
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          status: 'CANCELLED',
          cancelledAt: '2025-10-22T10:30:00Z',
          reason: 'GUEST_REQUEST'
        },
        refund: {
          eligible: true,
          amount: 599.98,
          processing: true,
          estimatedCompletion: '2025-10-29T00:00:00Z',
          method: 'ORIGINAL_PAYMENT_METHOD'
        },
        cancellationPolicy: {
          appliedPolicy: 'FLEXIBLE',
          feeCharged: 0,
          refundPercentage: 100
        }
      }
    }
  }
];

// Step 5: Front Desk Operations Endpoints
export const frontDeskEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/front-desk/bookings',
    description: 'Get front desk bookings',
    category: 'Front Desk',
    request: {
      query: {
        status: 'ARRIVING | CHECKED_IN | CHECKED_OUT | STAYING (optional)',
        date: '2025-10-22 (optional)',
        floor: 'number (optional)',
        roomNumber: 'string (optional)'
      }
    },
    response: {
      success: {
        bookings: [{
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          guestName: 'John Doe',
          guestPhone: '+1234567890',
          roomNumber: '205',
          roomType: 'DELUXE',
          status: 'ARRIVING',
          checkInDate: '2025-10-22',
          checkOutDate: '2025-10-24',
          checkInTime: '15:00',
          expectedArrival: '16:30',
          adults: 2,
          children: 0,
          specialRequests: 'Late check-in, city view preferred',
          totalAmount: 599.98,
          paymentStatus: 'PAID',
          guestHistory: {
            visits: 3,
            loyaltyLevel: 'GOLD',
            preferences: ['Non-smoking', 'High floor']
          }
        }],
        summary: {
          totalBookings: 45,
          arrivingToday: 12,
          checkingOutToday: 8,
          currentGuests: 25
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/front-desk/bookings/{id}/checkin',
    description: 'Check-in guest',
    category: 'Front Desk',
    request: {
      params: { id: 'number' },
      body: {
        roomNumber: '205',
        keyCards: 2,
        notes: 'Guest arrived early, room was ready',
        guestSignature: 'base64-encoded-signature (optional)',
        idVerified: true,
        depositAmount: 100.00,
        estimatedCheckOut: '11:00'
      }
    },
    response: {
      success: {
        booking: {
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          status: 'CHECKED_IN',
          checkInTime: '2025-10-22T14:30:00Z',
          roomNumber: '205',
          keyCardsIssued: 2,
          depositAmount: 100.00
        },
        welcome: {
          message: 'Welcome to Grand Plaza Hotel, Mr. Doe!',
          wifiPassword: 'GrandPlaza2025',
          breakfastTimes: '07:00 - 10:00',
          checkOutTime: '11:00',
          hotelServices: ['Concierge', 'Room Service', 'Spa', 'Gym']
        },
        room: {
          number: '205',
          floor: 2,
          type: 'DELUXE',
          amenities: ['King Bed', 'City View', 'Mini Bar'],
          status: 'OCCUPIED'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/front-desk/bookings/{id}/checkout',
    description: 'Check-out guest',
    category: 'Front Desk',
    request: {
      params: { id: 'number' },
      body: {
        finalBill: 699.98,
        additionalCharges: [
          { description: 'Room Service', amount: 45.00 },
          { description: 'Minibar', amount: 25.00 },
          { description: 'Late Checkout Fee', amount: 30.00 }
        ],
        paymentMethod: 'CREDIT_CARD',
        depositRefund: 100.00,
        keyCardsReturned: 2,
        roomCondition: 'GOOD',
        guestFeedback: 'Excellent stay, thank you!',
        transportationNeeded: false
      }
    },
    response: {
      success: {
        booking: {
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          status: 'CHECKED_OUT',
          checkOutTime: '2025-10-24T10:45:00Z',
          finalAmount: 699.98,
          depositRefunded: 100.00
        },
        bill: {
          originalAmount: 599.98,
          additionalCharges: 100.00,
          taxes: 60.00,
          totalAmount: 759.98,
          depositApplied: 100.00,
          finalAmount: 659.98,
          paymentMethod: 'CREDIT_CARD',
          receiptNumber: 'REC-2025-001234'
        },
        room: {
          number: '205',
          status: 'NEEDS_CLEANING',
          condition: 'GOOD',
          nextBooking: '2025-10-25T15:00:00Z'
        },
        guest: {
          pointsEarned: 350,
          newLoyaltyLevel: 'GOLD',
          thankYouMessage: 'Thank you for staying with us, Mr. Doe!'
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/front-desk/bookings/{id}/room-assignment',
    description: 'Assign room',
    category: 'Front Desk',
    request: {
      params: { id: 'number' },
      body: {
        newRoomNumber: '301',
        reason: 'UPGRADE | MAINTENANCE | GUEST_REQUEST | OVERBOOKING',
        notes: 'Guest requested higher floor for better view',
        effectiveDate: '2025-10-22T15:00:00Z',
        compensationType: 'COMPLIMENTARY_UPGRADE | DISCOUNT | AMENITY',
        notifyGuest: true
      }
    },
    response: {
      success: {
        booking: {
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          oldRoomNumber: '205',
          newRoomNumber: '301',
          roomChangeReason: 'UPGRADE',
          assignedAt: '2025-10-22T14:15:00Z'
        },
        roomChange: {
          fromRoom: {
            number: '205',
            type: 'DELUXE',
            floor: 2
          },
          toRoom: {
            number: '301',
            type: 'SUITE',
            floor: 3,
            upgrade: true,
            additionalAmenities: ['Living Area', 'Premium View', 'Balcony']
          },
          compensation: {
            type: 'COMPLIMENTARY_UPGRADE',
            value: 150.00,
            description: 'Complimentary upgrade to suite'
          }
        },
        notification: {
          sent: true,
          method: 'SMS',
          message: 'Good news! Your room has been upgraded to Suite 301.'
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/front-desk/bookings/{id}/status',
    description: 'Update booking status',
    category: 'Front Desk',
    request: {
      params: { id: 'number' },
      body: {
        status: 'BOOKED | CHECKED_IN | CHECKED_OUT | NO_SHOW | CANCELLED',
        notes: 'Guest called to confirm late arrival',
        estimatedArrival: '2025-10-22T18:00:00Z (optional)',
        specialInstructions: 'Hold room until 11 PM',
        staffMember: 'Front Desk Agent - Sarah Johnson'
      }
    },
    response: {
      success: {
        booking: {
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          previousStatus: 'BOOKED',
          newStatus: 'BOOKED',
          statusUpdatedAt: '2025-10-22T14:30:00Z',
          notes: 'Guest called to confirm late arrival'
        },
        statusHistory: [{
          status: 'BOOKED',
          timestamp: '2025-10-22T10:30:00Z',
          updatedBy: 'System'
        }, {
          status: 'BOOKED',
          timestamp: '2025-10-22T14:30:00Z',
          updatedBy: 'Sarah Johnson',
          notes: 'Guest called to confirm late arrival'
        }]
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/front-desk/rooms',
    description: 'Get front desk rooms',
    category: 'Front Desk',
    request: {
      query: {
        status: 'AVAILABLE | OCCUPIED | OUT_OF_ORDER | CLEANING | MAINTENANCE (optional)',
        floor: 'number (optional)',
        type: 'STANDARD | DELUXE | SUITE (optional)',
        housekeeping: 'boolean (optional)'
      }
    },
    response: {
      success: {
        rooms: [{
          id: 101,
          number: '205',
          floor: 2,
          type: 'DELUXE',
          status: 'OCCUPIED',
          currentGuest: 'John Doe',
          checkInDate: '2025-10-22',
          checkOutDate: '2025-10-24',
          housekeepingStatus: 'CLEAN',
          lastCleaned: '2025-10-22T08:00:00Z',
          maintenanceIssues: [],
          amenities: ['King Bed', 'City View', 'Mini Bar'],
          maxOccupancy: 2,
          ratePerNight: 299.99,
          nextBooking: {
            checkInDate: '2025-10-25',
            guestName: 'Jane Smith',
            confirmationNumber: 'CONF-DEF456'
          }
        }],
        summary: {
          totalRooms: 150,
          available: 45,
          occupied: 85,
          outOfOrder: 5,
          cleaning: 10,
          maintenance: 5,
          occupancyRate: 56.7
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/front-desk/rooms/{id}/status',
    description: 'Update room status',
    category: 'Front Desk',
    request: {
      params: { id: 'number' },
      body: {
        status: 'AVAILABLE | OCCUPIED | OUT_OF_ORDER | CLEANING | MAINTENANCE',
        notes: 'Air conditioning unit needs repair',
        priority: 'LOW | MEDIUM | HIGH | URGENT',
        estimatedResolution: '2025-10-23T10:00:00Z (optional)',
        assignedTo: 'Maintenance Team A (optional)',
        maintenanceType: 'PLUMBING | ELECTRICAL | HVAC | FURNITURE | OTHER (optional)'
      }
    },
    response: {
      success: {
        room: {
          id: 101,
          number: '205',
          previousStatus: 'AVAILABLE',
          newStatus: 'OUT_OF_ORDER',
          statusUpdatedAt: '2025-10-22T14:30:00Z'
        },
        maintenance: {
          ticketId: 'MAINT-2025-001234',
          priority: 'HIGH',
          issue: 'Air conditioning unit needs repair',
          assignedTo: 'Maintenance Team A',
          estimatedResolution: '2025-10-23T10:00:00Z',
          impact: {
            affectedBookings: 2,
            revenueImpact: 599.98,
            alternativeRoomsAvailable: 3
          }
        },
        notifications: {
          housekeeping: 'Room 205 temporarily out of service',
          reservations: 'Affected bookings will be relocated',
          management: 'High priority maintenance required for Room 205'
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/front-desk/walk-in-booking',
    description: 'Create walk-in booking',
    category: 'Front Desk',
    request: {
      body: {
        guestName: 'Jane Walk-in',
        guestEmail: 'jane@example.com',
        guestPhone: '+1234567890',
        idType: 'DRIVERS_LICENSE | PASSPORT | NATIONAL_ID',
        idNumber: 'DL123456789',
        roomType: 'STANDARD | DELUXE | SUITE',
        nights: 2,
        adults: 1,
        children: 0,
        checkInDate: '2025-10-22',
        checkOutDate: '2025-10-24',
        paymentMethod: 'CREDIT_CARD | CASH | DEBIT_CARD',
        depositAmount: 100.00,
        discountApplied: 'WALK_IN_SPECIAL',
        specialRequests: 'Ground floor room preferred',
        staffMember: 'Front Desk Agent - Sarah Johnson'
      }
    },
    response: {
      success: {
        booking: {
          id: 152,
          confirmationNumber: 'CONF-WALK001',
          type: 'WALK_IN',
          guestName: 'Jane Walk-in',
          roomNumber: '105',
          roomType: 'DELUXE',
          checkInDate: '2025-10-22',
          checkOutDate: '2025-10-24',
          nights: 2,
          status: 'CHECKED_IN',
          totalAmount: 399.98,
          depositPaid: 100.00,
          balanceDue: 299.98,
          createdAt: '2025-10-22T14:30:00Z'
        },
        room: {
          number: '105',
          floor: 1,
          type: 'DELUXE',
          keyCardsIssued: 1,
          status: 'OCCUPIED'
        },
        discount: {
          code: 'WALK_IN_SPECIAL',
          percentage: 15,
          amount: 70.59,
          description: '15% walk-in discount'
        },
        welcome: {
          message: 'Welcome to Grand Plaza Hotel, Ms. Walk-in!',
          checkInCompleted: true,
          wifiPassword: 'GrandPlaza2025',
          services: ['24/7 Front Desk', 'Room Service', 'Concierge']
        }
      }
    }
  }
];

// Step 6: Hotel Admin Operations Endpoints
export const hotelAdminEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/hotel-admin/hotel',
    description: 'Get hotel admin hotel',
    category: 'Hotel Admin',
    request: {
      headers: { 'Authorization': 'Bearer {hotelAdminToken}' }
    },
    response: {
      success: {
        id: 123,
        name: 'Grand Plaza Hotel',
        description: 'Luxury hotel in downtown',
        address: '123 Main Street, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'info@grandplaza.com',
        website: 'https://grandplaza.com',
        settings: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          currency: 'USD',
          timezone: 'America/New_York',
          language: 'en'
        },
        amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking'],
        policies: {
          cancellationPolicy: '24 hours before check-in',
          petPolicy: 'Pets allowed with fee',
          smokingPolicy: 'Non-smoking property'
        },
        statistics: {
          totalRooms: 150,
          occupancyRate: 85.5,
          averageRate: 299.99,
          totalBookings: 1250,
          revenue: 125000.50
        },
        status: 'ACTIVE',
        lastUpdated: '2025-10-22T10:30:00Z'
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/hotel-admin/hotel',
    description: 'Update hotel admin hotel',
    category: 'Hotel Admin',
    request: {
      body: {
        name: 'Grand Plaza Hotel & Spa (optional)',
        description: 'string (optional)',
        phone: 'string (optional)',
        email: 'string (optional)',
        website: 'string (optional)',
        settings: {
          checkInTime: '14:00 (optional)',
          checkOutTime: '12:00 (optional)',
          currency: 'USD (optional)',
          timezone: 'string (optional)'
        },
        amenities: 'array (optional)',
        policies: {
          cancellationPolicy: 'string (optional)',
          petPolicy: 'string (optional)',
          smokingPolicy: 'string (optional)'
        }
      }
    },
    response: {
      success: {
        hotel: {
          id: 123,
          name: 'Grand Plaza Hotel & Spa',
          status: 'updated',
          updatedAt: '2025-10-22T10:30:00Z'
        },
        changes: {
          fieldsUpdated: ['name', 'settings.checkInTime'],
          previousValues: {
            name: 'Grand Plaza Hotel',
            checkInTime: '15:00'
          },
          newValues: {
            name: 'Grand Plaza Hotel & Spa',
            checkInTime: '14:00'
          }
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/hotel-admin/staff',
    description: 'Get hotel staff',
    category: 'Hotel Admin',
    request: {
      query: {
        department: 'FRONT_DESK | HOUSEKEEPING | MAINTENANCE | RESTAURANT | MANAGEMENT (optional)',
        status: 'ACTIVE | INACTIVE | ON_LEAVE (optional)',
        shift: 'MORNING | AFTERNOON | NIGHT (optional)'
      }
    },
    response: {
      success: {
        staff: [{
          id: 1,
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@grandplaza.com',
          phone: '+1-555-0234',
          position: 'Front Desk Manager',
          department: 'FRONT_DESK',
          shift: 'MORNING',
          status: 'ACTIVE',
          hireDate: '2024-01-15',
          salary: 45000.00,
          permissions: ['CHECK_IN', 'CHECK_OUT', 'ROOM_ASSIGNMENT'],
          emergencyContact: {
            name: 'John Johnson',
            phone: '+1-555-0235',
            relationship: 'Spouse'
          },
          lastShift: '2025-10-22T06:00:00Z',
          performance: {
            rating: 4.8,
            completedTrainings: 12,
            customerRating: 4.9
          }
        }],
        summary: {
          totalStaff: 45,
          activeStaff: 42,
          onLeave: 2,
          inactive: 1,
          departments: {
            frontDesk: 8,
            housekeeping: 15,
            maintenance: 6,
            restaurant: 12,
            management: 4
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/hotel-admin/staff',
    description: 'Create staff member',
    category: 'Hotel Admin',
    request: {
      body: {
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        phone: 'string',
        position: 'string',
        department: 'FRONT_DESK | HOUSEKEEPING | MAINTENANCE | RESTAURANT | MANAGEMENT',
        shift: 'MORNING | AFTERNOON | NIGHT',
        hireDate: '2025-10-22',
        salary: 40000.00,
        permissions: ['CHECK_IN', 'CHECK_OUT'],
        emergencyContact: {
          name: 'string',
          phone: 'string',
          relationship: 'string'
        }
      }
    },
    response: {
      success: {
        staff: {
          id: 46,
          firstName: 'Michael',
          lastName: 'Chen',
          position: 'Front Desk Agent',
          department: 'FRONT_DESK',
          status: 'ACTIVE',
          employeeId: 'EMP-2025-046',
          hireDate: '2025-10-22',
          createdAt: '2025-10-22T10:30:00Z'
        },
        onboarding: {
          trainingScheduled: true,
          uniformSize: 'M',
          keyCardAccess: ['FRONT_DESK', 'BREAK_ROOM'],
          systemAccess: {
            username: 'mchen',
            temporaryPassword: 'TempPass123!',
            mustChangePassword: true
          }
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/hotel-admin/rooms',
    description: 'Get hotel admin rooms',
    category: 'Hotel Admin',
    request: {
      query: {
        floor: 'number (optional)',
        type: 'STANDARD | DELUXE | SUITE (optional)',
        status: 'AVAILABLE | OCCUPIED | OUT_OF_ORDER | MAINTENANCE (optional)',
        amenities: 'string[] (optional)'
      }
    },
    response: {
      success: {
        rooms: [{
          id: 101,
          number: '205',
          floor: 2,
          type: 'DELUXE',
          status: 'AVAILABLE',
          maxOccupancy: 2,
          bedType: 'KING',
          size: '35 sqm',
          view: 'CITY',
          amenities: ['City View', 'Mini Bar', 'WiFi', 'Air Conditioning'],
          ratePerNight: 299.99,
          housekeeping: {
            lastCleaned: '2025-10-22T08:00:00Z',
            status: 'CLEAN',
            cleanedBy: 'Maria Rodriguez'
          },
          maintenance: {
            lastInspection: '2025-10-20T10:00:00Z',
            issues: [],
            nextScheduledMaintenance: '2025-11-01T09:00:00Z'
          },
          occupancy: {
            currentGuest: null,
            nextBooking: {
              checkInDate: '2025-10-25',
              guestName: 'Jane Smith'
            },
            occupancyRate30Days: 75.5
          }
        }],
        summary: {
          totalRooms: 150,
          byType: {
            standard: 75,
            deluxe: 60,
            suite: 15
          },
          byStatus: {
            available: 45,
            occupied: 85,
            outOfOrder: 5,
            maintenance: 15
          },
          averageRate: 299.99,
          occupancyRate: 56.7
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/hotel-admin/rooms',
    description: 'Create room',
    category: 'Hotel Admin',
    request: {
      body: {
        number: 'string',
        floor: 'number',
        type: 'STANDARD | DELUXE | SUITE',
        maxOccupancy: 'number',
        bedType: 'SINGLE | DOUBLE | QUEEN | KING | TWIN',
        size: 'string',
        view: 'CITY | GARDEN | POOL | OCEAN | MOUNTAIN',
        amenities: ['WiFi', 'Mini Bar', 'Air Conditioning'],
        ratePerNight: 'number',
        description: 'string (optional)'
      }
    },
    response: {
      success: {
        room: {
          id: 151,
          number: '401',
          floor: 4,
          type: 'SUITE',
          status: 'AVAILABLE',
          maxOccupancy: 4,
          bedType: 'KING',
          ratePerNight: 599.99,
          createdAt: '2025-10-22T10:30:00Z'
        },
        setup: {
          housekeepingAssigned: true,
          maintenanceInspectionScheduled: '2025-10-23T09:00:00Z',
          inventoryAdded: true,
          systemUpdated: true
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/hotel-admin/statistics',
    description: 'Get hotel statistics',
    category: 'Hotel Admin',
    request: {
      query: {
        period: 'TODAY | WEEK | MONTH | QUARTER | YEAR',
        dateFrom: '2025-10-01 (optional)',
        dateTo: '2025-10-31 (optional)'
      }
    },
    response: {
      success: {
        overview: {
          totalRevenue: 125000.50,
          totalBookings: 1250,
          occupancyRate: 85.5,
          averageRate: 299.99,
          totalGuests: 2500,
          repeatGuests: 625
        },
        bookings: {
          confirmed: 45,
          checkedIn: 85,
          checkedOut: 120,
          cancelled: 15,
          noShows: 5,
          walkIns: 25
        },
        revenue: {
          rooms: 95000.00,
          food: 15000.50,
          spa: 8000.00,
          other: 7000.00,
          taxes: 12500.05,
          totalGross: 137500.55,
          totalNet: 125000.50
        },
        rooms: {
          totalRooms: 150,
          availableTonight: 45,
          occupiedTonight: 85,
          outOfOrder: 5,
          cleaning: 15,
          averageStayLength: 2.5
        },
        guests: {
          totalGuests: 2500,
          newGuests: 1875,
          repeatGuests: 625,
          loyaltyMembers: 750,
          averageAge: 42,
          topCountries: ['USA', 'Canada', 'UK']
        },
        trends: {
          revenueGrowth: 15.5,
          occupancyGrowth: 8.2,
          averageRateGrowth: 5.1,
          guestSatisfaction: 4.6
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/hotel-admin/bookings',
    description: 'Get hotel bookings',
    category: 'Hotel Admin',
    request: {
      query: {
        status: 'ALL | BOOKED | CHECKED_IN | CHECKED_OUT | CANCELLED (optional)',
        dateFrom: '2025-10-01 (optional)',
        dateTo: '2025-10-31 (optional)',
        roomType: 'STANDARD | DELUXE | SUITE (optional)',
        page: '0',
        size: '20'
      }
    },
    response: {
      success: {
        bookings: [{
          id: 1,
          confirmationNumber: 'CONF-ABC123',
          guestName: 'John Doe',
          guestEmail: 'john@example.com',
          roomNumber: '205',
          roomType: 'DELUXE',
          status: 'CHECKED_IN',
          checkInDate: '2025-10-22',
          checkOutDate: '2025-10-24',
          nights: 2,
          adults: 2,
          children: 0,
          totalAmount: 599.98,
          paymentStatus: 'PAID',
          source: 'DIRECT | BOOKING_COM | EXPEDIA | WALK_IN',
          specialRequests: 'Late check-in requested',
          createdAt: '2025-10-20T14:30:00Z',
          revenue: {
            roomRevenue: 599.98,
            additionalServices: 75.50,
            taxes: 67.55,
            totalRevenue: 743.03
          },
          guest: {
            loyaltyLevel: 'GOLD',
            visits: 3,
            totalSpent: 2500.00
          }
        }],
        pagination: {
          totalElements: 1250,
          totalPages: 63,
          currentPage: 0,
          size: 20
        },
        analytics: {
          totalRevenue: 125000.50,
          averageBookingValue: 299.99,
          occupancyRate: 85.5,
          noShowRate: 2.5
        }
      }
    }
  }
];

// Step 7: Task & Notification Management Endpoints
export const taskNotificationEndpoints: APIEndpoint[] = [
  // Todo Management
  {
    method: 'GET',
    path: '/managemyhotel/api/todos',
    description: 'Get todos',
    category: 'Tasks & Notifications',
    request: {
      query: {
        status: 'PENDING | COMPLETED | OVERDUE (optional)',
        priority: 'LOW | MEDIUM | HIGH | URGENT (optional)',
        assignedTo: 'number (optional)',
        dueDate: 'string (optional)',
        category: 'MAINTENANCE | HOUSEKEEPING | FRONT_DESK | ADMIN (optional)'
      }
    },
    response: {
      success: {
        todos: [{
          id: 1,
          title: 'Fix air conditioning in Room 205',
          description: 'Guest reported AC not working properly',
          status: 'PENDING',
          priority: 'HIGH',
          category: 'MAINTENANCE',
          assignedTo: {
            id: 5,
            name: 'Mike Wilson',
            department: 'MAINTENANCE'
          },
          createdBy: {
            id: 1,
            name: 'Sarah Johnson',
            department: 'FRONT_DESK'
          },
          dueDate: '2025-10-23T10:00:00Z',
          estimatedDuration: 120,
          location: 'Room 205',
          relatedBooking: {
            id: 123,
            confirmationNumber: 'CONF-ABC123',
            guestName: 'John Doe'
          },
          createdAt: '2025-10-22T14:30:00Z',
          updatedAt: '2025-10-22T14:30:00Z'
        }],
        summary: {
          totalTodos: 25,
          pending: 15,
          completed: 8,
          overdue: 2,
          byPriority: {
            urgent: 3,
            high: 7,
            medium: 10,
            low: 5
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/todos',
    description: 'Create todo',
    category: 'Tasks & Notifications',
    request: {
      body: {
        title: 'string',
        description: 'string',
        priority: 'LOW | MEDIUM | HIGH | URGENT',
        category: 'MAINTENANCE | HOUSEKEEPING | FRONT_DESK | ADMIN',
        assignedTo: 'number (optional)',
        dueDate: '2025-10-23T10:00:00Z',
        estimatedDuration: 'number (minutes)',
        location: 'string (optional)',
        relatedBookingId: 'number (optional)',
        attachments: ['file1.jpg', 'file2.pdf']
      }
    },
    response: {
      success: {
        todo: {
          id: 26,
          title: 'Fix air conditioning in Room 205',
          status: 'PENDING',
          priority: 'HIGH',
          category: 'MAINTENANCE',
          assignedTo: {
            id: 5,
            name: 'Mike Wilson'
          },
          createdBy: {
            id: 1,
            name: 'Sarah Johnson'
          },
          dueDate: '2025-10-23T10:00:00Z',
          createdAt: '2025-10-22T14:30:00Z'
        },
        notifications: {
          assigneeNotified: true,
          managerNotified: true,
          escalationScheduled: '2025-10-23T12:00:00Z'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/todos/{id}',
    description: 'Get todo by ID',
    category: 'Tasks & Notifications',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        id: 1,
        title: 'Fix air conditioning in Room 205',
        description: 'Guest reported AC not working properly. Temperature not responding to thermostat.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        category: 'MAINTENANCE',
        assignedTo: {
          id: 5,
          name: 'Mike Wilson',
          phone: '+1-555-0345',
          department: 'MAINTENANCE'
        },
        createdBy: {
          id: 1,
          name: 'Sarah Johnson',
          department: 'FRONT_DESK'
        },
        dueDate: '2025-10-23T10:00:00Z',
        estimatedDuration: 120,
        actualDuration: 45,
        location: 'Room 205',
        relatedBooking: {
          id: 123,
          confirmationNumber: 'CONF-ABC123',
          guestName: 'John Doe',
          roomNumber: '205'
        },
        comments: [{
          id: 1,
          user: 'Mike Wilson',
          message: 'Diagnosed issue as faulty thermostat sensor',
          timestamp: '2025-10-22T15:30:00Z'
        }],
        attachments: ['ac_issue_photo.jpg', 'diagnostic_report.pdf'],
        createdAt: '2025-10-22T14:30:00Z',
        updatedAt: '2025-10-22T15:30:00Z'
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/todos/{id}',
    description: 'Update todo',
    category: 'Tasks & Notifications',
    request: {
      params: { id: 'number' },
      body: {
        title: 'string (optional)',
        description: 'string (optional)',
        status: 'PENDING | IN_PROGRESS | COMPLETED | CANCELLED (optional)',
        priority: 'LOW | MEDIUM | HIGH | URGENT (optional)',
        assignedTo: 'number (optional)',
        dueDate: 'string (optional)',
        estimatedDuration: 'number (optional)',
        actualDuration: 'number (optional)',
        notes: 'string (optional)'
      }
    },
    response: {
      success: {
        todo: {
          id: 1,
          status: 'COMPLETED',
          actualDuration: 90,
          completedAt: '2025-10-22T16:00:00Z',
          updatedAt: '2025-10-22T16:00:00Z'
        },
        statusChange: {
          from: 'IN_PROGRESS',
          to: 'COMPLETED',
          completedBy: 'Mike Wilson',
          completionNotes: 'Thermostat sensor replaced, AC working normally'
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/todos/{id}',
    description: 'Delete todo',
    category: 'Tasks & Notifications',
    request: {
      params: { id: 'number' },
      body: {
        reason: 'string (optional)'
      }
    },
    response: {
      success: {
        message: 'Todo deleted successfully',
        deletedTodo: {
          id: 1,
          title: 'Fix air conditioning in Room 205',
          deletedAt: '2025-10-22T16:00:00Z',
          deletedBy: 'Sarah Johnson'
        }
      }
    }
  },
  {
    method: 'PATCH',
    path: '/managemyhotel/api/todos/{id}/toggle',
    description: 'Toggle todo status',
    category: 'Tasks & Notifications',
    request: {
      params: { id: 'number' },
      body: {
        notes: 'string (optional)'
      }
    },
    response: {
      success: {
        todo: {
          id: 1,
          status: 'COMPLETED',
          previousStatus: 'PENDING',
          toggledAt: '2025-10-22T16:00:00Z',
          toggledBy: 'Mike Wilson'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/todos/filtered',
    description: 'Get filtered todos',
    category: 'Tasks & Notifications',
    request: {
      query: {
        filters: 'object',
        sortBy: 'dueDate | priority | createdAt | status',
        sortOrder: 'ASC | DESC',
        page: '0',
        size: '20'
      }
    },
    response: {
      success: {
        todos: [{
          id: 1,
          title: 'Fix air conditioning in Room 205',
          status: 'PENDING',
          priority: 'HIGH',
          dueDate: '2025-10-23T10:00:00Z',
          assignedTo: 'Mike Wilson'
        }],
        filters: {
          applied: {
            status: 'PENDING',
            priority: 'HIGH'
          },
          available: {
            statuses: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
            priorities: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            categories: ['MAINTENANCE', 'HOUSEKEEPING', 'FRONT_DESK'],
            assignees: [{ id: 5, name: 'Mike Wilson' }]
          }
        },
        pagination: {
          totalElements: 15,
          totalPages: 1,
          currentPage: 0
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/todos/overdue',
    description: 'Get overdue todos',
    category: 'Tasks & Notifications',
    request: {
      query: {
        assignedTo: 'number (optional)',
        category: 'string (optional)'
      }
    },
    response: {
      success: {
        overdueTodos: [{
          id: 2,
          title: 'Replace broken lamp in lobby',
          status: 'PENDING',
          priority: 'MEDIUM',
          dueDate: '2025-10-20T09:00:00Z',
          daysPastDue: 2,
          assignedTo: {
            id: 3,
            name: 'Tom Mitchell',
            department: 'MAINTENANCE'
          },
          escalated: true,
          escalationLevel: 1
        }],
        summary: {
          totalOverdue: 2,
          criticalOverdue: 1,
          averageDaysPastDue: 1.5,
          byCategory: {
            maintenance: 1,
            housekeeping: 1
          }
        }
      }
    }
  },

  // Notification Management
  {
    method: 'GET',
    path: '/managemyhotel/api/notifications',
    description: 'Get notifications',
    category: 'Tasks & Notifications',
    request: {
      query: {
        read: 'true | false (optional)',
        type: 'BOOKING | MAINTENANCE | SYSTEM | STAFF (optional)',
        priority: 'LOW | MEDIUM | HIGH | URGENT (optional)',
        dateFrom: 'string (optional)',
        page: '0',
        size: '20'
      }
    },
    response: {
      success: {
        notifications: [{
          id: 1,
          type: 'BOOKING',
          title: 'New Booking Confirmed',
          message: 'Booking CONF-ABC123 has been confirmed for John Doe',
          priority: 'MEDIUM',
          read: false,
          userId: 1,
          data: {
            bookingId: 123,
            confirmationNumber: 'CONF-ABC123',
            guestName: 'John Doe',
            checkInDate: '2025-10-25'
          },
          actionRequired: false,
          expiresAt: '2025-11-22T10:30:00Z',
          createdAt: '2025-10-22T10:30:00Z'
        }],
        summary: {
          totalNotifications: 25,
          unreadCount: 8,
          byType: {
            booking: 10,
            maintenance: 5,
            system: 7,
            staff: 3
          },
          urgent: 2
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/notifications/recent',
    description: 'Get recent notifications',
    category: 'Tasks & Notifications',
    request: {
      query: {
        limit: '10 (optional)',
        hours: '24 (optional)'
      }
    },
    response: {
      success: {
        recentNotifications: [{
          id: 1,
          type: 'BOOKING',
          title: 'New Booking Confirmed',
          message: 'Booking CONF-ABC123 confirmed',
          priority: 'MEDIUM',
          read: false,
          timeAgo: '2 hours ago',
          createdAt: '2025-10-22T10:30:00Z'
        }],
        meta: {
          requestedLimit: 10,
          returnedCount: 5,
          oldestNotification: '2025-10-21T10:30:00Z',
          hasMore: false
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/notifications/unread-count',
    description: 'Get unread count',
    category: 'Tasks & Notifications',
    request: {},
    response: {
      success: {
        unreadCount: 8,
        byType: {
          booking: 3,
          maintenance: 2,
          system: 2,
          staff: 1
        },
        urgent: 2,
        lastUpdated: '2025-10-22T10:30:00Z'
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/notifications/{id}/read',
    description: 'Mark notification as read',
    category: 'Tasks & Notifications',
    request: {
      params: { id: 'number' }
    },
    response: {
      success: {
        notification: {
          id: 1,
          read: true,
          readAt: '2025-10-22T10:45:00Z',
          readBy: 'Sarah Johnson'
        },
        unreadCount: 7
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/notifications/mark-all-read',
    description: 'Mark all as read',
    category: 'Tasks & Notifications',
    request: {
      body: {
        olderThan: '2025-10-20T00:00:00Z (optional)',
        type: 'BOOKING | MAINTENANCE | SYSTEM | STAFF (optional)'
      }
    },
    response: {
      success: {
        markedAsRead: 8,
        unreadCount: 0,
        markedAt: '2025-10-22T10:45:00Z'
      }
    }
  }
];

// Step 8: Room Charges & Pricing Endpoints
export const pricingEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/room-charges',
    description: 'Get room charges',
    category: 'Pricing & Room Charges',
    request: {
      query: {
        bookingId: 'number (optional)',
        roomId: 'number (optional)',
        guestId: 'number (optional)',
        chargeType: 'ROOM | FOOD | BEVERAGE | SERVICE | EXTRA (optional)',
        status: 'PENDING | PAID | CANCELLED (optional)',
        dateFrom: 'string (optional)',
        dateTo: 'string (optional)'
      }
    },
    response: {
      success: {
        charges: [{
          id: 1,
          bookingId: 123,
          roomNumber: '205',
          guestName: 'John Doe',
          chargeType: 'ROOM',
          description: 'Standard Room - Night 1',
          baseAmount: 120.00,
          taxes: 12.00,
          discounts: 0.00,
          totalAmount: 132.00,
          currency: 'USD',
          chargeDate: '2025-10-22',
          status: 'PENDING',
          category: 'ACCOMMODATION',
          taxBreakdown: [{
            name: 'City Tax',
            rate: 10.0,
            amount: 12.00
          }],
          appliedAt: '2025-10-22T14:00:00Z',
          createdBy: 'Sarah Johnson'
        }],
        summary: {
          totalCharges: 25,
          totalAmount: 2840.00,
          pendingAmount: 1200.00,
          paidAmount: 1640.00,
          byType: {
            room: 1800.00,
            food: 450.00,
            beverage: 320.00,
            service: 180.00,
            extra: 90.00
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/room-charges',
    description: 'Add room charge',
    category: 'Pricing & Room Charges',
    request: {
      body: {
        bookingId: 'number',
        chargeType: 'ROOM | FOOD | BEVERAGE | SERVICE | EXTRA',
        description: 'string',
        baseAmount: 'number',
        quantity: 'number (default: 1)',
        taxRate: 'number (optional)',
        discountRate: 'number (optional)',
        category: 'string (optional)',
        chargeDate: '2025-10-22',
        notes: 'string (optional)'
      }
    },
    response: {
      success: {
        charge: {
          id: 26,
          bookingId: 123,
          chargeType: 'FOOD',
          description: 'Room Service - Dinner',
          baseAmount: 45.00,
          taxes: 4.50,
          totalAmount: 49.50,
          status: 'PENDING',
          createdAt: '2025-10-22T19:30:00Z'
        },
        bookingTotal: {
          previousTotal: 132.00,
          newTotal: 181.50,
          outstandingBalance: 181.50
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/room-charges/{id}',
    description: 'Update room charge',
    category: 'Pricing & Room Charges',
    request: {
      params: { id: 'number' },
      body: {
        description: 'string (optional)',
        baseAmount: 'number (optional)',
        quantity: 'number (optional)',
        taxRate: 'number (optional)',
        discountRate: 'number (optional)',
        status: 'PENDING | PAID | CANCELLED (optional)',
        notes: 'string (optional)'
      }
    },
    response: {
      success: {
        charge: {
          id: 1,
          description: 'Standard Room - Night 1 (Updated)',
          baseAmount: 125.00,
          taxes: 12.50,
          totalAmount: 137.50,
          status: 'PENDING',
          updatedAt: '2025-10-22T20:00:00Z'
        },
        bookingImpact: {
          previousAmount: 132.00,
          newAmount: 137.50,
          difference: 5.50
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/room-charges/{id}',
    description: 'Delete room charge',
    category: 'Pricing & Room Charges',
    request: {
      params: { id: 'number' },
      body: {
        reason: 'string (optional)'
      }
    },
    response: {
      success: {
        message: 'Room charge deleted successfully',
        deletedCharge: {
          id: 1,
          amount: 137.50,
          description: 'Standard Room - Night 1',
          deletedAt: '2025-10-22T20:15:00Z'
        },
        bookingUpdate: {
          previousTotal: 181.50,
          newTotal: 44.00,
          refundRequired: 137.50
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/room-charges/summary',
    description: 'Get charges summary',
    category: 'Pricing & Room Charges',
    request: {
      query: {
        bookingId: 'number (optional)',
        dateFrom: 'string (optional)',
        dateTo: 'string (optional)',
        groupBy: 'type | date | guest (optional)'
      }
    },
    response: {
      success: {
        summary: {
          totalCharges: 150,
          totalAmount: 15750.00,
          averageChargeAmount: 105.00,
          byType: {
            room: { count: 80, amount: 9600.00 },
            food: { count: 35, amount: 3150.00 },
            beverage: { count: 20, amount: 1400.00 },
            service: { count: 10, amount: 900.00 },
            extra: { count: 5, amount: 700.00 }
          },
          byStatus: {
            pending: { count: 25, amount: 2500.00 },
            paid: { count: 120, amount: 12750.00 },
            cancelled: { count: 5, amount: 500.00 }
          },
          taxSummary: {
            totalTaxes: 1575.00,
            averageTaxRate: 10.0
          }
        },
        trends: {
          dailyAverage: 525.00,
          peakDay: '2025-10-21',
          peakAmount: 890.00
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/room-charges/bulk',
    description: 'Add bulk charges',
    category: 'Pricing & Room Charges',
    request: {
      body: {
        charges: [{
          bookingId: 123,
          chargeType: 'ROOM',
          description: 'Standard Room - Night 1',
          baseAmount: 120.00,
          chargeDate: '2025-10-22'
        }],
        applyTaxes: 'boolean (default: true)',
        notes: 'string (optional)'
      }
    },
    response: {
      success: {
        processedCharges: [{
          id: 27,
          bookingId: 123,
          description: 'Standard Room - Night 1',
          totalAmount: 132.00,
          status: 'CREATED'
        }],
        summary: {
          totalProcessed: 1,
          totalAmount: 132.00,
          errors: 0,
          warnings: []
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/room-charges/pending',
    description: 'Get pending charges',
    category: 'Pricing & Room Charges',
    request: {
      query: {
        hotelId: 'number (optional)',
        olderThan: 'number (hours, optional)',
        minAmount: 'number (optional)'
      }
    },
    response: {
      success: {
        pendingCharges: [{
          id: 1,
          bookingId: 123,
          guestName: 'John Doe',
          roomNumber: '205',
          description: 'Standard Room - Night 1',
          amount: 132.00,
          daysPending: 2,
          priority: 'MEDIUM',
          chargeDate: '2025-10-20'
        }],
        summary: {
          totalPending: 15,
          totalAmount: 1980.00,
          averageDaysPending: 1.8,
          oldestCharge: '2025-10-18'
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/room-charges/{id}/apply-discount',
    description: 'Apply discount to charge',
    category: 'Pricing & Room Charges',
    request: {
      params: { id: 'number' },
      body: {
        discountType: 'PERCENTAGE | FIXED_AMOUNT',
        discountValue: 'number',
        reason: 'string',
        approvedBy: 'string (optional)'
      }
    },
    response: {
      success: {
        charge: {
          id: 1,
          originalAmount: 132.00,
          discountAmount: 13.20,
          finalAmount: 118.80,
          discountApplied: {
            type: 'PERCENTAGE',
            value: 10.0,
            reason: 'Loyalty guest discount',
            appliedBy: 'Sarah Johnson',
            appliedAt: '2025-10-22T21:00:00Z'
          }
        }
      }
    }
  }
];

// Step 9: Shopping & Inventory Management Endpoints
export const shoppingEndpoints: APIEndpoint[] = [
  // Product Management
  {
    method: 'GET',
    path: '/managemyhotel/api/products',
    description: 'Get products',
    category: 'Shopping & Inventory',
    request: {
      query: {
        category: 'FOOD | BEVERAGE | AMENITY | GIFT | SERVICE (optional)',
        available: 'true | false (optional)',
        minStock: 'number (optional)',
        priceRange: 'string (optional)',
        searchTerm: 'string (optional)'
      }
    },
    response: {
      success: {
        products: [{
          id: 1,
          name: 'Premium Coffee',
          category: 'BEVERAGE',
          description: 'High-quality Arabica coffee blend',
          price: 4.50,
          cost: 1.80,
          stockLevel: 150,
          minimumStock: 20,
          unit: 'cup',
          isAvailable: true,
          supplier: 'Local Coffee Roasters',
          barcodeNumber: '1234567890123',
          taxCategory: 'FOOD_BEVERAGE',
          tags: ['coffee', 'hot', 'premium'],
          image: 'coffee_premium.jpg',
          lastRestocked: '2025-10-20T09:00:00Z',
          createdAt: '2025-09-15T10:00:00Z'
        }],
        summary: {
          totalProducts: 45,
          inStock: 38,
          lowStock: 5,
          outOfStock: 2,
          totalValue: 12450.50
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/products',
    description: 'Create product',
    category: 'Shopping & Inventory',
    request: {
      body: {
        name: 'string',
        category: 'FOOD | BEVERAGE | AMENITY | GIFT | SERVICE',
        description: 'string',
        price: 'number',
        cost: 'number',
        stockLevel: 'number',
        minimumStock: 'number',
        unit: 'string',
        supplier: 'string (optional)',
        barcodeNumber: 'string (optional)',
        taxCategory: 'string',
        tags: ['string']
      }
    },
    response: {
      success: {
        product: {
          id: 46,
          name: 'Premium Coffee',
          category: 'BEVERAGE',
          price: 4.50,
          stockLevel: 150,
          isAvailable: true,
          createdAt: '2025-10-22T14:30:00Z'
        },
        inventoryUpdate: {
          totalProducts: 46,
          categoryCount: {
            beverage: 12
          }
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/products/{id}',
    description: 'Update product',
    category: 'Shopping & Inventory',
    request: {
      params: { id: 'number' },
      body: {
        name: 'string (optional)',
        description: 'string (optional)',
        price: 'number (optional)',
        cost: 'number (optional)',
        stockLevel: 'number (optional)',
        minimumStock: 'number (optional)',
        isAvailable: 'boolean (optional)',
        supplier: 'string (optional)'
      }
    },
    response: {
      success: {
        product: {
          id: 1,
          name: 'Premium Coffee Blend',
          price: 4.75,
          stockLevel: 175,
          updatedAt: '2025-10-22T15:00:00Z'
        },
        changes: {
          price: { from: 4.50, to: 4.75 },
          stockLevel: { from: 150, to: 175 }
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/products/{id}',
    description: 'Delete product',
    category: 'Shopping & Inventory',
    request: {
      params: { id: 'number' },
      body: {
        reason: 'string (optional)'
      }
    },
    response: {
      success: {
        message: 'Product deleted successfully',
        deletedProduct: {
          id: 1,
          name: 'Premium Coffee',
          finalStockLevel: 175,
          deletedAt: '2025-10-22T15:30:00Z'
        }
      }
    }
  },

  // Inventory Management
  {
    method: 'GET',
    path: '/managemyhotel/api/inventory/low-stock',
    description: 'Get low stock items',
    category: 'Shopping & Inventory',
    request: {
      query: {
        category: 'string (optional)',
        threshold: 'number (optional)'
      }
    },
    response: {
      success: {
        lowStockItems: [{
          id: 5,
          name: 'Mini Bar Chips',
          currentStock: 8,
          minimumStock: 15,
          stockDeficit: 7,
          category: 'FOOD',
          priority: 'MEDIUM',
          supplier: 'Snack Distributors Inc',
          lastOrderDate: '2025-10-15',
          suggestedOrderQuantity: 50
        }],
        summary: {
          totalLowStockItems: 5,
          criticalItems: 2,
          totalDeficit: 45,
          estimatedRestockCost: 340.50
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/inventory/restock',
    description: 'Restock inventory',
    category: 'Shopping & Inventory',
    request: {
      body: {
        productId: 'number',
        quantity: 'number',
        cost: 'number',
        supplier: 'string (optional)',
        invoiceNumber: 'string (optional)',
        notes: 'string (optional)'
      }
    },
    response: {
      success: {
        restockEntry: {
          id: 15,
          productId: 5,
          productName: 'Mini Bar Chips',
          quantity: 50,
          cost: 75.00,
          newStockLevel: 58,
          previousStockLevel: 8,
          restockedAt: '2025-10-22T16:00:00Z',
          restockedBy: 'John Manager'
        },
        inventoryUpdate: {
          totalValue: 12525.50,
          stockStatus: 'ADEQUATE'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/inventory/movements',
    description: 'Get inventory movements',
    category: 'Shopping & Inventory',
    request: {
      query: {
        productId: 'number (optional)',
        type: 'RESTOCK | SALE | ADJUSTMENT | WASTE (optional)',
        dateFrom: 'string (optional)',
        dateTo: 'string (optional)',
        page: '0',
        size: '20'
      }
    },
    response: {
      success: {
        movements: [{
          id: 1,
          productId: 5,
          productName: 'Mini Bar Chips',
          type: 'SALE',
          quantity: -2,
          previousStock: 10,
          newStock: 8,
          unitCost: 1.50,
          totalValue: -3.00,
          reason: 'Room service order - Room 205',
          relatedOrderId: 456,
          createdBy: 'Sarah Johnson',
          createdAt: '2025-10-22T14:30:00Z'
        }],
        summary: {
          totalMovements: 125,
          stockIn: 850,
          stockOut: 420,
          netMovement: 430,
          valueChange: 1240.50
        }
      }
    }
  },

  // Sales & Orders
  {
    method: 'GET',
    path: '/managemyhotel/api/shop/orders',
    description: 'Get shop orders',
    category: 'Shopping & Inventory',
    request: {
      query: {
        status: 'PENDING | CONFIRMED | DELIVERED | CANCELLED (optional)',
        guestId: 'number (optional)',
        roomNumber: 'string (optional)',
        dateFrom: 'string (optional)',
        deliveryType: 'ROOM_SERVICE | PICKUP | LOBBY (optional)'
      }
    },
    response: {
      success: {
        orders: [{
          id: 1,
          orderNumber: 'ORD-2025-001',
          guestId: 123,
          guestName: 'John Doe',
          roomNumber: '205',
          status: 'CONFIRMED',
          deliveryType: 'ROOM_SERVICE',
          items: [{
            productId: 1,
            name: 'Premium Coffee',
            quantity: 2,
            unitPrice: 4.50,
            totalPrice: 9.00
          }],
          subtotal: 9.00,
          taxes: 0.90,
          deliveryCharge: 2.00,
          totalAmount: 11.90,
          paymentStatus: 'PENDING',
          estimatedDelivery: '2025-10-22T15:30:00Z',
          specialInstructions: 'Extra sugar packets',
          orderedAt: '2025-10-22T15:00:00Z'
        }],
        summary: {
          totalOrders: 25,
          pendingOrders: 8,
          todayRevenue: 340.50,
          averageOrderValue: 13.62
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/shop/orders',
    description: 'Create shop order',
    category: 'Shopping & Inventory',
    request: {
      body: {
        guestId: 'number',
        roomNumber: 'string',
        deliveryType: 'ROOM_SERVICE | PICKUP | LOBBY',
        items: [{
          productId: 'number',
          quantity: 'number',
          specialInstructions: 'string (optional)'
        }],
        deliveryTime: 'string (optional)',
        paymentMethod: 'CASH | CARD | ROOM_CHARGE',
        specialInstructions: 'string (optional)'
      }
    },
    response: {
      success: {
        order: {
          id: 26,
          orderNumber: 'ORD-2025-026',
          status: 'PENDING',
          totalAmount: 11.90,
          estimatedDelivery: '2025-10-22T16:00:00Z',
          createdAt: '2025-10-22T15:30:00Z'
        },
        inventoryUpdate: {
          itemsReserved: 2,
          stockUpdated: ['Premium Coffee: 150 → 148']
        }
      }
    }
  }
];

// Step 10: Staff Management & Scheduling Endpoints
export const staffEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/staff',
    description: 'Get staff members',
    category: 'Staff Management',
    request: {
      query: {
        department: 'FRONT_DESK | HOUSEKEEPING | MAINTENANCE | ADMIN | FOOD_SERVICE (optional)',
        status: 'ACTIVE | INACTIVE | ON_LEAVE (optional)',
        role: 'string (optional)',
        shiftType: 'MORNING | AFTERNOON | NIGHT | ROTATING (optional)'
      }
    },
    response: {
      success: {
        staff: [{
          id: 1,
          employeeId: 'EMP001',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@hotel.com',
          phone: '+1-555-0123',
          department: 'FRONT_DESK',
          role: 'Front Desk Manager',
          status: 'ACTIVE',
          shiftType: 'MORNING',
          hireDate: '2024-03-15',
          salary: 45000.00,
          permissions: ['CHECK_IN', 'CHECK_OUT', 'MODIFY_BOOKING'],
          supervisor: {
            id: 10,
            name: 'Michael Brown',
            role: 'Hotel Manager'
          },
          emergencyContact: {
            name: 'Robert Johnson',
            phone: '+1-555-0124',
            relationship: 'Spouse'
          },
          lastLoginAt: '2025-10-22T08:30:00Z',
          createdAt: '2024-03-15T09:00:00Z'
        }],
        summary: {
          totalStaff: 25,
          activeStaff: 22,
          onLeave: 2,
          inactive: 1,
          byDepartment: {
            frontDesk: 6,
            housekeeping: 8,
            maintenance: 4,
            admin: 3,
            foodService: 4
          }
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/staff',
    description: 'Create staff member',
    category: 'Staff Management',
    request: {
      body: {
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        phone: 'string',
        department: 'FRONT_DESK | HOUSEKEEPING | MAINTENANCE | ADMIN | FOOD_SERVICE',
        role: 'string',
        shiftType: 'MORNING | AFTERNOON | NIGHT | ROTATING',
        hireDate: '2025-10-22',
        salary: 'number',
        supervisorId: 'number (optional)',
        permissions: ['string'],
        emergencyContact: {
          name: 'string',
          phone: 'string',
          relationship: 'string'
        }
      }
    },
    response: {
      success: {
        staff: {
          id: 26,
          employeeId: 'EMP026',
          firstName: 'Alex',
          lastName: 'Thompson',
          email: 'alex.thompson@hotel.com',
          department: 'HOUSEKEEPING',
          role: 'Housekeeper',
          status: 'ACTIVE',
          createdAt: '2025-10-22T10:00:00Z'
        },
        credentials: {
          username: 'alex.thompson',
          temporaryPassword: 'TempPass123!',
          mustChangePassword: true
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/staff/{id}',
    description: 'Update staff member',
    category: 'Staff Management',
    request: {
      params: { id: 'number' },
      body: {
        firstName: 'string (optional)',
        lastName: 'string (optional)',
        email: 'string (optional)',
        phone: 'string (optional)',
        department: 'string (optional)',
        role: 'string (optional)',
        status: 'ACTIVE | INACTIVE | ON_LEAVE (optional)',
        shiftType: 'string (optional)',
        salary: 'number (optional)',
        supervisorId: 'number (optional)',
        permissions: 'string[] (optional)'
      }
    },
    response: {
      success: {
        staff: {
          id: 1,
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'Senior Front Desk Manager',
          salary: 48000.00,
          updatedAt: '2025-10-22T11:00:00Z'
        },
        changes: {
          role: { from: 'Front Desk Manager', to: 'Senior Front Desk Manager' },
          salary: { from: 45000.00, to: 48000.00 }
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/staff/{id}',
    description: 'Delete staff member',
    category: 'Staff Management',
    request: {
      params: { id: 'number' },
      body: {
        reason: 'string',
        lastWorkingDay: '2025-10-31',
        transferToArchive: 'boolean (default: true)'
      }
    },
    response: {
      success: {
        message: 'Staff member removed successfully',
        staff: {
          id: 1,
          name: 'Sarah Johnson',
          lastWorkingDay: '2025-10-31',
          removedAt: '2025-10-22T11:30:00Z'
        },
        handoverTasks: {
          totalTasks: 5,
          reassignedTo: 'Michael Brown',
          pendingHandover: 2
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/staff/{id}/schedule',
    description: 'Get staff schedule',
    category: 'Staff Management',
    request: {
      params: { id: 'number' },
      query: {
        dateFrom: 'string (optional)',
        dateTo: 'string (optional)',
        month: 'string (optional)'
      }
    },
    response: {
      success: {
        schedule: [{
          id: 1,
          staffId: 1,
          date: '2025-10-22',
          shiftStart: '08:00',
          shiftEnd: '16:00',
          shiftType: 'MORNING',
          status: 'SCHEDULED',
          department: 'FRONT_DESK',
          breakTimes: [
            { start: '10:30', end: '10:45', type: 'COFFEE' },
            { start: '12:00', end: '13:00', type: 'LUNCH' }
          ],
          overtimeHours: 0,
          notes: 'Training new employee'
        }],
        summary: {
          totalHours: 160,
          regularHours: 152,
          overtimeHours: 8,
          scheduledDays: 20,
          leavesDays: 2
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/staff/{id}/schedule',
    description: 'Create staff schedule',
    category: 'Staff Management',
    request: {
      params: { id: 'number' },
      body: {
        date: '2025-10-23',
        shiftStart: '08:00',
        shiftEnd: '16:00',
        shiftType: 'MORNING',
        department: 'FRONT_DESK',
        notes: 'string (optional)'
      }
    },
    response: {
      success: {
        schedule: {
          id: 125,
          staffId: 1,
          date: '2025-10-23',
          shiftStart: '08:00',
          shiftEnd: '16:00',
          status: 'SCHEDULED',
          createdAt: '2025-10-22T12:00:00Z'
        },
        conflicts: {
          hasConflicts: false,
          overlappingShifts: [],
          leaveConflicts: []
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/staff/{id}/permissions',
    description: 'Update staff permissions',
    category: 'Staff Management',
    request: {
      params: { id: 'number' },
      body: {
        permissions: ['CHECK_IN', 'CHECK_OUT', 'MODIFY_BOOKING', 'CANCEL_BOOKING'],
        reason: 'string (optional)'
      }
    },
    response: {
      success: {
        staff: {
          id: 1,
          name: 'Sarah Johnson',
          previousPermissions: ['CHECK_IN', 'CHECK_OUT'],
          newPermissions: ['CHECK_IN', 'CHECK_OUT', 'MODIFY_BOOKING', 'CANCEL_BOOKING'],
          updatedAt: '2025-10-22T12:30:00Z'
        },
        permissionChanges: {
          added: ['MODIFY_BOOKING', 'CANCEL_BOOKING'],
          removed: [],
          unchanged: ['CHECK_IN', 'CHECK_OUT']
        }
      }
    }
  }
];

// Step 11: Advertisement Management Endpoints
export const advertisementEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/advertisements',
    description: 'Get advertisements',
    category: 'Advertisement Management',
    request: {
      query: {
        status: 'ACTIVE | INACTIVE | SCHEDULED | EXPIRED (optional)',
        placement: 'LOBBY | ROOMS | WEBSITE | EMAIL | MOBILE (optional)',
        type: 'BANNER | POPUP | PROMOTION | ANNOUNCEMENT (optional)',
        dateFrom: 'string (optional)',
        dateTo: 'string (optional)'
      }
    },
    response: {
      success: {
        advertisements: [{
          id: 1,
          title: 'Spa Weekend Special',
          description: 'Enjoy 20% off all spa services this weekend',
          type: 'PROMOTION',
          placement: ['LOBBY', 'WEBSITE'],
          status: 'ACTIVE',
          startDate: '2025-10-20',
          endDate: '2025-10-27',
          targetAudience: 'ALL_GUESTS',
          priority: 'HIGH',
          images: ['spa_promo_banner.jpg'],
          clickThroughUrl: '/spa-services',
          impressions: 1250,
          clicks: 89,
          clickThroughRate: 7.12,
          createdBy: 'Marketing Manager',
          createdAt: '2025-10-18T09:00:00Z'
        }],
        summary: {
          totalAds: 15,
          activeAds: 8,
          scheduledAds: 3,
          expiredAds: 4,
          totalImpressions: 25400,
          totalClicks: 1890,
          averageCTR: 7.44
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/managemyhotel/api/advertisements',
    description: 'Create advertisement',
    category: 'Advertisement Management',
    request: {
      body: {
        title: 'string',
        description: 'string',
        type: 'BANNER | POPUP | PROMOTION | ANNOUNCEMENT',
        placement: ['LOBBY', 'ROOMS', 'WEBSITE', 'EMAIL', 'MOBILE'],
        startDate: '2025-10-22',
        endDate: '2025-10-29',
        targetAudience: 'ALL_GUESTS | VIP_GUESTS | FREQUENT_GUESTS | NEW_GUESTS',
        priority: 'LOW | MEDIUM | HIGH | URGENT',
        images: ['string'],
        clickThroughUrl: 'string (optional)',
        budget: 'number (optional)',
        autoActivate: 'boolean (default: false)'
      }
    },
    response: {
      success: {
        advertisement: {
          id: 16,
          title: 'Spa Weekend Special',
          type: 'PROMOTION',
          status: 'SCHEDULED',
          startDate: '2025-10-22',
          endDate: '2025-10-29',
          createdAt: '2025-10-22T14:00:00Z'
        },
        scheduling: {
          autoActivationAt: '2025-10-22T00:00:00Z',
          autoDeactivationAt: '2025-10-29T23:59:59Z',
          estimatedReach: 500
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/advertisements/{id}',
    description: 'Update advertisement',
    category: 'Advertisement Management',
    request: {
      params: { id: 'number' },
      body: {
        title: 'string (optional)',
        description: 'string (optional)',
        status: 'ACTIVE | INACTIVE | SCHEDULED (optional)',
        startDate: 'string (optional)',
        endDate: 'string (optional)',
        priority: 'LOW | MEDIUM | HIGH | URGENT (optional)',
        targetAudience: 'string (optional)',
        images: 'string[] (optional)'
      }
    },
    response: {
      success: {
        advertisement: {
          id: 1,
          title: 'Premium Spa Weekend Special',
          status: 'ACTIVE',
          priority: 'URGENT',
          updatedAt: '2025-10-22T15:00:00Z'
        },
        changes: {
          title: { from: 'Spa Weekend Special', to: 'Premium Spa Weekend Special' },
          priority: { from: 'HIGH', to: 'URGENT' }
        },
        impact: {
          impressionsReset: true,
          estimatedNewReach: 750
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/managemyhotel/api/advertisements/{id}',
    description: 'Delete advertisement',
    category: 'Advertisement Management',
    request: {
      params: { id: 'number' },
      body: {
        reason: 'string (optional)'
      }
    },
    response: {
      success: {
        message: 'Advertisement deleted successfully',
        advertisement: {
          id: 1,
          title: 'Premium Spa Weekend Special',
          finalStats: {
            totalImpressions: 1250,
            totalClicks: 89,
            clickThroughRate: 7.12
          },
          deletedAt: '2025-10-22T15:30:00Z'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/advertisements/{id}/analytics',
    description: 'Get advertisement analytics',
    category: 'Advertisement Management',
    request: {
      params: { id: 'number' },
      query: {
        dateFrom: 'string (optional)',
        dateTo: 'string (optional)',
        groupBy: 'day | hour | placement (optional)'
      }
    },
    response: {
      success: {
        analytics: {
          impressions: {
            total: 1250,
            daily: [
              { date: '2025-10-20', count: 350 },
              { date: '2025-10-21', count: 425 },
              { date: '2025-10-22', count: 475 }
            ],
            byPlacement: {
              lobby: 600,
              website: 650
            }
          },
          clicks: {
            total: 89,
            daily: [
              { date: '2025-10-20', count: 25 },
              { date: '2025-10-21', count: 32 },
              { date: '2025-10-22', count: 32 }
            ],
            byPlacement: {
              lobby: 38,
              website: 51
            }
          },
          performance: {
            clickThroughRate: 7.12,
            engagement: {
              averageViewTime: 4.5,
              bounceRate: 15.2,
              conversionRate: 2.8
            },
            bestPerformingHour: '14:00-15:00',
            worstPerformingHour: '03:00-04:00'
          }
        }
      }
    }
  }
];

// Step 12: Monitoring & System Health Endpoints
export const monitoringEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/analytics/dashboard',
    description: 'Get analytics dashboard',
    category: 'Monitoring & Analytics',
    request: {
      query: {
        period: 'TODAY | WEEK | MONTH | QUARTER | YEAR',
        dateFrom: 'string (optional)',
        dateTo: 'string (optional)',
        metrics: 'occupancy,revenue,bookings,satisfaction (optional)'
      }
    },
    response: {
      success: {
        dashboard: {
          occupancy: {
            current: 78.5,
            previous: 72.3,
            change: 6.2,
            trend: 'UP',
            target: 80.0
          },
          revenue: {
            current: 125400.50,
            previous: 118200.30,
            change: 7200.20,
            changePercent: 6.09,
            forecast: 135000.00
          },
          bookings: {
            total: 245,
            confirmed: 220,
            pending: 15,
            cancelled: 10,
            noShows: 5,
            averageStay: 2.3
          },
          guestSatisfaction: {
            averageRating: 4.6,
            totalReviews: 89,
            distribution: {
              5: 58,
              4: 22,
              3: 7,
              2: 1,
              1: 1
            }
          },
          operationalMetrics: {
            checkInTime: 2.5,
            checkOutTime: 1.8,
            cleaningTime: 35,
            maintenanceRequests: 3
          }
        },
        lastUpdated: '2025-10-22T16:00:00Z'
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/analytics/reports/revenue',
    description: 'Get revenue report',
    category: 'Monitoring & Analytics',
    request: {
      query: {
        period: 'DAILY | WEEKLY | MONTHLY | YEARLY',
        dateFrom: '2025-10-01',
        dateTo: '2025-10-22',
        groupBy: 'day | week | month (optional)',
        includeForecasts: 'true | false (optional)'
      }
    },
    response: {
      success: {
        revenueReport: {
          summary: {
            totalRevenue: 456789.50,
            averageDaily: 20762.25,
            growth: 12.5,
            forecastedRevenue: 485000.00
          },
          breakdown: {
            accommodation: 380650.00,
            food: 45320.50,
            beverages: 18890.00,
            services: 11929.00
          },
          daily: [
            { date: '2025-10-20', revenue: 18450.00, occupancy: 76.5 },
            { date: '2025-10-21', revenue: 21200.50, occupancy: 82.1 },
            { date: '2025-10-22', revenue: 19876.25, occupancy: 78.9 }
          ],
          trends: {
            bestDay: 'Saturday',
            worstDay: 'Tuesday',
            seasonalPattern: 'Peak season Q4'
          }
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/managemyhotel/api/system/health',
    description: 'Get system health status',
    category: 'Monitoring & Analytics',
    request: {},
    response: {
      success: {
        health: {
          status: 'HEALTHY',
          uptime: '15d 7h 32m',
          lastRestart: '2025-10-07T09:30:00Z',
          services: {
            database: { status: 'HEALTHY', responseTime: 45 },
            paymentGateway: { status: 'HEALTHY', responseTime: 120 },
            emailService: { status: 'HEALTHY', responseTime: 200 },
            smsService: { status: 'WARNING', responseTime: 2500, message: 'High latency' }
          },
          performance: {
            cpuUsage: 32.5,
            memoryUsage: 67.8,
            diskUsage: 45.2,
            activeConnections: 125
          },
          alerts: [{
            level: 'WARNING',
            component: 'SMS Service',
            message: 'Response time exceeding threshold',
            since: '2025-10-22T14:30:00Z'
          }]
        }
      }
    }
  }
];

// Step 13: User Profile Management Endpoints
export const userProfileEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/managemyhotel/api/profile',
    description: 'Get user profile',
    category: 'User Profile Management',
    request: {},
    response: {
      success: {
        profile: {
          id: 1,
          username: 'sarah.johnson',
          email: 'sarah.johnson@hotel.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '+1-555-0123',
          role: 'FRONT_DESK_MANAGER',
          department: 'FRONT_DESK',
          permissions: ['CHECK_IN', 'CHECK_OUT', 'MODIFY_BOOKING'],
          preferences: {
            language: 'en',
            timezone: 'America/New_York',
            notifications: {
              email: true,
              sms: false,
              push: true
            },
            dashboardLayout: 'compact'
          },
          lastLogin: '2025-10-22T08:30:00Z',
          accountCreated: '2024-03-15T09:00:00Z'
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/managemyhotel/api/profile',
    description: 'Update user profile',
    category: 'User Profile Management',
    request: {
      body: {
        firstName: 'string (optional)',
        lastName: 'string (optional)',
        phone: 'string (optional)',
        preferences: {
          language: 'string (optional)',
          timezone: 'string (optional)',
          notifications: {
            email: 'boolean (optional)',
            sms: 'boolean (optional)',
            push: 'boolean (optional)'
          },
          dashboardLayout: 'string (optional)'
        }
      }
    },
    response: {
      success: {
        profile: {
          id: 1,
          firstName: 'Sarah',
          lastName: 'Johnson-Smith',
          phone: '+1-555-0124',
          preferences: {
            language: 'en',
            timezone: 'America/New_York',
            notifications: {
              email: true,
              sms: true,
              push: true
            }
          },
          updatedAt: '2025-10-22T16:30:00Z'
        }
      }
    }
  }
];

// Step 14: Cache & Performance Endpoints
export const cacheEndpoints: APIEndpoint[] = [
  {
    method: 'DELETE',
    path: '/managemyhotel/api/cache/clear',
    description: 'Clear cache',
    category: 'Cache & Performance',
    request: {
      body: {
        cacheType: 'ALL | ROOM_AVAILABILITY | PRICING | USER_SESSIONS | SEARCH_RESULTS (optional)',
        force: 'boolean (default: false)'
      }
    },
    response: {
      success: {
        message: 'Cache cleared successfully',
        clearedCaches: ['ROOM_AVAILABILITY', 'PRICING', 'SEARCH_RESULTS'],
        statistics: {
          itemsCleared: 1523,
          memoryFreed: '45.6 MB',
          cacheHitRateBefore: 78.5,
          estimatedRebuildTime: '2-3 minutes'
        },
        clearedAt: '2025-10-22T17:00:00Z'
      }
    }
  }
];

// Helper functions for endpoint management
export const getAllEndpoints = (): APIEndpoint[] => {
  return [
    ...authenticationEndpoints,
    ...systemAdminEndpoints,
    ...publicEndpoints,
    ...bookingEndpoints,
    ...frontDeskEndpoints,
    ...hotelAdminEndpoints,
    ...taskNotificationEndpoints,
    ...pricingEndpoints,
    ...shoppingEndpoints,
    ...staffEndpoints,
    ...advertisementEndpoints,
    ...monitoringEndpoints,
    ...userProfileEndpoints,
    ...cacheEndpoints
  ];
};

export const getEndpointsByCategory = (category: string): APIEndpoint[] => {
  const allEndpoints = getAllEndpoints();
  return allEndpoints.filter(endpoint => endpoint.category === category);
};

export const getTotalEndpointCount = (): number => {
  return getAllEndpoints().length;
};

export const getEndpointCategoryCounts = () => {
  return {
    authentication: authenticationEndpoints.length,
    systemAdmin: systemAdminEndpoints.length,
    public: publicEndpoints.length,
    booking: bookingEndpoints.length,
    frontDesk: frontDeskEndpoints.length,
    hotelAdmin: hotelAdminEndpoints.length,
    taskNotification: taskNotificationEndpoints.length,
    pricing: pricingEndpoints.length,
    shopping: shoppingEndpoints.length,
    staff: staffEndpoints.length,
    advertisement: advertisementEndpoints.length,
    monitoring: monitoringEndpoints.length,
    userProfile: userProfileEndpoints.length,
    cache: cacheEndpoints.length,
    total: getTotalEndpointCount()
  };
};

// Category definitions for UI
export const endpointCategories = [
  { key: 'authentication', label: 'Authentication & Session', count: () => authenticationEndpoints.length },
  { key: 'systemAdmin', label: 'System Administration', count: () => systemAdminEndpoints.length },
  { key: 'public', label: 'Public Access & Hotel Search', count: () => publicEndpoints.length },
  { key: 'booking', label: 'Booking Management', count: () => bookingEndpoints.length },
  { key: 'frontDesk', label: 'Front Desk Operations', count: () => frontDeskEndpoints.length },
  { key: 'hotelAdmin', label: 'Hotel Administration', count: () => hotelAdminEndpoints.length },
  { key: 'taskNotification', label: 'Tasks & Notifications', count: () => taskNotificationEndpoints.length },
  { key: 'pricing', label: 'Pricing & Room Charges', count: () => pricingEndpoints.length },
  { key: 'shopping', label: 'Shopping & Inventory', count: () => shoppingEndpoints.length },
  { key: 'staff', label: 'Staff Management', count: () => staffEndpoints.length },
  { key: 'advertisement', label: 'Advertisement Management', count: () => advertisementEndpoints.length },
  { key: 'monitoring', label: 'Monitoring & Analytics', count: () => monitoringEndpoints.length },
  { key: 'userProfile', label: 'User Profile Management', count: () => userProfileEndpoints.length },
  { key: 'cache', label: 'Cache & Performance', count: () => cacheEndpoints.length }
];
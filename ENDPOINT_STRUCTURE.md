# BookMyHotel - Frontend Endpoint Structure

## Overview
This document outlines the differentiated endpoint grouping between `/admin` and `/hotel-admin` routes, implemented to separate platform administration from hotel-specific operations.

## Endpoint Structure

### `/admin` - Platform Administration (ADMIN role)
**Purpose**: System-wide administration for platform operators

#### User Management
- `GET /admin` - Admin dashboard (redirects to /admin/dashboard)
- `GET /admin/dashboard` - Admin dashboard with user and hotel management
- `GET /admin/users` - User management interface
- `GET /admin/users/:id` - View user details
- `GET /admin/users/:id/edit` - Edit user details
- `GET /admin/add-user` - User registration form

#### Hotel Management  
- `GET /admin/hotels` - Hotel management interface
- `GET /admin/hotels/:id` - View hotel details
- `GET /admin/hotels/:id/edit` - Edit hotel details
- `GET /admin/hotel-registrations` - Hotel registration requests
- `GET /admin/register-hotel` - Hotel registration form

**Access Control**: Requires `ADMIN` role (system administrators)

**Features**:
- ✅ Platform-wide user management
- ✅ Hotel registration and management
- ✅ System administration functions
- ❌ **No booking access** (removed for security/scope separation)

---

### `/hotel-admin` - Hotel Operations (HOTEL_ADMIN/FRONTDESK roles)
**Purpose**: Hotel-specific administration for hotel staff

#### Dashboard & Operations
- `GET /hotel-admin` - Redirects to dashboard
- `GET /hotel-admin/dashboard` - Hotel admin dashboard with booking management

#### Booking Management
- `GET /hotel-admin/bookings/:id` - View booking details
- `GET /hotel-admin/bookings/:id/edit` - Edit booking details

#### Future Hotel Operations (Coming Soon)
- `GET /hotel-admin/hotel` - Hotel profile management
- `GET /hotel-admin/staff` - Staff management
- `GET /hotel-admin/rooms` - Room management

**Access Control**: 
- Requires `HOTEL_ADMIN` role (hotel administrators)  
- Booking operations also accessible to `FRONTDESK` role (front desk staff)

**Features**:
- ✅ Hotel-specific booking management
- ✅ Booking view and edit functionality
- ✅ Hotel operational dashboard
- 🚧 Staff, room, and hotel profile management (planned)

---

## Role-Based Access Control

### Role Hierarchy
```
ADMIN (5) - Platform administrators
├─ HOTEL_ADMIN (4) - Hotel administrators  
├─ HOTEL_MANAGER (3) - Hotel managers
├─ FRONTDESK (2) - Front desk staff
├─ HOUSEKEEPING (2) - Housekeeping staff
└─ GUEST (1) - Hotel guests
```

### Access Matrix
| Route Pattern | ADMIN | HOTEL_ADMIN | FRONTDESK | Notes |
|---------------|-------|-------------|-----------|-------|
| `/admin/**` | ✅ | ❌ | ❌ | Platform admin only |
| `/hotel-admin/dashboard` | ❌ | ✅ | ❌ | Hotel admin only |
| `/hotel-admin/bookings/**` | ❌ | ✅ | ✅ | Hotel staff only |
| `/hotel-admin/hotel` | ❌ | ✅ | ❌ | Hotel admin only |
| `/hotel-admin/staff` | ❌ | ✅ | ❌ | Hotel admin only |

---

## Navigation Flow

### Platform Admin Flow
```
Login (ADMIN) → /admin/dashboard → 
├─ Hotel Management → /admin/hotels/**
├─ User Management → /admin/users/**
└─ Hotel Registration → /admin/hotel-registrations
```

### Hotel Admin Flow  
```
Login (HOTEL_ADMIN) → /hotel-admin/dashboard →
├─ Booking Management → /hotel-admin/bookings/**
├─ Hotel Management → /hotel-admin/hotel (coming soon)
└─ Staff Management → /hotel-admin/staff (coming soon)
```

### Front Desk Flow
```
Login (FRONTDESK) → /hotel-admin/dashboard →
└─ Booking Management → /hotel-admin/bookings/**
```

---

## Security Implementation

### Route Protection
All routes are protected using the `ProtectedRoute` component with role-based access control:

```tsx
<Route path="/admin/users" element={
  <ProtectedRoute requiredRole="ADMIN">
    <UserManagementAdmin />
  </ProtectedRoute>
} />

<Route path="/hotel-admin/bookings/:id" element={
  <ProtectedRoute requiredRole="FRONTDESK">
    <BookingViewEdit />
  </ProtectedRoute>
} />
```

### Role Validation
- Higher roles inherit access to lower role functionality via role hierarchy
- JWT token validation on all protected routes
- Role verification on both frontend and backend

---

## API Integration

### Frontend API Services
- `adminApi.ts` - Platform administration endpoints
- `hotelAdminApi.ts` - Hotel-specific operations
- `userApi.ts` - User-related operations  
- `hotelApi.ts` - Hotel search and booking for guests

### Backend Endpoint Mapping
Frontend routes correspond to backend API endpoints:
- `/admin/**` → `/api/admin/**` (platform operations)
- `/hotel-admin/**` → `/api/hotel-admin/**` (hotel operations)

---

## Sample Data Structure

### Booking Data Compatibility
Both HotelAdminDashboard and BookingViewEdit use compatible sample data structures:

```typescript
// HotelAdminDashboard (BookingResponse)
{
  reservationId: 1,
  confirmationNumber: 'BK001234',
  guestName: 'John Doe',
  // ... other fields
}

// BookingViewEdit (BookingData)  
{
  id: 1,
  reservationId: 1, // Matches for navigation
  confirmationNumber: 'BK001234',
  guestName: 'John Doe',
  // ... compatible fields
}
```

This ensures seamless navigation between booking list and detail views.

---

## Migration Notes

### Changes Made
1. **Moved booking routes** from `/admin/bookings/**` to `/hotel-admin/bookings/**`
2. **Updated navigation** in HotelAdminDashboard to use new routes
3. **Updated back button** in BookingViewEdit to return to hotel admin dashboard
4. **Separated access control** - admins can no longer access bookings
5. **Maintained functionality** - all booking features work as before, just under new routes

### Benefits
- ✅ **Clear separation of concerns** between platform and hotel operations
- ✅ **Improved security** by restricting booking access to hotel staff only  
- ✅ **Scalable architecture** for adding more hotel-specific features
- ✅ **Logical URL structure** that reflects user roles and permissions
- ✅ **Consistent navigation flow** within each administrative section

---

## Future Enhancements

### Planned Features
1. **Hotel Profile Management** (`/hotel-admin/hotel`)
2. **Staff Management** (`/hotel-admin/staff`)  
3. **Room Management** (`/hotel-admin/rooms`)
4. **Advanced Booking Operations** (bulk updates, reports)
5. **Real-time Notifications** for booking status changes

### API Enhancements
1. **Role-specific API endpoints** with proper authorization
2. **Real-time data synchronization** for booking updates
3. **Audit logging** for all administrative actions
4. **Performance optimization** for large hotel chains

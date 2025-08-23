# 🏨 Hotel Controller Architecture

## Overview
This document clarifies the distinction between hotel-related controllers to avoid confusion.

## Controller Responsibilities

### 🔒 **HotelManagementController** (`/api/hotels-mgmt`)
**Purpose**: Internal hotel management operations for authenticated staff

**Authentication**: ✅ Required (`HOTEL_ADMIN`, `FRONT_DESK`)
**Tenant Scope**: 🏢 Single tenant (current user's tenant only)
**Audience**: Hotel administrators, front desk staff

**Endpoints**:
- `GET /api/hotels-mgmt/list` - Get hotels for dropdown/selection in management interfaces

**Use Cases**:
- Staff scheduling interfaces
- Management dashboards
- Admin dropdowns
- Internal operations

---

### 🌐 **HotelSearchController** (`/api/hotels`)
**Purpose**: Public hotel search and booking discovery

**Authentication**: ❌ No authentication required (public)
**Tenant Scope**: 🌍 Cross-tenant (shows hotels from ALL tenants)
**Audience**: Anonymous guests, booking system users

**Endpoints**:
- `POST /api/hotels/search` - Search hotels with criteria
- `GET /api/hotels/{hotelId}` - Get hotel details
- `GET /api/hotels/{hotelId}/rooms` - Get available rooms

**Use Cases**:
- Guest hotel search
- Booking system
- Public hotel discovery
- Room availability checking

## Key Differences

| Aspect | HotelManagementController | HotelSearchController |
|--------|---------------------------|----------------------|
| **URL Base** | `/api/hotels-mgmt` | `/api/hotels` |
| **Authentication** | Required | Not required |
| **Data Scope** | Single tenant | All tenants |
| **Purpose** | Management operations | Public search/booking |
| **Response Detail** | Minimal (id, name) | Rich (full details) |
| **Security** | Role-based access | Public access |

## Authentication Context

### Management Controller
- Requires valid JWT token
- User must have `HOTEL_ADMIN` or `FRONT_DESK` role
- Tenant context automatically set from authenticated user
- Returns only hotels from user's tenant

### Search Controller  
- No authentication required
- Cross-tenant hotel discovery
- Supports anonymous guest searches
- Full hotel details with room availability

## Usage Examples

### Management Interface (Authenticated)
```typescript
// For staff scheduling dropdown
const hotels = await api.get('/api/hotels-mgmt/list');
// Returns: [{ id: 1, name: "Grand Plaza Hotel" }]
```

### Public Search (Anonymous)
```typescript
// For guest hotel search
const searchResults = await api.post('/api/hotels/search', {
  location: 'New York',
  checkInDate: '2025-08-25',
  checkOutDate: '2025-08-27',
  guests: 2
});
// Returns: Full hotel details with rooms, pricing, amenities
```

## Migration Notes

- **Old Name**: `HotelController` → **New Name**: `HotelManagementController`
- **Reason**: Clearer separation of concerns and naming consistency
- **Impact**: Better code organization and reduced confusion
- **Backwards Compatibility**: URL endpoints remain unchanged

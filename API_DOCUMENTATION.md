# BookMyHotel API Documentation

## Overview
BookMyHotel is a comprehensive multi-tenant hotel booking and management system built with Spring Boot (Java) backend and React (TypeScript) frontend.

**Version:** 1.0.0  
**Base URL:** `http://localhost:8080/api`  
**Authentication:** JWT Bearer Token  
**Last Updated:** December 27, 2024

---

## 🏗️ Architecture

### **Multi-Tenant Design**
- **Shared Database:** Single MySQL database with tenant isolation
- **Tenant Filtering:** Automatic row-level security via Hibernate filters
- **Role-Based Access:** System-wide admins (tenant_id = NULL) vs tenant-bound users

### **Security Features**
- **JWT Authentication:** Token-based authentication with role-based authorization
- **Password Encryption:** BCrypt hashing for all user passwords
- **Tenant Isolation:** Automatic data segregation by tenant_id
- **Cross-Tenant Protection:** System admins can access all tenants, others restricted

---

## 🔐 Authentication Endpoints

### **POST** `/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@bookmyhotel.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "admin@bookmyhotel.com",
  "firstName": "Samuel",
  "lastName": "Weldegebriel",
  "roles": ["ADMIN"],
  "hotelId": null,
  "hotelName": null
}
```

### **POST** `/auth/register`
Register new customer account.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0123"
}
```

---

## 🏨 Hotel Management Endpoints

### **GET** `/admin/hotels`
Get all hotels (System Admin only).

**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Grand Plaza Hotel",
      "description": "Luxury 5-star hotel",
      "address": "123 Main Street",
      "city": "New York",
      "country": "USA",
      "phone": "+1-555-123-4567",
      "email": "info@grandplaza.com",
      "tenantId": "default",
      "isActive": true
    }
  ],
  "totalElements": 15,
  "totalPages": 2,
  "size": 10,
  "number": 0
}
```

### **GET** `/hotels`
Get available hotels for booking (Public).

### **GET** `/hotels/{id}`
Get specific hotel details.

### **POST** `/admin/hotels`
Create new hotel (System Admin only).

---

## 👥 User Management Endpoints

### **GET** `/admin/users`
Get all users across all tenants (System Admin only).

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 10)
- `sort` (default: "email")

### **GET** `/admin/users/tenant/{tenantId}`
Get users by specific tenant.

### **GET** `/hotel-admin/staff`
Get hotel staff (Hotel Admin only).

### **POST** `/admin/users`
Create new user (System Admin only).

---

## 🛏️ Room Management Endpoints

### **GET** `/hotels/{hotelId}/rooms`
Get available rooms for a hotel.

**Query Parameters:**
- `checkIn` (ISO date)
- `checkOut` (ISO date)
- `guests` (number)

### **GET** `/admin/rooms`
Get all rooms (Admin only).

### **POST** `/admin/hotels/{hotelId}/rooms`
Create new room.

---

## 📅 Reservation Endpoints

### **POST** `/reservations`
Create new reservation.

**Request Body:**
```json
{
  "hotelId": 1,
  "roomId": 1,
  "checkInDate": "2024-12-28",
  "checkOutDate": "2024-12-30",
  "guestFirstName": "John",
  "guestLastName": "Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1-555-0123",
  "numberOfGuests": 2,
  "specialRequests": "Late check-in",
  "totalAmount": 299.99
}
```

### **GET** `/reservations/my-bookings`
Get user's reservations (Authenticated users).

### **GET** `/admin/reservations`
Get all reservations (Admin only).

### **PUT** `/reservations/{id}/status`
Update reservation status.

---

## 🏢 Hotel Admin Endpoints

### **GET** `/hotel-admin/dashboard`
Get hotel dashboard data (Hotel Admin only).

**Response:**
```json
{
  "totalRooms": 50,
  "occupiedRooms": 35,
  "availableRooms": 15,
  "todayCheckIns": 8,
  "todayCheckOuts": 5,
  "revenue": {
    "today": 2500.00,
    "thisMonth": 75000.00
  },
  "recentReservations": [...],
  "roomStatus": [...]
}
```

### **GET** `/hotel-admin/reservations`
Get hotel's reservations.

### **GET** `/hotel-admin/rooms`
Get hotel's rooms.

---

## 📋 Operations Endpoints

### **GET** `/operations/dashboard`
Get operations dashboard (Operations staff only).

### **GET** `/operations/tasks`
Get assigned tasks.

### **POST** `/operations/tasks`
Create new task.

### **PUT** `/operations/tasks/{id}/status`
Update task status.

---

## ⭐ Review System Endpoints

### **POST** `/reviews`
Submit hotel review.

**Request Body:**
```json
{
  "hotelId": 1,
  "reservationId": 123,
  "rating": 5,
  "comment": "Excellent service and facilities!",
  "reviewerName": "John Doe"
}
```

### **GET** `/hotels/{hotelId}/reviews`
Get hotel reviews.

---

## 🔧 System Admin Endpoints

### **GET** `/admin/dashboard`
Get system-wide dashboard data.

### **GET** `/admin/hotel-registrations`
Get hotel registration requests.

### **POST** `/admin/hotel-registrations/{id}/approve`
Approve hotel registration.

### **GET** `/admin/system-stats`
Get system statistics.

---

## 🏷️ User Roles

| Role | Access Level | Description |
|------|--------------|-------------|
| `ADMIN` | System-wide | Full access to all tenants and hotels |
| `HOTEL_ADMIN` | Hotel-specific | Manage specific hotel operations |
| `FRONTDESK` | Hotel-specific | Front desk operations and check-ins |
| `HOUSEKEEPING` | Hotel-specific | Room cleaning and maintenance tasks |
| `MAINTENANCE` | Hotel-specific | Equipment and facility maintenance |
| `OPERATIONS_SUPERVISOR` | Hotel-specific | Oversee operations staff |
| `CONCIERGE` | Hotel-specific | Guest services and assistance |
| `CUSTOMER` | Public | Book hotels and manage reservations |
| `GUEST` | Temporary | Anonymous booking with token access |

---

## 🏨 Sample Hotels & Credentials

### **System Administrators**
| Email | Password | Access |
|-------|----------|--------|
| `admin@bookmyhotel.com` | `password` | All tenants |
| `admin2@bookmyhotel.com` | `password123` | All tenants |

### **Ethiopian Heritage Hotels**
| Hotel | Admin Email | Password |
|-------|-------------|----------|
| Sheraton Addis Ababa | `hotel.admin@sheraton-addis.et` | `password123` |
| Lalibela Cultural Lodge | `hotel.admin@lalibela-lodge.et` | `password123` |

### **US Hotels**
| Hotel | Admin Email | Password |
|-------|-------------|----------|
| Grand Plaza Hotel | `hotel.admin@grandplaza.com` | `password` |
| Grand Test Hotel | `hoteladmin@grandtesthotel.com` | `password` |

---

## 🚀 Getting Started

### **1. Authentication**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookmyhotel.com","password":"password"}'
```

### **2. Use JWT Token**
```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
  http://localhost:8080/api/admin/hotels
```

### **3. Book a Room**
```bash
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "hotelId": 1,
    "roomId": 1,
    "checkInDate": "2024-12-28",
    "checkOutDate": "2024-12-30",
    "guestFirstName": "John",
    "guestLastName": "Doe",
    "guestEmail": "john@example.com",
    "numberOfGuests": 2,
    "totalAmount": 299.99
  }'
```

---

## 📊 Database Schema

### **Key Tables**
- `users` - All user accounts with tenant isolation
- `user_roles` - Role assignments (ADMIN, HOTEL_ADMIN, etc.)
- `hotels` - Hotel information by tenant
- `rooms` - Room inventory per hotel
- `reservations` - Booking records
- `reviews` - Customer feedback
- `tasks` - Operations task management

### **Multi-Tenancy**
- **tenant_id**: String identifier for tenant isolation
- **System Users**: tenant_id = NULL (cross-tenant access)
- **Hotel Users**: tenant_id = specific tenant (restricted access)

---

## 🛡️ Security Notes

### **Authentication Required**
- All `/admin/*` endpoints require ADMIN role
- All `/hotel-admin/*` endpoints require HOTEL_ADMIN role
- JWT tokens expire after 24 hours

### **Tenant Isolation**
- Users can only access data from their assigned tenant
- System admins (tenant_id = NULL) bypass tenant filters
- Automatic tenant_id assignment for all data operations

### **Rate Limiting**
- Not currently implemented (recommended for production)

### **CORS**
- Configured for `http://localhost:3000` (frontend)
- Update for production domains

---

## 🏆 Production Deployment Checklist

- [ ] Update CORS origins for production domains
- [ ] Configure production database connection
- [ ] Set secure JWT secret key
- [ ] Enable HTTPS/SSL certificates
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure backup strategies
- [ ] Update email service credentials
- [ ] Set production environment variables

---

**For complete setup instructions, see README.md**

# BookMyHotel — Functional Documentation

## Product Overview

BookMyHotel is a multi-tenant hotel booking and management platform. It serves hotel chains, independent hotels, and their guests through a single unified application. Each hotel operates within an isolated tenant, managing their own rooms, staff, bookings, shop, and operations — all while sharing the same infrastructure.

The platform supports three languages: English, Amharic, and Afan Oromo.

---

## User Roles & Access

### System Administrator
- Manages the entire platform across all tenants
- Approves or rejects hotel registration requests
- Creates and manages tenants (hotel groups)
- Creates system-wide and tenant-specific users
- Views platform-wide analytics and metrics
- Monitors system health and performance

### Hotel Administrator
- Manages a single hotel within a tenant
- Configures rooms, room types, and pricing
- Manages hotel staff and their roles
- Oversees all bookings for their hotel
- Configures shop products, tax rates, and pricing strategies
- Views hotel-level revenue reports and analytics
- Uploads hotel and room images (stored in AWS S3)

### Front Desk Staff
- Handles day-to-day guest interactions
- Creates walk-in bookings
- Performs guest check-in and check-out
- Assigns rooms to bookings
- Adds room charges (minibar, laundry, room service, etc.)
- Generates and prints checkout receipts (PDF)
- Modifies or cancels existing bookings
- Views real-time room availability

### Operations Supervisor
- Manages housekeeping task assignments
- Tracks maintenance requests and their progress
- Creates and manages staff schedules and shifts
- Monitors operational metrics and efficiency

### Housekeeping / Maintenance Staff
- Views assigned housekeeping or maintenance tasks
- Updates task status (in progress, completed)
- Reports new maintenance issues
- Follows daily schedules

### Guest (Public User)
- Searches for hotels by location, dates, and preferences
- Views hotel details, room types, images, and pricing
- Creates online bookings with payment
- Manages own bookings (view, modify, cancel)
- Receives booking confirmation via email
- Registers a new account or books as a guest

---

## Core Functional Modules

### 1. Hotel Registration & Onboarding

**Flow:**
1. A hotel owner submits a registration request via the public registration page.
2. The system admin reviews the request and can approve or reject it.
3. On approval, a tenant and hotel are created, and the hotel admin user is set up.
4. The hotel admin can then log in and configure their hotel.

**Data captured:** Hotel name, address, city, country, number of rooms, contact information, business registration details.

---

### 2. Hotel Search & Discovery

**Features:**
- Search by city, hotel name, or date range
- Filter by room type, price range, amenities
- View hotel details with image galleries
- See room type availability and pricing
- Responsive design for mobile and desktop

**Search behavior:**
- Guest selects check-in and check-out dates
- System shows hotels with available rooms for those dates
- Pricing displayed per night in Ethiopian Birr (ETB)

---

### 3. Booking Lifecycle

#### Online Booking (Guest)
1. Guest selects hotel → room type → dates → number of guests
2. Guest provides personal information (name, email, phone)
3. Guest makes payment (Stripe or Ethiopian mobile payment)
4. System creates reservation with status `CONFIRMED`
5. Booking confirmation sent via email
6. Guest can view/manage booking using booking reference

#### Walk-In Booking (Front Desk)
1. Front desk creates a booking directly
2. Room assignment can be done immediately
3. Payment collected at check-in or check-out
4. No advance online payment required

#### Booking States
```
PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT
                   ↘ CANCELLED
                   ↘ NO_SHOW
```

#### Check-In Process
1. Front desk searches for the booking (by reference, guest name, or email)
2. Assigns a specific room number
3. Marks the booking as checked in
4. Room status updates to `OCCUPIED`

#### Check-Out Process
1. Front desk reviews room charges (minibar, laundry, room service, damages)
2. System calculates total cost (room charges + incidentals + tax)
3. Generates consolidated receipt (PDF)
4. Marks booking as checked out
5. Room status updates to `DIRTY` (triggers housekeeping)

#### Automated Checkout
- System can automatically check out guests who haven't checked out by a configured time
- Prevents stale occupied rooms

---

### 4. Room Management

**Room Properties:**
- Room number, floor, room type
- Status: AVAILABLE, OCCUPIED, DIRTY, MAINTENANCE, OUT_OF_ORDER
- Base price per night
- Amenities and description

**Room Types:**
- Standard, Deluxe, Suite, Presidential, etc.
- Each type has its own pricing and images
- Configurable per hotel

**Features:**
- Individual room CRUD
- Bulk room upload via CSV
- Room image management (S3)
- Real-time availability tracking
- Automated status transitions (checkout → dirty → clean → available)

---

### 5. Pricing & Revenue

**Pricing Configuration:**
- Base price per room type
- Seasonal rate adjustments
- Dynamic pricing strategies
- Tax configuration per hotel (VAT, service charge, tourism levy)
- Discount codes and promotional pricing

**Revenue Reports:**
- Daily/weekly/monthly revenue breakdown
- Occupancy rate tracking
- Revenue per available room (RevPAR)
- Average daily rate (ADR)
- Revenue by room type

---

### 6. Room Charges & Receipts

**Charge Types:**
- Minibar
- Laundry
- Room service
- Telephone
- Damage
- Other/custom charges

**Receipt Generation:**
- Consolidated checkout receipt with all charges
- PDF format for printing
- Includes room charges, tax breakdown, total
- Payment reference and booking details

---

### 7. Payment Processing

**Stripe (International):**
- Credit/debit card payments
- Secure payment intent flow
- Automatic payment confirmation

**Ethiopian Mobile Payments:**
- Telebirr integration
- M-Birr integration
- Phone number validation (Ethiopian format: +251...)
- Payment reference tracking

**Payment Statuses:**
- PENDING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED

---

### 8. Hotel Shop

**Product Management:**
- Product inventory with categories
- Stock level tracking with minimum thresholds
- Product availability toggle
- Price management

**Order Processing:**
1. Staff creates an order selecting products and quantities
2. System calculates subtotal, tax, and total
3. Order linked to a room/booking for room charge billing
4. Inventory automatically decremented

**Shop Dashboard:**
- Sales analytics
- Top-selling products
- Revenue tracking
- Low stock alerts

---

### 9. Housekeeping Management

**Task Workflow:**
1. Operations supervisor creates housekeeping tasks (or auto-generated after checkout)
2. Tasks assigned to housekeeping staff
3. Staff updates task status: PENDING → IN_PROGRESS → COMPLETED
4. On completion, room status updates to CLEAN → AVAILABLE

**Task Types:**
- Room cleaning (after checkout)
- Turndown service
- Deep cleaning
- Inspection

**Priority Levels:** LOW, MEDIUM, HIGH, URGENT

---

### 10. Maintenance Management

**Request Workflow:**
1. Any staff member can report a maintenance issue
2. Operations supervisor reviews and assigns to maintenance staff
3. Maintenance staff updates progress
4. Room can be marked OUT_OF_ORDER during maintenance

**Categories:** Plumbing, Electrical, HVAC, Furniture, General, Other

---

### 11. Staff Management & Scheduling

**Staff Features:**
- Add/remove staff members per hotel
- Assign roles (front desk, housekeeping, maintenance)
- Enable/disable staff accounts

**Scheduling:**
- Create shift schedules (morning, afternoon, night)
- Weekly schedule view
- Staff availability tracking
- Schedule conflict detection

---

### 12. Notifications

**In-App Notifications:**
- New booking alerts
- Check-in/check-out reminders
- Housekeeping task assignments
- Maintenance request updates
- Low inventory alerts

**Email Notifications:**
- Booking confirmation to guests
- Booking modification/cancellation notices
- Registration approval notifications

---

### 13. Multi-Tenancy

**Isolation Model:**
- Shared database with tenant-scoped data
- Each tenant has one or more hotels
- Users are bound to a specific tenant (except system admins)
- All data queries automatically filtered by tenant context
- No cross-tenant data leakage

**Tenant Hierarchy:**
```
Platform
  └── Tenant (e.g., "Grand Plaza Hotels")
       ├── Hotel A (Grand Plaza Downtown)
       │    ├── Rooms, Bookings, Staff, Shop
       │    └── Operations (housekeeping, maintenance)
       └── Hotel B (Grand Plaza Airport)
            ├── Rooms, Bookings, Staff, Shop
            └── Operations
```

---

### 14. System Administration

**Dashboard Metrics:**
- Total hotels, rooms, users across the platform
- Active bookings count
- Revenue overview
- System health indicators

**Management Functions:**
- Create/edit/deactivate tenants
- Create/edit/deactivate users with role assignment
- Approve/reject hotel registration requests
- View audit logs

---

## Infrastructure & Deployment

### Current Production Environment
- **Frontend:** Static React app served by Nginx on AWS Lightsail (`44.204.49.94`)
- **Backend:** Spring Boot app running on the same Lightsail instance (port 8080)
- **Database:** MySQL 8 on the Lightsail instance
- **File Storage:** AWS S3 for images
- **SSL:** Configured via Nginx

### Local Development
- MySQL via Docker Compose (`infra/docker-compose.yml`)
- Backend: `mvn spring-boot:run` (port 8080)
- Frontend: `npm start` (port 3000, proxied to backend)

### Monitoring
- Spring Boot Actuator endpoints
- Prometheus metrics via Micrometer
- Application-level performance monitoring
- Process monitoring for scheduled tasks

---

## Business Rules Summary

| Rule | Description |
|---|---|
| Booking overlap prevention | A room cannot be double-booked for overlapping dates |
| Auto-checkout | Guests automatically checked out after configured deadline |
| Room status flow | AVAILABLE → OCCUPIED → DIRTY → CLEAN → AVAILABLE |
| Tenant isolation | All data operations scoped to the authenticated user's tenant |
| Role-based access | Each API endpoint restricted by user role |
| Tax calculation | Configurable per hotel (VAT, service charge, tourism levy) |
| Stock management | Product inventory decremented on shop orders |
| Session management | JWT tokens with configurable expiration; silent logout on expiry |
| Password security | Minimum length, complexity requirements |
| Phone validation | Ethiopian phone number format validation (+251) |
| Currency | All monetary values in Ethiopian Birr (ETB) |
| Languages | UI available in English, Amharic, and Afan Oromo |

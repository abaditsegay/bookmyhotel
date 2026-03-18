# BookMyHotel — Backend Documentation

## Overview

The backend is a Spring Boot 3.4 application written in Java 21. It provides a RESTful API for a multi-tenant hotel booking platform. Data is stored in MySQL 8, with Flyway managing schema migrations. Authentication uses JWT tokens with Spring Security. The application integrates with AWS S3 for image storage, Stripe for payments, and supports Ethiopian mobile payment methods.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Language runtime |
| Spring Boot | 3.4.0 | Application framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA / Hibernate | — | ORM and data access |
| MySQL | 8 | Relational database |
| Flyway | — | Database schema migrations |
| JWT (jjwt) | 0.12.6 | Token-based authentication |
| Lombok | — | Boilerplate reduction |
| AWS SDK (S3) | 2.27.21 | Image and file storage |
| Stripe | 26.7.0 | Payment processing |
| iText | 8.0.2 | PDF receipt generation |
| Micrometer / Prometheus | — | Metrics and monitoring |
| SpringDoc OpenAPI | 2.6.0 | API documentation (Swagger UI) |
| Testcontainers | 1.20.1 | Integration testing |

---

## Project Structure

```
backend/
├── pom.xml                         # Maven build configuration
├── src/main/java/com/bookmyhotel/
│   ├── BookMyHotelApplication.java # Application entry point
│   ├── config/                     # Configuration classes
│   │   ├── SecurityConfig.java     # Spring Security, JWT filter chain
│   │   ├── JwtAuthenticationFilter.java  # JWT request filter
│   │   ├── CorsController.java     # CORS configuration
│   │   ├── WebConfig.java          # Web MVC settings
│   │   ├── WebMvcConfig.java       # Additional MVC configuration
│   │   ├── CacheConfig.java        # Spring Cache (Caffeine)
│   │   ├── AsyncConfig.java        # Async task executor
│   │   ├── AwsS3Config.java        # AWS S3 client setup
│   │   ├── OpenApiConfig.java      # Swagger/OpenAPI configuration
│   │   ├── DataInitializer.java    # Seed data on startup
│   │   ├── EmailConfiguration.java # SMTP email settings
│   │   ├── MicrosoftGraphConfig.java  # Microsoft Graph API (OAuth2 email)
│   │   ├── EthiopianPaymentProperties.java  # Payment gateway config
│   │   ├── TelebirrProperties.java          # Telebirr settings
│   │   ├── MbirrProperties.java             # M-Birr settings
│   │   └── TenantFilterInterceptor.java     # Tenant filter setup
│   ├── controller/                 # REST API controllers
│   │   ├── AuthController.java     # Login, register, token refresh
│   │   ├── BookingController.java  # Booking CRUD
│   │   ├── BookingManagementController.java  # Advanced booking operations
│   │   ├── HotelController.java    # Hotel information
│   │   ├── HotelSearchController.java  # Hotel search and filtering
│   │   ├── RoomController.java     # Room management
│   │   ├── RoomBulkUploadController.java  # CSV bulk room upload
│   │   ├── RoomChargeController.java      # Room charge tracking
│   │   ├── FrontDeskController.java       # Front desk operations
│   │   ├── HotelAdminController.java      # Hotel admin operations
│   │   ├── HotelManagementController.java # Hotel lifecycle management
│   │   ├── HotelRegistrationController.java  # Hotel registration workflow
│   │   ├── HotelImageController.java      # Image upload/management
│   │   ├── UserController.java            # User profile operations
│   │   ├── SystemController.java          # System admin dashboard
│   │   ├── SystemUserController.java      # System-wide user management
│   │   ├── TenantController.java          # Tenant management
│   │   ├── StaffController.java           # Staff management
│   │   ├── StaffScheduleController.java   # Staff scheduling
│   │   ├── HousekeepingController.java    # Housekeeping tasks
│   │   ├── MaintenanceController.java     # Maintenance requests
│   │   ├── OperationsSupervisorController.java  # Operations dashboard
│   │   ├── ProductController.java         # Shop product CRUD
│   │   ├── ShopOrderController.java       # Shop order processing
│   │   ├── ShopDashboardController.java   # Shop analytics
│   │   ├── InventoryController.java       # Inventory management
│   │   ├── TaxConfigurationController.java  # Tax settings
│   │   ├── RevenueController.java         # Revenue reports
│   │   ├── EnhancedPricingController.java # Dynamic pricing
│   │   ├── HotelPricingConfigController.java  # Pricing configuration
│   │   ├── EthiopianPaymentController.java    # Mobile payment endpoints
│   │   ├── CheckoutReceiptController.java     # PDF receipt generation
│   │   ├── AutoCheckoutController.java        # Automated checkout
│   │   ├── NotificationController.java        # In-app notifications
│   │   ├── AdController.java                  # Advertisement banners
│   │   ├── TodoController.java                # Todo/task management
│   │   ├── SessionManagementController.java   # Active session tracking
│   │   ├── PerformanceMonitoringController.java  # Performance metrics
│   │   ├── ProcessMonitoringController.java      # Process monitoring
│   │   └── admin/                 # Admin-specific controllers
│   ├── dto/                       # Data Transfer Objects
│   │   ├── auth/                  # Authentication DTOs
│   │   ├── admin/                 # Admin DTOs
│   │   ├── payment/               # Payment DTOs
│   │   ├── user/                  # User DTOs
│   │   ├── BookingRequest.java
│   │   ├── BookingResponse.java
│   │   ├── HotelDTO.java
│   │   ├── RoomDTO.java
│   │   ├── CostCalculationRequest.java
│   │   ├── CostCalculationResponse.java
│   │   └── ...                    # 50+ DTO classes
│   ├── entity/                    # JPA entities
│   │   ├── BaseEntity.java        # Common fields (id, timestamps)
│   │   ├── TenantEntity.java      # Tenant-scoped base entity
│   │   ├── HotelScopedEntity.java # Hotel-scoped base entity
│   │   ├── SystemEntity.java      # System-wide base entity
│   │   ├── User.java              # User account
│   │   ├── Hotel.java             # Hotel
│   │   ├── Room.java              # Hotel room
│   │   ├── Reservation.java       # Booking reservation
│   │   ├── Tenant.java            # Tenant (hotel group)
│   │   ├── Product.java           # Shop product
│   │   ├── ShopOrder.java         # Shop order
│   │   ├── HousekeepingTask.java  # Housekeeping task
│   │   ├── MaintenanceRequest.java # Maintenance request
│   │   ├── StaffSchedule.java     # Staff schedule
│   │   ├── RoomCharge.java        # Room charge
│   │   ├── TaxConfiguration.java  # Tax settings
│   │   ├── HotelPricingConfig.java # Pricing configuration
│   │   └── ...                    # 60+ entity classes
│   ├── enums/                     # Enumeration types
│   │   ├── EventType.java
│   │   ├── NotificationType.java
│   │   ├── ImageCategory.java
│   │   ├── MaintenanceCategory.java
│   │   └── ...
│   ├── repository/                # Spring Data JPA repositories
│   ├── service/                   # Business logic layer
│   │   ├── AuthService.java       # Authentication logic
│   │   ├── BookingService.java    # Booking operations
│   │   ├── HotelService.java      # Hotel operations
│   │   ├── HotelSearchService.java # Search with filtering
│   │   ├── FrontDeskService.java  # Front desk operations
│   │   ├── HotelAdminService.java # Hotel admin operations
│   │   ├── HousekeepingService.java # Housekeeping management
│   │   ├── MaintenanceService.java  # Maintenance management
│   │   ├── ShopOrderService.java    # Shop order processing
│   │   ├── ProductService.java      # Product management
│   │   ├── EmailService.java        # Email dispatch
│   │   ├── PdfService.java          # PDF receipt generation
│   │   ├── HotelImageService.java   # S3 image management
│   │   ├── TaxCalculationService.java  # Tax computation
│   │   ├── RevenueManagementService.java  # Revenue analytics
│   │   ├── AutoCheckoutService.java       # Automated checkout scheduler
│   │   ├── AutomatedRoomStatusService.java # Room status automation
│   │   ├── SessionManagementService.java   # Active session tracking
│   │   ├── payment/
│   │   │   └── EthiopianMobilePaymentService.java  # Telebirr, M-Birr
│   │   └── ...                    # 50+ service classes
│   ├── security/                  # Security utilities
│   │   └── HotelSecurity.java     # Hotel-level access control
│   ├── tenant/                    # Multi-tenancy infrastructure
│   │   ├── TenantContext.java     # ThreadLocal tenant storage
│   │   ├── HotelContext.java      # ThreadLocal hotel storage
│   │   ├── TenantFilter.java      # Servlet filter for tenant resolution
│   │   ├── TenantInterceptor.java # HandlerInterceptor for tenant
│   │   └── TenantResolver.java    # Tenant resolution logic
│   ├── validation/                # Custom validators
│   ├── event/                     # Application events
│   ├── exception/                 # Custom exceptions
│   └── util/                      # Utility classes
├── src/main/resources/
│   ├── application.properties     # Default configuration
│   ├── application-aws.properties     # AWS environment config
│   ├── application-azure.properties   # Azure environment config
│   ├── application-production.properties  # Production overrides
│   ├── db/migration/              # Flyway SQL migrations
│   ├── templates/                 # Thymeleaf email/receipt templates
│   └── logback-spring.xml         # Logging configuration
└── src/test/                      # Test sources
```

---

## Multi-Tenancy Architecture

The application uses a **shared database, shared schema** multi-tenancy model:

1. **TenantFilter** extracts tenant ID from the `X-Tenant-ID` request header.
2. **TenantContext** stores the tenant ID in a ThreadLocal for the request lifecycle.
3. **TenantEntity** base class adds a `tenantId` column; repositories automatically filter by tenant.
4. **HotelScopedEntity** further scopes data to a specific hotel within a tenant.
5. **SystemEntity** has no tenant scoping for system-wide data.

### Tenant Hierarchy
```
System Admin (no tenant)
  └── Tenant (hotel group)
       └── Hotel
            ├── Rooms
            ├── Staff
            ├── Bookings
            ├── Shop Products
            └── Housekeeping Tasks
```

---

## Authentication & Authorization

### JWT Authentication
- Login via `POST /api/auth/login` returns access token + refresh token.
- `JwtAuthenticationFilter` validates the Bearer token on every request.
- Token refresh via `POST /api/auth/refresh`.
- Token blacklisting on logout via `TokenBlacklistService`.

### Role-Based Access Control

| Role | Scope | Permissions |
|---|---|---|
| SYSTEM_ADMIN | System-wide | Full system access, tenant management, user management |
| ADMIN | Tenant | Tenant-level admin, hotel management |
| HOTEL_ADMIN | Hotel | Hotel settings, staff, rooms, bookings, shop |
| FRONTDESK | Hotel | Check-in/out, booking management, room charges |
| OPERATIONS_SUPERVISOR | Hotel | Housekeeping, maintenance, staff scheduling |
| HOUSEKEEPING | Hotel | View/update housekeeping tasks |
| MAINTENANCE | Hotel | View/update maintenance tasks |
| GUEST | Public | Search, book, manage own bookings |

Security is enforced at the controller level with `@PreAuthorize` annotations and method-level security.

---

## API Endpoints Summary

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout (blacklist token) |

### Hotels
| Method | Path | Description |
|---|---|---|
| GET | `/api/hotels` | List hotels |
| GET | `/api/hotels/{id}` | Hotel details |
| GET | `/api/hotels/search` | Search hotels |
| POST | `/api/hotel-registrations` | Public hotel registration |

### Bookings
| Method | Path | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/{id}` | Get booking |
| PUT | `/api/bookings/{id}` | Update booking |
| DELETE | `/api/bookings/{id}` | Cancel booking |
| POST | `/api/bookings/{id}/checkin` | Check in |
| POST | `/api/bookings/{id}/checkout` | Check out |

### Rooms
| Method | Path | Description |
|---|---|---|
| GET | `/api/rooms` | List rooms |
| POST | `/api/rooms` | Create room |
| PUT | `/api/rooms/{id}` | Update room |
| POST | `/api/rooms/bulk-upload` | CSV bulk upload |

### Front Desk
| Method | Path | Description |
|---|---|---|
| GET | `/api/frontdesk/stats` | Dashboard statistics |
| POST | `/api/frontdesk/walk-in` | Walk-in booking |
| GET | `/api/frontdesk/today` | Today's arrivals/departures |

### Hotel Admin
| Method | Path | Description |
|---|---|---|
| GET | `/api/hotel-admin/dashboard` | Admin dashboard data |
| GET | `/api/hotel-admin/staff` | Staff list |
| POST | `/api/hotel-admin/staff` | Add staff member |

### System Admin
| Method | Path | Description |
|---|---|---|
| GET | `/api/system/dashboard` | System metrics |
| GET | `/api/system/users` | All system users |
| GET | `/api/tenants` | Tenant management |
| POST | `/api/tenants` | Create tenant |

### Shop
| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | Product list |
| POST | `/api/products` | Create product |
| POST | `/api/shop-orders` | Create order |
| GET | `/api/shop/dashboard` | Shop analytics |

### Operations
| Method | Path | Description |
|---|---|---|
| GET | `/api/housekeeping/tasks` | Housekeeping tasks |
| POST | `/api/housekeeping/tasks` | Create task |
| GET | `/api/maintenance` | Maintenance requests |
| GET | `/api/staff-schedules` | Staff schedules |

Full interactive API documentation is available at `/swagger-ui.html` when the server is running.

---

## Database

### Schema Management
- Flyway migrations in `src/main/resources/db/migration/`
- Migration naming: `V{version}__{description}.sql`
- Auto-applied on application startup

### Key Tables
- `users` — User accounts with role and tenant binding
- `tenants` — Tenant (hotel group) records
- `hotels` — Hotel properties
- `rooms` — Hotel rooms with type, status, pricing
- `reservations` — Booking records
- `room_charges` — Incidental charges during stay
- `products` — Shop inventory
- `shop_orders` / `shop_order_items` — Shop transactions
- `housekeeping_tasks` — Housekeeping assignments
- `maintenance_requests` — Maintenance tracking
- `staff_schedules` — Staff shift scheduling
- `hotel_pricing_configs` — Dynamic pricing rules
- `tax_configurations` — Tax rates per hotel
- `booking_notifications` — In-app notifications
- `hotel_images` — S3 image references

---

## Payment Integration

### Stripe
- Server-side payment intent creation
- Client-side payment confirmation via Stripe.js
- Webhook handling for payment status updates

### Ethiopian Mobile Payments
- Telebirr integration
- M-Birr integration
- Payment reference tracking
- Phone number validation (Ethiopian format)

---

## External Integrations

| Service | Purpose |
|---|---|
| AWS S3 | Hotel and room type image storage |
| Stripe | Online payment processing |
| Microsoft Graph API | OAuth2-based email sending |
| SMTP | Fallback email delivery |
| Prometheus / Micrometer | Metrics export for monitoring |

### Image Storage Configuration
The application stores hotel and room type images locally on the server filesystem. In production, the following environment variables must be configured:
- `IMAGE_UPLOAD_BASE_DIRECTORY`: Local directory for image storage (default: `/opt/bookmyhotel/uploads/images`)
- `IMAGE_UPLOAD_BASE_URL`: Public URL for accessing images (default: `http://44.204.49.94:8080/uploads/images`)

When images are not available, the frontend automatically uses Unsplash fallback images for all supported room types: STANDARD, DELUXE, SUITE, FAMILY, ACCESSIBLE, and PRESIDENTIAL.

---

## Build & Run

### Prerequisites
- Java 21
- Maven 3.9+
- MySQL 8 (or Docker)

### Local Development
```bash
# Start MySQL via Docker
docker-compose -f infra/docker-compose.yml up -d mysql

# Build and run
cd backend
mvn clean compile
mvn spring-boot:run
```
Server starts on `http://localhost:8080`.

### Production Deployment
The backend runs on AWS Lightsail at `44.204.49.94:8080` with the `aws` Spring profile.

### Configuration Profiles
| Profile | File | Use Case |
|---|---|---|
| (default) | `application.properties` | Local development |
| aws | `application-aws.properties` | AWS Lightsail deployment |
| azure | `application-azure.properties` | Azure deployment |
| production | `application-production.properties` | Production overrides |

---

## Caching

- Spring Cache with Caffeine for in-memory caching
- `RoomCacheService` caches room availability data
- Cache invalidation on room status changes

---

## Automated Processes

- **AutoCheckoutService** — Scheduled task for automatic checkout at configured time
- **AutomatedRoomStatusService** — Updates room statuses based on booking lifecycle
- **BookingStatusUpdateService** — Handles booking state transitions
- **RealTimeProcessMonitoringService** — Tracks system process health

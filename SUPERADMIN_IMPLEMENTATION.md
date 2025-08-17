# Superadmin Functionality Implementation

## Overview
This implementation adds comprehensive superadmin functionality to the BookMyHotel application, enabling:

1. **Hotel Onboarding Management**
2. **Hotel Registration Approval Workflow**
3. **User and Hotel Management**

## Features Implemented

### 1. Hotel Registration System

#### New Entities:
- `HotelRegistration` - Tracks hotel onboarding requests
- `RegistrationStatus` - Enum for tracking approval workflow states

#### Workflow States:
- `PENDING` - Initial submission
- `UNDER_REVIEW` - Being reviewed by admin
- `APPROVED` - Approved and hotel created
- `REJECTED` - Rejected with reason
- `CANCELLED` - Cancelled by submitter

#### API Endpoints:
- `POST /api/admin/hotel-registrations` - Submit new registration
- `GET /api/admin/hotel-registrations` - List all registrations (paginated)
- `GET /api/admin/hotel-registrations/pending` - Get pending registrations
- `GET /api/admin/hotel-registrations/status/{status}` - Filter by status
- `GET /api/admin/hotel-registrations/search?searchTerm=` - Search registrations
- `POST /api/admin/hotel-registrations/{id}/approve` - Approve registration
- `POST /api/admin/hotel-registrations/{id}/reject` - Reject registration
- `POST /api/admin/hotel-registrations/{id}/under-review` - Mark as under review
- `GET /api/admin/hotel-registrations/statistics` - Get statistics

### 2. User Management System

#### Enhanced User Repository:
- Search users by email, name
- Filter by role, tenant, active status
- User statistics and analytics

#### API Endpoints:
- `GET /api/admin/users` - List all users (paginated)
- `GET /api/admin/users/search?searchTerm=` - Search users
- `GET /api/admin/users/role/{role}` - Filter by role
- `GET /api/admin/users/tenant/{tenantId}` - Filter by tenant
- `PUT /api/admin/users/{id}` - Update user information
- `POST /api/admin/users/{id}/toggle-status` - Activate/deactivate user
- `POST /api/admin/users/{id}/roles/{role}` - Add role to user
- `DELETE /api/admin/users/{id}/roles/{role}` - Remove role from user
- `DELETE /api/admin/users/{id}` - Soft delete user
- `POST /api/admin/users/{id}/reset-password` - Reset password
- `GET /api/admin/users/statistics` - Get user statistics

### 3. Role-Based Access Control

#### New User Role:
- `SUPERADMIN` - Full system access including user management

#### Access Control:
- **User Management**: Only `SUPERADMIN`
- **Hotel Registration Management**: `SUPERADMIN` and `PLATFORM_ADMIN`

### 4. Database Schema

#### New Tables:
```sql
hotel_registrations (
    id, hotel_name, description, address, city, country,
    phone, contact_email, contact_person, license_number,
    tax_id, status, submitted_at, reviewed_at, reviewed_by,
    review_comments, approved_hotel_id, tenant_id
)
```

#### Sample Data:
- Superadmin user: `superadmin@bookmyhotel.com`
- Sample hotel registrations for testing

## Technical Architecture

### Services:
- `HotelRegistrationService` - Manages hotel registration workflow
- `UserManagementService` - Handles user CRUD and role management

### Controllers:
- `HotelRegistrationAdminController` - Hotel registration endpoints
- `UserManagementAdminController` - User management endpoints

### DTOs:
- `HotelRegistrationRequest/Response`
- `ApproveRegistrationRequest`
- `RejectRegistrationRequest`
- `UpdateUserRequest`
- `UserManagementResponse`

### Security:
- Updated SecurityConfig with role-based endpoint protection
- CORS configuration for frontend integration

## Usage Examples

### Approve Hotel Registration:
```bash
POST /api/admin/hotel-registrations/1/approve
{
    "comments": "All documents verified. Welcome to the platform!",
    "tenantId": "hotel-001"
}
```

### Search Users:
```bash
GET /api/admin/users/search?searchTerm=john&page=0&size=10
```

### Add Role to User:
```bash
POST /api/admin/users/5/roles/HOTEL_ADMIN
```

## Integration Notes

### Frontend Integration:
- All endpoints use standard REST conventions
- Pagination support with `page` and `size` parameters
- Error handling with appropriate HTTP status codes
- CORS enabled for development

### Multi-Tenant Support:
- Hotel registrations can be assigned to specific tenants
- User management respects tenant boundaries
- Tenant context automatically set during hotel creation

## Next Steps

1. **Frontend Implementation**: Create admin dashboard with React components
2. **Email Notifications**: Add email alerts for registration status changes
3. **File Upload**: Support for hotel documentation and images
4. **Audit Logging**: Track all admin actions for compliance
5. **Advanced Reporting**: Analytics and insights for platform management

## Testing

The system includes:
- Sample superadmin user for testing
- Sample hotel registrations in different states
- Comprehensive error handling
- Input validation on all endpoints

## Security Considerations

- All admin endpoints protected by role-based authentication
- Password encryption for user management
- Tenant isolation maintained
- Input sanitization and validation
- Audit trail for approval decisions

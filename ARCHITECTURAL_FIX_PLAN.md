# Architectural Fix: Separating Tenant and Hotel Concepts

## Problem Identified
The current system has a conceptual confusion between tenants and hotels:

1. **User entity** has both `tenant_id` (String) AND `hotel_id` (Hotel reference) - redundant and confusing
2. **Mixed relationships**: Users are tied to tenants directly, but should be tied to hotels
3. **Authentication token** contains `tenantId` but hotel admin users should work with `hotelId`

## Correct Architecture

```
Tenant (1) -----> (N) Hotels (1) -----> (N) Hotel-level Entities
   |                   |                      |
   |                   |                      ├── Users (hotel staff)
   |                   |                      ├── Rooms
   |                   |                      ├── Reservations  
   |                   |                      ├── Staff Schedules
   |                   |                      └── etc.
   |                   |
   |                   └── Hotel Properties:
   |                       - name, address, etc.
   |                       - tenant_id (FK)
   |
   └── Tenant Properties:
       - name, subdomain, etc.
       - tenant-level configuration
```

## Current vs Desired State

### Current (INCORRECT):
- User has `tenant_id` + `hotel_id` 
- JWT token contains `tenantId`
- Services filter by `tenantId` 
- Hotel admin works at tenant level

### Desired (CORRECT):
- User has ONLY `hotel_id`
- JWT token contains `hotelId` (and derives `tenantId` from hotel.tenant_id)
- Services filter by `hotelId`
- Hotel admin works at hotel level

## Implementation Plan

### Phase 1: Database Schema Changes
1. **Remove `tenant_id` column from `users` table**
2. **Ensure `hotel_id` column exists and is NOT NULL for hotel staff**
3. **Update all queries to use hotel-based filtering**

### Phase 2: Entity Model Updates  
1. **Update User entity**: Remove `tenantId` field, keep only `hotel` relationship
2. **Update UserRole logic**: Ensure hotel-bound users MUST have a hotel
3. **Update authentication**: JWT should contain `hotelId` for hotel staff

### Phase 3: Service Layer Updates
1. **Update all services** to filter by hotel instead of tenant for hotel-level operations
2. **Update StaffScheduleService**: Use `hotelId` for filtering, not `tenantId`
3. **Update security annotations**: `@PreAuthorize` should check hotel access

### Phase 4: Frontend Updates
1. **Update TenantContext**: Rename to `HotelContext` for hotel admin users
2. **Update API calls**: Use `hotelId` instead of `tenantId` for hotel operations
3. **Update authentication**: Handle hotel-based tokens

## Benefits of This Fix

1. **Clear separation of concerns**: Tenants manage multiple hotels, hotels manage operations
2. **Proper authorization**: Hotel admins can only access their specific hotel
3. **Scalable multi-tenancy**: One tenant can have multiple hotels with independent staff
4. **Intuitive business logic**: Hotel staff belong to hotels, not directly to tenants
5. **Better security**: Fine-grained access control at hotel level

## Migration Strategy

1. **Backward compatibility**: Maintain existing APIs during transition
2. **Gradual rollout**: Update one service at a time
3. **Data migration**: Scripts to clean up user table and update relationships
4. **Testing**: Verify multi-hotel scenarios work correctly

## Files to Update

### Backend:
- `User.java` - Remove tenantId, keep only hotel relationship
- `JwtTokenProvider.java` - Include hotelId in token for hotel staff
- `StaffScheduleService.java` - Filter by hotelId
- `StaffScheduleController.java` - Use hotel-based authorization
- All services using tenant filtering for hotel operations

### Database:
- Migration script to remove user.tenant_id column
- Update all queries to use hotel-based filtering

### Frontend:
- `TenantContext.tsx` -> `HotelContext.tsx` for hotel admin
- Update all API calls to use hotelId
- Update authentication handling

This architectural fix will resolve the conceptual confusion and create a clean, scalable multi-tenant system.

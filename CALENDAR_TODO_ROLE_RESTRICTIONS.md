# Calendar and TODO Role Restrictions

## Overview
This document outlines the role-based access control implementation for Calendar and TODO functionality in the BookMyHotel application.

## Changes Made

### Backend Changes

#### TodoController.java
- **File**: `backend/src/main/java/com/bookmyhotel/controller/TodoController.java`
- **Change**: Added `@PreAuthorize` annotations to all TODO endpoints
- **Restriction**: Only staff roles can access TODO functionality
- **Allowed Roles**: ADMIN, HOTEL_ADMIN, HOTEL_MANAGER, FRONTDESK, HOUSEKEEPING
- **Denied Roles**: CUSTOMER, GUEST

**Endpoints Protected**:
- `GET /api/todos` - Get all todos
- `GET /api/todos/filtered` - Get filtered todos
- `GET /api/todos/paginated` - Get paginated todos
- `GET /api/todos/{id}` - Get specific todo
- `POST /api/todos` - Create new todo
- `PUT /api/todos/{id}` - Update todo
- `PATCH /api/todos/{id}/toggle` - Toggle todo completion
- `DELETE /api/todos/{id}` - Delete todo
- `GET /api/todos/pending/count` - Get pending todos count
- `GET /api/todos/overdue` - Get overdue todos

### Frontend Changes

#### EnhancedLayout.tsx
- **File**: `frontend/src/components/layout/EnhancedLayout.tsx`
- **Change**: Modified sidebar visibility logic
- **Logic**: Hide entire sidebar (calendar + TODOs) for CUSTOMER and GUEST roles
- **Code Change**: Updated `showSidebar` condition to exclude CUSTOMER and GUEST roles

#### CalendarWidget.tsx
- **File**: `frontend/src/components/common/CalendarWidget.tsx`
- **Change**: Added role-based access control and event filtering
- **Logic**: 
  - Component returns `null` for CUSTOMER and GUEST roles
  - Removed mock events for CUSTOMER and GUEST roles
  - Only shows events for HOTEL_ADMIN and FRONTDESK staff roles

#### TodosWidget.tsx
- **File**: `frontend/src/components/common/TodosWidget.tsx`
- **Change**: Added role-based access control
- **Logic**: Component returns `null` for CUSTOMER and GUEST roles
- **Implementation**: Uses React hooks correctly by checking access after hook initialization

## Role Access Matrix

| Role          | Calendar Access | TODO Access | Notes                           |
|---------------|-----------------|-------------|---------------------------------|
| ADMIN         | ✅ Yes          | ✅ Yes      | Full system administrator       |
| HOTEL_ADMIN   | ✅ Yes          | ✅ Yes      | Hotel-specific administrator    |
| HOTEL_MANAGER | ❌ No Events    | ✅ Yes      | Management tasks only           |
| FRONTDESK     | ✅ Yes          | ✅ Yes      | Check-in/out events             |
| HOUSEKEEPING  | ❌ No Events    | ✅ Yes      | Task management only            |
| CUSTOMER      | ❌ No           | ❌ No       | **Restricted** - No sidebar     |
| GUEST         | ❌ No           | ❌ No       | **Restricted** - No sidebar     |

## Security Implementation

### Backend Security
- Uses Spring Security `@PreAuthorize` annotations
- Role-based method-level security
- Prevents API access even if frontend is bypassed
- Returns HTTP 403 Forbidden for unauthorized access

### Frontend Security
- Component-level access control
- Graceful hiding of UI elements
- No API calls made for restricted users
- Consistent user experience

## Testing
- ✅ Frontend builds successfully
- ✅ Backend compiles without errors
- ✅ Changes committed to git repository
- ✅ Role restrictions implemented at both frontend and backend levels

## Future Considerations
- Calendar events for HOTEL_MANAGER and HOUSEKEEPING roles can be customized
- Additional granular permissions can be added for specific TODO categories
- Event types can be expanded based on role-specific needs

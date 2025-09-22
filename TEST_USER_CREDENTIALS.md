# Available Test Users with Required Roles

Based on the database query, these users have the HOTEL_ADMIN or FRONTDESK roles needed to access notifications:

## Hotel 1 (Grand Plaza Hotel)
- **admin.grandplaza@bookmyhotel.com** - HOTEL_ADMIN (user_id: 4)
- **frontdesk.grandplaza@bookmyhotel.com** - FRONTDESK (user_id: 5) 
- **test@test.com** - FRONTDESK (user_id: 8)

## Hotel 2 (Sam Hotel)
- **abadiweldegebriel@gmail.com** - HOTEL_ADMIN (user_id: 2)
- **bookmyhotel2025@gmail.com** - HOTEL_ADMIN (user_id: 3)
- **admin.samhotel@bookmyhotel.com** - HOTEL_ADMIN (user_id: 6)
- **frontdesk.samhotel@bookmyhotel.com** - FRONTDESK (user_id: 7)

## Current Issue
The notification system requires users to have either HOTEL_ADMIN or FRONTDESK role to access the `/api/notifications` endpoint.

## Solution
Log in with one of the users above who has the required role.

## Password
Most test accounts should use the default password from the demo setup scripts.
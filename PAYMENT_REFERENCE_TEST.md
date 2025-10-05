# Payment Reference Testing Guide

## Overview
The payment reference feature allows guests to provide their own mobile money transfer reference during booking. This reference is then stored and displayed in the booking management table.

## How to Test

### 1. Start the Application
- Make sure MySQL is running: Use the "Start MySQL Only" task
- Start the backend: Use the "Start Backend" task
- Start the frontend: Use the "Start Frontend" task
- Navigate to http://localhost:3000

### 2. Test Guest Booking Flow
1. Go to hotel search and find an available room
2. Click "Book Now" and select "Book as Guest"
3. Fill in guest details (name, email, phone)
4. Select "Mobile Money" as payment method
5. **Important**: Fill in the "Mobile Transfer Reference" field with your own reference (e.g., "MM123456789")
6. Complete the booking

### 3. Verify Payment Reference
1. Login as hotel admin (admin.grandplaza@bookmyhotel.com / Admin123!)
2. Go to the Booking Management page
3. Look for your new booking in the table
4. **Expected Result**: The payment reference column should show your custom reference (e.g., "MM123456789") instead of an auto-generated one

### 4. Check Console Logs
- Open browser developer tools (F12)
- Look for these console messages:
  - `✅ Using user-provided payment reference: [your reference]`
  - `🔄 Payment processed: {...}`

## Payment Method Behavior

### Mobile Money
- **With User Reference**: Uses the user's input as the payment reference
- **Without User Reference**: Auto-generates reference like `MOBILE_1727980123_456`

### Other Payment Methods
- Always use auto-generated references regardless of mobile transfer reference input
- Card payments: `CARD_1727980123_456`
- Pay at front desk: `DESK_1727980123_456`

## Database Verification
The payment reference is stored in the `payment_reference` column of the `reservations` table.

## Files Modified
1. `frontend/src/services/mockPaymentGateway.ts` - Modified to use user-provided references
2. `frontend/src/pages/BookingPage.tsx` - Added console logging for debugging
3. Database migration for `payment_reference` column was already applied

## Expected Outcome
When a guest provides a mobile transfer reference during mobile money payment, that exact reference should appear in the booking table instead of a system-generated one.
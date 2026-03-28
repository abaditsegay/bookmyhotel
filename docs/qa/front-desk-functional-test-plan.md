# Front Desk Functional Test Plan

## Scope

This document contains manual functional test cases for front desk operational workflows.

## Included Areas

- Front desk login
- Walk-in booking
- Booking search
- Room assignment and check-in
- Room charges
- Checkout and receipt generation
- Payment settlement at hotel
- Booking change and cancellation
- Role-based access boundaries

| Test Case ID | Title | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| FD-01 | Log in and open front desk dashboard | Front desk account exists | 1. Log in as front desk staff. 2. Open the dashboard. | The front desk dashboard loads successfully. |  |
| FD-02 | Create walk-in booking | Front desk is logged in and at least one room is available | 1. Open walk-in booking. 2. Enter guest details. 3. Select dates and room. 4. Complete booking. | A walk-in booking is created successfully. |  |
| FD-03 | Search for an existing booking | At least one booking exists | 1. Search by booking reference, guest name, or email. 2. Open the booking. | The correct booking details are displayed. |  |
| FD-04 | Assign room and check in guest | A valid booking exists and a room is available | 1. Open the booking. 2. Start check-in. 3. Assign a room if needed. 4. Confirm. | The guest is checked in and the room status becomes occupied. |  |
| FD-05 | Add room charges | A guest is checked in | 1. Open the checked-in booking. 2. Add room charges such as minibar or laundry. 3. Save. | The charges are added successfully and appear in the booking summary. |  |
| FD-06 | Check out guest and generate receipt | A guest is checked in | 1. Open booking. 2. Start checkout. 3. Review final charges. 4. Complete checkout. 5. Generate receipt. | Checkout completes and a receipt is available. |  |
| FD-07 | Settle pay-at-desk booking | Booking exists with payment pending at the hotel | 1. Open booking. 2. Collect payment. 3. Mark payment as completed. | Payment status is updated correctly. |  |
| FD-08 | Modify or cancel booking from front desk | A future booking exists and front desk is allowed to update it | 1. Open booking. 2. Modify booking details or cancel it. 3. Confirm the action. | The booking updates correctly and any applicable refund or charge is shown. |  |
| FD-09 | Restrict front desk from hotel setup features | Front desk is logged in | 1. Try to open hotel setup, pricing, or staff creation functions. | Access is blocked or those options are not shown. |  |

## Front Desk Validation Points

- Front desk must be able to create a booking for a guest arriving without a prior reservation.
- Check-in must assign a room and update room occupancy status.
- Checkout must include room charges and receipt generation.
- Front desk must not be able to change hotel-wide setup or system-wide settings.
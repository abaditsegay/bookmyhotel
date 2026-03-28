# BookMyHotel Manual Functional Test Plan

## Purpose

This document provides a manual functional test plan for QA and UAT testers for the BookMyHotel platform. It is written for business testers and focuses on real user workflows only.

## Scope

This plan covers end-to-end functional testing for:

- Tenant / Hotel Admin
- Front Desk Staff
- Customer / Guest Booking

This plan focuses only on functional behavior.

It does not cover:

- Performance testing
- Load testing
- Penetration testing
- Code-level checks
- Technical implementation details

## Related Test Assets

- [Spreadsheet-ready CSV](./manual-functional-test-plan.csv)
- [Hotel Admin role test plan](./qa/hotel-admin-functional-test-plan.md)
- [Customer and guest role test plan](./qa/customer-functional-test-plan.md)
- [Front desk role test plan](./qa/front-desk-functional-test-plan.md)
- [Condensed UAT sign-off checklist](./qa/uat-signoff-checklist.md)

## Test Environment Preparation

Before execution, confirm the test environment has the following:

- One approved and publicly visible hotel
- One hotel registration request waiting for approval
- One hotel admin account
- One front desk account
- One registered customer account
- Guest booking enabled without account creation
- At least 6 rooms across at least 3 room types
- Future dates with available inventory
- Pricing and tax configuration enabled
- Refund policy configured
- At least one enabled payment method
- Email notifications enabled if part of the environment
- SMS notifications enabled if part of the environment

## Execution Rules

- Use future dates unless the case is specifically testing invalid dates.
- Capture screenshots for failed steps.
- Capture evidence for booking confirmation, cancellation, refund result, check-in, checkout, and receipt.
- Record actual results during execution.
- Leave the Pass/Fail column blank until the case is executed.

## Test Areas

- User registration and login
- Hotel onboarding and configuration
- Room setup and pricing
- Availability and inventory management
- Online booking flow
- Walk-in booking
- Booking modification, cancellation, and refund handling
- Notifications
- Role-based access
- Edge cases
- Data validation

## 1. Tenant / Hotel Admin

| Test Case ID | Title | User Role | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|---|
| ADM-01 | Approve hotel registration | System Admin | A hotel registration request exists in pending status | 1. Log in as system admin. 2. Open hotel registration requests. 3. Select a pending request. 4. Approve it. | The hotel registration is approved and the hotel can proceed to setup. |  |
| ADM-02 | Reject hotel registration | System Admin | A hotel registration request exists in pending status | 1. Log in as system admin. 2. Open hotel registration requests. 3. Select a pending request. 4. Reject it with a reason. | The hotel registration is rejected and the rejection status is visible. |  |
| ADM-03 | Complete hotel onboarding | Hotel Admin | The hotel has been approved and hotel admin credentials exist | 1. Log in as hotel admin. 2. Open hotel setup or onboarding. 3. Enter hotel details. 4. Save changes. | The hotel profile is saved and visible in the hotel admin area. |  |
| ADM-04 | Create room inventory manually | Hotel Admin | Hotel admin is logged in | 1. Open room management. 2. Add several rooms with different room types. 3. Enter room number, room type, price, and capacity. 4. Save each room. | All new rooms appear correctly in the room list. |  |
| ADM-05 | Configure room pricing and taxes | Hotel Admin | At least one room type exists | 1. Open pricing configuration. 2. Set room prices. 3. Set tax values. 4. Save. 5. Reopen the page. | Pricing and tax settings are saved correctly and remain visible. |  |
| ADM-06 | Create front desk staff account | Hotel Admin | Hotel admin is logged in | 1. Open staff management. 2. Add a new staff user. 3. Assign the front desk role. 4. Save. | The front desk account is created and available for login. |  |
| ADM-07 | Confirm hotel appears in public search | Hotel Admin | Hotel is approved, public, and has available rooms | 1. Open the public hotel search. 2. Search by city and future dates. | The hotel appears in the search results with room availability. |  |
| ADM-08 | Restrict hotel admin from system admin actions | Hotel Admin | Hotel admin is logged in | 1. Try to open system admin-only pages or actions. | Access is blocked or the options are not shown. |  |

## 2. Customer / Guest Booking

| Test Case ID | Title | User Role | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|---|
| CUS-01 | Register a new customer account | Customer | The user is not logged in and the email is unused | 1. Open the login or registration page. 2. Choose create account. 3. Enter required details. 4. Submit. | The account is created successfully and the user can log in. |  |
| CUS-02 | Search hotels by city and dates | Customer | At least one public hotel has future availability | 1. Open hotel search. 2. Enter city, check-in, check-out, and guest count. 3. Run the search. | Matching hotels are displayed. |  |
| CUS-03 | View hotel details and room options | Customer | Search results exist | 1. Open one hotel from the search results. 2. Review hotel details, room types, and prices. | Hotel details and available room options are shown correctly. |  |
| CUS-04 | Complete online booking as registered customer | Customer | Customer is signed in and room availability exists | 1. Search for a hotel. 2. Select a room. 3. Confirm guest details. 4. Select payment method. 5. Submit booking. | The booking completes successfully and a confirmation page is shown. |  |
| CUS-05 | Complete online booking as guest | Guest | Guest booking flow is available and room availability exists | 1. Search for a hotel. 2. Select a room. 3. Continue as guest. 4. Enter guest details. 5. Complete booking. | The booking completes successfully without requiring a permanent account. |  |
| CUS-06 | Find booking using booking reference | Customer / Guest | A confirmed booking exists | 1. Open the find booking page. 2. Enter the booking reference and required guest details. 3. Search. | The correct booking is returned. |  |
| CUS-07 | Modify booking before the allowed deadline | Customer / Guest | A future booking exists and changes are allowed | 1. Open booking management. 2. Choose modify booking. 3. Change dates or allowed details. 4. Save. | The booking updates successfully and new details are shown. |  |
| CUS-08 | Cancel booking and review refund result | Customer / Guest | A future booking exists and cancellation is allowed | 1. Open booking management. 2. Choose cancel booking. 3. Confirm cancellation. | The booking is cancelled and the refund or no-refund result is displayed clearly. |  |
| CUS-09 | Receive booking confirmation notification | Customer / Guest | Notifications are enabled | 1. Complete a booking. 2. Check the confirmation screen. 3. Check email or SMS if enabled. | The confirmation is visible in the app and sent through enabled channels. |  |
| CUS-10 | Restrict customer from admin and staff actions | Customer | Customer is logged in | 1. Try to open hotel admin or front desk functions. | Access is blocked or not visible. |  |

## 3. Front Desk Staff

| Test Case ID | Title | User Role | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|---|
| FD-01 | Log in and open front desk dashboard | Front Desk Staff | Front desk account exists | 1. Log in as front desk staff. 2. Open the dashboard. | The front desk dashboard loads successfully. |  |
| FD-02 | Create walk-in booking | Front Desk Staff | Front desk is logged in and at least one room is available | 1. Open walk-in booking. 2. Enter guest details. 3. Select dates and room. 4. Complete booking. | A walk-in booking is created successfully. |  |
| FD-03 | Search for an existing booking | Front Desk Staff | At least one booking exists | 1. Search by booking reference, guest name, or email. 2. Open the booking. | The correct booking details are displayed. |  |
| FD-04 | Assign room and check in guest | Front Desk Staff | A valid booking exists and a room is available | 1. Open the booking. 2. Start check-in. 3. Assign a room if needed. 4. Confirm. | The guest is checked in and the room status becomes occupied. |  |
| FD-05 | Add room charges | Front Desk Staff | A guest is checked in | 1. Open the checked-in booking. 2. Add room charges such as minibar or laundry. 3. Save. | The charges are added successfully and appear in the booking summary. |  |
| FD-06 | Check out guest and generate receipt | Front Desk Staff | A guest is checked in | 1. Open booking. 2. Start checkout. 3. Review final charges. 4. Complete checkout. 5. Generate receipt. | Checkout completes and a receipt is available. |  |
| FD-07 | Settle pay-at-desk booking | Front Desk Staff | Booking exists with payment pending at the hotel | 1. Open booking. 2. Collect payment. 3. Mark payment as completed. | Payment status is updated correctly. |  |
| FD-08 | Modify or cancel booking from front desk | Front Desk Staff | A future booking exists and front desk is allowed to update it | 1. Open booking. 2. Modify booking details or cancel it. 3. Confirm the action. | The booking updates correctly and any applicable refund or charge is shown. |  |
| FD-09 | Restrict front desk from hotel setup features | Front Desk Staff | Front desk is logged in | 1. Try to open hotel setup, pricing, or staff creation functions. | Access is blocked or those options are not shown. |  |

## 4. Cross-Role Functional Scenarios

| Test Case ID | Title | User Role | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|---|
| XRL-01 | Availability updates after customer booking | Customer + Front Desk + Hotel Admin | A room is available for booking | 1. Customer books the room. 2. Front desk checks availability for the same dates. 3. Hotel admin checks availability. | Availability is reduced consistently across all views. |  |
| XRL-02 | Room status updates after check-in and checkout | Front Desk + Hotel Admin | Booking exists for check-in and checkout | 1. Check in the guest. 2. Review room status. 3. Check out the guest. 4. Review room status again. | Room status changes correctly through the full stay process. |  |
| XRL-03 | Tenant isolation between hotels | Hotel Admin | Two different hotels or tenants exist | 1. Log in as Hotel Admin A. 2. Review bookings and rooms. 3. Log in as Hotel Admin B. 4. Review bookings and rooms. | Each hotel admin sees only their own hotel data. |  |
| XRL-04 | Notifications after booking change | Customer / Front Desk / Hotel Admin | Notifications are enabled and a booking exists | 1. Modify or cancel a booking. 2. Check confirmation in the app. 3. Check enabled notification channels. | The booking change is shown correctly and the notification is delivered where supported. |  |

## 5. Edge Cases

| Test Case ID | Title | User Role | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|---|
| EGC-01 | Prevent booking with past dates | Customer | Hotel search is available | 1. Enter a past check-in date. 2. Try to search or book. | The system blocks the action and shows a clear validation message. |  |
| EGC-02 | Prevent checkout before check-in | Customer / Front Desk | A booking form is available | 1. Enter a checkout date earlier than check-in. | The system rejects the date range and asks for valid dates. |  |
| EGC-03 | Handle payment failure clearly | Customer | A payment method can be tested for failure | 1. Complete booking up to payment. 2. Trigger a failed payment. | The booking does not complete incorrectly and the user sees a clear failure result. |  |
| EGC-04 | Prevent double booking of the same room | Customer / Front Desk | One room is available for a target date range | 1. Create one booking for the room and dates. 2. Attempt a second booking for the same room and dates. | The second booking is blocked. |  |
| EGC-05 | Prevent overbooking when all inventory is sold | Customer / Front Desk | Inventory is limited | 1. Book all available inventory. 2. Attempt one additional booking for the same dates. | The extra booking is blocked because no availability remains. |  |
| EGC-06 | Handle concurrent booking attempts for the last room | Customer + Customer or Customer + Front Desk | Only one room remains for a date range | 1. Use two different sessions. 2. Attempt to book the last room at nearly the same time. | Only one booking succeeds and the other receives a no-availability result. |  |
| EGC-07 | Enforce cancellation timing rules | Customer / Front Desk | Refund rules are configured | 1. Cancel bookings at different times before check-in. 2. Compare the outcomes. | The cancellation and refund result follows the configured hotel rule. |  |

## 6. Data Validation

| Test Case ID | Title | User Role | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|---|
| DAT-01 | Validate room subtotal by nights | Customer / Front Desk | A booking can be created for multiple nights | 1. Create a booking with a known nightly rate. 2. Multiply nightly rate by number of nights manually. 3. Compare with system subtotal. | The subtotal is correct. |  |
| DAT-02 | Validate tax calculation in final total | Customer / Front Desk | Hotel has tax settings enabled | 1. Review booking or checkout summary. 2. Note subtotal and tax lines. 3. Compare with final total. | Final total equals subtotal plus all displayed taxes and fees. |  |
| DAT-03 | Validate discount handling when used | Hotel Admin + Customer / Front Desk | Discount rules are enabled in the environment | 1. Create a booking or charge that qualifies for a discount. 2. Compare original amount, discount, and final amount. | The discount is applied correctly and the final amount is accurate. |  |
| DAT-04 | Validate refund amount after cancellation | Customer / Front Desk | Booking exists and refund rules are enabled | 1. Cancel the booking. 2. Compare the displayed refund with the expected refund policy. | The refund amount is correct. |  |
| DAT-05 | Validate stay duration and date logic | Customer / Front Desk | A booking for multiple nights exists | 1. Review check-in date, check-out date, and displayed number of nights. | The stay duration shown is correct. |  |
| DAT-06 | Validate currency formatting | Customer / Front Desk / Hotel Admin | Prices are visible in search, booking, payment, and receipt flows | 1. Review price displays in search results, booking summary, payment, and receipt. | Currency formatting is consistent and easy to understand. |  |

## Recommended Execution Order

1. Tenant / Hotel Admin cases
2. Customer / Guest booking cases
3. Front Desk Staff cases
4. Cross-role functional scenarios
5. Edge cases
6. Data validation cases

## Exit Criteria

The test cycle is considered complete when all of the following are true:

- All major happy paths pass: hotel approval, hotel setup, online booking, guest booking, walk-in booking, check-in, checkout, cancellation, and booking lookup
- No role can access functions outside its allowed business scope
- The same room or inventory cannot be sold twice for the same stay period
- Totals, taxes, refunds, date logic, and currency formatting are correct
- Enabled notification channels work for the key customer-facing events

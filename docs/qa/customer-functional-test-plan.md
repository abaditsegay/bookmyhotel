# Customer And Guest Functional Test Plan

## Scope

This document contains manual functional test cases for customer and guest booking journeys.

## Included Areas

- Registration and login
- Hotel search and hotel details
- Registered booking flow
- Guest booking flow
- Booking lookup
- Booking modification and cancellation
- Notifications
- Customer role restrictions

| Test Case ID | Title | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| CUS-01 | Register a new customer account | The user is not logged in and the email is unused | 1. Open the login or registration page. 2. Choose create account. 3. Enter required details. 4. Submit. | The account is created successfully and the user can log in. |  |
| CUS-02 | Search hotels by city and dates | At least one public hotel has future availability | 1. Open hotel search. 2. Enter city, check-in, check-out, and guest count. 3. Run the search. | Matching hotels are displayed. |  |
| CUS-03 | View hotel details and room options | Search results exist | 1. Open one hotel from the search results. 2. Review hotel details, room types, and prices. | Hotel details and available room options are shown correctly. |  |
| CUS-04 | Complete online booking as registered customer | Customer is signed in and room availability exists | 1. Search for a hotel. 2. Select a room. 3. Confirm guest details. 4. Select payment method. 5. Submit booking. | The booking completes successfully and a confirmation page is shown. |  |
| CUS-05 | Complete online booking as guest | Guest booking flow is available and room availability exists | 1. Search for a hotel. 2. Select a room. 3. Continue as guest. 4. Enter guest details. 5. Complete booking. | The booking completes successfully without requiring a permanent account. |  |
| CUS-06 | Find booking using booking reference | A confirmed booking exists | 1. Open the find booking page. 2. Enter the booking reference and required guest details. 3. Search. | The correct booking is returned. |  |
| CUS-07 | Modify booking before the allowed deadline | A future booking exists and changes are allowed | 1. Open booking management. 2. Choose modify booking. 3. Change dates or allowed details. 4. Save. | The booking updates successfully and new details are shown. |  |
| CUS-08 | Cancel booking and review refund result | A future booking exists and cancellation is allowed | 1. Open booking management. 2. Choose cancel booking. 3. Confirm cancellation. | The booking is cancelled and the refund or no-refund result is displayed clearly. |  |
| CUS-09 | Receive booking confirmation notification | Notifications are enabled | 1. Complete a booking. 2. Check the confirmation screen. 3. Check email or SMS if enabled. | The confirmation is visible in the app and sent through enabled channels. |  |
| CUS-10 | Restrict customer from admin and staff actions | Customer is logged in | 1. Try to open hotel admin or front desk functions. | Access is blocked or not visible. |  |

## Customer Validation Points

- Search results must match selected dates and guest count.
- Booking confirmation must show the correct hotel, dates, guest details, and booking reference.
- Guest users must be able to complete a booking without creating a permanent account if that feature is enabled.
- Customers must not be able to access staff or admin workflows.
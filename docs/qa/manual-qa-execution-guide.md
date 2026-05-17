# BookMyHotel Manual QA Execution Guide

## Purpose

This guide is a step-by-step manual test document for QA testers who do not need any knowledge of the codebase.

It is based on the implemented user journeys currently covered in the application, including:

- public hotel registration
- system administrator setup and approval flows
- hotel administrator room and staff setup
- guest and registered-customer booking flows
- booking lookup, modification, and cancellation
- front desk booking search, walk-in booking, check-in, and checkout

This document is intended to be executed in order. Later scenarios reuse data created in earlier scenarios whenever possible.

## Recommended Execution Order

Run the scenarios in this order:

1. Public hotel registration
2. System admin creates a user
3. System admin approves the hotel registration
4. Hotel admin verifies hotel dashboard and room setup
5. Hotel admin creates front desk staff if missing
6. Guest completes a booking
7. Registered customer completes a booking
8. Guest finds a booking
9. Guest modifies a booking
10. Guest cancels a booking
11. Front desk searches for a booking
12. Front desk checks in a guest with room assignment
13. Front desk checks out a guest and validates receipt
14. Front desk creates a walk-in booking
15. Access control and cross-role checks

## Environment Information

Fill these values before test execution:

| Item | Value to Fill |
|---|---|
| Test environment base URL |  |
| Frontend URL |  |
| Backend URL if needed for support only |  |
| Browser used for execution |  |
| Test cycle date |  |
| Tester name |  |

## Core Test Accounts

Use these accounts if they already exist in the test environment. If they do not exist, create them during the relevant setup scenarios.

| Role | Example Email | Password | Notes |
|---|---|---|---|
| System Admin | admin@bookmyhotel.com | Fill from environment | Used for user creation and hotel approval |
| Hotel Admin | hotel.admin@example.com | Fill from environment | Used for hotel dashboard, room, and staff checks |
| Front Desk | frontdesk.playwright@example.com | Fill from environment | Used for booking search, walk-in, check-in, checkout |
| Registered Customer | registered.customer@example.com | Fill from environment | Used for signed-in booking flow |

## Standard Test Data Pack

Use the following canonical values when possible. If the environment already contains equivalent values, note the actual values used in your evidence.

### Hotel Registration Data

| Field | Value |
|---|---|
| Hotel Name | Grand Palace Hotel QA |
| Contact Person | John Anderson |
| Description | A luxury city hotel for QA verification |
| Address | 123 Grand Boulevard, Downtown District |
| City | Addis Ababa |
| Country | Ethiopia |
| Contact Email | contact.qa.hotel@example.com |
| Phone | 0911001100 |
| Mobile Payment Phone 1 | 0912002200 |
| Mobile Payment Phone 2 | 0913003300 |
| License Number | HTL-LIC-QA-2026-001 |
| Tax ID | TIN-QA-2026-001 |
| Website URL | https://grandpalace-qa.example.com |
| Facility Amenities | Free WiFi, Restaurant, Parking, Conference Rooms |
| Number of Rooms | 20 |
| Check-in Time | 14:00 |
| Check-out Time | 12:00 |

### Room Inventory Data

Create or verify at least these rooms for the approved hotel:

| Room Number | Room Type | Capacity | Price Per Night | Status |
|---|---|---|---|---|
| 101 | Deluxe Suite | 2 | ETB 2,500 | Available |
| 204 | Deluxe Suite | 2 | ETB 2,600 | Available |
| 305 | Executive Room | 3 | ETB 3,200 | Available |
| 401 | Deluxe Room | 2 | ETB 2,700 | Available |

### Booking Data to Create During Testing

| Purpose | Guest Name | Email | Phone | Expected Outcome |
|---|---|---|---|---|
| Guest booking | Lookup Guest | lookup.guest@example.com | 0911998877 | Produces confirmation number for lookup and front desk search |
| Modification booking | Original Guest | original.guest@example.com | 0911887766 | Used for modify test |
| Cancellation booking | Cancelable Guest | cancelable.guest@example.com | 0911776655 | Used for cancellation test |
| Check-in booking | Check In Guest | checkin.guest@example.com | 0911223344 | Used for room assignment and check-in |
| Checkout booking | Checkout Guest | checkout.guest@example.com | 0911665544 | Used for checkout and receipt |
| Walk-in booking | Walk In Guest | walkin.guest@example.com | 0911778899 | Created directly by front desk |

## General Rules for Testers

1. Use dates at least 7 days in the future unless the test case specifically checks invalid dates.
2. Record all generated confirmation numbers, receipt numbers, and newly created emails.
3. Take screenshots at the end of every happy-path scenario and at every failed step.
4. When a scenario creates data needed for the next scenario, record it immediately in the execution log.
5. If the environment already has conflicting data, add a unique suffix such as your initials and the current date.

## Evidence to Capture

Capture a screenshot or exported evidence for each of the following:

- successful hotel registration submission
- successful admin user creation
- successful hotel approval
- hotel dashboard with room counts
- successful guest booking confirmation page
- successful booking lookup result
- successful booking modification result
- successful booking cancellation result
- front desk booking search result
- successful room assignment during check-in
- successful checkout receipt
- successful walk-in booking confirmation

## Scenario 1: Public Hotel Registration

### Objective

Verify that a public user can submit a hotel registration request.

### Entry Screen

- URL path: `/register-hotel`
- Page title or heading: `Register Your Hotel`

### Preconditions

- Tester is logged out.
- The test environment is reachable.

### Test Data

Use the values from the Hotel Registration Data table.

### Steps

1. Open the frontend base URL and navigate to `/register-hotel`.
2. Confirm the page heading `Register Your Hotel` is visible.
3. Confirm the section heading `Hotel Information` is visible.
4. Enter `Grand Palace Hotel QA` in `Hotel Name`.
5. Enter `John Anderson` in `Contact Person`.
6. Enter `contact.qa.hotel@example.com` in `Contact Email`.
7. Enter `123 Grand Boulevard, Downtown District` in `Address`.
8. Enter `Addis Ababa` in `City`.
9. Confirm `Country` defaults to `Ethiopia`.
10. Complete the remaining fields using the Hotel Registration Data table.
11. Click `Submit Registration`.

### Expected Result

1. A success state is displayed.
2. The heading `Registration Successful!` is shown.
3. The submitted hotel name is displayed.
4. The submitted contact email is displayed.
5. A `Go to Login` button is visible.

### Output to Record

- hotel name submitted
- contact email submitted
- screenshot of success screen

## Scenario 2: System Admin Creates a New User

### Objective

Verify that a system administrator can create a new user from the user management screen.

### Entry Screen

- URL path: `/system/users`
- Page heading: `User Management`

### Preconditions

- System admin credentials are available.
- Tester is logged in as system admin.

### Test Data

| Field | Value |
|---|---|
| First Name | Playwright |
| Last Name | Admin QA |
| Email | playwright.admin.qa@example.com |
| Password | SecurePass123! |
| Phone | 0911445566 |
| Role | ADMIN |

### Steps

1. Log in as system admin.
2. Navigate to `/system/users`.
3. Confirm the heading `User Management` is visible.
4. Click `Add User`.
5. Confirm a dialog titled `Add New User` opens.
6. Fill `First Name` with `Playwright`.
7. Fill `Last Name` with `Admin QA`.
8. Fill `Email` with `playwright.admin.qa@example.com`.
9. Fill `Password` with `SecurePass123!`.
10. Fill `Phone` with `0911445566`.
11. Select the role `ADMIN`.
12. Click `Create User`.
13. Use the `Search` field to search for `playwright.admin.qa@example.com`.

### Expected Result

1. The create-user dialog closes.
2. A row appears for the new user.
3. The row contains the full name `Playwright Admin QA`.
4. The role `ADMIN` is shown.

### Output to Record

- created user email
- screenshot of the created user row

## Scenario 3: System Admin Approves a Pending Hotel Registration

### Objective

Verify that a system administrator can review and approve a hotel registration.

### Entry Screen

- URL path: `/system/hotels`

### Preconditions

- Scenario 1 completed successfully, or a pending registration already exists.
- Tester is logged in as system admin.

### Test Data

| Field | Value |
|---|---|
| Hotel Name | Grand Palace Hotel QA |
| Approval Comments | Approved during manual QA verification |

### Steps

1. Navigate to `/system/hotels`.
2. Open the registrations tab if it is not already selected.
3. Find the row for `Grand Palace Hotel QA`.
4. Click `Review` on that row.
5. Confirm the dialog heading `Review Hotel Registration` is visible.
6. Review the submitted hotel details.
7. Click `Next` if needed until the `Approve` button is visible.
8. Click `Approve`.
9. Confirm the approval dialog heading `Approve Hotel Registration` is visible.
10. Enter `Approved during manual QA verification` in `Approval Comments (Optional)`.
11. Click `Approve Registration`.

### Expected Result

1. A success alert is displayed showing that the hotel registration was approved successfully.
2. The registration row now displays status `APPROVED`.
3. The hotel is eligible to appear in downstream hotel-admin and public-search flows.

### Output to Record

- hotel name approved
- approval comments used
- screenshot of status `APPROVED`

## Scenario 4: Hotel Admin Reviews Dashboard and Room Data

### Objective

Verify that a hotel admin can see hotel metrics and room inventory after approval.

### Entry Screen

- URL path: `/hotel-admin/dashboard`

### Preconditions

- Approved hotel exists.
- Hotel admin account exists and is active.

### Steps

1. Log in as hotel admin.
2. Navigate to `/hotel-admin/dashboard`.
3. Confirm the dashboard loads without an access error.
4. Review the hotel summary cards for room and booking information.
5. Confirm the hotel identity block shows the correct hotel name.
6. Navigate to the room management page from the hotel admin navigation.
7. Confirm the room list includes room `101` and room `401` if these were created.
8. Confirm available and occupied room statuses appear correctly.

### Expected Result

1. The dashboard loads successfully.
2. The hotel name shown matches the approved hotel.
3. Room records display room number, type, price, and status.
4. No system-admin-only controls are shown.

### Output to Record

- screenshot of dashboard summary
- screenshot of room list

## Scenario 5: Hotel Admin Verifies or Creates Front Desk Staff

### Objective

Verify that a hotel admin can manage staff records needed for front desk operations.

### Preconditions

- Hotel admin is logged in.
- Approved hotel exists.

### Test Data

| Field | Value |
|---|---|
| First Name | Front |
| Last Name | Desk QA |
| Email | frontdesk.playwright@example.com |
| Phone | 0911001100 |
| Role | FRONTDESK |

### Steps

1. From hotel admin navigation, open the staff management area.
2. Search for `frontdesk.playwright@example.com`.
3. If the user already exists, confirm the role includes `FRONTDESK` and skip to the next scenario.
4. If the user does not exist, click the add-staff action.
5. Enter the data from the table above.
6. Save the new staff member.
7. Search again for `frontdesk.playwright@example.com`.

### Expected Result

1. The front desk user exists in the staff list.
2. The user is active.
3. The user belongs only to the current hotel.

### Output to Record

- staff email used
- screenshot of staff list row

## Scenario 6: Guest Completes a Booking as a Guest User

### Objective

Verify that a non-logged-in user can search hotels and complete a booking as a guest.

### Entry Screens

- Search route: `/` or `/hotels/search`
- Booking route: `/booking`

### Preconditions

- At least one approved public hotel exists in Addis Ababa.
- At least one room type is available for the selected date range.
- Tester is logged out.

### Test Data

| Field | Value |
|---|---|
| Destination | Addis Ababa |
| Guests | 2 |
| Check-in | A future date at least 7 days from today |
| Check-out | Two nights after check-in |
| Hotel to select | Grand Palace Hotel QA or another approved Addis hotel |
| Room type | Deluxe Suite |
| First Name | Lookup |
| Last Name | Guest |
| Email | lookup.guest@example.com |
| Phone | 0911998877 |
| Payment Method | Pay at Front Desk |

### Steps

1. Open the home page.
2. Enter `Addis Ababa` in `Destination`.
3. Enter `2` in `Guests`.
4. Select a valid future `Check-in` date.
5. Select a valid future `Check-out` date two nights later.
6. Click `Search Hotels`.
7. Confirm the app navigates to hotel search results.
8. Confirm at least one hotel result is shown.
9. Open the target hotel by clicking `View Hotel` or `Show All Rooms`.
10. Select the room type `Deluxe Suite`.
11. Click `Book as Guest`.
12. Confirm the booking page opens.
13. Fill `First Name` with `Lookup`.
14. Fill `Last Name` with `Guest`.
15. Fill `Email Address` with `lookup.guest@example.com`.
16. Fill `Phone Number` with `0911998877`.
17. Select `Pay at Front Desk`.
18. Click the booking confirmation button showing the total amount.

### Expected Result

1. The system navigates to a booking confirmation page.
2. The heading `Booking Confirmed!` is visible.
3. A confirmation number is displayed.
4. Hotel name, room type, date range, guest details, and total amount are visible.

### Output to Record

- confirmation number
- hotel name used
- total amount shown
- screenshot of confirmation page

## Scenario 7: Registered Customer Completes a Booking

### Objective

Verify that a signed-in customer can complete a booking.

### Preconditions

- Registered customer account exists.
- A hotel with availability exists.

### Test Data

| Field | Value |
|---|---|
| Customer Email | registered.customer@example.com |
| Destination | Addis Ababa |
| Guests | 2 |
| Room Type | Executive Room or Deluxe Suite |
| Payment Method | Pay at Front Desk |

### Steps

1. Log in as the registered customer.
2. Open the hotel search page.
3. Search with a future date range and `2` guests.
4. Open a hotel with available room types.
5. Click `Book Now` or the signed-in booking action for the chosen room type.
6. Confirm the booking page pre-fills customer information if supported.
7. Review guest details and room summary.
8. Select `Pay at Front Desk`.
9. Complete the booking.

### Expected Result

1. A booking confirmation page appears.
2. A confirmation number is displayed.
3. The booking is linked to the signed-in customer.

### Output to Record

- confirmation number
- screenshot of confirmation page

## Scenario 8: Guest Finds a Booking by Reference

### Objective

Verify that a guest can find an existing booking using the booking reference and email address.

### Entry Screen

- URL path: `/find-booking`

### Preconditions

- Scenario 6 created a booking.
- Tester recorded the guest confirmation number.

### Test Data

| Field | Value |
|---|---|
| Reference Number | Confirmation number from Scenario 6 |
| Email Address | lookup.guest@example.com |

### Steps

1. Open `/find-booking`.
2. Confirm the page is visible.
3. Enter the confirmation number from Scenario 6 in `Reference Number`.
4. Enter `lookup.guest@example.com` in `Email Address`.
5. Click `Find Booking`.
6. Review the returned booking summary.
7. Click `Manage Booking`.

### Expected Result

1. The matching booking is returned.
2. The hotel name, guest name, and confirmation number are visible.
3. The app opens the guest booking management screen.
4. `Modify Booking` and `Cancel Booking` actions are visible.

### Output to Record

- screenshot of lookup result
- screenshot of booking management page

## Scenario 9: Guest Modifies a Booking

### Objective

Verify that a guest can modify an existing booking from the booking management screen.

### Preconditions

- A future booking exists and is eligible for modification.
- Tester is on the guest booking management screen.

### Test Data

| Field | Value |
|---|---|
| New Guest Name | Updated Guest |
| Reason for Modification | Guest corrected their name |

### Steps

1. On the booking management screen, click `Modify Booking`.
2. Confirm a dialog titled `Modify Your Booking` opens.
3. Change `Guest Name` to `Updated Guest`.
4. Enter `Guest corrected their name` in `Reason for Modification`.
5. Click `Modify Booking` inside the dialog.

### Expected Result

1. A success message appears stating that the booking was modified successfully.
2. The booking management screen refreshes.
3. The guest name shown on the page is now `Updated Guest`.
4. The modify dialog closes.

### Output to Record

- updated guest name shown on page
- screenshot of success state

## Scenario 10: Guest Cancels a Booking

### Objective

Verify that a guest can cancel an eligible future booking.

### Preconditions

- A future booking exists and is eligible for cancellation.
- Tester is on the booking management screen for that booking.

### Test Data

| Field | Value |
|---|---|
| Reason for Cancellation | Travel plans changed |

### Steps

1. Click `Cancel Booking`.
2. Confirm a dialog titled `Cancel Your Booking` opens.
3. Enter `Travel plans changed` in `Reason for Cancellation`.
4. Click `Cancel Booking` inside the dialog.

### Expected Result

1. A success message appears stating that the booking was cancelled successfully.
2. A heading `Booking Cancelled` is visible.
3. The booking status is clearly shown as cancelled.
4. `Make New Booking` and `Find Another Booking` actions are visible.

### Output to Record

- screenshot of cancelled state

## Scenario 11: Front Desk Searches for an Existing Booking

### Objective

Verify that front desk staff can search bookings by confirmation number.

### Entry Screen

- URL path: `/frontdesk/dashboard`

### Preconditions

- Front desk account exists.
- A booking exists from Scenario 6 or Scenario 7.

### Test Data

| Field | Value |
|---|---|
| Search Bookings | Confirmation number from Scenario 6 or 7 |

### Steps

1. Log in as front desk staff.
2. Open `/frontdesk/dashboard`.
3. Confirm the dashboard is visible and the role indicator shows front desk access.
4. Locate the `Search Bookings` field.
5. Enter the confirmation number created earlier.

### Expected Result

1. The booking table refreshes.
2. The matching booking remains visible.
3. Other unrelated bookings are filtered out.
4. The row displays the confirmation number, guest name, and room or room type summary.

### Output to Record

- screenshot of filtered booking row

## Scenario 12: Front Desk Assigns a Room and Checks In a Guest

### Objective

Verify that front desk staff can assign an available room and check in a booked guest.

### Preconditions

- Front desk is logged in.
- A booking exists with status `BOOKED` and no assigned room.
- At least one available room of the correct type exists.

### Test Data

| Field | Value |
|---|---|
| Guest Name | Check In Guest |
| Booking Status Before Test | BOOKED |
| Room to Assign | Room 401 |
| Room Type | Deluxe Room |
| Price Per Night | ETB 2,700 |

### Steps

1. Open the front desk dashboard.
2. Find the booking for `Check In Guest`.
3. Open the check-in action from the booking row.
4. Confirm the dialog title includes `Check-in Guest`.
5. Confirm the screen shows that no room is assigned yet.
6. In the `Room Assignment` section, select `Room 401`.
7. Confirm the selected room card shows the correct room type and nightly price.
8. Confirm a positive readiness message appears indicating the room is assigned and ready for check-in.
9. Click `Check In Guest`.

### Expected Result

1. A success message confirms the guest was checked in to room `401`.
2. The dialog closes.
3. The booking row now shows room `401` and a checked-in status.
4. The room is no longer available for a conflicting booking.

### Output to Record

- assigned room number
- screenshot of success toast or success state
- screenshot of updated booking row

## Scenario 13: Front Desk Checks Out a Guest and Reviews the Final Receipt

### Objective

Verify that front desk staff can check out a guest and see a generated receipt.

### Preconditions

- Front desk is logged in.
- A booking exists with status `CHECKED_IN`.
- The booking has a room assigned.

### Test Data

| Field | Value |
|---|---|
| Guest Name | Checkout Guest |
| Room Number | 401 |
| Room Type | Deluxe Room |
| Number of Nights | 2 |
| Room Charge Per Night | ETB 2,700 |
| Expected Total | ETB 5,400 |

### Steps

1. On the front desk dashboard, locate the `Checkout Guest` booking.
2. Open the checkout action from the booking row.
3. Confirm the dialog title `Confirm Guest Checkout` is shown.
4. Confirm the message states that checkout will generate a final receipt.
5. Click `Check Out`.
6. Wait for the receipt dialog to appear.
7. Confirm the receipt displays:
   - guest name
   - room number and room type
   - total amount
   - receipt number
8. Confirm the `TOTAL AMOUNT` matches ETB 5,400 if the nightly rate and nights match the test data.
9. Click `Close`.

### Expected Result

1. The booking status changes to `CHECKED OUT`.
2. A receipt is displayed with a receipt number.
3. Room and guest details match the checked-out booking.
4. The total amount is mathematically correct.

### Output to Record

- receipt number
- screenshot of receipt
- screenshot of updated booking row

## Scenario 14: Front Desk Creates a Walk-in Booking

### Objective

Verify that front desk staff can create a booking for a guest arriving without a prior reservation.

### Preconditions

- Front desk is logged in.
- At least one available room exists.

### Test Data

| Field | Value |
|---|---|
| First Name | Walk |
| Last Name | In Guest |
| Email | walkin.guest@example.com |
| Phone | 0911778899 |
| Room | 101 |
| Room Type | Deluxe Suite |

### Steps

1. Open `/frontdesk/dashboard`.
2. Click `Walk-in Guest`.
3. Confirm the heading `Walk-in Guest Booking` is visible.
4. Fill `First Name` with `Walk`.
5. Fill `Last Name` with `In Guest`.
6. Fill `Email` with `walkin.guest@example.com`.
7. Fill `Phone` with `0911778899`.
8. Click `Next`.
9. In the room selection step, select `Room 101`.
10. Click `Next`.
11. Review the summary and confirm guest name and room data are correct.
12. Click `Confirm`.

### Expected Result

1. A success message confirms the walk-in booking was created.
2. A confirmation number is shown.
3. The booking appears in front desk booking management.

### Output to Record

- walk-in confirmation number
- screenshot of success message

## Scenario 15: Access Control and Cross-Role Verification

### Objective

Verify that each role sees only its permitted features.

### Preconditions

- System admin, hotel admin, front desk, and customer accounts are available.

### Steps

1. Log in as hotel admin and confirm system-admin-only pages are not available for normal use.
2. Log in as front desk and confirm hotel setup or system user creation actions are not available.
3. Log in as registered customer and confirm staff and admin menus are not available.
4. Log out and confirm guest users cannot access protected dashboard routes directly.
5. As system admin, confirm full system administration pages are accessible.

### Expected Result

1. Hotel admin cannot perform system-wide user management.
2. Front desk cannot edit hotel-wide setup or system settings.
3. Customer cannot access staff or admin dashboards.
4. Guests are redirected away from protected routes.
5. System admin can access system management features successfully.

### Output to Record

- screenshots of blocked or hidden access points for each role

## Data Validation Checks to Perform During Each Scenario

Perform these checks whenever the related values are visible:

1. Confirm the number of nights equals the difference between check-in and check-out dates.
2. Confirm the booking subtotal equals nightly rate multiplied by number of nights.
3. Confirm taxes and fees match the configured hotel values when shown.
4. Confirm the final total equals subtotal plus taxes and fees minus discounts if any are displayed.
5. Confirm currency formatting consistently uses ETB and readable thousands separators.
6. Confirm cancelled bookings no longer appear as active future stays.
7. Confirm checked-in rooms cannot be assigned again for the same stay period.

## Negative Checks

Run these short negative checks after the main happy-path flows:

### Negative Check 1: Past Date Search

1. Open the hotel search page.
2. Select a check-in date in the past.
3. Try to continue.

Expected result:

- the system blocks the invalid date range and shows a validation message

### Negative Check 2: Check-out Before Check-in

1. Open any booking form.
2. Set the check-out date earlier than the check-in date.

Expected result:

- the system prevents the invalid date combination

### Negative Check 3: Duplicate Room Sale Risk

1. Book or check in the last available room for a date range.
2. Attempt to create another booking for the same room and date range.

Expected result:

- the second action is blocked due to no availability

## Sign-off Checklist

Mark each line when complete:

- public hotel registration works
- system admin can create users
- system admin can approve hotel registrations
- approved hotel can be managed by hotel admin
- room inventory is visible and usable
- guest booking works
- registered customer booking works
- booking lookup works
- booking modification works
- booking cancellation works
- front desk booking search works
- front desk room assignment and check-in work
- front desk checkout and receipt generation work
- front desk walk-in booking works
- role-based access restrictions work
- totals, dates, and currency values are correct

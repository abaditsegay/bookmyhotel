# BookMyHotel Manual Smoke Test Checklist

## Purpose

This checklist is a condensed manual smoke test for quick post-deployment verification.

Use it when QA needs to confirm that the most important guest, admin, and front-desk journeys still work before a broader regression cycle begins.

## When To Use This Checklist

Run this checklist:

- after a deployment to staging or production-like environments
- after major frontend or backend changes
- before handing a build to business testers
- before starting a full regression cycle

## Estimated Execution Time

- 20 to 35 minutes if test data already exists
- 35 to 50 minutes if key bookings need to be created during execution

## Minimum Test Data Required

Before starting, confirm the environment has:

- one approved and publicly visible hotel in Addis Ababa
- one hotel admin account
- one front desk account
- one registered customer account
- at least one available room for future dates
- one booking that can be used for lookup
- one booking that can be used for check-in or checkout, if available

If reusable bookings do not exist, create them during the smoke run and record the confirmation numbers.

## Tester Details

- Tester Name:
- Test Date:
- Environment:
- Build or Release Version:

## Smoke Pass Criteria

The smoke test passes only if all critical items below pass:

- public hotel search works
- guest booking works
- booking lookup works
- hotel admin access works
- front desk dashboard loads
- front desk check-in or walk-in flow works
- no blocker or critical defect is found

## Smoke Scenarios

| Smoke ID | Area | Role | What To Verify | Expected Result | Status | Notes |
|---|---|---|---|---|---|---|
| SMK-01 | Public search | Guest | Search Addis Ababa for a valid future 2-night stay | Search results load and at least one hotel appears |  |  |
| SMK-02 | Hotel details | Guest | Open a hotel from search results and review room options | Hotel details, room types, and prices are visible |  |  |
| SMK-03 | Guest booking | Guest | Complete a booking as guest using Pay at Front Desk | Booking confirmation page appears with confirmation number |  |  |
| SMK-04 | Booking lookup | Guest | Find the new booking using confirmation number and email | Correct booking is returned and Manage Booking opens |  |  |
| SMK-05 | System admin access | System Admin | Open system user management or hotel management | Protected system-admin screen loads successfully |  |  |
| SMK-06 | Hotel admin access | Hotel Admin | Open hotel-admin dashboard and room list | Dashboard and room data load successfully |  |  |
| SMK-07 | Front desk dashboard | Front Desk | Open the front desk dashboard | Dashboard loads with booking list and actions |  |  |
| SMK-08 | Front desk booking search | Front Desk | Search by a known confirmation number | Matching booking row is returned |  |  |
| SMK-09 | Front desk check-in | Front Desk | Assign a room and check in a BOOKED guest if one exists | Guest is checked in and assigned room is recorded |  |  |
| SMK-10 | Front desk checkout | Front Desk | Check out a CHECKED_IN guest if one exists | Checkout completes and receipt is shown |  |  |
| SMK-11 | Walk-in fallback | Front Desk | If no check-in candidate exists, create a walk-in booking | Walk-in booking is created with confirmation number |  |  |
| SMK-12 | Access control | Multiple roles | Verify customer and front desk cannot access admin-only functions | Restricted screens are blocked or hidden |  |  |

## Suggested Fast Execution Order

1. Run guest search and booking first so you generate a fresh confirmation number.
2. Reuse that confirmation number for booking lookup.
3. Log in as hotel admin and confirm dashboard access.
4. Log in as system admin and confirm management access.
5. Log in as front desk and confirm dashboard, booking search, and either check-in, checkout, or walk-in.
6. Finish with a quick role-access boundary check.

## Quick Data Set

Use these values when new data is needed:

| Field | Value |
|---|---|
| Destination | Addis Ababa |
| Guests | 2 |
| Guest First Name | Smoke |
| Guest Last Name | Tester |
| Guest Email | smoke.tester@example.com |
| Guest Phone | 0911990000 |
| Room to Prefer | Deluxe Suite or any available room type |
| Payment Method | Pay at Front Desk |

## Blocker Guidance

Raise the build as failed immediately if any of the following occurs:

- homepage or hotel search does not load
- no hotel details page can be opened
- booking cannot be completed
- booking lookup fails for a newly created booking
- admin or front desk dashboards fail to load
- check-in, checkout, or walk-in actions fail with an unhandled error
- unauthorized roles can access protected management pages

## Sign-Off

- Smoke Test Result: Pass / Fail
- Blocking Defects Found:
- Recommended Next Step: Full Regression / Fix Required / Safe For UAT

# BookMyHotel UAT Sign-Off Checklist

## Purpose

This is a condensed sign-off checklist for business testers after execution of the detailed manual functional test plan.

## Tester Details

- Tester Name:
- Test Environment:
- Test Date:
- Build Version:
- Hotel / Tenant Tested:

## A. Tenant / Hotel Admin Sign-Off

- [ ] Hotel registration approval works correctly
- [ ] Hotel registration rejection works correctly
- [ ] Hotel onboarding can be completed successfully
- [ ] Rooms can be created and saved
- [ ] Pricing and taxes can be configured and saved
- [ ] Front desk staff can be created by hotel admin
- [ ] Approved hotels appear in public search when expected
- [ ] Hotel admin cannot access system admin-only functions

## B. Customer / Guest Sign-Off

- [ ] Customer registration works correctly
- [ ] Customer login works correctly
- [ ] Hotel search returns correct hotels for valid dates
- [ ] Hotel details and room options are shown correctly
- [ ] Registered customer booking works end-to-end
- [ ] Guest booking works end-to-end
- [ ] Booking confirmation is shown clearly
- [ ] Booking lookup works using booking reference
- [ ] Booking modification works when allowed
- [ ] Booking cancellation works when allowed
- [ ] Customer receives confirmation through enabled channels
- [ ] Customer cannot access admin or staff features

## C. Front Desk Sign-Off

- [ ] Front desk login works correctly
- [ ] Walk-in booking works correctly
- [ ] Front desk can search existing bookings
- [ ] Check-in works and room assignment is recorded
- [ ] Room charges can be added correctly
- [ ] Checkout works correctly
- [ ] Receipt can be generated correctly
- [ ] Pay-at-desk settlement works correctly
- [ ] Front desk can modify or cancel bookings when allowed
- [ ] Front desk cannot access hotel setup functions

## D. Inventory And Availability Sign-Off

- [ ] Booking reduces availability correctly
- [ ] Check-in updates room status correctly
- [ ] Checkout updates room status correctly
- [ ] Tenant or hotel data is isolated correctly between hotels
- [ ] Booking changes are reflected across user roles correctly

## E. Edge Case Sign-Off

- [ ] Past-date booking is blocked
- [ ] Checkout before check-in is blocked
- [ ] Payment failure is handled correctly
- [ ] Double booking of the same room is prevented
- [ ] Overbooking is prevented when inventory is exhausted
- [ ] Concurrent attempts for the last room do not create duplicate bookings
- [ ] Cancellation timing rules are applied correctly

## F. Data Validation Sign-Off

- [ ] Nightly subtotal calculations are correct
- [ ] Taxes and fees are added correctly
- [ ] Discounts are applied correctly when enabled
- [ ] Refund amounts are correct when applicable
- [ ] Stay duration and date logic are correct
- [ ] Currency formatting is clear and consistent

## G. Final UAT Decision

- [ ] Ready for release
- [ ] Ready for release with minor known issues
- [ ] Not ready for release

## H. Open Defects And Notes

| Defect ID | Summary | Severity | Blocking Release? | Notes |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

## I. Sign-Off

- QA Lead:
- Business Owner:
- Product Owner:
- Approval Date:

# Hotel Admin Functional Test Plan

## Scope

This document contains manual functional test cases for system admin approval work that leads into hotel administration, plus hotel admin setup and control activities.

## Included Areas

- Hotel registration approval and rejection
- Hotel onboarding and setup
- Room setup
- Pricing and tax configuration
- Front desk user creation
- Public visibility of approved hotels
- Role-based access boundaries

| Test Case ID | Title | Preconditions | Steps | Expected Result | Pass/Fail |
|---|---|---|---|---|---|
| ADM-01 | Approve hotel registration | A hotel registration request exists in pending status | 1. Log in as system admin. 2. Open hotel registration requests. 3. Select a pending request. 4. Approve it. | The hotel registration is approved and the hotel can proceed to setup. |  |
| ADM-02 | Reject hotel registration | A hotel registration request exists in pending status | 1. Log in as system admin. 2. Open hotel registration requests. 3. Select a pending request. 4. Reject it with a reason. | The hotel registration is rejected and the rejection status is visible. |  |
| ADM-03 | Complete hotel onboarding | The hotel has been approved and hotel admin credentials exist | 1. Log in as hotel admin. 2. Open hotel setup or onboarding. 3. Enter hotel details. 4. Save changes. | The hotel profile is saved and visible in the hotel admin area. |  |
| ADM-04 | Create room inventory manually | Hotel admin is logged in | 1. Open room management. 2. Add several rooms with different room types. 3. Enter room number, room type, price, and capacity. 4. Save each room. | All new rooms appear correctly in the room list. |  |
| ADM-05 | Configure room pricing and taxes | At least one room type exists | 1. Open pricing configuration. 2. Set room prices. 3. Set tax values. 4. Save. 5. Reopen the page. | Pricing and tax settings are saved correctly and remain visible. |  |
| ADM-06 | Create front desk staff account | Hotel admin is logged in | 1. Open staff management. 2. Add a new staff user. 3. Assign the front desk role. 4. Save. | The front desk account is created and available for login. |  |
| ADM-07 | Confirm hotel appears in public search | Hotel is approved, public, and has available rooms | 1. Open the public hotel search. 2. Search by city and future dates. | The hotel appears in the search results with room availability. |  |
| ADM-08 | Restrict hotel admin from system admin actions | Hotel admin is logged in | 1. Try to open system admin-only pages or actions. | Access is blocked or the options are not shown. |  |

## Role-Specific Validation Points

- Hotel admin can manage only one hotel or tenant scope assigned to them.
- Hotel admin can create and manage staff for their hotel only.
- Hotel admin can change room setup and pricing, but cannot perform system-wide administration.
- Approved hotel configuration must become visible in public search only after setup is complete and public visibility is enabled.
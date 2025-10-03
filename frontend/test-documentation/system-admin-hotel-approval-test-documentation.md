# System Admin Hotel Approval Test Documentation

**Test File:** `system-admin-hotel-approval.spec.ts`  
**Date Generated:** October 1, 2025  
**Test Environment:** Chromium Browser  
**Status:** ⚠️ ISSUES IDENTIFIED (Requires Investigation)  

## Overview

The System Admin Hotel Approval test suite validates the workflow for system administrators to review and approve hotel registrations. This test covers authentication, navigation to pending approvals, and the hotel approval process.

## Test Results Summary

- **Total Tests:** 1  
- **Passed:** 0  
- **Failed:** 1  
- **Success Rate:** 0%  
- **Primary Issue:** Approval buttons not rendering despite data presence  

## Test Cases

### 1. Hotel Approval Workflow

**Test Name:** `should allow system admin to approve hotel registrations`  
**Description:** End-to-end test for reviewing and approving pending hotel registrations.

**Steps Performed:**

1. **Navigate to Login Page**
   - Access the application homepage
   - Click on the login button
   - Verify login form is displayed

2. **System Admin Authentication**
   - Enter username: `admin`
   - Enter password: `admin123`
   - Submit login form
   - ✅ **Result:** Authentication successful

3. **Access System Admin Dashboard**
   - Navigate to system admin area
   - Verify admin dashboard loads
   - ✅ **Result:** Dashboard accessible

4. **Navigate to Hotel Approvals**
   - Click on "Hotel Approvals" or similar option
   - Verify hotel approval page loads
   - ✅ **Result:** Page navigation successful

5. **View Pending Hotels**
   - Check for list of pending hotel registrations
   - ✅ **Result:** Test data visible (Paradise Resort for Approval)

6. **Attempt Hotel Approval**
   - Look for approve/reject buttons
   - ❌ **ISSUE:** Approval buttons not rendering
   - ❌ **ISSUE:** Cannot complete approval workflow

**Expected Results:**

- Successful navigation to hotel approval interface
- Display of pending hotel registrations
- Functional approve/reject buttons for each hotel
- Ability to complete approval process

**Actual Results:** ❌ FAILED

- ✅ Authentication works correctly
- ✅ Navigation to approval page successful
- ✅ Hotel data is present in system
- ❌ Approval action buttons not rendering
- ❌ Cannot interact with approval workflow

## Issue Analysis

### Root Cause Investigation

**Primary Issue:** Approval buttons not rendering in the UI despite:
- ✅ Database contains test data
- ✅ Backend API likely functional
- ✅ Frontend routing working
- ✅ Authentication and permissions working

**Possible Causes:**

1. **Frontend State Management Issue**
   - React component not receiving approval data
   - State update not triggering button render
   - API response not properly handled

2. **CSS/Styling Issue**
   - Buttons rendered but hidden by CSS
   - z-index conflicts
   - Display: none applied incorrectly

3. **Conditional Rendering Logic**
   - Permission check failing
   - Status-based rendering logic incorrect
   - Component lifecycle issue

4. **API Integration Issue**
   - Frontend expecting different data format
   - API endpoint not returning approval actions
   - Status field mismatch

### Database Verification

**Test Data Present:**
```sql
-- Confirmed in hotel_registrations table
SELECT id, hotel_name, status, city, contact_email 
FROM hotel_registrations 
WHERE status = 'PENDING';

-- Result: Paradise Resort for Approval exists with PENDING status
```

### Frontend Investigation Needed

**Components to Check:**
- Hotel approval list component
- Button rendering logic
- Permission validation
- API response handling

## Test Assets

### Screenshots

- `test-results/system-admin-hotel-approval-*-chromium/test-failed-*.png`: Failure state screenshots
- Shows the page state where buttons should appear but don't

### Videos

- `test-results/system-admin-hotel-approval-*-chromium/video.webm`: Complete workflow recording
- Documents the navigation success and button rendering failure

### Traces

- `test-results/system-admin-hotel-approval-*-chromium/trace.zip`: Interactive debugging trace
- **View with:** `npx playwright show-trace [trace-file-path]`
- Contains network requests, DOM state, and error conditions

## Technical Debugging Information

### Browser Configuration

- **Browser:** Chromium (Desktop Chrome profile)
- **Viewport:** 1280x720 (default desktop)
- **User Agent:** Chrome/latest
- **Network:** Simulated fast 3G

### Network Analysis Required

**API Endpoints to Verify:**
- `GET /api/hotel-registrations/pending` - Should return pending hotels
- `POST /api/hotel-registrations/{id}/approve` - Approval endpoint
- `POST /api/hotel-registrations/{id}/reject` - Rejection endpoint

### Frontend Debug Points

**Component Investigation:**
```javascript
// Check if data is loading
console.log('Pending hotels data:', pendingHotels);

// Verify button rendering conditions
console.log('User permissions:', userPermissions);
console.log('Should show buttons:', shouldShowApprovalButtons);

// Check component state
console.log('Component state:', componentState);
```

## Recommended Fix Strategy

### Phase 1: Data Flow Verification

1. **Check API Response**
   ```bash
   # Test backend endpoint directly
   curl -H "Authorization: Bearer <token>" \
        http://localhost:8080/api/hotel-registrations/pending
   ```

2. **Verify Frontend Network Calls**
   - Open browser dev tools
   - Check Network tab during test
   - Verify API calls are made and successful

### Phase 2: Component Investigation

1. **Add Debug Logging**
   ```javascript
   // In hotel approval component
   useEffect(() => {
     console.log('Hotels loaded:', hotels);
     console.log('User role:', userRole);
   }, [hotels, userRole]);
   ```

2. **Check Conditional Rendering**
   ```javascript
   // Verify button render conditions
   const shouldShowButtons = hotel.status === 'PENDING' && 
                            userRole === 'SYSTEM_ADMIN';
   ```

### Phase 3: UI/UX Verification

1. **CSS Investigation**
   ```css
   /* Check for hidden buttons */
   .approval-buttons {
     display: block !important;
     visibility: visible !important;
   }
   ```

2. **Component Structure Validation**
   - Verify button elements exist in DOM
   - Check for JavaScript errors
   - Validate event handlers attached

## Test Data Requirements

### Database Setup

```sql
-- Ensure test hotel exists
INSERT INTO hotel_registrations (
  hotel_name, status, contact_email, city, country,
  phone, description, amenities
) VALUES (
  'Paradise Resort for Approval', 'PENDING', 
  'test@paradise.com', 'Test City', 'Test Country',
  '+1234567890', 'Test hotel for approval workflow',
  'Pool, WiFi, Restaurant'
);
```

### API Endpoint Verification

**Required Endpoints:**
- `GET /api/hotel-registrations/pending`
- `PUT /api/hotel-registrations/{id}/approve`
- `PUT /api/hotel-registrations/{id}/reject`

## Usage Instructions

### Running This Test

```bash
# Run hotel approval test with debug info
npx playwright test system-admin-hotel-approval.spec.ts --project=chromium --trace=on

# Run with headed browser for visual debugging
npx playwright test system-admin-hotel-approval.spec.ts --headed

# Run with extended timeout
npx playwright test system-admin-hotel-approval.spec.ts --timeout=60000
```

### Debugging Commands

```bash
# View interactive trace
npx playwright show-trace test-results/system-admin-hotel-approval-*/trace.zip

# Check test data
mysql -u root -p bookmyhotel -e "SELECT * FROM hotel_registrations WHERE status='PENDING';"

# Test backend API directly
curl -X GET http://localhost:8080/api/hotel-registrations/pending \
     -H "Content-Type: application/json"
```

## Related Issues

### Known Dependencies

- Database: hotel_registrations table with PENDING records
- Backend: Hotel approval API endpoints
- Frontend: Hotel approval component and routing
- Authentication: System admin permissions

### Potential Related Bugs

- User permission validation
- API response format changes
- Frontend component lifecycle issues
- CSS conflicts or styling problems

## Next Steps

### Immediate Actions Required

1. **Backend API Testing**
   - Verify hotel-registrations endpoints
   - Test with Postman or curl
   - Check response format

2. **Frontend Debugging**
   - Add console logging to components
   - Check browser dev tools for errors
   - Verify component rendering logic

3. **Database Validation**
   - Confirm test data exists
   - Verify table structure
   - Check foreign key relationships

4. **Integration Testing**
   - Test API calls from frontend
   - Verify authentication headers
   - Check CORS configuration

### Success Criteria

- [ ] Pending hotels display correctly
- [ ] Approve/Reject buttons render
- [ ] Button clicks trigger API calls
- [ ] Hotel status updates after approval
- [ ] UI reflects status changes
- [ ] Error handling works correctly

---

**Documentation Generated:** October 1, 2025  
**Issue Status:** Under Investigation  
**Priority:** High (Core admin functionality)  
**Next Review:** After debugging completion  
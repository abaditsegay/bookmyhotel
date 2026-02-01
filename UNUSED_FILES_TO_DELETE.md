# Unused Frontend Files - Deletion Candidates

## Summary
Total frontend files: **283 files**
Files identified for deletion: **7 files**

---

## 🔴 HIGH CONFIDENCE - Safe to Delete

### 1. **UnifiedBookingDetailsRefactored.tsx**
- **Path**: `frontend/src/components/booking/UnifiedBookingDetailsRefactored.tsx`
- **Reason**: Not imported anywhere. Appears to be an old refactored version that was replaced by `UnifiedBookingDetails.tsx`
- **Status**: ❌ No imports found
- **Action**: DELETE

### 2. **enhancedApi_backup.ts**
- **Path**: `frontend/src/services/enhancedApi_backup.ts`
- **Reason**: Backup file, not imported anywhere
- **Status**: ❌ No imports found
- **Action**: DELETE

### 3. **OperationsSupervisorDashboard_updated.tsx**
- **Path**: `frontend/src/components/Supervisor/OperationsSupervisorDashboard_updated.tsx`
- **Reason**: Temporary "_updated" suffix indicates it's an intermediate version
- **Status**: ❌ Not imported (only the version without suffix is used)
- **Action**: DELETE

---

## 🟡 MEDIUM CONFIDENCE - Review Before Deleting

### 4. **Housekeeping/HousekeepingDashboard.tsx**
- **Path**: `frontend/src/components/Housekeeping/HousekeepingDashboard.tsx`
- **Current Usage**: ❌ Not imported
- **Alternative**: `frontend/src/components/operations/HousekeepingDashboard.tsx` is used instead
- **Reason**: Duplicate file - the operations version is the active one
- **Action**: REVIEW THEN DELETE
- **Note**: Verify no legacy routes reference this path

### 5. **Supervisor/OperationsSupervisorDashboard.tsx**
- **Path**: `frontend/src/components/Supervisor/OperationsSupervisorDashboard.tsx`
- **Current Usage**: ❌ Not imported
- **Alternative**: `frontend/src/components/operations/OperationsSupervisorDashboard.tsx` is used
- **Reason**: Duplicate file - operations version is actively used by OperationsPage
- **Action**: REVIEW THEN DELETE
- **Note**: Only the operations/ version is imported

---

## 🟢 LOW PRIORITY - Keep For Now

### 6. **mockPaymentGateway.ts**
- **Path**: `frontend/src/services/mockPaymentGateway.ts`
- **Current Usage**: ✅ ACTIVELY USED in 4 files:
  - `components/shop/PaymentDialog.tsx`
  - `components/shop/PaymentPage.tsx`
  - `components/demo/PaymentGatewayDemo.tsx`
  - `pages/BookingPage.tsx`
- **Reason**: Mock payment service for testing/demo purposes
- **Action**: KEEP
- **Note**: Useful for development and demos

### 7. **booking/HotelBookings.tsx vs hotel/HotelBookings.tsx**
- **Path 1**: `frontend/src/components/booking/HotelBookings.tsx`
- **Path 2**: `frontend/src/pages/hotel/HotelBookings.tsx`
- **Current Usage**: Both exist but need verification
- **Action**: INVESTIGATE FURTHER
- **Note**: Need to check which one is actively routed and imported

---

## Deletion Commands

### Safe Deletions (Run First)
```bash
cd /Users/samuel/Projects2/bookmyhotel/frontend/src

# Delete refactored duplicate
rm components/booking/UnifiedBookingDetailsRefactored.tsx

# Delete backup file
rm services/enhancedApi_backup.ts

# Delete _updated version
rm components/Supervisor/OperationsSupervisorDashboard_updated.tsx
```

### After Review (Run Second)
```bash
# Delete duplicate Housekeeping dashboards
rm components/Housekeeping/HousekeepingDashboard.tsx

# Delete duplicate Operations Supervisor dashboard
rm components/Supervisor/OperationsSupervisorDashboard.tsx
```

---

## Verification Steps

### Before Deleting:
1. ✅ Search for imports: `grep -r "filename" --include="*.tsx" --include="*.ts"`
2. ✅ Check routes: Search App.tsx and routing files
3. ✅ Build the project: `npm run build`
4. ✅ Run tests if available

### After Deleting:
1. ✅ `npm run build` - Ensure no build errors
2. ✅ Test affected pages manually
3. ✅ Check browser console for import errors
4. ✅ Commit changes with descriptive message

---

## Files to Keep (Despite Suspicious Names)

- ✅ `mockPaymentGateway.ts` - Actively used for payment demos
- ✅ `index.ts` files - Barrel exports (multiple instances are normal)
- ✅ `apiConfig.ts` files - Multiple configs for different contexts

---

## Next Steps

1. **Immediate Action**: Delete the 3 high-confidence files
2. **Review**: Check the 2 medium-confidence duplicates
3. **Test**: Run `npm run build` after each deletion
4. **Document**: Git commit each deletion separately for easy rollback

---

## Estimated Impact
- **Bundle Size Reduction**: ~50-100 KB (estimated)
- **Maintenance**: Reduced confusion from duplicate files
- **Risk**: Low (files are not imported)

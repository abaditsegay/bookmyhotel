# Email Reuse Logic Review

## Current Implementation

### Location
- **File**: `backend/src/main/java/com/bookmyhotel/service/BookingService.java`
- **Methods**: 
  - `validateBookingRequestForRoomType()` (lines 564-585)
  - `validateRoomTypeBookingRequest()` (lines 695-724)
- **Repository Method**: `ReservationRepository.findActiveReservationsByGuestEmail()`

### Current Logic

The system prevents email reuse for **anonymous bookings** (guest bookings without authentication) by checking if there are any "active" reservations with the same email address.

#### What is "Active"?

```java
@Query("SELECT r FROM Reservation r " +
       "WHERE r.guestInfo.email = :email " +
       "AND r.status NOT IN ('CANCELLED', 'NO_SHOW', 'CHECKED_OUT')")
List<Reservation> findActiveReservationsByGuestEmail(@Param("email") String email);
```

**Active reservations** are those with status:
- ✅ `PENDING` - Booking created but payment pending
- ✅ `CONFIRMED` - Booking confirmed and paid
- ✅ `CHECKED_IN` - Guest currently checked in

**NOT active** (email can be reused):
- ❌ `CANCELLED` - Booking was cancelled
- ❌ `NO_SHOW` - Guest did not show up
- ❌ `CHECKED_OUT` - Guest has checked out

### Validation Code

```java
// For anonymous bookings, guest information is required
if (isAnonymousBooking) {
    if (request.getGuestName() == null || request.getGuestName().trim().isEmpty()) {
        throw new BookingException("Guest name is required for anonymous bookings");
    }
    if (request.getGuestEmail() == null || request.getGuestEmail().trim().isEmpty()) {
        throw new BookingException("Guest email is required for anonymous bookings");
    }

    // Check for email uniqueness - prevent multiple active bookings with same email
    List<Reservation> activeReservations = reservationRepository.findActiveReservationsByGuestEmail(
            request.getGuestEmail());
    if (!activeReservations.isEmpty()) {
        throw new BookingException("An active reservation already exists for this email address. " +
                "Please use a different email or contact the hotel to modify your existing booking.");
    }
}
```

---

## Analysis

### ✅ Strengths

1. **Prevents Double Bookings**: Effectively prevents guests from creating multiple concurrent bookings with the same email
2. **Clear Definition**: "Active" is well-defined (PENDING, CONFIRMED, CHECKED_IN)
3. **Allows Reuse After Completion**: Once a booking is CHECKED_OUT, CANCELLED, or NO_SHOW, the email can be reused
4. **Good Error Message**: Provides clear feedback to users about why they can't book

### ⚠️ Potential Issues

#### 1. **Authenticated Users Can Bypass This Check**

The validation only applies to `isAnonymousBooking` (when `userEmail == null`). Authenticated users can create multiple bookings without this check.

**Scenario**:
- User logs in with email `john@example.com`
- Creates Booking A (CONFIRMED) for Hotel 1
- Creates Booking B (CONFIRMED) for Hotel 2
- Both bookings coexist with same email ✅ (This is probably intentional)

**Impact**: **LOW** - Authenticated users should be able to have multiple bookings

---

#### 2. **PENDING Status Included in "Active"**

A `PENDING` booking (payment not completed) blocks the email from being reused.

**Scenario**:
- Guest creates booking with `guest@example.com`
- Payment fails or is abandoned
- Status remains `PENDING`
- Guest tries to book again → **BLOCKED**

**Impact**: **MEDIUM** - Could frustrate guests with failed payments

**Recommended Fix**:
```java
@Query("SELECT r FROM Reservation r " +
       "WHERE r.guestInfo.email = :email " +
       "AND r.status IN ('CONFIRMED', 'CHECKED_IN')")  // Only confirmed/active bookings
List<Reservation> findActiveReservationsByGuestEmail(@Param("email") String email);
```

Or add auto-cancellation for old PENDING bookings:
```java
// Cancel PENDING bookings older than 30 minutes
if (r.getStatus() == PENDING && 
    r.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(30))) {
    r.setStatus(CANCELLED);
}
```

---

#### 3. **No Time-Based Filtering**

The query doesn't consider booking dates. A guest with a CONFIRMED booking for next year cannot make another booking today.

**Scenario**:
- Guest books December 2026 trip (CONFIRMED)
- Tries to book January 2026 trip → **BLOCKED**

**Impact**: **HIGH** - Legitimate use case is prevented

**Recommended Fix**:
```java
@Query("SELECT r FROM Reservation r " +
       "WHERE r.guestInfo.email = :email " +
       "AND r.status IN ('CONFIRMED', 'CHECKED_IN') " +
       "AND (r.checkInDate <= :newCheckOutDate AND r.checkOutDate >= :newCheckInDate)")
List<Reservation> findOverlappingActiveReservations(
    @Param("email") String email,
    @Param("newCheckInDate") LocalDate newCheckInDate,
    @Param("newCheckOutDate") LocalDate newCheckOutDate
);
```

This would allow:
- Multiple future bookings with same email ✅
- Only block if dates **overlap** ✅

---

#### 4. **No Cross-Hotel Consideration**

A guest cannot book two different hotels simultaneously, even if that's a legitimate use case (business trip, family vacation).

**Scenario**:
- Guest books Hotel A for March 1-5 (CONFIRMED)
- Wants to book Hotel B for March 6-10 → **BLOCKED** (even though dates don't overlap)

**Impact**: **HIGH** - Legitimate use case is prevented

**Solution**: Same as Issue #3 - use date-based overlap checking instead of blanket blocking

---

#### 5. **No Hotel-Specific Filtering**

The query searches across ALL hotels. A guest with a booking at Hotel A cannot book Hotel B with the same email.

**Impact**: **HIGH** - Cross-hotel bookings are prevented

**Potential Fix** (if same-hotel protection is sufficient):
```java
@Query("SELECT r FROM Reservation r " +
       "WHERE r.guestInfo.email = :email " +
       "AND r.hotel.id = :hotelId " +
       "AND r.status IN ('CONFIRMED', 'CHECKED_IN')")
List<Reservation> findActiveReservationsByGuestEmailAndHotel(
    @Param("email") String email,
    @Param("hotelId") Long hotelId
);
```

---

## Recommended Improvements

### Option 1: **Date Overlap Checking** (Recommended)

Allow multiple bookings with same email, but only block if dates overlap:

```java
@Query("SELECT r FROM Reservation r " +
       "WHERE r.guestInfo.email = :email " +
       "AND r.status IN ('CONFIRMED', 'CHECKED_IN') " +
       "AND NOT (r.checkOutDate <= :newCheckInDate OR r.checkInDate >= :newCheckOutDate)")
List<Reservation> findOverlappingActiveReservations(
    @Param("email") String email,
    @Param("newCheckInDate") LocalDate newCheckInDate,
    @Param("newCheckOutDate") LocalDate newCheckOutDate
);
```

**Validation logic**:
```java
if (isAnonymousBooking) {
    // ... existing name/email validation ...
    
    // Check for overlapping bookings
    List<Reservation> overlappingReservations = 
        reservationRepository.findOverlappingActiveReservations(
            request.getGuestEmail(),
            request.getCheckInDate(),
            request.getCheckOutDate()
        );
    
    if (!overlappingReservations.isEmpty()) {
        throw new BookingException(
            "You already have a confirmed booking during these dates. " +
            "Please choose different dates or contact the hotel to modify your existing booking."
        );
    }
}
```

**Benefits**:
- ✅ Allows multiple bookings with same email (non-overlapping)
- ✅ Prevents double bookings for same dates
- ✅ Works across different hotels
- ✅ More user-friendly

---

### Option 2: **Auto-Expire PENDING Bookings**

Add a scheduled job to cancel old PENDING bookings:

```java
@Scheduled(fixedRate = 300000) // Every 5 minutes
public void expirePendingBookings() {
    LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
    
    List<Reservation> expiredPending = reservationRepository
        .findByStatusAndCreatedAtBefore(ReservationStatus.PENDING, cutoff);
    
    for (Reservation reservation : expiredPending) {
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        logger.info("Auto-cancelled expired PENDING reservation: {}", 
                   reservation.getConfirmationNumber());
    }
}
```

---

### Option 3: **Hotel-Specific Checking**

If the business requirement is to prevent multiple bookings at the **same hotel** only:

```java
List<Reservation> activeReservations = 
    reservationRepository.findActiveReservationsByGuestEmailAndHotel(
        request.getGuestEmail(),
        request.getHotelId()
    );
```

---

## Business Questions to Clarify

1. **Should guests be allowed to have multiple bookings at different hotels with the same email?**
   - Current: NO ❌
   - Recommended: YES ✅

2. **Should guests be allowed to have multiple non-overlapping bookings at the same hotel?**
   - Current: NO ❌
   - Recommended: YES ✅

3. **Should PENDING bookings block email reuse indefinitely?**
   - Current: YES ❌
   - Recommended: NO, auto-cancel after timeout ✅

4. **What is the business rule for overlapping bookings?**
   - Current: Block ANY active booking, regardless of dates
   - Recommended: Block only if dates overlap

---

## Testing Scenarios

### Current Behavior

| Scenario | Guest Email | Booking 1 Status | Booking 1 Dates | Booking 2 Dates | Result |
|----------|-------------|------------------|-----------------|-----------------|--------|
| 1 | guest@test.com | CONFIRMED | Mar 1-5 | Mar 10-15 | ❌ BLOCKED |
| 2 | guest@test.com | CHECKED_OUT | Mar 1-5 | Mar 10-15 | ✅ ALLOWED |
| 3 | guest@test.com | CANCELLED | Mar 1-5 | Mar 10-15 | ✅ ALLOWED |
| 4 | guest@test.com | PENDING | Mar 1-5 | Mar 10-15 | ❌ BLOCKED |
| 5 | guest@test.com | CONFIRMED | Mar 1-5 (Hotel A) | Mar 10-15 (Hotel B) | ❌ BLOCKED |

### Recommended Behavior (with Option 1)

| Scenario | Guest Email | Booking 1 Status | Booking 1 Dates | Booking 2 Dates | Result |
|----------|-------------|------------------|-----------------|-----------------|--------|
| 1 | guest@test.com | CONFIRMED | Mar 1-5 | Mar 10-15 | ✅ ALLOWED |
| 2 | guest@test.com | CONFIRMED | Mar 1-5 | Mar 3-7 | ❌ BLOCKED (overlap) |
| 3 | guest@test.com | CHECKED_OUT | Mar 1-5 | Mar 10-15 | ✅ ALLOWED |
| 4 | guest@test.com | PENDING (expired) | Mar 1-5 | Mar 10-15 | ✅ ALLOWED |
| 5 | guest@test.com | CONFIRMED | Mar 1-5 (Hotel A) | Mar 10-15 (Hotel B) | ✅ ALLOWED |

---

## Priority Recommendations

### 🔴 HIGH Priority (Fix Now)

**Issue #3 & #4**: Implement date overlap checking instead of blanket blocking

**Reason**: Current logic prevents legitimate use cases (multiple bookings, cross-hotel bookings)

### 🟡 MEDIUM Priority (Fix Soon)

**Issue #2**: Auto-cancel PENDING bookings after timeout (30 minutes)

**Reason**: Prevents email blocking from abandoned bookings

### 🟢 LOW Priority (Nice to Have)

**Issue #1**: Consider whether authenticated users should have the same checks

**Reason**: Current behavior seems intentional and reasonable

---

## Conclusion

The current email reuse logic is **too restrictive** for anonymous bookings. It prevents legitimate use cases like:
- Multiple bookings at different hotels
- Multiple bookings with non-overlapping dates
- Booking after a failed payment (PENDING status)

**Recommended Action**: Implement **Option 1 (Date Overlap Checking)** to allow multiple bookings while still preventing actual conflicts.

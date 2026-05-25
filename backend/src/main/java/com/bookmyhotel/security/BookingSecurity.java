package com.bookmyhotel.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.ReservationRepository;

@Component("bookingSecurity")
public class BookingSecurity {

    private final ReservationRepository reservationRepository;
    private final HotelSecurity hotelSecurity;

    public BookingSecurity(ReservationRepository reservationRepository, HotelSecurity hotelSecurity) {
        this.reservationRepository = reservationRepository;
        this.hotelSecurity = hotelSecurity;
    }

    public boolean canAccessReservation(Long reservationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (reservationId == null || authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
        if (reservation == null) {
            return false;
        }

        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_ADMIN".equals(auth.getAuthority())
                        || "ROLE_SUPER_ADMIN".equals(auth.getAuthority()))) {
            return true;
        }

        if (authentication.getAuthorities().stream().anyMatch(auth -> isHotelScopedRole(auth.getAuthority()))) {
            return reservation.getHotel() != null
                    && reservation.getHotel().getId() != null
                    && hotelSecurity.canAccessHotel(reservation.getHotel().getId());
        }

        String authenticatedEmail = authentication.getName();
        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            return false;
        }

        if (reservation.getGuest() != null && isEmailMatch(reservation.getGuest(), authenticatedEmail)) {
            return true;
        }

        return reservation.getGuestInfo() != null
                && authenticatedEmail.equalsIgnoreCase(reservation.getGuestInfo().getEmail());
    }

    private boolean isHotelScopedRole(String authority) {
        return "ROLE_HOTEL_ADMIN".equals(authority)
                || "ROLE_OPERATIONAL_ADMIN".equals(authority)
                || "ROLE_FRONTDESK".equals(authority)
                || "ROLE_HOUSEKEEPING".equals(authority)
                || "ROLE_MAINTENANCE".equals(authority)
                || "ROLE_TESTER".equals(authority);
    }

    private boolean isEmailMatch(User user, String authenticatedEmail) {
        return user.getEmail() != null && user.getEmail().equalsIgnoreCase(authenticatedEmail);
    }
}
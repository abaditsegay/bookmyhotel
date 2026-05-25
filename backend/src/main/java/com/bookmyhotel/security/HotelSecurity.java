package com.bookmyhotel.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.tenant.HotelContext;

/**
 * Security component for hotel access control
 */
@Component("hotelSecurity")
public class HotelSecurity {

    private static final Logger logger = LoggerFactory.getLogger(HotelSecurity.class);

    /**
     * Check if the current user can access the specified hotel
     * 
     * @param hotelId the hotel ID to check access for
     * @return true if user can access the hotel, false otherwise
     */
    public boolean canAccessHotel(Long hotelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        logger.debug("🔒 HotelSecurity.canAccessHotel - Checking access for hotel ID: {}", hotelId);

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.debug("❌ HotelSecurity: No authentication or user not authenticated");
            return false;
        }

        logger.debug("🔑 HotelSecurity: Authentication principal class: {}",
                authentication.getPrincipal().getClass().getSimpleName());
        logger.debug("🏷️ HotelSecurity: User authorities: {}", authentication.getAuthorities());

        // System administrators can access any hotel
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_ADMIN".equals(auth.getAuthority())
                        || "ROLE_SUPER_ADMIN".equals(auth.getAuthority()))) {
            logger.debug("✅ HotelSecurity: User has system admin role - allowing access");
            return true;
        }

        // Hotel administrators can only access their assigned hotel
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_HOTEL_ADMIN".equals(auth.getAuthority()))) {

            logger.debug("👤 HotelSecurity: User has HOTEL_ADMIN role - checking hotel assignment");

            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                Long userHotelId = resolveHotelId(user);

                logger.debug("🏨 HotelSecurity: User hotel ID: {}, Requested hotel ID: {}", userHotelId, hotelId);
                logger.debug("🏨 HotelSecurity: User email: {}", user.getEmail());

                // Allow access if the requested hotel matches the user's assigned hotel
                boolean canAccess = hotelId != null && hotelId.equals(userHotelId);
                logger.debug("🔍 HotelSecurity: Hotel access result: {}", canAccess);
                return canAccess;
            } else {
                logger.debug("❌ HotelSecurity: Principal is not a User instance: {}",
                        principal != null ? principal.getClass().getSimpleName() : "null");

                Long contextHotelId = HotelContext.getHotelId();
                boolean canAccess = hotelId != null && hotelId.equals(contextHotelId);
                logger.debug("🏨 HotelSecurity: Falling back to HotelContext hotel ID: {}. Access result: {}",
                        contextHotelId, canAccess);
                return canAccess;
            }
        }

        // All other hotel-bound roles (FRONTDESK, HOUSEKEEPING, MAINTENANCE,
        // TESTER, OPERATIONAL_ADMIN) can only access their assigned hotel
        boolean isHotelBoundRole = authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_OPERATIONAL_ADMIN".equals(auth.getAuthority())
                        || "ROLE_FRONTDESK".equals(auth.getAuthority())
                        || "ROLE_HOUSEKEEPING".equals(auth.getAuthority())
                || "ROLE_MAINTENANCE".equals(auth.getAuthority())
                || "ROLE_TESTER".equals(auth.getAuthority()));
        if (isHotelBoundRole) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                Long userHotelId = resolveHotelId(user);
                boolean canAccess = hotelId != null && hotelId.equals(userHotelId);
                logger.debug("🔍 HotelSecurity: Hotel-bound role access result for hotel {}: {}", hotelId, canAccess);
                return canAccess;
            }

            Long contextHotelId = HotelContext.getHotelId();
            boolean canAccess = hotelId != null && hotelId.equals(contextHotelId);
            logger.debug("🏨 HotelSecurity: Hotel-bound role fallback via HotelContext hotel ID {} -> {}",
                    contextHotelId, canAccess);
            return canAccess;
        }

        logger.debug("❌ HotelSecurity: No matching role or hotel assignment - denying access");
        return false;
    }

    /**
     * Check if the current user is a hotel admin for the specified hotel
     * 
     * @param hotelId the hotel ID to check
     * @return true if user is hotel admin for this hotel
     */
    public boolean isHotelAdminFor(Long hotelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // System administrators are considered hotel admins for any hotel
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_ADMIN".equals(auth.getAuthority())
                        || "ROLE_SUPER_ADMIN".equals(auth.getAuthority()))) {
            return true;
        }

        // Check if user is specifically a hotel admin for this hotel
        if (authentication.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_HOTEL_ADMIN".equals(auth.getAuthority()))) {

            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                Long userHotelId = resolveHotelId(user);

                return hotelId != null && hotelId.equals(userHotelId);
            }

            Long contextHotelId = HotelContext.getHotelId();
            return hotelId != null && hotelId.equals(contextHotelId);
        }

        return false;
    }

    /**
     * Get the hotel ID that the current user is assigned to
     * 
     * @return the hotel ID or null if not assigned to any hotel
     */
    public Long getCurrentUserHotelId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            User user = (User) principal;
            return resolveHotelId(user);
        }

        return HotelContext.getHotelId();
    }

    private Long resolveHotelId(User user) {
        if (user.getHotel() != null && user.getHotel().getId() != null) {
            return user.getHotel().getId();
        }

        Long contextHotelId = HotelContext.getHotelId();
        logger.debug("🏨 HotelSecurity: Falling back to HotelContext for user {} with hotel ID {}",
                user.getEmail(), contextHotelId);
        return contextHotelId;
    }
}
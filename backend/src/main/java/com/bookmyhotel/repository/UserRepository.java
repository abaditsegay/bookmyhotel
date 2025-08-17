package com.bookmyhotel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;

/**
 * User repository
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email
     */
    boolean existsByEmail(String email);
    
    /**
     * Find users by tenant ID
     */
    Page<User> findByTenantId(String tenantId, Pageable pageable);
    
    /**
     * Find users by role
     */
    List<User> findByRolesContaining(UserRole role);
    
    /**
     * Count users by active status
     */
    long countByIsActive(boolean isActive);
    
    /**
     * Count users by role
     */
    long countByRolesContaining(UserRole role);
    
    /**
     * Search users by email, first name, or last name
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find users by hotel
     */
    List<User> findByHotel(Hotel hotel);
    
    /**
     * Find users by hotel and roles containing any of the given roles
     */
    @Query("SELECT u FROM User u WHERE u.hotel = :hotel AND EXISTS (SELECT 1 FROM u.roles r WHERE r IN :roles)")
    List<User> findByHotelAndRolesContaining(@Param("hotel") Hotel hotel, @Param("roles") List<UserRole> roles);
    
}

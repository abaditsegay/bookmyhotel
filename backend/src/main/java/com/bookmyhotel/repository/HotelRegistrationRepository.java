package com.bookmyhotel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.HotelRegistration;
import com.bookmyhotel.entity.RegistrationStatus;

/**
 * Repository for HotelRegistration entity
 */
@Repository
public interface HotelRegistrationRepository extends JpaRepository<HotelRegistration, Long> {

    /**
     * Find registrations by status
     */
    List<HotelRegistration> findByStatusOrderBySubmittedAtDesc(RegistrationStatus status);

    /**
     * Find registrations by status with pagination
     */
    Page<HotelRegistration> findByStatusOrderBySubmittedAtDesc(RegistrationStatus status, Pageable pageable);

    /**
     * Find all registrations with pagination ordered by submission date
     */
    Page<HotelRegistration> findAllByOrderBySubmittedAtDesc(Pageable pageable);

    /**
     * Find registration by contact email
     */
    Optional<HotelRegistration> findByContactEmail(String contactEmail);

    /**
     * Find registrations by contact email ordered by submission date (for status
     * checking)
     */
    List<HotelRegistration> findByContactEmailOrderBySubmittedAtDesc(String contactEmail);

    /**
     * Find registrations by city
     */
    List<HotelRegistration> findByCityIgnoreCaseOrderBySubmittedAtDesc(String city);

    /**
     * Find registrations by country
     */
    List<HotelRegistration> findByCountryIgnoreCaseOrderBySubmittedAtDesc(String country);

    /**
     * Count registrations by status
     */
    long countByStatus(RegistrationStatus status);

    /**
     * Find registrations reviewed by a specific admin
     */
    List<HotelRegistration> findByReviewedByOrderByReviewedAtDesc(Long reviewedBy);

    /**
     * Search registrations by hotel name or contact person
     */
    @Query("SELECT hr FROM HotelRegistration hr WHERE " +
            "LOWER(hr.hotelName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(hr.contactPerson) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(hr.contactEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "ORDER BY hr.submittedAt DESC")
    Page<HotelRegistration> searchRegistrations(@Param("searchTerm") String searchTerm, Pageable pageable);
}

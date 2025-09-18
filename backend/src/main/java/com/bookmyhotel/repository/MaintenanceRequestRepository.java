package com.bookmyhotel.repository;

import com.bookmyhotel.entity.MaintenanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {

    @Query("SELECT mr FROM MaintenanceRequest mr WHERE mr.hotel.id = :hotelId")
    Page<MaintenanceRequest> findByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

    @Query("SELECT mr FROM MaintenanceRequest mr WHERE mr.hotel.id = :hotelId")
    List<MaintenanceRequest> findByHotelId(@Param("hotelId") Long hotelId);

    @Query("SELECT mr FROM MaintenanceRequest mr WHERE mr.hotel.id = :hotelId AND mr.status = :status")
    List<MaintenanceRequest> findByHotelIdAndStatus(@Param("hotelId") Long hotelId,
            @Param("status") MaintenanceRequest.MaintenanceStatus status);

    @Query("SELECT mr FROM MaintenanceRequest mr WHERE mr.assignedTo.id = :staffId AND mr.hotel.id = :hotelId")
    List<MaintenanceRequest> findByAssignedTo_IdAndHotelId(@Param("staffId") Long staffId,
            @Param("hotelId") Long hotelId);

    // Staff-specific queries for the StaffController
    Page<MaintenanceRequest> findByAssignedTo_Id(Long staffId, Pageable pageable);

    long countByAssignedTo_Id(Long staffId);

    long countByAssignedTo_IdAndStatus(Long staffId, MaintenanceRequest.MaintenanceStatus status);
}
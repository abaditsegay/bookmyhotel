package com.bookmyhotel.repository;

import com.bookmyhotel.entity.MaintenanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    
    Page<MaintenanceRequest> findByTenantId(String tenantId, Pageable pageable);
    
    List<MaintenanceRequest> findByTenantId(String tenantId);
    
    List<MaintenanceRequest> findByTenantIdAndStatus(String tenantId, MaintenanceRequest.MaintenanceStatus status);
    
    List<MaintenanceRequest> findByAssignedToIdAndTenantId(Long staffId, String tenantId);
    
    // Staff-specific queries for the StaffController
    Page<MaintenanceRequest> findByAssignedToId(Long staffId, Pageable pageable);
    long countByAssignedToId(Long staffId);
    long countByAssignedToIdAndStatus(Long staffId, MaintenanceRequest.MaintenanceStatus status);
}
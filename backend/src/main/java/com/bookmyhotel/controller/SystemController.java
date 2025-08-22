package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.admin.TenantDTO;
import com.bookmyhotel.dto.admin.UserManagementResponse;
import com.bookmyhotel.service.HotelManagementService;
import com.bookmyhotel.service.SystemWideUserService;
import com.bookmyhotel.service.TenantManagementService;

/**
 * System-wide controller providing aggregated data endpoints for system admin dashboard
 */
@RestController
@RequestMapping("/api/system")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SystemController {
    
    @Autowired
    private HotelManagementService hotelManagementService;
    
    @Autowired
    private SystemWideUserService systemWideUserService;
    
    @Autowired
    private TenantManagementService tenantManagementService;
    
    /**
     * Get all hotels across all tenants - System admin only
     */
    @GetMapping("/hotels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HotelDTO>> getAllHotels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HotelDTO> hotelsPage = hotelManagementService.getAllHotels(pageable);
        return ResponseEntity.ok(hotelsPage.getContent());
    }
    
    /**
     * Get all system-wide users - System admin only
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserManagementResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<UserManagementResponse> usersPage = systemWideUserService.getAllUsers(pageable);
        return ResponseEntity.ok(usersPage.getContent());
    }
    
    /**
     * Get all tenants - System admin only
     */
    @GetMapping("/tenants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TenantDTO>> getAllTenants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<TenantDTO> tenantsPage = tenantManagementService.getAllTenants(pageable, null, null);
        return ResponseEntity.ok(tenantsPage.getContent());
    }
    
    /**
     * Get system statistics - System admin only
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemStatistics> getSystemStatistics() {
        
        // Get counts from each service
        HotelManagementService.HotelStatistics hotelStats = hotelManagementService.getHotelStatistics();
        TenantManagementService.TenantStatistics tenantStats = tenantManagementService.getTenantStatistics();
        
        SystemStatistics stats = new SystemStatistics(
            hotelStats.getTotalHotels(),
            tenantStats.getTotalUsers(),
            tenantStats.getTotalTenants(),
            0L // totalBookings - would need booking service
        );
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * System statistics response DTO
     */
    public static class SystemStatistics {
        private long totalHotels;
        private long totalUsers;
        private long totalTenants;
        private long totalBookings;
        
        public SystemStatistics() {}
        
        public SystemStatistics(long totalHotels, long totalUsers, long totalTenants, long totalBookings) {
            this.totalHotels = totalHotels;
            this.totalUsers = totalUsers;
            this.totalTenants = totalTenants;
            this.totalBookings = totalBookings;
        }
        
        // Getters and setters
        public long getTotalHotels() { return totalHotels; }
        public void setTotalHotels(long totalHotels) { this.totalHotels = totalHotels; }
        
        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        
        public long getTotalTenants() { return totalTenants; }
        public void setTotalTenants(long totalTenants) { this.totalTenants = totalTenants; }
        
        public long getTotalBookings() { return totalBookings; }
        public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    }
}

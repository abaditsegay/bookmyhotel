package com.bookmyhotel.service;

import com.bookmyhotel.entity.HousekeepingStaffSimple;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.HousekeepingStaffSimpleRepository;
import com.bookmyhotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Simple service class for housekeeping staff operations using database schema
 */
@Service
@Transactional
public class HousekeepingStaffSimpleService {

    @Autowired
    private HousekeepingStaffSimpleRepository housekeepingStaffRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Find staff by user ID (matching with email from User table)
     */
    public Optional<HousekeepingStaffSimple> findStaffByUserId(Long userId) {
        // First get the user's email
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return Optional.empty();
        }
        
        // Then find staff by email
        return housekeepingStaffRepository.findByEmail(userOpt.get().getEmail());
    }

    /**
     * Find staff by tenant and user ID
     */
    public Optional<HousekeepingStaffSimple> findStaffByTenantAndUserId(String tenantId, Long userId) {
        // First get the user's email
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return Optional.empty();
        }
        
        // Then find staff by tenant and email
        return housekeepingStaffRepository.findByTenantIdAndEmail(tenantId, userOpt.get().getEmail());
    }

    /**
     * Get all staff members for a tenant
     */
    public List<HousekeepingStaffSimple> getAllStaff(String tenantId) {
        return housekeepingStaffRepository.findByTenantIdOrderByIdDesc(tenantId);
    }

    /**
     * Get staff members with pagination
     */
    public Page<HousekeepingStaffSimple> getAllStaff(String tenantId, Pageable pageable) {
        return housekeepingStaffRepository.findByTenantIdOrderByIdDesc(tenantId, pageable);
    }

    /**
     * Get active staff members
     */
    public List<HousekeepingStaffSimple> getActiveStaff(String tenantId) {
        return housekeepingStaffRepository.findByTenantIdAndIsActiveTrue(tenantId);
    }

    /**
     * Get available staff members (with low workload)
     */
    public List<HousekeepingStaffSimple> getAvailableStaff(String tenantId, Integer maxWorkload) {
        return housekeepingStaffRepository.findAvailableStaff(tenantId, maxWorkload);
    }

    /**
     * Get active staff count
     */
    public Long getActiveStaffCount(String tenantId) {
        return housekeepingStaffRepository.countActiveStaff(tenantId);
    }

    /**
     * Get average staff rating
     */
    public Double getAverageStaffRating(String tenantId) {
        return housekeepingStaffRepository.getAverageStaffRating(tenantId);
    }

    /**
     * Get top performing staff members
     */
    public List<HousekeepingStaffSimple> getTopPerformers(String tenantId, Double minRating) {
        return housekeepingStaffRepository.findTopPerformers(tenantId, minRating);
    }

    /**
     * Find staff by ID
     */
    public Optional<HousekeepingStaffSimple> findById(Long id) {
        return housekeepingStaffRepository.findById(id);
    }

    /**
     * Find staff by email
     */
    public Optional<HousekeepingStaffSimple> findByEmail(String email) {
        return housekeepingStaffRepository.findByEmail(email);
    }
}

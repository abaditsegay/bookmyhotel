package com.bookmyhotel.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.admin.ApproveRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationResponse;
import com.bookmyhotel.dto.admin.RejectRegistrationRequest;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelRegistration;
import com.bookmyhotel.entity.RegistrationStatus;
import com.bookmyhotel.repository.HotelRegistrationRepository;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Service for hotel registration and approval management
 */
@Service
@Transactional
public class HotelRegistrationService {
    
    @Autowired
    private HotelRegistrationRepository registrationRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    /**
     * Submit a new hotel registration
     */
    public HotelRegistrationResponse submitRegistration(HotelRegistrationRequest request) {
        // Check if email is already registered
        java.util.Optional<HotelRegistration> existing = registrationRepository.findByContactEmail(request.getContactEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Hotel registration with this email already exists");
        }
        
        HotelRegistration registration = new HotelRegistration();
        registration.setHotelName(request.getHotelName());
        registration.setDescription(request.getDescription());
        registration.setAddress(request.getAddress());
        registration.setCity(request.getCity());
        registration.setCountry(request.getCountry());
        registration.setPhone(request.getPhone());
        registration.setContactEmail(request.getContactEmail());
        registration.setContactPerson(request.getContactPerson());
        registration.setLicenseNumber(request.getLicenseNumber());
        registration.setTaxId(request.getTaxId());
        
        registration = registrationRepository.save(registration);
        
        return convertToResponse(registration);
    }
    
    /**
     * Get all registrations with pagination
     */
    public Page<HotelRegistrationResponse> getAllRegistrations(Pageable pageable) {
        Page<HotelRegistration> registrations = registrationRepository.findAllByOrderBySubmittedAtDesc(pageable);
        return registrations.map(this::convertToResponse);
    }
    
    /**
     * Get registrations by status
     */
    public Page<HotelRegistrationResponse> getRegistrationsByStatus(RegistrationStatus status, Pageable pageable) {
        Page<HotelRegistration> registrations = registrationRepository.findByStatusOrderBySubmittedAtDesc(status, pageable);
        return registrations.map(this::convertToResponse);
    }
    
    /**
     * Get pending registrations
     */
    public List<HotelRegistrationResponse> getPendingRegistrations() {
        List<HotelRegistration> registrations = registrationRepository.findByStatusOrderBySubmittedAtDesc(RegistrationStatus.PENDING);
        return registrations.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Search registrations
     */
    public Page<HotelRegistrationResponse> searchRegistrations(String searchTerm, Pageable pageable) {
        Page<HotelRegistration> registrations = registrationRepository.searchRegistrations(searchTerm, pageable);
        return registrations.map(this::convertToResponse);
    }
    
    /**
     * Get registration by ID
     */
    public HotelRegistrationResponse getRegistrationById(Long id) {
        HotelRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel registration not found with id: " + id));
        return convertToResponse(registration);
    }
    
    /**
     * Approve hotel registration
     */
    public HotelRegistrationResponse approveRegistration(Long registrationId, ApproveRegistrationRequest request, Long reviewerId) {
        HotelRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Hotel registration not found with id: " + registrationId));
        
        if (registration.getStatus() != RegistrationStatus.PENDING && 
            registration.getStatus() != RegistrationStatus.UNDER_REVIEW) {
            throw new RuntimeException("Only pending or under review registrations can be approved");
        }
        
        // Create the hotel
        Hotel hotel = createHotelFromRegistration(registration, request.getTenantId());
        
        // Update registration status
        registration.setStatus(RegistrationStatus.APPROVED);
        registration.setReviewedAt(LocalDateTime.now());
        registration.setReviewedBy(reviewerId);
        registration.setReviewComments(request.getComments());
        registration.setApprovedHotelId(hotel.getId());
        registration.setTenantId(request.getTenantId());
        
        registration = registrationRepository.save(registration);
        
        return convertToResponse(registration);
    }
    
    /**
     * Reject hotel registration
     */
    public HotelRegistrationResponse rejectRegistration(Long registrationId, RejectRegistrationRequest request, Long reviewerId) {
        HotelRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Hotel registration not found with id: " + registrationId));
        
        if (registration.getStatus() != RegistrationStatus.PENDING && 
            registration.getStatus() != RegistrationStatus.UNDER_REVIEW) {
            throw new RuntimeException("Only pending or under review registrations can be rejected");
        }
        
        registration.setStatus(RegistrationStatus.REJECTED);
        registration.setReviewedAt(LocalDateTime.now());
        registration.setReviewedBy(reviewerId);
        registration.setReviewComments(request.getReason());
        
        registration = registrationRepository.save(registration);
        
        return convertToResponse(registration);
    }
    
    /**
     * Set registration status to under review
     */
    public HotelRegistrationResponse markUnderReview(Long registrationId, Long reviewerId) {
        HotelRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Hotel registration not found with id: " + registrationId));
        
        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new RuntimeException("Only pending registrations can be marked as under review");
        }
        
        registration.setStatus(RegistrationStatus.UNDER_REVIEW);
        registration.setReviewedBy(reviewerId);
        
        registration = registrationRepository.save(registration);
        
        return convertToResponse(registration);
    }
    
    /**
     * Get registration statistics
     */
    public RegistrationStatistics getRegistrationStatistics() {
        RegistrationStatistics stats = new RegistrationStatistics();
        stats.setPending(registrationRepository.countByStatus(RegistrationStatus.PENDING));
        stats.setUnderReview(registrationRepository.countByStatus(RegistrationStatus.UNDER_REVIEW));
        stats.setApproved(registrationRepository.countByStatus(RegistrationStatus.APPROVED));
        stats.setRejected(registrationRepository.countByStatus(RegistrationStatus.REJECTED));
        stats.setTotal(stats.getPending() + stats.getUnderReview() + stats.getApproved() + stats.getRejected());
        return stats;
    }
    
    /**
     * Create hotel from approved registration
     */
    private Hotel createHotelFromRegistration(HotelRegistration registration, String tenantId) {
        // Set tenant context for hotel creation
        TenantContext.setTenantId(tenantId);
        
        try {
            Hotel hotel = new Hotel();
            hotel.setName(registration.getHotelName());
            hotel.setDescription(registration.getDescription());
            hotel.setAddress(registration.getAddress());
            hotel.setCity(registration.getCity());
            hotel.setCountry(registration.getCountry());
            hotel.setPhone(registration.getPhone());
            hotel.setEmail(registration.getContactEmail());
            
            return hotelRepository.save(hotel);
        } finally {
            TenantContext.clear();
        }
    }
    
    /**
     * Convert entity to response DTO
     */
    private HotelRegistrationResponse convertToResponse(HotelRegistration registration) {
        HotelRegistrationResponse response = new HotelRegistrationResponse();
        response.setId(registration.getId());
        response.setHotelName(registration.getHotelName());
        response.setDescription(registration.getDescription());
        response.setAddress(registration.getAddress());
        response.setCity(registration.getCity());
        response.setCountry(registration.getCountry());
        response.setPhone(registration.getPhone());
        response.setContactEmail(registration.getContactEmail());
        response.setContactPerson(registration.getContactPerson());
        response.setLicenseNumber(registration.getLicenseNumber());
        response.setTaxId(registration.getTaxId());
        response.setStatus(registration.getStatus());
        response.setSubmittedAt(registration.getSubmittedAt());
        response.setReviewedAt(registration.getReviewedAt());
        response.setReviewedBy(registration.getReviewedBy());
        response.setReviewComments(registration.getReviewComments());
        response.setApprovedHotelId(registration.getApprovedHotelId());
        response.setTenantId(registration.getTenantId());
        return response;
    }
    
    /**
     * Inner class for registration statistics
     */
    public static class RegistrationStatistics {
        private long pending;
        private long underReview;
        private long approved;
        private long rejected;
        private long total;
        
        // Getters and Setters
        public long getPending() { return pending; }
        public void setPending(long pending) { this.pending = pending; }
        
        public long getUnderReview() { return underReview; }
        public void setUnderReview(long underReview) { this.underReview = underReview; }
        
        public long getApproved() { return approved; }
        public void setApproved(long approved) { this.approved = approved; }
        
        public long getRejected() { return rejected; }
        public void setRejected(long rejected) { this.rejected = rejected; }
        
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
    }
}

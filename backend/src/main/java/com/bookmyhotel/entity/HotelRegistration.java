package com.bookmyhotel.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Hotel registration entity for tracking hotel onboarding requests
 */
@Entity
@Table(name = "hotel_registrations",
       indexes = {
           @Index(name = "idx_hotel_reg_status", columnList = "status"),
           @Index(name = "idx_hotel_reg_email", columnList = "contact_email")
       })
public class HotelRegistration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Hotel name is required")
    @Size(max = 100, message = "Hotel name must not exceed 100 characters")
    @Column(name = "hotel_name", nullable = false, length = 100)
    private String hotelName;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(name = "description", length = 500)
    private String description;
    
    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address must not exceed 200 characters")
    @Column(name = "address", nullable = false, length = 200)
    private String address;
    
    @NotBlank(message = "City is required")
    @Size(max = 50, message = "City must not exceed 50 characters")
    @Column(name = "city", nullable = false, length = 50)
    private String city;
    
    @NotBlank(message = "Country is required")
    @Size(max = 50, message = "Country must not exceed 50 characters")
    @Column(name = "country", nullable = false, length = 50)
    private String country;
    
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Column(name = "phone", length = 20)
    private String phone;
    
    @NotBlank(message = "Contact email is required")
    @Email(message = "Contact email should be valid")
    @Size(max = 100, message = "Contact email must not exceed 100 characters")
    @Column(name = "contact_email", nullable = false, length = 100)
    private String contactEmail;
    
    @NotBlank(message = "Contact person name is required")
    @Size(max = 100, message = "Contact person name must not exceed 100 characters")
    @Column(name = "contact_person", nullable = false, length = 100)
    private String contactPerson;
    
    @Size(max = 50, message = "License number must not exceed 50 characters")
    @Column(name = "license_number", length = 50)
    private String licenseNumber;
    
    @Size(max = 20, message = "Tax ID must not exceed 20 characters")
    @Column(name = "tax_id", length = 20)
    private String taxId;
    
    @Size(max = 200, message = "Website URL must not exceed 200 characters")
    @Column(name = "website_url", length = 200)
    private String websiteUrl;
    
    @Size(max = 500, message = "Facility amenities must not exceed 500 characters")
    @Column(name = "facility_amenities", length = 500)
    private String facilityAmenities;
    
    @Column(name = "number_of_rooms")
    private Integer numberOfRooms;
    
    @Size(max = 10, message = "Check-in time must not exceed 10 characters")
    @Column(name = "check_in_time", length = 10)
    private String checkInTime;
    
    @Size(max = 10, message = "Check-out time must not exceed 10 characters")
    @Column(name = "check_out_time", length = 10)
    private String checkOutTime;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;
    
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "reviewed_by")
    private Long reviewedBy;
    
    @Size(max = 500, message = "Review comments must not exceed 500 characters")
    @Column(name = "review_comments", length = 500)
    private String reviewComments;
    
    @Column(name = "approved_hotel_id")
    private Long approvedHotelId;
    
    @Column(name = "tenant_id")
    private String tenantId;
    
    // Constructors
    public HotelRegistration() {
        this.submittedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getHotelName() {
        return hotelName;
    }
    
    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getContactEmail() {
        return contactEmail;
    }
    
    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
    
    public String getContactPerson() {
        return contactPerson;
    }
    
    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }
    
    public String getLicenseNumber() {
        return licenseNumber;
    }
    
    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }
    
    public String getTaxId() {
        return taxId;
    }
    
    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }
    
    public String getWebsiteUrl() {
        return websiteUrl;
    }
    
    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }
    
    public String getFacilityAmenities() {
        return facilityAmenities;
    }
    
    public void setFacilityAmenities(String facilityAmenities) {
        this.facilityAmenities = facilityAmenities;
    }
    
    public Integer getNumberOfRooms() {
        return numberOfRooms;
    }
    
    public void setNumberOfRooms(Integer numberOfRooms) {
        this.numberOfRooms = numberOfRooms;
    }
    
    public String getCheckInTime() {
        return checkInTime;
    }
    
    public void setCheckInTime(String checkInTime) {
        this.checkInTime = checkInTime;
    }
    
    public String getCheckOutTime() {
        return checkOutTime;
    }
    
    public void setCheckOutTime(String checkOutTime) {
        this.checkOutTime = checkOutTime;
    }
    
    public RegistrationStatus getStatus() {
        return status;
    }
    
    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
    
    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
    
    public Long getReviewedBy() {
        return reviewedBy;
    }
    
    public void setReviewedBy(Long reviewedBy) {
        this.reviewedBy = reviewedBy;
    }
    
    public String getReviewComments() {
        return reviewComments;
    }
    
    public void setReviewComments(String reviewComments) {
        this.reviewComments = reviewComments;
    }
    
    public Long getApprovedHotelId() {
        return approvedHotelId;
    }
    
    public void setApprovedHotelId(Long approvedHotelId) {
        this.approvedHotelId = approvedHotelId;
    }
    
    public String getTenantId() {
        return tenantId;
    }
    
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}

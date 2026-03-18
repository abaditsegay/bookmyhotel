package com.bookmyhotel.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for Hotel operations
 */
public class HotelDTO {

    private Long id;

    @NotBlank(message = "Hotel name is required")
    @Size(max = 100, message = "Hotel name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address must not exceed 200 characters")
    private String address;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "Country must not exceed 50 characters")
    private String country;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 20, message = "Mobile payment phone must not exceed 20 characters")
    private String mobilePaymentPhone;

    @Size(max = 20, message = "Secondary mobile payment phone must not exceed 20 characters")
    private String mobilePaymentPhone2;

    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 100, message = "Contact person must not exceed 100 characters")
    private String contactPerson;

    @Size(max = 50, message = "License number must not exceed 50 characters")
    private String licenseNumber;

    @Size(max = 50, message = "Tax ID must not exceed 50 characters")
    private String taxId;

    @Size(max = 200, message = "Website URL must not exceed 200 characters")
    private String websiteUrl;

    private String facilityAmenities;

    @Size(max = 10, message = "Check-in time must not exceed 10 characters")
    private String checkInTime;

    @Size(max = 10, message = "Check-out time must not exceed 10 characters")
    private String checkOutTime;

    private String tenantId;
    private Boolean isActive;
    private Boolean isPubliclyListed;
    private Integer numberOfRooms; // registered room limit from onboarding
    private Integer roomCount;
    private Integer totalRooms;
    private Integer availableRooms;
    private Integer bookedRooms;
    private Integer totalStaff;
    private Integer activeStaff;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public HotelDTO() {
    }

    public HotelDTO(Long id, String name, String description, String address, String city, String country, String phone,
            String email) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.city = city;
        this.country = country;
        this.phone = phone;
        this.email = email;
    }

    public HotelDTO(Long id, String name, String description, String address, String city, String country,
            String phone, String mobilePaymentPhone, String mobilePaymentPhone2, String email) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.city = city;
        this.country = country;
        this.phone = phone;
        this.mobilePaymentPhone = mobilePaymentPhone;
        this.mobilePaymentPhone2 = mobilePaymentPhone2;
        this.email = email;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getMobilePaymentPhone() {
        return mobilePaymentPhone;
    }

    public void setMobilePaymentPhone(String mobilePaymentPhone) {
        this.mobilePaymentPhone = mobilePaymentPhone;
    }

    public String getMobilePaymentPhone2() {
        return mobilePaymentPhone2;
    }

    public void setMobilePaymentPhone2(String mobilePaymentPhone2) {
        this.mobilePaymentPhone2 = mobilePaymentPhone2;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms;
    }

    public Integer getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(Integer availableRooms) {
        this.availableRooms = availableRooms;
    }

    public Integer getBookedRooms() {
        return bookedRooms;
    }

    public void setBookedRooms(Integer bookedRooms) {
        this.bookedRooms = bookedRooms;
    }

    public Integer getTotalStaff() {
        return totalStaff;
    }

    public void setTotalStaff(Integer totalStaff) {
        this.totalStaff = totalStaff;
    }

    public Integer getActiveStaff() {
        return activeStaff;
    }

    public void setActiveStaff(Integer activeStaff) {
        this.activeStaff = activeStaff;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsPubliclyListed() {
        return isPubliclyListed;
    }

    public void setIsPubliclyListed(Boolean isPubliclyListed) {
        this.isPubliclyListed = isPubliclyListed;
    }

    public Integer getNumberOfRooms() {
        return numberOfRooms;
    }

    public void setNumberOfRooms(Integer numberOfRooms) {
        this.numberOfRooms = numberOfRooms;
    }

    public Integer getRoomCount() {
        return roomCount;
    }

    public void setRoomCount(Integer roomCount) {
        this.roomCount = roomCount;
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
}

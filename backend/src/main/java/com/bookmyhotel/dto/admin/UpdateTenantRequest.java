package com.bookmyhotel.dto.admin;

import jakarta.validation.constraints.Size;

/**
 * DTO for updating tenant information
 */
public class UpdateTenantRequest {
    
    @Size(max = 100, message = "Tenant name must not exceed 100 characters")
    private String name;
    
    @Size(max = 50, message = "Subdomain must not exceed 50 characters")
    private String subdomain;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private Boolean isActive;

    // Constructors
    public UpdateTenantRequest() {}

    public UpdateTenantRequest(String name, String subdomain, String description, Boolean isActive) {
        this.name = name;
        this.subdomain = subdomain;
        this.description = description;
        this.isActive = isActive;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubdomain() {
        return subdomain;
    }

    public void setSubdomain(String subdomain) {
        this.subdomain = subdomain;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

package com.bookmyhotel.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for approving hotel registration
 */
public class ApproveRegistrationRequest {
    
    @Size(max = 500, message = "Comments must not exceed 500 characters")
    private String comments;
    
    @NotBlank(message = "Tenant ID is required for approval")
    @Size(max = 50, message = "Tenant ID must not exceed 50 characters")
    private String tenantId;
    
    // Constructors
    public ApproveRegistrationRequest() {}
    
    public ApproveRegistrationRequest(String comments, String tenantId) {
        this.comments = comments;
        this.tenantId = tenantId;
    }
    
    // Getters and Setters
    public String getComments() {
        return comments;
    }
    
    public void setComments(String comments) {
        this.comments = comments;
    }
    
    public String getTenantId() {
        return tenantId;
    }
    
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}

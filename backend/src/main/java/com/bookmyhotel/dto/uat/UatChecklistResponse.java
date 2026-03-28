package com.bookmyhotel.dto.uat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import com.bookmyhotel.entity.UatFinalDecision;

public class UatChecklistResponse {

    private Long id;
    private Long hotelId;
    private String hotelName;
    private String testerName;
    private String testEnvironment;
    private LocalDate testDate;
    private String buildVersion;
    private String hotelTenantTested;
    private Map<String, Boolean> checklistItems;
    private UatFinalDecision finalDecision;
    private String qaLead;
    private String businessOwner;
    private String productOwner;
    private LocalDate approvalDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public String getTesterName() {
        return testerName;
    }

    public void setTesterName(String testerName) {
        this.testerName = testerName;
    }

    public String getTestEnvironment() {
        return testEnvironment;
    }

    public void setTestEnvironment(String testEnvironment) {
        this.testEnvironment = testEnvironment;
    }

    public LocalDate getTestDate() {
        return testDate;
    }

    public void setTestDate(LocalDate testDate) {
        this.testDate = testDate;
    }

    public String getBuildVersion() {
        return buildVersion;
    }

    public void setBuildVersion(String buildVersion) {
        this.buildVersion = buildVersion;
    }

    public String getHotelTenantTested() {
        return hotelTenantTested;
    }

    public void setHotelTenantTested(String hotelTenantTested) {
        this.hotelTenantTested = hotelTenantTested;
    }

    public Map<String, Boolean> getChecklistItems() {
        return checklistItems;
    }

    public void setChecklistItems(Map<String, Boolean> checklistItems) {
        this.checklistItems = checklistItems;
    }

    public UatFinalDecision getFinalDecision() {
        return finalDecision;
    }

    public void setFinalDecision(UatFinalDecision finalDecision) {
        this.finalDecision = finalDecision;
    }

    public String getQaLead() {
        return qaLead;
    }

    public void setQaLead(String qaLead) {
        this.qaLead = qaLead;
    }

    public String getBusinessOwner() {
        return businessOwner;
    }

    public void setBusinessOwner(String businessOwner) {
        this.businessOwner = businessOwner;
    }

    public String getProductOwner() {
        return productOwner;
    }

    public void setProductOwner(String productOwner) {
        this.productOwner = productOwner;
    }

    public LocalDate getApprovalDate() {
        return approvalDate;
    }

    public void setApprovalDate(LocalDate approvalDate) {
        this.approvalDate = approvalDate;
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
}
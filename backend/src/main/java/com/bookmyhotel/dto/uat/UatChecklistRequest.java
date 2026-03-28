package com.bookmyhotel.dto.uat;

import java.time.LocalDate;
import java.util.Map;

import com.bookmyhotel.entity.UatFinalDecision;

public class UatChecklistRequest {

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
}
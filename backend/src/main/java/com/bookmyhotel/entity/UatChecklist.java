package com.bookmyhotel.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "uat_checklists", uniqueConstraints = {
        @UniqueConstraint(name = "uk_uat_checklist_hotel", columnNames = "hotel_id")
})
public class UatChecklist extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "tester_name", length = 255)
    private String testerName;

    @Column(name = "test_environment", length = 255)
    private String testEnvironment;

    @Column(name = "test_date")
    private LocalDate testDate;

    @Column(name = "build_version", length = 100)
    private String buildVersion;

    @Column(name = "hotel_tenant_tested", length = 255)
    private String hotelTenantTested;

    @Column(name = "checklist_items_json", columnDefinition = "LONGTEXT")
    private String checklistItemsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "final_decision", length = 64)
    private UatFinalDecision finalDecision;

    @Column(name = "qa_lead", length = 255)
    private String qaLead;

    @Column(name = "business_owner", length = 255)
    private String businessOwner;

    @Column(name = "product_owner", length = 255)
    private String productOwner;

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Hotel getHotel() {
        return hotel;
    }

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
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

    public String getChecklistItemsJson() {
        return checklistItemsJson;
    }

    public void setChecklistItemsJson(String checklistItemsJson) {
        this.checklistItemsJson = checklistItemsJson;
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
package com.bookmyhotel.dto.uat;

import java.time.LocalDateTime;

import com.bookmyhotel.entity.UatDefectSeverity;
import com.bookmyhotel.entity.UatDefectStatus;

public class UatDefectResponse {

    private Long id;
    private String defectId;
    private Long hotelId;
    private String summary;
    private String testerDetail;
    private UatDefectSeverity severity;
    private Boolean blockingRelease;
    private String adminNotes;
    private String fixDetails;
    private UatDefectStatus status;
    private String createdByName;
    private String updatedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDefectId() {
        return defectId;
    }

    public void setDefectId(String defectId) {
        this.defectId = defectId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getTesterDetail() {
        return testerDetail;
    }

    public void setTesterDetail(String testerDetail) {
        this.testerDetail = testerDetail;
    }

    public UatDefectSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(UatDefectSeverity severity) {
        this.severity = severity;
    }

    public Boolean getBlockingRelease() {
        return blockingRelease;
    }

    public void setBlockingRelease(Boolean blockingRelease) {
        this.blockingRelease = blockingRelease;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public String getFixDetails() {
        return fixDetails;
    }

    public void setFixDetails(String fixDetails) {
        this.fixDetails = fixDetails;
    }

    public UatDefectStatus getStatus() {
        return status;
    }

    public void setStatus(UatDefectStatus status) {
        this.status = status;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public String getUpdatedByName() {
        return updatedByName;
    }

    public void setUpdatedByName(String updatedByName) {
        this.updatedByName = updatedByName;
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

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
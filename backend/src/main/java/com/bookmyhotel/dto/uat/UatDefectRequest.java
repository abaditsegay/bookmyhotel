package com.bookmyhotel.dto.uat;

import com.bookmyhotel.entity.UatDefectSeverity;
import com.bookmyhotel.entity.UatDefectStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UatDefectRequest {

    @NotBlank(message = "Summary is required")
    @Size(max = 255, message = "Summary must not exceed 255 characters")
    private String summary;

    private String testerDetail;
    private UatDefectSeverity severity;
    private Boolean blockingRelease;
    private String adminNotes;
    private String fixDetails;
    private UatDefectStatus status;

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
}
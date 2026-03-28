package com.bookmyhotel.entity;

import java.time.LocalDateTime;

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

@Entity
@Table(name = "uat_defects")
public class UatDefect extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "summary", nullable = false, length = 255)
    private String summary;

    @Column(name = "tester_detail", columnDefinition = "LONGTEXT")
    private String testerDetail;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 32)
    private UatDefectSeverity severity = UatDefectSeverity.MEDIUM;

    @Column(name = "blocking_release", nullable = false)
    private Boolean blockingRelease = Boolean.FALSE;

    @Column(name = "admin_notes", columnDefinition = "LONGTEXT")
    private String adminNotes;

    @Column(name = "fix_details", columnDefinition = "LONGTEXT")
    private String fixDetails;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private UatDefectStatus status = UatDefectStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_user_id")
    private User updatedByUser;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

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

    public User getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(User createdByUser) {
        this.createdByUser = createdByUser;
    }

    public User getUpdatedByUser() {
        return updatedByUser;
    }

    public void setUpdatedByUser(User updatedByUser) {
        this.updatedByUser = updatedByUser;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
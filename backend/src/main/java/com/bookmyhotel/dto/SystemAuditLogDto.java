package com.bookmyhotel.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class SystemAuditLogDto {

    private Long id;
    private String entityType;
    private Long entityId;
    private String action;
    private String description;
    private String oldValues;
    private String newValues;
    private Long performedByUserId;
    private String performedByUserName;
    private String performedByUserEmail;
    private String performedByUserRole;
    private String ipAddress;
    private String userAgent;
    private String requestPath;
    private String requestMethod;
    private Integer responseStatus;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime performedAt;

    private boolean success;
    private String errorMessage;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getOldValues() { return oldValues; }
    public void setOldValues(String oldValues) { this.oldValues = oldValues; }

    public String getNewValues() { return newValues; }
    public void setNewValues(String newValues) { this.newValues = newValues; }

    public Long getPerformedByUserId() { return performedByUserId; }
    public void setPerformedByUserId(Long performedByUserId) { this.performedByUserId = performedByUserId; }

    public String getPerformedByUserName() { return performedByUserName; }
    public void setPerformedByUserName(String performedByUserName) { this.performedByUserName = performedByUserName; }

    public String getPerformedByUserEmail() { return performedByUserEmail; }
    public void setPerformedByUserEmail(String performedByUserEmail) { this.performedByUserEmail = performedByUserEmail; }

    public String getPerformedByUserRole() { return performedByUserRole; }
    public void setPerformedByUserRole(String performedByUserRole) { this.performedByUserRole = performedByUserRole; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public String getRequestPath() { return requestPath; }
    public void setRequestPath(String requestPath) { this.requestPath = requestPath; }

    public String getRequestMethod() { return requestMethod; }
    public void setRequestMethod(String requestMethod) { this.requestMethod = requestMethod; }

    public Integer getResponseStatus() { return responseStatus; }
    public void setResponseStatus(Integer responseStatus) { this.responseStatus = responseStatus; }

    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}

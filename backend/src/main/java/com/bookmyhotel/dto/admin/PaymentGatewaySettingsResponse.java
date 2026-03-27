package com.bookmyhotel.dto.admin;

import java.time.LocalDateTime;

public class PaymentGatewaySettingsResponse {

    private String gatewayMode;
    private String source;
    private LocalDateTime updatedAt;
    private String updatedBy;

    public String getGatewayMode() {
        return gatewayMode;
    }

    public void setGatewayMode(String gatewayMode) {
        this.gatewayMode = gatewayMode;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
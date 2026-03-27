package com.bookmyhotel.dto.admin;

import jakarta.validation.constraints.NotBlank;

public class UpdatePaymentGatewaySettingsRequest {

    @NotBlank(message = "Gateway mode is required")
    private String gatewayMode;

    public String getGatewayMode() {
        return gatewayMode;
    }

    public void setGatewayMode(String gatewayMode) {
        this.gatewayMode = gatewayMode;
    }
}
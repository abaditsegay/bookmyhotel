package com.bookmyhotel.dto.admin;

public class PublicPaymentGatewaySettingsResponse {

    private String gatewayMode;

    public PublicPaymentGatewaySettingsResponse() {
    }

    public PublicPaymentGatewaySettingsResponse(String gatewayMode) {
        this.gatewayMode = gatewayMode;
    }

    public String getGatewayMode() {
        return gatewayMode;
    }

    public void setGatewayMode(String gatewayMode) {
        this.gatewayMode = gatewayMode;
    }
}
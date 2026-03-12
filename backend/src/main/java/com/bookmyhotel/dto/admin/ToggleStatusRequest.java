package com.bookmyhotel.dto.admin;

import jakarta.validation.constraints.NotBlank;

public class ToggleStatusRequest {

    @NotBlank(message = "Reason is required")
    private String reason;

    public ToggleStatusRequest() {
    }

    public ToggleStatusRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

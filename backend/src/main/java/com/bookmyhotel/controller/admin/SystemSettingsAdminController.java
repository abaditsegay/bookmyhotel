package com.bookmyhotel.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.admin.PaymentGatewaySettingsResponse;
import com.bookmyhotel.dto.admin.UpdatePaymentGatewaySettingsRequest;
import com.bookmyhotel.service.SystemSettingsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/system-settings")
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class SystemSettingsAdminController {

    @Autowired
    private SystemSettingsService systemSettingsService;

    @GetMapping("/payment-gateway")
    public ResponseEntity<PaymentGatewaySettingsResponse> getPaymentGatewaySettings() {
        return ResponseEntity.ok(systemSettingsService.getPaymentGatewaySettings());
    }

    @PutMapping("/payment-gateway")
    public ResponseEntity<PaymentGatewaySettingsResponse> updatePaymentGatewaySettings(
            @Valid @RequestBody UpdatePaymentGatewaySettingsRequest request,
            Authentication authentication) {
        String updatedBy = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(systemSettingsService.updatePaymentGatewayMode(request.getGatewayMode(), updatedBy));
    }
}
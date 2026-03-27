package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.admin.PublicPaymentGatewaySettingsResponse;
import com.bookmyhotel.service.SystemSettingsService;

@RestController
@RequestMapping("/api/public/system-settings")
public class PublicSystemSettingsController {

    @Autowired
    private SystemSettingsService systemSettingsService;

    @GetMapping("/payment-gateway")
    public ResponseEntity<PublicPaymentGatewaySettingsResponse> getPaymentGatewayMode() {
        return ResponseEntity.ok(new PublicPaymentGatewaySettingsResponse(
                systemSettingsService.getEffectivePaymentGatewayMode().toApiValue()));
    }
}
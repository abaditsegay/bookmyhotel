package com.bookmyhotel.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.config.PaymentGatewayProperties;
import com.bookmyhotel.dto.admin.PaymentGatewaySettingsResponse;
import com.bookmyhotel.entity.PaymentGatewayMode;
import com.bookmyhotel.entity.SystemSetting;
import com.bookmyhotel.repository.SystemSettingRepository;

@Service
public class SystemSettingsService {

    private static final Logger logger = LoggerFactory.getLogger(SystemSettingsService.class);
    private static final String PAYMENT_GATEWAY_MODE_KEY = "payment.gateway.mode";
    private static final String PAYMENT_GATEWAY_MODE_DESCRIPTION = "Controls whether booking checkout uses mock payment processing or live Ethiopian wallet gateways.";

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Autowired
    private PaymentGatewayProperties paymentGatewayProperties;

    @Transactional(readOnly = true)
    public PaymentGatewaySettingsResponse getPaymentGatewaySettings() {
        PaymentGatewaySettingsResponse response = new PaymentGatewaySettingsResponse();
        Optional<SystemSetting> storedSetting = findSettingSafely();

        if (storedSetting.isPresent()) {
            SystemSetting systemSetting = storedSetting.get();
            response.setGatewayMode(normalizeMode(systemSetting.getSettingValue()).toApiValue());
            response.setSource("database");
            response.setUpdatedAt(systemSetting.getUpdatedAt());
            response.setUpdatedBy(systemSetting.getUpdatedBy());
            return response;
        }

        response.setGatewayMode(getDefaultMode().toApiValue());
        response.setSource("application-default");
        return response;
    }

    @Transactional
    public PaymentGatewaySettingsResponse updatePaymentGatewayMode(String requestedMode, String updatedBy) {
        PaymentGatewayMode paymentGatewayMode = normalizeMode(requestedMode);
        SystemSetting systemSetting = findSettingSafely().orElseGet(SystemSetting::new);

        systemSetting.setSettingKey(PAYMENT_GATEWAY_MODE_KEY);
        systemSetting.setSettingValue(paymentGatewayMode.name());
        systemSetting.setDescription(PAYMENT_GATEWAY_MODE_DESCRIPTION);
        systemSetting.setUpdatedBy(updatedBy);

        SystemSetting savedSetting = systemSettingRepository.save(systemSetting);

        PaymentGatewaySettingsResponse response = new PaymentGatewaySettingsResponse();
        response.setGatewayMode(paymentGatewayMode.toApiValue());
        response.setSource("database");
        response.setUpdatedAt(savedSetting.getUpdatedAt());
        response.setUpdatedBy(savedSetting.getUpdatedBy());
        return response;
    }

    @Transactional(readOnly = true)
    public PaymentGatewayMode getEffectivePaymentGatewayMode() {
        return findSettingSafely()
                .map(setting -> normalizeMode(setting.getSettingValue()))
                .orElseGet(this::getDefaultMode);
    }

    @Transactional(readOnly = true)
    public boolean isRealPaymentGatewayEnabled() {
        return getEffectivePaymentGatewayMode() == PaymentGatewayMode.REAL;
    }

    private Optional<SystemSetting> findSettingSafely() {
        try {
            return systemSettingRepository.findBySettingKey(PAYMENT_GATEWAY_MODE_KEY);
        } catch (DataAccessException exception) {
            logger.warn("System settings table is not available yet; falling back to application defaults: {}",
                    exception.getMessage());
            return Optional.empty();
        }
    }

    private PaymentGatewayMode getDefaultMode() {
        return normalizeMode(paymentGatewayProperties.getMode());
    }

    private PaymentGatewayMode normalizeMode(String mode) {
        try {
            return PaymentGatewayMode.fromValue(mode);
        } catch (IllegalArgumentException exception) {
            logger.warn("Unknown payment gateway mode '{}'; defaulting to MOCK", mode);
            return PaymentGatewayMode.MOCK;
        }
    }
}
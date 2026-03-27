CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    updated_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_system_settings_key (setting_key)
);

INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
VALUES (
    'payment.gateway.mode',
    'MOCK',
    'Controls whether booking checkout uses mock payment processing or live Ethiopian wallet gateways.',
    'migration'
)
ON DUPLICATE KEY UPDATE
    description = VALUES(description);
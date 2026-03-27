CREATE TABLE payment_callback_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    transaction_id VARCHAR(128) NOT NULL,
    provider_transaction_id VARCHAR(128),
    event_id VARCHAR(128),
    callback_status VARCHAR(32) NOT NULL,
    idempotency_key VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_payment_callback_idempotency (idempotency_key),
    INDEX idx_payment_callback_transaction (transaction_id),
    INDEX idx_payment_callback_provider (provider),
    INDEX idx_payment_callback_created_at (created_at)
);
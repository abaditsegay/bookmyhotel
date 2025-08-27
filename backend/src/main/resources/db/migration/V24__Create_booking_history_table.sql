-- V23: Create booking_history table for tracking booking modifications and audit trail
-- Created as part of Phase 3.3 Enhanced Cost Calculation system

CREATE TABLE booking_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    reservation_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at DATETIME(6) NOT NULL,
    old_values TEXT,
    new_values TEXT,
    reason VARCHAR(500),
    financial_impact DECIMAL(10, 2),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    PRIMARY KEY (id),
    INDEX idx_booking_history_reservation_id (reservation_id),
    INDEX idx_booking_history_action_type (action_type),
    INDEX idx_booking_history_performed_by (performed_by),
    INDEX idx_booking_history_performed_at (performed_at),
    CONSTRAINT fk_booking_history_reservation 
        FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

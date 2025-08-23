-- Create staff_schedules table
CREATE TABLE staff_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    staff_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type ENUM('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FULL_DAY', 'SPLIT_SHIFT') NOT NULL,
    department ENUM('FRONT_DESK', 'HOUSEKEEPING', 'MAINTENANCE', 'SECURITY', 'RESTAURANT', 'CONCIERGE', 'MANAGEMENT') NOT NULL,
    notes TEXT,
    status ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_staff_schedules_tenant (tenant_id),
    INDEX idx_staff_schedules_staff_date (staff_id, schedule_date),
    INDEX idx_staff_schedules_hotel_date (hotel_id, schedule_date),
    INDEX idx_staff_schedules_department (department),
    INDEX idx_staff_schedules_status (status),
    INDEX idx_staff_schedules_date_range (schedule_date, start_time),
    
    UNIQUE KEY unique_staff_schedule (staff_id, schedule_date, start_time, end_time)
);

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

-- Insert sample staff schedules for demonstration
-- Note: These will be inserted for each tenant's hotels

-- Sample schedules for Front Desk staff
INSERT INTO staff_schedules (tenant_id, staff_id, hotel_id, schedule_date, start_time, end_time, shift_type, department, notes, status, created_by)
SELECT 
    h.tenant_id,
    u.id as staff_id,
    h.id as hotel_id,
    CURDATE() + INTERVAL 1 DAY as schedule_date,
    '08:00:00' as start_time,
    '16:00:00' as end_time,
    'MORNING' as shift_type,
    'FRONT_DESK' as department,
    'Morning shift coverage' as notes,
    'SCHEDULED' as status,
    (SELECT id FROM users WHERE email = 'admin@bookmyhotel.com' LIMIT 1) as created_by
FROM hotels h
JOIN users u ON u.tenant_id = h.tenant_id
WHERE u.role = 'FRONT_DESK'
AND h.is_active = true
LIMIT 5;

-- Sample schedules for Housekeeping staff
INSERT INTO staff_schedules (tenant_id, staff_id, hotel_id, schedule_date, start_time, end_time, shift_type, department, notes, status, created_by)
SELECT 
    h.tenant_id,
    u.id as staff_id,
    h.id as hotel_id,
    CURDATE() + INTERVAL 1 DAY as schedule_date,
    '09:00:00' as start_time,
    '17:00:00' as end_time,
    'MORNING' as shift_type,
    'HOUSEKEEPING' as department,
    'Room cleaning and maintenance' as notes,
    'SCHEDULED' as status,
    (SELECT id FROM users WHERE email = 'admin@bookmyhotel.com' LIMIT 1) as created_by
FROM hotels h
JOIN users u ON u.tenant_id = h.tenant_id
WHERE u.role = 'HOUSEKEEPING'
AND h.is_active = true
LIMIT 5;

-- Evening shift schedules
INSERT INTO staff_schedules (tenant_id, staff_id, hotel_id, schedule_date, start_time, end_time, shift_type, department, notes, status, created_by)
SELECT 
    h.tenant_id,
    u.id as staff_id,
    h.id as hotel_id,
    CURDATE() + INTERVAL 1 DAY as schedule_date,
    '16:00:00' as start_time,
    '00:00:00' as end_time,
    'EVENING' as shift_type,
    'FRONT_DESK' as department,
    'Evening shift coverage' as notes,
    'SCHEDULED' as status,
    (SELECT id FROM users WHERE email = 'admin@bookmyhotel.com' LIMIT 1) as created_by
FROM hotels h
JOIN users u ON u.tenant_id = h.tenant_id
WHERE u.role = 'FRONT_DESK'
AND h.is_active = true
LIMIT 3;

-- Weekend schedules
INSERT INTO staff_schedules (tenant_id, staff_id, hotel_id, schedule_date, start_time, end_time, shift_type, department, notes, status, created_by)
SELECT 
    h.tenant_id,
    u.id as staff_id,
    h.id as hotel_id,
    CURDATE() + INTERVAL (7 - WEEKDAY(CURDATE())) DAY as schedule_date, -- Next Saturday
    '10:00:00' as start_time,
    '18:00:00' as end_time,
    'FULL_DAY' as shift_type,
    CASE 
        WHEN u.role = 'FRONT_DESK' THEN 'FRONT_DESK'
        WHEN u.role = 'HOUSEKEEPING' THEN 'HOUSEKEEPING'
        ELSE 'FRONT_DESK'
    END as department,
    'Weekend coverage' as notes,
    'SCHEDULED' as status,
    (SELECT id FROM users WHERE email = 'admin@bookmyhotel.com' LIMIT 1) as created_by
FROM hotels h
JOIN users u ON u.tenant_id = h.tenant_id
WHERE u.role IN ('FRONT_DESK', 'HOUSEKEEPING')
AND h.is_active = true
LIMIT 8;

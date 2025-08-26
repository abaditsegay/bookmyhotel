-- V29__create_housekeeping_and_maintenance_tables.sql
-- Create tables for housekeeping and maintenance task management

-- Create housekeeping_staff table
CREATE TABLE IF NOT EXISTS housekeeping_staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    shift_start VARCHAR(5),
    shift_end VARCHAR(5),
    max_concurrent_tasks INT DEFAULT 3,
    is_available BOOLEAN DEFAULT TRUE,
    specializations TEXT,
    performance_rating DOUBLE,
    tasks_completed INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_housekeeping_staff_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_housekeeping_staff_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Unique constraints
    UNIQUE KEY uk_housekeeping_staff_employee_id (tenant_id, employee_id),
    UNIQUE KEY uk_housekeeping_staff_user (tenant_id, user_id),
    
    -- Indexes for performance
    INDEX idx_housekeeping_staff_tenant_hotel (tenant_id, hotel_id),
    INDEX idx_housekeeping_staff_available (is_available),
    INDEX idx_housekeeping_staff_performance (performance_rating)
);

-- Create housekeeping_tasks table
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    room_id BIGINT NULL,
    assigned_staff_id BIGINT NULL,
    task_type ENUM('ROOM_CLEANING', 'CHECKOUT_CLEANING', 'MAINTENANCE_CLEANING', 'DEEP_CLEANING', 'INSPECTION', 
                   'MAINTENANCE_TASK', 'RESTOCKING', 'LAUNDRY', 'SPECIAL_REQUEST', 'EMERGENCY_CLEANUP', 
                   'PREVENTIVE_MAINTENANCE', 'PUBLIC_AREA_CLEANING', 'BATHROOM_DEEP_CLEAN', 'CARPET_CLEANING', 
                   'EQUIPMENT_CHECK', 'HVAC_MAINTENANCE', 'SEASONAL_PREPARATION', 'QUALITY_CHECK', 
                   'GUEST_COMPLAINT_FOLLOWUP') NOT NULL,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'PENDING_INSPECTION', 
               'APPROVED', 'REJECTED', 'CANCELLED', 'RESCHEDULED', 'ESCALATED', 'QUALITY_ISSUE', 
               'GUEST_COMPLAINT') NOT NULL DEFAULT 'PENDING',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    description TEXT,
    special_instructions TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_at DATETIME NULL,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    estimated_duration_minutes INT NULL,
    actual_duration_minutes INT NULL,
    quality_score INT NULL,
    inspector_notes TEXT,
    
    -- Foreign key constraints
    CONSTRAINT fk_housekeeping_tasks_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_housekeeping_tasks_assigned_staff FOREIGN KEY (assigned_staff_id) REFERENCES housekeeping_staff(id) ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT chk_housekeeping_tasks_quality_score CHECK (quality_score IS NULL OR (quality_score >= 1 AND quality_score <= 5)),
    
    -- Indexes for performance
    INDEX idx_housekeeping_tasks_tenant (tenant_id),
    INDEX idx_housekeeping_tasks_assigned_staff (assigned_staff_id),
    INDEX idx_housekeeping_tasks_status (status),
    INDEX idx_housekeeping_tasks_priority (priority),
    INDEX idx_housekeeping_tasks_task_type (task_type),
    INDEX idx_housekeeping_tasks_created_at (created_at),
    INDEX idx_housekeeping_tasks_room (room_id)
);

-- Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    hotel_id BIGINT NOT NULL,
    room_id BIGINT NULL,
    task_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    assigned_to BIGINT NULL,
    created_by BIGINT NOT NULL,
    reported_by BIGINT NULL,
    location VARCHAR(255),
    equipment_type VARCHAR(100),
    estimated_duration_minutes INT NULL,
    actual_duration_minutes INT NULL,
    estimated_cost DECIMAL(10,2) NULL,
    actual_cost DECIMAL(10,2) NULL,
    scheduled_start_time DATETIME NULL,
    actual_start_time DATETIME NULL,
    actual_end_time DATETIME NULL,
    parts_required TEXT,
    tools_required TEXT,
    safety_requirements TEXT,
    work_performed TEXT,
    parts_used TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATETIME NULL,
    follow_up_notes TEXT,
    verification_notes TEXT,
    verified_by BIGINT NULL,
    verification_time DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_maintenance_tasks_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_tasks_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_tasks_reported_by FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_tasks_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_maintenance_tasks_tenant_hotel (tenant_id, hotel_id),
    INDEX idx_maintenance_tasks_assigned_to (assigned_to),
    INDEX idx_maintenance_tasks_status (status),
    INDEX idx_maintenance_tasks_priority (priority),
    INDEX idx_maintenance_tasks_equipment_type (equipment_type),
    INDEX idx_maintenance_tasks_scheduled_start (scheduled_start_time),
    INDEX idx_maintenance_tasks_follow_up (follow_up_required, follow_up_date),
    INDEX idx_maintenance_tasks_created_at (created_at)
);

-- Insert some common maintenance task types
INSERT IGNORE INTO maintenance_tasks (tenant_id, hotel_id, task_type, title, description, status, priority, created_by, created_at) VALUES
-- These are template/example tasks - in real implementation, these would be created by operations supervisors
('demo', 1, 'PLUMBING', 'Plumbing Repair Template', 'Fix plumbing issues in guest rooms or common areas', 'PENDING', 'HIGH', 1, NOW()),
('demo', 1, 'ELECTRICAL', 'Electrical Repair Template', 'Repair electrical issues and lighting', 'PENDING', 'HIGH', 1, NOW()),
('demo', 1, 'HVAC', 'HVAC Maintenance Template', 'Heating, ventilation, and air conditioning maintenance', 'PENDING', 'NORMAL', 1, NOW()),
('demo', 1, 'PREVENTIVE', 'Preventive Maintenance Template', 'Scheduled preventive maintenance tasks', 'PENDING', 'LOW', 1, NOW()),
('demo', 1, 'ELEVATOR', 'Elevator Service Template', 'Elevator inspection and maintenance', 'PENDING', 'HIGH', 1, NOW());

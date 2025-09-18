-- Fix maintenance_tasks table schema to match entity definitions
-- Drop existing maintenance_tasks table and recreate with proper structure

-- Drop existing maintenance_tasks table
DROP TABLE IF EXISTS maintenance_tasks;

-- Recreate maintenance_tasks table with proper structure matching MaintenanceTask entity
CREATE TABLE maintenance_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_id BIGINT,
    task_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'VERIFIED', 'CANCELLED') DEFAULT 'OPEN',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL') DEFAULT 'NORMAL',
    assigned_to BIGINT,
    created_by BIGINT NOT NULL,
    reported_by BIGINT,
    location VARCHAR(255),
    equipment_type VARCHAR(255),
    estimated_duration_minutes INT,
    actual_duration_minutes INT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_start_time TIMESTAMP NULL,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    parts_required TEXT,
    tools_required TEXT,
    safety_requirements TEXT,
    work_performed TEXT,
    parts_used TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP NULL,
    follow_up_notes TEXT,
    verification_notes TEXT,
    verified_by BIGINT,
    verification_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_maintenance_tasks_hotel_id (hotel_id),
    INDEX idx_maintenance_tasks_room_id (room_id),
    INDEX idx_maintenance_tasks_assigned_to (assigned_to),
    INDEX idx_maintenance_tasks_created_by (created_by),
    INDEX idx_maintenance_tasks_status (status),
    INDEX idx_maintenance_tasks_priority (priority),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES housekeeping_staff(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

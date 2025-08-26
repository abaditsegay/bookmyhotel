-- Create sample housekeeping tasks for testing task assignment
-- This assumes we have the tenant and hotel data already in place

-- Get the tenant ID for Grand Plaza
SET @tenant_id = 'd7b7e673-6788-45b2-8dad-4d48944a144e';
SET @hotel_id = 1;

-- Create some sample rooms if they don't exist
INSERT IGNORE INTO rooms (room_number, room_type, capacity, price_per_night, is_available, hotel_id, tenant_id, created_at)
VALUES 
  ('101', 'STANDARD', 2, 120.00, true, @hotel_id, @tenant_id, NOW()),
  ('102', 'STANDARD', 2, 120.00, true, @hotel_id, @tenant_id, NOW()),
  ('201', 'DELUXE', 3, 180.00, true, @hotel_id, @tenant_id, NOW()),
  ('202', 'DELUXE', 3, 180.00, true, @hotel_id, @tenant_id, NOW()),
  ('301', 'SUITE', 4, 350.00, true, @hotel_id, @tenant_id, NOW());

-- Get some room IDs
SET @room_101 = (SELECT id FROM rooms WHERE room_number = '101' AND hotel_id = @hotel_id AND tenant_id = @tenant_id LIMIT 1);
SET @room_102 = (SELECT id FROM rooms WHERE room_number = '102' AND hotel_id = @hotel_id AND tenant_id = @tenant_id LIMIT 1);
SET @room_201 = (SELECT id FROM rooms WHERE room_number = '201' AND hotel_id = @hotel_id AND tenant_id = @tenant_id LIMIT 1);
SET @room_202 = (SELECT id FROM rooms WHERE room_number = '202' AND hotel_id = @hotel_id AND tenant_id = @tenant_id LIMIT 1);
SET @room_301 = (SELECT id FROM rooms WHERE room_number = '301' AND hotel_id = @hotel_id AND tenant_id = @tenant_id LIMIT 1);

-- Create housekeeping staff records directly (without users for simplicity)
INSERT IGNORE INTO housekeeping_staff (employee_id, first_name, last_name, email, role, shift, hourly_rate, tenant_id, created_at)
VALUES 
  ('HK001', 'Maria', 'Lopez', 'maria.lopez@grandplaza.com', 'HOUSEKEEPER', 'MORNING', 18.50, @tenant_id, NOW()),
  ('HK002', 'Anna', 'Kim', 'anna.kim@grandplaza.com', 'HOUSEKEEPER', 'MORNING', 17.75, @tenant_id, NOW()),
  ('HK003', 'Sofia', 'Garcia', 'sofia.garcia@grandplaza.com', 'HOUSEKEEPER', 'AFTERNOON', 19.00, @tenant_id, NOW()),
  ('HK004', 'Elena', 'Rodriguez', 'elena.rodriguez@grandplaza.com', 'SUPERVISOR', 'AFTERNOON', 22.50, @tenant_id, NOW());

-- Get housekeeping staff IDs
SET @maria_staff_id = (SELECT id FROM housekeeping_staff WHERE employee_id = 'HK001' AND tenant_id = @tenant_id LIMIT 1);
SET @anna_staff_id = (SELECT id FROM housekeeping_staff WHERE employee_id = 'HK002' AND tenant_id = @tenant_id LIMIT 1);
SET @sofia_staff_id = (SELECT id FROM housekeeping_staff WHERE employee_id = 'HK003' AND tenant_id = @tenant_id LIMIT 1);
SET @elena_staff_id = (SELECT id FROM housekeeping_staff WHERE employee_id = 'HK004' AND tenant_id = @tenant_id LIMIT 1);

-- Create sample housekeeping tasks
INSERT INTO housekeeping_tasks (
  room_id, task_type, status, priority, description, special_instructions, 
  estimated_duration_minutes, tenant_id, created_at
)
VALUES 
  (@room_101, 'CHECKOUT_CLEANING', 'PENDING', 'HIGH', 'Guest checkout cleaning', 'Check minibar and replace towels', 45, @tenant_id, NOW()),
  (@room_102, 'MAINTENANCE_CLEANING', 'PENDING', 'NORMAL', 'Daily housekeeping', 'Standard cleaning routine', 30, @tenant_id, NOW()),
  (@room_201, 'DEEP_CLEANING', 'PENDING', 'NORMAL', 'Weekly deep clean', 'Focus on bathroom and windows', 90, @tenant_id, NOW()),
  (@room_202, 'CHECKOUT_CLEANING', 'ASSIGNED', 'HIGH', 'VIP guest preparation', 'Extra amenities and fresh flowers', 60, @tenant_id, NOW()),
  (@room_301, 'MAINTENANCE_TASK', 'IN_PROGRESS', 'LOW', 'Suite maintenance', 'Check AC and lighting systems', 120, @tenant_id, NOW());

-- Assign some tasks to staff
UPDATE housekeeping_tasks 
SET assigned_staff_id = @maria_staff_id, assigned_at = NOW()
WHERE room_id = @room_202 AND status = 'ASSIGNED' AND tenant_id = @tenant_id;

UPDATE housekeeping_tasks 
SET assigned_staff_id = @sofia_staff_id, started_at = NOW()
WHERE room_id = @room_301 AND status = 'IN_PROGRESS' AND tenant_id = @tenant_id;

-- Show created data
SELECT 'Housekeeping Tasks Created:' as Info;
SELECT t.id, r.room_number, t.task_type, t.status, t.priority, t.description, 
       CONCAT(hs.first_name, ' ', hs.last_name) as assigned_staff
FROM housekeeping_tasks t
JOIN rooms r ON t.room_id = r.id
LEFT JOIN housekeeping_staff hs ON t.assigned_staff_id = hs.id
WHERE t.tenant_id = @tenant_id
ORDER BY t.created_at DESC;

SELECT 'Housekeeping Staff Created:' as Info;
SELECT hs.id, hs.employee_id, CONCAT(hs.first_name, ' ', hs.last_name) as name, 
       hs.role, hs.shift, hs.is_active, hs.performance_rating, hs.current_workload
FROM housekeeping_staff hs
WHERE hs.tenant_id = @tenant_id
ORDER BY hs.employee_id;

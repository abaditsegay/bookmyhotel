-- Comprehensive Test Data - Phase 3: Housekeeping Staff and Tasks
-- This file continues from comprehensive-test-data-phase2.sql

-- First check if housekeeping staff table needs to be referenced by hotel_id
-- Based on the entity structure, we'll create housekeeping staff for each major hotel

-- =============================================
-- PHASE 3: HOUSEKEEPING STAFF DATA
-- =============================================

INSERT INTO housekeeping_staff (employee_id, first_name, last_name, email, phone, role, shift, status, hourly_rate, performance_rating, tasks_completed_today, average_task_duration, quality_score_average, is_active, current_workload, average_rating, tenant_id) VALUES

-- ============= GRANDLUX MANHATTAN TOWER HOUSEKEEPING TEAM =============
-- Housekeeping Supervisors
('HK-GLX-MAN-001', 'Elena', 'Rodriguez', 'elena.rodriguez@grandlux-manhattan.com', '+1-212-555-1100', 'SUPERVISOR', 'MORNING', 'AVAILABLE', 28.50, 4.8, 0, 38.5, 4.7, true, 0, 4.8, 'grandlux-hotels'),
('HK-GLX-MAN-002', 'Patricia', 'Kim', 'patricia.kim@grandlux-manhattan.com', '+1-212-555-1101', 'SUPERVISOR', 'AFTERNOON', 'AVAILABLE', 28.50, 4.6, 0, 40.2, 4.5, true, 0, 4.6, 'grandlux-hotels'),

-- Senior Housekeepers
('HK-GLX-MAN-003', 'Maria', 'Gonzalez', 'maria.gonzalez@grandlux-manhattan.com', '+1-212-555-1102', 'HOUSEKEEPER', 'MORNING', 'AVAILABLE', 22.75, 4.4, 3, 42.0, 4.3, true, 2, 4.4, 'grandlux-hotels'),
('HK-GLX-MAN-004', 'Carmen', 'Silva', 'carmen.silva@grandlux-manhattan.com', '+1-212-555-1103', 'HOUSEKEEPER', 'MORNING', 'WORKING', 22.75, 4.2, 2, 45.5, 4.1, true, 3, 4.2, 'grandlux-hotels'),
('HK-GLX-MAN-005', 'Anna', 'Petrov', 'anna.petrov@grandlux-manhattan.com', '+1-212-555-1104', 'HOUSEKEEPER', 'AFTERNOON', 'AVAILABLE', 22.75, 4.5, 4, 41.0, 4.4, true, 1, 4.5, 'grandlux-hotels'),
('HK-GLX-MAN-006', 'Fatima', 'Hassan', 'fatima.hassan@grandlux-manhattan.com', '+1-212-555-1105', 'HOUSEKEEPER', 'AFTERNOON', 'ON_BREAK', 22.75, 4.3, 3, 43.5, 4.2, true, 2, 4.3, 'grandlux-hotels'),

-- Junior Housekeepers
('HK-GLX-MAN-007', 'Sophie', 'Chen', 'sophie.chen@grandlux-manhattan.com', '+1-212-555-1106', 'HOUSEKEEPER', 'MORNING', 'AVAILABLE', 19.50, 3.8, 2, 52.0, 3.7, true, 1, 3.8, 'grandlux-hotels'),
('HK-GLX-MAN-008', 'Isabella', 'Moreau', 'isabella.moreau@grandlux-manhattan.com', '+1-212-555-1107', 'HOUSEKEEPER', 'AFTERNOON', 'AVAILABLE', 19.50, 3.9, 1, 48.5, 3.8, true, 2, 3.9, 'grandlux-hotels'),
('HK-GLX-MAN-009', 'Priya', 'Sharma', 'priya.sharma@grandlux-manhattan.com', '+1-212-555-1108', 'HOUSEKEEPER', 'EVENING', 'AVAILABLE', 20.25, 4.0, 0, 50.0, 3.9, true, 0, 4.0, 'grandlux-hotels'),

-- Maintenance Staff
('MT-GLX-MAN-001', 'Carlos', 'Mendoza', 'carlos.mendoza@grandlux-manhattan.com', '+1-212-555-1150', 'MAINTENANCE_WORKER', 'FULL_TIME', 'AVAILABLE', 32.00, 4.3, 1, 75.0, 4.2, true, 2, 4.3, 'grandlux-hotels'),
('MT-GLX-MAN-002', 'Viktor', 'Kozlov', 'viktor.kozlov@grandlux-manhattan.com', '+1-212-555-1151', 'MAINTENANCE_WORKER', 'FULL_TIME', 'WORKING', 32.00, 4.1, 0, 85.0, 4.0, true, 3, 4.1, 'grandlux-hotels'),

-- Laundry Team
('LD-GLX-MAN-001', 'Rosa', 'Martinez', 'rosa.martinez@grandlux-manhattan.com', '+1-212-555-1120', 'LAUNDRY', 'MORNING', 'AVAILABLE', 18.75, 4.2, 5, 35.0, 4.1, true, 1, 4.2, 'grandlux-hotels'),
('LD-GLX-MAN-002', 'Liu', 'Wei', 'liu.wei@grandlux-manhattan.com', '+1-212-555-1121', 'LAUNDRY', 'AFTERNOON', 'WORKING', 18.75, 4.0, 3, 38.0, 3.9, true, 2, 4.0, 'grandlux-hotels'),

-- Deep Cleaning Specialists
('DC-GLX-MAN-001', 'Olga', 'Volkova', 'olga.volkova@grandlux-manhattan.com', '+1-212-555-1130', 'DEEP_CLEANING', 'FULL_TIME', 'AVAILABLE', 25.50, 4.6, 1, 95.0, 4.5, true, 1, 4.6, 'grandlux-hotels'),
('DC-GLX-MAN-002', 'Amara', 'Johnson', 'amara.johnson@grandlux-manhattan.com', '+1-212-555-1131', 'DEEP_CLEANING', 'FULL_TIME', 'AVAILABLE', 25.50, 4.4, 0, 88.0, 4.3, true, 0, 4.4, 'grandlux-hotels'),

-- Quality Inspector
('QI-GLX-MAN-001', 'Margaret', 'Thompson', 'margaret.thompson@grandlux-manhattan.com', '+1-212-555-1140', 'INSPECTOR', 'FULL_TIME', 'AVAILABLE', 26.75, 4.9, 8, 25.0, 4.8, true, 2, 4.9, 'grandlux-hotels'),

-- ============= ROYAL PALACE MIAMI BEACH HOUSEKEEPING TEAM =============
-- Supervisors
('HK-RYL-MIA-001', 'Catalina', 'Delgado', 'catalina.delgado@royal-miami.com', '+1-305-555-2100', 'SUPERVISOR', 'MORNING', 'AVAILABLE', 27.00, 4.7, 0, 36.0, 4.6, true, 0, 4.7, 'royal-resorts'),
('HK-RYL-MIA-002', 'Giuseppe', 'Romano', 'giuseppe.romano@royal-miami.com', '+1-305-555-2101', 'SUPERVISOR', 'AFTERNOON', 'AVAILABLE', 27.00, 4.5, 0, 39.0, 4.4, true, 0, 4.5, 'royal-resorts'),

-- Senior Housekeepers
('HK-RYL-MIA-003', 'Esperanza', 'Vargas', 'esperanza.vargas@royal-miami.com', '+1-305-555-2102', 'HOUSEKEEPER', 'MORNING', 'AVAILABLE', 21.50, 4.3, 2, 44.0, 4.2, true, 1, 4.3, 'royal-resorts'),
('HK-RYL-MIA-004', 'Lucia', 'Fernandez', 'lucia.fernandez@royal-miami.com', '+1-305-555-2103', 'HOUSEKEEPER', 'MORNING', 'WORKING', 21.50, 4.1, 3, 46.5, 4.0, true, 2, 4.1, 'royal-resorts'),
('HK-RYL-MIA-005', 'Daniela', 'Cruz', 'daniela.cruz@royal-miami.com', '+1-305-555-2104', 'HOUSEKEEPER', 'AFTERNOON', 'AVAILABLE', 21.50, 4.4, 1, 42.0, 4.3, true, 1, 4.4, 'royal-resorts'),

-- Beach Area Specialists
('PA-RYL-MIA-001', 'Miguel', 'Santos', 'miguel.santos@royal-miami.com', '+1-305-555-2110', 'PUBLIC_AREA', 'MORNING', 'WORKING', 20.00, 4.2, 2, 55.0, 4.1, true, 3, 4.2, 'royal-resorts'),
('PA-RYL-MIA-002', 'Carmen', 'Ochoa', 'carmen.ochoa@royal-miami.com', '+1-305-555-2111', 'PUBLIC_AREA', 'AFTERNOON', 'AVAILABLE', 20.00, 4.0, 1, 58.0, 3.9, true, 1, 4.0, 'royal-resorts'),

-- Maintenance Team
('MT-RYL-MIA-001', 'Roberto', 'Castillo', 'roberto.castillo@royal-miami.com', '+1-305-555-2150', 'MAINTENANCE_WORKER', 'FULL_TIME', 'AVAILABLE', 30.50, 4.2, 1, 90.0, 4.1, true, 2, 4.2, 'royal-resorts'),
('MT-RYL-MIA-002', 'Antonio', 'Ruiz', 'antonio.ruiz@royal-miami.com', '+1-305-555-2151', 'MAINTENANCE_WORKER', 'FULL_TIME', 'WORKING', 30.50, 4.0, 0, 95.0, 3.9, true, 4, 4.0, 'royal-resorts'),

-- ============= SMART STAY TIMES SQUARE HOUSEKEEPING TEAM =============
-- Supervisor
('HK-SMS-NYC-001', 'Jennifer', 'Walsh', 'jennifer.walsh@smartstay-timessquare.com', '+1-212-555-7100', 'SUPERVISOR', 'MORNING', 'AVAILABLE', 24.00, 4.3, 0, 35.0, 4.2, true, 0, 4.3, 'smart-stay'),

-- Housekeepers
('HK-SMS-NYC-002', 'Aisha', 'Okafor', 'aisha.okafor@smartstay-timessquare.com', '+1-212-555-7101', 'HOUSEKEEPER', 'MORNING', 'AVAILABLE', 18.50, 4.0, 3, 35.0, 3.9, true, 2, 4.0, 'smart-stay'),
('HK-SMS-NYC-003', 'Svetlana', 'Popovic', 'svetlana.popovic@smartstay-timessquare.com', '+1-212-555-7102', 'HOUSEKEEPER', 'MORNING', 'WORKING', 18.50, 3.8, 2, 38.0, 3.7, true, 3, 3.8, 'smart-stay'),
('HK-SMS-NYC-004', 'Grace', 'Nyong', 'grace.nyong@smartstay-timessquare.com', '+1-212-555-7103', 'HOUSEKEEPER', 'AFTERNOON', 'AVAILABLE', 18.50, 4.1, 4, 36.5, 4.0, true, 1, 4.1, 'smart-stay'),
('HK-SMS-NYC-005', 'Fatou', 'Diallo', 'fatou.diallo@smartstay-timessquare.com', '+1-212-555-7104', 'HOUSEKEEPER', 'AFTERNOON', 'ON_BREAK', 18.50, 3.9, 2, 37.0, 3.8, true, 2, 3.9, 'smart-stay'),

-- Maintenance
('MT-SMS-NYC-001', 'Jorge', 'Rivera', 'jorge.rivera@smartstay-timessquare.com', '+1-212-555-7150', 'MAINTENANCE_WORKER', 'FULL_TIME', 'AVAILABLE', 26.00, 3.9, 1, 70.0, 3.8, true, 3, 3.9, 'smart-stay'),

-- Public Area Cleaning
('PA-SMS-NYC-001', 'Thanh', 'Nguyen', 'thanh.nguyen@smartstay-timessquare.com', '+1-212-555-7110', 'PUBLIC_AREA', 'MORNING', 'WORKING', 17.50, 4.0, 3, 45.0, 3.9, true, 2, 4.0, 'smart-stay'),

-- ============= ARTISAN COLLECTION CHARLESTON HOUSEKEEPING TEAM =============
-- Supervisor
('HK-ART-CHS-001', 'Magnolia', 'Beauregard', 'magnolia.beauregard@artisan-charleston.com', '+1-843-555-1200', 'SUPERVISOR', 'MORNING', 'AVAILABLE', 23.50, 4.6, 0, 32.0, 4.5, true, 0, 4.6, 'artisan-collection'),

-- Housekeepers (Historic Property Specialists)
('HK-ART-CHS-002', 'Scarlett', 'Morrison', 'scarlett.morrison@artisan-charleston.com', '+1-843-555-1201', 'HOUSEKEEPER', 'MORNING', 'AVAILABLE', 20.25, 4.4, 2, 55.0, 4.3, true, 1, 4.4, 'artisan-collection'),
('HK-ART-CHS-003', 'Cordelia', 'Hayes', 'cordelia.hayes@artisan-charleston.com', '+1-843-555-1202', 'HOUSEKEEPER', 'AFTERNOON', 'WORKING', 20.25, 4.2, 1, 58.0, 4.1, true, 2, 4.2, 'artisan-collection'),
('HK-ART-CHS-004', 'Jasmine', 'Butler', 'jasmine.butler@artisan-charleston.com', '+1-843-555-1203', 'HOUSEKEEPER', 'MORNING', 'AVAILABLE', 20.25, 4.3, 0, 52.0, 4.2, true, 0, 4.3, 'artisan-collection'),

-- Historic Preservation Specialist
('HP-ART-CHS-001', 'Augustus', 'Middleton', 'augustus.middleton@artisan-charleston.com', '+1-843-555-1250', 'MAINTENANCE_WORKER', 'FULL_TIME', 'AVAILABLE', 28.00, 4.5, 0, 120.0, 4.4, true, 1, 4.5, 'artisan-collection'),

-- Art Care Specialist
('AC-ART-CHS-001', 'Celeste', 'Tanner', 'celeste.tanner@artisan-charleston.com', '+1-843-555-1220', 'DEEP_CLEANING', 'PART_TIME', 'AVAILABLE', 24.00, 4.7, 1, 75.0, 4.6, true, 1, 4.7, 'artisan-collection');

-- =============================================
-- PHASE 4: HOUSEKEEPING TASKS DATA
-- =============================================

-- Current tasks for today (August 26, 2025)
INSERT INTO housekeeping_tasks (room_id, assigned_staff_id, task_type, status, priority, description, special_instructions, created_at, assigned_at, started_at, completed_at, estimated_duration_minutes, actual_duration_minutes, quality_score, inspector_notes, tenant_id) VALUES

-- ============= GRANDLUX MANHATTAN TOWER TASKS =============
-- Morning shift tasks (6 AM - 2 PM)
(1, 3, 'CHECKOUT_CLEANING', 'COMPLETED', 'HIGH', 'Deep cleaning after VIP guest checkout', 'Extra attention to marble bathroom, use premium cleaning supplies', '2025-08-26 06:00:00', '2025-08-26 06:15:00', '2025-08-26 06:30:00', '2025-08-26 07:25:00', 45, 55, 5, 'Exceptional work, room ready for immediate occupancy', 'grandlux-hotels'),

(2, 4, 'ROOM_CLEANING', 'IN_PROGRESS', 'NORMAL', 'Standard room cleaning for occupied guest', 'Guest requested late housekeeping service', '2025-08-26 07:00:00', '2025-08-26 08:00:00', '2025-08-26 10:00:00', NULL, 40, NULL, NULL, NULL, 'grandlux-hotels'),

(3, 5, 'INSPECTION', 'COMPLETED', 'NORMAL', 'Quality inspection after housekeeping', 'Check all amenities are properly stocked', '2025-08-26 08:00:00', '2025-08-26 08:15:00', '2025-08-26 08:20:00', '2025-08-26 08:35:00', 15, 15, 4, 'Good overall, minor towel arrangement needed improvement', 'grandlux-hotels'),

(4, 7, 'MAINTENANCE_CLEANING', 'ASSIGNED', 'HIGH', 'Cleaning after HVAC maintenance', 'Coordinate with maintenance team completion', '2025-08-26 09:00:00', '2025-08-26 09:30:00', NULL, NULL, 30, NULL, NULL, NULL, 'grandlux-hotels'),

(5, 8, 'RESTOCKING', 'COMPLETED', 'LOW', 'Restock minibar and amenities', 'Premium guest requested additional champagne', '2025-08-26 07:30:00', '2025-08-26 08:00:00', '2025-08-26 08:15:00', '2025-08-26 08:35:00', 20, 20, 4, 'All items restocked according to luxury standards', 'grandlux-hotels'),

-- Afternoon shift tasks
(6, 5, 'DEEP_CLEANING', 'PENDING_INSPECTION', 'NORMAL', 'Monthly deep cleaning schedule', 'Focus on carpet cleaning and window washing', '2025-08-26 10:00:00', '2025-08-26 14:00:00', '2025-08-26 14:30:00', '2025-08-26 16:45:00', 90, 135, NULL, NULL, 'grandlux-hotels'),

(7, 6, 'GUEST_COMPLAINT_FOLLOWUP', 'COMPLETED', 'URGENT', 'Address guest complaint about bathroom fixtures', 'Guest reported loose faucet and slow drainage', '2025-08-26 11:00:00', '2025-08-26 11:15:00', '2025-08-26 11:30:00', '2025-08-26 12:15:00', 45, 45, 5, 'Issue resolved, guest satisfied with prompt service', 'grandlux-hotels'),

-- Maintenance tasks
(8, 10, 'EQUIPMENT_CHECK', 'IN_PROGRESS', 'NORMAL', 'Weekly equipment maintenance check', 'Test all electronic systems and appliances', '2025-08-26 08:00:00', '2025-08-26 08:30:00', '2025-08-26 09:00:00', NULL, 30, NULL, NULL, NULL, 'grandlux-hotels'),

-- Evening shift preparation
(9, 9, 'ROOM_CLEANING', 'ASSIGNED', 'NORMAL', 'Prepare room for incoming guest', 'VIP arrival expected at 8 PM', '2025-08-26 15:00:00', '2025-08-26 16:00:00', NULL, NULL, 40, NULL, NULL, NULL, 'grandlux-hotels'),

-- Quality inspection tasks
(10, 15, 'QUALITY_CHECK', 'COMPLETED', 'HIGH', 'Final quality check before guest arrival', 'Presidential suite preparation', '2025-08-26 16:00:00', '2025-08-26 16:15:00', '2025-08-26 16:20:00', '2025-08-26 16:40:00', 20, 20, 5, 'Suite meets all luxury standards, ready for VIP guest', 'grandlux-hotels'),

-- ============= ROYAL PALACE MIAMI BEACH TASKS =============
-- Beach resort specific tasks
(46, 16, 'ROOM_CLEANING', 'COMPLETED', 'NORMAL', 'Oceanfront room post-checkout cleaning', 'Extra attention to sand removal and salt air effects', '2025-08-26 07:00:00', '2025-08-26 07:30:00', '2025-08-26 08:00:00', '2025-08-26 08:50:00', 40, 50, 4, 'Room properly cleaned, balcony furniture arranged', 'royal-resorts'),

(47, 17, 'PUBLIC_AREA_CLEANING', 'IN_PROGRESS', 'HIGH', 'Beach access area cleaning', 'High guest traffic area, clean frequently', '2025-08-26 06:00:00', '2025-08-26 06:30:00', '2025-08-26 07:00:00', NULL, 120, NULL, NULL, NULL, 'royal-resorts'),

(48, 18, 'EMERGENCY_CLEANUP', 'COMPLETED', 'URGENT', 'Spill cleanup in oceanview suite', 'Guest spilled red wine on white carpet', '2025-08-26 14:30:00', '2025-08-26 14:35:00', '2025-08-26 14:40:00', '2025-08-26 15:25:00', 45, 45, 4, 'Stain successfully removed, carpet treated', 'royal-resorts'),

(49, 19, 'SEASONAL_PREPARATION', 'ASSIGNED', 'LOW', 'Summer amenities check and restock', 'Beach towels, sunscreen, pool accessories', '2025-08-26 10:00:00', '2025-08-26 11:00:00', NULL, NULL, 60, NULL, NULL, NULL, 'royal-resorts'),

-- Maintenance for beach environment
(50, 24, 'HVAC_MAINTENANCE', 'PENDING', 'NORMAL', 'AC system check due to salt air exposure', 'Monthly maintenance to prevent corrosion', '2025-08-26 08:00:00', NULL, NULL, NULL, 90, NULL, NULL, NULL, 'royal-resorts'),

-- ============= SMART STAY TIMES SQUARE TASKS =============
-- Budget hotel efficient operations
(85, 26, 'CHECKOUT_CLEANING', 'COMPLETED', 'HIGH', 'Quick turnaround cleaning for high occupancy', 'Efficient cleaning for next guest arrival in 2 hours', '2025-08-26 08:00:00', '2025-08-26 08:15:00', '2025-08-26 08:30:00', '2025-08-26 09:00:00', 45, 30, 4, 'Efficient cleaning completed ahead of schedule', 'smart-stay'),

(86, 27, 'ROOM_CLEANING', 'IN_PROGRESS', 'NORMAL', 'Standard daily housekeeping', 'Tourist guest, standard cleaning protocol', '2025-08-26 09:00:00', '2025-08-26 09:30:00', '2025-08-26 10:00:00', NULL, 40, NULL, NULL, NULL, 'smart-stay'),

(87, 28, 'MAINTENANCE_TASK', 'ASSIGNED', 'HIGH', 'Repair leaky faucet in budget room', 'Guest reported dripping overnight', '2025-08-26 10:00:00', '2025-08-26 10:30:00', NULL, NULL, 60, NULL, NULL, NULL, 'smart-stay'),

(88, 29, 'PUBLIC_AREA_CLEANING', 'COMPLETED', 'NORMAL', 'Lobby and corridor maintenance cleaning', 'High foot traffic area cleaning', '2025-08-26 06:00:00', '2025-08-26 06:30:00', '2025-08-26 07:00:00', '2025-08-26 08:30:00', 120, 90, 4, 'Lobby areas cleaned efficiently', 'smart-stay'),

(89, 30, 'RESTOCKING', 'ASSIGNED', 'LOW', 'Restock essential amenities', 'Basic amenities for budget accommodation', '2025-08-26 11:00:00', '2025-08-26 11:30:00', NULL, NULL, 20, NULL, NULL, NULL, 'smart-stay'),

-- ============= ARTISAN COLLECTION CHARLESTON TASKS =============
-- Boutique hotel specialized tasks
(106, 31, 'ROOM_CLEANING', 'COMPLETED', 'NORMAL', 'Artist room cleaning with art preservation', 'Careful dusting of artwork and creative furnishings', '2025-08-26 08:00:00', '2025-08-26 08:30:00', '2025-08-26 09:00:00', '2025-08-26 10:15:00', 40, 75, 5, 'Exceptional care taken with artistic elements', 'artisan-collection'),

(107, 32, 'SPECIAL_REQUEST', 'IN_PROGRESS', 'HIGH', 'Setup creative workspace for artist guest', 'Arrange easel, lighting, and art supplies', '2025-08-26 10:00:00', '2025-08-26 10:30:00', '2025-08-26 11:00:00', NULL, 30, NULL, NULL, NULL, 'artisan-collection'),

(108, 33, 'DEEP_CLEANING', 'PENDING', 'NORMAL', 'Gallery space deep cleaning', 'Prepare for new art exhibition installation', '2025-08-26 14:00:00', NULL, NULL, NULL, 90, NULL, NULL, NULL, 'artisan-collection'),

(109, 34, 'INSPECTION', 'ASSIGNED', 'NORMAL', 'Historic preservation check', 'Monthly check of historic architectural elements', '2025-08-26 13:00:00', '2025-08-26 13:30:00', NULL, NULL, 15, NULL, NULL, NULL, 'artisan-collection'),

-- Art care and preservation
(110, 36, 'SPECIAL_REQUEST', 'COMPLETED', 'HIGH', 'Climate control monitoring for art preservation', 'Adjust humidity and temperature for paintings', '2025-08-26 07:00:00', '2025-08-26 07:15:00', '2025-08-26 07:30:00', '2025-08-26 08:45:00', 75, 75, 5, 'Environmental controls optimized for art preservation', 'artisan-collection');

-- This completes Phase 3 of the comprehensive test data
-- Next phase will include maintenance tasks and reservations data

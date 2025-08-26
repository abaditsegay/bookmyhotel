-- Simple Additional Test Data for Existing Database Structure
-- This adds minimal realistic operational data to the current schema

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- ADDITIONAL HOUSEKEEPING TASKS (using existing room IDs)
-- =============================================

-- Clear existing tasks to add fresh realistic data
DELETE FROM housekeeping_tasks WHERE created_at >= '2025-08-26 00:00:00';

-- Add current day housekeeping tasks (August 26, 2025)
INSERT INTO housekeeping_tasks (room_id, assigned_staff_id, task_type, status, priority, description, special_instructions, created_at, assigned_at, started_at, completed_at, estimated_duration_minutes, actual_duration_minutes, quality_score, inspector_notes, tenant_id) VALUES

-- Use existing room IDs and existing tenant UUIDs
(1, 1, 'CHECKOUT_CLEANING', 'COMPLETED', 'HIGH', 'VIP guest checkout cleaning', 'Extra attention to luxury amenities', '2025-08-26 06:00:00', '2025-08-26 06:15:00', '2025-08-26 06:30:00', '2025-08-26 07:25:00', 45, 55, 5, 'Exceptional service, room ready for next VIP guest', 'd7b7e673-6788-45b2-8dad-4d48944a144e'),

(2, 2, 'CHECKOUT_CLEANING', 'IN_PROGRESS', 'NORMAL', 'Standard occupied room cleaning', 'Guest requested late housekeeping', '2025-08-26 07:00:00', '2025-08-26 08:00:00', '2025-08-26 10:00:00', NULL, 40, NULL, NULL, NULL, 'd7b7e673-6788-45b2-8dad-4d48944a144e'),

(3, 3, 'INSPECTION', 'COMPLETED', 'NORMAL', 'Post-cleaning quality check', 'Verify all amenities properly stocked', '2025-08-26 08:00:00', '2025-08-26 08:15:00', '2025-08-26 08:20:00', '2025-08-26 08:35:00', 15, 15, 4, 'Good overall quality, minor improvements noted', 'd7b7e673-6788-45b2-8dad-4d48944a144e'),

(4, 4, 'MAINTENANCE_CLEANING', 'ASSIGNED', 'HIGH', 'Post-maintenance room cleanup', 'HVAC work completed, thorough cleaning needed', '2025-08-26 09:00:00', '2025-08-26 09:30:00', NULL, NULL, 30, NULL, NULL, NULL, 'd7b7e673-6788-45b2-8dad-4d48944a144e'),

(8, 8, 'CHECKOUT_CLEANING', 'COMPLETED', 'HIGH', 'Quick turnaround cleaning', 'Efficient cleaning for 2-hour turnaround', '2025-08-26 08:00:00', '2025-08-26 08:15:00', '2025-08-26 08:30:00', '2025-08-26 09:00:00', 45, 30, 4, 'Efficient cleaning completed ahead of schedule', 'ed55191d-36e0-4cd4-8b53-0aa6306b802b'),

(9, 9, 'DEEP_CLEANING', 'COMPLETED', 'NORMAL', 'Detailed room deep cleaning', 'Monthly deep clean completed', '2025-08-26 06:00:00', '2025-08-26 06:30:00', '2025-08-26 07:00:00', '2025-08-26 08:30:00', 120, 90, 4, 'Room cleaned efficiently', 'ed55191d-36e0-4cd4-8b53-0aa6306b802b');

-- =============================================
-- ADDITIONAL MAINTENANCE REQUESTS (using existing room IDs)
-- =============================================

-- Clear recent maintenance requests to add fresh data
DELETE FROM maintenance_requests WHERE created_at >= '2025-08-26 00:00:00';

-- Add current maintenance requests (using correct schema and existing IDs)
INSERT INTO maintenance_requests (room_id, reported_by_user_id, assigned_staff_id, title, description, category, priority, status, estimated_cost, estimated_duration_hours, affects_booking, work_notes, created_at, assigned_at, started_at, completed_at, tenant_id) VALUES

-- Use existing room IDs
(1, 1, 15, 'HVAC System Check', 'Room AC unit making noise, needs inspection', 'HVAC', 'HIGH', 'IN_PROGRESS', 200.00, 2, 0, 'Unit being inspected, may need replacement', '2025-08-26 06:30:00', '2025-08-26 08:15:00', '2025-08-26 08:30:00', NULL, 'd7b7e673-6788-45b2-8dad-4d48944a144e'),

(2, 2, 15, 'Bathroom Faucet Repair', 'Luxury faucet showing minor leaks', 'PLUMBING', 'MEDIUM', 'COMPLETED', 150.00, 1, 0, 'Replaced O-rings, leak stopped', '2025-08-25 10:00:00', '2025-08-25 11:00:00', '2025-08-25 14:00:00', '2025-08-25 16:25:00', 'd7b7e673-6788-45b2-8dad-4d48944a144e'),

(8, 8, 16, 'Room Faucet Repair', 'Guest reported constant dripping', 'PLUMBING', 'HIGH', 'COMPLETED', 25.00, 1, 0, 'Replaced washer, dripping stopped', '2025-08-26 08:30:00', '2025-08-26 09:00:00', '2025-08-26 10:00:00', '2025-08-26 11:45:00', 'ed55191d-36e0-4cd4-8b53-0aa6306b802b'),

(9, 9, 16, 'Light Fixture', 'Ceiling light not working properly', 'ELECTRICAL', 'MEDIUM', 'OPEN', 50.00, 1, 0, NULL, '2025-08-26 10:00:00', NULL, NULL, NULL, 'ed55191d-36e0-4cd4-8b53-0aa6306b802b');

-- =============================================
-- ADDITIONAL REALISTIC RESERVATIONS (using existing room IDs)
-- =============================================

-- Add more current and upcoming reservations
INSERT INTO reservations (room_id, guest_id, tenant_id, check_in_date, check_out_date, total_amount, status, confirmation_number, guest_name, special_requests, created_at, updated_at) VALUES

-- Today's check-ins
(3, 11, 'd7b7e673-6788-45b2-8dad-4d48944a144e', '2025-08-26', '2025-08-30', 1296.00, 'CHECKED_IN', 'HTL-2025-TODAY-001', 'Lisa Chen', 'Late check-in, champagne welcome', '2025-08-20 14:30:00', '2025-08-26 15:00:00'),

(10, 12, 'ed55191d-36e0-4cd4-8b53-0aa6306b802b', '2025-08-26', '2025-08-28', 178.00, 'CHECKED_IN', 'HTL-2025-TODAY-002', 'James Wilson', 'Business traveler, quiet room', '2025-08-24 16:20:00', '2025-08-26 14:00:00'),

-- Tomorrow's arrivals
(4, 10, 'd7b7e673-6788-45b2-8dad-4d48944a144e', '2025-08-27', '2025-08-29', 698.00, 'CONFIRMED', 'HTL-2025-TOM-001', 'Maria Rodriguez', 'Anniversary celebration', '2025-08-25 09:15:00', '2025-08-25 09:15:00'),

(11, 9, 'ed55191d-36e0-4cd4-8b53-0aa6306b802b', '2025-08-27', '2025-08-30', 267.00, 'CONFIRMED', 'HTL-2025-TOM-002', 'David Brown', 'Tourist, subway directions needed', '2025-08-26 12:10:00', '2025-08-26 12:10:00');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Additional realistic test data loaded successfully!' as status;
SELECT 
  (SELECT COUNT(*) FROM housekeeping_tasks WHERE created_at >= '2025-08-26 00:00:00') as todays_housekeeping_tasks,
  (SELECT COUNT(*) FROM maintenance_requests WHERE created_at >= '2025-08-26 00:00:00') as todays_maintenance_requests,
  (SELECT COUNT(*) FROM reservations WHERE check_in_date = '2025-08-26') as todays_checkins,
  (SELECT COUNT(*) FROM reservations WHERE check_in_date = '2025-08-27') as tomorrows_arrivals;

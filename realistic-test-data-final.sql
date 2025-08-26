-- Additional Test Data for Existing Database Structure (Final Corrected)
-- This adds more realistic operational data to the current schema

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- ADDITIONAL HOUSEKEEPING TASKS
-- =============================================

-- Clear existing tasks to add fresh realistic data
DELETE FROM housekeeping_tasks WHERE created_at >= '2025-08-26 00:00:00';

-- Add current day housekeeping tasks (August 26, 2025)
INSERT INTO housekeeping_tasks (room_id, assigned_staff_id, task_type, status, priority, description, special_instructions, created_at, assigned_at, started_at, completed_at, estimated_duration_minutes, actual_duration_minutes, quality_score, inspector_notes, tenant_id) VALUES

-- Morning shift tasks
(1, 1, 'CHECKOUT_CLEANING', 'COMPLETED', 'HIGH', 'VIP guest checkout cleaning', 'Extra attention to luxury amenities', '2025-08-26 06:00:00', '2025-08-26 06:15:00', '2025-08-26 06:30:00', '2025-08-26 07:25:00', 45, 55, 5, 'Exceptional service, room ready for next VIP guest', 'luxury-chain'),

(2, 2, 'CHECKOUT_CLEANING', 'IN_PROGRESS', 'NORMAL', 'Standard occupied room cleaning', 'Guest requested late housekeeping', '2025-08-26 07:00:00', '2025-08-26 08:00:00', '2025-08-26 10:00:00', NULL, 40, NULL, NULL, NULL, 'luxury-chain'),

(3, 3, 'INSPECTION', 'COMPLETED', 'NORMAL', 'Post-cleaning quality check', 'Verify all amenities properly stocked', '2025-08-26 08:00:00', '2025-08-26 08:15:00', '2025-08-26 08:20:00', '2025-08-26 08:35:00', 15, 15, 4, 'Good overall quality, minor improvements noted', 'luxury-chain'),

(4, 4, 'MAINTENANCE_CLEANING', 'ASSIGNED', 'HIGH', 'Post-maintenance room cleanup', 'HVAC work completed, thorough cleaning needed', '2025-08-26 09:00:00', '2025-08-26 09:30:00', NULL, NULL, 30, NULL, NULL, NULL, 'luxury-chain'),

(5, 5, 'MAINTENANCE_CLEANING', 'COMPLETED', 'LOW', 'Minibar and amenity restock cleanup', 'Premium guest amenities area cleaned', '2025-08-26 07:30:00', '2025-08-26 08:00:00', '2025-08-26 08:15:00', '2025-08-26 08:35:00', 20, 20, 4, 'All luxury amenities area cleaned', 'luxury-chain'),

-- Afternoon shift tasks
(6, 6, 'DEEP_CLEANING', 'PENDING_INSPECTION', 'NORMAL', 'Monthly deep cleaning', 'Focus on carpet and detailed sanitization', '2025-08-26 10:00:00', '2025-08-26 14:00:00', '2025-08-26 14:30:00', '2025-08-26 16:45:00', 90, 135, NULL, NULL, 'luxury-chain'),

(7, 7, 'MAINTENANCE_CLEANING', 'COMPLETED', 'URGENT', 'Address bathroom fixture cleanup', 'Post-maintenance cleaning after fixture repair', '2025-08-26 11:00:00', '2025-08-26 11:15:00', '2025-08-26 11:30:00', '2025-08-26 12:15:00', 45, 45, 5, 'Issue resolved, guest satisfaction confirmed', 'luxury-chain'),

-- Budget hotel tasks (room_id 40-60 for budget-stays)
(43, 8, 'CHECKOUT_CLEANING', 'COMPLETED', 'HIGH', 'Quick turnaround cleaning', 'Efficient cleaning for 2-hour turnaround', '2025-08-26 08:00:00', '2025-08-26 08:15:00', '2025-08-26 08:30:00', '2025-08-26 09:00:00', 45, 30, 4, 'Efficient cleaning completed ahead of schedule', 'budget-stays'),

(44, 9, 'CHECKOUT_CLEANING', 'IN_PROGRESS', 'NORMAL', 'Standard budget room cleaning', 'Tourist guest, standard protocol', '2025-08-26 09:00:00', '2025-08-26 09:30:00', '2025-08-26 10:00:00', NULL, 40, NULL, NULL, NULL, 'budget-stays'),

(45, 10, 'DEEP_CLEANING', 'COMPLETED', 'NORMAL', 'Lobby and corridor cleaning', 'High traffic area maintenance', '2025-08-26 06:00:00', '2025-08-26 06:30:00', '2025-08-26 07:00:00', '2025-08-26 08:30:00', 120, 90, 4, 'Public areas cleaned efficiently', 'budget-stays'),

-- Boutique hotel tasks (room_id 61-80 for boutique-collection)
(65, 11, 'MAINTENANCE_CLEANING', 'COMPLETED', 'HIGH', 'Art preservation cleaning', 'Careful cleaning around valuable artwork', '2025-08-26 08:00:00', '2025-08-26 08:30:00', '2025-08-26 09:00:00', '2025-08-26 10:15:00', 40, 75, 5, 'Exceptional care with artistic elements', 'boutique-collection'),

(66, 12, 'CHECKOUT_CLEANING', 'IN_PROGRESS', 'HIGH', 'Creative workspace setup cleaning', 'Clean and arrange studio space for artist guest', '2025-08-26 10:00:00', '2025-08-26 10:30:00', '2025-08-26 11:00:00', NULL, 30, NULL, NULL, NULL, 'boutique-collection');

-- =============================================
-- ADDITIONAL MAINTENANCE REQUESTS
-- =============================================

-- Clear recent maintenance requests to add fresh data
DELETE FROM maintenance_requests WHERE created_at >= '2025-08-26 00:00:00';

-- Add current maintenance requests (using correct schema)
INSERT INTO maintenance_requests (room_id, reported_by_user_id, assigned_staff_id, title, description, category, priority, status, estimated_cost, estimated_duration_hours, affects_booking, work_notes, created_at, assigned_at, started_at, completed_at, tenant_id) VALUES

-- Urgent maintenance
(6, 1, 15, 'HVAC System Replacement', 'Presidential suite AC unit making loud noises and not cooling effectively', 'HVAC', 'CRITICAL', 'IN_PROGRESS', 1200.00, 4, 1, 'Guest moved to alternative suite while repair in progress', '2025-08-26 06:30:00', '2025-08-26 08:15:00', '2025-08-26 08:30:00', NULL, 'luxury-chain'),

(8, 2, 15, 'Luxury Bathroom Repair', 'Gold-plated faucet showing wear and minor leaks', 'PLUMBING', 'MEDIUM', 'COMPLETED', 450.00, 2, 0, 'Replaced luxury faucet with identical model', '2025-08-25 10:00:00', '2025-08-25 11:00:00', '2025-08-25 14:00:00', '2025-08-25 16:25:00', 'luxury-chain'),

-- Budget hotel maintenance
(43, 8, 16, 'Budget Room Faucet Repair', 'Guest reported constant dripping', 'PLUMBING', 'HIGH', 'COMPLETED', 25.00, 1, 0, 'Replaced washer, dripping stopped', '2025-08-26 08:30:00', '2025-08-26 09:00:00', '2025-08-26 10:00:00', '2025-08-26 11:45:00', 'budget-stays'),

(44, 9, 16, 'Window AC Maintenance', 'Annual cleaning and maintenance', 'HVAC', 'MEDIUM', 'IN_PROGRESS', 50.00, 1, 0, 'Filter replacement and coil cleaning in progress', '2025-08-26 10:00:00', '2025-08-26 14:00:00', '2025-08-26 14:10:00', NULL, 'budget-stays'),

-- Electrical work
(5, 3, 15, 'Lobby Area Lighting', 'Replace burnt-out luxury light fixtures', 'ELECTRICAL', 'LOW', 'OPEN', 250.00, 2, 0, NULL, '2025-08-26 11:00:00', NULL, NULL, NULL, 'luxury-chain'),

-- Preventive maintenance
(NULL, 4, 15, 'Fire Safety Inspection', 'Monthly fire suppression system check', 'SAFETY', 'HIGH', 'COMPLETED', 800.00, 8, 0, 'All systems checked and functioning properly', '2025-08-20 09:00:00', '2025-08-20 10:00:00', '2025-08-24 08:00:00', '2025-08-25 14:00:00', 'luxury-chain'),

(NULL, 8, 16, 'Elevator Safety Check', 'Monthly elevator inspection', 'SAFETY', 'HIGH', 'COMPLETED', 200.00, 2, 0, 'Annual inspection passed without issues', '2025-08-25 15:00:00', '2025-08-25 16:00:00', '2025-08-25 22:00:00', '2025-08-26 01:00:00', 'budget-stays'),

-- Boutique hotel specialized maintenance
(65, 11, 17, 'Historic Window Restoration', 'Restore 1890s windows with energy efficiency', 'COSMETIC', 'MEDIUM', 'OPEN', 500.00, 6, 0, NULL, '2025-08-26 14:00:00', NULL, NULL, NULL, 'boutique-collection'),

(66, 12, 17, 'Art Gallery Lighting', 'Calibrate lighting for new exhibition', 'ELECTRICAL', 'HIGH', 'COMPLETED', 400.00, 3, 0, 'New LED system installed for artwork protection', '2025-08-26 07:00:00', '2025-08-26 08:00:00', '2025-08-26 09:00:00', '2025-08-26 12:00:00', 'boutique-collection');

-- =============================================
-- ADDITIONAL REALISTIC RESERVATIONS
-- =============================================

-- Add more current and upcoming reservations
INSERT INTO reservations (room_id, guest_id, tenant_id, check_in_date, check_out_date, total_amount, status, confirmation_number, guest_name, special_requests, created_at, updated_at) VALUES

-- Today's check-ins
(15, 11, 'luxury-chain', '2025-08-26', '2025-08-30', 2596.00, 'CHECKED_IN', 'LUX-2025-TODAY-001', 'Lisa Chen', 'Late check-in, champagne welcome', '2025-08-20 14:30:00', '2025-08-26 15:00:00'),

(45, 12, 'budget-stays', '2025-08-26', '2025-08-28', 178.00, 'CHECKED_IN', 'BUD-2025-TODAY-001', 'James Wilson', 'Business traveler, quiet room', '2025-08-24 16:20:00', '2025-08-26 14:00:00'),

-- Tomorrow's arrivals
(16, 10, 'luxury-chain', '2025-08-27', '2025-08-29', 1298.00, 'CONFIRMED', 'LUX-2025-TOM-001', 'Maria Rodriguez', 'Anniversary celebration', '2025-08-25 09:15:00', '2025-08-25 09:15:00'),

(46, 9, 'budget-stays', '2025-08-27', '2025-08-30', 267.00, 'CONFIRMED', 'BUD-2025-TOM-001', 'David Brown', 'Tourist, subway directions needed', '2025-08-26 12:10:00', '2025-08-26 12:10:00'),

-- Weekend bookings
(67, 11, 'boutique-collection', '2025-08-29', '2025-08-31', 590.00, 'CONFIRMED', 'BOU-2025-WEEK-001', 'Sarah Davis', 'Art gallery tours, cultural experiences', '2025-08-25 11:15:00', '2025-08-25 11:15:00'),

-- September advance bookings
(17, 12, 'luxury-chain', '2025-09-05', '2025-09-08', 2147.00, 'CONFIRMED', 'LUX-2025-SEP-001', 'Amanda Luxury', 'Return guest, same preferences', '2025-08-26 18:00:00', '2025-08-26 18:00:00');

-- =============================================
-- ADDITIONAL BOOKING HISTORY
-- =============================================

INSERT INTO booking_history (reservation_id, action_type, performed_by, performed_at, reason, financial_impact, old_values, new_values, created_at) VALUES

-- Today's check-in histories
((SELECT id FROM reservations WHERE confirmation_number = 'LUX-2025-TODAY-001'), 'CREATED', 'lisa.chen@email.com', '2025-08-20 14:30:00', 'Luxury suite reservation', 2596.00, NULL, '{"status": "CONFIRMED", "totalAmount": 2596.00}', '2025-08-20 14:30:00'),

((SELECT id FROM reservations WHERE confirmation_number = 'LUX-2025-TODAY-001'), 'MODIFIED', 'frontdesk@luxury-hotels.com', '2025-08-26 15:00:00', 'Check-in completed', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN"}', '2025-08-26 15:00:00'),

((SELECT id FROM reservations WHERE confirmation_number = 'BUD-2025-TODAY-001'), 'CREATED', 'james.wilson@email.com', '2025-08-24 16:20:00', 'Business travel booking', 178.00, NULL, '{"status": "CONFIRMED", "totalAmount": 178.00}', '2025-08-24 16:20:00'),

((SELECT id FROM reservations WHERE confirmation_number = 'BUD-2025-TODAY-001'), 'MODIFIED', 'frontdesk@budget-stays.com', '2025-08-26 14:00:00', 'Check-in processed', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN"}', '2025-08-26 14:00:00');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Additional realistic test data loaded successfully!' as status;
SELECT 
  (SELECT COUNT(*) FROM housekeeping_tasks WHERE created_at >= '2025-08-26 00:00:00') as todays_housekeeping_tasks,
  (SELECT COUNT(*) FROM maintenance_requests WHERE created_at >= '2025-08-26 00:00:00') as todays_maintenance_requests,
  (SELECT COUNT(*) FROM reservations WHERE check_in_date = '2025-08-26') as todays_checkins,
  (SELECT COUNT(*) FROM reservations WHERE check_in_date = '2025-08-27') as tomorrows_arrivals;

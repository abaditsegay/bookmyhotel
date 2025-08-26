-- Comprehensive Test Data - Phase 4: Maintenance Tasks and Reservations
-- This file continues from comprehensive-test-data-phase3.sql

-- =============================================
-- PHASE 4: MAINTENANCE TASKS DATA
-- =============================================

INSERT INTO maintenance_tasks (tenant_id, hotel_id, room_id, task_type, title, description, status, priority, assigned_to, created_by, reported_by, location, equipment_type, estimated_duration_minutes, actual_duration_minutes, estimated_cost, actual_cost, scheduled_start_time, actual_start_time, actual_end_time, parts_required, tools_required, safety_requirements, work_performed, parts_used, follow_up_required, follow_up_date, follow_up_notes, verification_notes, verified_by, verification_time, created_at, updated_at) VALUES

-- ============= GRANDLUX MANHATTAN TOWER MAINTENANCE =============
-- Current urgent maintenance tasks
('grandlux-hotels', 1, 6, 'HVAC', 'Air conditioning unit replacement', 'Presidential suite AC unit making loud noises and not cooling effectively', 'IN_PROGRESS', 'URGENT', 7, 6, 3, 'Room 306 - Presidential Suite', 'HVAC System', 240, NULL, 1200.00, NULL, '2025-08-26 08:00:00', '2025-08-26 08:15:00', NULL, 'AC compressor unit, refrigerant R-410A, ductwork seals', 'HVAC tools, vacuum pump, manifold gauges, safety equipment', 'Electrical safety procedures, refrigerant handling certification required', NULL, NULL, true, '2025-08-27 08:00:00', 'Follow-up inspection needed 24 hours after completion', NULL, NULL, NULL, '2025-08-26 06:30:00', '2025-08-26 08:15:00'),

('grandlux-hotels', 1, NULL, 'ELEVATOR', 'Elevator #3 modernization', 'Scheduled elevator modernization for main guest elevator', 'ASSIGNED', 'HIGH', 10, 3, NULL, 'Main Tower - Elevator Bank #3', 'Elevator System', 1440, NULL, 25000.00, NULL, '2025-08-27 22:00:00', NULL, NULL, 'Control panel, motor assembly, cables, safety systems', 'Elevator tools, crane equipment, electrical testing tools', 'Confined space safety, electrical lockout procedures, fall protection', NULL, NULL, true, '2025-08-30 08:00:00', 'Full safety inspection and certification required', NULL, NULL, NULL, '2025-08-20 10:00:00', '2025-08-26 07:00:00'),

('grandlux-hotels', 1, 8, 'PLUMBING', 'Luxury bathroom fixture repair', 'Gold-plated faucet in suite showing signs of wear and minor leaks', 'COMPLETED', 'NORMAL', 10, 6, 4, 'Room 401 - Executive Suite Bathroom', 'Plumbing Fixtures', 120, 135, 450.00, 485.00, '2025-08-25 14:00:00', '2025-08-25 14:10:00', '2025-08-25 16:25:00', 'Luxury faucet cartridge, gold plating repair kit, seals', 'Plumbing tools, torque wrench, polishing equipment', 'Water shutoff procedures, slip hazard prevention', 'Replaced cartridge, resealed connections, polished gold finish', 'Premium cartridge, sealant, polishing compound', false, NULL, NULL, 'Repair completed to luxury standards, guest satisfaction confirmed', 6, '2025-08-25 17:00:00', '2025-08-25 10:00:00', '2025-08-25 16:25:00'),

('grandlux-hotels', 1, NULL, 'ELECTRICAL', 'Lobby chandelier rewiring', 'Historic crystal chandelier requires electrical system upgrade', 'PENDING', 'LOW', NULL, 3, NULL, 'Main Lobby - Central Chandelier', 'Lighting System', 360, NULL, 2500.00, NULL, '2025-08-28 10:00:00', NULL, NULL, 'LED lighting system, new wiring harness, control modules', 'Electrical tools, ladder/lift equipment, multimeter', 'Electrical safety, work at height procedures, crystal handling', NULL, NULL, true, '2025-08-29 10:00:00', 'Professional cleaning and inspection of crystal elements', NULL, NULL, NULL, '2025-08-26 11:00:00', '2025-08-26 11:00:00'),

-- Preventive maintenance
('grandlux-hotels', 1, NULL, 'PREVENTIVE', 'Monthly fire safety system inspection', 'Scheduled monthly inspection of fire suppression and alarm systems', 'VERIFIED', 'HIGH', 10, 6, NULL, 'Entire Hotel - All Fire Safety Systems', 'Fire Safety Equipment', 480, 465, 800.00, 750.00, '2025-08-25 06:00:00', '2025-08-25 06:00:00', '2025-08-25 13:45:00', 'Replacement batteries, sensor cleaning supplies', 'Fire safety testing equipment, battery tester, multimeter', 'Fire department coordination, system testing procedures', 'Tested all smoke detectors, sprinkler systems, and alarm panels. Replaced 12 batteries, cleaned sensors', 'Lithium batteries (12), cleaning supplies', true, '2025-09-25 06:00:00', 'Next monthly inspection scheduled', 'All systems functioning within normal parameters, certificate issued', 6, '2025-08-25 14:00:00', '2025-08-20 09:00:00', '2025-08-25 14:00:00'),

-- ============= ROYAL PALACE MIAMI BEACH MAINTENANCE =============
-- Beach environment specific maintenance
('royal-resorts', 4, 47, 'HVAC', 'Salt air corrosion prevention treatment', 'Monthly HVAC maintenance for beach environment protection', 'ASSIGNED', 'NORMAL', 24, 16, NULL, 'Room 102 - Oceanfront Suite', 'HVAC System', 180, NULL, 350.00, NULL, '2025-08-26 15:00:00', NULL, NULL, 'Anti-corrosion coating, air filters, cleaning supplies', 'HVAC cleaning tools, spray equipment, protective gear', 'Chemical safety procedures for anti-corrosion treatment', NULL, NULL, true, '2025-09-26 15:00:00', 'Monthly preventive treatment for salt air exposure', NULL, NULL, NULL, '2025-08-26 09:00:00', '2025-08-26 09:00:00'),

('royal-resorts', 4, NULL, 'POOL', 'Pool equipment maintenance and chemical balance', 'Weekly pool system maintenance and water quality check', 'IN_PROGRESS', 'HIGH', 25, 16, NULL, 'Main Pool Area - Equipment Room', 'Pool Equipment', 240, NULL, 200.00, NULL, '2025-08-26 06:00:00', '2025-08-26 06:30:00', NULL, 'Pool chemicals, filter cartridges, testing supplies', 'Pool maintenance equipment, chemical testing kit', 'Chemical safety procedures, pool area safety protocols', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, '2025-08-26 05:00:00', '2025-08-26 06:30:00'),

('royal-resorts', 4, 50, 'ELECTRICAL', 'Oceanview balcony lighting repair', 'Guest reported flickering lights on private balcony', 'COMPLETED', 'NORMAL', 24, 15, 15, 'Room 201 - Oceanview Deluxe Balcony', 'Outdoor Lighting', 90, 85, 150.00, 140.00, '2025-08-25 16:00:00', '2025-08-25 16:15:00', '2025-08-25 17:40:00', 'Weather-resistant LED bulbs, electrical connectors', 'Electrical tools, voltage tester, weather protection', 'Electrical safety for outdoor work, weather considerations', 'Replaced corroded connections and weather-resistant LED bulbs', 'Marine-grade connectors, LED bulbs', false, NULL, NULL, 'Lighting restored, weather protection improved', 16, '2025-08-25 18:00:00', '2025-08-25 14:00:00', '2025-08-25 17:40:00'),

-- Beach facility maintenance
('royal-resorts', 4, NULL, 'DECK', 'Beach deck weatherproofing', 'Annual deck maintenance and weatherproofing treatment', 'PENDING', 'LOW', NULL, 14, NULL, 'Beach Access Deck - Main Boardwalk', 'Deck Infrastructure', 600, NULL, 1800.00, NULL, '2025-08-28 06:00:00', NULL, NULL, 'Weather-resistant stain, deck screws, sealant', 'Power sanders, pressure washer, application tools', 'Slip hazard prevention, chemical safety for wood treatment', NULL, NULL, true, '2025-08-30 10:00:00', 'Inspect after 48-hour curing period', NULL, NULL, NULL, '2025-08-26 12:00:00', '2025-08-26 12:00:00'),

-- ============= SMART STAY TIMES SQUARE MAINTENANCE =============
-- Budget hotel efficient maintenance
('smart-stay', 17, 87, 'PLUMBING', 'Bathroom faucet drip repair', 'Guest reported constant dripping keeping them awake', 'COMPLETED', 'HIGH', 31, 27, 28, 'Room 304 - Guest Bathroom', 'Plumbing Fixtures', 45, 40, 25.00, 22.00, '2025-08-26 11:00:00', '2025-08-26 11:05:00', '2025-08-26 11:45:00', 'Faucet washer, O-rings', 'Basic plumbing tools, adjustable wrench', 'Water shutoff procedures', 'Replaced worn washer and O-rings, tested operation', 'Rubber washers, O-rings', false, NULL, NULL, 'Drip eliminated, guest can rest comfortably', 27, '2025-08-26 12:00:00', '2025-08-26 08:30:00', '2025-08-26 11:45:00'),

('smart-stay', 17, NULL, 'ELECTRICAL', 'Lobby lighting efficiency upgrade', 'Upgrade to LED lighting for energy savings', 'ASSIGNED', 'LOW', 31, 25, NULL, 'Main Lobby - Overhead Lighting', 'Lighting System', 180, NULL, 300.00, NULL, '2025-08-27 09:00:00', NULL, NULL, 'LED bulb retrofit kits, ballast bypasses', 'Electrical tools, ladder, light meter', 'Electrical safety procedures', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, '2025-08-26 13:00:00', '2025-08-26 13:00:00'),

('smart-stay', 17, 88, 'HVAC', 'Window AC unit cleaning and maintenance', 'Annual maintenance for guest room AC units', 'IN_PROGRESS', 'NORMAL', 31, 27, NULL, 'Room 308 - Window Air Conditioning Unit', 'HVAC System', 60, NULL, 50.00, NULL, '2025-08-26 14:00:00', '2025-08-26 14:10:00', NULL, 'Air filter, cleaning supplies, lubricant', 'AC maintenance tools, vacuum, cleaning supplies', 'Electrical safety for AC maintenance', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, '2025-08-26 10:00:00', '2025-08-26 14:10:00'),

-- Infrastructure maintenance
('smart-stay', 17, NULL, 'ELEVATOR', 'Elevator inspection and adjustment', 'Monthly elevator safety inspection', 'VERIFIED', 'HIGH', 31, 25, NULL, 'Main Elevator - Floors 1-15', 'Elevator System', 120, 115, 200.00, 190.00, '2025-08-25 22:00:00', '2025-08-25 22:00:00', '2025-08-26 00:00:00', 'Elevator oil, cable lubricant', 'Elevator testing equipment, lubrication tools', 'Elevator safety procedures, after-hours work protocol', 'Lubricated cables, tested safety systems, adjusted door timing', 'Hydraulic oil, cable lubricant', true, '2025-09-25 22:00:00', 'Next monthly inspection scheduled', 'All safety systems functioning within specifications', 25, '2025-08-26 01:00:00', '2025-08-25 15:00:00', '2025-08-26 01:00:00'),

-- ============= ARTISAN COLLECTION CHARLESTON MAINTENANCE =============
-- Historic property specialized maintenance
('artisan-collection', 23, NULL, 'HISTORIC', 'Historic window restoration', 'Restore original 1890s windows while maintaining energy efficiency', 'PENDING', 'NORMAL', 35, 30, NULL, 'Second Floor - Original Bay Windows', 'Historic Windows', 960, NULL, 3500.00, NULL, '2025-08-29 08:00:00', NULL, NULL, 'Period-appropriate glazing compound, restoration hardware', 'Historic restoration tools, glazing tools, safety equipment', 'Historic preservation guidelines, lead paint safety', NULL, NULL, true, '2025-09-05 10:00:00', 'Historic preservation society inspection required', NULL, NULL, NULL, '2025-08-26 14:00:00', '2025-08-26 14:00:00'),

('artisan-collection', 23, 108, 'ELECTRICAL', 'Art gallery lighting calibration', 'Adjust lighting for new art exhibition opening', 'COMPLETED', 'HIGH', 35, 32, 31, 'Room 203 - Artist Suite Gallery Space', 'Art Lighting System', 180, 175, 400.00, 380.00, '2025-08-26 09:00:00', '2025-08-26 09:05:00', '2025-08-26 12:00:00', 'Specialty art bulbs, dimmer controls, color filters', 'Light meter, electrical tools, color temperature meter', 'UV protection procedures, electrical safety', 'Calibrated lighting for optimal art display, installed UV filters', 'Full spectrum LED bulbs, UV filters, dimmer modules', false, NULL, NULL, 'Lighting optimized for art preservation and viewing', 30, '2025-08-26 13:00:00', '2025-08-26 07:00:00', '2025-08-26 12:00:00'),

('artisan-collection', 23, NULL, 'HVAC', 'Climate control for art preservation', 'Precise humidity and temperature control for artwork protection', 'ASSIGNED', 'HIGH', 35, 30, NULL, 'Gallery Spaces - Climate Control System', 'Climate Control System', 300, NULL, 600.00, NULL, '2025-08-26 16:00:00', NULL, NULL, 'Humidity sensors, air filters, control modules', 'HVAC precision tools, humidity meter, calibration equipment', 'Art preservation protocols, system calibration procedures', NULL, NULL, true, '2025-08-27 16:00:00', 'Daily monitoring for first week after adjustment', NULL, NULL, NULL, '2025-08-26 11:00:00', '2025-08-26 11:00:00'),

-- Historic preservation maintenance
('artisan-collection', 23, NULL, 'HISTORIC', 'Antique hardwood floor restoration', 'Restore and protect original 1890s heart pine floors', 'VERIFIED', 'NORMAL', 35, 30, NULL, 'Main Gallery Floor - Original Heart Pine', 'Historic Flooring', 1200, 1180, 2800.00, 2750.00, '2025-08-20 06:00:00', '2025-08-20 06:00:00', '2025-08-22 18:00:00', 'Period-appropriate wood stain, protective finish, restoration materials', 'Floor sanders, hand tools, finishing equipment', 'Historic preservation standards, dust control, ventilation', 'Carefully sanded, stained, and finished floors using period-appropriate methods', 'Linseed oil-based stain, polyurethane finish, restoration compounds', true, '2025-09-20 10:00:00', 'Quarterly inspection and maintenance of finish', 'Restoration meets historic preservation standards, excellent craftsmanship', 30, '2025-08-23 10:00:00', '2025-08-18 10:00:00', '2025-08-23 10:00:00');

-- =============================================
-- PHASE 5: COMPREHENSIVE RESERVATIONS DATA
-- =============================================

INSERT INTO reservations (room_id, guest_id, tenant_id, check_in_date, check_out_date, total_amount, status, confirmation_number, guest_name, special_requests, created_at, updated_at) VALUES

-- ============= CURRENT AND UPCOMING RESERVATIONS =============
-- GrandLux Manhattan Tower reservations (High-end clientele)
(5, 42, 'grandlux-hotels', '2025-08-26', '2025-08-30', 5196.00, 'CHECKED_IN', 'GLX-MAN-2025-001', 'Amanda Luxury', 'Presidential suite setup, champagne service, late checkout requested', '2025-08-20 14:30:00', '2025-08-26 15:00:00'),

(2, 37, 'grandlux-hotels', '2025-08-27', '2025-08-29', 930.00, 'CONFIRMED', 'GLX-MAN-2025-002', 'Michael Business', 'Business center access, early breakfast, quiet room preferred', '2025-08-25 09:15:00', '2025-08-25 09:15:00'),

(7, 36, 'grandlux-hotels', '2025-08-28', '2025-09-02', 3900.00, 'CONFIRMED', 'GLX-MAN-2025-003', 'Emily Explorer', 'City tour recommendations, museum tickets, concierge assistance', '2025-08-26 11:20:00', '2025-08-26 11:20:00'),

(9, 39, 'grandlux-hotels', '2025-09-01', '2025-09-05', 2565.00, 'CONFIRMED', 'GLX-MAN-2025-004', 'David Frequent', 'Frequent guest preferences, room 1609, loyalty program benefits', '2025-08-26 16:45:00', '2025-08-26 16:45:00'),

-- GrandLux Beverly Hills reservations
(11, 42, 'grandlux-hotels', '2025-09-05', '2025-09-08', 1347.00, 'CONFIRMED', 'GLX-BH-2025-001', 'Amanda Luxury', 'Shopping assistance, spa appointments, celebrity privacy required', '2025-08-25 13:30:00', '2025-08-25 13:30:00'),

-- Royal Palace Miami Beach reservations (Vacation and leisure)
(47, 38, 'royal-resorts', '2025-08-26', '2025-08-31', 2900.00, 'CHECKED_IN', 'RYL-MIA-2025-001', 'Sarah Vacation', 'Beachfront room, spa services, romantic dinner arrangements', '2025-08-22 10:15:00', '2025-08-26 14:00:00'),

(48, 44, 'royal-resorts', '2025-08-28', '2025-09-01', 2320.00, 'CONFIRMED', 'RYL-MIA-2025-002', 'Michelle Family', 'Family-friendly amenities, kids activities, adjoining rooms if available', '2025-08-26 08:30:00', '2025-08-26 08:30:00'),

(50, 41, 'royal-resorts', '2025-09-02', '2025-09-07', 3480.00, 'CONFIRMED', 'RYL-MIA-2025-003', 'Robert Leisure', 'Golf arrangements, leisure activities, pool cabana reservation', '2025-08-26 15:20:00', '2025-08-26 15:20:00'),

-- Business Select Seattle reservations (Business travelers)
(55, 37, 'business-select', '2025-08-27', '2025-08-29', 358.00, 'CONFIRMED', 'BIZ-SEA-2025-001', 'Michael Business', 'Conference room access, tech support, business center services', '2025-08-26 12:10:00', '2025-08-26 12:10:00'),

(56, 40, 'business-select', '2025-08-29', '2025-09-01', 537.00, 'CONFIRMED', 'BIZ-SEA-2025-002', 'Jessica Conference', 'Conference attendee, shuttle to convention center, early checkout', '2025-08-26 14:45:00', '2025-08-26 14:45:00'),

-- Smart Stay Times Square reservations (Budget travelers)
(86, 35, 'smart-stay', '2025-08-26', '2025-08-28', 298.00, 'CHECKED_IN', 'SMS-NYC-2025-001', 'John Traveler', 'Budget accommodation, tourist information, subway directions', '2025-08-24 16:20:00', '2025-08-26 15:30:00'),

(88, 43, 'smart-stay', '2025-08-27', '2025-08-30', 447.00, 'CONFIRMED', 'SMS-NYC-2025-002', 'Christopher Budget', 'Cost-effective stay, local dining recommendations, tourist attractions', '2025-08-26 09:45:00', '2025-08-26 09:45:00'),

(90, 36, 'smart-stay', '2025-08-30', '2025-09-02', 537.00, 'CONFIRMED', 'SMS-NYC-2025-003', 'Emily Explorer', 'Broadway show recommendations, Times Square activities', '2025-08-26 17:30:00', '2025-08-26 17:30:00'),

-- Artisan Collection Charleston reservations (Cultural travelers)
(107, 38, 'artisan-collection', '2025-08-27', '2025-08-30', 975.00, 'CONFIRMED', 'ART-CHS-2025-001', 'Sarah Vacation', 'Art gallery tours, historic district walking tours, cultural experiences', '2025-08-25 11:15:00', '2025-08-25 11:15:00'),

(109, 41, 'artisan-collection', '2025-09-01', '2025-09-04', 1335.00, 'CONFIRMED', 'ART-CHS-2025-002', 'Robert Leisure', 'Artistic workshops, photography opportunities, cultural immersion', '2025-08-26 13:25:00', '2025-08-26 13:25:00'),

-- ============= HISTORICAL RESERVATIONS (COMPLETED) =============
-- Past reservations for testing booking history
(1, 35, 'grandlux-hotels', '2025-08-20', '2025-08-24', 1800.00, 'CHECKED_OUT', 'GLX-MAN-2025-H001', 'John Traveler', 'First luxury experience, concierge recommendations', '2025-08-15 10:30:00', '2025-08-24 12:00:00'),

(46, 39, 'royal-resorts', '2025-08-15', '2025-08-20', 1900.00, 'CHECKED_OUT', 'RYL-MIA-2025-H001', 'David Frequent', 'Regular guest, usual preferences, beach access', '2025-08-10 14:20:00', '2025-08-20 11:00:00'),

(85, 43, 'smart-stay', '2025-08-18', '2025-08-22', 596.00, 'CHECKED_OUT', 'SMS-NYC-2025-H001', 'Christopher Budget', 'Budget business trip, basic amenities', '2025-08-16 16:45:00', '2025-08-22 10:30:00'),

-- ============= CANCELLED RESERVATIONS =============
-- Cancellations for testing cancellation policies
(3, 44, 'grandlux-hotels', '2025-08-29', '2025-09-02', 2592.00, 'CANCELLED', 'GLX-MAN-2025-C001', 'Michelle Family', 'Family emergency, requested full refund', '2025-08-24 09:00:00', '2025-08-26 10:15:00'),

(51, 40, 'royal-resorts', '2025-08-31', '2025-09-05', 2640.00, 'CANCELLED', 'RYL-MIA-2025-C001', 'Jessica Conference', 'Conference cancelled due to weather', '2025-08-22 15:30:00', '2025-08-25 14:20:00'),

-- ============= FUTURE BOOKINGS (ADVANCE RESERVATIONS) =============
-- September and October bookings
(4, 42, 'grandlux-hotels', '2025-09-15', '2025-09-18', 4185.00, 'CONFIRMED', 'GLX-MAN-2025-F001', 'Amanda Luxury', 'Return guest, same preferences as previous stay', '2025-08-26 18:00:00', '2025-08-26 18:00:00'),

(49, 38, 'royal-resorts', '2025-10-01', '2025-10-07', 4200.00, 'CONFIRMED', 'RYL-MIA-2025-F001', 'Sarah Vacation', 'Anniversary celebration, special arrangements needed', '2025-08-26 19:15:00', '2025-08-26 19:15:00'),

(110, 41, 'artisan-collection', '2025-09-20', '2025-09-25', 2225.00, 'CONFIRMED', 'ART-CHS-2025-F001', 'Robert Leisure', 'Art festival attendance, workshop participation', '2025-08-26 20:30:00', '2025-08-26 20:30:00');

-- This completes Phase 4 of the comprehensive test data
-- Next phase will include booking history and additional operational data

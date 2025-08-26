-- Comprehensive Test Data - Phase 5: Booking History and Operational Data
-- This file continues from comprehensive-test-data-phase4.sql

-- =============================================
-- PHASE 5: BOOKING HISTORY DATA
-- =============================================

INSERT INTO booking_history (reservation_id, action_type, performed_by, performed_at, reason, financial_impact, old_values, new_values, created_at) VALUES

-- ============= CURRENT RESERVATION HISTORIES =============
-- Amanda Luxury's Presidential Suite booking (reservation_id: 1)
(1, 'CREATED', 'amanda.luxury@email.com', '2025-08-20 14:30:00', 'Initial luxury suite reservation', 5196.00, NULL, '{"status": "CONFIRMED", "totalAmount": 5196.00, "room": "Presidential Suite", "specialRequests": "champagne service"}', '2025-08-20 14:30:00'),
(1, 'MODIFIED', 'concierge.manhattan@grandlux.com', '2025-08-22 10:15:00', 'Added late checkout service', 150.00, '{"checkoutTime": "11:00", "totalAmount": 5196.00}', '{"checkoutTime": "15:00", "totalAmount": 5346.00}', '2025-08-22 10:15:00'),
(1, 'MODIFIED', 'frontdesk.manhattan@grandlux.com', '2025-08-26 15:00:00', 'Check-in completed, room assigned', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN", "roomAssigned": "4601"}', '2025-08-26 15:00:00'),

-- Michael Business's reservation (reservation_id: 2)
(2, 'CREATED', 'michael.business@email.com', '2025-08-25 09:15:00', 'Business traveler reservation', 930.00, NULL, '{"status": "CONFIRMED", "totalAmount": 930.00, "businessServices": true}', '2025-08-25 09:15:00'),

-- Emily Explorer's extended stay (reservation_id: 3)
(3, 'CREATED', 'emily.explorer@email.com', '2025-08-26 11:20:00', 'Extended vacation booking', 3900.00, NULL, '{"status": "CONFIRMED", "totalAmount": 3900.00, "duration": "5 nights"}', '2025-08-26 11:20:00'),

-- Sarah Vacation's Miami beach stay (reservation_id: 6)
(6, 'CREATED', 'sarah.vacation@email.com', '2025-08-22 10:15:00', 'Romantic beach vacation', 2900.00, NULL, '{"status": "CONFIRMED", "totalAmount": 2900.00, "beachfront": true}', '2025-08-22 10:15:00'),
(6, 'MODIFIED', 'frontdesk.miami@royal-resorts.com', '2025-08-24 14:30:00', 'Added spa package', 450.00, '{"totalAmount": 2900.00}', '{"totalAmount": 3350.00, "spaPackage": "Couples Romance"}', '2025-08-24 14:30:00'),
(6, 'MODIFIED', 'frontdesk.miami@royal-resorts.com', '2025-08-26 14:00:00', 'Check-in completed', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN", "actualArrival": "14:00"}', '2025-08-26 14:00:00'),

-- John Traveler's budget NYC stay (reservation_id: 11)
(11, 'CREATED', 'john.traveler@email.com', '2025-08-24 16:20:00', 'Budget tourism booking', 298.00, NULL, '{"status": "CONFIRMED", "totalAmount": 298.00, "roomType": "budget"}', '2025-08-24 16:20:00'),
(11, 'MODIFIED', 'frontdesk.timessquare@smartstay.com', '2025-08-26 15:30:00', 'Early check-in completed', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN", "earlyCheckin": true}', '2025-08-26 15:30:00'),

-- ============= HISTORICAL BOOKING HISTORIES =============
-- John Traveler's completed luxury experience (reservation_id: 17)
(17, 'CREATED', 'john.traveler@email.com', '2025-08-15 10:30:00', 'First luxury hotel experience', 1800.00, NULL, '{"status": "CONFIRMED", "totalAmount": 1800.00, "firstLuxury": true}', '2025-08-15 10:30:00'),
(17, 'MODIFIED', 'concierge.manhattan@grandlux.com', '2025-08-19 16:45:00', 'Concierge services added', 200.00, '{"totalAmount": 1800.00}', '{"totalAmount": 2000.00, "conciergeServices": "city tour, restaurant reservations"}', '2025-08-19 16:45:00'),
(17, 'MODIFIED', 'frontdesk.manhattan@grandlux.com', '2025-08-20 15:00:00', 'Check-in processed', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN"}', '2025-08-20 15:00:00'),
(17, 'MODIFIED', 'frontdesk.manhattan@grandlux.com', '2025-08-24 12:00:00', 'Check-out completed, excellent feedback', 0.00, '{"status": "CHECKED_IN"}', '{"status": "CHECKED_OUT", "guestSatisfaction": "excellent"}', '2025-08-24 12:00:00'),

-- David Frequent's Miami stay (reservation_id: 18)
(18, 'CREATED', 'david.frequent@email.com', '2025-08-10 14:20:00', 'Loyalty program booking', 1900.00, NULL, '{"status": "CONFIRMED", "totalAmount": 1900.00, "loyaltyDiscount": 10}', '2025-08-10 14:20:00'),
(18, 'MODIFIED', 'frontdesk.miami@royal-resorts.com', '2025-08-12 09:00:00', 'Loyalty upgrade applied', -190.00, '{"totalAmount": 1900.00, "roomType": "standard"}', '{"totalAmount": 1710.00, "roomType": "deluxe", "loyaltyUpgrade": true}', '2025-08-12 09:00:00'),
(18, 'MODIFIED', 'frontdesk.miami@royal-resorts.com', '2025-08-15 16:00:00', 'Check-in with VIP welcome', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN", "vipWelcome": true}', '2025-08-15 16:00:00'),
(18, 'MODIFIED', 'frontdesk.miami@royal-resorts.com', '2025-08-20 11:00:00', 'Smooth checkout, return guest', 0.00, '{"status": "CHECKED_IN"}', '{"status": "CHECKED_OUT", "returnGuestIncentive": "5% next stay"}', '2025-08-20 11:00:00'),

-- ============= CANCELLATION HISTORIES =============
-- Michelle Family's cancelled reservation (reservation_id: 19)
(19, 'CREATED', 'michelle.family@email.com', '2025-08-24 09:00:00', 'Family vacation booking', 2592.00, NULL, '{"status": "CONFIRMED", "totalAmount": 2592.00, "familyPackage": true}', '2025-08-24 09:00:00'),
(19, 'CANCELLED', 'michelle.family@email.com', '2025-08-26 10:15:00', 'Family emergency cancellation', -2592.00, '{"status": "CONFIRMED", "totalAmount": 2592.00}', '{"status": "CANCELLED", "refundAmount": 2592.00, "reason": "family emergency"}', '2025-08-26 10:15:00'),

-- Jessica Conference's weather-related cancellation (reservation_id: 20)
(20, 'CREATED', 'jessica.conference@email.com', '2025-08-22 15:30:00', 'Conference attendee booking', 2640.00, NULL, '{"status": "CONFIRMED", "totalAmount": 2640.00, "conferenceRate": true}', '2025-08-22 15:30:00'),
(20, 'CANCELLED', 'jessica.conference@email.com', '2025-08-25 14:20:00', 'Conference cancelled due to hurricane warning', -1584.00, '{"status": "CONFIRMED", "totalAmount": 2640.00}', '{"status": "CANCELLED", "refundAmount": 1584.00, "reason": "force majeure"}', '2025-08-25 14:20:00'),

-- ============= FUTURE BOOKING HISTORIES =============
-- Amanda Luxury's September return booking (reservation_id: 21)
(21, 'CREATED', 'amanda.luxury@email.com', '2025-08-26 18:00:00', 'Return guest advance booking', 4185.00, NULL, '{"status": "CONFIRMED", "totalAmount": 4185.00, "returnGuest": true, "advanceBooking": true}', '2025-08-26 18:00:00'),

-- Sarah Vacation's anniversary booking (reservation_id: 22)
(22, 'CREATED', 'sarah.vacation@email.com', '2025-08-26 19:15:00', 'Anniversary celebration booking', 4200.00, NULL, '{"status": "CONFIRMED", "totalAmount": 4200.00, "anniversary": true, "specialOccasion": true}', '2025-08-26 19:15:00');

-- =============================================
-- PHASE 6: PROMOTIONAL CODES AND PRICING DATA
-- =============================================

INSERT INTO promotional_codes (tenant_id, code, description, discount_type, discount_value, valid_from, valid_until, is_active, minimum_stay_nights, maximum_uses, current_uses, applicable_room_types, created_at, updated_at) VALUES

-- ============= GRANDLUX HOTELS PROMOTIONS =============
('grandlux-hotels', 'LUXURY25', 'Luxury Experience 25% Off', 'PERCENTAGE', 25.00, '2025-08-01 00:00:00', '2025-12-31 23:59:59', true, 2, 100, 15, 'DELUXE,SUITE,PRESIDENTIAL', '2025-08-01 10:00:00', '2025-08-26 14:30:00'),
('grandlux-hotels', 'BUSINESS50', 'Business Traveler Discount', 'FIXED', 50.00, '2025-08-01 00:00:00', '2025-11-30 23:59:59', true, 1, 200, 45, 'SINGLE,DELUXE', '2025-08-01 10:00:00', '2025-08-26 09:15:00'),
('grandlux-hotels', 'SUITE500', 'Suite Upgrade Incentive', 'FIXED', 500.00, '2025-08-15 00:00:00', '2025-10-15 23:59:59', true, 3, 50, 8, 'SUITE,PRESIDENTIAL', '2025-08-15 12:00:00', '2025-08-26 11:20:00'),
('grandlux-hotels', 'LOYALTY15', 'Loyalty Member Benefit', 'PERCENTAGE', 15.00, '2025-01-01 00:00:00', '2025-12-31 23:59:59', true, 1, 1000, 127, 'SINGLE,DELUXE,SUITE', '2025-01-01 00:00:00', '2025-08-26 16:45:00'),

-- ============= ROYAL RESORTS PROMOTIONS =============
('royal-resorts', 'BEACH30', 'Beach Paradise Special', 'PERCENTAGE', 30.00, '2025-06-01 00:00:00', '2025-09-30 23:59:59', true, 3, 150, 42, 'SINGLE,DELUXE,SUITE', '2025-06-01 09:00:00', '2025-08-26 10:15:00'),
('royal-resorts', 'ROMANTIC200', 'Romantic Getaway Package', 'FIXED', 200.00, '2025-08-01 00:00:00', '2025-12-31 23:59:59', true, 2, 75, 18, 'DELUXE,SUITE,PRESIDENTIAL', '2025-08-01 11:00:00', '2025-08-22 10:15:00'),
('royal-resorts', 'FAMILY20', 'Family Vacation Discount', 'PERCENTAGE', 20.00, '2025-07-01 00:00:00', '2025-08-31 23:59:59', true, 4, 100, 23, 'SUITE,PRESIDENTIAL', '2025-07-01 10:00:00', '2025-08-26 08:30:00'),
('royal-resorts', 'EXTENDED10', 'Extended Stay Reward', 'PERCENTAGE', 10.00, '2025-08-01 00:00:00', '2025-12-31 23:59:59', true, 7, 200, 12, 'SINGLE,DELUXE,SUITE', '2025-08-01 08:00:00', '2025-08-26 15:20:00'),

-- ============= BUSINESS SELECT PROMOTIONS =============
('business-select', 'CORP25', 'Corporate Rate Discount', 'PERCENTAGE', 25.00, '2025-08-01 00:00:00', '2025-12-31 23:59:59', true, 1, 300, 89, 'SINGLE,DELUXE', '2025-08-01 07:00:00', '2025-08-26 12:10:00'),
('business-select', 'CONFERENCE15', 'Conference Attendee Rate', 'PERCENTAGE', 15.00, '2025-08-01 00:00:00', '2025-11-30 23:59:59', true, 1, 500, 156, 'SINGLE,DELUXE,SUITE', '2025-08-01 08:00:00', '2025-08-26 14:45:00'),
('business-select', 'WEEKLY100', 'Weekly Stay Incentive', 'FIXED', 100.00, '2025-08-01 00:00:00', '2025-12-31 23:59:59', true, 7, 50, 8, 'DELUXE,SUITE', '2025-08-01 09:00:00', '2025-08-26 12:10:00'),

-- ============= SMART STAY PROMOTIONS =============
('smart-stay', 'BUDGET15', 'Smart Saver Special', 'PERCENTAGE', 15.00, '2025-08-01 00:00:00', '2025-12-31 23:59:59', true, 2, 500, 134, 'SINGLE,DELUXE', '2025-08-01 06:00:00', '2025-08-24 16:20:00'),
('smart-stay', 'STUDENT20', 'Student Discount', 'PERCENTAGE', 20.00, '2025-08-01 00:00:00', '2025-12-31 23:59:59', true, 1, 200, 67, 'SINGLE,DELUXE', '2025-08-01 10:00:00', '2025-08-26 09:45:00'),
('smart-stay', 'CITY25', 'City Explorer Package', 'FIXED', 25.00, '2025-08-15 00:00:00', '2025-10-31 23:59:59', true, 2, 100, 15, 'SINGLE,DELUXE,SUITE', '2025-08-15 11:00:00', '2025-08-26 17:30:00'),
('smart-stay', 'TOURIST10', 'Tourist Friendly Rate', 'PERCENTAGE', 10.00, '2025-08-01 00:00:00', '2025-09-30 23:59:59', true, 1, 300, 98, 'SINGLE,DELUXE', '2025-08-01 12:00:00', '2025-08-26 17:30:00'),

-- ============= ARTISAN COLLECTION PROMOTIONS =============
('artisan-collection', 'ART25', 'Art Lover Special', 'PERCENTAGE', 25.00, '2025-08-01 00:00:00', '2025-12-31 23:59:59', true, 2, 75, 22, 'SINGLE,DELUXE,SUITE', '2025-08-01 13:00:00', '2025-08-25 11:15:00'),
('artisan-collection', 'CULTURE30', 'Cultural Experience Package', 'PERCENTAGE', 30.00, '2025-08-01 00:00:00', '2025-11-30 23:59:59', true, 3, 50, 11, 'DELUXE,SUITE,PRESIDENTIAL', '2025-08-01 14:00:00', '2025-08-26 13:25:00'),
('artisan-collection', 'HISTORIC20', 'Historic District Explorer', 'PERCENTAGE', 20.00, '2025-08-01 00:00:00', '2025-10-31 23:59:59', true, 2, 100, 33, 'SINGLE,DELUXE,SUITE', '2025-08-01 15:00:00', '2025-08-26 20:30:00'),
('artisan-collection', 'WORKSHOP50', 'Art Workshop Participant', 'FIXED', 50.00, '2025-09-01 00:00:00', '2025-11-30 23:59:59', true, 3, 30, 2, 'DELUXE,SUITE', '2025-08-01 16:00:00', '2025-08-26 20:30:00');

-- =============================================
-- PHASE 7: SEASONAL RATES DATA
-- =============================================

INSERT INTO seasonal_rates (tenant_id, hotel_id, room_type, season_name, rate_multiplier, valid_from, valid_until, is_active, description, created_at, updated_at) VALUES

-- ============= GRANDLUX HOTELS SEASONAL RATES =============
-- Manhattan Tower seasonal pricing
('grandlux-hotels', 1, 'SINGLE', 'Summer Peak', 1.25, '2025-06-15 00:00:00', '2025-09-15 23:59:59', true, 'Summer tourism peak season in NYC', '2025-06-01 10:00:00', '2025-08-26 10:00:00'),
('grandlux-hotels', 1, 'DELUXE', 'Summer Peak', 1.30, '2025-06-15 00:00:00', '2025-09-15 23:59:59', true, 'Premium room summer rates', '2025-06-01 10:00:00', '2025-08-26 10:00:00'),
('grandlux-hotels', 1, 'SUITE', 'Summer Peak', 1.35, '2025-06-15 00:00:00', '2025-09-15 23:59:59', true, 'Suite summer premium pricing', '2025-06-01 10:00:00', '2025-08-26 10:00:00'),
('grandlux-hotels', 1, 'PRESIDENTIAL', 'Summer Peak', 1.40, '2025-06-15 00:00:00', '2025-09-15 23:59:59', true, 'Presidential suite peak pricing', '2025-06-01 10:00:00', '2025-08-26 10:00:00'),

('grandlux-hotels', 1, 'SINGLE', 'Holiday Premium', 1.50, '2025-12-20 00:00:00', '2026-01-05 23:59:59', true, 'Holiday season premium rates', '2025-12-01 10:00:00', '2025-12-01 10:00:00'),
('grandlux-hotels', 1, 'DELUXE', 'Holiday Premium', 1.55, '2025-12-20 00:00:00', '2026-01-05 23:59:59', true, 'Deluxe holiday rates', '2025-12-01 10:00:00', '2025-12-01 10:00:00'),
('grandlux-hotels', 1, 'SUITE', 'Holiday Premium', 1.60, '2025-12-20 00:00:00', '2026-01-05 23:59:59', true, 'Suite holiday premium', '2025-12-01 10:00:00', '2025-12-01 10:00:00'),

-- Beverly Hills seasonal rates
('grandlux-hotels', 2, 'SINGLE', 'Awards Season', 1.75, '2025-02-01 00:00:00', '2025-03-31 23:59:59', true, 'Hollywood awards season premium', '2025-01-15 10:00:00', '2025-01-15 10:00:00'),
('grandlux-hotels', 2, 'DELUXE', 'Awards Season', 1.80, '2025-02-01 00:00:00', '2025-03-31 23:59:59', true, 'Celebrity accommodation rates', '2025-01-15 10:00:00', '2025-01-15 10:00:00'),

-- ============= ROYAL RESORTS SEASONAL RATES =============
-- Miami Beach seasonal pricing
('royal-resorts', 4, 'SINGLE', 'Winter Paradise', 1.45, '2025-12-01 00:00:00', '2026-04-30 23:59:59', true, 'Winter escape season in Miami', '2025-11-15 10:00:00', '2025-11-15 10:00:00'),
('royal-resorts', 4, 'DELUXE', 'Winter Paradise', 1.50, '2025-12-01 00:00:00', '2026-04-30 23:59:59', true, 'Premium winter beachfront rates', '2025-11-15 10:00:00', '2025-11-15 10:00:00'),
('royal-resorts', 4, 'SUITE', 'Winter Paradise', 1.55, '2025-12-01 00:00:00', '2026-04-30 23:59:59', true, 'Luxury winter suite pricing', '2025-11-15 10:00:00', '2025-11-15 10:00:00'),

('royal-resorts', 4, 'SINGLE', 'Spring Break', 1.65, '2025-03-01 00:00:00', '2025-04-15 23:59:59', true, 'Spring break premium period', '2025-02-15 10:00:00', '2025-02-15 10:00:00'),
('royal-resorts', 4, 'DELUXE', 'Spring Break', 1.70, '2025-03-01 00:00:00', '2025-04-15 23:59:59', true, 'High demand spring period', '2025-02-15 10:00:00', '2025-02-15 10:00:00'),

-- Aspen seasonal rates
('royal-resorts', 5, 'SINGLE', 'Ski Season', 2.00, '2025-12-15 00:00:00', '2026-03-31 23:59:59', true, 'Peak ski season pricing', '2025-12-01 10:00:00', '2025-12-01 10:00:00'),
('royal-resorts', 5, 'DELUXE', 'Ski Season', 2.10, '2025-12-15 00:00:00', '2026-03-31 23:59:59', true, 'Premium ski accommodation', '2025-12-01 10:00:00', '2025-12-01 10:00:00'),
('royal-resorts', 5, 'SUITE', 'Ski Season', 2.25, '2025-12-15 00:00:00', '2026-03-31 23:59:59', true, 'Luxury ski lodge rates', '2025-12-01 10:00:00', '2025-12-01 10:00:00'),

-- ============= BUSINESS SELECT SEASONAL RATES =============
-- Conference season adjustments
('business-select', 10, 'SINGLE', 'Conference Season', 1.20, '2025-09-01 00:00:00', '2025-11-30 23:59:59', true, 'High business travel period', '2025-08-15 10:00:00', '2025-08-15 10:00:00'),
('business-select', 10, 'DELUXE', 'Conference Season', 1.25, '2025-09-01 00:00:00', '2025-11-30 23:59:59', true, 'Premium business accommodation', '2025-08-15 10:00:00', '2025-08-15 10:00:00'),

('business-select', 11, 'SINGLE', 'Tech Conference Peak', 1.30, '2025-03-01 00:00:00', '2025-05-31 23:59:59', true, 'SXSW and tech event season', '2025-02-15 10:00:00', '2025-02-15 10:00:00'),
('business-select', 11, 'DELUXE', 'Tech Conference Peak', 1.35, '2025-03-01 00:00:00', '2025-05-31 23:59:59', true, 'High demand tech season', '2025-02-15 10:00:00', '2025-02-15 10:00:00'),

-- ============= SMART STAY SEASONAL RATES =============
-- Tourism peak adjustments for budget hotels
('smart-stay', 17, 'SINGLE', 'Summer Tourist', 1.15, '2025-06-01 00:00:00', '2025-08-31 23:59:59', true, 'Times Square summer tourism', '2025-05-15 10:00:00', '2025-08-26 10:00:00'),
('smart-stay', 17, 'DELUXE', 'Summer Tourist', 1.20, '2025-06-01 00:00:00', '2025-08-31 23:59:59', true, 'Enhanced summer rates', '2025-05-15 10:00:00', '2025-08-26 10:00:00'),

('smart-stay', 18, 'SINGLE', 'Hollywood Events', 1.25, '2025-02-15 00:00:00', '2025-03-15 23:59:59', true, 'Award season spillover effect', '2025-02-01 10:00:00', '2025-02-01 10:00:00'),
('smart-stay', 18, 'DELUXE', 'Hollywood Events', 1.30, '2025-02-15 00:00:00', '2025-03-15 23:59:59', true, 'Entertainment industry demand', '2025-02-01 10:00:00', '2025-02-01 10:00:00'),

-- ============= ARTISAN COLLECTION SEASONAL RATES =============
-- Cultural event seasons
('artisan-collection', 23, 'SINGLE', 'Festival Season', 1.35, '2025-09-15 00:00:00', '2025-11-15 23:59:59', true, 'Charleston arts and culture festivals', '2025-09-01 10:00:00', '2025-09-01 10:00:00'),
('artisan-collection', 23, 'DELUXE', 'Festival Season', 1.40, '2025-09-15 00:00:00', '2025-11-15 23:59:59', true, 'Premium cultural event period', '2025-09-01 10:00:00', '2025-09-01 10:00:00'),
('artisan-collection', 23, 'SUITE', 'Festival Season', 1.45, '2025-09-15 00:00:00', '2025-11-15 23:59:59', true, 'Luxury cultural accommodation', '2025-09-01 10:00:00', '2025-09-01 10:00:00'),

('artisan-collection', 24, 'SINGLE', 'Historic Tours Peak', 1.25, '2025-04-01 00:00:00', '2025-06-30 23:59:59', true, 'Spring historic district tours', '2025-03-15 10:00:00', '2025-03-15 10:00:00'),
('artisan-collection', 24, 'DELUXE', 'Historic Tours Peak', 1.30, '2025-04-01 00:00:00', '2025-06-30 23:59:59', true, 'Premium historic experience', '2025-03-15 10:00:00', '2025-03-15 10:00:00');

-- =============================================
-- SUMMARY STATISTICS
-- =============================================
-- This comprehensive test data includes:
-- - 12 Tenants across different market segments
-- - 28 Hotels with varying sizes and amenities  
-- - 119+ Rooms with realistic pricing and availability
-- - 44 Users across all roles (Admin, Hotel Admin, Front Desk, Operations, Maintenance, Housekeeping, Concierge, Guests)
-- - 36 Housekeeping Staff members across different hotels and roles
-- - 35+ Housekeeping Tasks in various states (Completed, In Progress, Assigned, Pending)
-- - 15+ Maintenance Tasks covering different types and priorities
-- - 23 Reservations (Current, Historical, Future, Cancelled)
-- - 22 Booking History entries showing reservation lifecycle
-- - 16 Promotional Codes across all tenant types
-- - 26 Seasonal Rate adjustments for different periods

-- The data provides realistic scenarios for testing:
-- ✓ Multi-tenant operations with different market segments
-- ✓ Staff role-based access and task management
-- ✓ Complete reservation lifecycle (booking to checkout)
-- ✓ Maintenance and housekeeping workflow testing
-- ✓ Pricing strategy and promotional code validation
-- ✓ Historical data for reporting and analytics
-- ✓ Different guest types and service levels
-- ✓ Operational complexity across hotel types

SELECT 'Comprehensive test data loading completed successfully!' as status;

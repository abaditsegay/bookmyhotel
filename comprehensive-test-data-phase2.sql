-- Comprehensive Test Data - Phase 2: Users and Staff
-- This file continues from comprehensive-test-data.sql

-- =============================================
-- PHASE 2: COMPREHENSIVE USER DATA
-- =============================================

-- Insert users with different roles across all tenants
-- Password for all users is 'password123' (hashed)
INSERT INTO users (tenant_id, first_name, last_name, email, password, phone, hotel_id, is_active, created_at, updated_at) VALUES

-- ============= SYSTEM ADMINISTRATORS =============
-- Super Admin (no tenant - system-wide access)
(NULL, 'System', 'Administrator', 'admin@bookmyhotel.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-000-0001', NULL, true, NOW(), NOW()),

-- ============= GRANDLUX HOTELS STAFF =============
-- Tenant Admin
('grandlux-hotels', 'Victoria', 'Sterling', 'admin@grandlux-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-100-0001', NULL, true, NOW(), NOW()),

-- GrandLux Manhattan Tower Staff
('grandlux-hotels', 'James', 'Wellington', 'gm.manhattan@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-1000', 1, true, NOW(), NOW()),
('grandlux-hotels', 'Sophia', 'Chen', 'frontdesk.manhattan@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-1001', 1, true, NOW(), NOW()),
('grandlux-hotels', 'Marcus', 'Rodriguez', 'concierge.manhattan@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-1002', 1, true, NOW(), NOW()),
('grandlux-hotels', 'Diana', 'Thompson', 'operations.manhattan@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-1003', 1, true, NOW(), NOW()),
('grandlux-hotels', 'Robert', 'Johnson', 'maintenance.manhattan@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-1004', 1, true, NOW(), NOW()),
('grandlux-hotels', 'Isabella', 'Martinez', 'housekeeping.manhattan@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-1005', 1, true, NOW(), NOW()),

-- GrandLux Beverly Hills Staff
('grandlux-hotels', 'Alexander', 'Blackwood', 'gm.beverlyhills@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-310-555-1001', 2, true, NOW(), NOW()),
('grandlux-hotels', 'Olivia', 'Parker', 'frontdesk.beverlyhills@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-310-555-1002', 2, true, NOW(), NOW()),
('grandlux-hotels', 'Christopher', 'Davis', 'operations.beverlyhills@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-310-555-1003', 2, true, NOW(), NOW()),

-- GrandLux Chicago Staff
('grandlux-hotels', 'Elizabeth', 'Anderson', 'gm.chicago@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-312-555-1002', 3, true, NOW(), NOW()),
('grandlux-hotels', 'William', 'Foster', 'frontdesk.chicago@grandlux.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-312-555-1003', 3, true, NOW(), NOW()),

-- ============= ROYAL RESORTS STAFF =============
-- Tenant Admin
('royal-resorts', 'Charles', 'Pemberton', 'admin@royal-resorts.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-200-0001', NULL, true, NOW(), NOW()),

-- Royal Miami Beach Staff
('royal-resorts', 'Anastasia', 'Delacroix', 'gm.miami@royal-resorts.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-305-555-2000', 4, true, NOW(), NOW()),
('royal-resorts', 'Gabriel', 'Santos', 'frontdesk.miami@royal-resorts.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-305-555-2001', 4, true, NOW(), NOW()),
('royal-resorts', 'Isabella', 'Rodriguez', 'operations.miami@royal-resorts.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-305-555-2002', 4, true, NOW(), NOW()),
('royal-resorts', 'Carlos', 'Mendoza', 'maintenance.miami@royal-resorts.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-305-555-2003', 4, true, NOW(), NOW()),

-- Royal Aspen Staff
('royal-resorts', 'Helena', 'Winters', 'gm.aspen@royal-resorts.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-970-555-2001', 5, true, NOW(), NOW()),
('royal-resorts', 'Thomas', 'Alpine', 'frontdesk.aspen@royal-resorts.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-970-555-2002', 5, true, NOW(), NOW()),

-- ============= BUSINESS SELECT HOTELS STAFF =============
-- Tenant Admin
('business-select', 'Margaret', 'Harrison', 'admin@businessselect.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-400-0001', NULL, true, NOW(), NOW()),

-- Seattle Hotel Staff
('business-select', 'David', 'Richardson', 'gm.seattle@businessselect.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-206-555-4000', 10, true, NOW(), NOW()),
('business-select', 'Sarah', 'Mitchell', 'frontdesk.seattle@businessselect.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-206-555-4001', 10, true, NOW(), NOW()),
('business-select', 'Michael', 'Chang', 'operations.seattle@businessselect.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-206-555-4002', 10, true, NOW(), NOW()),

-- Austin Hotel Staff
('business-select', 'Jennifer', 'Williams', 'gm.austin@businessselect.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-512-555-4001', 11, true, NOW(), NOW()),
('business-select', 'Kevin', 'Taylor', 'frontdesk.austin@businessselect.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-512-555-4002', 11, true, NOW(), NOW()),

-- ============= SMART STAY BUDGET HOTELS STAFF =============
-- Tenant Admin
('smart-stay', 'Patricia', 'Collins', 'admin@smartstay.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-700-0001', NULL, true, NOW(), NOW()),

-- Times Square Hotel Staff
('smart-stay', 'Anthony', 'Moore', 'gm.timessquare@smartstay.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-7000', 17, true, NOW(), NOW()),
('smart-stay', 'Lisa', 'Garcia', 'frontdesk.timessquare@smartstay.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-7001', 17, true, NOW(), NOW()),
('smart-stay', 'Daniel', 'Lee', 'operations.timessquare@smartstay.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-7002', 17, true, NOW(), NOW()),
('smart-stay', 'Maria', 'Lopez', 'maintenance.timessquare@smartstay.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-7003', 17, true, NOW(), NOW()),

-- Hollywood Hotel Staff
('smart-stay', 'James', 'Wilson', 'gm.hollywood@smartstay.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-323-555-7001', 18, true, NOW(), NOW()),
('smart-stay', 'Nicole', 'Brown', 'frontdesk.hollywood@smartstay.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-323-555-7002', 18, true, NOW(), NOW()),

-- ============= ARTISAN COLLECTION STAFF =============
-- Tenant Admin
('artisan-collection', 'Alexandra', 'Sterling', 'admin@artisancollection.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-300-0001', NULL, true, NOW(), NOW()),

-- Charleston Hotel Staff
('artisan-collection', 'Vivian', 'Ashford', 'gm.charleston@artisancollection.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-843-555-1100', 23, true, NOW(), NOW()),
('artisan-collection', 'Sebastian', 'Crawford', 'frontdesk.charleston@artisancollection.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-843-555-1101', 23, true, NOW(), NOW()),
('artisan-collection', 'Evelyn', 'Beaumont', 'operations.charleston@artisancollection.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-843-555-1102', 23, true, NOW(), NOW()),
('artisan-collection', 'Harrison', 'Blake', 'maintenance.charleston@artisancollection.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-843-555-1103', 23, true, NOW(), NOW()),

-- Savannah Hotel Staff
('artisan-collection', 'Penelope', 'Whitmore', 'gm.savannah@artisancollection.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-912-555-1101', 24, true, NOW(), NOW()),
('artisan-collection', 'Theodore', 'Manning', 'frontdesk.savannah@artisancollection.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-912-555-1102', 24, true, NOW(), NOW()),

-- ============= GUEST USERS FOR TESTING =============
(NULL, 'John', 'Traveler', 'john.traveler@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0001', NULL, true, NOW(), NOW()),
(NULL, 'Emily', 'Explorer', 'emily.explorer@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0002', NULL, true, NOW(), NOW()),
(NULL, 'Michael', 'Business', 'michael.business@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0003', NULL, true, NOW(), NOW()),
(NULL, 'Sarah', 'Vacation', 'sarah.vacation@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0004', NULL, true, NOW(), NOW()),
(NULL, 'David', 'Frequent', 'david.frequent@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0005', NULL, true, NOW(), NOW()),
(NULL, 'Jessica', 'Conference', 'jessica.conference@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0006', NULL, true, NOW(), NOW()),
(NULL, 'Robert', 'Leisure', 'robert.leisure@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0007', NULL, true, NOW(), NOW()),
(NULL, 'Amanda', 'Luxury', 'amanda.luxury@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0008', NULL, true, NOW(), NOW()),
(NULL, 'Christopher', 'Budget', 'christopher.budget@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0009', NULL, true, NOW(), NOW()),
(NULL, 'Michelle', 'Family', 'michelle.family@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0010', NULL, true, NOW(), NOW());

-- =============================================
-- USER ROLES ASSIGNMENT
-- =============================================

INSERT INTO user_roles (user_id, role) VALUES
-- Super Admin
(1, 'ADMIN'),

-- Tenant Admins
(2, 'HOTEL_ADMIN'),  -- GrandLux
(13, 'HOTEL_ADMIN'), -- Royal Resorts
(19, 'HOTEL_ADMIN'), -- Business Select
(24, 'HOTEL_ADMIN'), -- Smart Stay
(29, 'HOTEL_ADMIN'), -- Artisan Collection

-- Hotel Managers
(3, 'HOTEL_ADMIN'),   -- GrandLux Manhattan GM
(8, 'HOTEL_ADMIN'),   -- GrandLux Beverly Hills GM
(12, 'HOTEL_ADMIN'),  -- GrandLux Chicago GM
(14, 'HOTEL_ADMIN'),  -- Royal Miami GM
(17, 'HOTEL_ADMIN'),  -- Royal Aspen GM
(20, 'HOTEL_ADMIN'),  -- Business Select Seattle GM
(22, 'HOTEL_ADMIN'),  -- Business Select Austin GM
(25, 'HOTEL_ADMIN'),  -- Smart Stay Times Square GM
(27, 'HOTEL_ADMIN'),  -- Smart Stay Hollywood GM
(30, 'HOTEL_ADMIN'),  -- Artisan Charleston GM
(33, 'HOTEL_ADMIN'),  -- Artisan Savannah GM

-- Front Desk Staff
(4, 'FRONTDESK'),     -- GrandLux Manhattan
(9, 'FRONTDESK'),     -- GrandLux Beverly Hills
(13, 'FRONTDESK'),    -- GrandLux Chicago
(15, 'FRONTDESK'),    -- Royal Miami
(18, 'FRONTDESK'),    -- Royal Aspen
(21, 'FRONTDESK'),    -- Business Select Seattle
(23, 'FRONTDESK'),    -- Business Select Austin
(26, 'FRONTDESK'),    -- Smart Stay Times Square
(28, 'FRONTDESK'),    -- Smart Stay Hollywood
(31, 'FRONTDESK'),    -- Artisan Charleston
(34, 'FRONTDESK'),    -- Artisan Savannah

-- Operations Supervisors
(6, 'OPERATIONS_SUPERVISOR'),  -- GrandLux Manhattan
(10, 'OPERATIONS_SUPERVISOR'), -- GrandLux Beverly Hills
(16, 'OPERATIONS_SUPERVISOR'), -- Royal Miami
(21, 'OPERATIONS_SUPERVISOR'), -- Business Select Seattle
(27, 'OPERATIONS_SUPERVISOR'), -- Smart Stay Times Square
(32, 'OPERATIONS_SUPERVISOR'), -- Artisan Charleston

-- Maintenance Staff
(7, 'MAINTENANCE'),    -- GrandLux Manhattan
(17, 'MAINTENANCE'),   -- Royal Miami
(28, 'MAINTENANCE'),   -- Smart Stay Times Square
(33, 'MAINTENANCE'),   -- Artisan Charleston

-- Housekeeping Staff
(8, 'HOUSEKEEPING'),   -- GrandLux Manhattan
(32, 'HOUSEKEEPING'),  -- Artisan Charleston

-- Concierge Staff
(5, 'CONCIERGE'),      -- GrandLux Manhattan

-- Guest Users
(35, 'GUEST'),  -- John Traveler
(36, 'GUEST'),  -- Emily Explorer
(37, 'GUEST'),  -- Michael Business
(38, 'GUEST'),  -- Sarah Vacation
(39, 'GUEST'),  -- David Frequent
(40, 'GUEST'),  -- Jessica Conference
(41, 'GUEST'),  -- Robert Leisure
(42, 'GUEST'),  -- Amanda Luxury
(43, 'GUEST'),  -- Christopher Budget
(44, 'GUEST');  -- Michelle Family

-- This completes Phase 2 of the comprehensive test data
-- Next phase will include housekeeping staff and task data

-- Add comprehensive users and credentials for Ethiopian Heritage Hotels
-- Following patterns from other tenants with proper role distribution

-- =============================================
-- ADDITIONAL STAFF FOR ETHIOPIAN HOTELS
-- =============================================

-- Add more FRONTDESK staff (following development tenant pattern with 12 users)
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
-- Sheraton Addis Ababa Front Desk Team
('ethiopian-heritage', 'frontdesk.shift1@sheraton-addis.et', 'Meron', 'Tadesse', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'frontdesk.shift2@sheraton-addis.et', 'Dawit', 'Haile', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'frontdesk.shift3@sheraton-addis.et', 'Hanan', 'Desta', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'frontdesk.night@sheraton-addis.et', 'Kalkidan', 'Wolde', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'frontdesk.weekend@sheraton-addis.et', 'Biniam', 'Mulugeta', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Lalibela Cultural Lodge Front Desk Team
('ethiopian-heritage', 'frontdesk.shift1@lalibela-lodge.et', 'Tigist', 'Berhe', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'frontdesk.shift2@lalibela-lodge.et', 'Yemane', 'Gebru', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'frontdesk.shift3@lalibela-lodge.et', 'Almaz', 'Tekle', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'frontdesk.night@lalibela-lodge.et', 'Henok', 'Asfaw', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'frontdesk.weekend@lalibela-lodge.et', 'Rahel', 'Assefa', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- Add more HOTEL_ADMIN staff (following development tenant pattern with 14 users)
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
-- Additional Hotel Admins for Sheraton
('ethiopian-heritage', 'admin.assistant@sheraton-addis.et', 'Eyasu', 'Lemma', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.finance@sheraton-addis.et', 'Selamawit', 'Tefera', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.sales@sheraton-addis.et', 'Mehari', 'Kahsay', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.events@sheraton-addis.et', 'Bethlehem', 'Gebre', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.guest.relations@sheraton-addis.et', 'Getnet', 'Shiferaw', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.food.beverage@sheraton-addis.et', 'Wubalem', 'Tadesse', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Additional Hotel Admins for Lalibela
('ethiopian-heritage', 'admin.assistant@lalibela-lodge.et', 'Tsegaye', 'Mekonen', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.finance@lalibela-lodge.et', 'Marta', 'Kebede', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.cultural@lalibela-lodge.et', 'Priest Alemayehu', 'Wolde', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.tours@lalibela-lodge.et', 'Fasika', 'Alemu', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.guest.relations@lalibela-lodge.et', 'Alemseged', 'Girma', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'admin.food.beverage@lalibela-lodge.et', 'Haben', 'Teklay', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- Add more HOUSEKEEPING staff (following development tenant pattern with 10 users)
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
-- Sheraton Housekeeping Team
('ethiopian-heritage', 'housekeeping.supervisor@sheraton-addis.et', 'Almaz', 'Berhane', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'housekeeping.shift1@sheraton-addis.et', 'Desta', 'Weldu', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'housekeeping.shift2@sheraton-addis.et', 'Meseret', 'Hagos', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'housekeeping.shift3@sheraton-addis.et', 'Kidist', 'Bereket', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Lalibela Housekeeping Team  
('ethiopian-heritage', 'housekeeping.supervisor@lalibela-lodge.et', 'Hiwot', 'Tesfaye', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'housekeeping.shift1@lalibela-lodge.et', 'Genet', 'Mulat', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'housekeeping.shift2@lalibela-lodge.et', 'Senait', 'Tadele', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'housekeeping.shift3@lalibela-lodge.et', 'Eden', 'Teshome', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- Add more MAINTENANCE staff (following development tenant pattern with 10 users)
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
-- Sheraton Maintenance Team
('ethiopian-heritage', 'maintenance.supervisor@sheraton-addis.et', 'Tesfaye', 'Wondimu', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'maintenance.electrical@sheraton-addis.et', 'Kebede', 'Abebe', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'maintenance.plumbing@sheraton-addis.et', 'Habtamu', 'Legesse', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'maintenance.hvac@sheraton-addis.et', 'Girma', 'Mesfin', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Lalibela Maintenance Team
('ethiopian-heritage', 'maintenance.supervisor@lalibela-lodge.et', 'Worku', 'Tadesse', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'maintenance.electrical@lalibela-lodge.et', 'Fisseha', 'Gebremedhin', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'maintenance.plumbing@lalibela-lodge.et', 'Tadele', 'Berhe', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'maintenance.general@lalibela-lodge.et', 'Mulugeta', 'Gebre', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- Add Security Staff
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
('ethiopian-heritage', 'security.chief@sheraton-addis.et', 'Fikadu', 'Lemma', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'security.night@sheraton-addis.et', 'Melaku', 'Wolde', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'security.chief@lalibela-lodge.et', 'Getachew', 'Teshome', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'security.night@lalibela-lodge.et', 'Bereket', 'Amare', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- Add Restaurant/Kitchen Staff
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
('ethiopian-heritage', 'chef.executive@sheraton-addis.et', 'Marcus', 'Samuelsson', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'chef.sous@sheraton-addis.et', 'Tizita', 'Melaku', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'server.head@sheraton-addis.et', 'Mahlet', 'Zerihun', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'chef.traditional@lalibela-lodge.et', 'Almaz', 'Yimam', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'server.cultural@lalibela-lodge.et', 'Melat', 'Tadesse', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- Add Guest Users (International visitors)
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
('ethiopian-heritage', 'guest.business1@email.com', 'Robert', 'Johnson', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'guest.tourist1@email.com', 'Maria', 'Garcia', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'guest.diplomat1@email.com', 'Ahmed', 'Hassan', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'guest.pilgrim1@email.com', 'Sarah', 'Williams', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'guest.researcher1@email.com', 'Dr. James', 'Mitchell', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- =============================================
-- ASSIGN ROLES TO NEW USERS
-- =============================================

-- FRONTDESK roles
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'frontdesk.shift1@sheraton-addis.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.shift2@sheraton-addis.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.shift3@sheraton-addis.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.night@sheraton-addis.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.weekend@sheraton-addis.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.shift1@lalibela-lodge.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.shift2@lalibela-lodge.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.shift3@lalibela-lodge.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.night@lalibela-lodge.et'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'frontdesk.weekend@lalibela-lodge.et'), 'FRONTDESK');

-- HOTEL_ADMIN roles
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'admin.assistant@sheraton-addis.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.finance@sheraton-addis.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.sales@sheraton-addis.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.events@sheraton-addis.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.guest.relations@sheraton-addis.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.food.beverage@sheraton-addis.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.assistant@lalibela-lodge.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.finance@lalibela-lodge.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.cultural@lalibela-lodge.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.tours@lalibela-lodge.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.guest.relations@lalibela-lodge.et'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'admin.food.beverage@lalibela-lodge.et'), 'HOTEL_ADMIN');

-- HOUSEKEEPING roles
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'housekeeping.supervisor@sheraton-addis.et'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'housekeeping.shift1@sheraton-addis.et'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'housekeeping.shift2@sheraton-addis.et'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'housekeeping.shift3@sheraton-addis.et'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'housekeeping.supervisor@lalibela-lodge.et'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'housekeeping.shift1@lalibela-lodge.et'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'housekeeping.shift2@lalibela-lodge.et'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'housekeeping.shift3@lalibela-lodge.et'), 'HOUSEKEEPING');

-- MAINTENANCE roles
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'maintenance.supervisor@sheraton-addis.et'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'maintenance.electrical@sheraton-addis.et'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'maintenance.plumbing@sheraton-addis.et'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'maintenance.hvac@sheraton-addis.et'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'maintenance.supervisor@lalibela-lodge.et'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'maintenance.electrical@lalibela-lodge.et'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'maintenance.plumbing@lalibela-lodge.et'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'maintenance.general@lalibela-lodge.et'), 'MAINTENANCE');

-- SECURITY roles (using OPERATIONS_SUPERVISOR for security staff)
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'security.chief@sheraton-addis.et'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'security.night@sheraton-addis.et'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'security.chief@lalibela-lodge.et'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'security.night@lalibela-lodge.et'), 'OPERATIONS_SUPERVISOR');

-- KITCHEN/RESTAURANT roles (using OPERATIONS_SUPERVISOR)
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'chef.executive@sheraton-addis.et'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'chef.sous@sheraton-addis.et'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'server.head@sheraton-addis.et'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'chef.traditional@lalibela-lodge.et'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'server.cultural@lalibela-lodge.et'), 'OPERATIONS_SUPERVISOR');

-- GUEST roles
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'guest.business1@email.com'), 'GUEST'),
((SELECT id FROM users WHERE email = 'guest.tourist1@email.com'), 'GUEST'),
((SELECT id FROM users WHERE email = 'guest.diplomat1@email.com'), 'GUEST'),
((SELECT id FROM users WHERE email = 'guest.pilgrim1@email.com'), 'GUEST'),
((SELECT id FROM users WHERE email = 'guest.researcher1@email.com'), 'GUEST');

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

SELECT 'Ethiopian Heritage Hotels - Staff Expanded Successfully!' as status;

SELECT 
  'Staff Count by Role:' as section,
  ur.role as 'Role',
  COUNT(*) as 'Total Staff'
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE u.tenant_id = 'ethiopian-heritage'
GROUP BY ur.role 
ORDER BY ur.role;

SELECT 
  'Staff Distribution by Hotel:' as section,
  CASE 
    WHEN u.email LIKE '%sheraton-addis%' THEN 'Sheraton Addis Ababa'
    WHEN u.email LIKE '%lalibela-lodge%' THEN 'Lalibela Cultural Lodge'
    ELSE 'General/Guest'
  END as 'Hotel',
  COUNT(*) as 'Staff Count'
FROM users u 
WHERE u.tenant_id = 'ethiopian-heritage'
GROUP BY CASE 
    WHEN u.email LIKE '%sheraton-addis%' THEN 'Sheraton Addis Ababa'
    WHEN u.email LIKE '%lalibela-lodge%' THEN 'Lalibela Cultural Lodge'
    ELSE 'General/Guest'
  END;

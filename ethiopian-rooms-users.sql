-- Ethiopian Hotels - Add Rooms and Users Only
-- The hotels already exist, we just need to add rooms and users

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- ROOMS FOR EXISTING ETHIOPIAN HOTELS
-- =============================================

-- Clear any existing rooms for these hotels first
DELETE FROM rooms WHERE hotel_id IN (14, 15);

-- Rooms for Sheraton Addis Ababa (hotel_id = 14)
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
-- Standard rooms
(14, 'ethiopian-heritage', '101', 'SINGLE', 2, 3200.00, 'ቅንብር ክፍል የከተማ እይታ - Standard room with city view and Ethiopian coffee service', 'AVAILABLE', true, NOW(), NOW()),
(14, 'ethiopian-heritage', '102', 'SINGLE', 2, 3200.00, 'ወርቅ ማስዋቢያ ክፍል - Gold accented room with traditional Ethiopian decor', 'AVAILABLE', true, NOW(), NOW()),
(14, 'ethiopian-heritage', '103', 'DELUXE', 2, 4500.00, 'እንግዳ መቀበያ ክፍል - Guest reception room with balcony and Ethiopian art', 'AVAILABLE', true, NOW(), NOW()),
(14, 'ethiopian-heritage', '104', 'DELUXE', 2, 4500.00, 'ቡና ማቅረቢያ ክፍል - Coffee ceremony room with traditional setup', 'AVAILABLE', true, NOW(), NOW()),
(14, 'ethiopian-heritage', '105', 'SUITE', 4, 6800.00, 'ንግስት ሸዋ ሱት - Queen Shewa suite with royal Ethiopian furnishings', 'AVAILABLE', true, NOW(), NOW()),

-- Executive floors
(14, 'ethiopian-heritage', '201', 'DELUXE', 2, 4800.00, 'ኢትዮጵያ ባህል ክፍል - Ethiopian culture room with traditional instruments', 'AVAILABLE', true, NOW(), NOW()),
(14, 'ethiopian-heritage', '202', 'DELUXE', 2, 4800.00, 'ወርቅ ውሃ ክፍል - Golden water room with luxury bathroom', 'AVAILABLE', true, NOW(), NOW()),
(14, 'ethiopian-heritage', '203', 'SUITE', 4, 7200.00, 'አፄ ምንሊክ ሱት - Emperor Menelik suite with historical artifacts', 'AVAILABLE', true, NOW(), NOW()),
(14, 'ethiopian-heritage', '204', 'SUITE', 6, 8500.00, 'የኢትዮጵያ ምድር ሱት - Land of Ethiopia suite with panoramic views', 'AVAILABLE', true, NOW(), NOW()),

-- Presidential level
(14, 'ethiopian-heritage', '301', 'PRESIDENTIAL', 8, 12000.00, 'ንግሥት ዘውዲቱ ንግሣዊ ሱት - Empress Zauditu Royal Suite with private dining and butler service', 'AVAILABLE', true, NOW(), NOW());

-- Rooms for Lalibela Cultural Inn (hotel_id = 15)
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
-- Traditional rooms
(15, 'ethiopian-heritage', '11', 'SINGLE', 2, 1800.00, 'ቅዱስ ገብርኤል ክፍል - Saint Gabriel room with rock church views', 'AVAILABLE', true, NOW(), NOW()),
(15, 'ethiopian-heritage', '12', 'SINGLE', 2, 1800.00, 'ቅድስት ማርያም ክፍል - Saint Mary room with traditional furnishing', 'AVAILABLE', true, NOW(), NOW()),
(15, 'ethiopian-heritage', '13', 'DELUXE', 2, 2400.00, 'ቅዱስ ጊዮርጊስ ክፍል - Saint George room overlooking the famous church', 'AVAILABLE', true, NOW(), NOW()),
(15, 'ethiopian-heritage', '14', 'DELUXE', 2, 2400.00, 'ኢየሱስ ክፍል - Jesus room with spiritual ambiance', 'AVAILABLE', true, NOW(), NOW()),
(15, 'ethiopian-heritage', '15', 'SUITE', 4, 3600.00, 'ንጉሥ ላሊበላ ሱት - King Lalibela suite with historical significance', 'AVAILABLE', true, NOW(), NOW()),

-- Family and pilgrimage rooms
(15, 'ethiopian-heritage', '21', 'DELUXE', 3, 2700.00, 'ቤተሰብ ክፍል - Family room for pilgrimage visitors', 'AVAILABLE', true, NOW(), NOW()),
(15, 'ethiopian-heritage', '22', 'SUITE', 4, 3900.00, 'መንፈሳዊ ሱት - Spiritual suite for religious travelers', 'AVAILABLE', true, NOW(), NOW()),
(15, 'ethiopian-heritage', '23', 'SUITE', 6, 4500.00, 'ኢትዮጵያ ኦርቶዶክስ ሱት - Ethiopian Orthodox suite with prayer area', 'AVAILABLE', true, NOW(), NOW()),

-- Premium heritage room
(15, 'ethiopian-heritage', '31', 'PRESIDENTIAL', 6, 7200.00, 'ዘኮርናውያን ንጉሣዊ ሱት - Royal Zagwe Dynasty suite with private chapel view', 'AVAILABLE', true, NOW(), NOW());

-- =============================================
-- ETHIOPIAN HOTEL USERS & STAFF
-- =============================================

-- Remove any existing Ethiopian users first (clean slate)
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE tenant_id = 'ethiopian-heritage');
DELETE FROM users WHERE tenant_id = 'ethiopian-heritage';

-- System Administrator for Ethiopian hotels
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
('ethiopian-heritage', 'ሥራ.አስተዳዳሪ@ኢትዮጵያ-ቅርስ.ኢት', 'አበበ (Abebe)', 'ተስፋዬ (Tesfaye)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Hotel Admins
('ethiopian-heritage', 'ሆቴል.አስተዳዳሪ@ሸራተን-አዲስ.ኢት', 'ሐዋሪያት (Hawaryat)', 'በቀለ (Bekele)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'ሆቴል.አስተዳዳሪ@ላሊበላ-ቤት.ኢት', 'ዘርአ (Zera)', 'ያዕቆብ (Yacob)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Front Desk Staff
('ethiopian-heritage', 'መቀበያ@ሸራተን-አዲስ.ኢት', 'ሳራ (Sara)', 'መንግስቱ (Mengistu)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'መቀበያ@ላሊበላ-ቤት.ኢት', 'ብርሃኔ (Birhane)', 'ጌታሁን (Getahun)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Operations Staff
('ethiopian-heritage', 'ክወናዎች@ሸራተን-አዲስ.ኢት', 'ታምራት (Tamrat)', 'አለሙ (Alemu)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'ክወናዎች@ላሊበላ-ቤት.ኢት', 'ምህረት (Mihret)', 'ቀዳዳ (Kedada)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Maintenance Staff
('ethiopian-heritage', 'ጥገና@ሸራተን-አዲስ.ኢት', 'ሰለሞን (Solomon)', 'ዳንኤል (Daniel)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'ጥገና@ላሊበላ-ቤት.ኢት', 'ዮሐንስ (Yohannes)', 'ሀይሉ (Haylu)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Housekeeping Staff
('ethiopian-heritage', 'ንጽህና@ሸራተን-አዲስ.ኢት', 'ወርቅነህ (Workneah)', 'ሀብተ (Habte)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'ንጽህና@ላሊበላ-ቤት.ኢት', 'ቤዛዊት (Bezawit)', 'ታደሰ (Tadese)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Concierge Staff
('ethiopian-heritage', 'መደላደያ@ሸራተን-አዲስ.ኢት', 'ነጋሽ (Negash)', 'ፈቃዱ (Fekadu)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'መደላደያ@ላሊበላ-ቤት.ኢት', 'ሙሉዓለም (Muluhalem)', 'ወልዳዊ (Woldawi)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),

-- Guest Examples
('ethiopian-heritage', 'እንግዳ1@ኢሜል.ኢት', 'ቴዎድሮስ (Tewodros)', 'መኮንን (Mekonnen)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'እንግዳ2@ኢሜል.ኢት', 'ዮዲት (Yodit)', 'ግርማ (Girma)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'እንግዳ3@ኢሜል.ኢት', 'ሳሙኤል (Samuel)', 'ኪዳነ (Kidane)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- Add user roles
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'ሥራ.አስተዳዳሪ@ኢትዮጵያ-ቅርስ.ኢት'), 'SYSTEM_ADMIN'),
((SELECT id FROM users WHERE email = 'ሆቴል.አስተዳዳሪ@ሸራተን-አዲስ.ኢት'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'ሆቴል.አስተዳዳሪ@ላሊበላ-ቤት.ኢት'), 'HOTEL_ADMIN'),
((SELECT id FROM users WHERE email = 'መቀበያ@ሸራተን-አዲስ.ኢት'), 'FRONT_DESK'),
((SELECT id FROM users WHERE email = 'መቀበያ@ላሊበላ-ቤት.ኢት'), 'FRONT_DESK'),
((SELECT id FROM users WHERE email = 'ክወናዎች@ሸራተን-አዲስ.ኢት'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'ክወናዎች@ላሊበላ-ቤት.ኢት'), 'OPERATIONS_SUPERVISOR'),
((SELECT id FROM users WHERE email = 'ጥገና@ሸራተን-አዲስ.ኢት'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'ጥገና@ላሊበላ-ቤት.ኢት'), 'MAINTENANCE'),
((SELECT id FROM users WHERE email = 'ንጽህና@ሸራተን-አዲስ.ኢት'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'ንጽህና@ላሊበላ-ቤት.ኢት'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'መደላደያ@ሸራተን-አዲስ.ኢት'), 'CONCIERGE'),
((SELECT id FROM users WHERE email = 'መደላደያ@ላሊበላ-ቤት.ኢት'), 'CONCIERGE'),
((SELECT id FROM users WHERE email = 'እንግዳ1@ኢሜል.ኢት'), 'GUEST'),
((SELECT id FROM users WHERE email = 'እንግዳ2@ኢሜል.ኢት'), 'GUEST'),
((SELECT id FROM users WHERE email = 'እንግዳ3@ኢሜል.ኢት'), 'GUEST');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

SELECT 'የኢትዮጵያ ሆቴሎች ክፍሎች እና ተጠቃሚዎች በተሳካ ሁኔታ ታክለዋል! (Ethiopian hotel rooms and users added successfully!)' as status;

SELECT 
  'ሆቴሎች እና ክፍሎች:' as label,
  h.name as 'ሆቴል_ስም (Hotel Name)',
  h.city as 'ከተማ (City)',
  COUNT(r.id) as 'ክፍሎች_ቁጥር (Number of Rooms)'
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
WHERE h.tenant_id = 'ethiopian-heritage'
GROUP BY h.id, h.name, h.city;

SELECT 
  'ተጠቃሚዎች:' as label,
  COUNT(*) as 'ተጠቃሚዎች_ቁጥር (Number of Users)'
FROM users 
WHERE tenant_id = 'ethiopian-heritage';

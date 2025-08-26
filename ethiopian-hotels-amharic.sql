-- Ethiopian Hotels with Amharic Language Support
-- Adding two Ethiopian hotels to the BookMyHotel system
-- Using Amharic (አማርኛ) language where applicable

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- ETHIOPIAN TENANT
-- =============================================

INSERT INTO tenants (id, name, description, subdomain, is_active, created_at, updated_at) VALUES
('ethiopian-heritage', 'የኢትዮጵያ ቅርስ ሆቴሎች (Ethiopian Heritage Hotels)', 'Traditional Ethiopian hospitality with modern comfort - ባህላዊ የኢትዮጵያ አገልግሎት ከዘመናዊ ምቾት ጋር', 'ethiopian', true, NOW(), NOW());

-- =============================================
-- ETHIOPIAN HOTELS
-- =============================================

INSERT INTO hotels (tenant_id, name, description, address, city, country, phone, email, is_active, created_at, updated_at) VALUES
-- Addis Ababa Luxury Hotel
('ethiopian-heritage', 'ሸራተን አዲስ አበባ (Sheraton Addis)', 'የአዲስ አበባ ቅንብር ፍርድ ቤት አላሚ ሆቴል - Premium luxury hotel in the heart of Addis Ababa with Ethiopian cultural heritage', 'ታይቱ መንገድ ሳርቤት (Taitu Street)', 'አዲስ አበባ (Addis Ababa)', 'ኢትዮጵያ (Ethiopia)', '+251-11-517-1717', 'መተባበሪያ@ሸራተን-አዲስ.ኢት', true, NOW(), NOW()),

-- Lalibela Cultural Hotel  
('ethiopian-heritage', 'ላሊበላ ባህል ቤት (Lalibela Cultural Inn)', 'ቅዱስ ግዮርጊስ ቤተ ክርስቲያን አጠገብ ባህላዊ ሆቴል - Traditional hotel near the famous rock churches of Lalibela with authentic Ethiopian experience', 'ወንድማገኖች መንገድ (Brothers Road)', 'ላሊበላ (Lalibela)', 'ኢትዮጵያ (Ethiopia)', '+251-33-336-0229', 'እንኳን.ደህና@ላሊበላ-ቤት.ኢት', true, NOW(), NOW());

-- =============================================
-- ROOMS FOR ETHIOPIAN HOTELS
-- =============================================

-- Get hotel IDs for the Ethiopian hotels
SET @addis_hotel_id = (SELECT id FROM hotels WHERE name = 'ሸራተን አዲስ አበባ (Sheraton Addis)');
SET @lalibela_hotel_id = (SELECT id FROM hotels WHERE name = 'ላሊበላ ባህል ቤት (Lalibela Cultural Inn)');

-- Rooms for Sheraton Addis
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
-- Standard rooms
(@addis_hotel_id, 'ethiopian-heritage', '101', 'SINGLE', 2, 3200.00, 'ቅንብር ክፍል የከተማ እይታ - Standard room with city view and Ethiopian coffee service', 'AVAILABLE', true, NOW(), NOW()),
(@addis_hotel_id, 'ethiopian-heritage', '102', 'SINGLE', 2, 3200.00, 'ወርቅ ማስዋቢያ ክፍል - Gold accented room with traditional Ethiopian decor', 'AVAILABLE', true, NOW(), NOW()),
(@addis_hotel_id, 'ethiopian-heritage', '103', 'DELUXE', 2, 4500.00, 'እንግዳ መቀበያ ክፍል - Guest reception room with balcony and Ethiopian art', 'AVAILABLE', true, NOW(), NOW()),
(@addis_hotel_id, 'ethiopian-heritage', '104', 'DELUXE', 2, 4500.00, 'ቡና ማቅረቢያ ክፍል - Coffee ceremony room with traditional setup', 'AVAILABLE', true, NOW(), NOW()),
(@addis_hotel_id, 'ethiopian-heritage', '105', 'SUITE', 4, 6800.00, 'ንግስት ሸዋ ሱት - Queen Shewa suite with royal Ethiopian furnishings', 'AVAILABLE', true, NOW(), NOW()),

-- Executive floors
(@addis_hotel_id, 'ethiopian-heritage', '201', 'DELUXE', 2, 4800.00, 'ኢትዮጵያ ባህል ክፍል - Ethiopian culture room with traditional instruments', 'AVAILABLE', true, NOW(), NOW()),
(@addis_hotel_id, 'ethiopian-heritage', '202', 'DELUXE', 2, 4800.00, 'ወርቅ ውሃ ክፍል - Golden water room with luxury bathroom', 'AVAILABLE', true, NOW(), NOW()),
(@addis_hotel_id, 'ethiopian-heritage', '203', 'SUITE', 4, 7200.00, 'አፄ ምንሊክ ሱት - Emperor Menelik suite with historical artifacts', 'AVAILABLE', true, NOW(), NOW()),
(@addis_hotel_id, 'ethiopian-heritage', '204', 'SUITE', 6, 8500.00, 'የኢትዮጵያ ምድር ሱት - Land of Ethiopia suite with panoramic views', 'AVAILABLE', true, NOW(), NOW()),

-- Presidential level
(@addis_hotel_id, 'ethiopian-heritage', '301', 'PRESIDENTIAL', 8, 12000.00, 'ንግሥት ዘውዲቱ ንግሣዊ ሱት - Empress Zauditu Royal Suite with private dining and butler service', 'AVAILABLE', true, NOW(), NOW());

-- Rooms for Lalibela Cultural Inn
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
-- Traditional rooms
(@lalibela_hotel_id, 'ethiopian-heritage', '11', 'SINGLE', 2, 1800.00, 'ቅዱስ ገብርኤል ክፍል - Saint Gabriel room with rock church views', 'AVAILABLE', true, NOW(), NOW()),
(@lalibela_hotel_id, 'ethiopian-heritage', '12', 'SINGLE', 2, 1800.00, 'ቅድስት ማርያም ክፍል - Saint Mary room with traditional furnishing', 'AVAILABLE', true, NOW(), NOW()),
(@lalibela_hotel_id, 'ethiopian-heritage', '13', 'DELUXE', 2, 2400.00, 'ቅዱስ ጊዮርጊስ ክፍል - Saint George room overlooking the famous church', 'AVAILABLE', true, NOW(), NOW()),
(@lalibela_hotel_id, 'ethiopian-heritage', '14', 'DELUXE', 2, 2400.00, 'ኢየሱስ ክፍል - Jesus room with spiritual ambiance', 'AVAILABLE', true, NOW(), NOW()),
(@lalibela_hotel_id, 'ethiopian-heritage', '15', 'SUITE', 4, 3600.00, 'ንጉሥ ላሊበላ ሱት - King Lalibela suite with historical significance', 'AVAILABLE', true, NOW(), NOW()),

-- Family and pilgrimage rooms
(@lalibela_hotel_id, 'ethiopian-heritage', '21', 'DELUXE', 3, 2700.00, 'ቤተሰብ ክፍል - Family room for pilgrimage visitors', 'AVAILABLE', true, NOW(), NOW()),
(@lalibela_hotel_id, 'ethiopian-heritage', '22', 'SUITE', 4, 3900.00, 'መንፈሳዊ ሱት - Spiritual suite for religious travelers', 'AVAILABLE', true, NOW(), NOW()),
(@lalibela_hotel_id, 'ethiopian-heritage', '23', 'SUITE', 6, 4500.00, 'ኢትዮጵያ ኦርቶዶክስ ሱት - Ethiopian Orthodox suite with prayer area', 'AVAILABLE', true, NOW(), NOW()),

-- Premium heritage room
(@lalibela_hotel_id, 'ethiopian-heritage', '31', 'PRESIDENTIAL', 6, 7200.00, 'ዘኮርናውያን ንጉሣዊ ሱት - Royal Zagwe Dynasty suite with private chapel view', 'AVAILABLE', true, NOW(), NOW());

-- =============================================
-- ETHIOPIAN HOTEL USERS & STAFF
-- =============================================

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
('ethiopian-heritage', 'መደላደያ@ላሊበላ-ቤት.ኢት', 'ሙሉዓለም (Muluhalem)', 'ወልዳዊ (Woldawi)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

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
((SELECT id FROM users WHERE email = 'መደላደያ@ላሊበላ-ቤት.ኢት'), 'CONCIERGE');

-- =============================================
-- ETHIOPIAN HOUSEKEEPING STAFF
-- =============================================

INSERT INTO housekeeping_staff (tenant_id, user_id, hotel_id, staff_name, shift_type, employment_status, performance_rating, specialized_areas, certifications, phone_number, emergency_contact, hire_date, created_at, updated_at) VALUES

-- Sheraton Addis Housekeeping Staff
('ethiopian-heritage', (SELECT id FROM users WHERE email = 'ንጽህና@ሸራተን-አዲስ.ኢት'), @addis_hotel_id, 'ወርቅነህ ሀብተ (Workneah Habte)', 'MORNING', 'FULL_TIME', 4.8, 'የንጉሣዊ ክፍሎች አጽዳት (Royal suite cleaning)', 'የኢትዮጵያ ባህላዊ አገልግሎት ማስተማሪያ', '+251-91-123-4567', 'ሀብተ ወርቅነህ +251-91-765-4321', '2024-03-15', NOW(), NOW()),

('ethiopian-heritage', NULL, @addis_hotel_id, 'ሄለን ታደሰ (Helen Tadese)', 'MORNING', 'FULL_TIME', 4.6, 'የእንግዳ መቀበያ አጽዳት (Guest reception cleaning)', 'ሆስፒታሊቲ አጽዳት', '+251-91-234-5678', 'ታደሰ ሄለን +251-91-876-5432', '2024-01-20', NOW(), NOW()),

('ethiopian-heritage', NULL, @addis_hotel_id, 'ብርሃን አስፋው (Birhan Asfaw)', 'AFTERNOON', 'FULL_TIME', 4.7, 'የቡና ክፍሎች ዝግጅት (Coffee room preparation)', 'የኢትዮጵያ ቡና ሥነ ጥበብ', '+251-91-345-6789', 'አስፋው ብርሃን +251-91-987-6543', '2023-11-10', NOW(), NOW()),

('ethiopian-heritage', NULL, @addis_hotel_id, 'ሰላሞን መርሻ (Selamon Mersha)', 'NIGHT', 'PART_TIME', 4.3, 'የተጨማሪ ሰአት አጽዳት (After-hours cleaning)', 'የመደበኛ አጽዳት', '+251-91-456-7890', 'መርሻ ሰላሞን +251-91-098-7654', '2024-05-08', NOW(), NOW()),

-- Lalibela Cultural Inn Housekeeping Staff  
('ethiopian-heritage', (SELECT id FROM users WHERE email = 'ንጽህና@ላሊበላ-ቤት.ኢት'), @lalibela_hotel_id, 'ቤዛዊት ታደሰ (Bezawit Tadese)', 'MORNING', 'FULL_TIME', 4.9, 'የመንፈሳዊ ክፍሎች አጽዳት (Spiritual rooms cleaning)', 'የኦርቶዶክስ ቤተክርስቲያን ንጽህና', '+251-33-111-2222', 'ታደሰ ቤዛዊት +251-33-222-1111', '2023-12-01', NOW(), NOW()),

('ethiopian-heritage', NULL, @lalibela_hotel_id, 'ዮሃንስ ወልዱ (Yohannes Woldu)', 'MORNING', 'FULL_TIME', 4.5, 'የቤተክርስቲያን እይታ ክፍሎች (Church view rooms)', 'ባህላዊ የንጽህና ዘዴዎች', '+251-33-333-4444', 'ወልዱ ዮሃንስ +251-33-444-3333', '2024-02-14', NOW(), NOW()),

('ethiopian-heritage', NULL, @lalibela_hotel_id, 'ወርቅ አበበ (Werk Abebe)', 'AFTERNOON', 'FULL_TIME', 4.8, 'የቤተሰብ ክፍሎች ዝግጅት (Family room preparation)', 'የእንግዳ መስተንግዶ', '+251-33-555-6666', 'አበበ ወርቅ +251-33-666-5555', '2023-09-22', NOW(), NOW()),

('ethiopian-heritage', NULL, @lalibela_hotel_id, 'ምህረት ገብሬ (Mihret Gebre)', 'NIGHT', 'PART_TIME', 4.4, 'የምሽት ጠበቃ አጽዳት (Night watch cleaning)', 'የመደበኛ አጽዳት', '+251-33-777-8888', 'ገብሬ ምህረት +251-33-888-7777', '2024-04-18', NOW(), NOW());

-- =============================================
-- SAMPLE ETHIOPIAN RESERVATIONS
-- =============================================

-- Get user IDs for guest examples
INSERT INTO users (tenant_id, email, first_name, last_name, password, is_active, created_at, updated_at) VALUES
('ethiopian-heritage', 'እንግዳ1@ኢሜል.ኢት', 'ቴዎድሮስ (Tewodros)', 'መኮንን (Mekonnen)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'እንግዳ2@ኢሜል.ኢት', 'ዮዲት (Yodit)', 'ግርማ (Girma)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW()),
('ethiopian-heritage', 'እንግዳ3@ኢሜል.ኢት', 'ሳሙኤል (Samuel)', 'ኪዳነ (Kidane)', '$2a$10$N9qo8uLOickgx2ZrVroyNOY8fQ4bOukYQSCWg5jGMzXdH3M8fP3cy', true, NOW(), NOW());

-- Add guest roles
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'እንግዳ1@ኢሜል.ኢት'), 'GUEST'),
((SELECT id FROM users WHERE email = 'እንግዳ2@ኢሜል.ኢት'), 'GUEST'),
((SELECT id FROM users WHERE email = 'እንግዳ3@ኢሜል.ኢት'), 'GUEST');

-- Current reservations
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, special_requests, confirmation_number, guest_name, guest_email, guest_phone, number_of_guests, created_at, updated_at) VALUES

-- Sheraton Addis reservations
('ethiopian-heritage', 
 (SELECT id FROM rooms WHERE hotel_id = @addis_hotel_id AND room_number = '105'), 
 (SELECT id FROM users WHERE email = 'እንግዳ1@ኢሜል.ኢት'),
 '2025-08-26', '2025-08-30', 27200.00, 'CHECKED_IN', 
 'ባህላዊ ቡና ሥነ ጥበብ እና የንጉሣዊ አገልግሎት (Traditional coffee ceremony and royal service)', 
 'ETH-SHA-2025-001', 'ቴዎድሮስ መኮንን (Tewodros Mekonnen)', 'እንግዳ1@ኢሜል.ኢት', '+251-91-111-1111', 2, 
 '2025-08-20 14:30:00', '2025-08-26 15:00:00'),

('ethiopian-heritage', 
 (SELECT id FROM rooms WHERE hotel_id = @addis_hotel_id AND room_number = '203'), 
 (SELECT id FROM users WHERE email = 'እንግዳ2@ኢሜል.ኢት'),
 '2025-08-27', '2025-08-29', 14400.00, 'CONFIRMED', 
 'የኢትዮጵያ ባህላዊ ምግብ እና ሙዚቃ (Traditional Ethiopian food and music)', 
 'ETH-SHA-2025-002', 'ዮዲት ግርማ (Yodit Girma)', 'እንግዳ2@ኢሜል.ኢት', '+251-91-222-2222', 4, 
 '2025-08-25 09:15:00', '2025-08-25 09:15:00'),

-- Lalibela reservations
('ethiopian-heritage', 
 (SELECT id FROM rooms WHERE hotel_id = @lalibela_hotel_id AND room_number = '15'), 
 (SELECT id FROM users WHERE email = 'እንግዳ3@ኢሜል.ኢት'),
 '2025-08-27', '2025-08-30', 10800.00, 'CONFIRMED', 
 'የቤተክርስቲያን ጎብኝነት እና መንፈሳዊ ጉዞ (Church pilgrimage and spiritual journey)', 
 'ETH-LAL-2025-001', 'ሳሙኤል ኪዳነ (Samuel Kidane)', 'እንግዳ3@ኢሜል.ኢት', '+251-33-123-4567', 4, 
 '2025-08-24 16:20:00', '2025-08-24 16:20:00');

-- =============================================
-- ETHIOPIAN HOUSEKEEPING TASKS
-- =============================================

INSERT INTO housekeeping_tasks (room_id, assigned_staff_id, task_type, status, priority, description, special_instructions, created_at, assigned_at, started_at, completed_at, estimated_duration_minutes, actual_duration_minutes, quality_score, inspector_notes, tenant_id) VALUES

-- Sheraton Addis tasks
((SELECT id FROM rooms WHERE hotel_id = @addis_hotel_id AND room_number = '105'), 
 (SELECT id FROM housekeeping_staff WHERE staff_name = 'ወርቅነህ ሀብተ (Workneah Habte)'), 
 'CHECKOUT_CLEANING', 'COMPLETED', 'HIGH', 
 'የንጉሣዊ ሱት ዝግጅት (Royal suite preparation)', 
 'ባህላዊ የኢትዮጵያ ጌጣጌጥ ንጽህና እና የቡና ክፍል ዝግጅት (Traditional Ethiopian decor cleaning and coffee setup)', 
 '2025-08-26 06:00:00', '2025-08-26 06:15:00', '2025-08-26 06:30:00', '2025-08-26 08:00:00', 
 75, 90, 5, 'እጅግ በጣም ጥሩ አገልግሎት - ባህላዊ ዝግጅት ፍጹም (Exceptional service - traditional setup perfect)', 
 'ethiopian-heritage'),

-- Lalibela tasks
((SELECT id FROM rooms WHERE hotel_id = @lalibela_hotel_id AND room_number = '15'), 
 (SELECT id FROM housekeeping_staff WHERE staff_name = 'ቤዛዊት ታደሰ (Bezawit Tadese)'), 
 'CHECKOUT_CLEANING', 'IN_PROGRESS', 'HIGH', 
 'የንጉሥ ላሊበላ ሱት ዝግጅት (King Lalibela suite preparation)', 
 'መንፈሳዊ ክፍል ንጽህና እና የጸሎት ቦታ ዝግጅት (Spiritual room cleaning and prayer area setup)', 
 '2025-08-26 07:00:00', '2025-08-26 08:00:00', '2025-08-26 08:30:00', NULL, 
 60, NULL, NULL, NULL, 
 'ethiopian-heritage');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

SELECT 'የኢትዮጵያ ሆቴሎች በተሳካ ሁኔታ ታክለዋል! (Ethiopian hotels added successfully!)' as status;

SELECT 
  'ተናንት:' as label,
  t.name as 'ተናንት_ስም (Tenant Name)',
  COUNT(DISTINCT h.id) as 'ሆቴሎች_ቁጥር (Number of Hotels)',
  COUNT(DISTINCT r.id) as 'ክፍሎች_ቁጥር (Number of Rooms)',
  COUNT(DISTINCT u.id) as 'ሰራተኞች_ቁጥር (Number of Staff)'
FROM tenants t
LEFT JOIN hotels h ON t.id = h.tenant_id  
LEFT JOIN rooms r ON h.id = r.hotel_id
LEFT JOIN users u ON t.id = u.tenant_id
WHERE t.id = 'ethiopian-heritage'
GROUP BY t.id, t.name;

SELECT 
  'ሆቴሎች:' as label,
  h.name as 'ሆቴል_ስም (Hotel Name)',
  h.city as 'ከተማ (City)',
  COUNT(r.id) as 'ክፍሎች_ቁጥር (Number of Rooms)'
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
WHERE h.tenant_id = 'ethiopian-heritage'
GROUP BY h.id, h.name, h.city;

-- Update Ethiopian Hotels to use English names and descriptions
-- Converting from Amharic to English for international accessibility

-- Update tenant name to English
UPDATE tenants 
SET name = 'Ethiopian Heritage Hotels',
    description = 'Premium hotels showcasing Ethiopian culture and hospitality in English'
WHERE id = 'ethiopian-heritage';

-- Update hotel names and descriptions to English
UPDATE hotels 
SET name = 'Sheraton Addis Ababa',
    description = 'Premium luxury hotel in the heart of Addis Ababa featuring Ethiopian cultural heritage and modern amenities',
    address = 'Taitu Street, Piazza District',
    city = 'Addis Ababa',
    country = 'Ethiopia',
    email = 'reservations@sheraton-addis.et'
WHERE name = 'ሸራተን አዲስ አበባ (Sheraton Addis)';

UPDATE hotels 
SET name = 'Lalibela Cultural Lodge',
    description = 'Traditional lodge near the famous rock-hewn churches of Lalibela, offering authentic Ethiopian hospitality',
    address = 'Roha Street, Near St. George Church',
    city = 'Lalibela',
    country = 'Ethiopia',
    email = 'welcome@lalibela-lodge.et'
WHERE name = 'ላሊበላ ባህል ቤት (Lalibela Cultural Inn)';

-- Update room descriptions for Sheraton Addis Ababa (hotel_id = 14)
UPDATE rooms SET 
    description = 'Standard room with city view and complimentary Ethiopian coffee service'
WHERE hotel_id = 14 AND room_number = '101';

UPDATE rooms SET 
    description = 'Gold-accented room with traditional Ethiopian decor and modern amenities'
WHERE hotel_id = 14 AND room_number = '102';

UPDATE rooms SET 
    description = 'Deluxe room with private balcony featuring contemporary Ethiopian art'
WHERE hotel_id = 14 AND room_number = '103';

UPDATE rooms SET 
    description = 'Coffee ceremony suite with traditional Ethiopian coffee setup and seating area'
WHERE hotel_id = 14 AND room_number = '104';

UPDATE rooms SET 
    description = 'Queen Shewa Suite with royal Ethiopian furnishings and palace-inspired decor'
WHERE hotel_id = 14 AND room_number = '105';

UPDATE rooms SET 
    description = 'Ethiopian Heritage room featuring traditional musical instruments and cultural artifacts'
WHERE hotel_id = 14 AND room_number = '201';

UPDATE rooms SET 
    description = 'Golden Waters room with luxury marble bathroom and premium amenities'
WHERE hotel_id = 14 AND room_number = '202';

UPDATE rooms SET 
    description = 'Emperor Menelik Suite with historical artifacts and panoramic city views'
WHERE hotel_id = 14 AND room_number = '203';

UPDATE rooms SET 
    description = 'Land of Ethiopia Suite with panoramic mountain and city views'
WHERE hotel_id = 14 AND room_number = '204';

UPDATE rooms SET 
    description = 'Empress Zauditu Royal Suite with private dining room and dedicated butler service'
WHERE hotel_id = 14 AND room_number = '301';

-- Update room descriptions for Lalibela Cultural Lodge (hotel_id = 15)
UPDATE rooms SET 
    description = 'Saint Gabriel room with spectacular views of the rock-hewn churches'
WHERE hotel_id = 15 AND room_number = '11';

UPDATE rooms SET 
    description = 'Saint Mary room with traditional Ethiopian furnishings and spiritual ambiance'
WHERE hotel_id = 15 AND room_number = '12';

UPDATE rooms SET 
    description = 'Saint George room overlooking the world-famous Church of St. George'
WHERE hotel_id = 15 AND room_number = '13';

UPDATE rooms SET 
    description = 'Jesus room with peaceful spiritual atmosphere and meditation area'
WHERE hotel_id = 15 AND room_number = '14';

UPDATE rooms SET 
    description = 'King Lalibela Suite with historical significance and premium amenities'
WHERE hotel_id = 15 AND room_number = '15';

UPDATE rooms SET 
    description = 'Family room designed for pilgrimage visitors with connecting spaces'
WHERE hotel_id = 15 AND room_number = '21';

UPDATE rooms SET 
    description = 'Spiritual suite for religious travelers with prayer area and library'
WHERE hotel_id = 15 AND room_number = '22';

UPDATE rooms SET 
    description = 'Ethiopian Orthodox suite with private prayer area and religious artifacts'
WHERE hotel_id = 15 AND room_number = '23';

UPDATE rooms SET 
    description = 'Royal Zagwe Dynasty suite with private chapel view and historical furnishings'
WHERE hotel_id = 15 AND room_number = '31';

-- Update user names and emails to English
UPDATE users SET 
    first_name = 'Abebe',
    last_name = 'Tesfaye',
    email = 'admin@ethiopian-heritage.et'
WHERE email = 'ሥራ.አስተዳዳሪ@ኢትዮጵያ-ቅርስ.ኢት';

UPDATE users SET 
    first_name = 'Hawaryat',
    last_name = 'Bekele',
    email = 'hotel.admin@sheraton-addis.et'
WHERE email = 'ሆቴል.አስተዳዳሪ@ሸራተን-አዲስ.ኢት';

UPDATE users SET 
    first_name = 'Zera',
    last_name = 'Yacob',
    email = 'hotel.admin@lalibela-lodge.et'
WHERE email = 'ሆቴል.አስተዳዳሪ@ላሊበላ-ቤት.ኢት';

UPDATE users SET 
    first_name = 'Sara',
    last_name = 'Mengistu',
    email = 'frontdesk@sheraton-addis.et'
WHERE email = 'መቀበያ@ሸራተን-አዲስ.ኢት';

UPDATE users SET 
    first_name = 'Birhane',
    last_name = 'Getahun',
    email = 'frontdesk@lalibela-lodge.et'
WHERE email = 'መቀበያ@ላሊበላ-ቤት.ኢት';

UPDATE users SET 
    first_name = 'Tamrat',
    last_name = 'Alemu',
    email = 'operations@sheraton-addis.et'
WHERE email = 'ክወናዎች@ሸራተን-አዲስ.ኢት';

UPDATE users SET 
    first_name = 'Mihret',
    last_name = 'Kedada',
    email = 'operations@lalibela-lodge.et'
WHERE email = 'ክወናዎች@ላሊበላ-ቤት.ኢት';

UPDATE users SET 
    first_name = 'Solomon',
    last_name = 'Daniel',
    email = 'maintenance@sheraton-addis.et'
WHERE email = 'ጥገና@ሸራተን-አዲስ.ኢት';

UPDATE users SET 
    first_name = 'Yohannes',
    last_name = 'Haylu',
    email = 'maintenance@lalibela-lodge.et'
WHERE email = 'ጥገና@ላሊበላ-ቤት.ኢት';

UPDATE users SET 
    first_name = 'Workneah',
    last_name = 'Habte',
    email = 'housekeeping@sheraton-addis.et'
WHERE email = 'ንጽህና@ሸራተን-አዲስ.ኢት';

UPDATE users SET 
    first_name = 'Bezawit',
    last_name = 'Tadese',
    email = 'housekeeping@lalibela-lodge.et'
WHERE email = 'ንጽህና@ላሊበላ-ቤት.ኢት';

UPDATE users SET 
    first_name = 'Negash',
    last_name = 'Fekadu',
    email = 'concierge@sheraton-addis.et'
WHERE email = 'መደላደያ@ሸራተን-አዲስ.ኢት';

UPDATE users SET 
    first_name = 'Muluhalem',
    last_name = 'Woldawi',
    email = 'concierge@lalibela-lodge.et'
WHERE email = 'መደላደያ@ላሊበላ-ቤት.ኢት';

UPDATE users SET 
    first_name = 'Tewodros',
    last_name = 'Mekonnen',
    email = 'guest1@email.et'
WHERE email = 'እንግዳ1@ኢሜል.ኢት';

UPDATE users SET 
    first_name = 'Yodit',
    last_name = 'Girma',
    email = 'guest2@email.et'
WHERE email = 'እንግዳ2@ኢሜል.ኢት';

UPDATE users SET 
    first_name = 'Samuel',
    last_name = 'Kidane',
    email = 'guest3@email.et'
WHERE email = 'እንግዳ3@ኢሜል.ኢት';

-- Display updated results
SELECT 'Ethiopian Hotels Updated to English Successfully!' as status;

SELECT 
  'Updated Hotels:' as section,
  h.name as 'Hotel Name',
  h.city as 'City',
  h.email as 'Email',
  COUNT(r.id) as 'Total Rooms'
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
WHERE h.tenant_id = 'ethiopian-heritage'
GROUP BY h.id, h.name, h.city, h.email;

SELECT 
  'Updated Staff:' as section,
  u.first_name as 'First Name',
  u.last_name as 'Last Name',
  ur.role as 'Role',
  u.email as 'Email'
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE u.tenant_id = 'ethiopian-heritage' AND ur.role != 'GUEST'
ORDER BY ur.role, u.first_name 
LIMIT 12;

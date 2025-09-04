-- Add new fields to hotel_registrations table for complete 15-field support
ALTER TABLE hotel_registrations
ADD COLUMN website_url VARCHAR(200) NULL,
ADD COLUMN facility_amenities VARCHAR(500) NULL,
ADD COLUMN number_of_rooms INTEGER NULL,
ADD COLUMN check_in_time VARCHAR(10) NULL,
ADD COLUMN check_out_time VARCHAR(10) NULL;

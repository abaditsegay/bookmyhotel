-- Migration to update reservations table for room type booking instead of specific room booking
-- V20241227001__Update_Reservations_For_Room_Type_Booking.sql

-- Add new columns for room type booking
ALTER TABLE reservations 
ADD COLUMN room_type VARCHAR(20),
ADD COLUMN hotel_id BIGINT,
ADD COLUMN price_per_night DECIMAL(10,2),
ADD COLUMN assigned_room_id BIGINT,
ADD COLUMN room_assigned_at TIMESTAMP;

-- Populate new columns with data from existing reservations
UPDATE reservations r
SET 
    room_type = (SELECT rt.room_type FROM rooms rt WHERE rt.id = r.room_id),
    hotel_id = (SELECT rt.hotel_id FROM rooms rt WHERE rt.id = r.room_id),
    price_per_night = (SELECT rt.price_per_night FROM rooms rt WHERE rt.id = r.room_id),
    assigned_room_id = r.room_id,
    room_assigned_at = r.created_at
WHERE r.room_id IS NOT NULL;

-- Make the new columns NOT NULL (except assigned_room_id which represents future room assignments)
ALTER TABLE reservations 
MODIFY COLUMN room_type VARCHAR(20) NOT NULL,
MODIFY COLUMN hotel_id BIGINT NOT NULL,
MODIFY COLUMN price_per_night DECIMAL(10,2) NOT NULL;

-- Add foreign key constraints
ALTER TABLE reservations 
ADD CONSTRAINT fk_reservations_hotel 
    FOREIGN KEY (hotel_id) REFERENCES hotels(id),
ADD CONSTRAINT fk_reservations_assigned_room 
    FOREIGN KEY (assigned_room_id) REFERENCES rooms(id);

-- Add indexes for the new columns
CREATE INDEX idx_reservation_hotel ON reservations(hotel_id);
CREATE INDEX idx_reservation_room_type ON reservations(room_type);
CREATE INDEX idx_reservation_assigned_room ON reservations(assigned_room_id);

-- Drop the old room_id constraint and column (after data migration)
ALTER TABLE reservations DROP FOREIGN KEY fk_reservations_room;
DROP INDEX idx_reservation_room ON reservations;
ALTER TABLE reservations DROP COLUMN room_id;

-- Note: We keep assigned_room_id for backward compatibility and future room assignment at check-in

-- Add is_publicly_listed column to hotels table.
-- This flag controls whether a hotel appears in public guest search results.
-- It is separate from is_active (which gates hotel admin management access after approval).
-- Default false: approved hotels do NOT appear publicly until an admin explicitly publishes them.
ALTER TABLE hotels
    ADD COLUMN is_publicly_listed BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing active hotels (already live) should be considered publicly listed.
-- Any hotel with is_active = true was already serving guests prior to this migration.
UPDATE hotels SET is_publicly_listed = TRUE WHERE is_active = TRUE;
